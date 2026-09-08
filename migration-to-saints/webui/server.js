#!/usr/bin/env node
// Local dashboard for running the cpl-app -> saints-app/litcal Catalan migration
// pipeline by hand and seeing structured results (counts, omitted saints, sample
// extracted content) instead of reading raw console output / JSON files.
//
// No new dependencies: plain Node `http` + `child_process`. Runs entirely on
// localhost, only meant to be used by the developer running this repo locally.
//
// Usage: node migration-to-saints/webui/server.js [port]

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const reviewQueue = require('../review-queue');
const dayCheck = require('../day-check');
const dayCompare = require('../day-compare');
const litcalDay = require('../lib/litcal-day');

const PORT = parseInt(process.argv[2], 10) || 4848;
const CPL_APP_ROOT = path.resolve(__dirname, '..', '..');
const LITCAL_ROOT = '/Users/pau/projects/saints/litcal';
const SAINTS_APP_ROOT = '/Users/pau/projects/saints/saints-app';
const DAY_TEXTS_DIR = path.join(SAINTS_APP_ROOT, 'src/store/db/day_specific_texts');
const SAINTS_APP_COMMONS_CA = path.join(DAY_TEXTS_DIR, 'commons/ca');
const SAINTS_APP_COMMONS_ES = path.join(DAY_TEXTS_DIR, 'commons/es');
const STATIC_TRANSLATIONS_DIR = path.join(CPL_APP_ROOT, 'migration-to-saints/static-translations');
const RUN_DIR = path.join(__dirname, 'run');
const CANDIDATES_DIR = path.join(RUN_DIR, 'candidates');
const STAGE1_JSON = path.join(RUN_DIR, 'stage1-summary.json');
const STAGE2_JSON = path.join(RUN_DIR, 'stage2-summary.json');
const LINK_STATE_JSON = path.join(RUN_DIR, 'link-state.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const SAINTS_APP_PKG = path.join(SAINTS_APP_ROOT, 'package.json');
const LITCAL_DEP = '@saints-app/litcal';
const LITCAL_LOCAL_SPEC = 'file:../litcal';
const INSTALLED_LITCAL_DIR = path.join(SAINTS_APP_ROOT, 'node_modules', LITCAL_DEP);

fs.mkdirSync(RUN_DIR, { recursive: true });

function runCommand(cmd, args, cwd, extraEnv) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, env: extraEnv ? { ...process.env, ...extraEnv } : process.env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
    child.on('error', (err) => resolve({ code: -1, stdout, stderr: stderr + '\n' + String(err) }));
  });
}

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function serveStatic(req, res) {
  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0];
  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const ext = path.extname(filePath);
    const type =
      { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' }[ext] ||
      'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' });
    res.end(data);
  });
}

async function handleStage1(req, res) {
  const result = await runCommand(
    'node',
    [
      'migration-to-saints/generate-catalan-calendars.js',
      '--out', CANDIDATES_DIR,
      '--json', STAGE1_JSON,
    ],
    CPL_APP_ROOT
  );
  const summary = readJsonSafe(STAGE1_JSON);
  sendJson(res, result.code === 0 ? 200 : 500, { ok: result.code === 0, log: result.stdout + result.stderr, summary });
}

async function handleStage2(req, res, body) {
  const write = !!(body && body.write);
  const args = ['tsx', 'scripts/build-catalan-calendars.ts', CANDIDATES_DIR, '--json', STAGE2_JSON];
  if (write) args.push('--write');
  const result = await runCommand('npx', args, LITCAL_ROOT);
  const summary = readJsonSafe(STAGE2_JSON);
  sendJson(res, result.code === 0 ? 200 : 500, { ok: result.code === 0, wrote: write, log: result.stdout + result.stderr, summary });
}

async function handleGenerateLoaders(req, res) {
  const result = await runCommand('npx', ['tsx', 'scripts/generate-calendar-loader.ts'], LITCAL_ROOT);
  sendJson(res, result.code === 0 ? 200 : 500, { ok: result.code === 0, log: result.stdout + result.stderr });
}

async function handleLaudes(req, res) {
  const result = await runCommand(
    'npx',
    ['jest', 'migration-to-saints/laudes.extract.test.js', '--silent'],
    CPL_APP_ROOT
  );
  const sample = readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/output/raw/laudes-sample.json'));
  sendJson(res, result.code === 0 ? 200 : 500, { ok: result.code === 0, log: result.stdout + result.stderr, sample });
}

// Maps cpl-app's own DioceseName values (as used in join-content.test.js's
// SettingsService mock and in cpl-app.db) to the matching litcal calendar id, so the
// manifest is resolved with the SAME diocese cpl-app is impersonating. Without this,
// litcal was being asked "what day is this?" using the plain 'spain' chain — which
// doesn't know about Eulàlia, Montserrat, etc. — while cpl-app answered as a specific
// diocese, so diocese-only content was getting silently filed under the wrong (generic
// ferial/universal) shared slot instead of being recognized as its own thing.
const DIOCESE_TO_CALENDAR_ID = {
  Barcelona: 'diocese-barcelona',
  Girona: 'diocese-girona',
  Lleida: 'diocese-lleida',
  Mallorca: 'diocese-mallorca',
  Menorca: 'diocese-menorca',
  'Sant Feliu de Llobregat': 'diocese-sant-feliu-de-llobregat',
  Solsona: 'diocese-solsona',
  Tarragona: 'diocese-tarragona',
  Terrassa: 'diocese-terrassa',
  Tortosa: 'diocese-tortosa',
  Urgell: 'diocese-urgell',
  Vic: 'diocese-vic',
  Andorra: 'diocese-andorra',
};

async function runContentJoinPipeline({ start, end, hours, diocese }) {
  const manifestPath = path.join(RUN_DIR, 'date-to-key-manifest.json');
  const allLaudesPath = path.join(DAY_TEXTS_DIR, 'all_laudes.json');
  const calendarId = DIOCESE_TO_CALENDAR_ID[diocese] || 'spain';

  const manifestResult = await runCommand(
    'npx',
    ['tsx', 'scripts/build-date-to-key-manifest.ts', allLaudesPath, start, end, manifestPath, calendarId],
    LITCAL_ROOT
  );
  if (manifestResult.code !== 0) {
    return { ok: false, log: manifestResult.stdout + manifestResult.stderr };
  }

  const joinResult = await runCommand(
    'npx',
    ['jest', 'migration-to-saints/join-content.test.js', '--silent'],
    CPL_APP_ROOT,
    { HOURS: hours.join(','), DIOCESE: diocese }
  );
  // Record what this run covered, so the day inspector can say which window/diocese
  // its answer is based on instead of silently reporting against a stale manifest.
  fs.writeFileSync(
    path.join(RUN_DIR, 'last-run.json'),
    JSON.stringify({ start, end, diocese, hours, calendarId, at: new Date().toISOString() }, null, 2),
    'utf8'
  );
  const commonsDir = path.join(CPL_APP_ROOT, 'migration-to-saints/output/commons-ca');
  const coverage = {};
  if (fs.existsSync(commonsDir)) {
    for (const f of fs.readdirSync(commonsDir)) {
      coverage[f.replace(/\.json$/, '')] = Object.keys(readJsonSafe(path.join(commonsDir, f)) || {}).length;
    }
  }
  const pending =
    readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/output/join-pending-review.json')) || {};
  const pendingByTable = Object.fromEntries(
    Object.entries(pending).map(([table, items]) => [table, items.length])
  );
  const pendingSample = Object.entries(pending)
    .flatMap(([table, items]) => items.map((item) => ({ table, ...item })))
    .sort((a, b) => b.affectedCount - a.affectedCount)
    .slice(0, 40);
  const pendingCount = Object.values(pendingByTable).reduce((a, b) => a + b, 0);
  return {
    ok: joinResult.code === 0,
    log: manifestResult.stdout + manifestResult.stderr + '\n' + joinResult.stdout + joinResult.stderr,
    coverage,
    pendingCount,
    pendingByTable,
    pendingSample,
  };
}

// Copies migration-to-saints/output/commons-ca/*.json (the RESOLVED, non-pending
// content) + the hand-translated static tables + es's language-invariant Latin hymns
// into saints-app's real commons/ca/. Merges into whatever is already there rather than
// overwriting the whole file, so re-running after a manual fix in saints-app doesn't
// clobber it (our own keys always win, since they're the ones that passed the
// agree-across-every-date check).
// The export lives in `export-to-saints-app.js`, and this file only calls it. It used to
// carry its own copy — extracted in September 2026 so a person could publish without making
// the panel redo the whole pipeline — but the copy was left behind here and kept being the
// one the panel ran. It had drifted: no protection for the cells the Common supplied (the CLI
// one holds them and reports them in `export-common-held.json`) and no Compline. See
// MIGRA-008: it silently overwrote four published petitions.
const { exportResolvedContentToSaintsApp } = require('../export-to-saints-app');


async function handleMigratorRun(req, res, body, { exportToSaintsApp }) {
  const start = (body && body.start) || '2017-01-01';
  const end = (body && body.end) || '2026-12-30';
  // The Invitatory and the celebration's name have no checkbox in the panel — they are not
  // Hours you would choose to skip — so they are added to whatever was ticked. Left out, the
  // join writes `invitatorios.json` and `celebration_names.json` EMPTY, and a run from the
  // panel then looks like it lost 188 cells. (It does not: the export never blanks a
  // destination from an empty file. But the output on disk is wrong and the next person to
  // read it is misled.)
  const asked = (body && body.hours && body.hours.length) ? body.hours : dayCheck.ALL_HOURS;
  const hours = [...new Set([...asked, 'Invitation', 'Celebration'])];
  const diocese = (body && body.diocese) || 'Barcelona';

  const result = await runContentJoinPipeline({ start, end, hours, diocese });
  let exportReport = null;
  if (result.ok && exportToSaintsApp) {
    exportReport = exportResolvedContentToSaintsApp();
  }
  sendJson(res, result.ok ? 200 : 500, { ...result, start, end, hours, diocese, exported: exportToSaintsApp, exportReport });
}

function handlePendingReport(req, res) {
  const pending =
    readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/output/join-pending-review.json')) || {};
  const items = Object.entries(pending).flatMap(([table, list]) => list.map((item) => ({ table, ...item })));
  sendJson(res, 200, { items });
}

// The review backlog: the same conflicts as /api/pending-report, but grouped by cause
// and carrying the decision the user has recorded for each group.
function handleReviewQueue(req, res) {
  try {
    const q = reviewQueue.buildQueue();
    // The per-bundle `items` payload is heavy (every variant of every contested id);
    // send it only when a single bundle is requested.
    sendJson(res, 200, { ...q, bundles: q.bundles.map(({ items, ...rest }) => rest) });
  } catch (e) {
    sendJson(res, 500, { ok: false, error: String(e) });
  }
}

function handleReviewBundle(req, res, url) {
  const id = url.searchParams.get('id');
  const q = reviewQueue.buildQueue();
  const bundle = q.bundles.find((b) => b.id === id);
  if (!bundle) return sendJson(res, 404, { ok: false, error: 'paquet no trobat' });
  sendJson(res, 200, bundle);
}

function handleReviewDecision(req, res, body) {
  try {
    const { bundleId, choice, note, fingerprint } = body || {};
    if (!bundleId) return sendJson(res, 400, { ok: false, error: 'falta bundleId' });
    const saved = reviewQueue.saveDecision(bundleId, choice, note, fingerprint);
    const q = reviewQueue.buildQueue();
    sendJson(res, 200, { ok: true, saved, totals: q.totals, byDecision: q.byDecision });
  } catch (e) {
    sendJson(res, 400, { ok: false, error: String(e) });
  }
}

function handleDayCheck(req, res, url) {
  const date = url.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return sendJson(res, 400, { ok: false, error: 'Cal una data en format YYYY-MM-DD' });
  }
  const hoursParam = url.searchParams.get('hours');
  const hours = hoursParam ? hoursParam.split(',').filter(Boolean) : dayCheck.ALL_HOURS;
  try {
    sendJson(res, 200, dayCheck.checkDay(date, { hours, impact: true }));
  } catch (e) {
    sendJson(res, 500, { ok: false, error: String(e) });
  }
}

// --- Day comparator: cpl-app's text next to saints-app's, for one date -----------------
//
// The saints-app side is the inspector's own answer (no second opinion about which cell a
// field resolves to). The cpl-app side has to be resolved by running cpl-app's Services
// over cpl-app.db, which needs Jest for its RN/expo mocks — a few seconds per day. Since
// cpl-app.db is a fixed asset, the resolved day is cached on disk and only recomputed when
// the DB is newer than the cache (or when asked to refresh).

const CPL_DAY_CACHE_DIR = path.join(CPL_APP_ROOT, 'migration-to-saints/output/raw/cpl-days');
const CPL_DB_PATH = path.join(CPL_APP_ROOT, 'src/Assets/db/cpl-app.db');

function cplDayCachePath(diocese, prayingPlace, date) {
  const who = `${diocese}-${prayingPlace}`.replace(/[^\w-]/g, '_');
  return path.join(CPL_DAY_CACHE_DIR, who, `${date}.json`);
}

async function resolveCplDay(date, diocese, prayingPlace, { fresh = false } = {}) {
  const cachePath = cplDayCachePath(diocese, prayingPlace, date);
  if (!fresh) {
    try {
      if (fs.statSync(cachePath).mtimeMs >= fs.statSync(CPL_DB_PATH).mtimeMs) {
        const cached = readJsonSafe(cachePath);
        // The staleness test is "is cpl-app.db newer", which no code change can trip — so
        // every time the resolver learns a new Hour, the shape it produces has to be checked
        // here too, or the panel keeps serving days resolved by the old one. A day cached
        // before `ferialFields` existed compared against the wrong tab on memorials; a day
        // cached before the Office and the Mass existed came back with NO cpl-app side for
        // them at all, and the comparator dutifully labelled all 33 of their fields "només a
        // saints-app". Both are re-resolved rather than trusted.
        const day = cached && cached.days[date];
        if (day && day.ferialFields && day.hours && day.hours.Office && day.hours.Mass) {
          return { day, cached: true, log: '' };
        }
      }
    } catch {}
  }
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  // `review/resolve-cpl-days.test.js`, NOT `cpl-day.test.js`: the second one's ferial control
  // for Vespers is the rendered Vespers object itself (MIGRA-001), so it invents divergences
  // on every memorial, and the CLAUDE.md of the repo says not to use it. It also never learned
  // the Office of Readings or the Mass — which is how the panel came to show a complete
  // Catalan Office as if cpl-app had nothing there.
  const result = await runCommand(
    'npx',
    ['jest', 'migration-to-saints/review/resolve-cpl-days.test.js', '--silent'],
    CPL_APP_ROOT,
    { DATES: date, DIOCESE: diocese, PRAYING_PLACE: prayingPlace, OUT: cachePath }
  );
  const dump = readJsonSafe(cachePath);
  if (!dump || !dump.days || !dump.days[date]) {
    return { day: null, cached: false, log: result.stdout + result.stderr };
  }
  return { day: dump.days[date], cached: false, log: '' };
}

// The two sides are chosen independently: `diocese` (+ prayingPlace) is what cpl-app is
// asked to be, `calendar` + `lang` is what saints-app is asked to be. Pointing them at the
// same place answers "will this day come out right in Catalan?"; pointing them elsewhere
// answers the other questions the panel is used for (how it reads in Spanish, what one
// diocese celebrates that another doesn't).
const LANGUAGES = ['ca', 'es', 'it'];

async function handleDayCompare(req, res, url) {
  const date = url.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return sendJson(res, 400, { ok: false, error: 'Cal una data en format YYYY-MM-DD' });
  }
  const lastRun = readJsonSafe(path.join(RUN_DIR, 'last-run.json')) || {};
  const diocese = url.searchParams.get('diocese') || lastRun.diocese || 'Barcelona';
  const prayingPlace = url.searchParams.get('prayingPlace') || 'Diòcesi';
  const language = LANGUAGES.includes(url.searchParams.get('lang')) ? url.searchParams.get('lang') : 'ca';
  // Default the saints-app side to the calendar of the same diocese cpl-app is being asked
  // about — the comparison people want most of the time — not to whatever ran last.
  const calendar = url.searchParams.get('calendar') || DIOCESE_TO_CALENDAR_ID[diocese] || 'spain';

  try {
    const { litcalId, source, error, log: litcalLog } = await litcalDay.resolveLitcalId(date, calendar);
    if (!litcalId) return sendJson(res, 200, { date, error: error || 'litcal no ha resolt el dia', log: litcalLog });

    // cpl-app first: which of saints-app's two offices each field is read against depends
    // on what cpl-app took from the weekday that day (lib/memorial-ferial.js).
    const { day, cached, log } = await resolveCplDay(date, diocese, prayingPlace, {
      fresh: url.searchParams.get('fresh') === '1',
    });
    const check = dayCheck.checkDay(date, {
      impact: language === 'ca',
      language,
      litcalId,
      fromFerial: day && day.ferialFields,
    });
    const comparison = dayCompare.compareDay(
      date,
      day || { error: `No s'ha pogut resoldre cpl-app per a ${date}.` },
      check,
      { language }
    );
    comparison.diocese = diocese;
    comparison.prayingPlace = prayingPlace;
    comparison.calendar = calendar;
    comparison.litcalSource = source;
    comparison.cached = cached;
    // Only `ca` is being migrated, so only there does an empty cell mean "still to do".
    // In es/it an empty cell would be a hole in the shipped app, which is worth knowing.
    comparison.isMigrationTarget = language === 'ca';
    if (log) comparison.log = log;
    sendJson(res, 200, comparison);
  } catch (e) {
    sendJson(res, 500, { ok: false, error: String(e && e.stack ? e.stack : e) });
  }
}

// What the two selectors can be set to, read from the trees themselves so a newly
// generated Catalan calendar shows up without touching the panel.
function handleCompareOptions(req, res) {
  const lastRun = readJsonSafe(path.join(RUN_DIR, 'last-run.json')) || {};
  sendJson(res, 200, {
    dioceses: Object.keys(DIOCESE_TO_CALENDAR_ID),
    dioceseCalendar: DIOCESE_TO_CALENDAR_ID,
    calendars: litcalDay.availableCalendars(),
    languages: LANGUAGES.filter((l) => fs.existsSync(path.join(DAY_TEXTS_DIR, 'commons', l))),
    lastRun: lastRun.diocese ? lastRun : null,
  });
}

// Drill-down for one contested cell of one day: who else shares it and who would end up
// with the wrong text if we filled it with what this day wants.
function handleConflictDetail(req, res, url) {
  const table = url.searchParams.get('table');
  const id = url.searchParams.get('id');
  const date = url.searchParams.get('date') || null;
  if (!table || !id) return sendJson(res, 400, { ok: false, error: 'Calen table i id' });
  try {
    sendJson(res, 200, dayCheck.conflictDetail({ table, id, date }));
  } catch (e) {
    sendJson(res, 500, { ok: false, error: String(e) });
  }
}

function handleMonthCheck(req, res, url) {
  const year = parseInt(url.searchParams.get('year'), 10);
  const month = parseInt(url.searchParams.get('month'), 10);
  if (!year || !month || month < 1 || month > 12) {
    return sendJson(res, 400, { ok: false, error: 'Calen year i month vàlids' });
  }
  try {
    sendJson(res, 200, dayCheck.checkMonth(year, month));
  } catch (e) {
    sendJson(res, 500, { ok: false, error: String(e) });
  }
}

function handleDroppedReport(req, res) {
  const report = readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/dropped-needs-content-reconciliation.json'));
  sendJson(res, 200, { report });
}

// --- Local litcal link -------------------------------------------------------------
//
// saints-app normally consumes litcal as a published npm package. While the Catalan
// calendars are unpublished, the only way to see them in a local saints-app run is to
// point the dependency at the working copy. That is a real edit to saints-app's
// package.json + lockfile, so it is opt-in (a checkbox), remembers the version it
// replaced, and can be undone from the same control.

function readLitcalSpec() {
  const raw = fs.readFileSync(SAINTS_APP_PKG, 'utf8');
  const m = raw.match(new RegExp(`"${LITCAL_DEP}"\\s*:\\s*"([^"]*)"`));
  return m ? m[1] : null;
}

function writeLitcalSpec(spec) {
  const raw = fs.readFileSync(SAINTS_APP_PKG, 'utf8');
  // Line-level replace rather than JSON.parse/stringify: this is a file the user's own
  // repo owns, and reserializing it would reformat every unrelated line.
  const next = raw.replace(
    new RegExp(`("${LITCAL_DEP}"\\s*:\\s*)"[^"]*"`),
    `$1"${spec}"`
  );
  if (next === raw) throw new Error(`No he pogut trobar la dependencia ${LITCAL_DEP} a ${SAINTS_APP_PKG}`);
  fs.writeFileSync(SAINTS_APP_PKG, next, 'utf8');
}

function installedLitcalKind() {
  try {
    const st = fs.lstatSync(INSTALLED_LITCAL_DIR);
    if (st.isSymbolicLink()) return { kind: 'symlink', target: fs.realpathSync(INSTALLED_LITCAL_DIR) };
    return { kind: 'copy', target: INSTALLED_LITCAL_DIR };
  } catch {
    return { kind: 'missing', target: null };
  }
}

function linkStatus() {
  const spec = readLitcalSpec();
  const state = readJsonSafe(LINK_STATE_JSON) || {};
  const installed = installedLitcalKind();
  const distIndex = path.join(LITCAL_ROOT, 'dist/index.js');
  const caCalendar = path.join(LITCAL_ROOT, 'dist/data/calendars/catalonia.json');
  return {
    spec,
    linked: spec === LITCAL_LOCAL_SPEC,
    previousSpec: state.previousSpec || null,
    installedKind: installed.kind,
    installedTarget: installed.target,
    litcalBuilt: fs.existsSync(distIndex),
    litcalBuiltAt: fs.existsSync(distIndex) ? fs.statSync(distIndex).mtime.toISOString() : null,
    catalanCalendarsInDist: fs.existsSync(caCalendar),
    saintsAppPkg: SAINTS_APP_PKG,
    litcalRoot: LITCAL_ROOT,
  };
}

// After `litcal` is rebuilt, a symlinked install already sees the new dist. A copied
// install (bun sometimes materializes file: deps as a copy) does not, so refresh it by
// hand — otherwise "regenerar" would silently leave saints-app on the old build.
function syncBuiltLitcalIntoSaintsApp() {
  // Only ever touch node_modules when the user has explicitly opted into the local
  // link. Copying a local build over a published package that package.json still
  // pins would leave saints-app running code its manifest does not describe.
  if (!linkStatus().linked) return { action: 'not-linked', detail: 'casella desactivada, no toco node_modules' };
  const installed = installedLitcalKind();
  if (installed.kind === 'symlink') return { action: 'symlink', detail: installed.target };
  if (installed.kind === 'missing') return { action: 'missing', detail: 'no instal·lat a node_modules' };
  const from = path.join(LITCAL_ROOT, 'dist');
  const to = path.join(INSTALLED_LITCAL_DIR, 'dist');
  if (!fs.existsSync(from)) return { action: 'skipped', detail: 'litcal/dist no existeix' };
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
  return { action: 'copied', detail: `${from} -> ${to}` };
}

async function handleLinkStatus(req, res) {
  sendJson(res, 200, linkStatus());
}

async function handleLinkLitcal(req, res, body) {
  const enable = !!(body && body.enable);
  const before = linkStatus();
  try {
    if (enable) {
      if (!before.linked) {
        fs.writeFileSync(LINK_STATE_JSON, JSON.stringify({ previousSpec: before.spec }, null, 2), 'utf8');
        writeLitcalSpec(LITCAL_LOCAL_SPEC);
      }
    } else {
      const restore = before.previousSpec;
      if (!restore) {
        return sendJson(res, 400, {
          ok: false,
          error: 'No sé quina versió hi havia abans (no hi ha link-state.json). Restaura-ho a mà a saints-app/package.json.',
        });
      }
      if (before.linked) writeLitcalSpec(restore);
    }
  } catch (e) {
    return sendJson(res, 500, { ok: false, error: String(e) });
  }
  const install = await runCommand('bun', ['install'], SAINTS_APP_ROOT);
  // `bun install` does not confine itself to the dependency we changed: it re-resolves
  // transitive deps, so bun.lock keeps drifting even after switching back. Surface that
  // instead of pretending the toggle is perfectly symmetric.
  const lockDiff = await runCommand('git', ['status', '--short', 'bun.lock', 'package.json'], SAINTS_APP_ROOT);
  sendJson(res, install.code === 0 ? 200 : 500, {
    ok: install.code === 0,
    enable,
    log: install.stdout + install.stderr,
    dirtyFiles: lockDiff.stdout.trim().split('\n').filter(Boolean),
    status: linkStatus(),
  });
}

// --- Streamed "refresh" pipelines --------------------------------------------------
//
// These chain the steps that already exist as individual cards, so that one click
// leaves the local saints-app showing the latest Catalan calendars + content. They run
// for minutes, so results stream back step by step (SSE) instead of hanging on one
// request until the end.

function sseStart(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
}

function sseSend(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function refreshPlan(what, opts) {
  const litcalSteps = [
    {
      id: 'stage1',
      label: 'Generar candidats de calendari des de cpl-app.db',
      run: () =>
        runCommand('node', ['migration-to-saints/generate-catalan-calendars.js', '--out', CANDIDATES_DIR, '--json', STAGE1_JSON], CPL_APP_ROOT),
      summary: () => {
        const s = readJsonSafe(STAGE1_JSON);
        if (!s) return null;
        const rules = Object.values(s.calendars || {}).reduce((a, c) => a + (c.ruleCount || 0), 0);
        return `${Object.keys(s.calendars || {}).length} calendaris · ${rules} regles candidates`;
      },
    },
    {
      id: 'stage2',
      label: 'Filtrar contra litcal i escriure src/data/calendars/',
      run: () => runCommand('npx', ['tsx', 'scripts/build-catalan-calendars.ts', CANDIDATES_DIR, '--json', STAGE2_JSON, '--write'], LITCAL_ROOT),
      summary: () => {
        const s = readJsonSafe(STAGE2_JSON);
        if (!s) return null;
        const kept = Object.values(s.survivors || {}).reduce((a, c) => a + (c.ruleCount || 0), 0);
        return `${kept} celebracions escrites · ${s.droppedCount ?? 0} descartades · ${s.promotedCount ?? 0} promogudes a catalonia.json`;
      },
    },
    {
      id: 'loaders',
      label: 'Regenerar el carregador de calendaris de litcal',
      run: () => runCommand('npx', ['tsx', 'scripts/generate-calendar-loader.ts'], LITCAL_ROOT),
    },
    {
      id: 'build',
      label: 'Compilar litcal (dist/) perquè eprex el pugui llegir',
      run: () => runCommand('npm', ['run', 'build'], LITCAL_ROOT),
    },
    {
      id: 'sync',
      label: 'Deixar el build nou a disposició de saints-app',
      run: async () => {
        const r = syncBuiltLitcalIntoSaintsApp();
        return { code: 0, stdout: `${r.action}: ${r.detail}\n`, stderr: '', note: r.action };
      },
      summary: () => {
        const st = linkStatus();
        return st.linked
          ? `eprex llegeix ${st.litcalRoot} (${st.installedKind}) — recarrega'l i ja hi seran`
          : `ATENCIÓ: eprex segueix amb la versió publicada (${st.spec}) i NO veurà aquests calendaris. Activa la casella de dalt.`;
      },
    },
  ];

  const contentSteps = [
    {
      id: 'manifest',
      label: `Resoldre dates → claus amb litcal (${opts.diocese}, ${opts.start} → ${opts.end})`,
      run: () =>
        runCommand(
          'npx',
          [
            'tsx',
            'scripts/build-date-to-key-manifest.ts',
            path.join(DAY_TEXTS_DIR, 'all_laudes.json'),
            opts.start,
            opts.end,
            path.join(RUN_DIR, 'date-to-key-manifest.json'),
            DIOCESE_TO_CALENDAR_ID[opts.diocese] || 'spain',
          ],
          LITCAL_ROOT
        ),
    },
    {
      id: 'join',
      label: `Extreure el contingut català de cpl-app i aparellar-lo (${opts.hours.join(', ')})`,
      run: () =>
        runCommand('npx', ['jest', 'migration-to-saints/join-content.test.js', '--silent'], CPL_APP_ROOT, {
          HOURS: opts.hours.join(','),
          DIOCESE: opts.diocese,
        }),
      summary: () => {
        const pending = readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/output/join-pending-review.json')) || {};
        const pendingCount = Object.values(pending).reduce((a, l) => a + l.length, 0);
        const commonsDir = path.join(CPL_APP_ROOT, 'migration-to-saints/output/commons-ca');
        let resolved = 0;
        if (fs.existsSync(commonsDir))
          for (const f of fs.readdirSync(commonsDir)) resolved += Object.keys(readJsonSafe(path.join(commonsDir, f)) || {}).length;
        return `${resolved} ids resolts · ${pendingCount} pendents de revisió`;
      },
    },
    // Runs after the join because it reads the join's conflict report: it can only say
    // "this celebration is what contests that cell" once the cells are known.
    {
      id: 'celebrations',
      label: 'Diagnosticar els conflictes contra el calendari (quines celebracions falten)',
      run: async () => {
        const probe = await runCommand(
          'npx',
          ['jest', 'migration-to-saints/celebration-probe.test.js', '--silent'],
          CPL_APP_ROOT,
          { DIOCESE: opts.diocese }
        );
        if (probe.code !== 0) return probe;
        const report = await runCommand('node', ['migration-to-saints/missing-celebrations.js'], CPL_APP_ROOT);
        return {
          code: report.code,
          stdout: probe.stdout + report.stdout,
          stderr: probe.stderr + report.stderr,
        };
      },
      summary: () => {
        const r = readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/output/missing-celebrations.json'));
        if (!r || !r.totals) return null;
        const t = r.totals;
        return (
          `${t.missing} celebracions que falten a litcal (desbloquejarien ${t.cellsSoleMissing} caselles) · ` +
          `${t.notApplied} al calendari però no aplicades · ${t.mismatch} desacords de trasllat/precedència`
        );
      },
    },
    {
      id: 'export',
      label: 'Escriure el resultat a saints-app/.../commons/ca/',
      run: async () => {
        const r = exportResolvedContentToSaintsApp();
        return {
          code: 0,
          stdout: `Fitxers: ${r.filesWritten.join(', ')}\nClaus noves: ${r.keysAdded}\nClaus actualitzades: ${r.keysChanged}\n`,
          stderr: '',
        };
      },
      summary: () => {
        if (!fs.existsSync(SAINTS_APP_COMMONS_CA)) return null;
        const files = fs.readdirSync(SAINTS_APP_COMMONS_CA);
        let keys = 0;
        for (const f of files) keys += Object.keys(readJsonSafe(path.join(SAINTS_APP_COMMONS_CA, f)) || {}).length;
        return `${files.length} fitxers · ${keys} textos catalans a saints-app`;
      },
    },
  ];

  if (what === 'litcal') return litcalSteps;
  if (what === 'content') return contentSteps;
  return [...litcalSteps, ...contentSteps];
}

async function handleRefresh(req, res, url) {
  const q = url.searchParams;
  const what = q.get('what') || 'all';
  const opts = {
    start: q.get('start') || '2017-01-01',
    end: q.get('end') || '2026-12-30',
    diocese: q.get('diocese') || 'Barcelona',
    hours: (q.get('hours') || dayCheck.ALL_HOURS.join(',')).split(',').filter(Boolean),
  };
  const steps = refreshPlan(what, opts);

  sseStart(res);
  sseSend(res, 'plan', { what, opts, steps: steps.map((s) => ({ id: s.id, label: s.label })) });

  for (const [i, step] of steps.entries()) {
    sseSend(res, 'step-start', { index: i, id: step.id, label: step.label });
    const started = Date.now();
    let result;
    try {
      result = await step.run();
    } catch (e) {
      result = { code: -1, stdout: '', stderr: String(e) };
    }
    const ok = result.code === 0;
    let summary = null;
    try {
      summary = ok && step.summary ? step.summary() : null;
    } catch {
      summary = null;
    }
    sseSend(res, 'step-end', {
      index: i,
      id: step.id,
      ok,
      seconds: Math.round((Date.now() - started) / 100) / 10,
      summary,
      log: (result.stdout || '') + (result.stderr || ''),
    });
    if (!ok) {
      sseSend(res, 'done', { ok: false, failedAt: step.id, status: linkStatus() });
      return res.end();
    }
  }
  sseSend(res, 'done', { ok: true, status: linkStatus() });
  res.end();
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (req.method === 'GET' && url.pathname === '/api/link-status') return handleLinkStatus(req, res);
    if (req.method === 'POST' && url.pathname === '/api/link-litcal')
      return handleLinkLitcal(req, res, await readBody(req));
    if (req.method === 'GET' && url.pathname === '/api/refresh') return handleRefresh(req, res, url);
    if (req.method === 'GET' && url.pathname === '/api/day-check') return handleDayCheck(req, res, url);
    if (req.method === 'GET' && url.pathname === '/api/day-compare') return handleDayCompare(req, res, url);
    if (req.method === 'GET' && url.pathname === '/api/compare-options') return handleCompareOptions(req, res);
    if (req.method === 'GET' && url.pathname === '/api/conflict-detail') return handleConflictDetail(req, res, url);
    if (req.method === 'GET' && url.pathname === '/api/month-check') return handleMonthCheck(req, res, url);
    if (req.method === 'GET' && url.pathname === '/api/review-queue') return handleReviewQueue(req, res);
    if (req.method === 'GET' && url.pathname === '/api/review-bundle') return handleReviewBundle(req, res, url);
    if (req.method === 'POST' && url.pathname === '/api/review-decision')
      return handleReviewDecision(req, res, await readBody(req));
    if (req.method === 'POST' && req.url === '/api/stage1') return handleStage1(req, res);
    if (req.method === 'POST' && req.url === '/api/stage2') return handleStage2(req, res, await readBody(req));
    if (req.method === 'POST' && req.url === '/api/generate-loaders') return handleGenerateLoaders(req, res);
    if (req.method === 'POST' && req.url === '/api/laudes') return handleLaudes(req, res);
    if (req.method === 'POST' && req.url === '/api/migrator/calculate')
      return handleMigratorRun(req, res, await readBody(req), { exportToSaintsApp: false });
    if (req.method === 'POST' && req.url === '/api/migrator/export')
      return handleMigratorRun(req, res, await readBody(req), { exportToSaintsApp: true });
    if (req.method === 'GET' && req.url === '/api/dropped-report') return handleDroppedReport(req, res);
    if (req.method === 'GET' && req.url === '/api/pending-report') return handlePendingReport(req, res);
    return serveStatic(req, res);
  } catch (e) {
    sendJson(res, 500, { ok: false, error: String(e) });
  }
});

// The usual way to pick up a code change is to start the panel again, so "port taken" is
// the most likely startup failure by far. A stack trace buries the one thing you need:
// the pid still holding it.
server.on('error', (e) => {
  if (e.code !== 'EADDRINUSE') throw e;
  let holder = '';
  try {
    holder = require('child_process').execSync(`lsof -ti tcp:${PORT} -sTCP:LISTEN`, { encoding: 'utf8' }).trim();
  } catch {}
  console.error(`El port ${PORT} ja està ocupat${holder ? ` pel procés ${holder.split('\n').join(', ')}` : ''}.`);
  console.error(`Probablement és una còpia antiga d'aquest mateix panell. Per reiniciar-lo:  make run-panel`);
  console.error(`(o fes-ho servir en un altre port:  make run-panel PORT=4849)`);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Catalan migration dashboard: http://localhost:${PORT}`);
});

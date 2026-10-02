// Asks the REAL saints-app which cell it uses for each field of a given day, instead of
// deducing it from all_laudes.json.
//
// Why this exists: the index says which numeric id a day maps to *by default*, but the
// stores override it. `laudesStore`'s `specialDays` list, for instance, replaces the nine
// psalm fields of 17–24 December and 2–5 January with the ones from
// `ordinary_time_{psalterWeek}_{weekday}`, and pins the antiphons to hardcoded ids. A
// migrator that reads the index files files those days' text under a cell the app never
// reads — which is exactly how 18 December ended up reported as a conflict that does not
// exist in either app (see PLAN.md 8c).
//
// The trick: write SENTINEL commons/ca tables where every entry's text is its own address
// ("salmos_citas/72"), run the app in Catalan, and read back what it renders. Whatever
// comes out IS the cell the app decided to use, resolved by its own code — every override,
// present or future, included. No mirroring of app logic on this side, ever.
//
//   node migration-to-saints/app-id-probe.js 2026-08-12,2026-12-18   # sample + comparison
//   node migration-to-saints/app-id-probe.js --range 2017-01-01..2026-12-30   # full map
//   node migration-to-saints/app-id-probe.js --restore     # if a run died mid-way
//
// The range form writes output/app-cell-map.json incrementally and resumes where it left
// off, because it takes ~40 minutes and a browser that dies at minute 38 shouldn't cost
// the whole run.
//
// Requires saints-app's vite dev server running (npm run serve, port 5173).

const fs = require('fs');
const path = require('path');

const SAINTS_APP = '/Users/pau/projects/saints/saints-app';
const CA_DIR = path.join(SAINTS_APP, 'src/store/db/day_specific_texts/commons/ca');
const ES_DIR = path.join(SAINTS_APP, 'src/store/db/day_specific_texts/commons/es');
const BACKUP_DIR = path.join(__dirname, 'output/.ca-backup');
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const CDP_PORT = 9444;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- sentinel tables -----------------------------------------------------------------

function backupAndWriteSentinels() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (fs.existsSync(path.join(BACKUP_DIR, '.in-progress'))) {
    throw new Error(`Ja hi ha un backup a mig fer a ${BACKUP_DIR}. Corre --restore primer.`);
  }
  const existing = fs.existsSync(CA_DIR) ? fs.readdirSync(CA_DIR).filter((f) => f.endsWith('.json')) : [];
  for (const f of existing) fs.copyFileSync(path.join(CA_DIR, f), path.join(BACKUP_DIR, f));
  fs.writeFileSync(path.join(BACKUP_DIR, '.in-progress'), JSON.stringify({ files: existing, at: new Date().toISOString() }));

  // Sentinels cover every id es knows about, so no lookup can fall through to "not found"
  // and hide which cell was asked for.
  fs.mkdirSync(CA_DIR, { recursive: true });
  const tables = fs.readdirSync(ES_DIR).filter((f) => f.endsWith('.json'));
  for (const f of tables) {
    const table = f.replace(/\.json$/, '');
    const src = JSON.parse(fs.readFileSync(path.join(ES_DIR, f), 'utf8'));
    const out = {};
    for (const id of Object.keys(src)) out[id] = `«${table}/${id}»`;
    fs.writeFileSync(path.join(CA_DIR, f), JSON.stringify(out), 'utf8');
  }
  return tables.length;
}

function restore() {
  const marker = path.join(BACKUP_DIR, '.in-progress');
  if (!fs.existsSync(marker)) return false;
  const { files } = JSON.parse(fs.readFileSync(marker, 'utf8'));
  for (const f of fs.readdirSync(CA_DIR)) if (f.endsWith('.json')) fs.unlinkSync(path.join(CA_DIR, f));
  for (const f of files) fs.copyFileSync(path.join(BACKUP_DIR, f), path.join(CA_DIR, f));
  fs.unlinkSync(marker);
  return true;
}

// --- the map ---------------------------------------------------------------------------

const MAP_PATH = path.join(__dirname, 'output/app-cell-map.json');

function loadMap() {
  try {
    return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8')).days || {};
  } catch {
    return {};
  }
}

// Flat "table/id" strings rather than objects: this file has ~150.000 cells in it and is
// read by the join on every run.
function saveMap(results) {
  const days = loadMap();
  for (const r of results) {
    if (r.error) {
      days[r.date] = { error: r.error };
      continue;
    }
    const hours = {};
    for (const [hour, fields] of Object.entries(r.hours)) {
      if (fields.__noEntry) {
        hours[hour] = { __noEntry: true };
        continue;
      }
      const out = {};
      for (const [field, cell] of Object.entries(fields)) {
        if (Array.isArray(cell)) {
          const list = cell.filter((c) => c.table).map((c) => `${c.table}/${c.id}`);
          if (list.length) out[field] = list;
        } else if (cell.table) {
          out[field] = `${cell.table}/${cell.id}`;
        }
      }
      hours[hour] = out;
    }
    days[r.date] = { litcalId: r.litcalId, hours };
  }
  fs.writeFileSync(MAP_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), days }), 'utf8');
}

// --- CDP -----------------------------------------------------------------------------

async function connect() {
  const { spawn } = require('child_process');
  const chrome = spawn(
    CHROME,
    ['--headless=new', `--remote-debugging-port=${CDP_PORT}`, '--no-first-run',
      '--user-data-dir=/tmp/cdp-profile-id-probe', '--window-size=1200,2400', 'about:blank'],
    { stdio: 'ignore' }
  );
  let target;
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://localhost:${CDP_PORT}/json/list`)).json();
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch {}
    await sleep(250);
  }
  if (!target) throw new Error('No s’ha pogut arrencar Chrome headless');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const waiting = new Map();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && waiting.has(msg.id)) {
      waiting.get(msg.id)(msg);
      waiting.delete(msg.id);
    }
  };
  await new Promise((r) => (ws.onopen = r));
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      waiting.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    const ex = r.result && r.result.exceptionDetails;
    if (ex) throw new Error(ex.exception ? ex.exception.description : JSON.stringify(ex));
    return r.result && r.result.result && r.result.result.value;
  };
  return { send, evalJs, close: () => { ws.close(); chrome.kill(); } };
}

// The Hours the probe drives. Terce, Sext and None are three separate Pinia stores with
// the same shape as Laudes (`contentByDay`, `loadingState`, `errorCode`), each reading its
// own `all_{tercia,sexta,nona}.json`; the id under `defineStore` is the name used here.
// The Office of Readings joins them: same contract (`contentByDay`, `loadingState`,
// `errorCode`), a much wider record — and the one Hour whose store rewrites the entry
// before rendering it (`officeStore`'s `cycle === "MEMORY"` block swaps the psalmody, the
// biblical reading and their responsories for the weekday's). That rewrite is exactly what
// the probe exists to catch: nothing here models it, it is simply measured.
//
// The Mass is the one that does not fit the contract: `lecturesStore.contentByDay` is an
// ARRAY of `Lecture` objects (`type`, `title`, `body`) rather than an object with one key per
// field. `SHAPE_ADAPTERS` below flattens it to `{ROLE}_ref` / `{ROLE}_texto` inside the page,
// so everything downstream — parseCell, the map, the join — keeps speaking one vocabulary.
const PROBED_HOURS = ['Laudes', 'Vespers', 'Tercia', 'Sexta', 'Nona', 'Office', 'Mass'];
const STORE_IDS = {
  Laudes: 'Laudes', Vespers: 'Visperas', Tercia: 'Tercia', Sexta: 'Sexta', Nona: 'Nona',
  Office: 'Office', Mass: 'Lectures',
};

// Run inside the page, on whatever `contentByDay` holds, before anything is read out of it.
// Keyed by Hour; an Hour without an entry here is passed through unchanged.
const SHAPE_ADAPTERS = {
  Mass: `(c) => {
    if (!Array.isArray(c)) return c;
    const out = {};
    for (const l of c) {
      if (!l || !l.type) continue;
      out[l.type + '_ref'] = l.title;
      out[l.type + '_texto'] = l.body;
    }
    return out;
  }`,
};

// Reaches the app's own Pinia instance and drives it exactly like the UI would: set the
// date, then read back what the Hour stores ended up holding.
const PROBE = (date) => `(async () => {
  const app = document.querySelector('#app').__vue_app__;
  const pinia = app.config.globalProperties.$pinia;
  const dateStore = pinia._s.get('dateStore');
  const when = new Date('${date}T12:00:00');
  await dateStore.setDate(when);
  // Right after boot the app's own setDate(today) can start after this one and still be in
  // flight. setDate drops a result whose date is no longer the selected one, so ours is thrown
  // away and romcalId stays today's: the first date of every run came out labelled with the
  // celebration of the day the probe ran (MIGRA-023). Ask again until the selected date is ours.
  for (let i = 0; i < 5 && dateStore.currentDate?.getTime() !== when.getTime(); i++) {
    await dateStore.setDate(when);
  }
  // Since dev of 24-9-2026 setDate refreshes only the Hours someone has opened, and an Hour
  // with a load still pending for another date hands back that load instead of this one
  // (useRefreshAllStores, ensureHourLoaded). So each store is asked for this date here, one
  // after the other, before anything is read: otherwise it may still hold the day before.
  for (const storeId of ${JSON.stringify(Object.values(STORE_IDS))}) {
    const s = pinia._s.get(storeId);
    if (s && typeof s.changeDay === 'function') await s.changeDay(when);
  }
  const out = { date: '${date}', hours: {}, state: {} };
  for (const [hour, storeId] of ${JSON.stringify(Object.entries(STORE_IDS))}) {
    const s = pinia._s.get(storeId);
    if (!s) { out.hours[hour] = null; continue; }
    // The store returns early on ERR-004 (no entry for this day) WITHOUT clearing
    // contentByDay, so what it holds is then the previously loaded day. Carrying the
    // state out is the only way to tell a real answer from a leftover one.
    out.state[hour] = { loadingState: s.loadingState, errorCode: s.errorCode };
    const adapt = (${JSON.stringify(SHAPE_ADAPTERS)})[hour];
    const raw = JSON.parse(JSON.stringify(s.contentByDay ?? null));
    out.hours[hour] = adapt ? (0, eval)('(' + adapt + ')')(raw) : raw;
  }
  const day = pinia._s.get('dateStore');
  if (day.currentDate?.getTime() !== when.getTime()) throw new Error('dateStore no és al ' + '${date}' + ': ' + day.currentDate);
  out.litcalId = day.romcalId;
  return JSON.stringify(out);
})()`;

// The sentinel comes back wrapped in «» so it can be told apart from real text that
// happens to look like an id, and from the app's own "id X not found" fallback.
function parseCell(value) {
  if (typeof value !== 'string') return { raw: value };
  const m = value.match(/^«([a-z_]+)\/([^»]+)»$/);
  if (m) return { table: m[1], id: m[2] };
  const nf = value.match(/^id (\S+) not found in (\S+)$/);
  if (nf) return { table: nf[2], id: nf[1], missing: true };
  return { text: value };
}

// Side by side with what the migrator believes, plus the Spanish text of the cell the app
// actually used — which is the line you can check against eprex on screen without trusting
// any of this code.
function compare(results) {
  const { FIELDS, FIELDS_BY_HOUR, ENTRY_NORMALISERS } = require('./day-check');
  const DAY_TEXTS = path.join(SAINTS_APP, 'src/store/db/day_specific_texts');
  const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
  const manifest = readJson(path.join(__dirname, 'webui/run/date-to-key-manifest.json'));
  const allX = {
    Laudes: readJson(path.join(DAY_TEXTS, 'all_laudes.json')),
    Vespers: readJson(path.join(DAY_TEXTS, 'all_visperas.json')),
    Tercia: readJson(path.join(DAY_TEXTS, 'all_tercia.json')),
    Sexta: readJson(path.join(DAY_TEXTS, 'all_sexta.json')),
    Nona: readJson(path.join(DAY_TEXTS, 'all_nona.json')),
    Office: readJson(path.join(DAY_TEXTS, 'all_oficio.json')),
    Mass: readJson(path.join(DAY_TEXTS, 'all_lectures.json')),
  };
  const esCache = {};
  const esText = (table, id) => {
    if (!(table in esCache)) {
      try {
        esCache[table] = readJson(path.join(ES_DIR, `${table}.json`));
      } catch {
        esCache[table] = null;
      }
    }
    const v = esCache[table] && esCache[table][id];
    return typeof v === 'string' ? v.replace(/\s+/g, ' ').slice(0, 60) : '';
  };
  const cell = (c) => (Array.isArray(c) ? c.map((x) => `${x.table}/${x.id}`).join(',') : c && c.table ? `${c.table}/${c.id}` : null);

  let same = 0;
  const diffs = [];
  for (const day of results) {
    const entryForDate = manifest[day.date];
    for (const hour of PROBED_HOURS) {
      const app = day.hours[hour];
      if (!app) continue;
      if (app.__noEntry) {
        diffs.push([day.date, hour, '(tota l’hora)', 'sense entrada a l’índex', 'ERR-004: l’app manté el dia anterior', '']);
        continue;
      }
      const key = entryForDate ? Object.keys(allX[hour]).find((k) => k.startsWith(`${entryForDate.litcalId}__`)) : null;
      const rawEntry = key ? allX[hour][key] : null;
      // `all_lectures.json` nests its cells under `lecturas`; everything else is flat.
      const entry = rawEntry && ENTRY_NORMALISERS[hour] ? ENTRY_NORMALISERS[hour](rawEntry) : rawEntry;
      for (const f of (FIELDS_BY_HOUR[hour] || FIELDS)) {
        const appCell = cell(app[f.key]);
        const raw = entry ? entry[f.key] : undefined;
        const migCell =
          raw === undefined || raw === null
            ? null
            : Array.isArray(raw)
              ? raw.map((i) => `${f.table}/${i}`).join(',')
              : `${f.table}/${raw}`;
        if (appCell === null && migCell === null) continue;
        if (appCell === migCell) {
          same++;
          continue;
        }
        const one = Array.isArray(app[f.key]) ? app[f.key][0] : app[f.key];
        diffs.push([day.date, hour, f.key, String(migCell), String(appCell), one && one.id ? esText(one.table, one.id) : '']);
      }
    }
  }

  console.log(`\nCamps que coincideixen amb el migrador: ${same} · que difereixen: ${diffs.length}`);
  if (!diffs.length) return;
  console.log('\ndata        hora     camp                      migrador -> app          (text a es de la casella de l’app)');
  for (const [date, hour, field, mig, appCell, es] of diffs) {
    console.log(`${date}  ${hour.padEnd(7)}  ${field.padEnd(24)}  ${mig} -> ${appCell}${es ? `   « ${es} »` : ''}`);
  }
}

async function main() {
  if (process.argv.includes('--restore')) {
    console.log(restore() ? 'commons/ca restaurat.' : 'No hi havia cap backup pendent.');
    return;
  }
  const rangeArg = (process.argv.find((a) => a.startsWith('--range')) || '').split('=')[1] || (process.argv.includes('--range') ? process.argv[process.argv.indexOf('--range') + 1] : null);
  const rangeMode = !!rangeArg;
  let dates;
  if (rangeMode) {
    const [start, end] = rangeArg.split('..');
    dates = [];
    for (let d = new Date(`${start}T00:00:00Z`); d <= new Date(`${end}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
      dates.push(d.toISOString().slice(0, 10));
    }
    if (!process.argv.includes('--fresh')) {
      const done = new Set(Object.keys(loadMap()));
      const before = dates.length;
      dates = dates.filter((d) => !done.has(d));
      if (before !== dates.length) console.log(`Represa: ${before - dates.length} dates ja fetes, en queden ${dates.length}.`);
    }
    if (!dates.length) {
      console.log(`Res a fer: ${MAP_PATH} ja cobreix tot el rang.`);
      return;
    }
  } else {
    dates = (process.argv[2] || '').split(',').map((s) => s.trim()).filter(Boolean);
  }
  if (!dates.length) {
    console.error('Usage: node migration-to-saints/app-id-probe.js YYYY-MM-DD[,...] | --range START..END');
    process.exit(1);
  }

  const res = await fetch(APP_URL).catch(() => null);
  if (!res || !res.ok) {
    console.error(`No hi ha cap eprex a ${APP_URL}. Arrenca'l amb: cd ${SAINTS_APP} && npm run serve`);
    process.exit(1);
  }

  const n = backupAndWriteSentinels();
  console.log(`Sentinelles escrits a commons/ca (${n} taules). Original desat a ${BACKUP_DIR}`);

  let cdp;
  try {
    cdp = await connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Page.navigate', { url: APP_URL });
    await sleep(2000);
    // Catalan + the diocese the migration is calibrated for, then reload so the app boots
    // with them instead of picking the device defaults.
    await cdp.evalJs(`localStorage.setItem('selectedLanguage','ca');
      localStorage.setItem('selectedCalendar','diocese-barcelona');
      localStorage.setItem('selectedCalendarSource','manual'); true`);
    // The Hours saints-app has not been asked for it loads in idle time, one by one, and one
    // of those loads for the previous date can land after PROBE has asked for the next one.
    // The page gets no idle time at all: PROBE asks for every Hour itself.
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.requestIdleCallback = () => 0;' });
    await cdp.send('Page.navigate', { url: `${APP_URL}/liturgy-of-hours/lauds` });

    for (let i = 0; i < 40; i++) {
      const ready = await cdp.evalJs(`(() => {
        try {
          const p = document.querySelector('#app').__vue_app__.config.globalProperties.$pinia;
          return !!(p._s.get('dateStore') && p._s.get('Laudes'));
        } catch { return false; }
      })()`);
      if (ready) break;
      await sleep(500);
    }

    const results = [];
    const started = Date.now();
    for (const [i, date] of dates.entries()) {
      let day;
      try {
        const parsed = JSON.parse(await cdp.evalJs(PROBE(date)));
        day = { date, litcalId: parsed.litcalId, state: parsed.state, hours: {} };
        for (const [hour, content] of Object.entries(parsed.hours)) {
          if (!content) continue;
          const st = parsed.state[hour] || {};
          if (st.errorCode === 'ERR-004') {
            // Stale content from the previous day — record the fact, not the fields.
            day.hours[hour] = { __noEntry: true };
            continue;
          }
          const fields = {};
          for (const [field, value] of Object.entries(content)) {
            if (Array.isArray(value)) fields[field] = value.map(parseCell);
            else if (value !== null && value !== undefined) fields[field] = parseCell(value);
          }
          day.hours[hour] = fields;
        }
      } catch (e) {
        // One bad day must not cost the run; it is recorded and shows up in the summary.
        day = { date, error: String(e.message || e) };
      }
      results.push(day);
      if (rangeMode) {
        if ((i + 1) % 25 === 0 || i === dates.length - 1) {
          saveMap(results);
          const rate = (Date.now() - started) / (i + 1);
          const left = Math.round((rate * (dates.length - i - 1)) / 60000);
          console.log(`  ${i + 1}/${dates.length} (${date}) · ~${left} min restants`);
        }
      } else {
        console.log(`✓ ${date} → ${day.litcalId || day.error}`);
      }
    }

    if (rangeMode) {
      saveMap(results);
      const bad = results.filter((r) => r.error).length;
      const noEntry = results.filter((r) => r.hours && Object.values(r.hours).some((h) => h && h.__noEntry)).length;
      console.log(`\nMapa escrit a ${MAP_PATH}`);
      console.log(`${results.length} dates · ${noEntry} amb alguna hora sense entrada a l'índex · ${bad} amb error`);
    } else {
      const outPath = path.join(__dirname, 'output/app-id-probe.json');
      fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf8');
      console.log(`\nEscrit a ${outPath}`);
      compare(results);
    }
  } finally {
    if (cdp) cdp.close();
    restore();
    console.log('commons/ca restaurat.');
  }
}

main().catch((e) => {
  console.error(e);
  restore();
  process.exit(1);
});

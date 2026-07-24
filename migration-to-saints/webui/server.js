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
const PUBLIC_DIR = path.join(__dirname, 'public');

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

async function runContentJoinPipeline({ start, end, hours }) {
  const manifestPath = path.join(RUN_DIR, 'date-to-key-manifest.json');
  const allLaudesPath = path.join(DAY_TEXTS_DIR, 'all_laudes.json');

  const manifestResult = await runCommand(
    'npx',
    ['tsx', 'scripts/build-date-to-key-manifest.ts', allLaudesPath, start, end, manifestPath, 'spain'],
    LITCAL_ROOT
  );
  if (manifestResult.code !== 0) {
    return { ok: false, log: manifestResult.stdout + manifestResult.stderr };
  }

  const joinResult = await runCommand(
    'npx',
    ['jest', 'migration-to-saints/join-content.test.js', '--silent'],
    CPL_APP_ROOT,
    { HOURS: hours.join(',') }
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
function exportResolvedContentToSaintsApp() {
  fs.mkdirSync(SAINTS_APP_COMMONS_CA, { recursive: true });
  const report = { filesWritten: [], keysAdded: 0, keysChanged: 0 };

  const commonsDir = path.join(CPL_APP_ROOT, 'migration-to-saints/output/commons-ca');
  if (fs.existsSync(commonsDir)) {
    for (const f of fs.readdirSync(commonsDir)) {
      const src = readJsonSafe(path.join(commonsDir, f)) || {};
      if (Object.keys(src).length === 0) continue;
      const destPath = path.join(SAINTS_APP_COMMONS_CA, f);
      const dest = readJsonSafe(destPath) || {};
      for (const [k, v] of Object.entries(src)) {
        if (!(k in dest)) report.keysAdded++;
        else if (dest[k] !== v) report.keysChanged++;
        dest[k] = v;
      }
      fs.writeFileSync(destPath, JSON.stringify(dest, null, 2), 'utf8');
      report.filesWritten.push(f);
    }
  }

  if (fs.existsSync(STATIC_TRANSLATIONS_DIR)) {
    for (const f of fs.readdirSync(STATIC_TRANSLATIONS_DIR)) {
      const targetName = f.replace('.ca.json', '.json');
      const src = readJsonSafe(path.join(STATIC_TRANSLATIONS_DIR, f)) || {};
      const destPath = path.join(SAINTS_APP_COMMONS_CA, targetName);
      const dest = readJsonSafe(destPath) || {};
      for (const [k, v] of Object.entries(src)) {
        if (!(k in dest)) report.keysAdded++;
        dest[k] = v;
      }
      fs.writeFileSync(destPath, JSON.stringify(dest, null, 2), 'utf8');
      report.filesWritten.push(targetName);
    }
  }

  const latinSrc = path.join(SAINTS_APP_COMMONS_ES, 'himnos_latinos.json');
  const latinDest = path.join(SAINTS_APP_COMMONS_CA, 'himnos_latinos.json');
  if (fs.existsSync(latinSrc) && !fs.existsSync(latinDest)) {
    fs.copyFileSync(latinSrc, latinDest);
    report.filesWritten.push('himnos_latinos.json (còpia d’es, invariant)');
  }

  return report;
}

async function handleMigratorRun(req, res, body, { exportToSaintsApp }) {
  const start = (body && body.start) || '2024-01-01';
  const end = (body && body.end) || '2026-12-30';
  const hours = (body && body.hours && body.hours.length) ? body.hours : ['Laudes', 'Vespers'];

  const result = await runContentJoinPipeline({ start, end, hours });
  let exportReport = null;
  if (result.ok && exportToSaintsApp) {
    exportReport = exportResolvedContentToSaintsApp();
  }
  sendJson(res, result.ok ? 200 : 500, { ...result, start, end, hours, exported: exportToSaintsApp, exportReport });
}

function handlePendingReport(req, res) {
  const pending =
    readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/output/join-pending-review.json')) || {};
  const items = Object.entries(pending).flatMap(([table, list]) => list.map((item) => ({ table, ...item })));
  sendJson(res, 200, { items });
}

function handleDroppedReport(req, res) {
  const report = readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/dropped-needs-content-reconciliation.json'));
  sendJson(res, 200, { report });
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

server.listen(PORT, () => {
  console.log(`Catalan migration dashboard: http://localhost:${PORT}`);
});

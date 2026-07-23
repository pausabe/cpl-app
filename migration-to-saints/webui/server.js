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
const RUN_DIR = path.join(__dirname, 'run');
const CANDIDATES_DIR = path.join(RUN_DIR, 'candidates');
const STAGE1_JSON = path.join(RUN_DIR, 'stage1-summary.json');
const STAGE2_JSON = path.join(RUN_DIR, 'stage2-summary.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

fs.mkdirSync(RUN_DIR, { recursive: true });

function runCommand(cmd, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd });
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

async function handleJoinLaudes(req, res, body) {
  const start = (body && body.start) || '2024-01-01';
  const end = (body && body.end) || '2026-12-30';
  const manifestPath = path.join(RUN_DIR, 'date-to-key-manifest.json');
  const allLaudesPath =
    '/Users/pau/projects/saints/saints-app/src/store/db/day_specific_texts/all_laudes.json';

  const manifestResult = await runCommand(
    'npx',
    ['tsx', 'scripts/build-date-to-key-manifest.ts', allLaudesPath, start, end, manifestPath, 'spain'],
    LITCAL_ROOT
  );
  if (manifestResult.code !== 0) {
    return sendJson(res, 500, { ok: false, stage: 'manifest', log: manifestResult.stdout + manifestResult.stderr });
  }

  const joinResult = await runCommand(
    'npx',
    ['jest', 'migration-to-saints/join-laudes.test.js', '--silent'],
    CPL_APP_ROOT
  );
  const commonsDir = path.join(CPL_APP_ROOT, 'migration-to-saints/output/commons-ca');
  const coverage = {};
  if (fs.existsSync(commonsDir)) {
    for (const f of fs.readdirSync(commonsDir)) {
      coverage[f.replace(/\.json$/, '')] = Object.keys(readJsonSafe(path.join(commonsDir, f)) || {}).length;
    }
  }
  const conflicts = readJsonSafe(path.join(CPL_APP_ROOT, 'migration-to-saints/output/join-conflicts.json')) || [];
  sendJson(res, joinResult.code === 0 ? 200 : 500, {
    ok: joinResult.code === 0,
    log: manifestResult.stdout + manifestResult.stderr + '\n' + joinResult.stdout + joinResult.stderr,
    coverage,
    conflictCount: conflicts.length,
    conflictSample: conflicts.slice(0, 30),
  });
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
    if (req.method === 'POST' && req.url === '/api/join-laudes') return handleJoinLaudes(req, res, await readBody(req));
    if (req.method === 'GET' && req.url === '/api/dropped-report') return handleDroppedReport(req, res);
    return serveStatic(req, res);
  } catch (e) {
    sendJson(res, 500, { ok: false, error: String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`Catalan migration dashboard: http://localhost:${PORT}`);
});

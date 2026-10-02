// MIGRA-024: make tests ran the migration's pipeline tests on the database in place and wrote
// over its real output, which is in git and is built from the fixed copy (make db-fixed). Two
// things keep it from coming back: the Makefile's Jest runs hand them a scratch OUT_DIR, and every
// test that writes under output/ by default honours OUT_DIR.
//
//   npx jest migration-to-saints/out-dir.test.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function recipe(makefile, target) {
  const lines = makefile.split('\n');
  const start = lines.findIndex((l) => l.startsWith(`${target}:`));
  if (start === -1) return [];
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (!line.startsWith('\t')) break;
    body.push(line);
  }
  return body;
}

function testFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' || entry.name === 'output' ? [] : testFiles(p);
    return entry.name.endsWith('.test.js') ? [p] : [];
  });
}

describe('make tests does not write the migration output (MIGRA-024)', () => {
  const makefile = fs.readFileSync(path.join(ROOT, 'Makefile'), 'utf8');

  test.each(['tests', 'tests-fast', 'checks'])('make %s gives Jest a scratch OUT_DIR', (target) => {
    const jestLines = recipe(makefile, target).filter((l) => /\bnpx jest\b/.test(l));
    expect(jestLines.length).toBeGreaterThan(0);
    for (const line of jestLines) expect(line).toMatch(/\bOUT_DIR=/);
  });

  test('every test that writes under output/ by default honours OUT_DIR', () => {
    const offenders = testFiles(__dirname)
      .filter((file) => {
        const src = fs.readFileSync(file, 'utf8');
        return /writeFileSync/.test(src) && /__dirname,\s*'output\//.test(src) && !/process\.env\.OUT_DIR/.test(src);
      })
      .map((file) => path.relative(ROOT, file))
      // A tool, not a check: skipped without DATES, and it takes its file from OUT.
      .filter((file) => file !== 'migration-to-saints/cpl-day.test.js');
    expect(offenders).toEqual([]);
  });
});

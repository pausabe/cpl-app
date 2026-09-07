// Regression detector for MIGRA-006.
//
// On the eve of a solemnity cpl-app prays its First Vespers (OGLH 61) and so does
// saints-app — into the solemnity's OWN First Vespers cells, which the probe measures.
// The join used to skip those evenings outright, on the belief (F5) that saints-app has
// no First Vespers slot. For the Sacred Heart that threw away nine of the ten observations
// of `salmos_antifonas/9998`; the tenth (2022-06-23, where cpl-app prays the Nativity of
// the Baptist, transferred off the Sacred Heart's day) was then alone in the cell, "every
// observation agrees" was true by vacuum, and the join WROTE the Baptist's antiphon into
// the Sacred Heart's cell. Fifteen cells regressed that way.
//
// This runs the real join over exactly those ten dates, into a throwaway output dir, and
// asserts the cell ends up RETAINED rather than written. Without the fix the join skips
// nine dates, sees one observation, and writes it — which is what fails here.
//
//   npx jest migration-to-saints/first-vespers.test.js

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
// Ten years of the Thursday before the Sacred Heart, which always falls on a Friday.
const EVES = [
  '2017-06-22', '2018-06-07', '2019-06-27', '2020-06-18', '2021-06-10',
  '2022-06-23', '2023-06-15', '2024-06-06', '2025-06-26', '2026-06-11',
];
const CELL = { table: 'salmos_antifonas', id: '9998' };
// What cpl-app gives on 2022-06-23 — the lone observation that used to win.
const BAPTIST = 'Déu envià un home';

test('the eve of a solemnity is observed into its First Vespers cell, not skipped', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migra006-'));
  try {
    execFileSync(
      'npx',
      ['jest', 'migration-to-saints/join-content.test.js', '--silent'],
      {
        cwd: REPO,
        env: { ...process.env, DATES: EVES.join(','), HOURS: 'Vespers', OUT_DIR: outDir },
        stdio: 'pipe',
        timeout: 600000,
      },
    );

    // A join that ignores OUT_DIR has written over the real ten-year output instead.
    // Say so, rather than reading that output and reporting on the wrong run.
    if (!fs.existsSync(path.join(outDir, 'commons-ca'))) {
      throw new Error(
        `The join wrote nothing to ${outDir}: it does not honour OUT_DIR, so it has just ` +
        'overwritten migration-to-saints/output with this ten-date run. Restore it.',
      );
    }

    const written = JSON.parse(
      fs.readFileSync(path.join(outDir, 'commons-ca', `${CELL.table}.json`), 'utf8'),
    );
    const pending = JSON.parse(fs.readFileSync(path.join(outDir, 'join-pending-review.json'), 'utf8'));
    const held = (pending[CELL.table] || []).find((e) => String(e.id) === CELL.id);

    // The precise failure MIGRA-006 describes: one date's text standing in for ten.
    expect(written[CELL.id] || '').not.toContain(BAPTIST);
    // And the reason it must not be written: the ten evenings do not agree, so the cell
    // is disputed and belongs in the review queue.
    expect(held).toBeDefined();
    expect(held.variants.length).toBeGreaterThan(1);
    // All ten evenings must reach the cell. Nine skipped is what the bug looked like.
    expect(held.affectedCount).toBe(EVES.length);
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}, 900000);

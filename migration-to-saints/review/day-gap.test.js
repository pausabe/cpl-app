// MIGRA-025: day-gap said "triar la majoritària trenca N de M dies" for every held cell, but the
// N it printed (day-check's impactFor) counts the days broken by THIS day's text whenever the day
// was observed. On a day holding the minority it read backwards: on 6 October 2026 it said the
// majority broke 10 of 15 days, when the majority breaks this day's 5 and this day's text the 10.
//
//   npx jest migration-to-saints/review/day-gap.test.js

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const DATE = '2026-10-06';

function runDayGap(impact) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'day-gap-'));
  const row = {
    hour: 'Mass', key: 'PSALM_texto', label: 'Salm responsorial — text', table: 'lecturas_texto', id: '885',
    status: 'conflict', match: 'prose', channel: 'C2',
    conflict: {
      cause: 'Casella compartida per 3 celebracions', bundleId: 'shared|a,b,c', variantCount: 2, decision: 'pending',
      variants: [{ preview: 'Us dono gràcies…', count: 10 }, { preview: 'Guieu-me, Senyor…', count: 5 }],
      impact,
    },
  };
  const data = {
    days: [{
      date: DATE, cplTitle: 'Sant Bru, prevere', cplType: 'L', allXKey: 'ordinary_time_27_tuesday__ANY',
      litcalId: 'ordinary_time_27_tuesday', cplSpecificTime: 'O_ORDINAR', cplWeek: 27,
      rows: [row], coverage: { have: 0, conflict: 1, unreachable: 0, total: 1 },
    }],
  };
  fs.writeFileSync(path.join(dir, 'review-rows.json'), JSON.stringify(data));
  try {
    return execFileSync('node', [path.join(__dirname, 'day-gap.js'), DATE], {
      env: { ...process.env, RUN_DIR: dir }, encoding: 'utf8',
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('day-gap says whose text the cost of a held cell is counted from (MIGRA-025)', () => {
  test('a day that was observed: the cost is of filling the cell with its own text', () => {
    const out = runDayGap({ days: 15, agreeDays: 5, breakDays: 10, dateNotObserved: false });
    expect(out).toContain('amb el text d’aquest dia, 5 de 15 dies bé i 10 malament');
    expect(out).not.toContain('triar la majoritària');
  });

  test('a day the migration never saw: the cost is of the majority', () => {
    const out = runDayGap({ days: 15, agreeDays: 10, breakDays: 5, dateNotObserved: true });
    expect(out).toContain('triar la majoritària trenca 5 de 15 dies');
  });
});

// Runs __tests__/liturgy/litcalSweep.test.js over every place of the calendar table at once, one Jest
// per group of columns, and joins what they found: the days where the app does not show the
// celebration litcal chose. make litcal-sweep calls it.
//
//   node scripts/litcalSweep.mjs <cpl-app.db> <expected.json> [first year] [last year]
//
// Both files come from cpl-cloud's process X (calendar/, npm run write). The joined report goes next
// to expected.json, as sweep.json. LITCAL_DAYS (a JSON file with a list of dates) limits it to them.
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const [database, expected, from, to] = process.argv.slice(2);
if (!database || !expected) {
  console.error('Usage: node scripts/litcalSweep.mjs <cpl-app.db> <expected.json> [first year] [last year]');
  process.exit(1);
}

const DIOCESES = ['Ba', 'Gi', 'Ll', 'SF', 'So', 'Ta', 'Te', 'To', 'Ur', 'Vi'];
const COLUMNS = [
  ...DIOCESES.flatMap((diocese) => ['D', 'V', 'C'].map((place) => diocese + place)),
  'Andorra',
  ...['Ma', 'Me'].flatMap((diocese) => ['D', 'V', 'C'].map((place) => diocese + place)),
];

// The columns dealt out one by one, so that every Jest gets dioceses, cities and cathedrals alike
const workers = Math.min(availableParallelism(), COLUMNS.length);
const groups = Array.from({ length: workers }, (_, worker) => COLUMNS.filter((_, i) => i % workers === worker));
const scratch = mkdtempSync(join(tmpdir(), 'litcal-sweep-'));

function run(columns, index) {
  const report = join(scratch, `${index}.json`);
  const env = {
    ...process.env,
    CPL_DB: resolve(database),
    LITCAL_EXPECTED: resolve(expected),
    LITCAL_COLUMNS: columns.join(','),
    LITCAL_REPORT: report,
    ...(from ? { LITCAL_FROM: from } : {}),
    ...(to ? { LITCAL_TO: to } : {}),
  };
  return new Promise((done) => {
    const jest = spawn('npx', ['jest', '__tests__/liturgy/litcalSweep.test.js'], { env, stdio: 'ignore' });
    jest.on('close', () => {
      console.log(`${columns.join(' ')}: done`);
      done(JSON.parse(readFileSync(report, 'utf8')));
    });
  });
}

const started = Date.now();
console.log(`${workers} Jest processes over ${COLUMNS.length} places${from ? `, ${from}-${to ?? from}` : ''}…`);
const reports = await Promise.all(groups.map(run));
const differences = reports.flatMap((report) => report.differences);
differences.sort((a, b) => a.date.localeCompare(b.date) || COLUMNS.indexOf(a.column) - COLUMNS.indexOf(b.column));

const out = join(dirname(resolve(expected)), 'sweep.json');
writeFileSync(out, JSON.stringify({ litcal: reports[0]?.litcal, differences }, null, 1));

// The same difference in several places and days is one line
const lines = new Map();
for (const d of differences) {
  const key = `${d.letter} ${d.ids.join('+') || '—'} → «${d.shown}»`;
  const line = lines.get(key) ?? { cells: 0, columns: new Set(), dates: new Set() };
  line.cells++;
  line.columns.add(d.column);
  line.dates.add(d.date);
  lines.set(key, line);
}
const minutes = ((Date.now() - started) / 60000).toFixed(1);
console.log(
  `\n${differences.length} days and places do not show litcal's celebration (${minutes} min). All of them in ${out}.`,
);
for (const [key, line] of [...lines].sort((a, b) => b[1].cells - a[1].cells)) {
  const dates = [...line.dates].sort();
  console.log(
    `- ${line.cells}: ${key} · ${[...line.columns].join(' ')} · ${dates.slice(0, 4).join(', ')}${dates.length > 4 ? ` and ${dates.length - 4} more` : ''}`,
  );
}

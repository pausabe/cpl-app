// Runs __tests__/screens/speechSweep.test.js over a range of days, one Jest per stretch of days at once,
// and joins what they found: every piece of audio the voice will need, and which days need each one.
// The audio generator (scripts/audio/) makes and uploads the pieces from here.
//
//   node scripts/speechSweep.mjs <output folder> <first day YYYY-MM-DD> <number of days>
//
// It writes pieces.json ({ key: { voice, text, firstDay } }, the order is the order of the days) and
// days.json ({ day: [keys] }).
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { availableParallelism, totalmem } from 'node:os';
import { join, resolve } from 'node:path';

const [outDir, from, count] = process.argv.slice(2);
if (!outDir || !from || !count) {
  console.error('Usage: node scripts/speechSweep.mjs <output folder> <first day YYYY-MM-DD> <number of days>');
  process.exit(1);
}
const days = parseInt(count, 10);
mkdirSync(resolve(outDir), { recursive: true });

// A Jest of this sweep stays under 2 GB; leave room for the rest of the Mac
const MEMORY_PER_JEST = 2 * 1024 ** 3;
const workers = Math.max(1, Math.min(availableParallelism() - 1, Math.floor(totalmem() / MEMORY_PER_JEST), days));
const per = Math.ceil(days / workers);

const dayAfter = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  const p = (x) => String(x).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
};

function run(index) {
  const first = index * per;
  const n = Math.min(per, days - first);
  const file = join(resolve(outDir), `part-${index}.jsonl`);
  const env = {
    ...process.env,
    SPEECH_SWEEP_OUT: file,
    SPEECH_SWEEP_FROM: dayAfter(from, first),
    SPEECH_SWEEP_DAYS: String(n),
  };
  return new Promise((done, fail) => {
    const jest = spawn('npx', ['jest', '__tests__/screens/speechSweep.test.js', '--silent'], { env, stdio: 'inherit' });
    jest.on('exit', (code) => (code === 0 ? done(file) : fail(new Error(`stretch ${index} failed (${code})`))));
  });
}

console.log(`${days} days from ${from}, in ${workers} stretches of ${per}`);
const files = await Promise.all(Array.from({ length: Math.ceil(days / per) }, (_, i) => run(i)));

const pieces = {};
const byDay = {};
const errors = [];
const lines = files.flatMap((file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line)),
);
lines.sort((a, b) => a.day.localeCompare(b.day));
for (const { day, pieces: needed, errors: dayErrors } of lines) {
  byDay[day] = needed.map((p) => p.key);
  for (const p of needed) if (!pieces[p.key]) pieces[p.key] = { voice: p.voice, text: p.text, firstDay: day };
  for (const e of dayErrors) errors.push(`${day} ${e}`);
}
writeFileSync(join(resolve(outDir), 'pieces.json'), JSON.stringify(pieces));
writeFileSync(join(resolve(outDir), 'days.json'), JSON.stringify(byDay));
const chars = Object.values(pieces).reduce((sum, p) => sum + p.text.length, 0);
console.log(`${Object.keys(pieces).length} pieces, ${chars} characters, ${lines.length} days, ${errors.length} errors`);
for (const e of errors.slice(0, 20)) console.log(`  ${e}`);

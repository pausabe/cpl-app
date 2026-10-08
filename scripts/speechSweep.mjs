// Runs __tests__/screens/speechSweep.test.js over a range of days, in blocks of days, a few Jests at a
// time, and joins what they found: every piece of audio the voice will need, and which days need each
// one. The audio generator (scripts/audio/) makes and uploads the pieces from here.
//
//   node scripts/speechSweep.mjs <output folder> <first day YYYY-MM-DD> <number of days>
//
// Each block is a Jest of its own: one Jest that goes through hundreds of days grows until it runs
// out of memory. It can be stopped and run again: the days already in the output folder are not
// opened again. At the end the long pieces of blocks made before they were cut are cut the way the
// app cuts them. It writes pieces.json ({ key: { voice, text, firstDay } }) and days.json.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { availableParallelism, totalmem } from 'node:os';
import { join, resolve } from 'node:path';

const [outDir, from, count] = process.argv.slice(2);
if (!outDir || !from || !count) {
  console.error('Usage: node scripts/speechSweep.mjs <output folder> <first day YYYY-MM-DD> <number of days>');
  process.exit(1);
}
const out = resolve(outDir);
mkdirSync(out, { recursive: true });

const BLOCK_DAYS = 30;
const MEMORY_PER_JEST = 3 * 1024 ** 3;
const workers = Math.max(1, Math.min(availableParallelism() - 2, Math.floor(totalmem() / MEMORY_PER_JEST)));

const dayAfter = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + n);
  const p = (x) => String(x).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
};

const jsonLines = () =>
  readdirSync(out)
    .filter((f) => f.endsWith('.jsonl'))
    .flatMap((f) =>
      readFileSync(join(out, f), 'utf8')
        .split('\n')
        .filter(Boolean)
        .flatMap((line) => {
          try {
            return [JSON.parse(line)];
          } catch {
            return [];
          }
        }),
    );

const done = new Set(jsonLines().map((d) => d.day));
const days = Array.from({ length: parseInt(count, 10) }, (_, i) => dayAfter(from, i)).filter((d) => !done.has(d));
const blocks = [];
for (const day of days) {
  const last = blocks[blocks.length - 1];
  if (last && last.length < BLOCK_DAYS && dayAfter(last[last.length - 1], 1) === day) last.push(day);
  else blocks.push([day]);
}

function jest(env, args = []) {
  return new Promise((finish) => {
    const child = spawn('npx', ['jest', '__tests__/screens/speechSweep.test.js', '--silent', ...args], {
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=3072', ...env },
      stdio: ['ignore', 'ignore', 'inherit'],
    });
    child.on('exit', (code) => finish(code === 0));
  });
}

console.log(`${done.size} days already done; ${days.length} to go, in ${blocks.length} blocks, ${workers} at a time`);
let next = 0;
const failed = [];
await Promise.all(
  Array.from({ length: workers }, async () => {
    while (next < blocks.length) {
      const block = blocks[next++];
      const ok = await jest({
        SPEECH_SWEEP_OUT: join(out, `block-${block[0]}.jsonl`),
        SPEECH_SWEEP_FROM: block[0],
        SPEECH_SWEEP_DAYS: String(block.length),
      });
      if (!ok) failed.push(block[0]);
      console.log(`${block[0]} (${block.length} days) ${ok ? 'done' : 'FAILED'}`);
    }
  }),
);

const pieces = {};
const byDay = {};
const errors = [];
const lines = jsonLines().sort((a, b) => a.day.localeCompare(b.day));
for (const { day, pieces: needed, errors: dayErrors } of lines) {
  byDay[day] = needed.map((p) => p.key);
  for (const p of needed) if (!pieces[p.key]) pieces[p.key] = { voice: p.voice, text: p.text, firstDay: day };
  for (const e of dayErrors) errors.push(`${day} ${e}`);
}
const raw = join(out, 'pieces-uncut.json');
writeFileSync(raw, JSON.stringify(pieces));
writeFileSync(join(out, 'days.json'), JSON.stringify(byDay));
// The long pieces cut as the app cuts them (blocks made before that leave them whole)
const cut = await jest({ SPEECH_SPLIT_IN: raw, SPEECH_SPLIT_OUT: join(out, 'pieces.json') }, ['-t', 'long pieces']);
if (!cut || !existsSync(join(out, 'pieces.json'))) console.log('Could not cut the long pieces');
const final = JSON.parse(readFileSync(join(out, 'pieces.json'), 'utf8'));
const chars = Object.values(final).reduce((sum, p) => sum + p.text.length, 0);
console.log(`${Object.keys(final).length} pieces, ${chars} characters, ${lines.length} days, ${errors.length} errors`);
for (const e of errors.slice(0, 20)) console.log(`  ${e}`);
if (failed.length) console.log(`Blocks that failed (run it again to retry them): ${failed.join(', ')}`);

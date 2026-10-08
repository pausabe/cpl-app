// Tells cpl-api which pieces of audio the days ahead will need, from what scripts/speechSweep.mjs
// found: those it does not have go to its queue, and its cron makes them with Azure's free resource,
// a few thousand characters a day, never paying anything. It also tells it which pieces each day
// needs, so that a phone can download a whole day beforehand (Configuració, «Baixa l'àudio d'avui»).
// The workflow audio.yml runs it every week and when a database is published.
//
//   node scripts/audio/plan.mjs --sweep <folder> [--database-version <n>] [--redo <keys.json>]
//
//   --sweep             the folder of speechSweep.mjs (pieces.json and days.json)
//   --database-version  the publication the sweep was made with, for the record of cpl-cloud
//   --redo              names of pieces to make again even if they are there (a word of the lexicon
//                       said better now): the phones that have them let them go
//
// CPL_AUDIO_PLAN_TOKEN is what cpl-api asks of whoever does this (a secret of the workflow).
// It prints only how many: the logs of a public repository are read by anyone.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const sweep = opt('sweep');
const token = process.env.CPL_AUDIO_PLAN_TOKEN;
if (!sweep || !token) {
  console.error('Usage: CPL_AUDIO_PLAN_TOKEN=… node scripts/audio/plan.mjs --sweep <folder> [options]');
  process.exit(1);
}
const API_URL = process.env.EXPO_PUBLIC_CPL_API_URL ?? 'https://cpl-api.canmartorell.dev';
const databaseVersion = opt('database-version') ? parseInt(opt('database-version'), 10) : null;
const redo = new Set(opt('redo') ? JSON.parse(readFileSync(opt('redo'), 'utf8')) : []);

const pieces = JSON.parse(readFileSync(join(sweep, 'pieces.json'), 'utf8'));
const days = JSON.parse(readFileSync(join(sweep, 'days.json'), 'utf8'));

// As many at once as cpl-api takes (src/shared/audioPlan.ts)
const PIECES_AT_ONCE = 500;
const DAYS_AT_ONCE = 62;

async function post(path, body) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (response.ok) return response.json();
      // A refusal is not going to change by trying again
      if (response.status < 500 || attempt >= 4) throw new Error(`cpl-api ${response.status} on ${path}`);
    } catch (error) {
      if (attempt >= 4 || /cpl-api 4/.test(String(error))) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000 * (attempt + 1)));
  }
}

// The nearest days first: if something stops halfway, what is needed soonest is already asked for
const wanted = Object.entries(pieces)
  .map(([key, p]) => ({
    key,
    voice: p.voice,
    text: p.text,
    firstDay: p.firstDay,
    ...(redo.has(key) ? { redo: true } : {}),
  }))
  .sort((a, b) => a.firstDay.localeCompare(b.firstDay));
const missingRedo = [...redo].filter((key) => !pieces[key]);
if (missingRedo.length) console.log(`${missingRedo.length} pieces to redo are not in the sweep: left out`);

let known = 0;
let queued = 0;
let queuedChars = 0;
for (let at = 0; at < wanted.length; at += PIECES_AT_ONCE) {
  const outcome = await post('/v1/audio/plan', { pieces: wanted.slice(at, at + PIECES_AT_ONCE) });
  known += outcome.known;
  queued += outcome.queued;
  queuedChars += outcome.queuedChars;
}
const dayNames = Object.keys(days).sort();
for (let at = 0; at < dayNames.length; at += DAYS_AT_ONCE) {
  const chunk = Object.fromEntries(dayNames.slice(at, at + DAYS_AT_ONCE).map((day) => [day, days[day]]));
  await post('/v1/audio/plan', { days: chunk });
}
await post('/v1/audio/plan/done', {
  databaseVersion,
  firstDay: dayNames[0] ?? null,
  lastDay: dayNames[dayNames.length - 1] ?? null,
  pieces: wanted.length,
  queued,
  queuedChars,
});

console.log(
  `${wanted.length} pieces for ${dayNames.length} days (${dayNames[0]} to ${dayNames[dayNames.length - 1]}): ` +
    `${known} already there, ${queued} to make (${queuedChars} characters)` +
    (redo.size ? `, ${redo.size} of them to redo` : ''),
);

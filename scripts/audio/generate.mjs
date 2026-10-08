// Makes the audio of the pieces the voice needs and uploads them to R2, where the phones get them
// from (cpl-cloud). The pieces come from scripts/speechSweep.mjs: each one is a voice and some words,
// and its name (key) is the SHA-256 of both, the same the phone works out from the screen.
//
//   node scripts/audio/generate.mjs --pieces <pieces.json> --cache <folder> [options]
//
//   --env <file>          Azure Speech key and region (default ~/.config/cpl/azure-speech.env)
//   --lexicon <file>      the words whose stress the voices get wrong (default scripts/audio/lexicon.json)
//   --until <YYYY-MM-DD>  only the pieces first needed up to that day
//   --max-chars <n>       stop after sending this many characters to Azure (never more)
//   --bucket <name>       R2 bucket (default cpl-cloud-audio); --no-upload to keep them only here
//   --wrangler <path>     wrangler of cpl-cloud (default ../cpl-cloud/node_modules/.bin/wrangler)
//   --concurrency <n>     pieces made at once (default 8; the free F0 resource takes 1)
//
// It can be stopped and run again: what is in the cache folder is not made again, and what was
// uploaded (uploaded.jsonl) is not uploaded again. It stops by itself if Azure says no (the credit or
// the free characters of the month are over): nothing is ever paid for, it just stops.
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const piecesFile = opt('pieces');
const cache = opt('cache');
if (!piecesFile || !cache) {
  console.error('Usage: node scripts/audio/generate.mjs --pieces <pieces.json> --cache <folder> [options]');
  process.exit(1);
}
const envFile = opt('env', join(homedir(), '.config/cpl/azure-speech.env'));
const lexiconFile = opt('lexicon', join(here, 'lexicon.json'));
const until = opt('until', '9999-12-31');
const maxChars = parseInt(opt('max-chars', '0'), 10) || Infinity;
const bucket = opt('bucket', 'cpl-cloud-audio');
const upload = !flag('no-upload');
const wrangler = opt('wrangler', resolve(here, '../../../cpl-cloud/node_modules/.bin/wrangler'));
const concurrency = parseInt(opt('concurrency', '8'), 10);
const uploadConcurrency = 16;

const env = Object.fromEntries(
  readFileSync(envFile, 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
);
const URL = `https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
const lexicon = existsSync(lexiconFile) ? JSON.parse(readFileSync(lexiconFile, 'utf8')) : {};

mkdirSync(resolve(cache), { recursive: true });
const uploadedLog = join(resolve(cache), 'uploaded.jsonl');
const uploaded = new Set(
  existsSync(uploadedLog)
    ? readFileSync(uploadedLog, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line).key)
    : [],
);

const escape = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// A capital «I» on its own is the conjunction at the start of a sentence, but Azure reads it as the
// Roman numeral: «Primera a tu, infant». In small letters it says «i». cpl-cloud does the same.
export const lowerI = (text) => text.replace(/(?<![\wÀ-ÿ·’'])I(?![\wÀ-ÿ·’'])/g, 'i');

// The words, with the lexicon's ones wrapped in their pronunciation; and which ones they were
function bodyOf(text) {
  let body = escape(lowerI(text));
  const used = [];
  for (const [word, ipa] of Object.entries(lexicon)) {
    const pattern = new RegExp(`(?<![\\wÀ-ÿ])(${word})(?![\\wÀ-ÿ])`, 'gi');
    if (pattern.test(body)) {
      used.push(word);
      body = body.replace(pattern, (m) => `<phoneme alphabet='ipa' ph='${ipa}'>${m}</phoneme>`);
    }
  }
  return { body, used };
}

const all = JSON.parse(readFileSync(piecesFile, 'utf8'));
const todo = Object.entries(all)
  .filter(([, p]) => p.firstDay <= until)
  .sort((a, b) => a[1].firstDay.localeCompare(b[1].firstDay));

let charsSent = 0;
let made = 0;
let failed = 0;
let stopped = null;
const uploads = [];
let uploadedNow = 0;
let bytesUploaded = 0;

async function synthesize(key, piece) {
  const file = join(resolve(cache), `${key}.mp3`);
  if (existsSync(file)) return file;
  const { body, used } = bodyOf(piece.text);
  // The characters are counted before asking, so that pieces made at once never go over the limit
  if (charsSent + body.length > maxChars) {
    stopped = stopped ?? `the limit of ${maxChars} characters`;
    return null;
  }
  charsSent += body.length;
  const ssml = `<speak version='1.0' xml:lang='ca-ES'><voice name='${piece.voice}'>${body}</voice></speak>`;
  for (let attempt = 0; attempt < 6 && !stopped; attempt++) {
    let response;
    try {
      response = await fetch(URL, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': env.AZURE_SPEECH_KEY,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'cpl-audio-generator',
        },
        body: ssml,
      });
    } catch {
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      continue;
    }
    if (response.ok) {
      const audio = Buffer.from(await response.arrayBuffer());
      writeFileSync(`${file}.tmp`, audio);
      renameSync(`${file}.tmp`, file);
      made++;
      if (used.length) appendFileSync(join(resolve(cache), 'lexicon-used.jsonl'), JSON.stringify({ key, used }) + '\n');
      return file;
    }
    // Out of credit, out of the month's free characters or a bad key: stop, never insist
    if (response.status === 401 || response.status === 403) {
      stopped = `Azure said ${response.status}`;
      charsSent -= body.length;
      return null;
    }
    await new Promise((r) => setTimeout(r, response.status === 429 ? 20000 : 3000 * (attempt + 1)));
  }
  failed++;
  charsSent -= body.length;
  return null;
}

function put(key, file) {
  return new Promise((done) => {
    const child = spawn(
      wrangler,
      ['r2', 'object', 'put', `${bucket}/a/${key}.mp3`, '--file', file, '--content-type', 'audio/mpeg', '--remote'],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let err = '';
    child.stderr.on('data', (d) => (err += d));
    child.on('exit', (code) => done(code === 0 ? null : err.slice(-300)));
  });
}

async function uploader() {
  while (true) {
    const next = uploads.shift();
    if (!next) {
      if (synthesisDone) return;
      await new Promise((r) => setTimeout(r, 500));
      continue;
    }
    const [key, file] = next;
    let error = await put(key, file);
    if (error) error = await put(key, file);
    if (error) {
      console.error(`upload failed ${key}: ${error}`);
      continue;
    }
    const bytes = readFileSync(file).length;
    appendFileSync(uploadedLog, JSON.stringify({ key, bytes }) + '\n');
    uploaded.add(key);
    uploadedNow++;
    bytesUploaded += bytes;
  }
}

let synthesisDone = false;
let index = 0;
async function maker() {
  while (index < todo.length && !stopped) {
    const [key, piece] = todo[index++];
    const file = await synthesize(key, piece);
    if (file && upload && !uploaded.has(key)) uploads.push([key, file]);
    if ((made + 1) % 200 === 0)
      console.log(
        `${index}/${todo.length} pieces · ${made} made, ${charsSent} characters · ${uploadedNow} uploaded (${(bytesUploaded / 1e6).toFixed(1)} MB) · up to ${piece.firstDay}`,
      );
  }
}

console.log(`${todo.length} pieces up to ${until}; ${uploaded.size} already uploaded`);
const uploaders = upload ? Array.from({ length: uploadConcurrency }, uploader) : [];
await Promise.all(Array.from({ length: concurrency }, maker));
synthesisDone = true;
await Promise.all(uploaders);

const summary = {
  finished: new Date().toISOString(),
  pieces: todo.length,
  made,
  failed,
  charactersSent: charsSent,
  uploaded: uploadedNow,
  bytesUploaded,
  stoppedBecause: stopped,
};
appendFileSync(join(resolve(cache), 'runs.jsonl'), JSON.stringify(summary) + '\n');
console.log(JSON.stringify(summary, null, 1));

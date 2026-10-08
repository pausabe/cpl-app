// Makes the audio of the pieces the voice needs and uploads them to R2, where the phones get them
// from (cpl-cloud). The pieces come from scripts/speechSweep.mjs: each one is a voice and some words,
// and its name (key) is the SHA-256 of both, the same the phone works out from the screen.
//
//   node scripts/audio/generate.mjs --pieces <pieces.json> --cache <folder> [options]
//
//   --env <file>          Azure Speech key and region (default ~/.config/cpl/azure-speech.env)
//   --lexicon <file>      the words whose stress the voices get wrong (default scripts/audio/lexicon.json)
//   --as-written <file>   the words the voices take for abbreviations before a full stop
//                         (default scripts/audio/asWritten.json)
//   --until <YYYY-MM-DD>  only the pieces first needed up to that day
//   --max-chars <n>       stop after sending this many characters to Azure (never more)
//   --bucket <name>       R2 bucket (default cpl-cloud-audio); --no-upload to keep them only here
//   --wrangler <path>     wrangler of cpl-cloud (default ../cpl-cloud/node_modules/.bin/wrangler)
//   --concurrency <n>     pieces made at once (default 8; the free F0 resource takes 1)
//   --redo <keys.json>    pieces to make again although they are there: the words are the same but
//                         they are said better now (the lexicon, an abbreviation). cpl-cloud is told,
//                         and the phones that have them let them go (audio_changes).
//   --register-all        tell cpl-cloud of every piece uploaded so far, not only of this run's
//
// It can be stopped and run again: what is in the cache folder is not made again, and what was
// uploaded (uploaded.jsonl) is not uploaded again. It stops by itself if Azure says no (the credit or
// the free characters of the month are over): nothing is ever paid for, it just stops. At the end it
// writes in cpl-cloud's database which pieces are in the bucket (audio_pieces), so that its queue
// knows what is missing (scripts/audio/plan.mjs).
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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
const asWrittenFile = opt('as-written', join(here, 'asWritten.json'));
const until = opt('until', '9999-12-31');
const maxChars = parseInt(opt('max-chars', '0'), 10) || Infinity;
const bucket = opt('bucket', 'cpl-cloud-audio');
const upload = !flag('no-upload');
const wrangler = opt('wrangler', resolve(here, '../../../cpl-cloud/node_modules/.bin/wrangler'));
const concurrency = parseInt(opt('concurrency', '8'), 10);
const redo = new Set(opt('redo') ? JSON.parse(readFileSync(opt('redo'), 'utf8')) : []);
const registerAll = flag('register-all');
// Cloudflare's API slows down whoever sends too much at once (1,200 requests in 5 minutes)
const uploadConcurrency = 8;

const env = Object.fromEntries(
  readFileSync(envFile, 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
);
const URL = `https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
const lexicon = existsSync(lexiconFile) ? JSON.parse(readFileSync(lexiconFile, 'utf8')) : {};
const written = existsSync(asWrittenFile) ? JSON.parse(readFileSync(asWrittenFile, 'utf8')) : [];
const both = written.filter((w) => Object.keys(lexicon).some((l) => l.toLowerCase() === w.toLowerCase()));
if (both.length) throw new Error(`In the lexicon and said as written at once: ${both.join(', ')}`);

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
// The pieces to redo are made and uploaded again: away from the cache and from what was uploaded
for (const key of redo) {
  const file = join(resolve(cache), `${key}.mp3`);
  if (existsSync(file)) rmSync(file);
  uploaded.delete(key);
}

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

// Words Azure takes for abbreviations when a full stop follows them («vol.» → «volum», «cos.» →
// «cosinus», «part.» → «particular»), found by saying every word that ends a sentence and listening
// back (October 2026): wrapped in <sub>, they are said as they are written. cpl-cloud does the same.
export const sayAsWritten = (body, words = written) =>
  words.length
    ? body.replace(
        new RegExp(`(?<![\\wÀ-ÿ·\u00AD])(${words.join('|')})(?=\\.)`, 'gi'),
        (m) => `<sub alias='${m}'>${m}</sub>`,
      )
    : body;

// The words, with the lexicon's ones wrapped in their pronunciation; and which ones they were
function bodyOf(text) {
  let body = sayAsWritten(escape(lowerI(text)));
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
  .filter(([key, p]) => p.firstDay <= until || redo.has(key))
  .sort((a, b) => a[1].firstDay.localeCompare(b[1].firstDay));

let charsSent = 0;
let made = 0;
let failed = 0;
let stopped = null;
const uploads = [];
let uploadedNow = 0;
let bytesUploaded = 0;
const uploadedThisRun = new Map();

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
    // Told to slow down, it waits longer each time; anything else is tried once more
    for (let attempt = 0; error && attempt < 5; attempt++) {
      const throttled = /throttl|429|rate limit/i.test(error);
      if (!throttled && attempt > 0) break;
      await new Promise((r) => setTimeout(r, throttled ? 15000 * 2 ** attempt : 2000));
      error = await put(key, file);
    }
    if (error) {
      console.error(`upload failed ${key}: ${error}`);
      continue;
    }
    const bytes = readFileSync(file).length;
    appendFileSync(uploadedLog, JSON.stringify({ key, bytes }) + '\n');
    uploaded.add(key);
    uploadedNow++;
    bytesUploaded += bytes;
    uploadedThisRun.set(key, bytes);
  }
}

let synthesisDone = false;
let index = 0;
let reported = 0;
async function maker() {
  while (index < todo.length && !stopped) {
    const [key, piece] = todo[index++];
    const file = await synthesize(key, piece);
    if (file && upload && !uploaded.has(key)) uploads.push([key, file]);
    // Every 200 pieces made, once (while none is made, it says nothing)
    if (file && made > reported && made % 200 === 0) {
      reported = made;
      console.log(
        `${index}/${todo.length} pieces · ${made} made, ${charsSent} characters · ${uploadedNow} uploaded (${(bytesUploaded / 1e6).toFixed(1)} MB) · up to ${piece.firstDay}`,
      );
    }
  }
}

// cpl-cloud makes the missing pieces on the spot and from its queue: the same lexicon and the same words
// said as written as here
if (upload) {
  for (const [name, file] of [
    ['lexicon.json', lexiconFile],
    ['as-written.json', asWrittenFile],
  ]) {
    if (!existsSync(file)) continue;
    const error = await new Promise((done) => {
      const child = spawn(
        wrangler,
        [
          'r2',
          'object',
          'put',
          `${bucket}/config/${name}`,
          '--file',
          file,
          '--content-type',
          'application/json',
          '--remote',
        ],
        { stdio: ['ignore', 'ignore', 'pipe'] },
      );
      let err = '';
      child.stderr.on('data', (d) => (err += d));
      child.on('exit', (code) => done(code === 0 ? null : err.slice(-300)));
    });
    if (error) console.error(`could not upload ${name}: ${error}`);
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
// --- What cpl-cloud is told ---------------------------------------------------------------------

function d1(args) {
  return new Promise((done) => {
    const child = spawn(wrangler, ['d1', 'execute', 'cpl-cloud', '--remote', '-c', 'wrangler.admin.jsonc', ...args], {
      cwd: resolve(dirname(wrangler), '../..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('exit', (code) => done(code === 0 ? out : null));
  });
}

const sqlText = (s) => `'${String(s).replace(/'/g, "''")}'`;

// The pieces in the bucket, in rows of a few hundred at a time
async function register(entries) {
  const now = new Date().toISOString();
  for (let at = 0; at < entries.length; at += 2000) {
    const statements = [];
    const chunk = entries.slice(at, at + 2000);
    for (let i = 0; i < chunk.length; i += 400) {
      const values = chunk
        .slice(i, i + 400)
        .map(([key, bytes]) => `(${sqlText(key)}, ${all[key]?.text.length ?? 0}, ${bytes}, ${sqlText(now)})`)
        .join(',\n');
      statements.push(
        `INSERT INTO audio_pieces (key, chars, bytes, made_at) VALUES\n${values}\n` +
          'ON CONFLICT(key) DO UPDATE SET chars = excluded.chars, bytes = excluded.bytes, made_at = excluded.made_at;',
      );
    }
    const file = join(resolve(cache), 'register.sql');
    writeFileSync(file, statements.join('\n'));
    if ((await d1(['--file', file, '-y'])) === null) return false;
  }
  return true;
}

// Every piece once, with its last size (a piece made again is in uploaded.jsonl twice)
const toRegister = registerAll
  ? [
      ...new Map(
        readFileSync(uploadedLog, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line))
          .map(({ key, bytes }) => [key, bytes]),
      ),
    ]
  : [...uploadedThisRun];
summary.registered = toRegister.length && upload ? ((await register(toRegister)) ? toRegister.length : 'failed') : 0;

// The pieces remade with another sound: a new version, which the phones see the next time they ask
const redone = [...redo].filter((key) => uploadedThisRun.has(key));
if (redone.length) {
  const answer = await d1(['--json', '--command', 'SELECT COALESCE(MAX(version), 0) AS v FROM audio_changes']);
  const version = answer ? JSON.parse(answer.slice(answer.indexOf('[')))[0].results[0].v + 1 : null;
  if (version) {
    const statements = [];
    for (let i = 0; i < redone.length; i += 400) {
      const values = redone
        .slice(i, i + 400)
        .map((key) => `(${version}, ${sqlText(key)})`)
        .join(', ');
      statements.push(`INSERT OR IGNORE INTO audio_changes (version, key) VALUES ${values};`);
    }
    const file = join(resolve(cache), 'changes.sql');
    writeFileSync(file, statements.join('\n'));
    summary.changesVersion = (await d1(['--file', file, '-y'])) === null ? 'failed' : version;
  } else {
    summary.changesVersion = 'failed';
  }
  summary.redone = redone.length;
}

appendFileSync(join(resolve(cache), 'runs.jsonl'), JSON.stringify(summary) + '\n');
console.log(JSON.stringify(summary, null, 1));

// Golden files: what the app resolved on a known-good build, kept to compare every later
// build against. They live in __tests__/golden/ (gitignored) because they are made of the
// texts in cpl-app.db, which is not in git either, and they only mean something for the
// database they were made from, so each file records that database's sha256.
//
// UPDATE_GOLDEN=1 rewrites them. Do that only on a build you have checked by hand.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { DB_PATH } = require('./mockDatabaseManager');

const GOLDEN_DIR = path.resolve(__dirname, '../golden');

const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');
const databaseSha = () => sha256(fs.readFileSync(DB_PATH));

function readGolden(name) {
  const file = path.join(GOLDEN_DIR, `${name}.json`);
  if (process.env.UPDATE_GOLDEN || !fs.existsSync(file)) return null;
  const golden = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (golden.databaseSha256 !== databaseSha()) {
    throw new Error(
      `${name}.json was made from another cpl-app.db. Compare against it only with the same ` +
      'database; to start over from this one, check the app by hand and run UPDATE_GOLDEN=1.');
  }
  return golden.data;
}

function writeGolden(name, data) {
  fs.mkdirSync(GOLDEN_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(GOLDEN_DIR, `${name}.json`),
    JSON.stringify({ databaseSha256: databaseSha(), createdAt: new Date().toISOString(), data }, null, 1));
}

// Leaf-by-leaf difference, so a failure says "Laudes.EvangelicalAntiphon" and not just "differs".
function diffPaths(expected, actual, prefix = '', out = []) {
  if (expected === actual) return out;
  const isObj = (v) => v !== null && typeof v === 'object';
  if (!isObj(expected) || !isObj(actual)) {
    out.push({ path: prefix, expected, actual });
    return out;
  }
  for (const key of new Set([...Object.keys(expected), ...Object.keys(actual)])) {
    diffPaths(expected[key], actual[key], prefix ? `${prefix}.${key}` : key, out);
  }
  return out;
}

module.exports = { sha256, readGolden, writeGolden, diffPaths };

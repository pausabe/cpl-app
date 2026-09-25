// The database the app ships with is 16 MB and is not in the repository: it comes from the
// publishing website, the same one the phones ask. Every build, and every test run on a clean
// checkout, starts here.
//
// What comes down is the newest publication for the structure this code knows (the compatibility
// key in cpl-app.db.json), and never one older than the version written there: a build must not
// ship texts the phones have already replaced. The two files are rewritten together, so the app
// always knows which version it carries.
//
// CPL_DATABASE_VERSION asks for one exact publication instead of the newest one. The workflow
// builds Android and iOS in parallel, each bringing the database down on its own, so it says here
// which publication the build was checked with: if the CPL publishes a correction in the middle,
// nothing is built with texts that were never announced.

import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATABASE_FILE = join(ROOT, 'src', 'assets', 'db', 'cpl-app.db');
const INFORMATION_FILE = `${DATABASE_FILE}.json`;
const DOWNLOAD_FILE = `${DATABASE_FILE}.download`;

const API_URL = process.env.EXPO_PUBLIC_CPL_API_URL ?? 'https://cpl-api.canmartorell.dev';
const APP_KEY_HEADER = 'X-CPL-App-Key';

// In the workflow it is a secret; on this machine it is the .env the app is built with
function appKey() {
  if (process.env.EXPO_PUBLIC_CPL_APP_KEY) {
    return process.env.EXPO_PUBLIC_CPL_APP_KEY;
  }
  const file = join(ROOT, '.env');
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const [name, ...rest] = line.split('=');
      if (name.trim() === 'EXPO_PUBLIC_CPL_APP_KEY') {
        return rest.join('=').trim();
      }
    }
  }
  throw new Error('No app key: set EXPO_PUBLIC_CPL_APP_KEY or write it in .env');
}

function md5(file) {
  return createHash('md5').update(readFileSync(file)).digest('hex');
}

// null when the website has nothing for this structure: it answers 204
async function publishedDatabase(compat, key) {
  const response = await fetch(`${API_URL}/v1/db/latest?compat=${encodeURIComponent(compat)}`, {
    headers: { [APP_KEY_HEADER]: key },
  });
  if (response.status === 204) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`${API_URL} answered ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  return await response.json();
}

async function download(manifest) {
  const response = await fetch(manifest.url);
  if (!response.ok) {
    throw new Error(`The download answered ${response.status}`);
  }
  rmSync(DOWNLOAD_FILE, { force: true });
  writeFileSync(DOWNLOAD_FILE, Buffer.from(await response.arrayBuffer()));

  // The same checks the app makes before letting a file near the database folder
  const bytes = statSync(DOWNLOAD_FILE).size;
  if (bytes !== manifest.bytes || md5(DOWNLOAD_FILE) !== manifest.md5) {
    rmSync(DOWNLOAD_FILE, { force: true });
    throw new Error(`What came down is not publication ${manifest.version}`);
  }
  renameSync(DOWNLOAD_FILE, DATABASE_FILE);
}

async function main() {
  const bundled = JSON.parse(readFileSync(INFORMATION_FILE, 'utf8'));
  const manifest = await publishedDatabase(bundled.compat, appKey());
  if (!manifest) {
    throw new Error(`The website has no database for ${bundled.compat}: this code cannot be published`);
  }
  if (manifest.compat !== bundled.compat) {
    throw new Error(`The website answered with ${manifest.compat} and this code reads ${bundled.compat}`);
  }
  if (manifest.version < bundled.version) {
    throw new Error(`Publication ${manifest.version} is older than the ${bundled.version} this code was made with`);
  }
  const asked = process.env.CPL_DATABASE_VERSION?.trim();
  if (asked && manifest.version !== Number(asked)) {
    throw new Error(
      `The website already publishes ${manifest.version} and this build started with ${asked}: publish again to carry it`,
    );
  }

  if (existsSync(DATABASE_FILE) && md5(DATABASE_FILE) === manifest.md5) {
    console.log(`Database version ${manifest.version} (${manifest.compat}), already here`);
    return;
  }

  console.log(`Downloading database version ${manifest.version} (${Math.round(manifest.bytes / 1000000)} MB)`);
  await download(manifest);
  const information = {
    version: manifest.version,
    compat: manifest.compat,
    md5: manifest.md5,
    bytes: manifest.bytes,
  };
  writeFileSync(INFORMATION_FILE, `${JSON.stringify(information, null, 2)}\n`);
  console.log(`Database version ${manifest.version} (${manifest.compat})`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

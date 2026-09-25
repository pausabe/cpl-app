// Writes, in TestFlight, what has to be tried in this build. It is what whoever opens TestFlight
// reads before installing it, so it is in Catalan, like everything people read.
//
// It cannot be done when the build is uploaded: Apple spends a while processing it and until that
// is through the build does not exist for the API. This waits for it.

import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';

const API = 'https://api.appstoreconnect.apple.com/v1';
const WAIT_MINUTES = 30;
const SECONDS_BETWEEN_ASKS = 60;
const MAXIMUM_CHARACTERS = 4000;

const keyId = process.env.APP_STORE_CONNECT_KEY_ID;
const issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID;
const privateKey = Buffer.from(process.env.APP_STORE_CONNECT_KEY ?? '', 'base64').toString('utf8');
const bundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER;
const buildNumber = process.env.BUILD_NUMBER;
const notes = (process.env.NOTES ?? '').trim().slice(0, MAXIMUM_CHARACTERS);

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

// Apple wants a signed token, good for a few minutes, on every request
function token() {
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iss: issuerId, iat: now, exp: now + 900, aud: 'appstoreconnect-v1' };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = createSign('sha256').update(unsigned).sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });
  return `${unsigned}.${signature.toString('base64url')}`;
}

async function ask(method, path, body) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${path} answered ${response.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : {};
}

const sleep = (seconds) => new Promise((done) => setTimeout(done, seconds * 1000));

async function application() {
  const { data } = await ask('GET', `/apps?filter[bundleId]=${encodeURIComponent(bundleIdentifier)}&limit=1`);
  if (!data?.length) {
    throw new Error(`App Store Connect does not know ${bundleIdentifier}, or this key cannot see it`);
  }
  return data[0].id;
}

// Until Apple is through processing it, the build is not there or is not ready to be written to
async function processedBuild(applicationId) {
  const until = Date.now() + WAIT_MINUTES * 60 * 1000;
  while (Date.now() < until) {
    const { data } = await ask(
      'GET',
      `/builds?filter[app]=${applicationId}&filter[version]=${encodeURIComponent(buildNumber)}&limit=1`,
    );
    const build = data?.[0];
    const state = build?.attributes?.processingState;
    if (state === 'VALID') {
      return build.id;
    }
    if (state === 'FAILED' || state === 'INVALID') {
      throw new Error(`Apple did not accept build ${buildNumber}: ${state}`);
    }
    console.log(`Build ${buildNumber}: ${state ?? 'not there yet'}`);
    await sleep(SECONDS_BETWEEN_ASKS);
  }
  return null;
}

async function main() {
  if (!keyId || !issuerId || !privateKey || !bundleIdentifier || !buildNumber) {
    throw new Error('Needs the App Store Connect key, the bundle identifier and the build number');
  }
  if (!notes) {
    console.log('Nothing to say about this build');
    return;
  }

  const buildId = await processedBuild(await application());
  if (!buildId) {
    // The app is in TestFlight either way: this is only the text next to it
    console.log(
      `::warning::Build ${buildNumber} is still being processed after ${WAIT_MINUTES} minutes: the text of what to try has to be written by hand`,
    );
    return;
  }

  // Apple makes one of these for each language the app has; all of them say the same thing here
  const { data: languages } = await ask('GET', `/builds/${buildId}/betaBuildLocalizations`);
  if (languages?.length) {
    for (const language of languages) {
      await ask('PATCH', `/betaBuildLocalizations/${language.id}`, {
        data: { type: 'betaBuildLocalizations', id: language.id, attributes: { whatsToTest: notes } },
      });
      console.log(`Written in ${language.attributes.locale}`);
    }
    return;
  }

  await ask('POST', '/betaBuildLocalizations', {
    data: {
      type: 'betaBuildLocalizations',
      attributes: { locale: 'ca', whatsToTest: notes },
      relationships: { build: { data: { type: 'builds', id: buildId } } },
    },
  });
  console.log('Written in ca');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

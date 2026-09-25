// The number the stores order the builds by. It is written into app.json before `expo prebuild`,
// which is what makes the native projects: this way the same number reaches Android and iOS and
// there is nothing to patch afterwards in build.gradle or Info.plist.
//
// The version people read (9.0.0) is the one in app.json, which is decided in the repository. The
// build number is not: it is the run number of the workflow plus a base, so it only ever grows,
// whatever happens to the versions in between. The stores refuse a build number they have already
// seen, and that is the only thing they ask of it.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIGURATION_FILE = join(ROOT, 'app.json');

const [build, version] = process.argv.slice(2);
const buildNumber = Number(build);
if (!Number.isInteger(buildNumber) || buildNumber <= 0) {
  console.error('Usage: node scripts/setBuildVersion.mjs <build number> [version]');
  process.exit(1);
}

const configuration = JSON.parse(readFileSync(CONFIGURATION_FILE, 'utf8'));
if (version) {
  configuration.expo.version = version;
}
configuration.expo.ios.buildNumber = String(buildNumber);
configuration.expo.android.versionCode = buildNumber;

writeFileSync(CONFIGURATION_FILE, `${JSON.stringify(configuration, null, 2)}\n`);
console.log(`Version ${configuration.expo.version}, build ${buildNumber}`);

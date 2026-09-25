// `expo prebuild` writes an android/ that signs the release with the debug key, the one every
// Expo app carries: Google Play does not take it. This puts the real key in, reading it from the
// environment so nothing of it is written to a file that could be kept.
//
// android/ is generated and gitignored, so this only ever touches what the build just made. If
// the Expo template changes and the pieces are not where they are looked for, it stops the build
// instead of letting an app signed with the debug key reach the store.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_FILE = join(ROOT, 'android', 'app', 'build.gradle');

const RELEASE_CONFIGURATION = `
        release {
            storeFile file(System.getenv("CPL_KEYSTORE_FILE"))
            storePassword System.getenv("CPL_KEYSTORE_PASSWORD")
            keyAlias System.getenv("CPL_KEY_ALIAS")
            keyPassword System.getenv("CPL_KEY_PASSWORD")
        }`;

// The text of a { ... } block, braces included, from where its name starts
function block(source, name, from = 0) {
  const start = source.indexOf(name, from);
  if (start === -1) {
    throw new Error(`build.gradle has no ${name.trim()}`);
  }
  let depth = 0;
  for (let index = source.indexOf('{', start); index < source.length; index += 1) {
    if (source[index] === '{') {
      depth += 1;
    } else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return { start, end: index + 1, text: source.slice(start, index + 1) };
      }
    }
  }
  throw new Error(`The ${name.trim()} block of build.gradle does not close`);
}

function replace(source, part, text) {
  return source.slice(0, part.start) + text + source.slice(part.end);
}

let gradle = readFileSync(BUILD_FILE, 'utf8');

// The key itself, next to the debug one
const configurations = block(gradle, 'signingConfigs {');
if (!configurations.text.includes('release {')) {
  gradle = replace(
    gradle,
    configurations,
    `${configurations.text.slice(0, -1).trimEnd()}\n${RELEASE_CONFIGURATION}\n    }`,
  );
}

// And the release build asking for it instead of the debug one
const types = block(gradle, 'buildTypes {');
const release = block(types.text, 'release {');
if (!release.text.includes('signingConfig signingConfigs.debug')) {
  throw new Error('The release build of build.gradle no longer asks for signingConfigs.debug');
}
const signed = release.text.replace('signingConfig signingConfigs.debug', 'signingConfig signingConfigs.release');
gradle = replace(gradle, types, replace(types.text, release, signed));

writeFileSync(BUILD_FILE, gradle);
console.log('android/app/build.gradle: the release is signed with the upload key');

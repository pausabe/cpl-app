// `expo prebuild` writes an ios/ that signs the way Xcode does on a Mac with somebody logged in:
// it picks the certificate and the profile by itself. On a machine that builds for the store
// there is nobody logged in, so here the project is told exactly which certificate, which team
// and which profile to use.
//
// It is written only into the build settings that name a bundle identifier, which are the app's
// own: the CocoaPods targets have none and must not be given a profile, or they refuse to build.
//
// ios/ is generated and gitignored: this only touches what the build just made.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_FILE = join(ROOT, 'ios', 'CPL.xcodeproj', 'project.pbxproj');

const team = process.env.IOS_TEAM_ID;
const profileName = process.env.IOS_PROFILE_NAME;
const profileUuid = process.env.IOS_PROFILE_UUID;
const bundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER;
if (!team || !profileName || !profileUuid || !bundleIdentifier) {
  console.error('Needs IOS_TEAM_ID, IOS_PROFILE_NAME, IOS_PROFILE_UUID and IOS_BUNDLE_IDENTIFIER');
  process.exit(1);
}

const project = readFileSync(PROJECT_FILE, 'utf8');

// What prebuild wrote has to be the identifier the profile is for, or the build would be signed
// for another app: better to stop here than to have App Store Connect refuse it half an hour later
const identifiers = [...project.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map(([, value]) =>
  value.trim().replace(/^"|"$/g, ''),
);
if (identifiers.length === 0) {
  throw new Error('The Xcode project names no bundle identifier');
}
for (const identifier of identifiers) {
  if (identifier !== bundleIdentifier) {
    throw new Error(`The Xcode project is ${identifier} and the profile is for ${bundleIdentifier}`);
  }
}

// The conditional form as well: prebuild leaves "iPhone Developer" for iphoneos at project level,
// and a setting with a condition wins over the plain one
const signing = [
  'CODE_SIGN_STYLE = Manual;',
  'CODE_SIGN_IDENTITY = "Apple Distribution";',
  '"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "Apple Distribution";',
  `DEVELOPMENT_TEAM = ${team};`,
  `PROVISIONING_PROFILE = "${profileUuid}";`,
  `PROVISIONING_PROFILE_SPECIFIER = "${profileName}";`,
];

const signed = project.replace(/([ \t]*)(PRODUCT_BUNDLE_IDENTIFIER = [^;]+;)/g, (_, indentation, setting) =>
  [`${indentation}${setting}`, ...signing.map((line) => `${indentation}${line}`)].join('\n'),
);

writeFileSync(PROJECT_FILE, signed);
console.log(`Xcode project: ${bundleIdentifier} signed by ${team} with «${profileName}»`);

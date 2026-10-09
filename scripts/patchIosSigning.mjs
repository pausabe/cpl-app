// `expo prebuild` writes an ios/ that signs the way Xcode does on a Mac with somebody logged in:
// it picks the certificate and the profile by itself. On a machine that builds for the store
// there is nobody logged in, so here the project is told exactly which certificate, which team
// and which profile to use.
//
// It is written only into the build settings that name a bundle identifier, which are those of
// the app and of its widgets' extension (targets/widgets): the CocoaPods targets have none and
// must not be given a profile, or they refuse to build. Each one gets the profile of its own
// identifier, and whatever signing settings prebuild or @bacons/apple-targets left there go, so
// that a setting is never written twice.
//
// ios/ is generated and gitignored: this only touches what the build just made.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_FILE = join(ROOT, 'ios', 'CPL.xcodeproj', 'project.pbxproj');

const team = process.env.IOS_TEAM_ID;
const bundleIdentifier = process.env.IOS_BUNDLE_IDENTIFIER;
const app = { name: process.env.IOS_PROFILE_NAME, uuid: process.env.IOS_PROFILE_UUID };
// Only when the widgets go in (CPL_IOS_WIDGETS, plugins/withWidgets.js)
const widgets = { name: process.env.IOS_WIDGETS_PROFILE_NAME, uuid: process.env.IOS_WIDGETS_PROFILE_UUID };
if (!team || !app.name || !app.uuid || !bundleIdentifier) {
  console.error('Needs IOS_TEAM_ID, IOS_PROFILE_NAME, IOS_PROFILE_UUID and IOS_BUNDLE_IDENTIFIER');
  process.exit(1);
}

const profiles = new Map([[bundleIdentifier, app]]);
if (widgets.name && widgets.uuid) profiles.set(`${bundleIdentifier}.widgets`, widgets);

const project = readFileSync(PROJECT_FILE, 'utf8');

// Every identifier the project names has to have its profile, or the build would be signed for
// another app: better to stop here than to have App Store Connect refuse it half an hour later
const identifiers = [
  ...new Set(
    [...project.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map(([, value]) =>
      value.trim().replace(/^"|"$/g, ''),
    ),
  ),
];
if (identifiers.length === 0) {
  throw new Error('The Xcode project names no bundle identifier');
}
for (const identifier of identifiers) {
  if (!profiles.has(identifier)) {
    throw new Error(
      `The Xcode project has ${identifier} and there is a profile only for ${[...profiles.keys()].join(' and ')}`,
    );
  }
}

// What may already be there, in any of its forms (the conditional one too: prebuild leaves
// "iPhone Developer" for iphoneos at project level, and a setting with a condition wins over the
// plain one)
const SIGNING_SETTING =
  /^[ \t]*"?(?:CODE_SIGN_STYLE|CODE_SIGN_IDENTITY(?:\[sdk=[^\]]*\])?|DEVELOPMENT_TEAM|PROVISIONING_PROFILE|PROVISIONING_PROFILE_SPECIFIER)"? = [^;]*;\n/gm;

const signing = (profile) => [
  'CODE_SIGN_STYLE = Manual;',
  'CODE_SIGN_IDENTITY = "Apple Distribution";',
  '"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "Apple Distribution";',
  `DEVELOPMENT_TEAM = ${team};`,
  `PROVISIONING_PROFILE = "${profile.uuid}";`,
  `PROVISIONING_PROFILE_SPECIFIER = "${profile.name}";`,
];

const signed = project.replace(/(buildSettings = \{\n)([\s\S]*?)(\n[ \t]*\};)/g, (block, open, settings, close) => {
  const named = /^([ \t]*)PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);$/m.exec(settings);
  if (!named) return block;
  const [, indentation, value] = named;
  const profile = profiles.get(value.trim().replace(/^"|"$/g, ''));
  const kept = `${settings}\n`.replace(SIGNING_SETTING, '').replace(/\n$/, '');
  return `${open}${kept}\n${signing(profile)
    .map((line) => `${indentation}${line}`)
    .join('\n')}${close}`;
});

writeFileSync(PROJECT_FILE, signed);
for (const [identifier, profile] of profiles) {
  console.log(`Xcode project: ${identifier} signed by ${team} with «${profile.name}»`);
}

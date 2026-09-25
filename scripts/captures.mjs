// The screenshots of the App Store and of Google Play, made from the app itself.
//
// Each store wants its own size, and none of them is the size of any phone: Apple asks for the
// 6.9" iPhone (1320×2868) and, because the app runs on iPad, the 13" iPad (2064×2752); Google
// Play refuses anything more than twice as tall as it is wide, which rules out the 1080×2400 of
// a normal Android and leaves 1080×1920. So the shots are taken at the size of the device and
// then composed onto the canvas of each store, with the sentence on top.
//
//     make captures            every size
//     make captures-ios        the two of Apple
//     make captures-android    the one of Google Play
//
// What comes out lands in store/<target>/, which is not in the repository: it is 20 MB of PNG
// that is remade from the app whenever the app changes.
//
// The day is the day the shots are taken. What the app shows changes with it, so the six shots
// of one run belong together and a store listing is always uploaded with a whole run.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FLOW = join(ROOT, '.maestro', 'captures', 'captures.yaml');
const MAESTRO = process.env.MAESTRO ?? join(process.env.HOME, '.maestro', 'bin', 'maestro');
const LITERATA = join(ROOT, 'src', 'assets', 'fonts', 'Literata-SemiBold.ttf');

// The colours are the ones of the app (src/Theme/colors.ts): a shot of the light app sits on the
// light background, and one of the dark app on the dark one, so the frame is the same room as
// the screen inside it.
const LIGHT = { background: '#E7F2F1', text: '#182322' };
const DARK = { background: '#0E1413', text: '#E6ECEB' };

// The order is the order they are shown in. The sentence says what the shot is for, not what is
// on it: whoever reads it is deciding whether to install the app, not looking for a feature.
const SHOTS = [
  { file: '01-inici', caption: 'Tot el dia, en una pantalla', theme: LIGHT },
  { file: '02-laudes', caption: 'Els textos complets, sense connexió', theme: LIGHT },
  { file: '04-evangeli', caption: "L'evangeli del dia, a un toc", theme: LIGHT },
  { file: '03-lletra', caption: 'La lletra, com la necessitis', theme: LIGHT },
  { file: '05-completes-fosc', caption: 'De nit, sense enlluernar', theme: DARK },
  { file: '06-inici-fosc', caption: "El mode fosc, a tota l'app", theme: DARK },
];

const TARGETS = {
  'ios-phone': {
    platform: 'ios',
    // Any 6.9" iPhone gives 1320×2868. The name has to be one of `xcrun simctl list devices`.
    simulator: process.env.CAPTURES_IPHONE ?? 'iPhone 18 Pro Max',
    canvas: [1320, 2868],
  },
  'ios-tablet': {
    platform: 'ios',
    simulator: process.env.CAPTURES_IPAD ?? 'iPad Pro 13-inch (M5)',
    canvas: [2064, 2752],
  },
  'android-phone': {
    platform: 'android',
    canvas: [1080, 1920],
  },
};

function run(command, args, options = {}) {
  return execFileSync(command, args, { stdio: 'inherit', cwd: ROOT, ...options });
}

function capture(command, args) {
  return execFileSync(command, args, { cwd: ROOT, encoding: 'utf8' });
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

// --- The devices ------------------------------------------------------------------------------

// A simulator of that exact name, booted and with the release installed. It is not created here:
// if the Mac has no simulator of that model, the list of what it does have is more useful than a
// simulator nobody asked for.
function prepareSimulator(name) {
  const devices = JSON.parse(capture('xcrun', ['simctl', 'list', 'devices', 'available', '-j']));
  const all = Object.values(devices.devices).flat();
  const device = all.find((one) => one.name === name);
  if (!device) {
    const available = all.map((one) => `  ${one.name}`).join('\n');
    fail(`No simulator named «${name}». There is:\n${available}\n\nIts name goes in CAPTURES_IPHONE or CAPTURES_IPAD.`);
  }

  const app = join(ROOT, 'ios', 'build', 'Build', 'Products', 'Release-iphonesimulator', 'CPL.app');
  if (!existsSync(app)) {
    fail('The release for the simulator is not built. `make captures-ios` builds it before coming here.');
  }

  if (device.state !== 'Booted') {
    run('xcrun', ['simctl', 'boot', device.udid]);
  }
  run('xcrun', ['simctl', 'bootstatus', device.udid, '-b']);
  run('xcrun', ['simctl', 'install', device.udid, app]);

  // A shot of a phone at 07:34 with no coverage and a half battery looks like somebody's
  // screenshot, not like a picture of the app. Apple's own are at 9:41.
  run('xcrun', [
    'simctl',
    'status_bar',
    device.udid,
    'override',
    '--time',
    '9:41',
    '--cellularMode',
    'active',
    '--cellularBars',
    '4',
    '--wifiMode',
    'active',
    '--wifiBars',
    '3',
    '--batteryState',
    'charged',
    '--batteryLevel',
    '100',
  ]);
  return device.udid;
}

// The first emulator or phone on adb, the same one `make android-app` installs on
function prepareAndroid() {
  const adb = join(process.env.ANDROID_HOME ?? join(process.env.HOME, 'Library/Android/sdk'), 'platform-tools/adb');
  const lines = capture(adb, ['devices']).split('\n').slice(1);
  const device = lines.map((line) => line.split('\t')).find((parts) => parts[1]?.trim() === 'device');
  if (!device) {
    fail('No Android emulator or phone connected (adb devices).');
  }
  const apk = join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  if (!existsSync(apk)) {
    fail('The Android release is not built. `make captures-android` builds it before coming here.');
  }
  run(adb, ['-s', device[0], 'install', '-r', apk]);

  // The same clean status bar as on iOS. Android does it with the demo mode of the system UI,
  // which has to be allowed first and stays on until somebody leaves it.
  const demo = (args) =>
    run(adb, ['-s', device[0], 'shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', ...args]);
  run(adb, ['-s', device[0], 'shell', 'settings', 'put', 'global', 'sysui_demo_allowed', '1']);
  demo(['-e', 'command', 'enter']);
  demo(['-e', 'command', 'clock', '-e', 'hhmm', '0941']);
  demo(['-e', 'command', 'network', '-e', 'wifi', 'show', '-e', 'level', '4']);
  demo(['-e', 'command', 'network', '-e', 'mobile', 'show', '-e', 'level', '4']);
  demo(['-e', 'command', 'battery', '-e', 'level', '100', '-e', 'plugged', 'false']);
  demo(['-e', 'command', 'notifications', '-e', 'visible', 'false']);
  return device[0];
}

// --- Composing --------------------------------------------------------------------------------

// Chrome draws the frame: the canvas of the store, the sentence in Literata (the same font of the
// app) and the shot with its corners rounded, running past the bottom edge as the stores show it.
function chrome() {
  const candidates = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    fail('Google Chrome is needed to compose the shots. Its path goes in CHROME.');
  }
  return found;
}

function frameHtml(shot, shotFile, [width, height]) {
  const font = readFileSync(LITERATA).toString('base64');
  const image = readFileSync(shotFile).toString('base64');
  return `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: "Literata"; src: url(data:font/ttf;base64,${font}) format("truetype"); font-weight: 600; }
* { margin: 0; box-sizing: border-box; }
html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
body { background: ${shot.theme.background}; display: flex; flex-direction: column; align-items: center; }
h1 {
  font-family: "Literata", Georgia, serif; font-weight: 600; color: ${shot.theme.text};
  font-size: ${Math.round(width * 0.052)}px; line-height: 1.22; text-align: center;
  margin: ${Math.round(height * 0.055)}px ${Math.round(width * 0.09)}px 0;
  text-wrap: balance;
}
img {
  width: ${Math.round(width * 0.82)}px; margin-top: ${Math.round(height * 0.045)}px;
  border-radius: ${Math.round(width * 0.055)}px;
  box-shadow: 0 ${Math.round(width * 0.012)}px ${Math.round(width * 0.05)}px rgba(0, 40, 42, .28);
}
</style><h1>${shot.caption}</h1><img src="data:image/png;base64,${image}">`;
}

// Maestro puts what it writes in a folder of its own named after the run, and the shots of the
// flow in another one named after the flow, so the file is looked for and not guessed
function findShot(raw, name) {
  const wanted = `${name}.png`;
  for (const entry of readdirSync(raw, { recursive: true, withFileTypes: true })) {
    if (entry.isFile() && entry.name === wanted) {
      return join(entry.parentPath ?? entry.path, entry.name);
    }
  }
  return null;
}

function compose(target, raw, out) {
  const browser = chrome();
  const [width, height] = TARGETS[target].canvas;
  mkdirSync(out, { recursive: true });
  let order = 1;
  for (const shot of SHOTS) {
    const source = findShot(raw, shot.file);
    if (!source) {
      fail(`The flow did not leave ${shot.file}.png under ${raw}. Run it again and watch where it stops.`);
    }
    const page = join(raw, `${shot.file}.html`);
    writeFileSync(page, frameHtml(shot, source, [width, height]));
    const destination = join(out, `${String(order).padStart(2, '0')}-${shot.file.replace(/^\d+-/, '')}.png`);
    run(browser, [
      '--headless',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--virtual-time-budget=4000',
      '--allow-file-access-from-files',
      `--window-size=${width},${height}`,
      `--screenshot=${destination}`,
      page,
    ]);
    order += 1;
  }
}

// --- One target -------------------------------------------------------------------------------

function captures(target) {
  const { platform, simulator } = TARGETS[target];
  const raw = join(ROOT, 'store', target, 'raw');
  const out = join(ROOT, 'store', target);
  rmSync(raw, { recursive: true, force: true });
  mkdirSync(raw, { recursive: true });

  const device = platform === 'ios' ? prepareSimulator(simulator) : prepareAndroid();

  console.log(`\n→ ${target}: the flow on ${simulator ?? device}\n`);
  // --test-output-dir instead of a path in the flow: Maestro keeps every screenshot inside the
  // folder it is given and refuses one that resolves outside it
  run(MAESTRO, ['--device', device, 'test', '--test-output-dir', raw, FLOW]);

  compose(target, raw, out);
  const made = readdirSync(out).filter((name) => name.endsWith('.png'));
  console.log(`\n✓ ${target}: ${made.length} shots in store/${target}/\n`);
}

const asked = process.argv.slice(2);
const targets = asked.length > 0 ? asked : Object.keys(TARGETS);
for (const target of targets) {
  if (!TARGETS[target]) {
    fail(`There is no target «${target}». There is: ${Object.keys(TARGETS).join(', ')}.`);
  }
}
for (const target of targets) {
  captures(target);
}

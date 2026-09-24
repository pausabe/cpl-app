// The icon of the app, the logotype of the splash and the two pictures Google Play asks for,
// all from the same drawing.
//
//     node scripts/makeIcons.mjs
//
// cplMark.svg holds the three letters of the CPL exactly as they are in the logo-cpl.svg of
// cpl.es. Nothing here redraws them: what changes from one file to the next is the colour, the
// size and whether there is a background behind them.
//
// The colour is #005B79, the one of the CPL. It is the only brand colour of their whole website,
// and until now the icon used a green that was not theirs.
//
// The sizes are not the same on iOS and on Android, and this is the part that is easy to get
// wrong. An iOS icon is the whole square and the system rounds the corners, so the letters take
// 62 % of it. An Android adaptive icon is drawn on 108 dp but only the middle 72 dp is ever seen,
// and a launcher that masks it into a circle keeps even less; so on that canvas the letters take
// 62 % × 72/108 = 41 %, which is the same size on screen as on iOS. The icon this replaces had
// them at 82 % on both, and the L fell off the circle.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'src', 'assets');
const MARK = readFileSync(join(ASSETS, 'icon', 'cplMark.svg'), 'utf8');

const STORE = join(ROOT, 'store');
const LITERATA = join(ASSETS, 'fonts', 'Literata-SemiBold.ttf');

const BRAND = '#005B79';
// The same blue lightened until it reads on the dark background of the splash (#0E1413)
const BRAND_ON_DARK = '#6FB6D2';

const FILES = [
  {
    // iOS, and the icon Google Play shows in its listing. No transparency: Apple rejects it.
    file: join(ASSETS, 'icon', 'icon.png'),
    size: [1024, 1024],
    background: BRAND,
    colour: '#FFFFFF',
    width: 0.62,
  },
  {
    // The foreground of the Android adaptive icon. The background is a flat colour in app.json,
    // so there is no second image to keep in step with this one.
    file: join(ASSETS, 'icon', 'androidForeground.png'),
    size: [1024, 1024],
    background: 'transparent',
    colour: '#FFFFFF',
    width: 0.41,
  },
  {
    // Android 13 and later, for the themed icons: the system paints it with the colours of the
    // wallpaper and only reads the shape. Without this file it invents one.
    file: join(ASSETS, 'icon', 'androidMonochrome.png'),
    size: [1024, 1024],
    background: 'transparent',
    colour: '#FFFFFF',
    width: 0.41,
  },
  {
    // The splash. It is the logotype alone, cropped to it, and the background colour is in
    // app.json. It changes colour with the icon: otherwise the app opens in one blue and sits on
    // the home screen in another.
    file: join(ASSETS, 'splash.png'),
    size: [830, 392],
    background: 'transparent',
    colour: BRAND,
    width: 1,
  },
  {
    file: join(ASSETS, 'splashDark.png'),
    size: [830, 392],
    background: 'transparent',
    colour: BRAND_ON_DARK,
    width: 1,
  },
  {
    // Google Play shows this one at the top of the listing and in its promotions. It is cropped
    // on some of them, so everything sits in the middle and nothing near an edge matters.
    file: join(STORE, 'play-feature-graphic.png'),
    size: [1024, 500],
    background: BRAND,
    colour: '#FFFFFF',
    width: 0.3,
    caption: 'Litúrgia de les Hores en català',
  },
];

function chrome() {
  const candidates = [
    process.env.CHROME,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) {
    console.error('\nGoogle Chrome is needed to draw the icons. Its path goes in CHROME.\n');
    process.exit(1);
  }
  return found;
}

function page({ size: [width, height], background, colour, width: markWidth, caption }) {
  // The mark keeps its proportions, so the width decides everything
  const drawn = Math.round(width * markWidth);
  const font = caption ? readFileSync(LITERATA).toString('base64') : '';
  return `<!doctype html><meta charset="utf-8"><style>
* { margin: 0; }
${caption ? `@font-face { font-family: "Literata"; src: url(data:font/ttf;base64,${font}) format("truetype"); font-weight: 600; }` : ''}
html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
body {
  background: ${background}; color: ${colour};
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: ${Math.round(height * 0.09)}px;
}
svg { width: ${drawn}px; height: auto; display: block; }
p { font-family: "Literata", Georgia, serif; font-weight: 600; font-size: ${Math.round(height * 0.11)}px; }
</style>${MARK}${caption ? `<p>${caption}</p>` : ''}`;
}

const browser = chrome();
mkdirSync(STORE, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'cpl-icons-'));
try {
  for (const icon of FILES) {
    const source = join(work, 'icon.html');
    writeFileSync(source, page(icon));
    execFileSync(
      browser,
      [
        '--headless',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--virtual-time-budget=2000',
        `--default-background-color=${icon.background === 'transparent' ? '00000000' : 'ffffff'}`,
        `--window-size=${icon.size[0]},${icon.size[1]}`,
        `--screenshot=${icon.file}`,
        source,
      ],
      // Chrome writes pages of harmless warnings about displays it has not got
      { stdio: 'ignore' },
    );
    console.log(`${icon.file.replace(`${ROOT}/`, '')}  ${icon.size.join('×')}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

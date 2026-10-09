// The widgets of the home screen draw with the app's colours, but they are written again in Swift
// (targets/widgets/Palette.swift) and in Android resources (modules/cpl-widgets), which cannot read
// src/theme/colors.ts. Here they are compared: a colour changed in the app has to change there too.
const fs = require('fs');
const path = require('path');
const { palettes, liturgicalColor } = require('../../src/theme/colors');

const ROOT = path.resolve(__dirname, '../..');
const TOKENS = [
  'homeBackground',
  'surface',
  'border',
  'text',
  'text2',
  'text3',
  'accentFill',
  'onAccent',
  'accentText',
  'rubric',
];
const CODES = ['R', 'V', 'M', 'B'];
const upper = (hex) => hex.toUpperCase();
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

const expected = () => ({
  tokens: Object.fromEntries(TOKENS.map((token) => [token, [palettes.light[token], palettes.dark[token]].map(upper)])),
  liturgical: Object.fromEntries(
    CODES.map((code) => {
      const light = liturgicalColor(code, 'light');
      const dark = liturgicalColor(code, 'dark');
      return [code, [light.tint, dark.tint, light.accent, dark.accent].map(upper)];
    }),
  ),
});

test('the Swift of the iPhone widgets', () => {
  const swift = read('targets/widgets/Palette.swift');
  const tone = (name) => {
    const match = new RegExp(`static let ${name} = Tone\\(light: 0x([0-9A-Fa-f]{6}), dark: 0x([0-9A-Fa-f]{6})\\)`).exec(
      swift,
    );
    return match ? [`#${match[1]}`, `#${match[2]}`].map(upper) : null;
  };
  const liturgical = (code) => {
    const match = new RegExp(
      `"${code}": \\(tint: Tone\\(light: 0x(\\w{6}), dark: 0x(\\w{6})\\), accent: Tone\\(light: 0x(\\w{6}), dark: 0x(\\w{6})\\)\\)`,
    ).exec(swift);
    return match ? match.slice(1).map((hex) => upper(`#${hex}`)) : null;
  };
  expect({
    tokens: Object.fromEntries(TOKENS.map((token) => [token, tone(token)])),
    liturgical: Object.fromEntries(CODES.map((code) => [code, liturgical(code)])),
  }).toEqual(expected());
});

test('the resources of the Android widgets, light and night', () => {
  const RES = 'modules/cpl-widgets/android/src/main/res';
  const colours = (file) =>
    Object.fromEntries(
      [...read(`${RES}/${file}`).matchAll(/<color name="([a-z0-9_]+)">(#[0-9A-Fa-f]{6})<\/color>/g)].map(
        ([, name, hex]) => [name, upper(hex)],
      ),
    );
  const light = colours('values/colors.xml');
  const night = colours('values-night/colors.xml');
  // homeBackground → cw_home_background, text2 → cw_text2
  const name = (token) => `cw_${token.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)}`;
  const pair = (resource) => [light[resource] ?? null, night[resource] ?? light[resource] ?? null];
  expect({
    tokens: Object.fromEntries(TOKENS.map((token) => [token, pair(name(token))])),
    liturgical: Object.fromEntries(
      CODES.map((code) => {
        const [tintLight, tintNight] = pair(`cw_tint_${code.toLowerCase()}`);
        const [accentLight, accentNight] = pair(`cw_accent_${code.toLowerCase()}`);
        return [code, [tintLight, tintNight, accentLight, accentNight]];
      }),
    ),
  }).toEqual(expected());
});

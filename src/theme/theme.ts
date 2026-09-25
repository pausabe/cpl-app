import { ColorSchemeName, LiturgicalColor, liturgicalColor, Palette, palettes } from './colors';
import { convertTextSize, fontFamilies, textSizeStep, uiText, MAX_FONT_SCALE_FOR_LABELS } from './typography';
import { layout, radius, space, touch } from './spacing';

// Everything a screen needs to draw itself: colours for the current mode, and the sizes of
// the prayer text for the size the user chose.
export interface Theme {
  scheme: ColorSchemeName;
  dark: boolean;
  colors: Palette;
  // The colour of the scroll bar of iOS: the app chooses it, because the mode of the app is not
  // always the mode of the phone, and "default" follows the phone.
  scrollIndicator: 'white' | 'black';
  liturgical: (code: unknown) => LiturgicalColor;
  prayer: PrayerMetrics;
  fonts: typeof fontFamilies;
  text: typeof uiText;
  maxFontScaleForLabels: number;
  space: typeof space;
  radius: typeof radius;
  touch: typeof touch;
  layout: typeof layout;
}

export interface PrayerMetrics {
  // Setting step, 1 to 10
  step: number;
  fontSize: number;
  lineHeight: number;
  // Between paragraphs, and between the parts of a section
  gap: number;
  sectionTitleSize: number;
}

export interface ThemeOptions {
  dark?: boolean;
  // The text size setting as SettingsService stores it: "1" to "10"
  textSize?: unknown;
}

// Paragraph spacing and line height, relative to the text, as in the design (1.42 and 0.9 em)
const LINE_HEIGHT = 1.42;
const PARAGRAPH_GAP = 0.9;

export function prayerMetrics(textSize: unknown): PrayerMetrics {
  const fontSize = convertTextSize(textSize);
  return {
    step: textSizeStep(textSize),
    fontSize,
    lineHeight: Math.round(fontSize * LINE_HEIGHT),
    gap: Math.round(fontSize * PARAGRAPH_GAP),
    // 15 px with the default 21 px, and it grows with the text
    sectionTitleSize: Math.max(13, Math.round(fontSize * 0.72)),
  };
}

export function createTheme({ dark = false, textSize }: ThemeOptions = {}): Theme {
  const scheme: ColorSchemeName = dark ? 'dark' : 'light';
  return {
    scheme,
    dark,
    colors: palettes[scheme],
    scrollIndicator: dark ? 'white' : 'black',
    liturgical: (code: unknown) => liturgicalColor(code, scheme),
    prayer: prayerMetrics(textSize),
    fonts: fontFamilies,
    text: uiText,
    maxFontScaleForLabels: MAX_FONT_SCALE_FOR_LABELS,
    space,
    radius,
    touch,
    layout,
  };
}

// The app's colours, light and dark. Screens never write a colour: they ask the theme for
// one of these by what it is for.
export type ColorSchemeName = 'light' | 'dark';

export interface Palette {
  // Top bar, the same in both modes
  header: string;
  onHeader: string;
  // Backgrounds
  homeBackground: string;
  prayerBackground: string;
  settingsBackground: string;
  // Cards, tiles, rows and sheets
  surface: string;
  sheet: string;
  chipBackground: string;
  border: string;
  divider: string;
  rule: string;
  // Text
  text: string;
  text2: string;
  text3: string;
  // What can be touched
  accentFill: string;
  onAccent: string;
  accentText: string;
  switchOff: string;
  // Liturgical red for rubrics: V., R., Ant. and the section titles
  rubric: string;
  // Behind a sheet or a dialog
  backdrop: string;
}

export const palettes: Record<ColorSchemeName, Palette> = {
  light: {
    header: '#006064',
    onHeader: '#FFFFFF',
    homeBackground: '#E7F2F1',
    prayerBackground: '#FFFFFF',
    settingsBackground: '#EEF3F2',
    surface: '#FFFFFF',
    sheet: '#FFFFFF',
    chipBackground: '#F3F8F7',
    border: '#D3E3E1',
    divider: '#DCE6E5',
    rule: 'rgba(24,35,34,0.14)',
    text: '#182322',
    text2: '#475756',
    text3: '#5A6B6A',
    accentFill: '#007B80',
    onAccent: '#FFFFFF',
    accentText: '#00696D',
    switchOff: '#B9C6C5',
    rubric: '#B3261E',
    backdrop: 'rgba(0,0,0,0.42)',
  },
  dark: {
    header: '#006064',
    onHeader: '#FFFFFF',
    homeBackground: '#0E1413',
    prayerBackground: '#0B0F0E',
    settingsBackground: '#0E1413',
    surface: '#18201F',
    sheet: '#1B2322',
    chipBackground: '#1E2827',
    border: '#2A3534',
    divider: '#26302F',
    rule: 'rgba(230,236,235,0.16)',
    text: '#E6ECEB',
    text2: '#B3C0BE',
    text3: '#93A3A1',
    accentFill: '#1F7F7B',
    onAccent: '#FFFFFF',
    accentText: '#7FD1CC',
    switchOff: '#3A4645',
    rubric: '#F28B82',
    backdrop: 'rgba(0,0,0,0.55)',
  },
};

// Colour of the day, as the database gives it (Days.Color): red, green, purple and white.
export type LiturgicalColorCode = 'R' | 'V' | 'M' | 'B';

export interface LiturgicalColor {
  code: LiturgicalColorCode;
  name: string;
  // The dot next to the name. White needs an outline to be seen.
  dot: string;
  dotOutlined: boolean;
  // Soft background of the day card, and the colour of its label and links
  tint: string;
  accent: string;
  calendar: CalendarTones;
}

// The colour in the calendar, which says the liturgical season and nothing else: every day of a
// season on its soft tone (day), the marks of the rank of a day (a dot for a memorial, a star for
// a feast or a solemnity) in its strong one (mark), and the squares of the year and the pieces of
// the wheel in a middle one (square), which a soft tone is too pale for when it is that small.
export interface CalendarTones {
  day: string;
  mark: string;
  square: string;
}

const LITURGICAL: Record<
  LiturgicalColorCode,
  { name: string; dot: string; light: [string, string]; dark: [string, string] }
> = {
  R: { name: 'Vermell', dot: '#C62828', light: ['#F8E7E5', '#B3261E'], dark: ['#2A1917', '#F28B82'] },
  // Greener than it was (#E5F1E6), which was almost the background of the home (#E7F2F1)
  V: { name: 'Verd', dot: '#2E7D32', light: ['#DDEEDA', '#2E6B30'], dark: ['#16241A', '#8CC98F'] },
  M: { name: 'Morat', dot: '#6A3D9A', light: ['#EFE8F4', '#6A3D9A'], dark: ['#221B2B', '#C9A7EB'] },
  // White is ivory with dark gold, so that it can be read on a light screen
  B: { name: 'Blanc', dot: '#FFFFFF', light: ['#F7F1E3', '#7A5F14'], dark: ['#26221A', '#E3C877'] },
};

// In dark mode the soft tones of the card are almost the background, and dark colours lose their
// hue: a green or purple day was a dark grey that could not be told from the background nor from
// the others, and white was brown. The calendar has its own: a day clearly in its colour (half
// again as bright as the background), the marks in the light accent. White is stone and ivory.
const CALENDAR: Record<LiturgicalColorCode, Record<ColorSchemeName, CalendarTones>> = {
  R: {
    light: { day: '#F8E7E5', mark: '#B3261E', square: '#EDB9B3' },
    dark: { day: '#61332E', mark: '#F09C94', square: '#944B42' },
  },
  V: {
    light: { day: '#DDEEDA', mark: '#2E6B30', square: '#B5D7AE' },
    dark: { day: '#2D5334', mark: '#9CD39E', square: '#40774B' },
  },
  M: {
    light: { day: '#EFE8F4', mark: '#6A3D9A', square: '#D5C3E8' },
    dark: { day: '#4A3762', mark: '#CDB6ED', square: '#6E5095' },
  },
  B: {
    light: { day: '#F7F1E3', mark: '#7A5F14', square: '#E9D9AA' },
    dark: { day: '#534D41', mark: '#EFE4C8', square: '#807660' },
  },
};

export function isLiturgicalColorCode(code: unknown): code is LiturgicalColorCode {
  return typeof code === 'string' && Object.prototype.hasOwnProperty.call(LITURGICAL, code);
}

// A code the database does not use falls back to green, the colour of most of the year.
export function liturgicalColor(code: unknown, scheme: ColorSchemeName): LiturgicalColor {
  const key: LiturgicalColorCode = isLiturgicalColorCode(code) ? code : 'V';
  const entry = LITURGICAL[key];
  const [tint, accent] = entry[scheme];
  return {
    code: key,
    name: entry.name,
    dot: entry.dot,
    dotOutlined: key === 'B',
    tint,
    accent,
    calendar: CALENDAR[key][scheme],
  };
}

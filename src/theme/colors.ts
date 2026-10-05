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

// The colour in the calendar, from soft to strong as the rank of the day grows: a day of the
// month on its own colour, a feast stronger with its number in feastText, a solemnity the
// strongest with its number in onSolemnity. A square of the year and of the wheel takes the
// middle tone, and a solemnity the strong one.
export interface CalendarTones {
  day: string;
  feast: string;
  feastText: string;
  solemnity: string;
  onSolemnity: string;
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

// In dark mode the soft tones of the card are almost the sheet: the calendar has its own, a step
// lighter, and the strong ones are the light accents with dark numbers.
const CALENDAR: Record<LiturgicalColorCode, Record<ColorSchemeName, CalendarTones>> = {
  R: {
    light: {
      day: '#F8E7E5',
      feast: '#EDB9B3',
      feastText: '#8E1B15',
      solemnity: '#B3261E',
      onSolemnity: '#FFFFFF',
      square: '#EDB9B3',
    },
    dark: {
      day: '#3A2320',
      feast: '#6A322C',
      feastText: '#F8B4AD',
      solemnity: '#F28B82',
      onSolemnity: '#0E1413',
      square: '#7A3B34',
    },
  },
  V: {
    light: {
      day: '#DDEEDA',
      feast: '#B5D7AE',
      feastText: '#275C29',
      solemnity: '#2E6B30',
      onSolemnity: '#FFFFFF',
      square: '#B5D7AE',
    },
    dark: {
      day: '#1F3424',
      feast: '#335C38',
      feastText: '#A9DCAB',
      solemnity: '#8CC98F',
      onSolemnity: '#0E1413',
      square: '#3F6E45',
    },
  },
  M: {
    light: {
      day: '#EFE8F4',
      feast: '#D5C3E8',
      feastText: '#5A3087',
      solemnity: '#6A3D9A',
      onSolemnity: '#FFFFFF',
      square: '#D5C3E8',
    },
    dark: {
      day: '#2F2540',
      feast: '#4E3B6C',
      feastText: '#DCC6F4',
      solemnity: '#C9A7EB',
      onSolemnity: '#0E1413',
      square: '#5F4885',
    },
  },
  B: {
    light: {
      day: '#F7F1E3',
      feast: '#E9D9AA',
      feastText: '#6B530F',
      solemnity: '#7A5F14',
      onSolemnity: '#FFFFFF',
      square: '#E9D9AA',
    },
    dark: {
      day: '#352E1E',
      feast: '#5E4D22',
      feastText: '#EDD99A',
      solemnity: '#E3C877',
      onSolemnity: '#0E1413',
      square: '#7A6630',
    },
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

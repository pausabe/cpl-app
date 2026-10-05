// The calendar on its own: the month painted with the liturgical year, the day touched before going
// to it, the row of months, the three tabs (the month, the whole year in small and the wheel of the
// liturgical year), and the limits of the database.
import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react-native';
import { renderWithTheme, styleOf, withTheme } from '../helpers/renderWithTheme';
import CalendarScreen from '../../src/views/calendar/CalendarScreen';

const NOW = new Date(2026, 8, 22, 10, 0);

beforeAll(() => {
  jest.useFakeTimers({ now: NOW, advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});

const iso = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// A whole year of green weekdays, with some days as the test says
function yearOfMarks(year, special = {}) {
  const marks = {};
  for (let date = new Date(year, 0, 1); date.getFullYear() === year; date.setDate(date.getDate() + 1)) {
    const key = iso(year, date.getMonth() + 1, date.getDate());
    marks[key] = {
      date: key,
      color: 'V',
      letter: '-',
      specificSeason: 'O_ORDINAR',
      season: 'Ordinari',
      week: '25',
      yearType: 'A',
      ...special[key],
    };
  }
  return marks;
}

const MARKS = yearOfMarks(2026, {
  '2026-09-08': { color: 'B', letter: 'F' },
  '2026-09-14': { color: 'R', letter: 'F' },
  '2026-09-15': { color: 'B', letter: 'M' },
  '2026-09-21': { color: 'R', letter: 'F' },
  '2026-09-24': { color: 'B', letter: 'S' },
  '2026-09-26': { letter: 'L' },
  '2026-11-01': { color: 'B', letter: 'S' },
  '2026-11-22': { color: 'B', letter: 'S' },
});

// What the home would show of a day, as the controller hands it over
const card = (title, celebration = null) => ({
  place: 'Barcelona (Diòcesi)',
  dateText: '',
  colorCode: celebration ? 'B' : 'V',
  colorName: '',
  title,
  meta: '',
  celebration,
});

const celebration = (typeLabel, title, muted = false) => ({
  typeLabel,
  title,
  muted,
  description: null,
  optionalMemory: null,
});

function open(props = {}) {
  const handlers = {
    onToday: jest.fn(),
    onChange: jest.fn(),
    onNeedYears: jest.fn(),
    onNeedPreviews: jest.fn(),
  };
  const all = { value: new Date(2026, 8, 21, 10, 0), marks: MARKS, ...handlers, ...props };
  const view = renderWithTheme(<CalendarScreen {...all} />);
  // The same screen with other data from its controller, keeping what the reader did on it
  const rerender = (more) => view.rerender(withTheme(<CalendarScreen {...all} {...more} />));
  return { ...handlers, rerender };
}

const day = (name) => screen.getByRole('button', { name });
const fill = (n) => styleOf(screen.getByTestId(`calendar-day-${n}-fill`));
const tab = (name) => fireEvent.press(screen.getByRole('radio', { name }));
const title = () => screen.getByTestId('calendar-title').props.children;

describe('the month', () => {
  test('it opens on the month of the day being shown, with that day chosen and today marked', () => {
    open();
    expect(screen.getByRole('radio', { name: 'Mes' }).props.accessibilityState.checked).toBe(true);
    expect(screen.getByRole('header', { name: 'Setembre de 2026' })).toBeTruthy();
    expect(day('dilluns, 21 de setembre, festa').props.accessibilityState.selected).toBe(true);
    expect(styleOf(screen.getByTestId('calendar-day-21')).borderColor).toBe('#007B80');
    expect(styleOf(screen.getByTestId('calendar-day-20')).borderColor).toBe('transparent');
    expect(fill(22)).toMatchObject({ borderColor: '#00696D', borderWidth: 2 });
    expect(day('dimarts, 22 de setembre, avui')).toBeTruthy();
  });

  test('every day on the colour of its season, and the letter of its celebration in its colour', () => {
    open();
    // All of September is ordinary time: green, whatever the colour of the day itself
    for (const n of [8, 14, 15, 23, 24, 26]) expect(fill(n).backgroundColor).toBe('#DDEEDA');
    const letter = (n, rank) => screen.getByTestId(`calendar-day-${n}-${rank}`, { includeHiddenElements: true });
    // Our Lady of Sorrows, white (gold on a light screen); the Holy Cross, red; Our Lady of Mercy, white
    expect(letter(15, 'memory').props.children).toBe('M');
    expect(styleOf(letter(15, 'memory')).color).toBe('#7A5F14');
    expect(letter(14, 'feast').props.children).toBe('F');
    expect(styleOf(letter(14, 'feast')).color).toBe('#B3261E');
    expect(letter(24, 'solemnity').props.children).toBe('S');
    // An optional memorial and a weekday, with none
    expect(screen.queryByTestId('calendar-day-26-memory', { includeHiddenElements: true })).toBeNull();
    expect(screen.queryByTestId('calendar-day-23-feast', { includeHiddenElements: true })).toBeNull();
    expect(day('dissabte, 26 de setembre, memòria lliure')).toBeTruthy();
    // The season, named under the title
    expect(within(screen.getByTestId('calendar-seasons')).getByText("Durant l'any")).toBeTruthy();
  });

  test('a month across two seasons changes colour where the season changes', () => {
    // Advent until the 24th, Christmas from the 25th
    const december = {};
    for (let d = 1; d <= 31; d++)
      december[iso(2026, 12, d)] = { color: d < 25 ? 'M' : 'B', season: d < 25 ? 'Advent' : 'Nadal' };
    const marks = yearOfMarks(2026, {
      ...december,
      '2026-12-08': { color: 'B', letter: 'S', season: 'Advent' },
      '2026-12-25': { color: 'B', letter: 'S', season: 'Nadal' },
      '2026-12-26': { color: 'R', letter: 'F', season: 'Nadal' },
    });
    open({ marks, value: new Date(2026, 11, 1) });
    // The Immaculate Conception, a white solemnity, is a day of Advent; St Stephen, red, of Christmas
    expect(fill(8).backgroundColor).toBe('#EFE8F4');
    expect(fill(24).backgroundColor).toBe('#EFE8F4');
    expect(fill(25).backgroundColor).toBe('#F7F1E3');
    expect(fill(26).backgroundColor).toBe('#F7F1E3');
    const stephen = screen.getByTestId('calendar-day-26-feast', { includeHiddenElements: true });
    expect(styleOf(stephen).color).toBe('#B3261E');
    // Both seasons, named in order
    const seasons = within(screen.getByTestId('calendar-seasons'));
    expect(seasons.getAllByText(/./).map((t) => t.props.children)).toEqual(['Temps d’Advent', 'Temps de Nadal']);
  });

  test('before its year is loaded the days are there, without colour, and it asks for the year', () => {
    const { onNeedYears } = open({ marks: {} });
    expect(onNeedYears).toHaveBeenCalledWith([2026]);
    expect(fill(24).backgroundColor).toBe('#F3F8F7');
    expect(day('dijous, 24 de setembre')).toBeTruthy();
  });

  test('under it, what it says: the background the season, the letter the celebration, its colour the colour', () => {
    open({ marks: {} });
    const key = screen.getByTestId('calendar-key', { includeHiddenElements: true });
    const words = [
      'El fons: el temps',
      "Durant l'any",
      'Advent i Quaresma',
      'Nadal i Pasqua',
      'Tridu pasqual',
      'La lletra: la celebració',
      'M',
      'Memòria',
      'F',
      'Festa',
      'S',
      'Solemnitat',
      'Color de la celebració:',
      'Blanc',
      'Verd',
      'Morat',
      'Vermell',
    ];
    for (const word of words) expect(within(key).getByText(word, { includeHiddenElements: true })).toBeTruthy();
    // No word for a weekday nor for today, which are plain to see
    expect(within(key).queryByText(/Fèria|Avui/, { includeHiddenElements: true })).toBeNull();
    // Before the year is loaded too, so that the screen does not jump; a screen reader skips it
    expect(screen.queryByText('La lletra: la celebració')).toBeNull();
  });

  test('in dark mode, the dark colours', () => {
    renderWithTheme(
      <CalendarScreen value={new Date(2026, 8, 21)} marks={MARKS} onToday={() => {}} onChange={() => {}} />,
      { dark: true },
    );
    expect(styleOf(screen.getByTestId('calendar')).backgroundColor).toBe('#1B2322');
    // The ring of the day chosen, the light teal; every day of ordinary time, green
    expect(styleOf(screen.getByTestId('calendar-day-21')).borderColor).toBe('#7FD1CC');
    expect(fill(24).backgroundColor).toBe('#2D5334');
    expect(fill(23).backgroundColor).toBe('#2D5334');
  });
});

describe('the day touched', () => {
  test('is chosen, says what it is before going to it, and «Selecciona» goes to it', () => {
    const { onChange, onNeedPreviews, rerender } = open();
    expect(onNeedPreviews).toHaveBeenLastCalledWith([new Date(2026, 8, 21)]);
    fireEvent.press(day('dijous, 24 de setembre, solemnitat'));
    expect(onChange).not.toHaveBeenCalled();
    expect(onNeedPreviews).toHaveBeenLastCalledWith([new Date(2026, 8, 24)]);
    const preview = () => screen.getByTestId('calendar-preview');
    // The date at once, the rest when the controller has worked it out
    expect(within(preview()).getByText('Dijous, 24 de setembre')).toBeTruthy();
    expect(within(preview()).queryByText('Solemnitat')).toBeNull();
    rerender({
      previews: {
        '2026-09-24': card('Setmana XXV de durant l’any', celebration('Solemnitat', 'Mare de Déu de la Mercè')),
      },
    });
    expect(within(preview()).getByText('Mare de Déu de la Mercè')).toBeTruthy();
    expect(within(preview()).getByText('Solemnitat')).toBeTruthy();
    expect(styleOf(preview()).backgroundColor).toBe('#F7F1E3');
    fireEvent.press(screen.getByRole('button', { name: 'Selecciona' }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 24));
  });

  test('an optional memorial that is not celebrated goes grey, as on the home', () => {
    open({
      previews: {
        '2026-09-21': card('Setmana XXV de durant l’any', celebration('Memòria lliure', 'Sant Mateu', true)),
      },
    });
    const preview = screen.getByTestId('calendar-preview');
    expect(styleOf(within(preview).getByText('Sant Mateu')).color).toBe('#475756');
  });

  test('«Avui» goes back to today, and the buttons stay at the bottom of the month', () => {
    const { onToday, onChange } = open();
    expect(screen.getByTestId('calendar-footer')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Avui' }));
    expect(onToday).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('the row of months', () => {
  test('goes to another month with a touch, into the next year too, and asks for that year', () => {
    const { onNeedYears } = open();
    expect(
      screen.getByRole('button', { name: 'setembre de 2026, el mes d’avui' }).props.accessibilityState.selected,
    ).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'desembre de 2026' }));
    expect(title()).toBe('Desembre de 2026');
    // At the end of the year, the next one is asked for, ready for a drag
    expect(onNeedYears).toHaveBeenLastCalledWith([2026, 2027]);
    fireEvent.press(screen.getByRole('button', { name: 'gener de 2027' }));
    expect(title()).toBe('Gener de 2027');
    expect(within(screen.getByTestId('calendar-month-2027-1')).getByText('2027')).toBeTruthy();
    expect(onNeedYears).toHaveBeenLastCalledWith([2026, 2027]);
  });

  test('outside the database, the days can be neither chosen nor reached', () => {
    const { onChange } = open({ minimumDate: new Date(2026, 8, 10), maximumDate: new Date(2026, 8, 25) });
    expect(day('dimecres, 9 de setembre').props.accessibilityState.disabled).toBe(true);
    expect(day('dissabte, 26 de setembre, memòria lliure').props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByRole('button', { name: 'agost de 2026' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'octubre de 2026' })).toBeNull();
    fireEvent.press(day('dissabte, 26 de setembre, memòria lliure'));
    fireEvent.press(screen.getByRole('button', { name: 'Selecciona' }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 21));
  });
});

describe('the whole year', () => {
  const limits = { minimumDate: new Date(2017, 0, 3), maximumDate: new Date(2100, 11, 29) };

  test('its tab shows twelve months in small, the one shown framed, and no buttons at the bottom', () => {
    const { onNeedYears } = open(limits);
    tab('Any');
    expect(title()).toBe('2026');
    expect(onNeedYears).toHaveBeenLastCalledWith([2026]);
    const months = within(screen.getByTestId('calendar-year')).getAllByRole('button');
    expect(months).toHaveLength(12);
    expect(months[8].props.accessibilityLabel).toBe('setembre de 2026, el mes d’avui');
    expect(months[8].props.accessibilityState.selected).toBe(true);
    expect(screen.queryByTestId('calendar-day-21')).toBeNull();
    expect(screen.queryByTestId('calendar-footer')).toBeNull();
  });

  test('arrows go from year to year, and a month opens with a touch', () => {
    const { onNeedYears } = open(limits);
    tab('Any');
    fireEvent.press(screen.getByRole('button', { name: 'Any següent' }));
    expect(title()).toBe('2027');
    expect(onNeedYears).toHaveBeenLastCalledWith([2027]);
    fireEvent.press(screen.getByRole('button', { name: 'Any anterior' }));
    fireEvent.press(screen.getByRole('button', { name: 'Any anterior' }));
    fireEvent.press(screen.getByRole('button', { name: 'març de 2025' }));
    expect(screen.getByRole('radio', { name: 'Mes' }).props.accessibilityState.checked).toBe(true);
    expect(title()).toBe('Març de 2025');
    expect(screen.getByTestId('calendar-day-21')).toBeTruthy();
  });

  test('going back to the month keeps the month and the day chosen', () => {
    open(limits);
    tab('Any');
    fireEvent.press(screen.getByRole('button', { name: 'Any següent' }));
    tab('Mes');
    expect(title()).toBe('Setembre de 2026');
    expect(day('dilluns, 21 de setembre, festa').props.accessibilityState.selected).toBe(true);
  });

  test('at the first and the last year of the database, the arrows stop', () => {
    open({ ...limits, value: new Date(2017, 5, 1) });
    tab('Any');
    expect(screen.getByRole('button', { name: 'Any anterior' }).props.accessibilityState.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Any següent' }).props.accessibilityState.disabled).toBe(false);
  });
});

describe('the wheel of the liturgical year', () => {
  test('the year as a wheel, from Advent, with what comes next and its names', () => {
    const { onNeedYears, onNeedPreviews, rerender } = open();
    tab('Any litúrgic');
    expect(title()).toBe('2025–2026');
    expect(screen.getByLabelText('L’any litúrgic 2025–2026, any A')).toBeTruthy();
    expect(onNeedYears).toHaveBeenLastCalledWith([2025, 2026, 2027]);
    // The next three solemnities after today, 22 September: their names are asked for
    expect(onNeedPreviews).toHaveBeenLastCalledWith([
      new Date(2026, 8, 21),
      new Date(2026, 8, 24),
      new Date(2026, 10, 1),
      new Date(2026, 10, 22),
    ]);
    expect(screen.getByText('Properament')).toBeTruthy();
    const yearKey = screen.getByTestId('calendar-year-key', { includeHiddenElements: true });
    expect(within(yearKey).getByText('Advent i Quaresma', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solemnitat, Dijous, 24 de setembre' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solemnitat, Diumenge, 1 de novembre' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solemnitat, Diumenge, 22 de novembre' })).toBeTruthy();
    rerender({
      previews: { '2026-11-01': card('Setmana XXXI de durant l’any', celebration('Solemnitat', 'Tots Sants')) },
    });
    expect(screen.getByRole('button', { name: 'Tots Sants, Solemnitat · diumenge, 1 de novembre' })).toBeTruthy();
  });

  test('a date under the wheel opens its month with that day chosen', () => {
    const { onChange } = open();
    tab('Any litúrgic');
    fireEvent.press(screen.getByRole('button', { name: 'Solemnitat, Diumenge, 1 de novembre' }));
    expect(title()).toBe('Novembre de 2026');
    expect(day('diumenge, 1 de novembre, solemnitat').props.accessibilityState.selected).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'Selecciona' }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 10, 1));
  });

  test('another liturgical year shows its Ash Wednesday and its Easter', () => {
    const marks = {
      ...MARKS,
      ...yearOfMarks(2027, {
        '2027-02-10': { color: 'M', season: 'Quaresma', specificSeason: 'Q_CENDRA' },
        '2027-03-28': { color: 'B', letter: 'S', season: 'Pasqua', specificSeason: 'Q_DIUM_PASQUA' },
      }),
    };
    open({ marks });
    tab('Any litúrgic');
    fireEvent.press(screen.getByRole('button', { name: 'Any litúrgic següent' }));
    expect(title()).toBe('2026–2027');
    expect(screen.getByText('Dates principals')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dimecres de Cendra, 10 de febrer de 2027' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Diumenge de Pasqua, 28 de març de 2027' })).toBeTruthy();
  });

  test('each tab opens on the year of the one before: 2025 is 2024–2025, and the month of today, today’s', () => {
    open();
    tab('Any');
    fireEvent.press(screen.getByRole('button', { name: 'Any anterior' }));
    tab('Any litúrgic');
    expect(title()).toBe('2024–2025');
    tab('Any');
    expect(title()).toBe('2025');
    tab('Mes');
    fireEvent.press(screen.getByRole('button', { name: 'desembre de 2026' }));
    tab('Any litúrgic');
    // December 2026 is already the next liturgical year
    expect(title()).toBe('2026–2027');
  });
});

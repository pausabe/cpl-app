// The calendar of the home, on its own: the month painted with the liturgical year, the day touched
// before changing to it, the row of months, the whole year in small and the wheel of the
// liturgical year, the limits of the database, and the sheet it comes up in.
import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react-native';
import { renderWithTheme, styleOf, withTheme } from '../helpers/renderWithTheme';
import CalendarSheet from '../../src/views/home/CalendarSheet';

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

function open(props = {}) {
  const handlers = {
    onClose: jest.fn(),
    onToday: jest.fn(),
    onChange: jest.fn(),
    onNeedYears: jest.fn(),
    onNeedPreviews: jest.fn(),
  };
  const view = renderWithTheme(
    <CalendarSheet visible={true} value={new Date(2026, 8, 21, 10, 0)} marks={MARKS} {...handlers} {...props} />,
  );
  return { ...handlers, view };
}

const day = (name) => screen.getByRole('button', { name });
const fill = (n) => styleOf(screen.getByTestId(`calendar-day-${n}-fill`));

describe('the month', () => {
  test('it opens on the month of the day being shown, with that day chosen and today marked', () => {
    open();
    expect(screen.getByRole('button', { name: 'Setembre de 2026' })).toBeTruthy();
    expect(day('dilluns, 21 de setembre, festa').props.accessibilityState.selected).toBe(true);
    expect(styleOf(screen.getByTestId('calendar-day-21')).borderColor).toBe('#007B80');
    expect(styleOf(screen.getByTestId('calendar-day-20')).borderColor).toBe('transparent');
    expect(fill(22)).toMatchObject({ borderColor: '#00696D', borderWidth: 2 });
    expect(day('dimarts, 22 de setembre, avui')).toBeTruthy();
  });

  test('every day on its colour: a solemnity filled, a feast less, a memorial with a dot', () => {
    open();
    expect(fill(24).backgroundColor).toBe('#7A5F14');
    expect(fill(8).backgroundColor).toBe('#E9D9AA');
    expect(fill(14).backgroundColor).toBe('#EDB9B3');
    expect(fill(15).backgroundColor).toBe('#F7F1E3');
    expect(screen.getByTestId('calendar-day-15-memory')).toBeTruthy();
    // An optional memorial and a weekday, on the soft green, with nothing
    expect(fill(26).backgroundColor).toBe('#DDEEDA');
    expect(screen.queryByTestId('calendar-day-26-memory')).toBeNull();
    expect(day('dissabte, 26 de setembre, memòria lliure')).toBeTruthy();
    expect(fill(23).backgroundColor).toBe('#DDEEDA');
  });

  test('before its year is loaded the days are there, without colour, and it asks for the year', () => {
    const { onNeedYears } = open({ marks: {} });
    expect(onNeedYears).toHaveBeenCalledWith([2026]);
    expect(fill(24).backgroundColor).toBe('#F3F8F7');
    expect(day('dijous, 24 de setembre')).toBeTruthy();
  });

  test('under it, what every colour means: the four colours by their liturgical name, and from the weekday to the solemnity', () => {
    open({ marks: {} });
    const key = screen.getByTestId('calendar-key', { includeHiddenElements: true });
    const words = [
      "Durant l'any",
      'Advent i Quaresma',
      'Nadal i Pasqua',
      'Màrtirs i Pentecosta',
      'Fèria',
      'Memòria',
      'Festa',
      'Solemnitat',
      'Avui',
    ];
    for (const word of words) expect(within(key).getByText(word, { includeHiddenElements: true })).toBeTruthy();
    // Before the year is loaded too, so that the sheet does not jump; a screen reader skips it
    expect(screen.queryByText('Fèria')).toBeNull();
  });

  test('in dark mode, the dark colours', () => {
    renderWithTheme(
      <CalendarSheet
        visible={true}
        value={new Date(2026, 8, 21)}
        marks={MARKS}
        onClose={() => {}}
        onToday={() => {}}
        onChange={() => {}}
      />,
      { dark: true },
    );
    expect(styleOf(screen.getByTestId('calendar-day-21')).borderColor).toBe('#1F7F7B');
    expect(fill(24).backgroundColor).toBe('#E3C877');
    expect(fill(23).backgroundColor).toBe('#1F3424');
  });
});

describe('the day touched', () => {
  test('is chosen, says what it is before changing to it, and «Canvia» applies it', () => {
    const { onChange, onNeedPreviews, view } = open();
    expect(onNeedPreviews).toHaveBeenLastCalledWith([new Date(2026, 8, 21)]);
    fireEvent.press(day('dijous, 24 de setembre, solemnitat'));
    expect(onChange).not.toHaveBeenCalled();
    expect(onNeedPreviews).toHaveBeenLastCalledWith([new Date(2026, 8, 24)]);
    const preview = screen.getByTestId('calendar-preview');
    // The date at once, the rest when the controller has worked it out
    expect(within(preview).getByText('Dijous, 24 de setembre')).toBeTruthy();
    expect(within(preview).queryByText('Solemnitat')).toBeNull();
    view.rerender(
      withTheme(
        <CalendarSheet
          visible={true}
          value={new Date(2026, 8, 21, 10, 0)}
          marks={MARKS}
          previews={{
            '2026-09-24': card('Setmana XXV de durant l’any', {
              typeLabel: 'Solemnitat',
              title: 'Mare de Déu de la Mercè',
              muted: false,
              description: null,
              optionalMemory: null,
            }),
          }}
          onClose={() => {}}
          onToday={() => {}}
          onChange={onChange}
        />,
      ),
    );
    expect(within(screen.getByTestId('calendar-preview')).getByText('Mare de Déu de la Mercè')).toBeTruthy();
    expect(within(screen.getByTestId('calendar-preview')).getByText('Solemnitat')).toBeTruthy();
    expect(styleOf(screen.getByTestId('calendar-preview')).backgroundColor).toBe('#F7F1E3');
    fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 24));
  });

  test('an optional memorial that is not celebrated goes grey, as on the home', () => {
    open({
      previews: {
        '2026-09-21': card('Setmana XXV de durant l’any', {
          typeLabel: 'Memòria lliure',
          title: 'Sant Mateu',
          muted: true,
          description: null,
          optionalMemory: null,
        }),
      },
    });
    const preview = screen.getByTestId('calendar-preview');
    expect(styleOf(within(preview).getByText('Sant Mateu')).color).toBe('#475756');
  });

  test('«Avui» goes back to today, and touching outside closes it without changing the day', () => {
    const { onToday, onClose, onChange } = open();
    fireEvent.press(screen.getByRole('button', { name: 'Avui' }));
    expect(onToday).toHaveBeenCalled();
    fireEvent.press(day('dissabte, 26 de setembre, memòria lliure'));
    fireEvent.press(screen.getByTestId('calendar-backdrop', { includeHiddenElements: true }));
    expect(onClose).toHaveBeenCalled();
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
    expect(screen.getByRole('button', { name: 'Desembre de 2026' })).toBeTruthy();
    // At the end of the year, the next one is asked for, ready for a drag
    expect(onNeedYears).toHaveBeenLastCalledWith([2026, 2027]);
    fireEvent.press(screen.getByRole('button', { name: 'gener de 2027' }));
    expect(screen.getByRole('button', { name: 'Gener de 2027' })).toBeTruthy();
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
    fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 21));
  });
});

describe('the whole year', () => {
  const limits = { minimumDate: new Date(2017, 0, 3), maximumDate: new Date(2100, 11, 29) };

  test('the title of the month opens it: twelve months in small, the one shown framed', () => {
    open(limits);
    const title = screen.getByRole('button', { name: 'Setembre de 2026' });
    expect(title.props.accessibilityHint).toBe('Mostra l’any sencer');
    fireEvent.press(title);
    expect(screen.getByRole('button', { name: '2026' }).props.accessibilityHint).toBe('Torna al mes');
    const months = within(screen.getByTestId('calendar-year')).getAllByRole('button');
    expect(months).toHaveLength(12);
    expect(months[8].props.accessibilityLabel).toBe('setembre de 2026, el mes d’avui');
    expect(months[8].props.accessibilityState.selected).toBe(true);
    // No days and no row of months while the year shows
    expect(screen.queryByTestId('calendar-day-21')).toBeNull();
    expect(screen.queryByTestId('calendar-months')).toBeNull();
  });

  test('arrows go from year to year, and a month opens with a touch', () => {
    const { onNeedYears } = open(limits);
    fireEvent.press(screen.getByRole('button', { name: 'Setembre de 2026' }));
    fireEvent.press(screen.getByRole('button', { name: 'Any següent' }));
    expect(screen.getByRole('button', { name: '2027' })).toBeTruthy();
    expect(onNeedYears).toHaveBeenLastCalledWith([2027]);
    fireEvent.press(screen.getByRole('button', { name: 'Any anterior' }));
    fireEvent.press(screen.getByRole('button', { name: 'Any anterior' }));
    fireEvent.press(screen.getByRole('button', { name: 'març de 2025' }));
    expect(screen.getByRole('button', { name: 'Març de 2025' })).toBeTruthy();
    expect(screen.getByTestId('calendar-day-21')).toBeTruthy();
  });

  test('touching the title again goes back to the month, without changing it', () => {
    open(limits);
    fireEvent.press(screen.getByRole('button', { name: 'Setembre de 2026' }));
    fireEvent.press(screen.getByRole('button', { name: '2026' }));
    expect(screen.getByRole('button', { name: 'Setembre de 2026' })).toBeTruthy();
    expect(day('dilluns, 21 de setembre, festa').props.accessibilityState.selected).toBe(true);
  });

  test('at the first and the last year of the database, the arrows stop', () => {
    open({ ...limits, value: new Date(2017, 5, 1) });
    fireEvent.press(screen.getByRole('button', { name: 'Juny de 2017' }));
    expect(screen.getByRole('button', { name: 'Any anterior' }).props.accessibilityState.disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Any següent' }).props.accessibilityState.disabled).toBe(false);
  });
});

describe('the wheel of the liturgical year', () => {
  test('the year as a wheel, from Advent, with what comes next and its names', () => {
    const { onNeedYears, onNeedPreviews, view } = open();
    fireEvent.press(screen.getByRole('button', { name: 'Setembre de 2026' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Any litúrgic' }));
    expect(screen.getByRole('button', { name: '2025–2026' })).toBeTruthy();
    expect(screen.getByLabelText('L’any litúrgic 2025–2026, any A')).toBeTruthy();
    expect(onNeedYears).toHaveBeenLastCalledWith([2025, 2026, 2027]);
    // The next solemnities after today, 22 September: their names are asked for
    expect(onNeedPreviews).toHaveBeenLastCalledWith([
      new Date(2026, 8, 21),
      new Date(2026, 8, 24),
      new Date(2026, 10, 1),
    ]);
    expect(screen.getByText('Properament')).toBeTruthy();
    const yearKey = screen.getByTestId('calendar-year-key', { includeHiddenElements: true });
    expect(within(yearKey).getByText('Advent i Quaresma', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solemnitat, Dijous, 24 de setembre' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Solemnitat, Diumenge, 1 de novembre' })).toBeTruthy();
    view.rerender(
      withTheme(
        <CalendarSheet
          visible={true}
          value={new Date(2026, 8, 21, 10, 0)}
          marks={MARKS}
          previews={{
            '2026-11-01': card('Setmana XXXI de durant l’any', {
              typeLabel: 'Solemnitat',
              title: 'Tots Sants',
              muted: false,
              description: null,
              optionalMemory: null,
            }),
          }}
          onClose={() => {}}
          onToday={() => {}}
          onChange={() => {}}
        />,
      ),
    );
    expect(screen.getByRole('button', { name: 'Tots Sants, Solemnitat · diumenge, 1 de novembre' })).toBeTruthy();
  });

  test('a date under the wheel opens its month with that day chosen', () => {
    const { onChange } = open();
    fireEvent.press(screen.getByRole('button', { name: 'Setembre de 2026' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Any litúrgic' }));
    fireEvent.press(screen.getByRole('button', { name: 'Solemnitat, Diumenge, 1 de novembre' }));
    expect(screen.getByRole('button', { name: 'Novembre de 2026' })).toBeTruthy();
    expect(day('diumenge, 1 de novembre, solemnitat').props.accessibilityState.selected).toBe(true);
    fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
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
    fireEvent.press(screen.getByRole('button', { name: 'Setembre de 2026' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Any litúrgic' }));
    fireEvent.press(screen.getByRole('button', { name: 'Any litúrgic següent' }));
    expect(screen.getByRole('button', { name: '2026–2027' })).toBeTruthy();
    expect(screen.getByText('Dates principals')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Dimecres de Cendra, 10 de febrer de 2027' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Diumenge de Pasqua, 28 de març de 2027' })).toBeTruthy();
  });

  test('the year goes from one tab to the other: 2026 is 2025–2026 and back', () => {
    open();
    fireEvent.press(screen.getByRole('button', { name: 'Setembre de 2026' }));
    fireEvent.press(screen.getByRole('button', { name: 'Any anterior' }));
    fireEvent.press(screen.getByRole('radio', { name: 'Any litúrgic' }));
    expect(screen.getByRole('button', { name: '2024–2025' })).toBeTruthy();
    fireEvent.press(screen.getByRole('radio', { name: 'Mesos' }));
    expect(screen.getByRole('button', { name: '2025' })).toBeTruthy();
  });
});

import { DayMarkInput, DayMarks } from '../../src/view-models/calendar';
import {
  adventSunday,
  dayAtPoint,
  keyDates,
  liturgicalWheel,
  liturgicalYearOf,
  milestoneRow,
  pointAt,
  sectorPath,
  upcomingMilestones,
  WHEEL,
  yearOverview,
} from '../../src/view-models/liturgicalYear';

const today = new Date(2026, 9, 5, 10, 0);

const mark = (date: string, rest: Partial<DayMarkInput> = {}): DayMarkInput => ({
  date,
  color: 'V',
  letter: '-',
  specificSeason: 'O_ORDINAR',
  season: 'Ordinari',
  week: '27',
  yearType: 'A',
  ...rest,
});

const byDate = (...days: DayMarkInput[]): DayMarks => Object.fromEntries(days.map((day) => [day.date, day]));

describe('the first Sunday of Advent', () => {
  test('is the fourth Sunday before Christmas, from 27 November to 3 December', () => {
    expect(adventSunday(2025)).toEqual(new Date(2025, 10, 30));
    expect(adventSunday(2026)).toEqual(new Date(2026, 10, 29));
    // Christmas on a Sunday: the 27th
    expect(adventSunday(2022)).toEqual(new Date(2022, 10, 27));
    // Christmas on a Monday: the 3rd of December
    expect(adventSunday(2023)).toEqual(new Date(2023, 11, 3));
    for (let year = 2017; year <= 2100; year++) {
      const sunday = adventSunday(year);
      expect(sunday.getDay()).toBe(0);
      const day = sunday.getMonth() === 10 ? sunday.getDate() : sunday.getDate() + 30;
      expect(day).toBeGreaterThanOrEqual(27);
      expect(day).toBeLessThanOrEqual(33);
    }
  });

  test('opens the liturgical year: the days before it belong to the year before', () => {
    expect(liturgicalYearOf(today)).toBe(2025);
    expect(liturgicalYearOf(new Date(2026, 10, 28, 23))).toBe(2025);
    expect(liturgicalYearOf(new Date(2026, 10, 29, 0, 30))).toBe(2026);
    expect(liturgicalYearOf(new Date(2026, 0, 6))).toBe(2025);
  });
});

describe('the twelve months in small', () => {
  const marks = byDate(
    mark('2026-12-08', { color: 'B', letter: 'S', season: 'Advent' }),
    mark('2026-12-25', { color: 'B', letter: 'S', season: 'Nadal' }),
    mark('2026-12-01', { color: 'M', season: 'Advent' }),
    mark('2026-10-05', { color: 'B', letter: 'M' }),
  );
  const year = yearOverview({ year: 2026, marks, today, shown: { year: 2026, month: 11 } });

  test('every month with its days, Monday first, and its name', () => {
    expect(year.title).toBe('2026');
    expect(year.months.map((m) => m.name)).toEqual([
      'gener',
      'febrer',
      'març',
      'abril',
      'maig',
      'juny',
      'juliol',
      'agost',
      'setembre',
      'octubre',
      'novembre',
      'desembre',
    ]);
    // 1 December 2026 is a Tuesday
    expect(year.months[11].blanks).toBe(1);
    expect(year.months[11].days).toHaveLength(31);
    expect(year.months[1].days).toHaveLength(28);
  });

  test('a square in the colour of its season, whatever the day, and none before the year is loaded', () => {
    const december = year.months[11].days;
    // The Immaculate Conception, white, is a day of Advent; Christmas, of Christmas
    expect(december[7]).toMatchObject({ color: 'M' });
    expect(december[24]).toMatchObject({ color: 'B' });
    expect(december[0]).toMatchObject({ color: 'M' });
    expect(december[1].color).toBeNull();
  });

  test('the month shown is framed, and today is in its month', () => {
    expect(year.months.filter((m) => m.shown).map((m) => m.month)).toEqual([11]);
    expect(year.months[9]).toMatchObject({ current: true, label: 'octubre de 2026, el mes d’avui' });
    expect(year.months[9].days.filter((d) => d.today).map((d) => d.key)).toEqual(['5']);
    expect(year.months[11].label).toBe('desembre de 2026');
  });

  test('it goes from year to year inside the database, and a month outside it cannot be opened', () => {
    const limits = { minimum: new Date(2017, 0, 3), maximum: new Date(2100, 11, 29) };
    const first = yearOverview({ year: 2017, marks: {}, today, shown: { year: 2026, month: 0 }, ...limits });
    expect(first.canGoBack).toBe(false);
    expect(first.canGoForward).toBe(true);
    expect(first.months[0].disabled).toBe(false);
    const short = yearOverview({
      year: 2026,
      marks: {},
      today,
      shown: { year: 2026, month: 0 },
      minimum: new Date(2026, 2, 10),
      maximum: new Date(2026, 9, 20),
    });
    expect(short.months.filter((m) => m.disabled).map((m) => m.month)).toEqual([0, 1, 10, 11]);
    expect(short.canGoBack).toBe(false);
    expect(short.canGoForward).toBe(false);
  });
});

describe('the wheel of the liturgical year', () => {
  // The year 2025–2026 told in its seasons, with a few solemnities: Advent, Christmas, ordinary time,
  // Lent, the Triduum, Easter and ordinary time again up to the eve of Advent
  function yearOfSeasons(): DayMarks {
    const marks: DayMarks = {};
    const seasons: [string, string, string, string][] = [
      ['2025-11-30', 'Advent', 'A_SETMANES', 'M'],
      ['2025-12-25', 'Nadal', 'N_OCTAVA', 'B'],
      ['2026-01-12', 'Ordinari', 'O_ORDINAR', 'V'],
      ['2026-02-18', 'Quaresma', 'Q_CENDRA', 'M'],
      ['2026-02-22', 'Quaresma', 'Q_SETMANES', 'M'],
      ['2026-04-03', 'Tridu Pasqual', 'Q_TRIDU', 'R'],
      ['2026-04-05', 'Pasqua', 'Q_DIUM_PASQUA', 'B'],
      ['2026-04-06', 'Pasqua', 'P_OCTAVA', 'B'],
      ['2026-05-25', 'Ordinari', 'O_ORDINAR', 'V'],
      ['2026-11-29', '', '', ''],
    ];
    for (let s = 0; s < seasons.length - 1; s++) {
      const [from, season, specificSeason, color] = seasons[s];
      const [until] = seasons[s + 1];
      const [y, m, d] = from.split('-').map(Number);
      for (
        let date = new Date(y, m - 1, d);
        ;
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      ) {
        const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        if (iso === until) break;
        marks[iso] = mark(iso, { season, specificSeason, color, week: '1' });
      }
    }
    for (const solemnity of ['2025-12-08', '2025-12-25', '2026-04-05', '2026-11-01']) {
      marks[solemnity] = { ...marks[solemnity], letter: 'S', color: 'B' };
    }
    marks['2026-10-05'] = { ...marks['2026-10-05'], week: '27' };
    return marks;
  }

  const wheel = liturgicalWheel({ startYear: 2025, marks: yearOfSeasons(), today });

  test('goes from the first Sunday of Advent to the Saturday before the next one', () => {
    expect(wheel.title).toBe('2025–2026');
    expect(wheel.yearName).toBe('Any A');
    expect(wheel.first).toEqual(new Date(2025, 10, 30));
    expect(wheel.days).toBe(364);
    expect(wheel.label).toBe('L’any litúrgic 2025–2026, any A');
  });

  test('every season is a piece of the ring in its colour, whatever the colour of its days', () => {
    // The Immaculate Conception is white and All Saints too: the ring keeps the colour of their season
    expect(wheel.arcs.map((arc) => arc.color)).toEqual(['M', 'B', 'V', 'M', 'R', 'B', 'V']);
  });

  test('the seasons are named around it, inside the box; the Triduum is too short to be named', () => {
    expect(wheel.seasons.map((s) => s.text)).toEqual([
      'Advent',
      'Nadal',
      "Durant l'any",
      'Quaresma',
      'Pasqua',
      "Durant l'any",
    ]);
    for (const label of wheel.seasons) {
      const width = label.text.length * 6.4;
      const left = label.anchor === 'start' ? label.x : label.anchor === 'end' ? label.x - width : label.x - width / 2;
      expect(left).toBeGreaterThanOrEqual(0);
      expect(left + width).toBeLessThanOrEqual(WHEEL.width);
      expect(label.y).toBeGreaterThan(0);
      expect(label.y).toBeLessThan(WHEEL.height);
    }
    // A cut where each season begins, except the first: Ash Wednesday is already Lent
    expect(wheel.cuts).toHaveLength(6);
  });

  test('today is marked, and the middle says where it is in its season', () => {
    expect(wheel.today).not.toBeNull();
    expect(wheel.today!.label.text).toBe('avui');
    expect(wheel.todayTitle).toBe("Setmana XXVII de durant l'any");
    const another = liturgicalWheel({ startYear: 2026, marks: yearOfSeasons(), today });
    expect(another.today).toBeNull();
    expect(another.todayTitle).toBeNull();
    expect(another.yearName).toBe('');
  });

  test('a touch on the ring is a day of the year; away from it, nothing', () => {
    const top = pointAt((WHEEL.outer + WHEEL.inner) / 2, 0.5);
    expect(dayAtPoint(top.x, top.y, 364)).toBe(0);
    const bottom = pointAt((WHEEL.outer + WHEEL.inner) / 2, 180.5);
    expect(dayAtPoint(bottom.x, bottom.y, 364)).toBe(182);
    expect(dayAtPoint(WHEEL.cx, WHEEL.cy, 364)).toBeNull();
    expect(dayAtPoint(2, 2, 364)).toBeNull();
  });

  test('a piece of the ring is drawn from the outer edge to the inner one', () => {
    expect(sectorPath(0, 90)).toBe('M175 50A100 100 0 0 1 275 150L245 150A70 70 0 0 0 175 80Z');
    expect(sectorPath(0, 270)).toContain('A100 100 0 1 1');
  });

  test('it goes from year to year inside the database', () => {
    const limits = { minimum: new Date(2017, 0, 3), maximum: new Date(2100, 11, 29) };
    expect(liturgicalWheel({ startYear: 2016, marks: {}, today, ...limits }).canGoBack).toBe(false);
    expect(liturgicalWheel({ startYear: 2017, marks: {}, today, ...limits }).canGoBack).toBe(true);
    expect(liturgicalWheel({ startYear: 2099, marks: {}, today, ...limits }).canGoForward).toBe(true);
    expect(liturgicalWheel({ startYear: 2100, marks: {}, today, ...limits }).canGoForward).toBe(false);
  });
});

describe('the dates under the wheel', () => {
  const marks = byDate(
    mark('2026-10-12', { color: 'B', letter: 'F' }),
    mark('2026-11-01', { color: 'B', letter: 'S' }),
    mark('2026-11-22', { color: 'B', letter: 'S' }),
    mark('2026-11-29', { color: 'M', season: 'Advent', specificSeason: 'A_SETMANES', yearType: 'B' }),
    mark('2026-09-14', { color: 'R', letter: 'F' }),
    mark('2026-08-15', { color: 'B', letter: 'S' }),
  );

  test('in the year of today, the next solemnities and the start of the next year, the nearest first', () => {
    expect(upcomingMilestones(marks, today).map((m) => [m.key, m.kind])).toEqual([
      ['2026-11-01', 'solemnity'],
      ['2026-11-22', 'solemnity'],
    ]);
    expect(upcomingMilestones(marks, new Date(2026, 10, 23)).map((m) => [m.key, m.kind, m.yearType])).toEqual([
      ['2026-11-29', 'advent', 'B'],
    ]);
  });

  test('in another year, its Ash Wednesday and its Easter', () => {
    const lent = byDate(
      mark('2027-02-10', { color: 'M', season: 'Quaresma', specificSeason: 'Q_CENDRA' }),
      mark('2027-02-11', { color: 'M', season: 'Quaresma', specificSeason: 'Q_CENDRA' }),
      mark('2027-03-28', { color: 'B', letter: 'S', season: 'Pasqua', specificSeason: 'Q_DIUM_PASQUA' }),
    );
    expect(keyDates(2026, lent).map((m) => [m.key, m.kind])).toEqual([
      ['2027-02-10', 'ashes'],
      ['2027-03-28', 'easter'],
    ]);
  });

  test('each one in a row: the name of a solemnity once its day is worked out, and the date', () => {
    const [allSaints] = upcomingMilestones(marks, today);
    // All Saints is white, in ordinary time: its row has the colour of the season
    expect(milestoneRow(allSaints, null)).toMatchObject({
      title: 'Solemnitat',
      subtitle: 'Diumenge, 1 de novembre',
      color: 'V',
      kind: 'solemnity',
    });
    expect(milestoneRow(allSaints, 'Tots Sants')).toMatchObject({
      title: 'Tots Sants',
      subtitle: 'Solemnitat · diumenge, 1 de novembre',
      label: 'Tots Sants, Solemnitat · diumenge, 1 de novembre',
    });
    const [advent] = upcomingMilestones(marks, new Date(2026, 10, 23));
    expect(milestoneRow(advent, null)).toMatchObject({
      title: 'Diumenge I d’Advent',
      subtitle: 'Comença l’any B · 29 de novembre',
      color: 'M',
      kind: 'advent',
    });
    const easter = {
      key: '2027-03-28',
      date: new Date(2027, 2, 28),
      kind: 'easter' as const,
      color: 'B' as const,
      yearType: 'A',
    };
    expect(milestoneRow(easter, null)).toMatchObject({ title: 'Diumenge de Pasqua', subtitle: '28 de març de 2027' });
    const ashes = { ...easter, kind: 'ashes' as const, date: new Date(2027, 1, 10) };
    expect(milestoneRow(ashes, null)).toMatchObject({ title: 'Dimecres de Cendra', subtitle: '10 de febrer de 2027' });
  });
});

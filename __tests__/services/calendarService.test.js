// The calendar of each place, read from the tables calendars and calendar_days: a small database in
// memory with Catalonia, Barcelona (diocese, city, cathedral), Urgell and Andorra.
jest.mock('../../src/services/databaseManagerService', () => {
  const { DatabaseSync } = require('node:sqlite');
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE calendars (id TEXT PRIMARY KEY, parent TEXT, name TEXT NOT NULL, diocese TEXT, place TEXT,
      code TEXT, sort INTEGER NOT NULL);
    CREATE TABLE calendar_days (date TEXT NOT NULL, calendar TEXT NOT NULL, letter TEXT NOT NULL,
      moved TEXT NOT NULL, celebration TEXT NOT NULL, PRIMARY KEY (date, calendar)) WITHOUT ROWID;
    INSERT INTO calendars VALUES
      ('catalonia', NULL, 'Catalunya', NULL, NULL, NULL, 0),
      ('diocese-barcelona', 'catalonia', 'Barcelona', 'Barcelona', 'Diòcesi', 'BaD', 1),
      ('diocese-barcelona-city', 'diocese-barcelona', 'Barcelona', 'Barcelona', 'Ciutat', 'BaV', 2),
      ('diocese-barcelona-cathedral', 'diocese-barcelona-city', 'Barcelona', 'Barcelona', 'Catedral', 'BaC', 3),
      ('diocese-urgell', 'catalonia', 'Urgell', 'Urgell', 'Diòcesi', 'UrD', 4),
      ('diocese-andorra', 'diocese-urgell', 'Andorra', 'Andorra', 'Diòcesi', 'Andorra', 5);
    INSERT INTO calendar_days VALUES
      ('2026-05-03', 'catalonia', '-', '-', 'easter_time_5_sunday'),
      ('2026-05-04', 'catalonia', '-', '-', 'easter_time_5_monday'),
      ('2026-05-04', 'diocese-barcelona-cathedral', 'F', '-', 'philip_and_james_apostles'),
      ('2026-05-05', 'catalonia', '-', '-', 'easter_time_5_tuesday'),
      ('2026-05-05', 'diocese-barcelona-cathedral', 'S', '03-may', 'holy_cross_title_of_the_cathedral_of_barcelona'),
      ('2026-09-08', 'catalonia', 'F', '-', 'nativity_of_the_blessed_virgin_mary'),
      ('2026-09-08', 'diocese-andorra', 'S', '-', 'our_lady_of_meritxell');
  `);
  return {
    executeQueryAsync: async (query) => db.prepare(query).all(),
    openedDatabaseVersion: () => 1,
  };
});

const CalendarService = require('../../src/services/calendarService');

const settings = (dioceseName, prayingPlace) => ({ dioceseName, prayingPlace });

describe('the calendars of the database', () => {
  it('are read in their order', async () => {
    const calendars = await CalendarService.obtainCalendars();
    expect(calendars.map((calendar) => calendar.id)).toEqual([
      'catalonia',
      'diocese-barcelona',
      'diocese-barcelona-city',
      'diocese-barcelona-cathedral',
      'diocese-urgell',
      'diocese-andorra',
    ]);
  });

  it('give the calendar of a diocese and a place, and Andorra has one whatever the place', async () => {
    const calendars = await CalendarService.obtainCalendars();
    expect(CalendarService.calendarOfPlace(calendars, settings('Barcelona', 'Catedral')).id).toBe(
      'diocese-barcelona-cathedral',
    );
    expect(CalendarService.calendarOfPlace(calendars, settings('Andorra', 'Ciutat')).id).toBe('diocese-andorra');
    expect(CalendarService.calendarOfPlace(calendars, settings('Madrid', 'Diòcesi'))).toBeUndefined();
  });

  it('go up from a calendar to the root', async () => {
    const calendars = await CalendarService.obtainCalendars();
    const cathedral = calendars.find((calendar) => calendar.id === 'diocese-barcelona-cathedral');
    expect(CalendarService.chainOf(calendars, cathedral)).toEqual([
      'diocese-barcelona-cathedral',
      'diocese-barcelona-city',
      'diocese-barcelona',
      'catalonia',
    ]);
  });
});

describe('a day of a calendar', () => {
  const cathedral = ['diocese-barcelona-cathedral', 'diocese-barcelona-city', 'diocese-barcelona', 'catalonia'];
  const diocese = ['diocese-barcelona', 'catalonia'];

  it('is its own row when it has one, and its parent’s when it has not', async () => {
    expect(await CalendarService.calendarDay(new Date(2026, 4, 5), cathedral)).toEqual({
      letter: 'S',
      moved: '03-may',
      celebration: 'holy_cross_title_of_the_cathedral_of_barcelona',
    });
    expect(await CalendarService.calendarDay(new Date(2026, 4, 5), diocese)).toEqual({
      letter: '-',
      moved: '-',
      celebration: 'easter_time_5_tuesday',
    });
  });

  it('knows its celebration was moved to another day, only where it was', async () => {
    expect(await CalendarService.isMovedAway(new Date(2026, 4, 3), cathedral)).toBe(true);
    expect(await CalendarService.isMovedAway(new Date(2026, 4, 3), diocese)).toBe(false);
    expect(await CalendarService.isMovedAway(new Date(2026, 4, 4), cathedral)).toBe(false);
  });

  it('comes with its calendar for the place of the settings', async () => {
    const andorra = await CalendarService.obtainDayOfPlace(new Date(2026, 8, 8), settings('Andorra', 'Diòcesi'));
    expect(andorra.day.celebration).toBe('our_lady_of_meritxell');
    expect(andorra.chain).toEqual(['diocese-andorra', 'diocese-urgell', 'catalonia']);
    expect(await CalendarService.obtainDayOfPlace(new Date(2026, 8, 8), settings('Madrid', 'Diòcesi'))).toBeUndefined();
  });
});

describe('the place the app prays with', () => {
  const options = CalendarService.placeOptions([
    { id: 'spain', parent: null, name: 'España', diocese: 'España', place: 'Diòcesi', code: '-', sort: 0 },
  ]);

  it('is the one saved when the database has it', async () => {
    const catalan = CalendarService.placeOptions(await CalendarService.obtainCalendars());
    expect(CalendarService.resolvePlace(catalan, 'Barcelona', 'Catedral')).toEqual({
      diocese: 'Barcelona',
      place: 'Catedral',
    });
  });

  it('is the only place of its diocese when the one saved is not there, as in Andorra', async () => {
    const catalan = CalendarService.placeOptions(await CalendarService.obtainCalendars());
    expect(CalendarService.resolvePlace(catalan, 'Andorra', 'Ciutat')).toEqual({
      diocese: 'Andorra',
      place: 'Diòcesi',
    });
  });

  it('is the first calendar of another edition, before any place has been chosen in it', () => {
    expect(CalendarService.resolvePlace(options, '', '')).toEqual({ diocese: 'España', place: 'Diòcesi' });
  });
});

// What the app leaves for the widgets of the home screen, and where a touch on them goes
// (view-models/widgets): the contract with targets/widgets (iOS) and modules/cpl-widgets (Android).
import {
  HOUR_NAMES,
  bandAt,
  buildWidgetDay,
  buildWidgetPayload,
  dateOfDay,
  hourLink,
  inlineDate,
  isoDate,
  massLink,
  parseWidgetLink,
  shortCelebration,
  shortDate,
  widgetBands,
} from '../../src/view-models/widgets';
import { currentHour } from '../../src/view-models/hours';
import type { DayCard } from '../../src/view-models/dayCard';
import type { MassBlock } from '../../src/view-models/mass';

describe('the bands: the hour each widget shows, by the clock', () => {
  const bands = widgetBands();

  test('they cover the day, one after the other, with no gap', () => {
    expect(bands[0].from).toBe(0);
    expect(bands[bands.length - 1].to).toBe(24);
    bands.slice(1).forEach((band, index) => expect(band.from).toBe(bands[index].to));
  });

  test('those of the home, and the Office of Readings when the home marks none', () => {
    expect(bands.map(({ from, to, hour, now }) => [from, to, hour, now])).toEqual([
      [0, 2, 'completes', true],
      [2, 6, 'ofici', false],
      [6, 9, 'laudes', true],
      [9, 12, 'tercia', true],
      [12, 15, 'sexta', true],
      [15, 18, 'nona', true],
      [18, 24, 'vespres', true],
    ]);
    for (let hour = 0; hour < 24; hour++) {
      const band = bandAt(bands, hour);
      expect(band.now ? band.hour : null).toBe(currentHour(hour));
    }
  });

  test('from midnight to 2 h, the Completes of the day before', () => {
    expect(bandAt(bands, 1)).toMatchObject({ hour: 'completes', yesterday: true });
    expect(bands.filter((band) => band.yesterday)).toHaveLength(1);
  });
});

test('the dates where there is little room', () => {
  const friday = new Date(2026, 9, 9);
  expect(isoDate(friday)).toBe('2026-10-09');
  expect(shortDate(friday)).toBe('Divendres 9 oct.');
  expect(inlineDate(friday)).toBe('dv. 9');
  // «març», «maig» and «juny» have no abbreviation
  expect(shortDate(new Date(2027, 2, 21))).toBe('Diumenge 21 març');
  expect(inlineDate(new Date(2027, 2, 21))).toBe('dg. 21');
  expect(isoDate(dateOfDay('2026-12-25'))).toBe('2026-12-25');
});

test('the name of a celebration up to its first comma', () => {
  expect(shortCelebration('Santa Teresa de Jesús, verge i doctora de l’Església')).toBe('Santa Teresa de Jesús');
  expect(shortCelebration('Nadal')).toBe('Nadal');
});

const card: DayCard = {
  place: 'Barcelona (Diòcesi)',
  dateText: 'Dijous, 15 d’octubre',
  colorCode: 'B',
  colorName: 'Blanc',
  title: "Setmana XXVIII de durant l'any",
  meta: 'Any A · Setmana IV del salteri',
  celebration: {
    typeLabel: 'Festa',
    title: 'Santa Teresa de Jesús, verge i doctora de l’Església',
    muted: false,
    description: null,
    optionalMemory: null,
  },
};
const mass = {
  gospel: { caption: 'Evangeli · Mt 11,25-30', phrase: 'Soc benèvol i humil de cor', opens: 'Evangeli' },
} as MassBlock;

test('a day as the widgets read it', () => {
  expect(buildWidgetDay({ date: new Date(2026, 9, 15), card, vespers: null, mass })).toEqual({
    date: '2026-10-15',
    dateText: 'Dijous, 15 d’octubre',
    shortDate: 'Dijous 15 oct.',
    inlineDate: 'dj. 15',
    title: "Setmana XXVIII de durant l'any",
    meta: 'Any A · Setmana IV del salteri',
    color: 'B',
    celebration: {
      type: 'Festa',
      title: 'Santa Teresa de Jesús, verge i doctora de l’Església',
      short: 'Santa Teresa de Jesús',
      muted: false,
    },
    vespers: null,
    gospel: { caption: 'Evangeli · Mt 11,25-30', phrase: 'Soc benèvol i humil de cor', opens: 'Evangeli' },
  });
  // Without a phrase (the Passion), no Gospel on the widget
  const passion = { gospel: { caption: 'Evangeli · Mt 26,14–27,66', phrase: null, opens: 'Evangeli' } } as MassBlock;
  expect(buildWidgetDay({ date: new Date(2026, 2, 29), card, vespers: null, mass: passion }).gospel).toBeNull();
});

test('the whole of it, with the names of the hours', () => {
  const written = new Date(2026, 9, 9, 8);
  const payload = buildWidgetPayload([], written);
  expect(payload).toMatchObject({ version: 1, writtenAt: written.toISOString(), days: [] });
  expect(payload.bands).toEqual(widgetBands());
  expect(payload.hourNames).toEqual(HOUR_NAMES);
  expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
});

describe('the links of the widgets', () => {
  test('an hour of a day, the readings of a Mass, the home', () => {
    expect(hourLink('completes', '2026-10-08')).toBe('cpl://hour/completes?day=2026-10-08');
    expect(parseWidgetLink(hourLink('completes', '2026-10-08'))).toEqual({
      kind: 'hour',
      hour: 'completes',
      day: '2026-10-08',
    });
    expect(parseWidgetLink(massLink('Rams', '2027-03-21'))).toEqual({ kind: 'mass', opens: 'Rams', day: '2027-03-21' });
    expect(parseWidgetLink('cpl://today')).toEqual({ kind: 'today' });
    expect(parseWidgetLink('cpl://today/')).toEqual({ kind: 'today' });
  });

  test('anything else is not one of them', () => {
    for (const url of [
      null,
      undefined,
      '',
      'https://cpl.es',
      'cpl://hour/matines?day=2026-10-08',
      'cpl://hour/laudes',
      'cpl://hour/laudes?day=2026-02-30',
      'cpl://hour/laudes?day=ahir',
      'cpl://mass/Credo?day=2026-10-08',
      'cpl://settings',
      'exp+cplapp://expo-development-client/?url=http%3A%2F%2F10.0.2.2%3A8081',
    ]) {
      expect(parseWidgetLink(url)).toBeNull();
    }
  });
});

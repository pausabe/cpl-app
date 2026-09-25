import {
  dayAndMonth,
  longDate,
  lowerFirst,
  monthName,
  ofMonth,
  romanize,
  singleLine,
  weekdayName,
} from '../../src/view-models/catalanText';

test('the days of the week, from Sunday to Saturday as Date.getDay()', () => {
  expect([0, 1, 2, 3, 4, 5, 6].map(weekdayName)).toEqual([
    'Diumenge',
    'Dilluns',
    'Dimarts',
    'Dimecres',
    'Dijous',
    'Divendres',
    'Dissabte',
  ]);
  expect(weekdayName(7)).toBe('');
});

test('the months, and the preposition that takes an apostrophe before a vowel', () => {
  expect(monthName(8)).toBe('setembre');
  expect([0, 3, 7, 9].map(ofMonth)).toEqual(['de gener', 'd’abril', 'd’agost', 'd’octubre']);
  expect(ofMonth(2)).toBe('de març');
});

test('the date in words, as on the day card', () => {
  expect(longDate(new Date(2026, 8, 21))).toBe('Dilluns, 21 de setembre');
  expect(longDate(new Date(2026, 9, 31))).toBe('Dissabte, 31 d’octubre');
  expect(longDate(new Date(2026, 3, 5))).toBe('Diumenge, 5 d’abril');
  expect(dayAndMonth(new Date(2026, 7, 1))).toBe('1 d’agost');
  expect(lowerFirst('Dilluns, 21 de setembre')).toBe('dilluns, 21 de setembre');
});

test('the Roman numerals of the weeks', () => {
  expect(['1', '4', '9', '14', '25', '26', '30', '34'].map(romanize)).toEqual([
    'I',
    'IV',
    'IX',
    'XIV',
    'XXV',
    'XXVI',
    'XXX',
    'XXXIV',
  ]);
  expect(romanize('0')).toBe('');
  expect(romanize('.')).toBe('');
  expect(romanize(undefined)).toBe('');
});

test('a phrase on a single line, without touching its words', () => {
  expect(singleLine('Alegreu-vos i feu festa,\nperquè la vostra recompensa és gran en el cel')).toBe(
    'Alegreu-vos i feu festa, perquè la vostra recompensa és gran en el cel',
  );
  expect(singleLine('  Vine amb mi.  ')).toBe('Vine amb mi.');
});

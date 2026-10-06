// MIGRA-026: a cell the join holds goes to saints-app without Catalan. The export merged without
// ever taking a key away, so a text an earlier run had written outlived the join's verdict: on
// 6 October 2026, 192 cells, among them the Saturday IV first Vespers showing Our Lady of the
// Pillar's short reading and intercessions on 10 October.
//
//   npx jest migration-to-saints/export-held.test.js

const { clearHeld } = require('./export-to-saints-app');

test('a held cell loses the text an earlier export left in it', () => {
  const dest = { 3383: 'Ga 4, 4-7', 129: 'Cf. Is 61, 10' };
  expect(clearHeld(dest, ['3383'], {})).toEqual(['3383']);
  expect(dest).toEqual({ 129: 'Cf. Is 61, 10' });
});

test('a cell the join resolved, or one never written, is left alone', () => {
  const dest = { 3383: '2Pe 1, 19-21' };
  expect(clearHeld(dest, ['3383', '3384'], { 3383: '2Pe 1, 19-21' })).toEqual([]);
  expect(dest).toEqual({ 3383: '2Pe 1, 19-21' });
});

test('the cells Pau decided to leave empty are cleared too', () => {
  const { DECIDED_EMPTY } = require('./lib/preces-alignment');
  // Saturday III Lauds: the cross had gone into the Spanish-only intercession's cell.
  expect(DECIDED_EMPTY.has('preces_contenido/2286')).toBe(true);
  expect(DECIDED_EMPTY.has('preces_contenido/9573')).toBe(true);
});

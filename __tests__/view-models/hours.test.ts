import { buildHours, currentHour, vespersSubtitle } from '../../src/view-models/hours';

test('the hour of now, with the same bands as before', () => {
  const byHour = Array.from({ length: 24 }, (_, h) => currentHour(h));
  expect(byHour).toEqual([
    'completes',
    'completes',
    null,
    null,
    null,
    null,
    'laudes',
    'laudes',
    'laudes',
    'tercia',
    'tercia',
    'tercia',
    'sexta',
    'sexta',
    'sexta',
    'nona',
    'nona',
    'nona',
    'vespres',
    'vespres',
    'vespres',
    'vespres',
    'vespres',
    'vespres',
  ]);
});

test('seven tiles, in the order of the day, and only the one of now marked', () => {
  const tiles = buildHours({ vespersTitle: '', specificLiturgyTime: 'O_ORDINAR', hour: 7 });
  expect(tiles.map((t) => t.label)).toEqual([
    'Ofici de lectura',
    'Laudes',
    'Tèrcia',
    'Sexta',
    'Nona',
    'Vespres',
    'Completes',
  ]);
  expect(tiles.map((t) => t.screenType)).toEqual([
    'Ofici',
    'Laudes',
    'Tèrcia',
    'Sexta',
    'Nona',
    'Vespres',
    'Completes',
  ]);
  expect(tiles.filter((t) => t.isNow).map((t) => t.key)).toEqual(['laudes']);
  expect(buildHours({ vespersTitle: '', specificLiturgyTime: 'O_ORDINAR', hour: 3 }).some((t) => t.isNow)).toBe(false);
});

test('first Vespers appear under Vespers, except on Easter Sunday', () => {
  const tiles = buildHours({ vespersTitle: 'Tots Sants', specificLiturgyTime: 'O_ORDINAR', hour: 19 });
  expect(tiles.find((t) => t.key === 'vespres')!.subtitle).toBe('Tots Sants');
  expect(tiles.filter((t) => t.key !== 'vespres').every((t) => t.subtitle === null)).toBe(true);
  expect(vespersSubtitle('Diumenge de Pasqua', 'Q_DIUM_PASQUA')).toBeNull();
  expect(vespersSubtitle('-', 'O_ORDINAR')).toBeNull();
  expect(vespersSubtitle('', 'O_ORDINAR')).toBeNull();
});

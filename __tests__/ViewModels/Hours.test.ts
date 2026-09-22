import { buildHours, currentHour, vespersSubtitle } from '../../src/ViewModels/Hours';

test('l’hora d’ara, amb les mateixes franges d’abans', () => {
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

test('set fitxes, en l’ordre del dia, i només la d’ara marcada', () => {
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

test('les primeres vespres surten sota Vespres, excepte el Diumenge de Pasqua', () => {
  const tiles = buildHours({ vespersTitle: 'Tots Sants', specificLiturgyTime: 'O_ORDINAR', hour: 19 });
  expect(tiles.find((t) => t.key === 'vespres')!.subtitle).toBe('Tots Sants');
  expect(tiles.filter((t) => t.key !== 'vespres').every((t) => t.subtitle === null)).toBe(true);
  expect(vespersSubtitle('Diumenge de Pasqua', 'Q_DIUM_PASQUA')).toBeNull();
  expect(vespersSubtitle('-', 'O_ORDINAR')).toBeNull();
  expect(vespersSubtitle('', 'O_ORDINAR')).toBeNull();
});

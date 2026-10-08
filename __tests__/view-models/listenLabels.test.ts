// What the player says of the hour being read aloud
import { clock, listenLabels, partOf } from '../../src/view-models/speech/listenLabels';

const pieces = [
  { kind: 'secció', text: 'Himne.' },
  { kind: 'estrofa', text: 'Estrofa.' },
  { kind: 'títol', text: 'Salm 50. Oració de penediment.' },
  { kind: 'estrofa', text: 'Estrofa.' },
];
const base = { title: 'Laudes', position: 171, seconds: 780, progress: 1, mode: 'audio' as const, index: 3, pieces };

test('the part is the last title the reader said', () => {
  expect(partOf(pieces, 1, 'Laudes')).toBe('Himne');
  expect(partOf(pieces, 3, 'Laudes')).toBe('Salm 50. Oració de penediment');
  expect(partOf([], 0, 'Laudes')).toBe('Laudes');
});

test('minutes and seconds', () => {
  expect(clock(171)).toBe('2:51');
  expect(clock(780)).toBe('13:00');
});

test('what it says while playing, getting the audio, waiting, and with the phone’s voice', () => {
  expect(listenLabels({ ...base, phase: 'playing' })).toEqual({
    part: 'Salm 50. Oració de penediment',
    subtitle: 'Laudes · 2:51 de 13:00',
    time: '2:51 de 13:00',
    progress: 171 / 780,
  });
  expect(listenLabels({ ...base, phase: 'preparing', progress: 0.4, seconds: 0 }).subtitle).toBe(
    "Preparant l'àudio… 40 %",
  );
  expect(listenLabels({ ...base, phase: 'waiting' }).subtitle).toBe("Esperant la resta de l'àudio…");
  expect(listenLabels({ ...base, phase: 'playing', mode: 'device' }).subtitle).toBe('Laudes · veu del telèfon');
});

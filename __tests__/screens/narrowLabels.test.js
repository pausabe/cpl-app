// On a phone 320 px wide the labels in boxes of fixed width broke words in two: "Lau / des" next
// to the "Ara" badge, "Automàti / c" in the dark mode. A label gets smaller before that happens,
// down to 70 %, and the app works the size out itself (components/FitLabel): with
// adjustsFontSizeToFit, iOS took no notice of the 70 % and drew «Vespres» and «Completes» on the
// home at 4 pt (9.2.4 and 9.2.5). The tests used to check that the prop was passed, which it was.
// Jest does not measure text, so here the layout events say how much room there is and how much
// the label needs.
import fs from 'fs';
import path from 'path';
import React from 'react';
import { Text } from 'react-native';
import { screen, within, fireEvent } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import HoursGrid from '../../src/views/home/HoursGrid';
import CalendarScreen from '../../src/views/calendar/CalendarScreen';
import SegmentedControl from '../../src/components/SegmentedControl';
import FitLabel, { labelScale, MIN_LABEL_SCALE } from '../../src/components/FitLabel';
import { buildHours } from '../../src/view-models/hours';
import { THEME_SEGMENTS } from '../../src/components/TextSettingsSheet';

const hoursAt = (hour) => buildHours({ vespersTitle: '', specificLiturgyTime: '', hour });
const layout = (element, width, height = 22) =>
  fireEvent(element, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } });

// Inside a tile, a segment or a chip: the label as it is drawn, the room it has, and what it
// needs at its full size (the whole of it on one line, and its widest word)
function label(scope, text) {
  const hidden = { includeHiddenElements: true };
  const part = (testID) => within(scope).getByTestId(testID, hidden);
  return {
    drawn: () => within(scope).getByText(text),
    room: (width, height = 22) => layout(part('fit-label-room'), width, height),
    needs: (line, word = line, height = 22) => {
      layout(part('fit-label-line'), line, height);
      layout(part('fit-label-word'), word, height);
    },
  };
}

const fontSizeOf = (element) => styleOf(element).fontSize;

// What a label measures: its room, and at its full size the line and the widest word
const measures = (room, line, word, words = 1) => ({
  room: { width: room[0], height: room[1] },
  line: { width: line[0], height: line[1] },
  word,
  words,
});

test('as much smaller as the room asks, never below 70 %, and at its size until it is measured', () => {
  expect(MIN_LABEL_SCALE).toBe(0.7);
  expect(labelScale(measures([0, 0], [0, 0], 0))).toBe(1);
  expect(labelScale(measures([120, 22], [0, 0], 0))).toBe(1);
  // It fits, or misses it by the rounding of a pixel
  expect(labelScale(measures([120, 22], [60, 22], 60))).toBe(1);
  expect(labelScale(measures([59.7, 21.7], [60, 22], 60))).toBe(1);
  // A word 60 wide in 54: 90 %, and a hair less so that it is not cut
  expect(labelScale(measures([54, 22], [60, 22], 60))).toBeCloseTo(0.9 * 0.98);
  expect(labelScale(measures([10, 22], [60, 22], 60))).toBe(0.7);
  expect(labelScale(measures([10, 22], [60, 22], 60), 0.8)).toBe(0.8);
});

test('a name of more words: two lines if they fit, one line if only one fits, whichever is bigger', () => {
  // "Ofici de lectura" in a tile 123 wide: two lines, at its size
  expect(labelScale(measures([123, 44], [200, 22], 90, 3))).toBe(1);
  // With the system's text at its largest the tile has room for a line and a half (iPhone,
  // 9-10-2026): two lines 42 high, and not one line at 60 %, nor «Ofici de l…»
  expect(labelScale(measures([123, 42], [200, 28.5], 90, 3))).toBeCloseTo((42 / 57) * 0.98);
  // Wide but low: one line
  expect(labelScale(measures([180, 26], [200, 22], 90, 3))).toBeCloseTo((180 / 200) * 0.98);
});

test('one word, one line; a name of more words, two', () => {
  renderWithTheme(
    <>
      <FitLabel style={{ fontSize: 20 }}>Laudes</FitLabel>
      <FitLabel style={{ fontSize: 20 }}>Ofici de lectura</FitLabel>
    </>,
  );
  expect(screen.getByText('Laudes').props.numberOfLines).toBe(1);
  expect(screen.getByText('Ofici de lectura').props.numberOfLines).toBe(2);

  // Its widest word is measured among all of them, and the whole name on one line
  const hidden = { includeHiddenElements: true };
  const words = screen.getAllByTestId('fit-label-word', hidden)[1];
  expect(
    within(words)
      .getAllByText(/./, hidden)
      .map((t) => t.props.children),
  ).toEqual(['Ofici', 'de', 'lectura']);
  expect(screen.getAllByTestId('fit-label-line', hidden)[1].props).toMatchObject({
    numberOfLines: 1,
    children: 'Ofici de lectura',
  });
});

test('a label drawn in a box smaller than it gets smaller, and back to its size when there is room', () => {
  renderWithTheme(<FitLabel style={{ fontSize: 20, lineHeight: 24 }}>Completes</FitLabel>);
  const completes = label(screen.root, 'Completes');
  expect(fontSizeOf(completes.drawn())).toBe(20);

  completes.needs(100, 100, 24);
  completes.room(90, 24);
  expect(fontSizeOf(completes.drawn())).toBeCloseTo(20 * 0.9 * 0.98);
  // Its lines as much smaller, so that what has room for them in height still does
  expect(styleOf(completes.drawn()).lineHeight).toBeCloseTo(24 * 0.9 * 0.98);

  completes.room(200, 24);
  expect(fontSizeOf(completes.drawn())).toBe(20);
  expect(styleOf(completes.drawn()).lineHeight).toBe(24);
});

test('the hours: «Vespres» and «Completes» never below 70 %, however small the box iOS lays them out in', () => {
  renderWithTheme(<HoursGrid hours={hoursAt(7)} onOpen={jest.fn()} />);
  for (const key of ['vespres', 'completes', 'laudes', 'ofici', 'tercia']) {
    const tile = screen.getByTestId(`hour-${key}`);
    const name = within(tile).getByText(/./);
    const full = fontSizeOf(name);
    expect(full).toBe(16.5);

    const hour = label(tile, name.props.children);
    hour.needs(62, 62, 19);
    // The box of 9.2.5: nearly nothing
    hour.room(4, 19);
    expect(fontSizeOf(hour.drawn())).toBeCloseTo(full * 0.7);
    // A phone with room
    hour.room(120, 19);
    expect(fontSizeOf(hour.drawn())).toBe(full);
  }
});

test('no label is left to adjustsFontSizeToFit: on iOS it ignores minimumFontScale', () => {
  const src = path.resolve(__dirname, '../../src');
  const files = (dir) =>
    fs
      .readdirSync(dir, { withFileTypes: true })
      .flatMap((entry) => (entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))
      .filter((file) => /\.(js|jsx|ts|tsx)$/.test(file));
  // The code without its comments: FitLabel names them to say why it does not use them
  const code = (file) =>
    fs
      .readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
  const users = files(src)
    .filter((file) => /adjustsFontSizeToFit|minimumFontScale/.test(code(file)))
    .map((file) => path.relative(src, file));
  expect(users).toEqual([]);

  // And in the hours on the screen, none of the texts drawn carries it
  renderWithTheme(<HoursGrid hours={hoursAt(19)} onOpen={jest.fn()} />);
  for (const text of screen.UNSAFE_getAllByType(Text)) {
    expect(text.props.adjustsFontSizeToFit).toBeUndefined();
  }
});

test('the hours: «Ara» only goes beside the name if it fits', () => {
  renderWithTheme(<HoursGrid hours={hoursAt(7)} onOpen={jest.fn()} />);

  // Until it knows the room there is, the tile does not show it
  const line = within(screen.getByTestId('hour-laudes')).getByTestId('hour-laudes-title');
  expect(screen.queryByTestId('hour-now-badge')).toBeNull();
  const measure = screen.getByTestId('hour-laudes-measure', { includeHiddenElements: true });

  // "Laudes" and "Ara" need 120 and the line has 200: side by side
  layout(line, 200);
  layout(measure, 120);
  expect(within(within(line).getByTestId('hour-now-badge')).getByText('Ara')).toBeTruthy();

  // On a narrow phone they need more than the line has: only the filled tile
  layout(measure, 230);
  expect(screen.queryByTestId('hour-now-badge')).toBeNull();
  expect(screen.getByRole('button', { name: 'Laudes' }).props.accessibilityValue).toEqual({ text: 'Ara' });
});

test('the minor hours, three to a row, carry no «Ara»: only the filled background', () => {
  renderWithTheme(<HoursGrid hours={hoursAt(10)} onOpen={jest.fn()} />);
  expect(screen.getByRole('button', { name: 'Tèrcia' }).props.accessibilityValue).toEqual({ text: 'Ara' });
  expect(screen.queryByTestId('hour-now-badge')).toBeNull();
  expect(screen.queryByTestId('hour-tercia-measure', { includeHiddenElements: true })).toBeNull();
  expect(screen.getByText('Tèrcia').props.numberOfLines).toBe(1);
});

test('the theme options are not broken, and get smaller in a narrow segment', () => {
  renderWithTheme(
    <SegmentedControl segments={THEME_SEGMENTS} value="Automàtic" onChange={jest.fn()} accessibilityLabel="Tema" />,
  );
  for (const text of ['Automàtic', 'Clar', 'Fosc']) {
    expect(screen.getByText(text).props.numberOfLines).toBe(1);
  }
  const automatic = label(screen.getByRole('radio', { name: 'Automàtic' }), 'Automàtic');
  automatic.needs(80);
  automatic.room(64);
  expect(fontSizeOf(automatic.drawn())).toBeCloseTo(15 * 0.8 * 0.98);
});

test('the month of the calendar is not broken in two', () => {
  renderWithTheme(<CalendarScreen value={new Date(2026, 8, 21)} onToday={jest.fn()} onChange={jest.fn()} />);
  const title = screen.getByTestId('calendar-title');
  expect(title.props.children).toBe('Setembre de 2026');
  expect(title.props.numberOfLines).toBe(2);
  expect(title.props.accessibilityRole).toBe('header');
});

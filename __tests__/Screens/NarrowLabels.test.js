// On a phone 320 px wide the labels in boxes of fixed width broke words in two: "Lau / des" next
// to the "Ara" badge, "Automàti / c" in the dark mode. Jest does not measure text, so these tests
// check what the layout relies on: a word keeps to one line and gets smaller if it has to, and
// the badge can go under the name.
import React from 'react';
import { screen, within } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import HoursGrid from '../../src/Views/Home/HoursGrid';
import CalendarDialog from '../../src/Views/Home/CalendarDialog';
import SegmentedControl from '../../src/Components/SegmentedControl';
import { buildHours } from '../../src/ViewModels/Hours';
import { fitLabel } from '../../src/Theme';
import { THEME_SEGMENTS } from '../../src/Components/TextSettingsSheet';

const hoursAt = (hour) => buildHours({ vespersTitle: '', specificLiturgyTime: '', hour });

// The Text that draws a label (not the Pressable around it)
const label = (text) => screen.getByText(text);

test('una paraula, una línia; un nom de més paraules, dues; i sempre es pot fer més petit', () => {
  expect(fitLabel('Laudes')).toEqual({ numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.7 });
  expect(fitLabel('Ofici de lectura')).toMatchObject({ numberOfLines: 2, adjustsFontSizeToFit: true });
});

test('les hores: el nom no es parteix, i «Ara» va dins la línia del nom, on pot baixar a sota', () => {
  renderWithTheme(<HoursGrid hours={hoursAt(7)} onOpen={jest.fn()}/>);
  expect(label('Laudes').props).toMatchObject({ numberOfLines: 1, adjustsFontSizeToFit: true });
  expect(label('Completes').props).toMatchObject({ numberOfLines: 1, adjustsFontSizeToFit: true });
  expect(label('Ofici de lectura').props).toMatchObject({ numberOfLines: 2, adjustsFontSizeToFit: true });

  // The name and the badge share a line that wraps
  const line = within(screen.getByTestId('hour-laudes')).getByTestId('hour-laudes-title');
  expect(styleOf(line)).toMatchObject({ flexDirection: 'row', flexWrap: 'wrap' });
  expect(within(line).getByText('Laudes')).toBeTruthy();
  expect(within(within(line).getByTestId('hour-now-badge')).getByText('Ara')).toBeTruthy();
});

test('les hores menors, tres per fila, també diuen «Ara», que hi baixa a sota del nom', () => {
  renderWithTheme(<HoursGrid hours={hoursAt(10)} onOpen={jest.fn()}/>);
  expect(screen.getByRole('button', { name: 'Tèrcia' }).props.accessibilityValue).toEqual({ text: 'Ara' });
  const line = within(screen.getByTestId('hour-tercia')).getByTestId('hour-tercia-title');
  expect(styleOf(line)).toMatchObject({ flexDirection: 'row', flexWrap: 'wrap' });
  expect(within(within(line).getByTestId('hour-now-badge')).getByText('Ara')).toBeTruthy();
  expect(screen.getAllByTestId('hour-now-badge')).toHaveLength(1);
  expect(label('Tèrcia').props).toMatchObject({ numberOfLines: 1, adjustsFontSizeToFit: true });
});

test('les opcions del tema no es parteixen', () => {
  renderWithTheme(<SegmentedControl segments={THEME_SEGMENTS} value="Automàtic" onChange={jest.fn()} accessibilityLabel="Tema"/>);
  for (const text of ['Automàtic', 'Clar', 'Fosc']) {
    expect(label(text).props).toMatchObject({ numberOfLines: 1, adjustsFontSizeToFit: true });
  }
});

test('els botons del calendari no es parteixen', () => {
  renderWithTheme(
    <CalendarDialog visible={true} value={new Date(2026, 8, 21)} onCancel={jest.fn()} onToday={jest.fn()} onChange={jest.fn()}/>);
  for (const text of ['Cancel·la', 'Avui', 'Canvia']) {
    expect(label(text).props).toMatchObject({ numberOfLines: 1, adjustsFontSizeToFit: true });
  }
});

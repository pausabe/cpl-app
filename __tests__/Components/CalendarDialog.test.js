// The calendar of the home, on its own: months, the day chosen, today, and the limits of the
// database.
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import CalendarDialog from '../../src/Views/Home/CalendarDialog';

const NOW = new Date(2026, 8, 22, 10, 0);

beforeAll(() => {
  jest.useFakeTimers({ now: NOW, advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});

function open(props = {}) {
  const handlers = { onCancel: jest.fn(), onToday: jest.fn(), onChange: jest.fn() };
  renderWithTheme(<CalendarDialog visible={true} value={new Date(2026, 8, 21, 10, 0)} {...handlers} {...props}/>);
  return handlers;
}

test('s’obre al mes del dia que es mostra, amb aquell dia triat i avui marcat', () => {
  open();
  expect(screen.getByRole('header', { name: 'setembre de 2026' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'dilluns, 21 de setembre' }).props.accessibilityState.selected).toBe(true);
  expect(styleOf(screen.getByTestId('calendar-day-21')).backgroundColor).toBe('#007B80');
  expect(styleOf(screen.getByTestId('calendar-day-22'))).toMatchObject({ borderColor: '#00696D' });
});

test('es tria un dia i «Canvia» l’aplica', () => {
  const { onChange } = open();
  fireEvent.press(screen.getByRole('button', { name: 'dissabte, 26 de setembre' }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 26));
});

test('«Avui» i «Cancel·la»', () => {
  const { onToday, onCancel } = open();
  fireEvent.press(screen.getByRole('button', { name: 'Avui' }));
  expect(onToday).toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Cancel·la' }));
  expect(onCancel).toHaveBeenCalled();
});

test('es passa de mes endavant i enrere, també d’any', () => {
  open({ value: new Date(2026, 11, 30) });
  fireEvent.press(screen.getByRole('button', { name: 'Mes següent' }));
  expect(screen.getByText('gener de 2027')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Mes anterior' }));
  fireEvent.press(screen.getByRole('button', { name: 'Mes anterior' }));
  expect(screen.getByText('novembre de 2026')).toBeTruthy();
});

test('fora de la base de dades, els dies no es poden triar ni s’hi pot anar', () => {
  const { onChange } = open({ minimumDate: new Date(2026, 8, 10), maximumDate: new Date(2026, 8, 25) });
  expect(screen.getByRole('button', { name: 'dimecres, 9 de setembre' }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'dissabte, 26 de setembre' }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Mes anterior' }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Mes següent' }).props.accessibilityState.disabled).toBe(true);
  fireEvent.press(screen.getByRole('button', { name: 'dissabte, 26 de setembre' }));
  fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 21, 10, 0));
});

test('en mode fosc, els colors fosc', () => {
  renderWithTheme(<CalendarDialog visible={true} value={new Date(2026, 8, 21)} onCancel={() => {}} onToday={() => {}} onChange={() => {}}/>, { dark: true });
  expect(styleOf(screen.getByTestId('calendar-day-21')).backgroundColor).toBe('#1F7F7B');
});

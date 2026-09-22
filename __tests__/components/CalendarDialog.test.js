// The calendar of the home, on its own: months, the day chosen, today, and the limits of the
// database.
import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import CalendarDialog from '../../src/views/home/CalendarDialog';

const NOW = new Date(2026, 8, 22, 10, 0);

beforeAll(() => {
  jest.useFakeTimers({ now: NOW, advanceTimers: true });
});
afterAll(() => {
  jest.useRealTimers();
});

function open(props = {}) {
  const handlers = { onCancel: jest.fn(), onToday: jest.fn(), onChange: jest.fn() };
  renderWithTheme(<CalendarDialog visible={true} value={new Date(2026, 8, 21, 10, 0)} {...handlers} {...props} />);
  return handlers;
}

test('it opens on the month of the day being shown, with that day chosen and today marked', () => {
  open();
  expect(screen.getByRole('button', { name: 'setembre de 2026' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'dilluns, 21 de setembre' }).props.accessibilityState.selected).toBe(true);
  expect(styleOf(screen.getByTestId('calendar-day-21')).backgroundColor).toBe('#007B80');
  expect(styleOf(screen.getByTestId('calendar-day-22'))).toMatchObject({ borderColor: '#00696D' });
});

test('a day is chosen and «Canvia» applies it', () => {
  const { onChange } = open();
  fireEvent.press(screen.getByRole('button', { name: 'dissabte, 26 de setembre' }));
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 26));
});

test('«Avui» and «Cancel·la»', () => {
  const { onToday, onCancel } = open();
  fireEvent.press(screen.getByRole('button', { name: 'Avui' }));
  expect(onToday).toHaveBeenCalled();
  fireEvent.press(screen.getByRole('button', { name: 'Cancel·la' }));
  expect(onCancel).toHaveBeenCalled();
});

test('it moves from month to month forward and back, and from year to year too', () => {
  open({ value: new Date(2026, 11, 30) });
  fireEvent.press(screen.getByRole('button', { name: 'Mes següent' }));
  expect(screen.getByText('gener de 2027')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Mes anterior' }));
  fireEvent.press(screen.getByRole('button', { name: 'Mes anterior' }));
  expect(screen.getByText('novembre de 2026')).toBeTruthy();
});

test('outside the database, the days can be neither chosen nor reached', () => {
  const { onChange } = open({ minimumDate: new Date(2026, 8, 10), maximumDate: new Date(2026, 8, 25) });
  expect(screen.getByRole('button', { name: 'dimecres, 9 de setembre' }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'dissabte, 26 de setembre' }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Mes anterior' }).props.accessibilityState.disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Mes següent' }).props.accessibilityState.disabled).toBe(true);
  fireEvent.press(screen.getByRole('button', { name: 'dissabte, 26 de setembre' }));
  fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
  expect(onChange).toHaveBeenCalledWith(new Date(2026, 8, 21, 10, 0));
});

test('in dark mode, the dark colours', () => {
  renderWithTheme(
    <CalendarDialog
      visible={true}
      value={new Date(2026, 8, 21)}
      onCancel={() => {}}
      onToday={() => {}}
      onChange={() => {}}
    />,
    { dark: true },
  );
  expect(styleOf(screen.getByTestId('calendar-day-21')).backgroundColor).toBe('#1F7F7B');
});

describe('the list of years', () => {
  const limits = { minimumDate: new Date(2017, 0, 3), maximumDate: new Date(2026, 11, 29) };

  test('the title of the month opens it, with the years of the database and the one shown, chosen', () => {
    open(limits);
    const title = screen.getByRole('button', { name: 'setembre de 2026' });
    expect(title.props.accessibilityHint).toBe('Tria un altre any');
    fireEvent.press(title);
    const years = screen.getByTestId('calendar-years');
    expect(
      within(years)
        .getAllByRole('button')
        .map((b) => b.props.accessibilityLabel),
    ).toEqual(['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']);
    expect(screen.getByRole('button', { name: '2026' }).props.accessibilityState.selected).toBe(true);
    // While the years show, no month arrows and no days
    expect(screen.queryByRole('button', { name: 'Mes anterior' })).toBeNull();
    expect(screen.queryByTestId('calendar-day-21')).toBeNull();
  });

  test('on choosing a year it goes back to the days, in the same month of that year', () => {
    const handlers = open(limits);
    fireEvent.press(screen.getByRole('button', { name: 'setembre de 2026' }));
    fireEvent.press(screen.getByRole('button', { name: '2025' }));
    expect(screen.getByRole('button', { name: 'setembre de 2025' })).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'divendres, 26 de setembre' }));
    fireEvent.press(screen.getByRole('button', { name: 'Canvia' }));
    expect(handlers.onChange).toHaveBeenCalledWith(new Date(2025, 8, 26));
  });

  test('touching the title again goes back to the days without changing the year', () => {
    open(limits);
    const title = screen.getByRole('button', { name: 'setembre de 2026' });
    fireEvent.press(title);
    fireEvent.press(screen.getByRole('button', { name: 'setembre de 2026' }));
    expect(screen.getByTestId('calendar-day-21')).toBeTruthy();
  });
});

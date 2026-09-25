// The "Aa" sheet of the prayer screens: text size and dark mode.
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../helpers/renderWithTheme';
import TextSettingsSheet from '../../src/components/TextSettingsSheet';

function open(props = {}) {
  const handlers = { onClose: jest.fn(), onTextSizeChange: jest.fn(), onDarkModeChange: jest.fn() };
  renderWithTheme(<TextSettingsSheet visible={true} textSizeStep={3} darkMode="Automàtic" {...handlers} {...props} />);
  return handlers;
}

test('it says the chosen size and the dark mode', () => {
  open();
  expect(screen.getByText('Mida 3 de 10')).toBeTruthy();
  expect(screen.getByRole('radio', { name: 'Automàtic' }).props.accessibilityState.checked).toBe(true);
});

test('A+ and A− ask for the next size and the previous one', () => {
  const { onTextSizeChange } = open({ textSizeStep: 3 });
  fireEvent.press(screen.getByRole('button', { name: 'Text més gran' }));
  expect(onTextSizeChange).toHaveBeenLastCalledWith(4);
  fireEvent.press(screen.getByRole('button', { name: 'Text més petit' }));
  expect(onTextSizeChange).toHaveBeenLastCalledWith(2);
});

test('at the ends, the button that cannot go further is disabled', () => {
  open({ textSizeStep: 10 });
  expect(screen.getByRole('button', { name: 'Text més gran' }).props.accessibilityState.disabled).toBe(true);
  open({ textSizeStep: 1 });
  expect(screen.getByRole('button', { name: 'Text més petit' }).props.accessibilityState.disabled).toBe(true);
});

test('the dark mode is chosen with three buttons', () => {
  const { onDarkModeChange } = open();
  fireEvent.press(screen.getByText('Fosc'));
  expect(onDarkModeChange).toHaveBeenCalledWith('Activat');
});

test('«Fet» closes it', () => {
  const { onClose } = open();
  fireEvent.press(screen.getByRole('button', { name: 'Fet' }));
  expect(onClose).toHaveBeenCalled();
});

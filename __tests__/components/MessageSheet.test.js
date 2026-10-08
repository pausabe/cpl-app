// Missatge: the form written in the app (MessageSheet), what it says while sending and after, and
// that without words there is nothing to send.
import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react-native';
import { renderWithTheme } from '../helpers/renderWithTheme';
import MessageSheet from '../../src/components/MessageSheet';

function open(props = {}) {
  const handlers = { onClose: jest.fn(), onChange: jest.fn(), onSend: jest.fn(), onPrivacy: jest.fn() };
  renderWithTheme(
    <MessageSheet visible={true} fields={{ text: '', name: '', email: '' }} status="idle" {...handlers} {...props} />,
  );
  return handlers;
}

test('the words, the name and the email, with what goes with them and the privacy policy', () => {
  const { onChange, onPrivacy, onClose } = open({ fields: { text: 'Hola', name: '', email: '' } });
  const sheet = screen.getByTestId('message-sheet');
  expect(within(sheet).getByRole('header', { name: 'Missatge' })).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Correu (opcional)'), 'maria@exemple.cat');
  expect(onChange).toHaveBeenCalledWith({ text: 'Hola', name: '', email: 'maria@exemple.cat' });
  expect(screen.getByText('Sense correu no et podrem respondre.')).toBeTruthy();
  expect(screen.getByText(/la versió de l'app i del sistema, la diòcesi/)).toBeTruthy();
  fireEvent.press(screen.getByRole('link', { name: 'Política de privacitat' }));
  expect(onPrivacy).toHaveBeenCalled();
  fireEvent.press(screen.getByTestId('message-sheet-close'));
  expect(onClose).toHaveBeenCalled();
});

test('without words there is nothing to send; while sending, it cannot be sent twice', () => {
  const { onSend } = open();
  expect(screen.getByTestId('message-send').props.accessibilityState).toMatchObject({ disabled: true });
  fireEvent.press(screen.getByTestId('message-send'));
  expect(onSend).not.toHaveBeenCalled();
});

test('sent, it thanks and says where the answer will go', () => {
  open({ status: 'sent', fields: { text: 'Hola', name: '', email: 'maria@exemple.cat' } });
  expect(screen.getByText('Gràcies!')).toBeTruthy();
  expect(screen.getByText('Hem rebut el teu missatge. Et respondrem a maria@exemple.cat.')).toBeTruthy();
  expect(screen.queryByTestId('message-text')).toBeNull();
});

test('what went wrong, with the words kept', () => {
  open({ status: 'offline', fields: { text: 'Hola', name: '', email: '' } });
  expect(screen.getByTestId('message-problem').props.children).toMatch(/el que has escrit no es perd/);
  expect(screen.getByTestId('message-text').props.value).toBe('Hola');
});

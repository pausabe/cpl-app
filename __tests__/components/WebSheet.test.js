// A page of the web in a sheet (Missatge; Donatiu on Android): the title, "Tanca", the page, and
// what it shows while loading and without a connection.
jest.mock('react-native-webview', () => {
  const { View } = require('react-native');
  const WebView = (props) => <View testID="webview" {...props} />;
  return { __esModule: true, default: WebView, WebView };
});

import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react-native';
import { renderWithTheme, styleOf } from '../helpers/renderWithTheme';
import WebSheet from '../../src/components/WebSheet';

function open(props = {}) {
  const onClose = jest.fn();
  renderWithTheme(
    <WebSheet
      visible={true}
      title="Missatge"
      url="https://www.cpl.es/contacto/"
      onClose={onClose}
      testID="sheet"
      {...props}
    />,
  );
  return onClose;
}

test('el títol, «Tanca» i la pàgina, en un full alt de vora a vora', () => {
  const onClose = open();
  const sheet = screen.getByTestId('sheet');
  expect(within(sheet).getByRole('header', { name: 'Missatge' })).toBeTruthy();
  expect(within(sheet).getByTestId('webview').props.source).toEqual({ uri: 'https://www.cpl.es/contacto/' });
  expect(styleOf(sheet)).toMatchObject({ paddingHorizontal: 0 });
  const close = within(sheet).getByRole('button', { name: 'Tanca' });
  // Maestro finds it by this: the backdrop behind the sheet is called "Tanca" too
  expect(close.props.testID).toBe('sheet-close');
  fireEvent.press(close);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('mentre carrega, una roda; sense connexió, ho diu', () => {
  open();
  const web = screen.getByTestId('webview');
  expect(web.props.startInLoadingState).toBe(true);
  renderWithTheme(web.props.renderLoading());
  expect(screen.UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
  renderWithTheme(web.props.renderError());
  expect(screen.getByText('És necessari tenir una connexió a internet')).toBeTruthy();
});

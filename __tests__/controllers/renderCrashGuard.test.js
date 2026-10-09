// A screen that fails while it is drawn closes the app without going through ErrorUtils: the guard at
// the top of the app writes it down first, and then lets it go as before.
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, waitFor } from '@testing-library/react-native';
import RenderCrashGuard from '../../src/controllers/RenderCrashGuard';

function Boom() {
  throw new TypeError("Cannot read property 'title' of undefined");
}

beforeEach(async () => {
  await AsyncStorage.clear();
  // React tells of the error it caught: not this test's business
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('it is written down as an error that closed the app, and then let go', async () => {
  await AsyncStorage.setItem('HealthSession', JSON.stringify({ app: '9.3.0', since: 1 }));
  const letGo = jest.fn();

  render(
    <RenderCrashGuard letGo={letGo}>
      <Boom />
    </RenderCrashGuard>,
  );

  await waitFor(() => expect(letGo).toHaveBeenCalledWith(expect.any(TypeError)));
  expect(JSON.parse(await AsyncStorage.getItem('HealthProblems'))).toEqual([
    expect.objectContaining({ kind: 'fatal', place: 'render', name: 'TypeError' }),
  ]);
  // What closed the app is known: the next opening does not tell of an unexpected exit as well
  expect(await AsyncStorage.getItem('HealthSession')).toBeNull();
});

test('let go, it is thrown again, to close the app as it always did', () => {
  const error = new Error('boom');
  const guard = new RenderCrashGuard({ children: null });
  guard.state = { failed: true, error, released: true };
  expect(() => guard.render()).toThrow(error);
});

test('while nothing fails it draws what it holds', () => {
  const { Text } = require('react-native');
  const { getByText } = render(
    <RenderCrashGuard>
      <Text>Laudes</Text>
    </RenderCrashGuard>,
  );
  expect(getByText('Laudes')).toBeTruthy();
});

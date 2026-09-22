// At the bottom of Settings, under the versions: what is happening with the OTA updates. The state
// comes from expo-updates' native side through useUpdates(), replaced here by each case.
jest.mock('expo-updates', () => ({
  isEnabled: true,
  channel: 'production_90',
  useUpdates: jest.fn(),
}));

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as Updates from 'expo-updates';
import UpdateStatus from '../../src/Components/UpdateStatusComponent';

const STORE_BUILD = { isEmbeddedLaunch: true };

function withState(state) {
  Updates.useUpdates.mockReturnValue({
    currentlyRunning: STORE_BUILD,
    isChecking: false,
    isDownloading: false,
    isUpdatePending: false,
    ...state,
  });
  render(<UpdateStatus />);
}

test('mentre baixa, ho diu amb el percentatge', () => {
  withState({ isDownloading: true, downloadProgress: 0.42 });
  expect(screen.getByText("S'està baixant una actualització… 42%")).toBeTruthy();
});

test("amb una baixada feta, avisa que s'aplicarà en tornar a obrir l'app", () => {
  withState({ isUpdatePending: true });
  expect(screen.getByText("Hi ha una actualització a punt. S'aplicarà quan tornis a obrir l'aplicació.")).toBeTruthy();
});

test('al dia, diu quan ha comprovat', () => {
  withState({ lastCheckForUpdateTimeSinceRestart: new Date(2026, 8, 21, 9, 5) });
  expect(screen.getByText("L'aplicació està al dia (comprovat a les 09:05)")).toBeTruthy();
});

test('sense connexió, ho diu', () => {
  withState({ checkError: new Error('offline') });
  expect(screen.getByText("No s'ha pogut comprovar si hi ha actualitzacions.")).toBeTruthy();
});

test("diu quina actualització fa servir: la de la botiga o la data d'una baixada", () => {
  withState({});
  expect(screen.getByText('Actualització en ús: la de la botiga')).toBeTruthy();

  withState({ currentlyRunning: { isEmbeddedLaunch: false, createdAt: new Date(2026, 8, 14, 18, 30) } });
  expect(screen.getByText('Actualització en ús: 14/9/2026 18:30')).toBeTruthy();
});

test('una còpia feta a l’ordinador, sense canal, diu que no rep actualitzacions en lloc d’un error', () => {
  Updates.channel = '';
  withState({ checkError: new Error('no channel') });
  expect(screen.getByText('Còpia de proves, sense canal: no rep actualitzacions')).toBeTruthy();
  expect(screen.queryByText("No s'ha pogut comprovar si hi ha actualitzacions.")).toBeNull();
  Updates.channel = 'production_90';
});

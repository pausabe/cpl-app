// Asking the phone where it is. Everything that can go wrong has to come back as an answer, never
// as an exception: whoever calls this decides what to do with a refusal, and a throw would take
// the whole opening of the app with it.
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Low: 3 },
}));

import * as Location from 'expo-location';
import { currentPosition } from '../../src/services/deviceLocationService';

const askedForPermission = Location.requestForegroundPermissionsAsync as jest.MockedFunction<
  typeof Location.requestForegroundPermissionsAsync
>;
const askedForPosition = Location.getCurrentPositionAsync as jest.MockedFunction<
  typeof Location.getCurrentPositionAsync
>;

const granted = { granted: true } as never;
const refused = { granted: false } as never;
const inTerrassa = { coords: { latitude: 41.564, longitude: 2.011, accuracy: 65 } } as never;

beforeEach(() => {
  askedForPermission.mockReset();
  askedForPosition.mockReset();
});

test('with the permission given, the position comes back with its margin of error', async () => {
  askedForPermission.mockResolvedValueOnce(granted);
  askedForPosition.mockResolvedValueOnce(inTerrassa);
  expect(await currentPosition()).toEqual({
    kind: 'position',
    latitude: 41.564,
    longitude: 2.011,
    accuracyMeters: 65,
  });
});

test('the accuracy asked for is the coarsest that still tells dioceses apart', async () => {
  askedForPermission.mockResolvedValueOnce(granted);
  askedForPosition.mockResolvedValueOnce(inTerrassa);
  await currentPosition();
  expect(askedForPosition).toHaveBeenCalledWith({ accuracy: Location.Accuracy.Low });
});

test('with the permission refused, the phone is not even asked where it is', async () => {
  askedForPermission.mockResolvedValueOnce(refused);
  expect(await currentPosition()).toEqual({ kind: 'denied' });
  expect(askedForPosition).not.toHaveBeenCalled();
});

// Android can leave it out, and the resolver then takes the position at face value
test('a position with no margin of error counts as having none', async () => {
  askedForPermission.mockResolvedValueOnce(granted);
  askedForPosition.mockResolvedValueOnce({ coords: { latitude: 41.564, longitude: 2.011, accuracy: null } } as never);
  expect(await currentPosition()).toMatchObject({ accuracyMeters: 0 });
});

test('the location services being off is a refusal, not a crash', async () => {
  askedForPermission.mockResolvedValueOnce(granted);
  askedForPosition.mockRejectedValueOnce(new Error('Location services are disabled'));
  expect(await currentPosition()).toEqual({ kind: 'failed' });
});

test('the permission itself blowing up is a refusal too', async () => {
  askedForPermission.mockRejectedValueOnce(new Error('no'));
  expect(await currentPosition()).toEqual({ kind: 'failed' });
});

test('a fix that never arrives is given up on instead of hanging', async () => {
  jest.useFakeTimers();
  try {
    askedForPermission.mockResolvedValueOnce(granted);
    askedForPosition.mockReturnValueOnce(new Promise(() => {}) as never);
    const asking = currentPosition();
    await jest.advanceTimersByTimeAsync(15000);
    expect(await asking).toEqual({ kind: 'failed' });
  } finally {
    jest.useRealTimers();
  }
});

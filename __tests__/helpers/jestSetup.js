// AsyncStorage has no native side under Jest; the library ships an in-memory mock for this.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// The tour of what is new would come up over the home of every test: only the tests of the tour start it
globalThis.__CPL_NO_TOUR__ = true;

// The app's Logger prints every step to console.log; keep test output readable.
jest.spyOn(console, 'log').mockImplementation(() => {});

// Fonts: jest-expo's native mock of the font loader doesn't return a list, and the app asks it
// whether Literata is loaded. In a test it always is.
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  isLoaded: () => true,
  loadAsync: async () => {},
}));

// The prayer read aloud plays with expo-audio, which has no native side under Jest. The stand-in
// keeps what it was asked, for the tests to look at.
jest.mock('expo-audio', () => require('./fakeAudio'));

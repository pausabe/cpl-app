// AsyncStorage has no native side under Jest; the library ships an in-memory mock for this.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// The app's Logger prints every step to console.log; keep test output readable.
jest.spyOn(console, 'log').mockImplementation(() => {});

// Native module the navigators need; the library ships its own Jest setup.
require('react-native-gesture-handler/jestSetup');

// Icon fonts: jest-expo's native mock of the font loader doesn't return a list, and
// @expo/vector-icons asks it whether its font is loaded. In a test it always is.
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  isLoaded: () => true,
  loadAsync: async () => {},
}));

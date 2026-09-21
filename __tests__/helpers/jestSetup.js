// AsyncStorage has no native side under Jest; the library ships an in-memory mock for this.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// The app's Logger prints every step to console.log; keep test output readable.
jest.spyOn(console, 'log').mockImplementation(() => {});

// Native modules the navigators need; both libraries ship their own Jest setup.
require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

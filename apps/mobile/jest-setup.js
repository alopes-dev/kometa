require('react-native-reanimated').setUpTests();

// Haptics is a fire-and-forget native side effect every tappable triggers, so
// it is stubbed once here rather than in each suite. Jest's automock would
// return `undefined` and break the `.catch()` call sites use to ignore
// failures; these resolve like the real module does.
jest.mock('expo-haptics', () => require('./src/test-utils/haptics'));

// AsyncStorage is a native module several features persist through — the
// checkout session, the onboarding flag. The library ships a mock for exactly
// this; registering it once here keeps every suite that merely *imports* a
// module touching storage from having to mock it itself.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

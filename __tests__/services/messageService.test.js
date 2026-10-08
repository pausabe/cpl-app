// A message to the CPL from the app: what it sends to cpl-api, with what the form says goes with
// it, and what comes back when it cannot be sent.
jest.mock('expo-application', () => ({ nativeApplicationVersion: '9.2.4' }));
jest.mock('expo-device', () => ({ osVersion: '26.0' }));
jest.mock('../../src/services/databaseManagerService', () => require('../helpers/mockDatabaseManager'));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const { emailLooksRight, sendMessage } = require('../../src/services/messageService');

const answer = (status) =>
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: status < 400, status, json: async () => ({}) });
const sent = () => JSON.parse(global.fetch.mock.calls[0][1].body);

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

test('sends the words, and the name and the email only if there are any', async () => {
  answer(201);
  await AsyncStorage.setItem('diocesis', 'Girona');

  expect(await sendMessage({ text: '  L’àudio no sona.  ', name: ' ', email: '' })).toBe('sent');

  expect(global.fetch.mock.calls[0][0]).toMatch(/\/v1\/messages$/);
  expect(sent()).toMatchObject({ text: 'L’àudio no sona.', app: '9.2.4', os: '26.0', diocese: 'Girona' });
  expect(sent()).not.toHaveProperty('name');
  expect(sent()).not.toHaveProperty('email');
  expect(typeof sent().database).toBe('number');
});

test('says why it could not: no network, too many today, or refused', async () => {
  jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));
  expect(await sendMessage({ text: 'Hola', name: 'Joan', email: 'joan@exemple.cat' })).toBe('offline');
  answer(429);
  expect(await sendMessage({ text: 'Hola', name: '', email: '' })).toBe('tooMany');
  answer(400);
  expect(await sendMessage({ text: 'Hola', name: '', email: '' })).toBe('refused');
  answer(503);
  expect(await sendMessage({ text: 'Hola', name: '', email: '' })).toBe('offline');
});

test('an email is optional, but if there is one it has to look like one', () => {
  expect(emailLooksRight('')).toBe(true);
  expect(emailLooksRight(' joan@exemple.cat ')).toBe(true);
  expect(emailLooksRight('joan@exemple')).toBe(false);
  expect(emailLooksRight('joan exemple.cat')).toBe(false);
});

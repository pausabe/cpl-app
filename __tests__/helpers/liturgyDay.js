// Loads one day exactly as the app does when it opens: settings read from AsyncStorage, then
// DataService.reloadAllData. The caller must mock DatabaseManagerService with
// ./mockDatabaseManager (jest.mock factories can't be shared from here: they are hoisted).
const AsyncStorage = require('@react-native-async-storage/async-storage');
const DataService = require('../../src/services/dataService');
const StorageKeys = require('../../src/services/storage/storageKeys').default;

// Setting combinations a real user can pick in the Settings screen. Values are the strings
// SettingsService stores. Between them they cover every option that changes the texts.
const PROFILES = {
  barcelona: { diocesis: 'Barcelona', lloc: 'Diòcesi' },
  tarragonaCatedral: { diocesis: 'Tarragona', lloc: 'Catedral', useLatin: 'true', salmInvitatori: '99', antMare: '3' },
  gironaCiutat: { diocesis: 'Girona', lloc: 'Ciutat', salmInvitatori: '66', antMare: '5' },
  andorra: { diocesis: 'Andorra', lloc: 'Diòcesi', salmInvitatori: '23', antMare: '2' },
  mallorcaLliure: { diocesis: 'Mallorca', lloc: 'Diòcesi', antMare: '4', optionalFestivity: true },
  vic: { diocesis: 'Vic', lloc: 'Diòcesi' },
  lleida: { diocesis: 'Lleida', lloc: 'Catedral' },
  urgell: { diocesis: 'Urgell', lloc: 'Diòcesi' },
  menorca: { diocesis: 'Menorca', lloc: 'Ciutat' },
  santFeliu: { diocesis: 'Sant Feliu de Llobregat', lloc: 'Diòcesi' },
  solsona: { diocesis: 'Solsona', lloc: 'Diòcesi' },
  terrassa: { diocesis: 'Terrassa', lloc: 'Diòcesi' },
  tortosa: { diocesis: 'Tortosa', lloc: 'Diòcesi' },
};

async function applyProfile(profile, date) {
  await AsyncStorage.clear();
  const { optionalFestivity, ...settings } = profile;
  for (const [key, value] of Object.entries(settings)) await AsyncStorage.setItem(key, value);
  if (optionalFestivity) {
    // Same format HomeScreen writes when the "memòria lliure" switch is turned on.
    await AsyncStorage.setItem(
      StorageKeys.OptionalFestivity,
      `${date.getDate()}:${date.getMonth()}:${date.getFullYear()}`,
    );
  }
}

// Everything the screens read from DataService after a reload, as plain JSON.
function currentState() {
  return JSON.parse(
    JSON.stringify({
      settings: DataService.CurrentSettings,
      dayInformation: DataService.CurrentLiturgyDayInformation,
      celebration: DataService.CurrentCelebrationInformation,
      hours: DataService.CurrentHoursLiturgy,
      mass: DataService.CurrentMassLiturgy,
    }),
  );
}

async function loadDay(isoDate, profileName = 'barcelona') {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  await applyProfile(PROFILES[profileName], date);
  await DataService.reloadAllData(date, null);
  return currentState();
}

// Local calendar date, not toISOString(): that one is UTC and slips back a day in Spain.
function isoDateOf(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

module.exports = { PROFILES, loadDay, isoDateOf };

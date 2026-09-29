import * as StorageService from './storage/storageService';

export enum DioceseName {
  Andorra = 'Andorra',
  Barcelona = 'Barcelona',
  Girona = 'Girona',
  Lleida = 'Lleida',
  Mallorca = 'Mallorca',
  Menorca = 'Menorca',
  SantFeliu = 'Sant Feliu de Llobregat',
  Solsona = 'Solsona',
  Tarragona = 'Tarragona',
  Terrassa = 'Terrassa',
  Tortosa = 'Tortosa',
  Urgell = 'Urgell',
  Vic = 'Vic',
}

export enum PrayingPlace {
  Diocese = 'Diòcesi',
  City = 'Ciutat',
  Cathedral = 'Catedral',
}

export enum InvitationPsalmOption {
  Psalm94 = '94',
  Psalm99 = '99',
  Psalm66 = '66',
  Psalm23 = '23',
}

export enum VirginAntiphonOption {
  Antiphon1 = '1',
  Antiphon2 = '2',
  Antiphon3 = '3',
  Antiphon4 = '4',
  Antiphon5 = '5',
}

export enum DarkModeOption {
  On = 'Activat',
  Off = 'Desactivat',
  System = 'Automàtic',
}

// The edition is the language of the texts: each one is a database of its own, published apart
// (cpl-cloud), with its own calendars. The Catalan one is the one the app carries inside, and the
// only one there was before.
export const DEFAULT_EDITION = 'ca';

// How each edition calls itself in the list, in its own language, as languages are listed
export const EDITION_NAMES: Record<string, string> = { ca: 'Català', es: 'Castellano' };

export function editionName(edition: string): string {
  return EDITION_NAMES[edition] ?? edition;
}

// Whether this build offers the language of the texts in Configuració: only one built with
// EXPO_PUBLIC_CPL_EDITIONS=1 (in .env, or exported when building). Until another edition is ready
// for everybody, the row stays hidden even when the website has one. Metro writes the value in when
// it builds, as with the other EXPO_PUBLIC_ variables.
export function editionsOffered(): boolean {
  return process.env.EXPO_PUBLIC_CPL_EDITIONS === '1';
}

const EDITION_PATTERN = /^[a-z]{2}$/;

// What a fresh install prays with. Everything is stored as text, as it always has been.
const defaultSettings = {
  useLatin: 'false',
  textSize: '3', //1-10
  diocesis: DioceseName.Barcelona,
  lloc: PrayingPlace.Diocese,
  dayStart: '0', //Values from 0 to 3 allowed, which means 00:00AM, 01:00AM, 02:00AM and 03:00AM
  salmInvitatori: InvitationPsalmOption.Psalm94,
  antMare: VirginAntiphonOption.Antiphon1,
  darkMode: DarkModeOption.System,
  showVideos: 'false',
  edicio: DEFAULT_EDITION,
};

type SettingKey = keyof typeof defaultSettings;

// What is stored under a key, or its default when there is nothing (or an empty text)
async function storedValue(key: SettingKey): Promise<string> {
  const value = await StorageService.getData(key);
  return value == null ? defaultSettings[key] : value;
}

// Stores a value only if it is one of those allowed: a bad diocese would break every query
function storeIfValid(key: SettingKey, value: string, isValid: (value: string) => boolean): Promise<void> {
  if (isValid(value)) return StorageService.storeData(key, value);
  return Promise.reject(new Error('Invalid value'));
}

// Whether a value is one of those of an enumeration
function isOneOf(options: Record<string, string>, value: string): boolean {
  return Object.values(options).includes(value);
}

const isBoolean = (value: string) => value === 'true' || value === 'false';

// The diocese and the place are kept for each edition: going over to another one and coming back
// finds the place where it was left. The Catalan ones stay under the keys they always had. Another
// edition has no default: its place is the first of its calendars until one is chosen.
function placeKey(key: 'diocesis' | 'lloc', edition: string): string {
  return edition === DEFAULT_EDITION ? key : `${key}-${edition}`;
}

async function storedPlaceValue(key: 'diocesis' | 'lloc', edition: string): Promise<string> {
  if (edition === DEFAULT_EDITION) return storedValue(key);
  return ((await StorageService.getData(placeKey(key, edition))) as string | null) ?? '';
}

export default class SettingsService {
  static getSettingUseLatin(): Promise<string> {
    return storedValue('useLatin');
  }

  static getSettingTextSize(): Promise<string> {
    return storedValue('textSize');
  }

  static getSettingDarkMode(): Promise<string> {
    return storedValue('darkMode');
  }

  // Of the Catalan edition unless another one is said: the one the app has open is what counts
  // for the texts (see dataService)
  static getSettingDiocese(edition: string = DEFAULT_EDITION): Promise<string> {
    return storedPlaceValue('diocesis', edition);
  }

  /**
   * Whether a diocese has ever been chosen on this phone. It is only written from the picker in
   * Configuració, and only when the value really changes, so nothing stored means nobody has ever
   * touched it and what the app prays with is the default above.
   */
  static async dioceseWasEverChosen(): Promise<boolean> {
    const stored = await StorageService.getData('diocesis');
    return stored !== undefined && stored !== null && stored !== '';
  }

  static getSettingPrayingPlace(edition: string = DEFAULT_EDITION): Promise<string> {
    return storedPlaceValue('lloc', edition);
  }

  // The edition chosen, which is not always the one open: until the phone has its database, the app
  // prays with the one it carries (see databaseManagerService)
  static getSettingEdition(): Promise<string> {
    return storedValue('edicio');
  }

  static getSettingDayStart(): Promise<string> {
    return storedValue('dayStart');
  }

  static getSettingInvitationPsalm(): Promise<string> {
    return storedValue('salmInvitatori');
  }

  static getSettingVirginAntiphon(): Promise<string> {
    return storedValue('antMare');
  }

  static getSettingShowVideos(): Promise<string> {
    return storedValue('showVideos');
  }

  static setSettingUseLatin(value: string): Promise<void> {
    return storeIfValid('useLatin', value, isBoolean);
  }

  // A whole number
  static setSettingTextSize(value: string): Promise<void> {
    return storeIfValid('textSize', value, (val) => !isNaN(Number(val)) && (parseFloat(val) * 10) % 10 == 0);
  }

  static setSettingDarkMode(value: string): Promise<void> {
    return storeIfValid('darkMode', value, (val) => isOneOf(DarkModeOption, val));
  }

  // The dioceses and places allowed are those of the calendars of the database, when it has them
  // (see calendarService); otherwise, those of before
  static setSettingDiocese(
    value: string,
    allowed: string[] = Object.values(DioceseName),
    edition: string = DEFAULT_EDITION,
  ): Promise<void> {
    if (edition === DEFAULT_EDITION) return storeIfValid('diocesis', value, (val) => allowed.includes(val));
    if (!allowed.includes(value)) return Promise.reject(new Error('Invalid value'));
    return StorageService.storeData(placeKey('diocesis', edition), value);
  }

  static setSettingPrayingPlace(
    value: string,
    allowed: string[] = Object.values(PrayingPlace),
    edition: string = DEFAULT_EDITION,
  ): Promise<void> {
    if (edition === DEFAULT_EDITION) return storeIfValid('lloc', value, (val) => allowed.includes(val));
    if (!allowed.includes(value)) return Promise.reject(new Error('Invalid value'));
    return StorageService.storeData(placeKey('lloc', edition), value);
  }

  static setSettingEdition(value: string): Promise<void> {
    return storeIfValid('edicio', value, (val) => EDITION_PATTERN.test(val));
  }

  static setSettingDayStart(value: string): Promise<void> {
    return storeIfValid('dayStart', value, (val) => val == '0' || val == '1' || val == '2' || val == '3');
  }

  static setSettingInvitationPsalm(value: string): Promise<void> {
    return storeIfValid('salmInvitatori', value, (val) => isOneOf(InvitationPsalmOption, val));
  }

  static setSettingVirginAntiphon(value: string): Promise<void> {
    return storeIfValid('antMare', value, (val) => isOneOf(VirginAntiphonOption, val));
  }

  static setSettingShowVideos(value: string): Promise<void> {
    return storeIfValid('showVideos', value, isBoolean);
  }
}

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

  static getSettingDiocese(): Promise<string> {
    return storedValue('diocesis');
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

  static getSettingPrayingPlace(): Promise<string> {
    return storedValue('lloc');
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

  static setSettingDiocese(value: string): Promise<void> {
    return storeIfValid('diocesis', value, (val) => isOneOf(DioceseName, val));
  }

  static setSettingPrayingPlace(value: string): Promise<void> {
    return storeIfValid('lloc', value, (val) => isOneOf(PrayingPlace, val));
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

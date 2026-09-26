import { Appearance } from 'react-native';
import SettingsService, { DarkModeOption } from './SettingsService';
import * as DatabaseDataService from './databaseDataService';
import * as DatabaseManagerService from './databaseManagerService';
import { getDatabaseVersion } from './databaseDataService';
import * as StorageService from './storage/storageService';
import * as SpecialCelebrationService from './specialCelebrationService';
import StorageKeys from './storage/storageKeys';
import * as Logger from '../utils/logger';
import { Settings } from '../models/Settings';
import DatabaseInformation from '../models/DatabaseInformation';
import LiturgyDayInformation, { LiturgySpecificDayInformation } from '../models/LiturgyDayInformation';
import { obtainHoursLiturgy } from './liturgy/hoursLiturgyService';
import { obtainLiturgyMasters } from './liturgy/liturgyMastersService';
import HoursLiturgy from '../models/hours-liturgy/HoursLiturgy';
import MassLiturgy from '../models/MassLiturgy';
import CelebrationInformation from '../models/hours-liturgy/CelebrationInformation';
import { obtainMassLiturgy } from './liturgy/massLiturgyService';
import { DateManagement } from '../utils/DateManagement';
import { getDioceseCodeFromDioceseName } from './databaseDataHelper';
import { SpecificLiturgyTimeType } from './celebrationTimeEnums';
import * as CelebrationIdentifierService from './celebrationIdentifierService';
import { Celebration } from './celebrationIdentifierService';
import { Asset } from 'expo-asset';
import { DioceseCode } from './databaseEnums';

// The liturgy of the day being shown, with the settings it was loaded with. Only the services and
// the store (controllers/liturgyStore) read it: the screens get it from the store, as props.
export interface CurrentLiturgy {
  // When it was last loaded: coming back to the app on another day loads today's
  lastRefreshDate: Date;
  settings: Settings;
  databaseInformation: DatabaseInformation;
  liturgyDayInformation: LiturgyDayInformation;
  celebrationInformation: CelebrationInformation;
  hoursLiturgy: HoursLiturgy;
  massLiturgy: MassLiturgy;
}

const current: CurrentLiturgy = {
  lastRefreshDate: new Date(),
  settings: new Settings(),
  databaseInformation: new DatabaseInformation(),
  liturgyDayInformation: new LiturgyDayInformation(),
  celebrationInformation: new CelebrationInformation(),
  hoursLiturgy: new HoursLiturgy(),
  massLiturgy: new MassLiturgy(),
};

// Every reload replaces its parts, one after the other; nobody else can. The settings can be
// changed in place (the text size, the dark mode), which does not change which texts they are.
export function currentLiturgy(): Readonly<CurrentLiturgy> {
  return current;
}

export async function reloadAllData(date: Date, databaseAsset: Asset) {
  Logger.log(Logger.LogKeys.FileSystemService, 'reloadAllData', 'Starting reloading data');
  current.lastRefreshDate = new Date();
  await DatabaseManagerService.openDatabase(databaseAsset);
  current.settings = await obtainCurrentSettings(date);
  current.databaseInformation = await obtainCurrentDatabaseInformation();
  current.liturgyDayInformation = await obtainCurrentLiturgyDayInformation(date, current.settings);
  const tomorrowLiturgyDayInformation = await obtainCurrentLiturgyDayInformation(
    current.liturgyDayInformation.tomorrow.date,
    current.settings,
  );
  const todayLiturgyMasters = await obtainLiturgyMasters(current.liturgyDayInformation, current.settings);
  const tomorrowLiturgyMasters = await obtainLiturgyMasters(tomorrowLiturgyDayInformation, current.settings);
  current.hoursLiturgy = await obtainHoursLiturgy(
    todayLiturgyMasters,
    tomorrowLiturgyMasters,
    current.liturgyDayInformation,
    current.settings,
  );
  current.celebrationInformation = obtainCurrentCelebrationInformation(current.hoursLiturgy);
  current.massLiturgy = await obtainMassLiturgy(
    current.liturgyDayInformation,
    current.hoursLiturgy.todayCelebrationInformation,
    current.hoursLiturgy.tomorrowCelebrationInformation,
    current.settings,
  );
  Logger.log(
    Logger.LogKeys.FileSystemService,
    'reloadAllData',
    'Total time reloading data: ',
    DateManagement.differenceBetweenDatesInSeconds(current.lastRefreshDate, new Date()) + 's',
  );
}

async function obtainCurrentSettings(date: Date): Promise<Settings> {
  let currentSettings = new Settings();
  currentSettings.prayingPlace = await SettingsService.getSettingPrayingPlace();
  currentSettings.dioceseName = await SettingsService.getSettingDiocese();
  currentSettings.dioceseCode = getDioceseCodeFromDioceseName(
    currentSettings.dioceseName,
    currentSettings.prayingPlace,
  );
  currentSettings.dioceseCode2Letters =
    currentSettings.dioceseCode === DioceseCode.Andorra
      ? currentSettings.dioceseCode
      : currentSettings.dioceseCode.substring(0, 2);
  currentSettings.useLatin = (await SettingsService.getSettingUseLatin()) === 'true';
  currentSettings.textSize = await SettingsService.getSettingTextSize();
  currentSettings.darkModeEnabled = determineDarkModeIsEnabled(await SettingsService.getSettingDarkMode());
  currentSettings.invitationPsalmOption = await SettingsService.getSettingInvitationPsalm();
  currentSettings.virginAntiphonOption = await SettingsService.getSettingVirginAntiphon();
  currentSettings.optionalFestivityEnabled = await determineOptionalFestivityEnabled(date);
  return currentSettings;
}

function determineDarkModeIsEnabled(darkModeConfiguration: string): boolean {
  let currentDarkModeEnabled = false;
  switch (darkModeConfiguration) {
    case DarkModeOption.On:
      currentDarkModeEnabled = true;
      break;
    case DarkModeOption.Off:
      currentDarkModeEnabled = false;
      break;
    case DarkModeOption.System:
      currentDarkModeEnabled = Appearance.getColorScheme() === 'dark';
      break;
  }
  return currentDarkModeEnabled;
}

async function determineOptionalFestivityEnabled(date: Date): Promise<boolean> {
  let optionalFestivityEnabled = false;
  const optionalFestivityDate = (await StorageService.getData(StorageKeys.OptionalFestivity)) as string;
  if (optionalFestivityDate && optionalFestivityDate !== 'none') {
    // 'none' if from the code before the refactor, legacy
    let dateArray = optionalFestivityDate.split(':');
    if (dateArray.length === 3) {
      optionalFestivityEnabled =
        parseInt(dateArray[0]) === date.getDate() &&
        parseInt(dateArray[1]) === date.getMonth() &&
        parseInt(dateArray[2]) === date.getFullYear();
    }
  }
  return optionalFestivityEnabled;
}

async function obtainCurrentDatabaseInformation(): Promise<DatabaseInformation> {
  let databaseInformation = new DatabaseInformation();
  databaseInformation.version = await getDatabaseVersion();
  let minimumAndMaximumSelectableDates = await DatabaseDataService.obtainMinimumAndMaximumSelectableDates();
  databaseInformation.minimumSelectableDate = minimumAndMaximumSelectableDates.minimumSelectableDate;
  databaseInformation.maximumSelectableDate = minimumAndMaximumSelectableDates.maximumSelectableDate;
  return databaseInformation;
}

async function obtainCurrentLiturgyDayInformation(date: Date, settings: Settings): Promise<LiturgyDayInformation> {
  let currentLiturgyDayInformation = new LiturgyDayInformation();
  currentLiturgyDayInformation.today = await DatabaseDataService.obtainLiturgySpecificDayInformation(date, settings);
  currentLiturgyDayInformation.today.specialCelebration = SpecialCelebrationService.obtainSpecialCelebration(
    currentLiturgyDayInformation.today,
    settings,
  );
  currentLiturgyDayInformation.today.isSpecialChristmas = isSpecialChristmas(currentLiturgyDayInformation.today);
  const tomorrowDate = new Date(date);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  currentLiturgyDayInformation.tomorrow = await DatabaseDataService.obtainLiturgySpecificDayInformation(
    tomorrowDate,
    settings,
  );
  currentLiturgyDayInformation.tomorrow.specialCelebration = SpecialCelebrationService.obtainSpecialCelebration(
    currentLiturgyDayInformation.tomorrow,
    settings,
  );
  currentLiturgyDayInformation.tomorrow.isSpecialChristmas = isSpecialChristmas(currentLiturgyDayInformation.tomorrow);
  return currentLiturgyDayInformation;
}

function isSpecialChristmas(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
  if (liturgySpecificDayInformation.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
    return false;
  }

  if (CelebrationIdentifierService.checkCelebration(Celebration.SacredFamily, liturgySpecificDayInformation)) {
    return false;
  }

  if (liturgySpecificDayInformation.date.getMonth() === 11) {
    return (
      liturgySpecificDayInformation.date.getDate() === 17 ||
      liturgySpecificDayInformation.date.getDate() === 18 ||
      liturgySpecificDayInformation.date.getDate() === 19 ||
      liturgySpecificDayInformation.date.getDate() === 20 ||
      liturgySpecificDayInformation.date.getDate() === 21 ||
      liturgySpecificDayInformation.date.getDate() === 22 ||
      liturgySpecificDayInformation.date.getDate() === 23 ||
      liturgySpecificDayInformation.date.getDate() === 24 ||
      liturgySpecificDayInformation.date.getDate() === 29 ||
      liturgySpecificDayInformation.date.getDate() === 30 ||
      liturgySpecificDayInformation.date.getDate() === 31
    );
  } else if (liturgySpecificDayInformation.date.getMonth() === 0) {
    return (
      liturgySpecificDayInformation.date.getDate() === 2 ||
      liturgySpecificDayInformation.date.getDate() === 3 ||
      liturgySpecificDayInformation.date.getDate() === 4 ||
      liturgySpecificDayInformation.date.getDate() === 5 ||
      liturgySpecificDayInformation.date.getDate() === 7 ||
      liturgySpecificDayInformation.date.getDate() === 8 ||
      liturgySpecificDayInformation.date.getDate() === 9 ||
      liturgySpecificDayInformation.date.getDate() === 10 ||
      liturgySpecificDayInformation.date.getDate() === 11 ||
      liturgySpecificDayInformation.date.getDate() === 12
    );
  }
  return false;
}

function obtainCurrentCelebrationInformation(hoursLiturgy: HoursLiturgy): CelebrationInformation {
  // For now, celebration information is inside hour's data. In the future it should be complete separated
  return hoursLiturgy.todayCelebrationInformation;
}

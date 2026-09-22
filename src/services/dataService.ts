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

// TODO: [UI Refactor] I don't like the idea of these variables made public to all project
//  it should be hidden and only controllers should access it
export let LastRefreshDate = new Date();
export let CurrentSettings = new Settings();
export let CurrentDatabaseInformation = new DatabaseInformation();
export let CurrentLiturgyDayInformation = new LiturgyDayInformation();
export let CurrentCelebrationInformation = new CelebrationInformation();
export let CurrentHoursLiturgy = new HoursLiturgy();
export let CurrentMassLiturgy = new MassLiturgy();

export async function reloadAllData(date: Date, databaseAsset: Asset) {
  Logger.log(Logger.LogKeys.FileSystemService, 'reloadAllData', 'Starting reloading data');
  LastRefreshDate = new Date();
  await DatabaseManagerService.openDatabase(databaseAsset);
  CurrentSettings = await obtainCurrentSettings(date);
  CurrentDatabaseInformation = await obtainCurrentDatabaseInformation();
  CurrentLiturgyDayInformation = await obtainCurrentLiturgyDayInformation(date, CurrentSettings);
  const tomorrowLiturgyDayInformation = await obtainCurrentLiturgyDayInformation(
    CurrentLiturgyDayInformation.tomorrow.date,
    CurrentSettings,
  );
  const todayLiturgyMasters = await obtainLiturgyMasters(CurrentLiturgyDayInformation, CurrentSettings);
  const tomorrowLiturgyMasters = await obtainLiturgyMasters(tomorrowLiturgyDayInformation, CurrentSettings);
  CurrentHoursLiturgy = await obtainHoursLiturgy(
    todayLiturgyMasters,
    tomorrowLiturgyMasters,
    CurrentLiturgyDayInformation,
    CurrentSettings,
  );
  CurrentCelebrationInformation = obtainCurrentCelebrationInformation(CurrentHoursLiturgy);
  CurrentMassLiturgy = await obtainMassLiturgy(
    CurrentLiturgyDayInformation,
    CurrentHoursLiturgy.todayCelebrationInformation,
    CurrentHoursLiturgy.tomorrowCelebrationInformation,
    CurrentSettings,
  );
  Logger.log(
    Logger.LogKeys.FileSystemService,
    'reloadAllData',
    'Total time reloading data: ',
    DateManagement.differenceBetweenDatesInSeconds(LastRefreshDate, new Date()) + 's',
  );
}

async function obtainCurrentSettings(date: Date): Promise<Settings> {
  let currentSettings = new Settings();
  currentSettings.prayingPlace = (await SettingsService.getSettingLloc()) as string;
  currentSettings.dioceseName = (await SettingsService.getSettingDiocesis()) as string;
  currentSettings.dioceseCode = getDioceseCodeFromDioceseName(
    currentSettings.dioceseName,
    currentSettings.prayingPlace,
  );
  currentSettings.dioceseCode2Letters =
    currentSettings.dioceseCode === DioceseCode.Andorra
      ? currentSettings.dioceseCode
      : currentSettings.dioceseCode.substring(0, 2);
  currentSettings.useLatin = (await SettingsService.getSettingUseLatin()) === 'true';
  currentSettings.textSize = (await SettingsService.getSettingTextSize()) as number;
  currentSettings.darkModeEnabled = determineDarkModeIsEnabled((await SettingsService.getSettingDarkMode()) as string);
  currentSettings.invitationPsalmOption = (await SettingsService.getSettingNumSalmInv()) as string;
  currentSettings.virginAntiphonOption = (await SettingsService.getSettingNumAntMare()) as string;
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

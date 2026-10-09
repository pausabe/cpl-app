import { Appearance } from 'react-native';
import SettingsService, { DarkModeOption, DEFAULT_EDITION } from './SettingsService';
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
import * as CalendarService from './calendarService';
import { SpecificLiturgyTimeType } from './celebrationTimeEnums';
import * as CelebrationIdentifierService from './celebrationIdentifierService';
import { Celebration } from './celebrationIdentifierService';
import { Asset } from 'expo-asset';
import { DioceseCode } from './databaseEnums';
import * as CelebrationHoursLiturgyService from './liturgy/celebrationHoursLiturgyService';
import * as CelebrationInformationService from './liturgy/celebrationInformationService';
import * as LiturgicalYearService from './liturgicalYearService';
import { DayMark } from './liturgicalYearService';

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
  // The Lord's Prayer whole: the hours show only «Pare nostre.», and the voice says all of it
  ourFatherPrayer: string;
}

const current: CurrentLiturgy = {
  lastRefreshDate: new Date(),
  settings: new Settings(),
  databaseInformation: new DatabaseInformation(),
  liturgyDayInformation: new LiturgyDayInformation(),
  celebrationInformation: new CelebrationInformation(),
  hoursLiturgy: new HoursLiturgy(),
  massLiturgy: new MassLiturgy(),
  ourFatherPrayer: '',
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
  current.ourFatherPrayer = todayLiturgyMasters.various.ourFatherPrayer ?? '';
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

// Another day, for the calendar: its information and its celebration, worked out as a reload
// would, so that the calendar says of it what the home will say after changing to it. Nothing
// of the day being shown changes. With the settings of the day shown, except the optional
// memorial, which is kept for one day.
export interface DayPreview {
  day: LiturgySpecificDayInformation;
  celebration: CelebrationInformation;
  settings: Settings;
}

export async function obtainDayPreview(date: Date): Promise<DayPreview> {
  const settings: Settings = {
    ...current.settings,
    optionalFestivityEnabled: await determineOptionalFestivityEnabled(date),
  };
  const dayInformation = await obtainCurrentLiturgyDayInformation(date, settings);
  const masters = await obtainLiturgyMasters(dayInformation, settings);
  const celebration = CelebrationInformationService.obtainCelebrationInformation(
    dayInformation.today,
    CelebrationHoursLiturgyService.obtainDayCelebrationInformation(masters, dayInformation.today, settings),
  );
  return { day: dayInformation.today, celebration, settings };
}

// Another day, for the widgets of the home screen: what the home would show of it, worked out as a
// reload would, with its first Vespers and its Mass. Nothing of the day being shown changes. The
// settings are those of the day shown, except the optional memorial, as in obtainDayPreview.
export interface WidgetDayData {
  day: LiturgyDayInformation;
  celebration: CelebrationInformation;
  settings: Settings;
  vespersTitle: string;
  mass: MassLiturgy;
}

export async function obtainWidgetDay(date: Date): Promise<WidgetDayData> {
  const settings: Settings = {
    ...current.settings,
    optionalFestivityEnabled: await determineOptionalFestivityEnabled(date),
  };
  const day = await obtainCurrentLiturgyDayInformation(date, settings);
  const tomorrow = await obtainCurrentLiturgyDayInformation(day.tomorrow.date, settings);
  const todayMasters = await obtainLiturgyMasters(day, settings);
  const tomorrowMasters = await obtainLiturgyMasters(tomorrow, settings);
  const hours = await obtainHoursLiturgy(todayMasters, tomorrowMasters, day, settings);
  const mass = await obtainMassLiturgy(
    day,
    hours.todayCelebrationInformation,
    hours.tomorrowCelebrationInformation,
    settings,
  );
  return {
    day,
    celebration: obtainCurrentCelebrationInformation(hours),
    settings,
    vespersTitle: hours.vespers?.title ?? '',
    mass,
  };
}

// The colour, the rank and the season of every day of a year, in the place of the day shown
export function obtainYearMarks(year: number): Promise<DayMark[]> {
  return LiturgicalYearService.obtainYearMarks(year, current.settings);
}

async function obtainCurrentSettings(date: Date): Promise<Settings> {
  let currentSettings = new Settings();
  // The place saved for the edition of the database open: each edition has its own calendars
  const edition = DatabaseManagerService.openedDatabaseEdition() ?? DEFAULT_EDITION;
  currentSettings.prayingPlace = await SettingsService.getSettingPrayingPlace(edition);
  currentSettings.dioceseName = await SettingsService.getSettingDiocese(edition);
  // The code of the place in the tables of texts: the one of its calendar when the database has
  // calendars, and otherwise the one the app has always known
  const calendars = await CalendarService.obtainCalendars();
  if (calendars) {
    const place = CalendarService.resolvePlace(
      CalendarService.placeOptions(calendars),
      currentSettings.dioceseName,
      currentSettings.prayingPlace,
    );
    currentSettings.dioceseName = place.diocese;
    currentSettings.prayingPlace = place.place;
  }
  const calendar = calendars ? CalendarService.calendarOfPlace(calendars, currentSettings) : undefined;
  currentSettings.dioceseCode =
    calendar?.code ?? getDioceseCodeFromDioceseName(currentSettings.dioceseName, currentSettings.prayingPlace);
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

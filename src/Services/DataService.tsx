import {Appearance} from 'react-native';
import SettingsService, {DarkModeOption} from './SettingsService';
import * as DatabaseDataService from './DatabaseDataService';
import * as DatabaseManagerService from './DatabaseManagerService';
import {getDatabaseVersion} from './DatabaseDataService';
import * as StorageService from './Storage/StorageService';
import * as SpecialCelebrationService from './SpecialCelebrationService';
import StorageKeys from './Storage/StorageKeys';
import * as Logger from "../Utils/Logger";
import {Settings} from "../Models/Settings";
import DatabaseInformation from "../Models/DatabaseInformation";
import LiturgyDayInformation, {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import {ObtainHoursLiturgy} from "./Liturgy/HoursLiturgyService";
import {ObtainLiturgyMasters} from "./Liturgy/LiturgyMastersService";
import HoursLiturgy from "../Models/HoursLiturgy/HoursLiturgy";
import MassLiturgy from "../Models/MassLiturgy";
import CelebrationInformation from '../Models/HoursLiturgy/CelebrationInformation';
import {ObtainMassLiturgy} from './Liturgy/MassLiturgyService';
import {DateManagement} from "../Utils/DateManagement";
import {GetDioceseCodeFromDioceseName} from "./DatabaseDataHelper";
import {SpecificLiturgyTimeType} from "./CelebrationTimeEnums";
import * as CelebrationIdentifierService from "./CelebrationIdentifierService";
import {Celebration} from "./CelebrationIdentifierService";
import { Asset } from 'expo-asset';
import {DioceseCode} from "./DatabaseEnums";

// TODO: [UI Refactor] I don't like the idea of these variables made public to all project
//  it should be hidden and only controllers should access it
export let LastRefreshDate = new Date()
export let CurrentSettings = new Settings();
export let CurrentDatabaseInformation = new DatabaseInformation();
export let CurrentLiturgyDayInformation = new LiturgyDayInformation();
export let CurrentCelebrationInformation = new CelebrationInformation();
export let CurrentHoursLiturgy = new HoursLiturgy();
export let CurrentMassLiturgy = new MassLiturgy();

export async function ReloadAllData(date: Date, databaseAsset: Asset) {
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', 'Starting reloading data');
    LastRefreshDate = new Date();
    await DatabaseManagerService.OpenDatabase(databaseAsset);
    CurrentSettings = await ObtainCurrentSettings(date);
    CurrentDatabaseInformation = await ObtainCurrentDatabaseInformation();
    CurrentLiturgyDayInformation = await ObtainCurrentLiturgyDayInformation(date, CurrentSettings);
    const tomorrowLiturgyDayInformation = await ObtainCurrentLiturgyDayInformation(CurrentLiturgyDayInformation.Tomorrow.Date, CurrentSettings);
    const todayLiturgyMasters = await ObtainLiturgyMasters(CurrentLiturgyDayInformation, CurrentSettings);
    const tomorrowLiturgyMasters = await ObtainLiturgyMasters(tomorrowLiturgyDayInformation, CurrentSettings);
    CurrentHoursLiturgy = await ObtainHoursLiturgy(todayLiturgyMasters, tomorrowLiturgyMasters, CurrentLiturgyDayInformation, CurrentSettings);
    CurrentCelebrationInformation = ObtainCurrentCelebrationInformation(CurrentHoursLiturgy);
    CurrentMassLiturgy = await ObtainMassLiturgy(CurrentLiturgyDayInformation, CurrentHoursLiturgy.TodayCelebrationInformation, CurrentHoursLiturgy.TomorrowCelebrationInformation, CurrentSettings);
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', 'Total time reloading data: ', DateManagement.DifferenceBetweenDatesInSeconds(LastRefreshDate, new Date()) + "s");
}

async function ObtainCurrentSettings(date: Date) : Promise<Settings>{
    let currentSettings = new Settings();
    currentSettings.PrayingPlace = await SettingsService.getSettingLloc() as string;
    currentSettings.DioceseName = await SettingsService.getSettingDiocesis() as string;
    currentSettings.DioceseCode = GetDioceseCodeFromDioceseName(
        currentSettings.DioceseName,
        currentSettings.PrayingPlace);
    currentSettings.DioceseCode2Letters = currentSettings.DioceseCode === DioceseCode.Andorra ? currentSettings.DioceseCode : currentSettings.DioceseCode.substring(0, 2);
    currentSettings.UseLatin = await SettingsService.getSettingUseLatin() === 'true';
    currentSettings.TextSize = await SettingsService.getSettingTextSize() as number;
    currentSettings.DarkModeEnabled = DetermineDarkModeIsEnabled(await SettingsService.getSettingDarkMode() as string);
    currentSettings.InvitationPsalmOption = await SettingsService.getSettingNumSalmInv() as string;
    currentSettings.VirginAntiphonOption = await SettingsService.getSettingNumAntMare() as string;
    currentSettings.OptionalFestivityEnabled = await DetermineOptionalFestivityEnabled(date);
    return currentSettings;
}

function DetermineDarkModeIsEnabled(darkModeConfiguration: string) : boolean{
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

async function DetermineOptionalFestivityEnabled(date: Date) : Promise<boolean> {
    let optionalFestivityEnabled = false;
    const optionalFestivityDate = await StorageService.GetData(StorageKeys.OptionalFestivity) as string;
    if (optionalFestivityDate && optionalFestivityDate !== 'none') { // 'none' if from the code before the refactor, legacy
        let dateArray = optionalFestivityDate.split(':');
        if (dateArray.length === 3) {
            optionalFestivityEnabled =
                (parseInt(dateArray[0]) === date.getDate() &&
                    parseInt(dateArray[1]) === date.getMonth() &&
                    parseInt(dateArray[2]) === date.getFullYear());
        }
    }
    return optionalFestivityEnabled;
}

async function ObtainCurrentDatabaseInformation() : Promise<DatabaseInformation>{
    let databaseInformation = new DatabaseInformation();
    databaseInformation.Version = await getDatabaseVersion()
    let minimumAndMaximumSelectableDates = await DatabaseDataService.ObtainMinimumAndMaximumSelectableDates();
    databaseInformation.MinimumSelectableDate = minimumAndMaximumSelectableDates.MinimumSelectableDate;
    databaseInformation.MaximumSelectableDate = minimumAndMaximumSelectableDates.MaximumSelectableDate;
    return databaseInformation;
}

async function ObtainCurrentLiturgyDayInformation(date: Date, settings: Settings) : Promise<LiturgyDayInformation>{
    let currentLiturgyDayInformation = new LiturgyDayInformation();
    currentLiturgyDayInformation.Today = await DatabaseDataService.ObtainLiturgySpecificDayInformation(date, settings);
    currentLiturgyDayInformation.Today.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(currentLiturgyDayInformation.Today, settings);
    currentLiturgyDayInformation.Today.IsSpecialChristmas = IsSpecialChristmas(currentLiturgyDayInformation.Today);
    const tomorrowDate = new Date(date);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    currentLiturgyDayInformation.Tomorrow = await DatabaseDataService.ObtainLiturgySpecificDayInformation(tomorrowDate, settings);
    currentLiturgyDayInformation.Tomorrow.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(currentLiturgyDayInformation.Tomorrow, settings);
    currentLiturgyDayInformation.Tomorrow.IsSpecialChristmas = IsSpecialChristmas(currentLiturgyDayInformation.Tomorrow);
    return currentLiturgyDayInformation;
}

function IsSpecialChristmas(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean{
    if(liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary){
        return false;
    }

    if(CelebrationIdentifierService.CheckCelebration(Celebration.SacredFamily, liturgySpecificDayInformation)){
        return false;
    }

    if(liturgySpecificDayInformation.Date.getMonth() === 11){
        return liturgySpecificDayInformation.Date.getDate() === 17 ||
            liturgySpecificDayInformation.Date.getDate() === 18 ||
            liturgySpecificDayInformation.Date.getDate() === 19 ||
            liturgySpecificDayInformation.Date.getDate() === 20 ||
            liturgySpecificDayInformation.Date.getDate() === 21 ||
            liturgySpecificDayInformation.Date.getDate() === 22 ||
            liturgySpecificDayInformation.Date.getDate() === 23 ||
            liturgySpecificDayInformation.Date.getDate() === 24 ||
            liturgySpecificDayInformation.Date.getDate() === 29 ||
            liturgySpecificDayInformation.Date.getDate() === 30 ||
            liturgySpecificDayInformation.Date.getDate() === 31;
    }
    else if(liturgySpecificDayInformation.Date.getMonth() === 0){
        return liturgySpecificDayInformation.Date.getDate() === 2 ||
            liturgySpecificDayInformation.Date.getDate() === 3 ||
            liturgySpecificDayInformation.Date.getDate() === 4 ||
            liturgySpecificDayInformation.Date.getDate() === 5 ||
            liturgySpecificDayInformation.Date.getDate() === 7 ||
            liturgySpecificDayInformation.Date.getDate() === 8 ||
            liturgySpecificDayInformation.Date.getDate() === 9 ||
            liturgySpecificDayInformation.Date.getDate() === 10 ||
            liturgySpecificDayInformation.Date.getDate() === 11 ||
            liturgySpecificDayInformation.Date.getDate() === 12;
    }
    return false;
}

function ObtainCurrentCelebrationInformation(hoursLiturgy: HoursLiturgy): CelebrationInformation{
    // For now, celebration information is inside hour's data. In the future it should be complete separated
    return hoursLiturgy.TodayCelebrationInformation;
}


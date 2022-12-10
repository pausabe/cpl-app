import {Appearance} from 'react-native';
import GlobalViewFunctions from "../Utils/GlobalViewFunctions";
import SettingsService, {DarkModeOption} from './SettingsService';
import * as DatabaseDataService from './DatabaseDataService';
import * as StorageService from './Storage/StorageService';
import * as SpecialCelebrationService from './SpecialCelebrationService';
import StorageKeys from './Storage/StorageKeys';
import {getDatabaseVersion} from "./DatabaseDataService";
import * as Logger from "../Utils/Logger";
import {Settings} from "../Models/Settings";
import DatabaseInformation from "../Models/DatabaseInformation";
import LiturgyDayInformation, {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import {ObtainHoursLiturgy} from "./Liturgy/HoursLiturgyService";
import {ObtainLiturgyMasters} from "./Liturgy/LiturgyMastersService";
import HoursLiturgy from "../Models/HoursLiturgy/HoursLiturgy";
import MassLiturgy from "../Models/MassLiturgy";
import CelebrationInformation from '../Models/HoursLiturgy/CelebrationInformation';
import { ObtainMassLiturgy } from './Liturgy/MassLiturgyService';
import {DateManagement} from "../Utils/DateManagement";
import {GetDioceseCodeFromDioceseName} from "./DatabaseDataHelper";
import {SpecificLiturgyTimeType} from "./CelebrationTimeEnums";

// TODO: [UI Refactor] I don't like the idea of these variables made public to all project
//  it should be hidden and only controllers should access it
export let LastRefreshDate = new Date()
export let CurrentSettings = new Settings();
export let CurrentDatabaseInformation = new DatabaseInformation();
export let CurrentLiturgyDayInformation = new LiturgyDayInformation();
export let CurrentCelebrationInformation = new CelebrationInformation();
export let CurrentHoursLiturgy = new HoursLiturgy();
export let CurrentMassLiturgy = new MassLiturgy();

export async function ReloadAllData(date) {
    LastRefreshDate = new Date();
    CurrentSettings = await ObtainCurrentSettings(date);
    CurrentDatabaseInformation = await ObtainCurrentDatabaseInformation();
    CurrentLiturgyDayInformation = await ObtainCurrentLiturgyDayInformation(date, CurrentSettings);
    const tomorrowLiturgyDayInformation = await ObtainCurrentLiturgyDayInformation(CurrentLiturgyDayInformation.Tomorrow.Date, CurrentSettings);
    const todayLiturgyMasters = await ObtainLiturgyMasters(CurrentLiturgyDayInformation, CurrentSettings);
    const tomorrowLiturgyMasters = await ObtainLiturgyMasters(tomorrowLiturgyDayInformation, CurrentSettings);
    CurrentHoursLiturgy = await ObtainHoursLiturgy(todayLiturgyMasters, tomorrowLiturgyMasters, CurrentLiturgyDayInformation, CurrentSettings);
    CurrentCelebrationInformation = ObtainCurrentCelebrationInformation(CurrentHoursLiturgy);
    CurrentMassLiturgy = await ObtainMassLiturgy(CurrentLiturgyDayInformation, CurrentHoursLiturgy.TodayCelebrationInformation, CurrentHoursLiturgy.TomorrowCelebrationInformation, CurrentSettings);
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', 'Total time passed: ', DateManagement.DifferenceBetweenDatesInSeconds(LastRefreshDate, new Date()) + "s");
}

async function ObtainCurrentSettings(date: Date) : Promise<Settings>{
    let currentSettings = new Settings();
    currentSettings.PrayingPlace = await SettingsService.getSettingLloc() as string;
    currentSettings.DioceseName = await SettingsService.getSettingDiocesis() as string;
    currentSettings.DioceseCode = GetDioceseCodeFromDioceseName(
        currentSettings.DioceseName,
        currentSettings.PrayingPlace);
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

async function ObtainCurrentLiturgyDayInformation(date: Date, settings : Settings) : Promise<LiturgyDayInformation>{
    let currentLiturgyDayInformation = new LiturgyDayInformation();
    currentLiturgyDayInformation.Today = await DatabaseDataService.ObtainLiturgySpecificDayInformation(date, settings);
    currentLiturgyDayInformation.Today.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(currentLiturgyDayInformation.Today, settings);
    currentLiturgyDayInformation.Today.IsSpecialChristmas = IsSpecialChristmas(currentLiturgyDayInformation.Today.SpecificLiturgyTime, date);
    const tomorrowDate = new Date(date);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    currentLiturgyDayInformation.Tomorrow = await DatabaseDataService.ObtainLiturgySpecificDayInformation(tomorrowDate, settings);
    currentLiturgyDayInformation.Tomorrow.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(currentLiturgyDayInformation.Tomorrow, settings);
    currentLiturgyDayInformation.Tomorrow.IsSpecialChristmas = IsSpecialChristmas(currentLiturgyDayInformation.Tomorrow.SpecificLiturgyTime, tomorrowDate);
    return currentLiturgyDayInformation;
}

function IsSpecialChristmas(specificLiturgyTimeType: SpecificLiturgyTimeType, date: Date): boolean{
    if(specificLiturgyTimeType === SpecificLiturgyTimeType.Ordinary)
        return false;
    if(date.getMonth() === 11){
        return date.getDate() === 17 ||
            date.getDate() === 18 ||
            date.getDate() === 19 ||
            date.getDate() === 20 ||
            date.getDate() === 21 ||
            date.getDate() === 22 ||
            date.getDate() === 23 ||
            date.getDate() === 24 ||
            date.getDate() === 29 ||
            date.getDate() === 30 ||
            date.getDate() === 31;
    }
    else if(date.getMonth() === 0){
        return date.getDate() === 2 ||
            date.getDate() === 3 ||
            date.getDate() === 4 ||
            date.getDate() === 5 ||
            date.getDate() === 7 ||
            date.getDate() === 8 ||
            date.getDate() === 9 ||
            date.getDate() === 10 ||
            date.getDate() === 11 ||
            date.getDate() === 12;
    }
    return false;
}

function ObtainCurrentCelebrationInformation(hoursLiturgy: HoursLiturgy): CelebrationInformation{
    // For now, celebration information is inside hour's data. In the future it should be complete separated
    return hoursLiturgy.TodayCelebrationInformation;
}


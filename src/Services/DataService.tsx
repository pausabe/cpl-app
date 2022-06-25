import {Appearance} from 'react-native';
import GF from "../Utils/GlobalFunctions";
import {SetupLiturgy} from './Liturgy/LiturgyService';
import SettingsService from './SettingsService';
import * as DatabaseDataService from './DatabaseDataService';
import * as StorageService from './Storage/StorageService';
import StorageKeys from './Storage/StorageKeys';
import {getDatabaseVersion, ObtainLiturgySpecificDayInformation, ObtainPentecostDay} from "./DatabaseDataService";
import * as Logger from "../Utils/Logger";
import GLOBAL from '../Utils/GlobalKeys';
import {Settings} from "../Models/Settings";
import HoursLiturgy from "../Models/HoursLiturgy";
import MassLiturgy from "../Models/MassLiturgy";
import DatabaseInformation from "../Models/DatabaseInformation";
import LiturgySpecificDayInformation from "../Models/LiturgyDayInformation";
import LiturgyDayInformation from "../Models/LiturgyDayInformation";

export let LastRefreshDate = new Date()
export let CurrentSettings = new Settings();
export let CurrentDatabaseInformation = new DatabaseInformation();
export let CurrentLiturgyDayInformation;
export let CurrentHoursLiturgy;
export let CurrentMassLiturgy;

export async function ReloadAllData(date) {
    LastRefreshDate = new Date();
    CurrentSettings = await ObtainCurrentSettings(date);
    CurrentDatabaseInformation = await ObtainCurrentDatabaseInformation();
    CurrentLiturgyDayInformation = await ObtainCurrentLiturgyDayInformation(CurrentSettings);
    CurrentHoursLiturgy = await ObtainCurrentHoursLiturgy();
    CurrentMassLiturgy = await ObtainCurrentMassLiturgy();
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', 'Total time passed: ', (new Date().getMilliseconds() - LastRefreshDate.getMilliseconds()) / 1000);
}

async function ObtainCurrentSettings(date: Date) : Promise<Settings>{
    let currentSettings = new Settings();
    currentSettings.TodayDate = date;
    const tomorrowDate = new Date(currentSettings.TodayDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    currentSettings.TomorrowDate = tomorrowDate;
    currentSettings.PrayingPlace = await SettingsService.getSettingLloc() as string;
    currentSettings.DioceseName = await SettingsService.getSettingDiocesis() as string;
    currentSettings.DioceseCode = GF.transformDiocesiName(
        currentSettings.DioceseName,
        currentSettings.PrayingPlace);
    currentSettings.UseLatin = await SettingsService.getSettingUseLatin() as boolean;
    currentSettings.TextSize = await SettingsService.getSettingTextSize() as number;
    currentSettings.DarkModeEnabled = DetermineDarkModeIsEnabled(await SettingsService.getSettingTextSize() as string);
    currentSettings.InvitationPsalmOption = await SettingsService.getSettingNumSalmInv() as string;
    currentSettings.VirginAntiphonOption = await SettingsService.getSettingNumAntMare() as string;

    // TODO: Simplify and move?---------
    const optionalFestivityDate = await StorageService.GetData(StorageKeys.OptionalFestivity) as string;
    if (!optionalFestivityDate){
        await StorageService.StoreData(StorageKeys.OptionalFestivity, 'none');
    }
    if (optionalFestivityDate && optionalFestivityDate !== 'none') {
        let dateArray = optionalFestivityDate.split(':');
        currentSettings.OptionalFestivityEnabled =
            (parseInt(dateArray[0]) === currentSettings.TodayDate.getDate() &&
            parseInt(dateArray[1]) === currentSettings.TodayDate.getMonth() &&
            parseInt(dateArray[2]) === currentSettings.TodayDate.getFullYear());
    }
    else {
        currentSettings.OptionalFestivityEnabled = false;
    }
    // TODO: ---------

    return currentSettings;
}

function DetermineDarkModeIsEnabled(darkModeConfiguration: string) : boolean{
    let currentDarkModeEnabled = false;
    switch (darkModeConfiguration) {
        case "Activat":
            currentDarkModeEnabled = true;
            break;
        case "Desactivat":
            currentDarkModeEnabled = false;
            break;
        case "Automàtic":
            currentDarkModeEnabled = Appearance.getColorScheme() === 'dark';
            break;
    }
    return currentDarkModeEnabled;
}

async function ObtainCurrentDatabaseInformation() : Promise<DatabaseInformation>{
    let databaseInformation = new DatabaseInformation();
    databaseInformation.Version = await getDatabaseVersion()
    let minimumAndMaximumSelectableDates = await DatabaseDataService.ObtainMinimumAndMaximumSelectableDates();
    databaseInformation.MinimumSelectableDate = minimumAndMaximumSelectableDates.MinimumSelectableDate;
    databaseInformation.MaximumSelectableDate = minimumAndMaximumSelectableDates.MaximumSelectableDate;
    return databaseInformation;
}

async function ObtainCurrentLiturgyDayInformation(currentSettings : Settings) : Promise<LiturgyDayInformation>{
    let currentLiturgyDayInformation = new LiturgyDayInformation();
    currentLiturgyDayInformation.Today = await DatabaseDataService.ObtainLiturgySpecificDayInformation(currentSettings.TodayDate, currentSettings);
    currentLiturgyDayInformation.Tomorrow = await DatabaseDataService.ObtainLiturgySpecificDayInformation(currentSettings.TomorrowDate, currentSettings);
    return currentLiturgyDayInformation;
}

async function ObtainCurrentHoursLiturgy() : Promise<HoursLiturgy>{
    let currentHoursLiturgy = new HoursLiturgy();
    return currentHoursLiturgy;
}

async function ObtainCurrentMassLiturgy() : Promise<MassLiturgy>{
    let currentMassLiturgy = new MassLiturgy();
    return currentMassLiturgy;
}

function SetGlobalValuesFromDatabase() {


    Check_Lliure_Date()
        .then(() => SetupLiturgy(GlobalData)
            .then((result) => {
                GlobalData.primVespres = primVespres();
                GlobalData.info_cel = result.CelebrationInformation;
                HoursLiturgy = result.HoursLiturgy;
                MassLiturgy = result.MassLiturgy;
                resolve();
            })
            .catch((error) => reject(error))
        );
}

}


function primVespres() {
    return (GlobalData.date.getDay() === 6 &&
                (GlobalData.celType !== 'S' || GlobalData.celType === 'S' && GlobalData.LT === GLOBAL.Q_SETMANES))
        ||
            HoursLiturgy.vespres1;
}

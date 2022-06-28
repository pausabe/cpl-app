import {Appearance} from 'react-native';
import GF from "../Utils/GlobalFunctions";
import SettingsService from './SettingsService';
import * as DatabaseDataService from './DatabaseDataService';
import * as StorageService from './Storage/StorageService';
import * as SpecialCelebrationService from './SpecialCelebrationService';
import StorageKeys from './Storage/StorageKeys';
import {getDatabaseVersion} from "./DatabaseDataService";
import * as Logger from "../Utils/Logger";
import {Settings} from "../Models/Settings";
import DatabaseInformation from "../Models/DatabaseInformation";
import LiturgyDayInformation from "../Models/LiturgyDayInformation";
import CelebrationInformation from "../Models/CelebrationInformation";
import {ObtainHoursLiturgy} from "./Liturgy/HoursLiturgyService";
import {ObtainLiturgyMasters} from "./Liturgy/LiturgyMastersService";
import HoursLiturgy from "../Models/HoursLiturgy/HoursLiturgy";
import MassLiturgy from "../Models/MassLiturgy";
import * as PrecedenceService from "./PrecedenceService";
import GLOBAL from "../Utils/GlobalKeys";

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
    const liturgyMasters = await ObtainLiturgyMasters(CurrentLiturgyDayInformation, CurrentSettings);
    CurrentHoursLiturgy = await ObtainHoursLiturgy(liturgyMasters, CurrentLiturgyDayInformation);
    CurrentMassLiturgy = await ObtainMassLiturgy(liturgyMasters, globalData);
    CurrentCelebrationInformation = await ObtainCurrentCelebrationInformation();

    /*
    TODO: !!!
    GlobalData.primVespres ???
    function DetermineTodayVespersAreTomorrowFirstVespers(date: Date, celebrationType: string, specificLiturgyTime: string) {
        return (date.getDay() === 6 &&
                (celebrationType || (celebrationType === 'S' && specificLiturgyTime === GLOBAL.Q_SETMANES)))
            ||
            HoursLiturgy.vespres1;
    }*/

    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', 'Total time passed: ', (new Date().getMilliseconds() - LastRefreshDate.getMilliseconds()) / 1000);
}

async function ObtainCurrentSettings(date: Date) : Promise<Settings>{
    let currentSettings = new Settings();
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
    currentSettings.OptionalFestivityEnabled = await DetermineOptionalFestivityEnabled(date);
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

async function ObtainCurrentLiturgyDayInformation(date: Date, currentSettings : Settings) : Promise<LiturgyDayInformation>{
    let currentLiturgyDayInformation = new LiturgyDayInformation();
    currentLiturgyDayInformation.Today = await DatabaseDataService.ObtainLiturgySpecificDayInformation(date, currentSettings);
    currentLiturgyDayInformation.Today.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(currentLiturgyDayInformation.Today, currentSettings);
    currentLiturgyDayInformation.Today.Precedence = PrecedenceService.ObtainPrecedence(currentLiturgyDayInformation.Today);
    const tomorrowDate = new Date(date);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    currentLiturgyDayInformation.Tomorrow = await DatabaseDataService.ObtainLiturgySpecificDayInformation(tomorrowDate, currentSettings);
    currentLiturgyDayInformation.Tomorrow.SpecialCelebration = SpecialCelebrationService.ObtainSpecialCelebration(currentLiturgyDayInformation.Tomorrow, currentSettings);
    return currentLiturgyDayInformation;
}

async function ObtainCurrentCelebrationInformation() : Promise<CelebrationInformation>{
    let currentCelebrationInformation = new CelebrationInformation();
    // TODO:
    setSomeInfo();
    return currentCelebrationInformation;
}

function setSomeInfo() {
    if (GlobalData.LT === GLOBAL.Q_DIUM_RAMS) {
        LITURGIA.info_cel.nomCel = "Diumenge de Rams";
        LITURGIA.info_cel.infoCel = '-';
        LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.Q_SET_SANTA) {
        LITURGIA.info_cel.nomCel = weekDayName(GlobalData.date.getDay()) + " Sant";
        LITURGIA.info_cel.infoCel = '-';
        LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.Q_TRIDU) {
        LITURGIA.info_cel.nomCel = weekDayName(GlobalData.date.getDay()) + " Sant";
        LITURGIA.info_cel.infoCel = '-';
        LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.P_OCTAVA) {
        LITURGIA.info_cel.nomCel = "Octava de Pasqua";
        LITURGIA.info_cel.infoCel = '-';
        LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-'
        && GlobalData.LT === GLOBAL.N_OCTAVA
        && idTSF === -1 && idDE === -1) {
        LITURGIA.info_cel.nomCel = "Octava de Nadal";
        LITURGIA.info_cel.infoCel = '-';
        LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.Q_CENDRA) {
        LITURGIA.info_cel.nomCel = "Cendra";
        LITURGIA.info_cel.infoCel = '-';
        LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.A_FERIES) {
        LITURGIA.info_cel.nomCel = "Fèria d’Advent";
        LITURGIA.info_cel.infoCel = '-';
        LITURGIA.info_cel.typeCel = '-';
    }
}

function weekDayName(num) {
    switch (num) {
        case 0:
            return ("Diumenge");
            break;
        case 1:
            return ("Dilluns");
            break;
        case 2:
            return ("Dimarts");
            break;
        case 3:
            return ("Dimecres");
            break;
        case 4:
            return ("Dijous");
            break;
        case 5:
            return ("Divendres");
            break;
        case 6:
            return ("Dissabte");
            break;
    }
}


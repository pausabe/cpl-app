import {Appearance} from 'react-native';
import GF from "../Utils/GlobalFunctions";
import {SetupLiturgy} from './Liturgy/LiturgyService';
import SettingsService from './SettingsService';
import * as DatabaseDataService from './DatabaseDataService';
import * as StorageService from './Storage/StorageService';
import StorageKeys from './Storage/StorageKeys';
import {getDatabaseVersion} from "./DatabaseDataService";
import * as Logger from "../Utils/Logger";
import GLOBAL from '../Utils/GlobalKeys';

export let GlobalData = {}
export let HoursLiturgyData = {}
export let MassLiturgyData = {}
export let LAST_REFRESH = new Date()

export async function ReloadAllData(date) { // 2.5
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', `Init Reload`);
    let logDate = new Date();
    LAST_REFRESH = new Date();
    await SetGlobalValuesFromSettings(date); // 0.5s
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', `SetGlobalValuesFromSettings DONE. Seconds passed: `, (new Date() - logDate) / 1000);
    logDate = new Date();
    GlobalData.databaseVersion = await getDatabaseVersion(); // 0.7s
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', `getDatabaseVersion DONE. Time passed: `, (new Date() - logDate) / 1000);
    logDate = new Date();
    await SetGlobalValuesFromDatabase(); // 1.3s
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', `SetGlobalValuesFromDatabase DONE. Time passed: `, (new Date() - logDate) / 1000);
    Logger.Log(Logger.LogKeys.FileSystemService, 'ReloadAllData', `Total time passed: `, (new Date() - LAST_REFRESH) / 1000);
}

function SetGlobalValuesFromSettings(date){
    GlobalData.date = date;
    return Promise.all([
        SettingsService.getSettingLloc((r) => {
            GlobalData.lloc = r;
        }),
        SettingsService.getSettingDiocesis((r) => {
            GlobalData.diocesi = GF.transformDiocesiName(r, GlobalData.lloc);
            GlobalData.diocesiName = r;
        }),
        SettingsService.getSettingUseLatin((r) => GlobalData.llati = r),
        SettingsService.getSettingTextSize((r) => GlobalData.textSize = r),
        SettingsService.getSettingDarkMode((r) => {
            let aux_darkMode = false;
            switch (r) {
                case "Activat":
                    aux_darkMode = true;
                    break;
                case "Desactivat":
                    aux_darkMode = false;
                    break;
                case "Automàtic":
                    aux_darkMode = Appearance.getColorScheme() === 'dark';
                    break;
            }
            GlobalData.darkModeEnabled = aux_darkMode;
        }),
        SettingsService.getSettingNumSalmInv((r) => GlobalData.numSalmInv = r),
        SettingsService.getSettingNumAntMare((r) => GlobalData.numAntMare = r),
    ])
}

function SetGlobalValuesFromDatabase() {
    return new Promise((resolve, reject) => {
        DatabaseDataService.getAnyLiturgic(
            GlobalData.date.getFullYear(),
            GlobalData.date.getMonth(),
            GlobalData.date.getDate(),
            (current, tomorrow, pentacosta, minDate, maxDate) => {
                GlobalData.minDatePicker = minDate;
                GlobalData.maxDatePicker = maxDate;

                const celType = GF.getCelType(GlobalData.diocesi, current);
                const tomorrowCelType = GF.getCelType(GlobalData.diocesi, tomorrow);

                GlobalData.celType = celType;
                GlobalData.diaMogut = current.diaMogut;
                GlobalData.diocesiMogut = current.diocesiMogut;
                GlobalData.litColor = current.Color;
                GlobalData.pentacosta = pentacosta;
                GlobalData.tempsespecific = current.tempsespecific; //Ordinari, Quaresma, ...
                GlobalData.LT = current.temps; //O_ORDINAR, A_SETMANES, ...
                GlobalData.cicle = current.cicle; //1-4
                GlobalData.setmana = current.NumSet; //Ordinari: 1-34, pasqua: 2-7 i quaresma: 1-5 o 2-7
                GlobalData.ABC = current.anyABC; //A, B o C
                GlobalData.parImpar = current.paroimpar; //I o II
                GlobalData.diaDeLaSetmana = current.DiadelaSetmana;

                const tomorrow_date = new Date(GlobalData.date.getFullYear(), GlobalData.date.getMonth(), GlobalData.date.getDate());
                tomorrow_date.setDate(tomorrow_date.getDate() + 1);

                GlobalData.dataTomorrow = {
                    date: tomorrow_date,
                    celType: tomorrowCelType,
                    diaMogut: tomorrow.diaMogut,
                    diocesiMogut: tomorrow.diocesiMogut,
                    litColor: tomorrow.Color,
                    tempsespecific: tomorrow.tempsespecific,
                    LT: tomorrow.temps,
                    cicle: tomorrow.cicle,
                    setmana: tomorrow.NumSet,
                    ABC: tomorrow.anyABC,
                    parImpar: tomorrow.paroimpar,
                    diaDeLaSetmana: tomorrow.DiadelaSetmana
                };
                Check_Lliure_Date()
                    .then(() => SetupLiturgy(GlobalData)
                        .then((result) => {
                            GlobalData.primVespres = primVespres();
                            GlobalData.info_cel = result.CelebrationInformation;
                            HoursLiturgyData = result.HoursLiturgy;
                            MassLiturgyData = result.MassLiturgy;
                            resolve();
                        })
                        .catch((error) => reject(error))
                    );
            }
            ,(error) => reject(error)
        );
    });
}

function Check_Lliure_Date() {
    return new Promise((resolve) =>{
        StorageService.GetData(StorageKeys.OptionalFestivity)
            .then((value) => {
                if (!value){
                    StorageService.StoreData(StorageKeys.OptionalFestivity, 'none');
                }
                if (value && value !== 'none') {
                    let dataArr = value.split(':');
                    GlobalData.lliures = parseInt(dataArr[0]) === GlobalData.date.getDate() &&
                        parseInt(dataArr[1]) === GlobalData.date.getMonth() &&
                        parseInt(dataArr[2]) === GlobalData.date.getFullYear();
                }
                else {
                    GlobalData.lliures = false;
                }
                resolve();
        });
    });
}

function primVespres() {
    return (GlobalData.date.getDay() === 6 &&
                (GlobalData.celType !== 'S' || GlobalData.celType === 'S' && GlobalData.LT === GLOBAL.Q_SETMANES))
        ||
            HoursLiturgyData.vespres1;
}

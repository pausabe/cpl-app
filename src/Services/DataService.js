import {Appearance, AsyncStorage} from 'react-native';
import GF from "../Globals/GlobalFunctions";
import {SetSoul} from '../Controllers/Classes/SOUL/SOUL';
import SettingsManager from '../Controllers/Classes/SettingsManager';
import {OpenDatabase} from './DatabaseOpenerService';
import {UpdateDatabase} from './DatabaseUpdaterService';
import * as DatabaseDataService from './DatabaseDataService';
import * as Logger from '../Utils/Logger';

export let GlobalData = {}
export let HoursLiturgyData = {}
export let MassLiturgyData = {}
export let LAST_REFRESH = new Date()

export async function ReloadAllData(date, updateDatabase) {
    LAST_REFRESH = new Date();
    await OpenDatabase();
    await SetGlobalValuesFromSettings(date);
    if(updateDatabase){
        GlobalData.databaseVersion = await UpdateDatabase();
    }
    await SetGlobalValuesFromDatabase();
}

function SetGlobalValuesFromSettings(date){
    GlobalData.date = date;
    return Promise.all([
        SettingsManager.getSettingLloc((r) => {
            GlobalData.lloc = r;
        }),
        SettingsManager.getSettingDiocesis((r) => {
            GlobalData.diocesi = GF.transformDiocesiName(r, GlobalData.lloc);
            GlobalData.diocesiName = r;
        }),
        SettingsManager.getSettingUseLatin((r) => GlobalData.llati = r),
        SettingsManager.getSettingTextSize((r) => GlobalData.textSize = r),
        SettingsManager.getSettingDarkMode((r) => {
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
        SettingsManager.getSettingNumSalmInv((r) => GlobalData.numSalmInv = r),
        SettingsManager.getSettingNumAntMare((r) => GlobalData.numAntMare = r),
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
                    .then(() => SetSoul(GlobalData)
                        .then((result) => {
                            HoursLiturgyData = result.liturgia_hores;
                            GlobalData.info_cel = result.info_cel;
                            GlobalData.primVespres = primVespres();
                            MassLiturgyData = result.liturgia_diaria;
                            resolve();
                        })
                    );
            }
            ,(error) => reject(error)
        );
    });
}

function Check_Lliure_Date() {
    return new Promise((resolve) =>{
        AsyncStorage.getItem("lliureDate")
            .then((value) => {
                if (!value){
                    //TODO: treat promise
                    AsyncStorage.setItem('lliureDate', 'none');
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
    return (GlobalData.date.getDay() === 6 && GlobalData.celType !== 'S') || HoursLiturgyData.vespres1;
}

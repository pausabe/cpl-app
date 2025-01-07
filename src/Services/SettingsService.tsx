import * as StorageService from './Storage/StorageService';

export enum DioceseName {
    Andorra = "Andorra",
    Barcelona = "Barcelona",
    Girona = "Girona",
    Lleida = "Lleida",
    Mallorca = "Mallorca",
    Menorca = "Menorca",
    SantFeliu = "Sant Feliu de Llobregat",
    Solsona = "Solsona",
    Tarragona = "Tarragona",
    Terrassa = "Terrassa",
    Tortosa = "Tortosa",
    Urgell = "Urgell",
    Vic = "Vic"
};

export enum PrayingPlace {
    Diocese = "Diòcesi",
    City = "Ciutat",
    Cathedral = "Catedral"
}

export enum InvitationPsalmOption {
  Psalm94 = '94',
  Psalm99 = '99',
  Psalm66 = '66',
  Psalm23 = '23'
}

export enum VirginAntiphonOption {
  Antiphon1 = '1',
  Antiphon2 = '2',
  Antiphon3 = '3',
  Antiphon4 = '4',
  Antiphon5 = '5'
}

export enum DarkModeOption {
    On = 'Activat',
    Off = 'Desactivat',
    System = 'Automàtic'
  }

const defaultSettings = {
    showGlories: "false",
    prayLliures: "false",
    useLatin: "false",
    textSize: "3", //1-5
    diocesis: DioceseName.Barcelona,
    lloc: PrayingPlace.Diocese,
    dayStart: "0", //Values from 0 to 3 allowed, which means 00:00AM, 01:00AM, 02:00AM and 03:00AM
    salmInvitatori: InvitationPsalmOption.Psalm94,
    antMare: VirginAntiphonOption.Antiphon1,
    darkMode: DarkModeOption.System
};

export default class SettingsService {

    /**
    * The undescore means that the method is "private", DO NOT USE outside of SettingsService
    *
    * Returns an asynchronous Promise with the callback set when callback is a Function, if not, returns just the Promise.
    */
    static _getStorageValue(key, callback, defaultValue){
        let getPromise = StorageService.GetData(key);
        let settingsPromise = new Promise((resolve, reject) => {
            getPromise.then(
                value => {
                    resolve(value == null ? defaultValue : value);
                }
            ).catch(
                error => reject(error)
            );
        });
        if(callback instanceof Function){
            settingsPromise.then(callback);
        }
        return settingsPromise;
    }

    static _setStorageValue(key, value, callback){
        let savePromise = StorageService.StoreData(key, value);
        if(callback) savePromise.then(callback);
        return savePromise;
    }

    static _setValueIfValid(key, value, validateFunc, callback){
        if(!(validateFunc instanceof Function) || validateFunc(value)){
            return SettingsService._setStorageValue(key, value, callback);
        }else{
            return new Promise((resolve, reject) => {
                reject(new Error("Invalid value"));
            });
        }
    }

    static getSettingShowGlories(callback){
        return SettingsService._getStorageValue("showGlories", callback, defaultSettings.showGlories);
    }

    static getSettingPrayLliures(callback){
        return SettingsService._getStorageValue("prayLliures", callback, defaultSettings.prayLliures);
    }

    static getSettingUseLatin(callback?){
        return SettingsService._getStorageValue("useLatin", callback, defaultSettings.useLatin);
    }

    static getSettingTextSize(callback?){
        return SettingsService._getStorageValue("textSize", callback, defaultSettings.textSize);
    }

    static getSettingDarkMode(callback?){
        return SettingsService._getStorageValue("darkMode", callback, defaultSettings.darkMode);
    }

    static getSettingDiocesis(callback?){
        return SettingsService._getStorageValue("diocesis", callback, defaultSettings.diocesis);
    }

    static getSettingLloc(callback?){
        return SettingsService._getStorageValue("lloc", callback, defaultSettings.lloc);
    }

    static getSettingDayStart(callback){
        return SettingsService._getStorageValue("dayStart", callback, defaultSettings.dayStart);
    }

    static getSettingNumSalmInv(callback?){
        return SettingsService._getStorageValue("salmInvitatori", callback, defaultSettings.salmInvitatori);
    }

    static getSettingNumAntMare(callback?){
        return SettingsService._getStorageValue("antMare", callback, defaultSettings.antMare);
    }

    static setSettingShowGlories(value, callback){
        return SettingsService._setValueIfValid("showGlories", value,
            (val) => val || !val,
            callback);
    }

    static setSettingUseLatin(value, callback){
        return SettingsService._setValueIfValid("useLatin", value,
            (val) => val === "true" || val === "false",
            callback);
    }

    static setSettingPrayLliures(value, callback){
        return SettingsService._setValueIfValid("prayLliures", value,
            (val) => val || !val,
            callback);
    }

    static setSettingTextSize(value, callback){
        return SettingsService._setValueIfValid("textSize", value,
            (val) => !isNaN(val) && (parseFloat(val)*10)%10 == 0,
            callback);
    }

    static setSettingDarkMode(value, callback){
        return SettingsService._setValueIfValid("darkMode", value,
            (val) => {
                return findValueInObject(DarkModeOption, val);
            }, callback);
    }

    static setSettingDiocesis(value, callback){
        return SettingsService._setValueIfValid("diocesis", value,
            (val) => {
                return findValueInObject(DioceseName, val);
            }, callback);
    }

    static setSettingLloc(value, callback){
        return SettingsService._setValueIfValid("lloc", value,
            (val) => {
                return findValueInObject(PrayingPlace, val);
            }, callback);
    }

    static setSettingDayStart(value, callback){
        return SettingsService._setValueIfValid("dayStart", value,
            (val) => val == "0" || val == "1" || val == "2" || val == "3",
            callback);
    }

    static setSettingNumSalmInv(value){
        return SettingsService._setValueIfValid("salmInvitatori", value,
            (val) => {
                return findValueInObject(InvitationPsalmOption, val);
            }, undefined);
    }

    static setSettingNumAntMare(value){
        return SettingsService._setValueIfValid("antMare", value,
            (val) => {
                return findValueInObject(VirginAntiphonOption, val);
            }, undefined);
    }

}

function findValueInObject(obj, value){
    let found = false;
    for(let key in obj){
        if(obj[key] == value){
            found = true;
        }
    }
    return found;
}

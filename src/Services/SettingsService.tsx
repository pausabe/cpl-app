import * as StorageService from './Storage/StorageService';

export const diocesis = {
    ANDORRA: "Andorra",
    BARCELONA: "Barcelona",
    GIRONA: "Girona",
    LLEIDA: "Lleida",
    MALLORCA: "Mallorca",
    SANT_FELIU: "Sant Feliu de Llobregat",
    SOLSONA: "Solsona",
    TARRAGONA: "Tarragona",
    TERRASSA: "Terrassa",
    TORTOSA: "Tortosa",
    URGELL: "Urgell",
    VIC: "Vic"
};

export const lloc = {
    DIOCESI: "Diòcesi",
    CIUTAT: "Ciutat",
    CATEDRAL: "Catedral"
};

export const salmInvitatori = {
  SALM94: '94',
  SALM99: '99',
  SALM66: '66',
  SALM23: '23'
}

export const antMare = {
  ANT1: '1',
  ANT2: '2',
  ANT3: '3',
  ANT4: '4',
  ANT5: '5'
}

export const darkModeOptions = {
    ON: 'Activat',
    OFF: 'Desactivat',
    SYSTEM: 'Automàtic'
  }

const defaultSettings = {
    showGlories: "false",
    prayLliures: "false",
    useLatin: "false",
    textSize: "3", //1-5
    diocesis: diocesis.BARCELONA,
    lloc: lloc.DIOCESI,
    dayStart: "0", //Values from 0 to 3 allowed, which means 00:00AM, 01:00AM, 02:00AM and 03:00AM
    salmInvitatori: salmInvitatori.SALM94,
    antMare: antMare.ANT1,
    darkMode: darkModeOptions.SYSTEM
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

    static getSettingUseLatin(callback){
        return SettingsService._getStorageValue("useLatin", callback, defaultSettings.useLatin);
    }

    static getSettingTextSize(callback){
        return SettingsService._getStorageValue("textSize", callback, defaultSettings.textSize);
    }

    static getSettingDarkMode(callback){
        return SettingsService._getStorageValue("darkMode", callback, defaultSettings.darkMode);
    }

    static getSettingDiocesis(callback){
        return SettingsService._getStorageValue("diocesis", callback, defaultSettings.diocesis);
    }

    static getSettingLloc(callback){
        return SettingsService._getStorageValue("lloc", callback, defaultSettings.lloc);
    }

    static getSettingDayStart(callback){
        return SettingsService._getStorageValue("dayStart", callback, defaultSettings.dayStart);
    }

    static getSettingNumSalmInv(callback){
        return SettingsService._getStorageValue("salmInvitatori", callback, defaultSettings.salmInvitatori);
    }

    static getSettingNumAntMare(callback){
        return SettingsService._getStorageValue("antMare", callback, defaultSettings.antMare);
    }

    static setSettingShowGlories(value, callback){
        return SettingsService._setValueIfValid("showGlories", value,
            (val) => val === "true" || val === "false",
            callback);
    }

    static setSettingUseLatin(value, callback){
        return SettingsService._setValueIfValid("useLatin", value,
            (val) => val === "true" || val === "false",
            callback);
    }

    static setSettingPrayLliures(value, callback){
        return SettingsService._setValueIfValid("prayLliures", value,
            (val) => val === "true" || val === "false",
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
                return findValueInObject(darkModeOptions, val);
            }, callback);
    }

    static setSettingDiocesis(value, callback){
        return SettingsService._setValueIfValid("diocesis", value,
            (val) => {
                return findValueInObject(diocesis, val);
            }, callback);
    }

    static setSettingLloc(value, callback){
        return SettingsService._setValueIfValid("lloc", value,
            (val) => {
                return findValueInObject(lloc, val);
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
                return findValueInObject(salmInvitatori, val);
            });
    }

    static setSettingNumAntMare(value){
        return SettingsService._setValueIfValid("antMare", value,
            (val) => {
                return findValueInObject(antMare, val);
            });
    }

}

function findValueInObject(obj, value){
    let found = false;
    for(key in obj){
        if(obj[key] == value){
            found = true;
        }
    }
    return found;
}
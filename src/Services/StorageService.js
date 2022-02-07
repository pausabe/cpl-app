import * as Logger from "../Utils/Logger";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function StoreData(storageKey, value){
    try {
        await AsyncStorage.setItem(storageKey, value.toString());
    }
    catch(e) {
        Logger.LogError(Logger.LogKeys.StorageService, "StoreData", "Error in save:", e);
    }
}

export async function GetData(storageKey, defaultValue) {
    try {
        const value = await AsyncStorage.getItem(storageKey);
        if(!value) {
            return defaultValue;
        }
        return value;
    } catch(e) {
        Logger.LogError(Logger.LogKeys.StorageService, "GetData", "Error in get:", e);
        return defaultValue;
    }
}
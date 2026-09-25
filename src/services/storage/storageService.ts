import * as Logger from '../../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storeData(storageKey, value) {
  try {
    await AsyncStorage.setItem(storageKey, value.toString());
  } catch (e) {
    Logger.logError(Logger.LogKeys.StorageService, 'storeData', e);
  }
}

export async function getData(storageKey, defaultValue?) {
  try {
    const value = await AsyncStorage.getItem(storageKey);
    if (!value) {
      return defaultValue;
    }
    return value;
  } catch (e) {
    Logger.logError(Logger.LogKeys.StorageService, 'getData', e);
    return defaultValue;
  }
}

import * as Logger from '../../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storeData(storageKey: string, value: string | number | boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey, value.toString());
  } catch (e) {
    Logger.logError(Logger.LogKeys.StorageService, 'storeData', e as Error);
  }
}

export async function getData(storageKey: string, defaultValue?: string): Promise<string | undefined> {
  try {
    const value = await AsyncStorage.getItem(storageKey);
    if (!value) {
      return defaultValue;
    }
    return value;
  } catch (e) {
    Logger.logError(Logger.LogKeys.StorageService, 'getData', e as Error);
    return defaultValue;
  }
}

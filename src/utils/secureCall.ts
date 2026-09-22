import * as Logger from './logger';

export default async function secureCall(call, defaultReturn = undefined) {
  let returnValue;
  try {
    returnValue = (await call()) ?? defaultReturn;
  } catch (error) {
    Logger.logError(Logger.LogKeys.SecureCall, 'secureCall', error);
  }
  return returnValue;
}

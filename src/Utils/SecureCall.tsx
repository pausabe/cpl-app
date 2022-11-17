import * as Logger from '../Utils/Logger';

export default async function SecureCall(call, defaultReturn = undefined){
    let returnValue;
    try {
        returnValue = await call() ?? defaultReturn;
    }
    catch (error) {
        Logger.LogError(Logger.LogKeys.SecureCall, "SecureCall", error);
    }
    return returnValue;
}
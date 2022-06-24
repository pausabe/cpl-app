import * as Logger from '../Utils/Logger';

export default async function SecureCall(call, defaultReturn = undefined){
    let returnValue = defaultReturn;
    try {
        returnValue = await call();
    }
    catch (error) {
        Logger.LogError(Logger.LogKeys.SecureCall, "SecureCall", error);
    }
    return returnValue;
}
const messageCharacterLimit = 500;

export const LogKeys = {
    DatebaseUpdaterService: { name: "DatebaseUpdaterService", enabled: true },
};

export function Log(logKey, methodName, message, param){
    if(logKey.enabled){
        log("[" + logKey.name + " - " + methodName + "] " , message, param);
    }
}

export function LogError(logKey, methodName, message, param){
    if(logKey.enabled){
        log("[" + logKey.name + " - " + methodName + "] ERROR: " , message, param);
    }
}

function log(logKey, message, param){
    message = message.substring(0, messageCharacterLimit);
    if(param == undefined){
        console.log(logKey + message);
    }
    else{
        console.log(logKey + message, param);
    }
}
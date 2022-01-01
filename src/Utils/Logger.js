const LogsEnabled = true;
const MessageCharacterLimit = 500;

export const LogKeys = {
    DatabaseUpdaterService: { name: "DatabaseUpdaterService", enabled: true },
    DatabaseAdapter: { name: "DatabaseAdapter", enabled: true },
    HomeScreenController: { name: "HomeScreenController", enabled: true },
    Soul: { name: "Soul", enabled: true },
    GlobalFunctions: { name: "GlobalFunctions", enabled: true },
    Screens: { name: "Screens", enabled: true },
};

export function Log(logKey, methodName, message, param){
    if(logKey.enabled){
        log("[" + logKey.name + " - " + methodName + "] " , message, param);
    }
}

export function LogError(logKey, methodName, message, param){
    log("[" + logKey.name + " - " + methodName + "] ERROR: ", message, param);
}

function log(logKey, message, param){
    try {
        if(LogsEnabled){
            message = message.substring(0, MessageCharacterLimit);
            if(param === undefined){
                console.log(logKey + message);
            }
            else{
                console.log(logKey + message, param);
            }
        }
    }catch (e) {
        console.log("error trying to log");
    }
}
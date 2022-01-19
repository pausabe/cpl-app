const LogsEnabled = true;
const MessageCharacterLimit = 500;
export let SessionLogs = "";

export const LogKeys = {
    DatabaseUpdaterService: { name: "DatabaseUpdaterService", enabled: true },
    DatabaseAdapter: { name: "DatabaseAdapter", enabled: false },
    HomeScreenController: { name: "HomeScreenController", enabled: true },
    Soul: { name: "Soul", enabled: true },
    GlobalFunctions: { name: "GlobalFunctions", enabled: true },
    Screens: { name: "Screens", enabled: true },
};

export function Log(logKey, methodName, message, param, limit){
    if(logKey.enabled){
        log("[" + logKey.name + " - " + methodName + "] " , message, param, limit);
    }
}

export function LogError(logKey, methodName, message, param, limit){
    log("[" + logKey.name + " - " + methodName + "] ERROR: ", message, param, limit);
}

function log(logKey, message, param, limit){
    try {
        if(LogsEnabled){
            message = message.substring(0, limit === undefined? MessageCharacterLimit : limit);
            const time = new Date().getHours().toString() + "." +
                new Date().getMinutes().toString() + "." +
                new Date().getSeconds().toString();
            var finalMessageNoParam = time + " " + logKey + message;
            if(param === undefined){
                SessionLogs += finalMessageNoParam + "\n";
                console.log(finalMessageNoParam);
            }
            else{
                SessionLogs += finalMessageNoParam + param.toString() + "\n";
                console.log(finalMessageNoParam, param);
            }
        }
    }catch (e) {
        console.log("error trying to log", e);
    }
}
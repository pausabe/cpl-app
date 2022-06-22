const LogsEnabled = true;
const MessageCharacterLimit = 500;
export let SessionLogs = "";

export const LogKeys = {
    Debug: { name: "Debug", enabled: true },
    DatabaseManagerService: { name: "DatabaseManagerService", enabled: true },
    DatabaseUpdaterService: { name: "DatabaseUpdaterService", enabled: true },
    DatabaseDataService: { name: "DatabaseDataService", enabled: true },
    HomeScreenController: { name: "HomeScreenController", enabled: true },
    Soul: { name: "Soul", enabled: true },
    GlobalFunctions: { name: "GlobalFunctions", enabled: true },
    Screens: { name: "Screens", enabled: true },
    DataService: { name: "DataService", enabled: true },
    StorageService: { name: "StorageService", enabled: true },
    FileSystemService: { name: "FileSystemService", enabled: true },
    UpdaterService: { name: "UpdaterService", enabled: true },
    SecureCall: { name: "SecureCall", enabled: true }
};

export function Debug(message, param){
    Log(LogKeys.Debug, "", message, param);
}

export function Log(logKey, methodName, message, param = undefined, limit = MessageCharacterLimit){
    if(logKey.enabled){
        log("[" + logKey.name + " - " + methodName + "]", message, param, limit);
    }
}

export function LogError(logKey, methodName, message, param = undefined, limit = MessageCharacterLimit){
    log("[" + logKey.name + " - " + methodName + "] ERROR:", message, param, limit);
}

function log(logKey, message, param, limit){
    try {
        if(LogsEnabled){
            message = message.substring(0, limit);
            const time = new Date().getHours().toString() + "." +
                new Date().getMinutes().toString() + "." +
                new Date().getSeconds().toString() + "." +
                new Date().getMilliseconds().toString();
            let finalMessageNoParam = time + " " + logKey + " " + message + " | ";
            if(param === undefined){
                finalMessageNoParam += "-";
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
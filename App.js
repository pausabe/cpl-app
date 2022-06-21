import {useCustomUpdater} from "./src/Services/UpdaterService";
import NavigationController from "./src/Controllers/NavigationController";
import * as Logger from "./src/Utils/Logger";
import {useState} from "react";

function ConfigureUpdates(setIsNecessaryToUpdate){
    useCustomUpdater({
        beforeDownloadCallback: () => StartingToDownloadTheUpdate(setIsNecessaryToUpdate),
        minMsFromCheckingUpdatesAndReloading: 7000
    });
}

function StartingToDownloadTheUpdate(setIsNecessaryToUpdate) {
    Logger.Log(Logger.LogKeys.HomeScreenController, "StartingToDownloadTheUpdate", "");
    setIsNecessaryToUpdate(true);
}

export default function App() {
    const [isNecessaryToUpdate, setIsNecessaryToUpdate] = useState(false);
    ConfigureUpdates(setIsNecessaryToUpdate);
    return (
        <NavigationController IsNecessaryToUpdate={isNecessaryToUpdate} />
    );
}
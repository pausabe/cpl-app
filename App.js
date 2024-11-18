import {useCustomUpdater} from "./src/Services/UpdaterService";
import NavigationController from "./src/Controllers/NavigationController";
import * as Logger from "./src/Utils/Logger";
import {useState} from "react";
import {SQLiteProvider} from "expo-sqlite";

function ConfigureUpdates(setIsNecessaryToUpdate) {
    useCustomUpdater({
        beforeDownloadCallback: () => StartingToDownloadTheUpdate(setIsNecessaryToUpdate),
        minMsFromCheckingUpdatesAndReloading: 7000
    });
}

function StartingToDownloadTheUpdate(setIsNecessaryToUpdate) {
    Logger.Log(Logger.LogKeys.App, "StartingToDownloadTheUpdate", "");
    setIsNecessaryToUpdate(true);
}

export default function App() {
    const [isNecessaryToUpdate, setIsNecessaryToUpdate] = useState(false);
    ConfigureUpdates(setIsNecessaryToUpdate);
    return (
        <SQLiteProvider databaseName="cpl-app.db" assetSource={{ assetId: require('./src/Assets/db/cpl-app.db') }}>
            <NavigationController IsNecessaryToUpdate={isNecessaryToUpdate}/>
        </SQLiteProvider>
    );
}

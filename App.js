import {useCustomUpdater} from "expo-custom-updater";
import NavigationController from "./src/Controllers/NavigationController";
import * as Logger from "./src/Utils/Logger";

function ConfigureUpdates(){
    useCustomUpdater({
        beforeCheckCallback: () => SetShowSpinner(true),
        beforeDownloadCallback: () => SetShowUpdateIsDownloading(),
        afterCheckCallback: () => SetShowSpinner(false),
        showDebugInConsole: false
    });
}

function SetShowSpinner(spinnerVisibility) {
    Logger.Log(Logger.LogKeys.HomeScreenController, "SetShowSpinner", "spinnerVisibility: ", spinnerVisibility);
}

function SetShowUpdateIsDownloading() {
    Logger.Log(Logger.LogKeys.HomeScreenController, "SetShowUpdateIsDownloading", "");
}

export default function App() {
    ConfigureUpdates();
    return (
        <NavigationController />
    );
}
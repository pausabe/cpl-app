import { useRef, useEffect } from 'react'
import { AppState } from 'react-native'
import * as Updates from 'expo-updates'
import * as Logger from "../Utils/Logger";

const updater = {
    logs: [],
    lastTimeCheck: 0,
    showDebugInConsole: false,
    default_min_refresh_interval: 300
}

const getUnixEpoch = () => Math.floor(Date.now() / 1000)

export const doUpdateIfAvailable = async (beforeDownloadCallback, throwUpdateErrors, force, minMsFromCheckingUpdatesAndReloading) => {
    updater.lastTimeCheck = getUnixEpoch()

    if (__DEV__) {
        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Unable to update or check for updates in DEV");
        return false
    }

    try {
        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Checking for updates...");
        const { isAvailable } = await Updates.checkForUpdateAsync()

        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', `Update available? ${isAvailable}`);
        if (!isAvailable && !force) return false

        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Fetching Update in background");
        // Descarga la actualización en background sin bloquear ni reiniciar
        await Updates.fetchUpdateAsync()
        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Update fetched successfully. Will be applied on next app restart.");
        
        return true

    } catch (e) {
        Logger.LogError(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', e);
        if (throwUpdateErrors) throw e
        return false
    }
}

export const useCustomUpdater = ({
                                     updateOnStartup = true,
                                     minRefreshSeconds = updater.default_min_refresh_interval,
                                     showDebugInConsole = false,
                                     beforeCheckCallback = null,
                                     afterCheckCallback = null,
                                     throwUpdateErrors = false,
                                 } = {}) => {
    const appState = useRef(AppState.currentState)

    updater.showDebugInConsole = showDebugInConsole

    useEffect(() => {
        updateOnStartup && doUpdateIfAvailable(null, throwUpdateErrors, false, 0)

        const subscription = AppState.addEventListener('change', _handleAppStateChange)
        return () => {
            subscription.remove()
        }
    }, [])

    const _handleAppStateChange = async (nextAppState) => {
        const isBackToApp = appState.current.match(/inactive|background/) && nextAppState === 'active'
        const isTimeToCheck = (getUnixEpoch() - updater.lastTimeCheck) > minRefreshSeconds

        appState.current = nextAppState
        Logger.Log(Logger.LogKeys.UpdaterService, 'appStateChangeHandler', `AppState: ${appState.current}, NeedToCheckForUpdate? ${isBackToApp && isTimeToCheck}`);

        if (!isTimeToCheck || !isBackToApp) {
            isBackToApp && !isTimeToCheck && Logger.Log(Logger.LogKeys.UpdaterService, 'appStateChangeHandler', "Skip check, within refresh time");
            return false
        }

        beforeCheckCallback && beforeCheckCallback()
        await doUpdateIfAvailable(null, throwUpdateErrors, false, 0)
        afterCheckCallback && afterCheckCallback()
    }
}

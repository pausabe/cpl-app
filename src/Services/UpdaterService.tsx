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

export const getUpdateLogs = () => updater.logs

export const doUpdateIfAvailable = async (beforeDownloadCallback, throwUpdateErrors, force, minMsFromCheckingUpdatesAndReloading) => {
    updater.lastTimeCheck = getUnixEpoch()

    if (__DEV__) {
        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Unable to update or check for updates in DEV");
        return false
    }

    try {
        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Checking for updates...");
        let checkingTime = new Date();
        const { isAvailable } = await Updates.checkForUpdateAsync()

        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', `Update available? ${isAvailable}`);
        if (!isAvailable && !force) return false

        Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Fetching Update");
        beforeDownloadCallback && beforeDownloadCallback()
        await Updates.fetchUpdateAsync()

        const msFromChecking = new Date().getMilliseconds() - checkingTime.getMilliseconds();
        setTimeout(async () => {
            Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "Update fetched, reloading...");
            await Updates.reloadAsync()
        },msFromChecking < minMsFromCheckingUpdatesAndReloading? (minMsFromCheckingUpdatesAndReloading - msFromChecking) : 0);

    } catch (e) {
        Logger.LogError(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', "", e);
        if (throwUpdateErrors) throw e
        return false
    }
}

export const useCustomUpdater = ({
                                     updateOnStartup = true,
                                     minRefreshSeconds = updater.default_min_refresh_interval,
                                     showDebugInConsole = false,
                                     beforeCheckCallback = null,
                                     beforeDownloadCallback = null,
                                     afterCheckCallback = null,
                                     throwUpdateErrors = false,
                                     minMsFromCheckingUpdatesAndReloading = 0,
                                 } = {}) => {
    const appState = useRef(AppState.currentState)

    updater.showDebugInConsole = showDebugInConsole

    useEffect(() => {
        updateOnStartup && doUpdateIfAvailable(beforeDownloadCallback, throwUpdateErrors, false, minMsFromCheckingUpdatesAndReloading)

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
        await doUpdateIfAvailable(beforeDownloadCallback, throwUpdateErrors, false, minMsFromCheckingUpdatesAndReloading)
        afterCheckCallback && afterCheckCallback()
    }
}

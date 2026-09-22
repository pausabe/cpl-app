import { useEffect } from 'react';
import { AppState } from 'react-native';
import * as Updates from 'expo-updates';
import * as Logger from '../Utils/Logger';
import GLOBAL from '../Utils/GlobalKeys';

// Coming back to the app, it only checks again if the last check is older than this
const MinSecondsBetweenChecks = 300;

// What the user sees while the app restarts with the update, instead of a blank screen
const ReloadScreenOptions = {
  backgroundColor: GLOBAL.barColor,
  spinner: { enabled: true, color: GLOBAL.itemsBarColor },
  fade: true,
};

const updater = {
  lastTimeCheck: 0,
  appState: AppState.currentState,
  // Day the app was last in the foreground: coming back on another day applies the downloaded update
  lastActiveDay: new Date().toDateString(),
  // Update downloaded in the background, waiting for the app to restart
  downloadedUpdateId: undefined as string | undefined,
};

const getUnixEpoch = () => Math.floor(Date.now() / 1000);

// Checks for an update and downloads it without stopping the user. It is applied the next time the
// app starts, or when the user comes back to it on another day.
export const doUpdateIfAvailable = async () => {
  updater.lastTimeCheck = getUnixEpoch();

  if (__DEV__) {
    Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', 'Unable to update or check for updates in DEV');
    return false;
  }

  try {
    Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', 'Checking for updates...');
    const checkResult = await Updates.checkForUpdateAsync();

    Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', `Update available? ${checkResult.isAvailable}`);
    if (!checkResult.isAvailable) return false;

    // The server compares with the running update, not with the downloaded one: until the app
    // restarts, it keeps offering the update that is already here
    if (checkResult.manifest?.id && checkResult.manifest.id === updater.downloadedUpdateId) {
      Logger.Log(
        Logger.LogKeys.UpdaterService,
        'doUpdateIfAvailable',
        'Update already downloaded, waiting for the app to restart',
      );
      return false;
    }

    Logger.Log(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', 'Fetching Update in background');
    const fetchResult = await Updates.fetchUpdateAsync();
    if (!fetchResult.isNew) return false;

    updater.downloadedUpdateId = fetchResult.manifest.id;
    Logger.Log(
      Logger.LogKeys.UpdaterService,
      'doUpdateIfAvailable',
      `Update ${updater.downloadedUpdateId} fetched successfully. Will be applied on next app restart.`,
    );
    return true;
  } catch (e) {
    Logger.LogError(Logger.LogKeys.UpdaterService, 'doUpdateIfAvailable', e);
    return false;
  }
};

// Restarts the app with the most recently downloaded update
const restartWithDownloadedUpdate = async () => {
  try {
    Logger.Log(
      Logger.LogKeys.UpdaterService,
      'restartWithDownloadedUpdate',
      'Restarting to apply the downloaded update',
    );
    await Updates.reloadAsync({ reloadScreenOptions: ReloadScreenOptions });
    return true;
  } catch (e) {
    Logger.LogError(Logger.LogKeys.UpdaterService, 'restartWithDownloadedUpdate', e);
    return false;
  }
};

export const handleAppStateChange = async (nextAppState) => {
  const isBackToApp = /inactive|background/.test(updater.appState) && nextAppState === 'active';
  const isAnotherDay = new Date().toDateString() !== updater.lastActiveDay;

  updater.appState = nextAppState;
  updater.lastActiveDay = new Date().toDateString();
  if (!isBackToApp) return;

  // On another day the app goes back to the day's Home anyway, so restarting it now doesn't get in the way
  if (isAnotherDay && updater.downloadedUpdateId) {
    Logger.Log(Logger.LogKeys.UpdaterService, 'appStateChangeHandler', 'Back on another day with an update downloaded');
    if (await restartWithDownloadedUpdate()) return;
  }

  const isTimeToCheck = getUnixEpoch() - updater.lastTimeCheck > MinSecondsBetweenChecks;
  Logger.Log(
    Logger.LogKeys.UpdaterService,
    'appStateChangeHandler',
    `AppState: ${nextAppState}, NeedToCheckForUpdate? ${isTimeToCheck}`,
  );
  if (!isTimeToCheck) return;

  await doUpdateIfAvailable();
};

export const useCustomUpdater = () => {
  useEffect(() => {
    doUpdateIfAvailable();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);
};

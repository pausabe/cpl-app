import { useEffect, useState } from 'react';
import {
  BackHandler,
  AppState,
  Platform,
  Appearance
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import GlobalKeys from '../Utils/GlobalKeys';
import * as Logger from '../Utils/Logger';
import SettingsService from '../Services/Settings/SettingsService';
import {
  ReloadAllData,
  LastRefreshDate,
  CurrentLiturgyDayInformation,
  CurrentSettings,
  CurrentCelebrationInformation
} from '../Services/Data/DataService';
import * as StorageService from '../Services/Storage/StorageService';
import StorageKeys from "../Services/Storage/StorageKeys";
import HomeViewState from '../States/HomeViewState';
import { StringManagement } from "../Utils/StringManagement";
import { DateManagement } from "../Utils/DateManagement";
import { useAssets } from "expo-asset";
import HomeView from '../Views/HomeView';

let LastDatePickerIOSSelected: Date;
let CurrentState: HomeViewState;
let FirstLoad = true;
let SplashScreenHidden = false;

export default function HomeViewController(props) {
  try {
    const [state, setState] = useState(new HomeViewState());
    CurrentState = state;

    // I'm forced to use hooks to obtain the database because using Asset.loadAsync doesn't work well in EAS build
    const [databaseAssets, databaseAssetsError] = useAssets([require('../Assets/db/cpl-app.db')]);

    useEffect(() => InitialEffect(props, setState, databaseAssets, databaseAssetsError), [databaseAssets]);

    return HomeView(props, CurrentState, setState);
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "HomeViewController", error);
    return null;
  }
}

function InitialEffect(props, setState, databaseAssets, databaseAssetsError) {
  if (!__DEV__) {
    SplashScreen.preventAutoHideAsync();
  }

  props.navigation.setParams({
    calPres: () => HandleCalendarPressed(setState),
    Refresh_Date: () => ReloadAllDataAndRefreshView(CurrentLiturgyDayInformation.Today.Date, setState),
  });

   // TODO: keys
  let appStateSubscription = AppState.addEventListener('change', (status) => AppStateChangedHandler(status, props.navigation, setState));
  let backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', AndroidBackPressedHandler.bind(setState));
  let appearanceSubscription = Appearance.addChangeListener(AppearanceChangedHandler);

  if (databaseAssets && databaseAssets[0] && !databaseAssetsError) {
    SetViewWithTheInitialDataLoaded(setState, databaseAssets[0]);
  }

  return () => {
    backHandlerSubscription.remove();
    appStateSubscription.remove();
    appearanceSubscription.remove();
  }
}

function HideSplashIfItsTime() {
  let dataLoaded = CurrentState !== undefined;
  let thereWereSomeErrorLoadingTheData =
    CurrentState !== undefined &&
    (CurrentState.ObtainDataErrorMessage !== undefined &&
      CurrentState.ObtainDataErrorMessage !== "")
  if (!SplashScreenHidden &&
    (dataLoaded || thereWereSomeErrorLoadingTheData)) {

    // Letting some extra time to finish rendering everything
    setTimeout(async () => {
      SplashScreenHidden = true;
      await SplashScreen.hideAsync();
      Logger.Log(Logger.LogKeys.HomeScreenController, "HideSplashIfItsTime", "Splash hidden");
    }, IsLatePrayer() && Platform.OS === "ios" ? 0 : 500) // When IsLatePrayer there is some kind of conflict with the Modal, the Splash, the Timeout and the iOS... So, in that case, 0 timeout
  }
}

async function SetViewWithTheInitialDataLoaded(setState, databaseAsset) {
  if (FirstLoad) {
    FirstLoad = false;
    await ReloadAllDataAndRefreshView(new Date(/*2019, 9, 23*/), setState, true, databaseAsset);
    HideSplashIfItsTime();
  }
}  

async function ChangeDate(date, setState) {
  if (date === null || date === undefined) {
    date = CurrentLiturgyDayInformation.Today.Date;
  }
  await ReloadAllDataAndRefreshView(date, setState);
}

async function ReloadAllDataAndRefreshView(date, setState, checkLatePopup = false, databaseAsset = undefined) {
  try {
    await ReloadAllData(date, databaseAsset);
    setState(GetInitialState(checkLatePopup));
  }
  catch (error) {
    SetError(error, setState);
  }
}

function HandleCalendarPressed(setState) {
  LastDatePickerIOSSelected = undefined;
  setState(CurrentState.UpdateDateTimePickerVisibility(true));
}

function GetInitialState(checkLatePopup) {
  let initialState = new HomeViewState();
  try {
    if (CurrentLiturgyDayInformation !== undefined && CurrentSettings !== undefined) {
      initialState = new HomeViewState(
        checkLatePopup ? IsLatePrayer() : false,
        false,
        false,
        "");
    }
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "GetInitialState", error);
  }
  return initialState;
}

function SetError(error, setState) {
  Logger.LogError(Logger.LogKeys.HomeScreenController, "HandleGetDataError", error);
  // TODO: keys
  const messageToShow = "Ha sorgit un error inesperat i no és possible obrir l'aplicació de manera normal.\nProva de desinstal·lar l'aplicació i a tornar-la a instal·lar i si el problema persisteix, posa't en contacte amb cpl@cpl.es\nDisculpa les molèsties.";
  setState(CurrentState.UpdateObtainDataErrorMessage(messageToShow));
}

async function DatePickerChangedHandler(event, date, setState) {
  if (Platform.OS === "ios") {
    LastDatePickerIOSSelected = date;
  }
  else {
    setState(CurrentState.UpdateDateTimePickerVisibility(false));
    if (date !== CurrentLiturgyDayInformation.Today.Date) {
      await ChangeDate(date, setState);
    }
  }
}

async function DatePickerIOSAcceptedHandler(setState) {
  if (LastDatePickerIOSSelected !== CurrentLiturgyDayInformation.Today.Date) {
    await ChangeDate(LastDatePickerIOSSelected, setState)
  }
}

function DatePickerIOSCanceledHandler(setState) {
  setState(CurrentState.UpdateDateTimePickerVisibility(false));
}

async function DatePickerIOSTodaySelectedHandler(setState) {
  const now = new Date();
  if (now !== CurrentLiturgyDayInformation.Today.Date) {
    await ChangeDate(now, setState)
  }
}

function OnSantPressedHandler(setState) {
  if (StringManagement.HasLiturgyContent(CurrentCelebrationInformation.Title)) {
    setState(CurrentState.UpdateCelebrationVisibility(!CurrentState.CelebrationIsVisible));
  }
}

async function OnYesterdayPressedHandler(yesterday, setState) {
  await ChangeDate(yesterday, setState);
}

function OnTodayPressedHandler(setState) {
  setState(CurrentState.UpdateLatePopupVisibility(false));
}

async function OnSwitchFreePrayerPressedHandler(optionalPrayerEnabled, setState) {
  if (optionalPrayerEnabled) {
    const stringDate = DateManagement.GetDateKeyToBeStored(CurrentLiturgyDayInformation.Today.Date);
    await StorageService.StoreData(StorageKeys.OptionalFestivity, stringDate);
  }
  else {
    await StorageService.StoreData(StorageKeys.OptionalFestivity, 'none');
  }
  CurrentSettings.OptionalFestivityEnabled = optionalPrayerEnabled;
  await ChangeDate(CurrentLiturgyDayInformation.Today.Date, setState);
}

// TODO: move to a "Base" or "Main" controller?

function IsLatePrayer() {
  const hour = new Date().getHours();
  return hour >= 0 && hour < GlobalKeys.late_prayer;
}

async function AppStateChangedHandler(nextAppState, navigation?, setState?) {
  if (nextAppState === 'active') {  // TODO: keys
    const now = new Date();

    if (!DateManagement.DatesAreTheEqual(now, LastRefreshDate)) {
      navigation.popToTop();
      navigation.navigate('Home'); // TODO: keys

      await ChangeDate(now, setState);
    }
  }
}

async function AppearanceChangedHandler(param: { colorScheme: any; }) {
  try {
    Logger.Log(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", param.colorScheme);

    // param.colorScheme is not always getting the correct color scheme when reopening the app on ios. So I get it from the getColorScheme function
    let colorScheme = Appearance.getColorScheme();

    await SettingsService.getSettingDarkMode((r: string) => {
      if (r === 'Automàtic') { // TODO: keys
        CurrentSettings.DarkModeEnabled = colorScheme === 'dark'; // TODO: keys
      }
    });
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", error);
  }
}

function AndroidBackPressedHandler(setState) {
  if (CurrentState.CelebrationIsVisible && CurrentState.GlobalDataToShow.celebracio.text !== '-') {
    setState(CurrentState.UpdateCelebrationVisibility(false))
  }
}
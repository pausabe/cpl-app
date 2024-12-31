import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  SafeAreaView,
  AppState,
  Platform,
  Modal,
  StyleSheet,
  Appearance
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from '../Views/HomeScreen';
import GlobalKeys from '../Utils/GlobalKeys';
import GlobalViewFunctions from '../Utils/GlobalViewFunctions';
import * as Logger from '../Utils/Logger';
import SettingsService from '../Services/SettingsService';
import {
  ReloadAllData,
  LastRefreshDate,
  CurrentLiturgyDayInformation,
  CurrentSettings,
  CurrentCelebrationInformation, CurrentDatabaseInformation
} from '../Services/DataService';
import * as StorageService from '../Services/Storage/StorageService';
import StorageKeys from "../Services/Storage/StorageKeys";
import HomeScreenState from './HomeScreenState';
import {StringManagement} from "../Utils/StringManagement";
import {DateManagement} from "../Utils/DateManagement";
import {useAssets} from "expo-asset";

let LastDatePickerIOSSelected;
let CurrentState;
let FirstLoad = true;
let SplashScreenHidden = false;
SplashScreen.preventAutoHideAsync();

export default function HomeScreenController(props) {
  try {
    const [state, setState] = useState(new HomeScreenState());
    const [databaseAssets, databaseAssetsError] = useAssets([require('../Assets/db/cpl-app.db')]);
    CurrentState = state;

    useEffect(() => {
      async function initialize() {
        try {
          if (!databaseAssetsError) {
            await InitialEffect(props, setState, databaseAssets);
          }
        } catch (error) {
          console.error('Error loading database:', error);
        }
      }

      initialize();
    }, [databaseAssets]);

    return GetView(props, CurrentState, setState);
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "HomeScreenController", error);
    return HomeScreenViewWithError("Error carregant les dades");
  }
}

function GetView(props, CurrentState, setState){
  const thereIsSomeError = StringManagement.HasLiturgyContent(CurrentState.ObtainDataErrorMessage);
  if(!CurrentState.Initialized || thereIsSomeError){
    return null;
  }
  else{
    return (
        <SafeAreaView style={{flex: 1}}>
          { thereIsSomeError?
              HomeScreenViewWithError(CurrentState.ObtainDataErrorMessage)
              :
              HomeScreenView(props.navigation, setState)}
        </SafeAreaView>
    );
  }
}

async function InitialEffect(props, setState, databaseAssets) {
  props.navigation.setParams({
    calPres: () => HandleCalendarPressed(setState),
    Refresh_Date: () => ReloadAllDataAndRefreshView(CurrentLiturgyDayInformation.Today.Date, setState),
  });

  let appStateSubscription = AppState.addEventListener('change', (status) => HandleAppStateChange(status, props.navigation, setState));
  let backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', HandleAndroidBack.bind(setState));
  let appearanceSubscription = Appearance.addChangeListener(AppearanceHasChanged);

  if(databaseAssets && databaseAssets[0]){
    SetViewWithTheInitialDataLoaded(setState, databaseAssets[0]);
  }

  return () => {
    backHandlerSubscription.remove();
    appStateSubscription.remove();
    appearanceSubscription.remove();
  }
}

function HideSplashIfItsTime(){
  let dataLoaded = CurrentState !== undefined;
  let thereWereSomeErrorLoadingTheData =
      CurrentState !== undefined &&
      (CurrentState.ObtainDataErrorMessage !== undefined &&
          CurrentState.ObtainDataErrorMessage !== "")
  if(!SplashScreenHidden &&
      (dataLoaded || thereWereSomeErrorLoadingTheData)){
    // Letting some extra time to finish rendering everything
    setTimeout(async () => {
      SplashScreenHidden = true;
      await SplashScreen.hideAsync();
      Logger.Log(Logger.LogKeys.HomeScreenController, "HideSplashIfItsTime", "Splash hidden");
    }, IsLatePrayer() && Platform.OS === "ios"? 0 : 500) // When IsLatePrayer there is some kind of conflict with the Modal, the Splash, the Timeout and the iOS... So, in that case, 0 timeout
  }
}

async function SetViewWithTheInitialDataLoaded(setState, databaseAsset){
  if (FirstLoad){
    FirstLoad = false;
    await ReloadAllDataAndRefreshView(new Date(/*2019, 9, 23*/), setState, true, databaseAsset);
    HideSplashIfItsTime();
  }
}

async function HandleAppStateChange(nextAppState, navigation?, setState?){
  // Check if the state is changing to active
  if(nextAppState === 'active'){

    // Get today
    const now = new Date();

    // Refresh the date if today is different from the last refresh date
    if(!DateManagement.DatesAreTheEqual(now, LastRefreshDate)){

      // Navigate to Home Screen
      navigation.popToTop();
      navigation.navigate('Home');

      // Refresh data (also will check late)
      await ChangeDate(now, setState);
    }
  }
}

async function AppearanceHasChanged(param) {
  try {
    Logger.Log(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", param.colorScheme);
    await CheckSystemDarkMode(param.colorScheme);
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", error);
  }
}

async function CheckSystemDarkMode(colorScheme) {
  try {
    // It's not always getting the correct color scheme when reopening the app on ios. So I get it from the getColorScheme function
    colorScheme = Appearance.getColorScheme();

    await SettingsService.getSettingDarkMode((r) => {
      if (r === 'Automàtic') {
        CurrentSettings.DarkModeEnabled = colorScheme === 'dark';
      }
    });
  } catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "CheckSystemDarkMode", error);
  }
}

function HandleAndroidBack(setState) {
  if (
      CurrentState.CelebrationIsVisible &&
      CurrentState.GlobalDataToShow &&
      CurrentState.GlobalDataToShow.celebracio &&
      CurrentState.GlobalDataToShow.celebracio.text !== '-'
  ) {
    setState(CurrentState.UpdateCelebrationVisibility(false));
  }
}


async function ChangeDate(date, setState) {
  if (date === null || date === undefined){
    date = CurrentLiturgyDayInformation.Today.Date;
  }
  await ReloadAllDataAndRefreshView(date, setState);
}

async function ReloadAllDataAndRefreshView(date, setState, checkLatePopup = false, databaseAsset = undefined){
  try {
    await ReloadAllData(date, databaseAsset);
    setState(GetInitialState(checkLatePopup));
  }
  catch(error){
    HandleGetDataError(error, setState);
  }
}

function HandleCalendarPressed(setState) {
  LastDatePickerIOSSelected = undefined;
  setState(CurrentState.UpdateDateTimePickerVisibility(true));
}

function GetInitialState(checkLatePopup){
  let initialState = new HomeScreenState();
  try {
    if(CurrentLiturgyDayInformation !== undefined && CurrentSettings !== undefined) {
      initialState = new HomeScreenState(
          checkLatePopup? IsLatePrayer() : false,
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

function IsLatePrayer() {
  const hour = new Date().getHours();
  return hour >= 0 && hour < GlobalKeys.late_prayer;
}

async function DatePickerChange(event, date, setState) {
  if (Platform.OS === "ios") {
    LastDatePickerIOSSelected = date;
  }
  else {
    setState(CurrentState.UpdateDateTimePickerVisibility(false));
    if (date !== CurrentLiturgyDayInformation.Today.Date) {
      await ShowDate(date, setState);
    }
  }
}

async function HandleDatePickerIOSAccept(setState) {
  if (LastDatePickerIOSSelected !== CurrentLiturgyDayInformation.Today.Date) {
    await ShowDate(LastDatePickerIOSSelected, setState)
  }
}

function HandleDatePickerIOSCancel(setState) {
  setState(CurrentState.UpdateDateTimePickerVisibility(false));
}

async function HandleDatePickerIOSToday(setState) {
  const now = new Date();
  if (now !== CurrentLiturgyDayInformation.Today.Date) {
    await ShowDate(now, setState)
  }
}

async function ShowDate(date, setState) {
  Logger.Log(Logger.LogKeys.HomeScreenController, "ShowDate", "date: ", date);
  await ChangeDate(date, setState);
}

function HandleOnSantPressedCallback(setState) {
  if (StringManagement.HasLiturgyContent(CurrentCelebrationInformation.Title)) {
    setState(CurrentState.UpdateCelebrationVisibility(!CurrentState.CelebrationIsVisible));
  }
}

async function HandleOnYesterdayPressed(yesterday, setState) {
  await ShowDate(yesterday, setState);
}

function HandleOnTodayPressed(setState) {
  setState(CurrentState.UpdateLatePopupVisibility(false));
}

async function HandleOnSwitchFreePrayerPressed(optionalPrayerEnabled, setState) {
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

function HandleGetDataError(error, setState){
  Logger.LogError(Logger.LogKeys.HomeScreenController, "HandleGetDataError", error);
  const messageToShow = "Ha sorgit un error inesperat i no és possible obrir l'aplicació de manera normal.\nProva de desinstal·lar l'aplicació i a tornar-la a instal·lar i si el problema persisteix, posa't en contacte amb cpl@cpl.es\nDisculpa les molèsties.";
  setState(CurrentState.UpdateObtainDataErrorMessage(messageToShow));
}

function HomeScreenViewWithError(currentObtainDataErrorMessage){
  return(
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }}>
        <Text style={{ fontSize: 17, color: 'black', textAlign: 'center' }}>{currentObtainDataErrorMessage}</Text>
      </View>
  );
}

function HomeScreenView(navigation, setState){
  if(CurrentLiturgyDayInformation.Today.Date === undefined){
    return null;
  }
  const yesterday = DateManagement.GetYesterday(CurrentLiturgyDayInformation.Today.Date);
  const today = CurrentLiturgyDayInformation.Today.Date;
  const minDatePicker = CurrentDatabaseInformation.MinimumSelectableDate;
  const maxDatePicker = CurrentDatabaseInformation.MaximumSelectableDate;
  return (
      <View style={{ flex: 1 }}>

        <HomeScreen
            ViewData={CurrentState.GlobalDataToShow}
            santPressed={CurrentState.CelebrationIsVisible}
            santCB={() => HandleOnSantPressedCallback(setState)}
            lliureCB={(freePrayerEnabled) => HandleOnSwitchFreePrayerPressed(freePrayerEnabled, setState)}
            navigation={navigation} />
        <View>
          { Platform.OS === "ios" ?
              <Modal
                  animationType="fade" // slide, fade, none
                  transparent={true}
                  visible={CurrentState.DateTimePickerIsVisible === true}>
                <TouchableOpacity activeOpacity={1} style={styles.DatePickerWholeModal} onPress={() => HandleDatePickerIOSCancel(setState)}>
                  <TouchableOpacity activeOpacity={1} style={{margin: 10, marginHorizontal: 30, backgroundColor: Appearance.getColorScheme() === 'dark'? 'black' : 'white', borderRadius: 20, padding: 10, paddingBottom: 20, shadowColor: '#000', shadowOffset: {width: 0,height: 2,}}}>
                    <View style={{ marginHorizontal: 10, marginBottom: 5 }}>
                      <DateTimePicker
                          mode="date"
                          display="inline" //spinner, compact, inline
                          onChange={DatePickerChange.bind(setState)}
                          value={today}
                          minimumDate={minDatePicker}
                          maximumDate={maxDatePicker}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={() => HandleDatePickerIOSCancel(setState)}>
                        <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Cancel·la'}</Text>
                      </TouchableOpacity >
                      <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={() => HandleDatePickerIOSToday(setState)}>
                        <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Avui'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={() => HandleDatePickerIOSAccept(setState)}>
                        <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Canvia'}</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Modal>
              :
              <View>
                {CurrentState.DateTimePickerIsVisible === true &&
                    <DateTimePicker
                        mode={"date"}
                        display={"default"} // default, spinner, calendar
                        onChange={(event, date) => DatePickerChange(event, date, setState)}
                        value={today}
                        minimumDate={minDatePicker}
                        maximumDate={maxDatePicker}
                    />
                }
              </View>
          }

        </View>

        <Modal animationType={"fade"} // slide, fade, none
               transparent={true}
               visible={CurrentState.LatePopupIsVisible === true} >
          <TouchableOpacity activeOpacity={1} style={styles.LatePrayerWholeModal} onPress={() => HandleOnTodayPressed(setState)}>
            <TouchableOpacity activeOpacity={1} style={styles.LatePrayerInsideModal}>
              <View style={{ paddingTop: 15}}>
                <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Ja estem a dia " + today.getDate() + " de " + GlobalViewFunctions.getMonthText(today.getMonth()) + "."}</Text>
                <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Vols la litúrgia d’ahir dia " + yesterday.getDate() + " de " + GlobalViewFunctions.getMonthText(yesterday.getMonth()) + "?"}</Text>
              </View>

              <View style={{ paddingTop: 15, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity onPress={() => HandleOnYesterdayPressed(yesterday, setState)} style={{ paddingRight: 20}}>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{"Sí, la d'ahir dia"}</Text>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{yesterday.getDate() + "/" + (yesterday.getMonth() + 1) + "/" + yesterday.getFullYear()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => HandleOnTodayPressed(setState)}>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, textAlign: 'center', }}>{"No, la d'avui dia"}</Text>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, textAlign: 'center', }}>{today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear()}</Text>
                </TouchableOpacity>
              </View>

            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        <StatusBar style="light" />

      </View>
  );
}

const styles = StyleSheet.create({
  DatePickerWholeModal: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  LatePrayerWholeModal: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  LatePrayerInsideModal: {
    margin: 10,
    marginHorizontal: 30,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    }
  }
});

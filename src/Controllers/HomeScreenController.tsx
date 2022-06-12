import React, {useEffect, useRef, useState} from 'react';
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
import GLOBALS from '../Globals/GlobalKeys';
import GF from '../Globals/GlobalFunctions';
import { ReloadAllData } from '../Services/DataService.js';
import * as Logger from '../Utils/Logger';
import SettingsManager from './Classes/SettingsManager';
import { GlobalData, LAST_REFRESH } from '../Services/DataService';
import * as StorageService from '../Services/StorageService';
import StorageKeys from "../Services/StorageKeys";
import HomeScreenState, {CelebrationData, GlobalDataToShowClass, PlaceData} from './HomeScreenState';

let LastDatePickerIOSSelected;
let CurrentState;
let FirstLoad = true;
let SplashScreenHidden = false;

export default function HomeScreenController(props) {
  try {
    const [state, setState] = useState();
    CurrentState = state;
    HideSplash();
    useEffect(() => InitialEffect(props, setState), []);
    SetViewWithTheInitialDataLoaded(setState);
    return GetView(props, CurrentState, setState);
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "HomeScreenController", "", error);
    return null;
  }
}

function GetView(props, CurrentState, setState){
  if(CurrentState === undefined){
    return null;
  }
  else{
    return (
        <SafeAreaView style={{flex: 1}}>
          {CurrentState.ObtainDataErrorMessage === undefined || CurrentState.ObtainDataErrorMessage === "" ?
              HomeScreenView(props.navigation, setState)
              :
              HomeScreenViewWithError(CurrentState.ObtainDataErrorMessage)}
        </SafeAreaView>
    );
  }
}

function InitialEffect(props, setState){
  if (!__DEV__) {
    SplashScreen.preventAutoHideAsync();
  }

  props.navigation.setParams({
    calPres: () => HandleCalendarPressed(setState),
    Refresh_Date: () => HandleCalendarPressed(setState),
  });

  let appStateSubscription = AppState.addEventListener('change', (status) => HandleAppStateChange(status, props.navigation, setState));
  let backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', HandleAndroidBack.bind(setState));
  let appearanceSubscription = Appearance.addChangeListener(AppearanceHasChanged);

  return () => {
    backHandlerSubscription.remove();
    appStateSubscription.remove();
    appearanceSubscription.remove();
  }
}

function HideSplash(){
  let dataLoaded = CurrentState !== undefined;
  let thereWereSomeErrorLoadingTheData =
      CurrentState !== undefined &&
      (CurrentState.ObtainDataErrorMessage !== undefined &&
          CurrentState.ObtainDataErrorMessage !== "")
  if(!SplashScreenHidden &&
      (dataLoaded || thereWereSomeErrorLoadingTheData)){
    SplashScreenHidden = true;
    SplashScreen.hideAsync()
  }
}

function SetViewWithTheInitialDataLoaded(setState){
  if(FirstLoad){
    FirstLoad = false;
    ReloadAllDataAndRefreshView(new Date(/*2019, 9, 23*/), setState);
  }
}

function HandleAppStateChange(nextAppState, navigation?, setState?){
  // Check if the state is changing to active
  if(nextAppState === 'active'){

    // Get today
    const now = new Date();

    // Refresh the date if today is different from the last refresh date
    if(now.getDate() !== LAST_REFRESH.getDate() || now.getMonth() !== LAST_REFRESH.getMonth() || now.getFullYear() !== LAST_REFRESH.getFullYear()){

      // Navigate to Home Screen
      navigation.popToTop()
      navigation.navigate('Home')

      // Refresh data (also will check late)
      console.log("refreshing after app state change")
      ChangeDate(now, setState);
    }
  }
}

async function AppearanceHasChanged(param) {
  try {
    Logger.Log(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", param.colorScheme);
    await CheckSystemDarkMode(param.colorScheme);
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", "", error);
  }
}

async function CheckSystemDarkMode(colorScheme) {
  try {
    // It's not always getting the correct color scheme when reopening the app on ios. So I get it from the getColorSheme function
    colorScheme = Appearance.getColorScheme();

    await SettingsManager.getSettingDarkMode((r) => {
      if (r === 'Automàtic') {
        GlobalData.darkModeEnabled = colorScheme === 'dark';
      }
    });
  } catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "CheckSystemDarkMode", "", error);
  }
}

function HandleAndroidBack(setState) {
  if (CurrentState.CelebrationIsVisible && CurrentState.GlobalDataToShow.celebracio.text !== '-') {
    setState(CurrentState.UpdateCelebrationVisibility(false))
  }
}

function ChangeDate(date, setState) {
  if (date === null || date === undefined){
    date = GlobalData.date;
  }
  ReloadAllDataAndRefreshView(date, setState);
}

function ReloadAllDataAndRefreshView(date, setState){
  ReloadAllData(date)
      .then(() => {
        console.log("refresh because the first load of the data")
        setState(GetInitialState());
      })
      .catch((errorMessage) => HandleGetDataError(errorMessage, setState))
}

function HandleCalendarPressed(setState) {
  LastDatePickerIOSSelected = undefined;
  setState(CurrentState.UpdateDateTimePickerVisibility(true));
}

function GetInitialState(){
  let initialState = new HomeScreenState();
  try {
    if(GlobalData !== undefined && GlobalData !== {}) {
      initialState = new HomeScreenState(
          new GlobalDataToShowClass(
              true,
              new PlaceData(GlobalData.diocesiName, GlobalData.lloc),
              GlobalData.date,
              GlobalData.setmana,
              GlobalData.tempsespecific,
              GlobalData.cicle,
              GlobalData.ABC,
              GlobalData.litColor,
              new CelebrationData(
                  GlobalData.info_cel.typeCel,
                  GlobalData.info_cel.nomCel,
                  GlobalData.info_cel.infoCel)
          ),
          IsLatePrayer(),
          false,
          false,
          "");
    }
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "GetInitialState", "", error);
  }
  return initialState;
}

function IsLatePrayer() {
  const hour = new Date().getHours();
  return hour >= 0 && hour < GLOBALS.late_prayer;
}

function DatePickerChange(event, date, setState) {
  if (Platform.OS === "ios") {
    LastDatePickerIOSSelected = date;
  }
  else {
    setState(CurrentState.UpdateDateTimePickerVisibility(false));
    if (date !== GlobalData.date) {
      ShowDate(date, setState);
    }
  }
}

function HandleDatePickerIOSAccept(setState) {
  if (LastDatePickerIOSSelected !== GlobalData.date) {
    ShowDate(LastDatePickerIOSSelected, setState)
  }
}

function HandleDatePickerIOSCancel(setState) {
  setState(CurrentState.UpdateDateTimePickerVisibility(false));
}

function HandleDatePickerIOSToday(setState) {
  const now = new Date();
  if (now !== GlobalData.date) {
    ShowDate(now, setState)
  }
}

function ShowDate(date, setState) {
  Logger.Log(Logger.LogKeys.HomeScreenController, "ShowDate", "date: ", date);
  ChangeDate(date, setState);
}

function HandleOnSantPressedCallback(setState) {
  if (GlobalData.info_cel.infoCel !== '-') {
    setState(CurrentState.UpdateCelebrationVisibility(!CurrentState.CelebrationIsVisible));
  }
}

function HandleOnYesterdayPressed(yesterday, setState) {
  ShowDate(yesterday, setState);
}

function HandleOnTodayPressed(setState) {
  setState(CurrentState.UpdateLatePopupVisibility(false));
}

async function HandleOnSwitchFreePrayerPressed(freePrayerEnabled, setState) {
  if (freePrayerEnabled) {
    const stringData = GlobalData.date.getDate() + ':' +
        GlobalData.date.getMonth() + ':' +
        GlobalData.date.getFullYear();
    await StorageService.StoreData(StorageKeys.OptionalFestivity, stringData);
  }
  else {
    await StorageService.StoreData(StorageKeys.OptionalFestivity, 'none');
  }
  GlobalData.lliures = freePrayerEnabled;
  ChangeDate(GlobalData.date, setState);
}

function HandleGetDataError(error, setState){
  Logger.LogError(Logger.LogKeys.HomeScreenController, "HandleGetDataError", "", error);
  const messageToShow = "Ha sorgit un error inesperat i no és possible obrir l'aplicació de manera normal.\nProva de desinstal·lar l'aplicació i a tornar-la a instal·lar i si el problema persisteix, posa't en contacte amb cpl@cpl.es\nDisculpa les molèsties.";
  setState(CurrentState.UpdateObtainDataErrorMessage(messageToShow));
}

function HomeScreenViewWithError(currentObtainDataErrorMessage){
  return(
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{fontSize: 19, color: 'black', textAlign: 'center' }}>{currentObtainDataErrorMessage}</Text>
      </View>
  );
}

function HomeScreenView(navigation, setState){
  if(GlobalData.date === undefined){
    return null;
  }
  const yesterday = new Date(GlobalData.date.getFullYear(), GlobalData.date.getMonth());
  yesterday.setDate(GlobalData.date.getDate() - 1);
  const date = GlobalData.date;
  const minDatePicker = GlobalData.minDatePicker;
  const maxDatePicker = GlobalData.maxDatePicker;
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
                          value={date}
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
                        value={date}
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
                <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Ja estem a dia " + date.getDate() + " de " + GF.getMonthText(date.getMonth()) + "."}</Text>
                <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Vols la litúrgia d’ahir dia " + yesterday.getDate() + " de " + GF.getMonthText(yesterday.getMonth()) + "?"}</Text>
              </View>

              <View style={{ paddingTop: 15, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity onPress={() => HandleOnYesterdayPressed(yesterday, setState)} style={{ paddingRight: 20}}>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{"Sí, la d'ahir dia"}</Text>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{yesterday.getDate() + "/" + (yesterday.getMonth() + 1) + "/" + yesterday.getFullYear()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => HandleOnTodayPressed(setState)}>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, textAlign: 'center', }}>{"No, la d'avui dia"}</Text>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, textAlign: 'center', }}>{date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()}</Text>
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

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
import { LogBox } from 'react-native';
import { useCustomUpdater } from 'expo-custom-updater';
import HomeScreenState, {CelebrationData, GlobalDataToShowClass, PlaceData} from './HomeScreenState';

// Ignoring params.calPres warning
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

let LastDatePickerIOSSelected;
let CurrentState;

export default function HomeScreenController(props) {
  try {

    // TODO: remove logs
    console.log("------------------------ REFRESHING VIEW ------------------------ ");

    const [state, setState] = useState(new HomeScreenState());
    CurrentState = state;

    // TODO: maybe this should only be executed once (maybe in App.js)
    configureUpdates();

    //const appState = useRef(AppState.currentState);

    useEffect(() => {
      if (!__DEV__) {
        SplashScreen.preventAutoHideAsync();
      }
      AppState.addEventListener('change', (status) => _handleAppStateChange(status, props.navigation, setState));
      props.navigation.setParams({
        calPres: () => calendarPressed(setState),
        Refresh_Date: () => calendarPressed(setState),
      });
      BackHandler.addEventListener('hardwareBackPress', androidBack.bind(setState));
      Appearance.addChangeListener(AppearanceHasChanged);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', androidBack.bind(setState));
        AppState.removeEventListener('change', _handleAppStateChange);
        Appearance.removeChangeListener(AppearanceHasChanged)
      }
    }, []);

    useEffect(() => ReloadAllDataAndRefreshView(new Date(/*2019, 9, 23*/), setState), []);

    return (
        <SafeAreaView style={{flex: 1}}>
          {CurrentState.ObtainDataErrorMessage === undefined || CurrentState.ObtainDataErrorMessage === "" ?
              homeScreenView(props.navigation, setState)
              :
              homeScreenViewWithError(CurrentState.ObtainDataErrorMessage)}
        </SafeAreaView>
    );
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "HomeScreenController", "", error);
    return null;
  }
}

function configureUpdates(){
  useCustomUpdater({
    beforeCheckCallback: () => setShowSpinner(true),
    beforeDownloadCallback: () => setShowUpdateIsDownloading(),
    afterCheckCallback: () => setShowSpinner(false),
    showDebugInConsole: true
  });
}

function _handleAppStateChange(nextAppState, navigation?, setState?){
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
      ChangeDate(now, setState)
    }
  }
}

async function AppearanceHasChanged(param) {
  try {
    Logger.Log(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", param.colorScheme);
    await checkSystemDarkMode(param.colorScheme);
  }
  catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", "", error);
  }
}

async function checkSystemDarkMode(colorScheme) {
  try {
    // It's not always getting the correct color scheme when reopening the app on ios. So I get it from the getColorSheme function
    colorScheme = Appearance.getColorScheme();

    await SettingsManager.getSettingDarkMode((r) => {
      if (r === 'Automàtic') {
        GlobalData.darkModeEnabled = colorScheme === 'dark';
      }
      this.forceUpdate(); // TODO: meh?
    });
  } catch (error) {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "checkSystemDarkMode", "", error);
  }
}

function androidBack(setState) {
  if (CurrentState.CelebrationIsVisible && CurrentState.ViewData.celebracio.text !== '-') {
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
        setState(getInitialState());
      })
      .catch((errorMessage) => handleGetDataError(errorMessage, setState))
}

function calendarPressed(setState) {
  LastDatePickerIOSSelected = undefined;
  setState(CurrentState.UpdateDateTimePickerVisibility(true));
}

function getInitialState(){
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
    Logger.LogError(Logger.LogKeys.HomeScreenController, "getInitialState", "", error);
  }
  return initialState;
}

function IsLatePrayer() {
  const h = new Date().getHours();
  return h >= 0 && h < GLOBALS.late_prayer;
}

function datePickerChange(event, date, setState) {
  if (Platform.OS === "ios") {
    LastDatePickerIOSSelected = date
  }
  else {
    setState(CurrentState.UpdateDateTimePickerVisibility(false));

    if (date !== GlobalData.date) {
      showThisDate(date, setState);
    }
  }
}

function datePickerIOS_Accept(setState) {
  if (LastDatePickerIOSSelected !== GlobalData.date) {
    showThisDate(LastDatePickerIOSSelected, setState)
  }
}

function datePickerIOS_Cancel(setState) {
  setState(CurrentState.UpdateDateTimePickerVisibility(false));
}

function datePickerIOS_Today(setState) {
  const now = new Date();
  if (now !== GlobalData.date) {
    showThisDate(now, setState)
  }
}

function showThisDate(date, setState) {
  Logger.Log(Logger.LogKeys.HomeScreenController, "showThisDate", "date: ", date);
  ChangeDate(date, setState);
}

function onSantPressCB(setState) {
  if (GlobalData.info_cel.infoCel !== '-') {
    setState(CurrentState.UpdateCelebrationVisibility(!CurrentState.CelebrationIsVisible));
  }
}

function onYestPress(yesterday, setState) {
  showThisDate(yesterday, setState);
}

function onTodayPress(setState) {
  setState(CurrentState.UpdateLatePopupVisibility(false));
}

async function onSwitchLliurePress(freePrayerEnabled, setState) {
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

function handleGetDataError(error, setObtainDataErrorMessage){
  Logger.LogError(Logger.LogKeys.HomeScreenController, "HandleGetDataError", "", error);
  const messageToShow = "Ha sorgit un error inesperat i no és possible obrir l'aplicació de manera normal.\nProva de desinstal·lar l'aplicació i a tornar-la a instal·lar i si el problema persisteix, posa't en contacte amb cpl@cpl.es\nDisculpa les molèsties.";
  setObtainDataErrorMessage(messageToShow, async () => await SplashScreen.hideAsync());
}

function homeScreenViewWithError(currentObtainDataErrorMessage){
  return(
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{fontSize: 19, color: 'black', textAlign: 'center' }}>{currentObtainDataErrorMessage}</Text>
      </View>
  );
}

function homeScreenView(navigation, setState){
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
            santCB={() => onSantPressCB(setState)}
            lliureCB={(freePrayerEnabled) => onSwitchLliurePress(freePrayerEnabled, setState)}
            navigation={navigation} />
        <View>
          { Platform.OS === "ios" ?
              <Modal
                  animationType="fade" // slide, fade, none
                  transparent={true}
                  visible={CurrentState.DateTimePickerIsVisible}>
                <TouchableOpacity activeOpacity={1} style={styles.DatePickerWholeModal} onPress={() => datePickerIOS_Cancel(setState)}>
                  <TouchableOpacity activeOpacity={1} style={{margin: 10, marginHorizontal: 30, backgroundColor: Appearance.getColorScheme() === 'dark'? 'black' : 'white', borderRadius: 20, padding: 10, paddingBottom: 20, shadowColor: '#000', shadowOffset: {width: 0,height: 2,}}}>
                    <View style={{ marginHorizontal: 10, marginBottom: 5 }}>
                      <DateTimePicker
                          mode="date"
                          display="inline" //spinner, compact, inline
                          onChange={datePickerChange.bind(setState)}
                          value={date}
                          minimumDate={minDatePicker}
                          maximumDate={maxDatePicker}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={() => datePickerIOS_Cancel(setState)}>
                        <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Cancel·la'}</Text>
                      </TouchableOpacity >
                      <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={() => datePickerIOS_Today(setState)}>
                        <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Avui'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={() => datePickerIOS_Accept(setState)}>
                        <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Canvia'}</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Modal>
              :
              <View>
                {CurrentState.DateTimePickerIsVisible &&
                    <DateTimePicker
                        mode={"date"}
                        display={"default"} // default, spinner, calendar
                        onChange={(event, date) => datePickerChange(event, date, setState)}
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
               visible={CurrentState.LatePopupIsVisible} >
          <TouchableOpacity activeOpacity={1} style={styles.LatePrayerWholeModal} onPress={() => onTodayPress(setState)}>
            <TouchableOpacity activeOpacity={1} style={styles.LatePrayerInsideModal}>
              <View style={{ paddingTop: 15}}>
                <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Ja estem a dia " + date.getDate() + " de " + GF.getMonthText(date.getMonth()) + "."}</Text>
                <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Vols la litúrgia d’ahir dia " + yesterday.getDate() + " de " + GF.getMonthText(yesterday.getMonth()) + "?"}</Text>
              </View>

              <View style={{ paddingTop: 15, flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity onPress={() => onYestPress(yesterday, setState)} style={{ paddingRight: 20}}>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{"Sí, la d'ahir dia"}</Text>
                  <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{yesterday.getDate() + "/" + (yesterday.getMonth() + 1) + "/" + yesterday.getFullYear()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onTodayPress(setState)}>
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

function setShowSpinner(spinnerVisibility) {
  Logger.Log(Logger.LogKeys.HomeScreenController, "setShowSpinner", "spinnerVisibility: ", spinnerVisibility);
}

function setShowUpdateIsDownloading() {
  Logger.Log(Logger.LogKeys.HomeScreenController, "setShowUpdateIsDownloading", "");
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

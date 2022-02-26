import React, { Component } from 'react';
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
import GLOBALS from "../Globals/GlobalKeys";
import GF from "../Globals/GlobalFunctions";
import { ReloadAllData } from '../Services/DataService.js';
import * as Logger from '../Utils/Logger';
import SettingsManager from './Classes/SettingsManager';
import { GlobalData, LAST_REFRESH } from '../Services/DataService';
import * as StorageService from '../Services/StorageService';
import StorageKeys from "../Services/StorageKeys";
import { LogBox } from 'react-native';

// Ignoring params.calPres warning
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default class HomeScreenController extends Component {

  constructor(props) {
    super(props);

    this.state = {
      santPressed: false,
      isDateTimePickerVisible: false,
      PopupDialog_ShowLate: false,
      ViewData: {
        ready: false,
        lloc: {
          diocesiName: '',
          lloc: '',
        },
        setmana: '',
        temps: '',
        setCicle: '',
        anyABC: '',
        color: '',
        celebracio: {
          typeText: '',
          titol: '',
          text: '',
        },
        primVespres: false,
        santPressed: false,
      }
    }

    ReloadAllData(new Date(/*2019, 9, 23*/))
        .then(() => this.InitEverything())
        .catch((errorMsg) => this.HandleGetDataError(errorMsg));
  }

  async componentDidMount() {
    try {
      if(!__DEV__){
        await SplashScreen.preventAutoHideAsync();
      }
    } catch (e) {
        console.warn(e);
        await SplashScreen.hideAsync();
    }
    this.props.navigation.setParams({
      calPres: this.calendarPressed.bind(this),
      Refresh_Date: this.Refresh_Date.bind(this),
    });
    BackHandler.addEventListener('hardwareBackPress', this.androidBack.bind(this));
    AppState.addEventListener('change', this._handleAppStateChange.bind(this));
    Appearance.addChangeListener(this.AppearanceHasChanged.bind(this))
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.androidBack.bind(this));
    AppState.removeEventListener('change', this._handleAppStateChange.bind(this));
    Appearance.removeChangeListener(this.AppearanceHasChanged.bind(this))
  }

  _handleAppStateChange(nextAppState){

    // Check if the state is changing to active
    if(nextAppState === 'active'){

      // Get today
      const now = new Date();

      // Refresh the date if today is different than the last refresh date
      if(now.getDate() !== LAST_REFRESH.getDate() || now.getMonth() !== LAST_REFRESH.getMonth() || now.getFullYear() !== LAST_REFRESH.getFullYear()){

        // Navigate to Home Screen
        this.props.navigation.popToTop()
        this.props.navigation.navigate('Home')
        
        // Refresh data
        this.Refresh_Date(now)

        // Check late prayer
        this.setState({ PopupDialog_ShowLate: this.Is_Late_Prayer() });
      }
    }
  }

  AppearanceHasChanged(param){
    try {
      this.checkSystemDarkMode(param.colorScheme);
    } catch (error) {
      Logger.LogError(Logger.LogKeys.HomeScreenController, "AppearanceHasChanged", "", error);
    }
  }

  checkSystemDarkMode(colorScheme){
    try {
      // It's not always getting the correct color scheme when reopening the app on ios. So I get it from the getColorSheme function
      colorScheme = Appearance.getColorScheme();

      SettingsManager.getSettingDarkMode((r) => {
        if(r === 'Automàtic'){
            if (colorScheme === 'dark') {
              GlobalData.darkModeEnabled = true;
            }
            else {
              GlobalData.darkModeEnabled = false;
            }
          }
          this.forceUpdate();
        });
    } catch (error) {
      Logger.LogError(Logger.LogKeys.HomeScreenController, "checkSystemDarkMode", "", error);
    }
  }

  androidBack() {
    if (this.state.santPressed && this.state.ViewData.celebracio.text !== '-') {
      this.setState({ santPressed: false });
      return true;
    }
    return false;
  }

  Refresh_Date(date) {
    if (date === null || date === undefined){
      date = GlobalData.date;
    }

    ReloadAllData(date)
        .then(() => this.RefreshDateCallback())
        .catch((error) => this.HandleGetDataError(error));
  }

  calendarPressed() {
    this.last_datePickerIOS_selected = undefined
    this.setState({ isDateTimePickerVisible: true });
  }

  async InitEverything() {
    try {
      //Set data to show on Home Screen
      this.setState({
        santPressed: false,
        PopupDialog_ShowLate: this.Is_Late_Prayer(),
        ViewData: {
          ready: true,
          lloc: {
            diocesiName: GlobalData.diocesiName,
            lloc: GlobalData.lloc,
          },
          data: GlobalData.date,
          setmana: GlobalData.setmana,
          temps: GlobalData.tempsespecific,
          setCicle: GlobalData.cicle,
          anyABC: GlobalData.ABC,
          color: GlobalData.litColor,
          celebracio: {
            type: GlobalData.info_cel.typeCel,
            titol: GlobalData.info_cel.nomCel,
            text: GlobalData.info_cel.infoCel,
          },
        }
      }, async () =>
          setTimeout(async() => await SplashScreen.hideAsync(), this.Is_Late_Prayer()? 0 : 250)
      );
      
      //Set santPress variable to 0
      this.santPress = 0;
    } catch (error) {
      Logger.LogError(Logger.LogKeys.HomeScreenController, "InitEverything", "", error);
    }
  }

  RefreshDateCallback() {
    //Set data to show on Home Screen
    this.setState({
      santPressed: false,
      ViewData: {
        ready: true,
        lloc: {
          diocesiName: GlobalData.diocesiName,
          lloc: GlobalData.lloc,
        },
        data: GlobalData.date,
        setmana: GlobalData.setmana,
        temps: GlobalData.tempsespecific,
        setCicle: GlobalData.cicle,
        anyABC: GlobalData.ABC,
        color: GlobalData.litColor,
        celebracio: {
          type: GlobalData.info_cel.typeCel,
          titol: GlobalData.info_cel.nomCel,
          text: GlobalData.info_cel.infoCel,
        },
      }
    });

    //Set santPress variable to 0
    this.santPress = 0;
  }

  Is_Late_Prayer() {
    const h = new Date().getHours();
    return h >= 0 && h < GLOBALS.late_prayer;
  }

  eventManager(args) {
    switch (args.type) {
      case 'settingsPressed':
        break;
      case 'pickerPressed':
        break;
      case 'okPicker':
        if (args.newDate !== GlobalData.date) {
          this.props(rgs.newDate);
        }
        break;
    }
  }

  datePickerChange(event, date) {
    if (Platform.OS === "ios") {
        this.last_datePickerIOS_selected = date
    }
    else {
      this.setState({ isDateTimePickerVisible: false });

      if (date !== GlobalData.date) {
        this.showThisDate(date)
      }
    }
  }

  datePickerIOS_Accept() {
    this.setState({ isDateTimePickerVisible: false });

    if (this.last_datePickerIOS_selected !== GlobalData.date) {
      this.showThisDate(this.last_datePickerIOS_selected)
    }
  }

  datePickerIOS_Cancel() {
    this.setState({ isDateTimePickerVisible: false });
  }

  datePickerIOS_Today() {
    this.setState({ isDateTimePickerVisible: false });

    const now = new Date();
    if (now !== GlobalData.date) {
      this.showThisDate(now)
    }
  }

  showThisDate(date) {
    Logger.Log(Logger.LogKeys.HomeScreenController, "showThisDate", "date: ", date);
    this.Refresh_Date(date);
  }

  onSantPressCB() {
    if (GlobalData.info_cel.infoCel !== '-') {

      if (this.santPress === 0) this.santPress = 1;
      else if (this.santPress === 1) this.santPress = 2;
      this.setState({ santPressed: !this.state.santPressed });
    }
  }

  onYestPress(yesterday) {
    this.showThisDate(yesterday);
    this.setState({ PopupDialog_ShowLate: false });
  }

  onTodayPress() {
    this.setState({ PopupDialog_ShowLate: false });
  }

  onSwitchLliurePress(value) {
    if (value) {
      const stringData = GlobalData.date.getDate() + ':' +
        GlobalData.date.getMonth() + ':' +
        GlobalData.date.getFullYear();
      StorageService.StoreData(StorageKeys.OptionalFestivity, stringData);
    }
    else {
      StorageService.StoreData(StorageKeys.OptionalFestivity, 'none');
    }
    
    GlobalData.lliures = value;
    this.Refresh_Date(GlobalData.date);
  }

  onLatePrayerPressed(){
    this.setState({ PopupDialog_ShowLate: true });
  }

  HandleGetDataError(error){
    Logger.LogError(Logger.LogKeys.HomeScreenController, "HandleGetDataError", "", error);
    const messageToShow = "Ha sorgit un error inesperat i no és possible obrir l'aplicació de manera normal.\nProva de desinstal·lar l'aplicació i a tornar-la a instal·lar i si el problema persisteix, posa't en contacte amb cpl@cpl.es\nDisculpa les molèsties.";
    this.setState({ 
      RefreshErrorMessage: messageToShow }, 
      async () => await SplashScreen.hideAsync());
  }

  HomeScreenViewWithError(){
    return(
      <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{fontSize: 19, color: 'black', textAlign: 'center' }}>{this.state.RefreshErrorMessage}</Text>
      </View>
    );
  }

  HomeScreenView(){
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
              ViewData={this.state.ViewData}
              santPressed={this.state.santPressed}
              santCB={this.onSantPressCB.bind(this)}
              lliureCB={this.onSwitchLliurePress.bind(this)}
              navigation={this.props.navigation} />
                <View>
                { Platform.OS === "ios" ?
                    <Modal
                      animationType="fade" // slide, fade, none
                      transparent={true}
                      visible={this.state.isDateTimePickerVisible}>
                        <TouchableOpacity activeOpacity={1} style={styles.DatePickerWholeModal} onPress={this.datePickerIOS_Cancel.bind(this)}>
                          <TouchableOpacity activeOpacity={1} style={{margin: 10, marginHorizontal: 30, backgroundColor: Appearance.getColorScheme() === 'dark'? 'black' : 'white', borderRadius: 20, padding: 10, paddingBottom: 20, shadowColor: '#000', shadowOffset: {width: 0,height: 2,}}}>
                            <View style={{ marginHorizontal: 10, marginBottom: 5 }}>
                              <DateTimePicker
                                mode="date"
                                display="inline" //spinner, compact, inline
                                onChange={this.datePickerChange.bind(this)}
                                value={date}
                                minimumDate={minDatePicker}
                                maximumDate={maxDatePicker}
                              />
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                              <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={this.datePickerIOS_Cancel.bind(this)}>
                                  <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Cancel·la'}</Text>
                              </TouchableOpacity >
                              <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={this.datePickerIOS_Today.bind(this)}>
                                  <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Avui'}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={{ flex: 1, alignItems: 'center'}} onPress={this.datePickerIOS_Accept.bind(this)}>
                                  <Text style={{fontSize: 19, color: 'rgb(14,122,254)'}}>{'Canvia'}</Text>
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </Modal>
                  :
                      <View>
                        {this.state.isDateTimePickerVisible &&
                            <DateTimePicker
                              mode={"date"}
                              display={"default"} // default, spinner, calendar
                              onChange={this.datePickerChange.bind(this)}
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
                        visible={this.state.PopupDialog_ShowLate} >
                    <TouchableOpacity activeOpacity={1} style={styles.LatePrayerWholeModal} onPress={this.onTodayPress.bind(this)}>
                      <TouchableOpacity activeOpacity={1} style={styles.LatePrayerInsideModal}>
                        <View style={{ paddingTop: 15}}>
                          <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Ja estem a dia " + date.getDate() + " de " + GF.getMonthText(date.getMonth()) + "."}</Text>
                          <Text style={{ color: 'grey', fontSize: 18, textAlign: 'center', }}>{"Vols la litúrgia d’ahir dia " + yesterday.getDate() + " de " + GF.getMonthText(yesterday.getMonth()) + "?"}</Text>
                        </View>
  
                        <View style={{ paddingTop: 15, flexDirection: 'row', justifyContent: 'center'}}>
                          <TouchableOpacity onPress={this.onYestPress.bind(this, yesterday)} style={{ paddingRight: 20}}>
                            <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{"Sí, la d'ahir dia"}</Text>
                            <Text style={{ color: 'rgb(14, 122, 254)', fontSize: 17, fontWeight: '600', textAlign: 'center', }}>{yesterday.getDate() + "/" + (yesterday.getMonth() + 1) + "/" + yesterday.getFullYear()}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.onTodayPress.bind(this)}>
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

  render() {
    try {
      return (
        <SafeAreaView style={{ flex: 1 }}>

          {this.state.RefreshErrorMessage === undefined || this.state.RefreshErrorMessage === ""?
            this.HomeScreenView()
            :
            this.HomeScreenViewWithError()}

        </SafeAreaView>
      );
    } catch (error) {
      Logger.LogError(Logger.LogKeys.HomeScreenController, "render", "", error);
      return null;
    }
  }
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

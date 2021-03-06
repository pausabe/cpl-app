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
  StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AsyncStorage } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from '../Views/HomeScreen';
import GLOBALS from "../Globals/Globals";
import GF from "../Globals/GlobalFunctions";
import { Reload_All_Data, GetDBAccess } from './Classes/Data/DataManager.js';
import { TEST_MODE_ON, Reload_All_Data_TestMode, Force_Stop_Test, Alert } from '../Tests/TestsManager';
import { log } from 'react-native-reanimated';
import DBAdapter from '../Adapters/DBAdapter';
export default class HomeScreenController extends Component {

  async componentDidMount() {
    try {
      await SplashScreen.preventAutoHideAsync();
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
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.androidBack.bind(this));
    AppState.removeEventListener('change', this._handleAppStateChange.bind(this));
  }

  _handleAppStateChange(nextAppState){

    // Check if the state is changing to active
    if(nextAppState == 'active'){

      // Get today
      var now = new Date()
      
      // Refresh the date if today is different than the last refresh date
      if(now.getDate() != LAST_REFRESH.getDate() || now.getMonth() != LAST_REFRESH.getMonth() || now.getFullYear() != LAST_REFRESH.getFullYear()){

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

  androidBack() {
    if (this.state.santPressed && this.state.ViewData.celebracio.text !== '-') {
      this.setState({ santPressed: false });
      return true;
    }
    return false;
  }

  Refresh_Date(date) {
    if (date === null || date === undefined)
      date = G_VALUES.date;

    console.log("[PAU DEBUG] here1 ");
    Reload_All_Data(new Date(date), this.Refresh_Date_Callback.bind(this), this.HandleGetDataError.bind(this), false);
  }

  calendarPressed() {
    this.last_datePickerIOS_selected = undefined
    this.setState({ isDateTimePickerVisible: true });
  }

  constructor(props) {
    super(props);

    if (TEST_MODE_ON) {

      //Hide Splash Screen
      //await SplashScreen.hideAsync();

      this.state = {
        testInformation: "Starting test"
      }

      //First initialization
      Reload_All_Data_TestMode(this.Test_Information_Callback.bind(this));
    }
    else {      
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
      console.log("[ONLINE_UPDATES Reload_All_Data] GLOBAL.enable_updates: ", GLOBALS.enable_updates);
      Reload_All_Data(new Date(/*2019, 9, 23*/), this.Init_Everything.bind(this), this.HandleGetDataError.bind(this), GLOBALS.enable_updates);
    }
  }

  Test_Information_Callback(informationText) {
    this.setState({ testInformation: informationText });
  }

  async Init_Everything() {
    try {
      //Set data to show on Home Screen
      this.setState({
        santPressed: false,
        PopupDialog_ShowLate: this.Is_Late_Prayer(),
        ViewData: {
          ready: true,
          lloc: {
            diocesiName: G_VALUES.diocesiName,
            lloc: G_VALUES.lloc,
          },
          data: G_VALUES.date,
          setmana: G_VALUES.setmana,
          temps: G_VALUES.tempsespecific,
          setCicle: G_VALUES.cicle,
          anyABC: G_VALUES.ABC,
          color: G_VALUES.litColor,
          celebracio: {
            type: G_VALUES.info_cel.typeCel,
            titol: G_VALUES.info_cel.nomCel,
            text: G_VALUES.info_cel.infoCel,
          },
        }
      }, async () => await SplashScreen.hideAsync());
      
      //Set santPress variable to 0
      this.santPress = 0;
    } catch (error) {
      console.log(error);
    }
  }

  Refresh_Date_Callback() {

    //Set data to show on Home Screen
    this.setState({
      santPressed: false,
      ViewData: {
        ready: true,
        lloc: {
          diocesiName: G_VALUES.diocesiName,
          lloc: G_VALUES.lloc,
        },
        data: G_VALUES.date, 
        setmana: G_VALUES.setmana,
        temps: G_VALUES.tempsespecific,
        setCicle: G_VALUES.cicle,
        anyABC: G_VALUES.ABC,
        color: G_VALUES.litColor,
        celebracio: {
          type: G_VALUES.info_cel.typeCel,
          titol: G_VALUES.info_cel.nomCel,
          text: G_VALUES.info_cel.infoCel,
        },
      }
    });

    //Set santPress variable to 0
    this.santPress = 0;
  }

  Is_Late_Prayer() {
    var h = new Date().getHours();
    if (h >= 0 && h < GLOBALS.late_prayer)
      return true;

    return false;
  }

  eventManager(args) {
    switch (args.type) {
      case 'settingsPressed':
        break;
      case 'pickerPressed':
        break;
      case 'okPicker':
        if (args.newDate !== G_VALUES.date) {
          this.props(rgs.newDate);
        }
        break;
    }
  }

  datePickerChange(event, date) {
    if (Platform.OS == "ios") { 
        this.last_datePickerIOS_selected = date
    }
    else {
      this.setState({ isDateTimePickerVisible: false });

      if (date !== G_VALUES.date) {
        this.showThisDate(date)
      }
    }
  }

  datePickerIOS_Accept() {
    this.setState({ isDateTimePickerVisible: false });

    if (this.last_datePickerIOS_selected !== G_VALUES.date) {
      this.showThisDate(this.last_datePickerIOS_selected)
    }
  }

  datePickerIOS_Cancel() {
    this.setState({ isDateTimePickerVisible: false });
  }

  datePickerIOS_Today() {
    this.setState({ isDateTimePickerVisible: false });

    var now = new Date();
    if (now !== G_VALUES.date) {
      this.showThisDate(now)
    }
  }

  showThisDate(date) {
    this.Refresh_Date(date);
  }

  onSantPressCB() {
    if (G_VALUES.info_cel.infoCel !== '-') {

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
      stringData = G_VALUES.date.getDate() + ':' +
        G_VALUES.date.getMonth() + ':' +
        G_VALUES.date.getFullYear();
      AsyncStorage.setItem("lliureDate", stringData);
    }
    else {
      AsyncStorage.setItem("lliureDate", 'none');
    }
    
    G_VALUES.lliures = value;
    console.log("[PAU DEBUG] first G_VALUES.lliures: ", G_VALUES.lliures);
    this.Refresh_Date(G_VALUES.date);
  }

  onLatePrayerPressed(){
    this.setState({ PopupDialog_ShowLate: true });
  }

  /*testing(){
    console.log("test pressed");
    Reload_All_Data(new Date(/*2019, 9, 23*//*), this.Init_Everything.bind(this), this.HandleGetDataError.bind(this), true);
  }
            <TouchableOpacity>
            <Text onPress={this.testing.bind(this)}>TESTING</Text>
            <Text>{"Error: "}{this.state.getDataMsgError}</Text>
          </TouchableOpacity>*/

  HandleGetDataError(msgError){
    //this.setState({ getDataMsgError: msgError});
  }

  render() {
    try {
      if (TEST_MODE_ON) {
        return (
          <View style={{ flex: 1 }}>
            <Text style={{ textAlign: 'center' }}>{"\nTEST INFORMATION\n"}</Text>
            <Text style={{ textAlign: 'center' }}>{this.state.testInformation}{"\n\n"}</Text>
            <TouchableOpacity style={{ backgroundColor: 'rgba(20,47,43,0.3)', marginHorizontal: 100, paddingVertical: 10 }} onPress={Force_Stop_Test.bind(this, this.Test_Information_Callback.bind(this))}>
              <Text style={{ textAlign: 'center' }}>{"STOP TEST"}</Text>
            </TouchableOpacity>
          </View>
        );
      }
      else {
        console.log("G_VALUES.date: ", G_VALUES.date);
        var yesterday = new Date(G_VALUES.date.getFullYear(), G_VALUES.date.getMonth());
        yesterday.setDate(G_VALUES.date.getDate() - 1);
        var date = G_VALUES.date;
        var minDatePicker = G_VALUES.minDatePicker;
        var maxDatePicker = G_VALUES.maxDatePicker;
        
       /*var yesterday = new Date(2020, 10, 8);
       var date = new Date(2020, 10, 9);
       var minDatePicker = new Date(2020, 10, 1);
       var maxDatePicker = new Date(2020, 10, 20);*/
        return (
          <SafeAreaView style={{ flex: 1 }}>
            <HomeScreen
              ViewData={this.state.ViewData}
              santPressed={this.state.santPressed}
              santCB={this.onSantPressCB.bind(this)}
              lliureCB={this.onSwitchLliurePress.bind(this)}
              navigation={this.props.navigation} />
                <View>
                { Platform.OS == "ios" ?
                    <Modal
                      animationType="fade" // slide, fade, none
                      transparent={true}
                      visible={this.state.isDateTimePickerVisible}>
                        <TouchableOpacity activeOpacity={1} style={styles.DatePickerWholeModal} onPress={this.datePickerIOS_Cancel.bind(this)}>
                          <TouchableOpacity activeOpacity={1} style={styles.DatePickerInsideModal}>
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
  
          </SafeAreaView>
        );
      }
    } catch (error) {
      console.log("EXCEPTION: ", error);
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
  DatePickerInsideModal: {
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

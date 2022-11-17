import * as Logger from '../Utils/Logger';
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Linking,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AntDesign } from '@expo/vector-icons'; 
import GLOBAL from "../Utils/GlobalKeys";
import {CurrentCelebrationInformation, CurrentLiturgyDayInformation, CurrentSettings} from "../Services/DataService";
import {CelebrationType, YearType} from "../Services/DatabaseEnums";
import {SpecificLiturgyTimeType} from "../Services/CelebrationTimeEnums";
import {StringManagement} from "../Utils/StringManagement";

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.switchValue = CurrentSettings.OptionalFestivityEnabled;
  }

  tempsName(t) {
    try {
      if (!t) return "";
      if (t === 'Ordinari') {
        return "Durant l'any";
      }
      return t;
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "tempsName", error);
      return null;
    }
  }

  liturgicPaint(string, color) {
    try {
      if (color === YearType.B) {
        return (<Text style={{color: 'white'}}>{string}</Text>);
      } else if (color === CelebrationType.OptionalVirginMemory) {
        return (<Text style={{color: 'rgb(0, 120, 0)'}}>{string}</Text>);
      } else if (color === 'R') {
        return (<Text style={{color: 'rgb(230, 15, 15)'}}>{string}</Text>);
      } else if (color === 'M') {
        return (<Text style={{color: 'rgb(120, 50, 140)'}}>{string}</Text>);
      } else {
        return (<Text style={{color: '#c0392b'}}>{string}</Text>);
      }
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "liturgicPaint", error);
      return null;
    }
  }

  romanize(num) {
    try {
      if (!+num)
        return false;
      let digits = String(+num).split(""),
          key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
          roman = "",
          i = 3;
      while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
      return Array(+digits.join("") + 1).join("M") + roman;
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "romanize", error);
      return null;
    }
  }

  transfromCelTypeName(CT, t) {
    try {
      let memLliureColor = '#333333';
      if ((CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalMemory
          || CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory)
          && !CurrentSettings.OptionalFestivityEnabled) {
        memLliureColor = '#595959';
      }

      switch (CT) {
        case 'F':
          return (<Text style={styles.celebracioType}>{"Festa"}</Text>);
        case 'S':
          return (<Text style={styles.celebracioType}>{"Solemnitat"}</Text>);
        case 'M':
          if (t === 'Quaresma')
            return (<Text style={styles.celebracioType}>{"Commemoració"}</Text>);
          return (<Text style={styles.celebracioType}>{"Memòria obligatòria"}</Text>);
        case CelebrationType.OptionalVirginMemory:
        case CelebrationType.OptionalMemory:
          if (t === 'Quaresma')
            return (<Text style={{
              textAlign: 'center',
              color: memLliureColor,
              fontSize: 13,
              fontWeight: '300'
            }}>
              {"Commemoració"}</Text>);
          return (<Text style={{
            textAlign: 'center',
            color: memLliureColor,
            fontSize: 13,
            fontWeight: '300'
          }}>
            {"Memòria lliure"}</Text>);
      }
      return null;
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "transfromCelTypeName", error);
      return null;
    }
  }

  weekDayName(num) {
    try {
      switch (num) {
        case 0:
          return ("Diumenge");
        case 1:
          return ("Dilluns");
        case 2:
          return ("Dimarts");
        case 3:
          return ("Dimecres");
        case 4:
          return ("Dijous");
        case 5:
          return ("Divendres");
        case 6:
          return ("Dissabte");
      }
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "weekDayName", error);
      return null;
    }
  }

  onSwitchValueChange() {
    try {
      this.switchValue = !this.switchValue;
      this.forceUpdate();
      this.props.lliureCB(this.switchValue);
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "onSwitchValueChange", error);
    }
  }

  On_Give_Press() {
    try {
      if(Platform.OS === "ios"){
        Linking.openURL('https://mescpl.cpl.es/donacions/');
      }
      else{
        this.props.navigation.navigate('Donation');
      }
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "On_Give_Press", error);
      return null;
    }
  }

  On_Comment_Press() {
    try {
      this.props.navigation.navigate('Comment');
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "On_Comment_Press", error);
      return null;
    }
  }

  render() {
    try {
      const date_getdate = CurrentLiturgyDayInformation.Today.Date.getDate();
      const date_getmonth = CurrentLiturgyDayInformation.Today.Date.getMonth();
      const date_getfullyear = CurrentLiturgyDayInformation.Today.Date.getFullYear();
      const date_getday = CurrentLiturgyDayInformation.Today.Date.getDay();
      this.switchValue = CurrentSettings.OptionalFestivityEnabled;
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: GLOBAL.screensBackgroundColor}} >
          <ImageBackground source={require('../Assets/img/bg/home_background.jpg')} style={styles.backgroundImage} blurRadius={5}>
            {this.Top_Info(date_getdate, date_getmonth, date_getfullyear)}
            {this.Info_Liturgica(date_getday)}
            {this.Cel_Info()}
          </ImageBackground>
        </SafeAreaView>
      )
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "render", error);
      return null;
    }
  }

  Top_Info(date_getdate, date_getmonth, date_getfullyear) {
    try {
      return (
        <View style={CurrentCelebrationInformation.Title !== '-' ? styles.infoContainer_cel : styles.infoContainer}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', paddingTop: 5 }}>
            <Text style={styles.infoText}>{CurrentSettings.DioceseName}{" ("}{CurrentSettings.PrayingPlace}{")"}
              {" - "}<Text style={styles.infoText}>{date_getdate < 10 ? `0${date_getdate}` : date_getdate}/{date_getmonth + 1 < 10 ? `0${date_getmonth + 1}` : date_getmonth + 1}/{date_getfullyear}</Text>
            </Text>
          </View>
        </View>
      )
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "Top_Info", error);
      return null;
    }
  }

  Info_Liturgica(date_getday) {
    try {

      let text_setmana = "";
      if(CurrentLiturgyDayInformation.Today.Week !== '0' && CurrentLiturgyDayInformation.Today.Week !== '.')
        text_setmana = this.weekDayName(date_getday) + " de la setmana "
      else if(CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_CENDRA){
        if(date_getday === 3)
          text_setmana = this.weekDayName(date_getday) + " de Cendra"
        else
          text_setmana= this.weekDayName(date_getday) + " després de Cendra"
      }

      return (
        <View style={styles.diaLiturgicContainer}>
          <Text style={styles.diaLiturgicText}>
            {text_setmana}
            {
              CurrentLiturgyDayInformation.Today.Week !== '0' && CurrentLiturgyDayInformation.Today.Week !== '.' ?
                this.liturgicPaint(this.romanize(CurrentLiturgyDayInformation.Today.Week), CurrentLiturgyDayInformation.Today.LiturgyColor)
                :
                null
            }
            {
              CurrentLiturgyDayInformation.Today.WeekCycle !== '0' && CurrentLiturgyDayInformation.Today.WeekCycle !== '.' ?
                " - Any "
                :
                null
            }
            {
              CurrentLiturgyDayInformation.Today.WeekCycle !== '0' && CurrentLiturgyDayInformation.Today.WeekCycle !== '.' ?
                this.liturgicPaint(CurrentLiturgyDayInformation.Today.YearType, CurrentLiturgyDayInformation.Today.LiturgyColor)
                :
                null
            }
          </Text>
          <Text style={styles.diaLiturgicText}>
            {"Temps - "}
            {this.liturgicPaint(this.tempsName(CurrentLiturgyDayInformation.Today.GenericLiturgyTime), CurrentLiturgyDayInformation.Today.LiturgyColor)}
          </Text>
          <Text style={styles.diaLiturgicText}>
            {
              CurrentLiturgyDayInformation.Today.WeekCycle !== '0' && CurrentLiturgyDayInformation.Today.WeekCycle !== '.' ?
                "Litúrgia de les Hores - Setmana "
                :
                null
            }
            {
              CurrentLiturgyDayInformation.Today.WeekCycle !== '0' && CurrentLiturgyDayInformation.Today.WeekCycle !== '.' ?
                this.liturgicPaint(this.romanize(CurrentLiturgyDayInformation.Today.WeekCycle), CurrentLiturgyDayInformation.Today.LiturgyColor)
                :
                null
            }
          </Text>
        </View>
      )
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "Info_Liturgica", error);
      return null;
    }
  }

  Cel_Info() {
    try {
      let arrowWidth = 35;
      let auxPadding = 10;
      if ((CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalMemory ||
          CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory)) {
        arrowWidth = 65;
        auxPadding = 0;
      }
      let santTextColor = 'black';
      return (
        <View style={styles.cel_container}>

          {StringManagement.HasLiturgyContent(CurrentCelebrationInformation.Title)?
            <View style={{ paddingBottom: 5, }}>
              {this.transfromCelTypeName(CurrentLiturgyDayInformation.Today.CelebrationType, CurrentLiturgyDayInformation.Today.GenericLiturgyTime)}
            </View>
            : null
          }

          {StringManagement.HasLiturgyContent(CurrentCelebrationInformation.Title) ?
            <View style={{
              flex: 1.1,
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 10,
              marginBottom: 10,
              paddingLeft: 10,
              marginHorizontal: 20,
            }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                {(CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalMemory ||
                    CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory) ?
                  <View style={{ flex: 1, minWidth: 45, justifyContent: 'center', alignItems: 'center'}}>
                    <Switch
                      onValueChange={this.onSwitchValueChange.bind(this)}
                      value={this.switchValue}
                      trackColor={{true: GLOBAL.switchColor, false: '#bababa'}}
                    />
                  </View>
                  : null
                }
                <TouchableOpacity activeOpacity={1.0} style={{ flex: 20, flexDirection: 'row' }} onPress={this.props.santCB}>
                  {StringManagement.HasLiturgyContent(CurrentCelebrationInformation.Description) && 
                  CurrentLiturgyDayInformation.Today.CelebrationType !== CelebrationType.OptionalMemory ?
                    <View style={{ width: arrowWidth }} />
                    : null}
                  <View style={{ flex: 1, justifyContent: 'center', paddingRight: auxPadding }}>
                    <Text numberOfLines={2} style={{
                      color: santTextColor,
                      textAlign: 'center',
                      fontSize: 17,
                      fontWeight: '300'
                    }}>
                      {CurrentCelebrationInformation.Title}</Text>
                  </View>
                  {StringManagement.HasLiturgyContent(CurrentCelebrationInformation.Description) ?
                    <View style={{ width: arrowWidth, justifyContent: 'center', alignItems: 'center' }}>
                      {this.props.santPressed ?
                        <AntDesign name="down" size={24} color="black" />
                        :
                        <AntDesign name="right" size={24} color="black" />
                      }
                    </View>
                    :
                    <View>
                      {(CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalMemory || 
                          CurrentLiturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory) ?
                        <View style={{width: 45}}/>
                        : null
                      }
                    </View>
                  }
                </TouchableOpacity>
              </View>
            </View>

            : null}

          {this.props.santPressed && StringManagement.HasLiturgyContent(CurrentCelebrationInformation.Description) ?
            <View style={styles.liturgiaContainer}>
              <ScrollView>
                <Text style={{
                  textAlign: 'center',
                  color: santTextColor,
                  fontSize: 17,
                  fontWeight: '300'
                }}>
                  {CurrentCelebrationInformation.Description}</Text>
                <Text />
              </ScrollView>
            </View>
            :
            <View style={styles.liturgiaContainer}>
              {this.Two_Buttons()}
            </View>
          }
        </View>
      )
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "Cel_Info", error);
      return null;
    }
  }

  Two_Buttons() {
    try {
      return (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', paddingTop: 20}}>
          <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 10, justifyContent: 'flex-start', }}>
            <TouchableOpacity style={styles.two_buttons} onPress={this.On_Comment_Press.bind(this)}>
              <Icon
                name="ios-mail"
                size={75}
              color={'rgb(50, 50, 50)'} 
              />
              <Text style={{ textAlign: 'center', marginTop: -10, color: 'rgb(50, 50, 50)', fontSize: 12 }}>{"Missatge"}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'flex-start', }}>
            <TouchableOpacity style={styles.two_buttons} onPress={this.On_Give_Press.bind(this)}>
              <Icon
                name="ios-card"
                size={75}
                //color={'#424242'}
                //color={'black'}
              color={'rgb(50, 50, 50)'}
              />
              <Text style={{ textAlign: 'center', marginTop: -10, color: 'rgb(50, 50, 50)', fontSize: 12 }}>{"Donatiu lliure"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "Two_Buttons", error);
      return null;
    }
  }
}

function fontsize(){
  return Platform.OS === 'iOS'? 20 : 18;
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: 'rgb(5, 169, 176)',
    width: null,
    height: null,
  },







  infoContainer: {
    flex: 1.3,
    justifyContent: 'flex-end',
    paddingTop: 5,
  },
  infoContainer_cel: {
    flex: 0.6,
    justifyContent: 'flex-end',
    paddingTop: 5,
  },
  diaLiturgicContainer: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 10,
    marginHorizontal: 20,
  },
  cel_container: {
    flex: 2.5,
    paddingTop: 10,
  },




  two_buttons: {
    paddingHorizontal: 30,
    alignItems: 'center'
  },
  diaLiturgicText: {
    textAlign: 'center',
    color: 'black',
    fontSize: fontsize(),
    fontWeight: '300'
  },
  infoText: {
    textAlign: 'center',
    color: '#424242',
    fontSize: 17,
    fontStyle: 'italic',
    fontWeight: '300'
  },
  celebracioType: {
    textAlign: 'center',
    color: '#333333',
    fontSize: 16,
    fontWeight: '300'
  },
  liturgiaContainer: {
    flex: 4,
    marginBottom: 10,
    marginHorizontal: 10,
  },
});

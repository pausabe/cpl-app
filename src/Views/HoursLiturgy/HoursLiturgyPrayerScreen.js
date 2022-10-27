import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Platform } from 'react-native';

import Ofici from './SpecificHourLiturgy/OfficeComponent'
import Laudes from './SpecificHourLiturgy/LaudesComponent'
import Vespres from './SpecificHourLiturgy/VespersComponent'
import HoraMenor from './SpecificHourLiturgy/HoursComponent'
import Completes from './SpecificHourLiturgy/NightPrayerComponent'
import {CurrentSettings, CurrentHoursLiturgy} from '../../Services/DataService';
import GlobalFunctions from '../../Utils/GlobalFunctions';

export default class HoursLiturgyPrayerScreen extends Component {

  UNSAFE_componentWillMount() {
    this.screen_props = this.props.route.params.props;
    this.eventEmitter = this.screen_props.events;
    this.titles = this.getTitles();
    this.setState({type: this.screen_props.type})
  }

  render() {
    return (
      <View style={GlobalFunctions.getStyle("CONTAINER", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled)}>
        <ScrollView automaticallyAdjustContentInsets={false}>
          <View style={{paddingHorizontal: 10, paddingTop: 10}}>
            {this.liturgyComponent(this.state.type)}
          </View>
        </ScrollView>
      </View>
    )
  }

  getTitles(){
    const titles = [];

    titles.push(CurrentHoursLiturgy.Office.FirstPsalm.Title);
    titles.push(CurrentHoursLiturgy.Office.SecondPsalm.Title);
    titles.push(CurrentHoursLiturgy.Office.ThirdPsalm.Title);
    titles.push(CurrentHoursLiturgy.Laudes.FirstPsalm.Title);
    titles.push(CurrentHoursLiturgy.Laudes.ThirdPsalm.Title);
    titles.push(CurrentHoursLiturgy.Vespers.FirstPsalm.Title);
    titles.push(CurrentHoursLiturgy.Vespers.SecondPsalm.Title);
    titles.push(CurrentHoursLiturgy.NightPrayer.FirstPsalm.Title);

    if(CurrentHoursLiturgy.NightPrayer.HasMultiplePsalms){
      titles.push(CurrentHoursLiturgy.NightPrayer.SecondPsalm.Title);
    }
    return titles;
  }

  liturgyComponent(type){
    switch (type) {
      case 'Ofici':
        return(
          <Ofici
            titols={this.titles}
            setNumSalmInv={this.screen_props.setNumSalmInv}
            events={this.eventEmitter}/>
          )
        
        case 'Laudes':
          return(
            <Laudes
              titols={this.titles}
              setNumSalmInv={this.screen_props.setNumSalmInv}
              events={this.eventEmitter}/>
            )

          case 'Vespres':
            return(
              <Vespres
                events={this.eventEmitter}/>
              )

          case 'Tèrcia':
            return(
            <HoraMenor
              HM = {type}
              HORA_MENOR = {CurrentHoursLiturgy.Hours.ThirdHour}
              events={this.eventEmitter}/>
            )

          case 'Sexta':
            return(
              <HoraMenor
                HM = {type}
                HORA_MENOR = {CurrentHoursLiturgy.Hours.SixthHour}
                events={this.eventEmitter}/>
              )

          case 'Nona':
            return(
              <HoraMenor
                HM = {type}
                HORA_MENOR = {CurrentHoursLiturgy.Hours.NinthHour}
                events={this.eventEmitter}/>
              )

          case 'Completes':
            return(
              <Completes
                setNumAntMare={this.screen_props.setNumAntMare}
                events={this.eventEmitter}/>
              )

        default: 
          return(<Text style={styles.normalText}>{this.screen_props.type}</Text>)
    }
  }
}

const styles = StyleSheet.create({
  normalText: {
    textAlign: 'center',
    color: '#000000',
    fontWeight: '300'
  }
})

import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet, Platform, TouchableOpacity} from 'react-native';

import Ofici from './OracioDisplay/OficiDisplay'
import Laudes from './OracioDisplay/LaudesDisplay'
import Vespres from './OracioDisplay/VespresDisplay'
import HoraMenor from './OracioDisplay/HoraMenorDisplay'
import Completes from './OracioDisplay/CompletesDisplay'
import {GlobalData, HoursLiturgyData} from '../../../Services/DataService';
import GF from '../../../Globals/GlobalFunctions';

export default class LHDisplayScreen extends Component {
  UNSAFE_componentWillMount(){
    this.screen_props = this.props.route.params.props;
    this.eventEmitter = this.screen_props.events;
    this.titols = this.getTitols();
    this.setState({type: this.screen_props.type})
  }

  componentWillUnmount(){
  }

  componentDidMount(){
    /*if(this.screen_props.superTestMode){
      setTimeout(() => {
        this.setState({type: 'Laudes'});
      }, 1000);
    }*/
  }

  componentDidUpdate(){
    if(this.screen_props.superTestMode){
      if(this.state.type === 'Laudes') this.setState({type: 'Tèrcia'});
      else if(this.state.type === 'Tèrcia') this.setState({type: 'Sexta'});
      else if(this.state.type === 'Sexta') this.setState({type: 'Nona'});
      else if(this.state.type === 'Nona') this.setState({type: 'Vespres'});
      else if(this.state.type === 'Vespres') this.setState({type: 'Completes'});
      else if(this.state.type === 'Completes') {
        this.screen_props.nextDayTestCB();
        this.screen_props.navigator.pop();
      }
    }
  }

  render() {
    return (
      <View style={GF.getStyle("CONTAINER", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled)}>
        <ScrollView automaticallyAdjustContentInsets={false}>
          <View style={{paddingHorizontal: 10, paddingTop: 10}}>
            {this.liturgicComponent(this.state.type)}
          </View>
        </ScrollView>
      </View>
    )
  }

  testErrorCB(){
    if(this.screen_props.superTestMode){
      this.screen_props.testErrorCallBack();
    }
  }

  saveShareTextCB(shareText){
    this.screen_props.saveSharedTextCB(shareText);
  }

  getTitols(){
    var titols = [];

    titols.push(HoursLiturgyData.ofici.titol1);
    titols.push(HoursLiturgyData.ofici.titol2);
    titols.push(HoursLiturgyData.ofici.titol3);
    titols.push(HoursLiturgyData.laudes.titol1);
    titols.push(HoursLiturgyData.laudes.titol3);
    titols.push(HoursLiturgyData.vespres.titol1);
    titols.push(HoursLiturgyData.vespres.titol2);
    titols.push(HoursLiturgyData.completes.titol1);
    titols.push(HoursLiturgyData.completes.titol2);

    return titols;
  }

  liturgicComponent(type){
    switch (type) {
      case 'Ofici':
        return(
          <Ofici
            superTestMode = {this.screen_props.superTestMode}
            testErrorCB={this.testErrorCB.bind(this)}
            titols={this.titols}
            setNumSalmInv={this.screen_props.setNumSalmInv}
            events={this.eventEmitter}/>
          )
        break;
        
        case 'Laudes':
          return(
            <Laudes
              superTestMode = {this.screen_props.superTestMode}
              testErrorCB={this.testErrorCB.bind(this)}
              titols={this.titols}
              setNumSalmInv={this.screen_props.setNumSalmInv}
              events={this.eventEmitter}/>
            )
          break;

          case 'Vespres':
            return(
              <Vespres
                superTestMode = {this.screen_props.superTestMode}
                testErrorCB={this.testErrorCB.bind(this)}
                events={this.eventEmitter}/>
              )
            break;

          case 'Tèrcia':
            return(
            <HoraMenor
              HM = {type}
              HORA_MENOR = {HoursLiturgyData.tercia}
              superTestMode = {this.screen_props.superTestMode}
              testErrorCB={this.testErrorCB.bind(this)}
              events={this.eventEmitter}/>
            )
          break;

          case 'Sexta':
            return(
              <HoraMenor
                HM = {type}
                HORA_MENOR = {HoursLiturgyData.sexta}
                superTestMode = {this.screen_props.superTestMode}
                testErrorCB={this.testErrorCB.bind(this)}
                events={this.eventEmitter}/>
              )
            break;

          case 'Nona':
            return(
              <HoraMenor
                HM = {type}
                HORA_MENOR = {HoursLiturgyData.nona}
                superTestMode = {this.screen_props.superTestMode}
                testErrorCB={this.testErrorCB.bind(this)}
                events={this.eventEmitter}/>
              )
            break;

          case 'Completes':
            return(
              <Completes
                superTestMode = {this.screen_props.superTestMode}
                testErrorCB={this.testErrorCB.bind(this)}
                setNumAntMare={this.screen_props.setNumAntMare}
                events={this.eventEmitter}/>
              )
            break;

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

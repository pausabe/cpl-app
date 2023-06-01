import React, { Component } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import HoursLiturgyButtonsComponent from './HoursLiturgyButtonsComponent';
import {CurrentHoursLiturgy, CurrentSettings} from "../../Services/Data/DataService";
import MainViewBase from '../MainViewBase';

export default class HoursLiturgyPrayerMainScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => this.forceUpdate());
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  LHButtonCB(type, superTestMode) {
    let title = type;
    if (type === 'Ofici') title = 'Ofici de lectura';

    const params = {
      title: title,
      props: {
        superTestMode: superTestMode,
        nextDayTestCB: this.nextDayTest.bind(this),
        setNumSalmInv: this.setNumSalmInv.bind(this),
        setNumAntMare: this.setNumAntMare.bind(this),
        type: type,
        events: this.eventEmitter
      },
    };
    this.props.navigation.navigate('LHDisplay', params);
  }

  nextDayTest() {

  }

  setNumSalmInv(numSalm) {
    CurrentSettings.InvitationPsalmOption = numSalm;
  }

  setNumAntMare(numAntMare) {
    CurrentSettings.VirginAntiphonOption = numAntMare;
  }

  render() {
    return MainViewBase.BaseContainer(!CurrentHoursLiturgy.Vespers ? null :
        <View style={styles.liturgiaContainer}>
          <HoursLiturgyButtonsComponent
            oficiCB={this.LHButtonCB.bind(this, "Ofici", false)}
            laudesCB={this.LHButtonCB.bind(this, "Laudes", false)}
            terciaCB={this.LHButtonCB.bind(this, "Tèrcia", false)}
            sextaCB={this.LHButtonCB.bind(this, "Sexta", false)}
            nonaCB={this.LHButtonCB.bind(this, "Nona", false)}
            vespresCB={this.LHButtonCB.bind(this, "Vespres", false)}
            completesCB={this.LHButtonCB.bind(this, "Completes", false)} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  liturgiaContainer: {
    flex: 6,
    margin: 30,
  },
});

import React, { Component } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import HoursLiturgyButtonsComponent from './HoursLiturgyButtonsComponent';
import GlobalKeys from '../../Utils/GlobalKeys';
import {CurrentHoursLiturgy, CurrentSettings} from "../../Services/Data/DataService";

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
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: GlobalKeys.screensBackgroundColor }}>
          {
            <ImageBackground source={require('../../Assets/img/bg/home_background.jpg')} style={styles.backgroundImage} blurRadius={5}>
              {CurrentHoursLiturgy.Vespers === undefined ?
                null :
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
              }
            </ImageBackground>
          }
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  liturgiaContainer: {
    flex: 6,
    margin: 30,
  },
  backgroundImage: {
    flex: 1,
    backgroundColor: 'rgb(5, 169, 176)',
    width: null,
    height: null,
  },
});

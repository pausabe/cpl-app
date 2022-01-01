import React, { Component } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import LHButtons from './LHButtons';
import GLOBALS from '../../Globals/Globals';

export default class LHScreen extends Component {
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
    var title = type;
    if (type === 'Ofici') title = 'Ofici de lectura';

    var params = {
      title: title,
      props: {
        superTestMode: superTestMode,
        testErrorCallBack: this.testErrorCallBack.bind(this),
        nextDayTestCB: this.nextDayTest.bind(this),
        setNumSalmInv: this.setNumSalmInv.bind(this),
        setNumAntMare: this.setNumAntMare.bind(this),
        type: type,
        events: this.eventEmitter
      },
    }
    this.props.navigation.navigate('LHDisplay', params);
  }

  nextDayTest() {

  }

  setNumSalmInv(numSalm) {
    G_VALUES.numSalmInv = numSalm;
  }

  setNumAntMare(numAntMare) {
    G_VALUES.numAntMare = numAntMare;
  }

  testErrorCallBack() {
    /*this.setState({testInfo: "something went wrong (bad text)"});
    this.testing = false;*/
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: GLOBALS.screensBackgroundColor }}>
          {
            <ImageBackground source={require('../../Globals/img/bg/home_background.jpg')} style={styles.backgroundImage} blurRadius={5}>
              {LH_VALUES.vespres == undefined ?
                null :
                <View style={styles.liturgiaContainer}>
                  <LHButtons
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

import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import HoursLiturgyButtonsComponent from './HoursLiturgyButtonsComponent';
import GlobalKeys from '../../Utils/GlobalKeys';
import {CurrentHoursLiturgy} from "../../Services/DataService";

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

  LHButtonCB(type) {
    let title = type;
    if (type === 'Ofici') title = 'Ofici de lectura';
    this.props.navigation.navigate('LHDisplay', { type: type, title: title });
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: GlobalKeys.screensBackgroundColor }}>
          {
            <ImageBackground source={require('../../Assets/img/bg/home_background.jpg')} style={styles.backgroundImage} blurRadius={5}>
              {CurrentHoursLiturgy.Vespers === undefined ?
                null :
                <View style={styles.liturgiaContainer}>
                  <HoursLiturgyButtonsComponent
                    oficiCB={this.LHButtonCB.bind(this, "Ofici")}
                    laudesCB={this.LHButtonCB.bind(this, "Laudes")}
                    terciaCB={this.LHButtonCB.bind(this, "Tèrcia")}
                    sextaCB={this.LHButtonCB.bind(this, "Sexta")}
                    nonaCB={this.LHButtonCB.bind(this, "Nona")}
                    vespresCB={this.LHButtonCB.bind(this, "Vespres")}
                    completesCB={this.LHButtonCB.bind(this, "Completes")} />
                </View>
              }
            </ImageBackground>
          }
      </View>
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

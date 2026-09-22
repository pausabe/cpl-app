import React, { Component } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import Ofici from './SpecificHourLiturgy/OfficeComponent'
import Laudes from './SpecificHourLiturgy/LaudesComponent'
import Vespres from './SpecificHourLiturgy/VespersComponent'
import HoraMenor from './SpecificHourLiturgy/HoursComponent'
import Completes from './SpecificHourLiturgy/NightPrayerComponent'
import Gap from '../../Components/Gap';
import { ThemeContext, prayerTextStyles } from '../../Theme';

// While a prayer is open the screen does not go off
const KEEP_AWAKE_TAG = 'hours-prayer';

// One hour of the Liturgy of the Hours. Everything comes through props from its controller
// (Controllers/PrayerController): the hours of the day (hours), the day (today), the settings and
// what to do when the user picks another invitatory psalm or Marian antiphon. When the home says
// something under the name of the hour (celebration: the first Vespers of tomorrow's feast), it
// goes on top, whole, as the heading of the prayer.
export default class HoursLiturgyPrayerScreen extends Component {
  static contextType = ThemeContext;

  componentDidMount() {
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
  }

  componentWillUnmount() {
    Promise.resolve(deactivateKeepAwake(KEEP_AWAKE_TAG)).catch(() => {});
  }

  render() {
    const theme = this.context;
    return (
      <SafeAreaView edges={["bottom"]} style={prayerTextStyles(theme).container}>
        <ScrollView automaticallyAdjustContentInsets={false} contentContainerStyle={styles.content}>
          <View style={[styles.column, { maxWidth: theme.layout.readingMaxWidth }]}>
            {this.props.celebration ?
              <Text
                testID="hour-celebration"
                selectable={true}
                accessibilityRole="header"
                style={prayerTextStyles(theme).centeredTitle}>
                {this.props.celebration}
              </Text>
              : null}
            {this.props.celebration ? <Gap/> : null}
            {this.liturgyComponent(this.props.type)}
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  // The titles of the psalms of the day: an invitatory psalm that is already one of them is not
  // offered (GlobalViewFunctions.salmInvExists)
  getTitles(){
    const hours = this.props.hours;
    const titles = [];

    titles.push(hours.Office.FirstPsalm.Title);
    titles.push(hours.Office.SecondPsalm.Title);
    titles.push(hours.Office.ThirdPsalm.Title);
    titles.push(hours.Laudes.FirstPsalm.Title);
    titles.push(hours.Laudes.ThirdPsalm.Title);
    titles.push(hours.Vespers.FirstPsalm.Title);
    titles.push(hours.Vespers.SecondPsalm.Title);
    titles.push(hours.NightPrayer.FirstPsalm.Title);

    if(hours.NightPrayer.HasMultiplePsalms){
      titles.push(hours.NightPrayer.SecondPsalm.Title);
    }
    return titles;
  }

  liturgyComponent(type){
    const common = {
      hours: this.props.hours,
      today: this.props.today,
      settings: this.props.settings,
    };
    switch (type) {
      case 'Ofici':
        return(
          <Ofici
            {...common}
            titols={this.getTitles()}
            onInvitationPsalmChange={this.props.onInvitationPsalmChange}/>
        )

      case 'Laudes':
        return(
          <Laudes
            {...common}
            titols={this.getTitles()}
            onInvitationPsalmChange={this.props.onInvitationPsalmChange}/>
        )

      case 'Vespres':
        return(<Vespres {...common}/>)

      case 'Tèrcia':
        return(<HoraMenor {...common} HM={type} HORA_MENOR={this.props.hours.Hours.ThirdHour}/>)

      case 'Sexta':
        return(<HoraMenor {...common} HM={type} HORA_MENOR={this.props.hours.Hours.SixthHour}/>)

      case 'Nona':
        return(<HoraMenor {...common} HM={type} HORA_MENOR={this.props.hours.Hours.NinthHour}/>)

      case 'Completes':
        return(
          <Completes
            {...common}
            onVirginAntiphonChange={this.props.onVirginAntiphonChange}/>
        )

      default:
        return(<Text style={prayerTextStyles(this.context).black}>{type}</Text>)
    }
  }
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  column: {
    width: '100%',
    alignSelf: 'center',
  },
})

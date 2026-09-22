import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import Ofici from './specific-hour-liturgy/OfficeComponent';
import Laudes from './specific-hour-liturgy/LaudesComponent';
import Vespres from './specific-hour-liturgy/VespersComponent';
import HoraMenor from './specific-hour-liturgy/HoursComponent';
import Completes from './specific-hour-liturgy/NightPrayerComponent';
import Gap from '../../components/Gap';
import EdgeToEdgeScrollView from '../../components/EdgeToEdgeScrollView';
import { ThemeContext, prayerTextStyles } from '../../theme';

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
      <View style={prayerTextStyles(theme).container}>
        <EdgeToEdgeScrollView testID="prayer-scroll" contentContainerStyle={styles.content}>
          <View style={[styles.column, { maxWidth: theme.layout.readingMaxWidth }]}>
            {this.props.celebration ? (
              <Text
                testID="hour-celebration"
                selectable={true}
                accessibilityRole="header"
                style={prayerTextStyles(theme).centeredTitle}
              >
                {this.props.celebration}
              </Text>
            ) : null}
            {this.props.celebration ? <Gap /> : null}
            {this.liturgyComponent(this.props.type)}
          </View>
        </EdgeToEdgeScrollView>
      </View>
    );
  }

  // The titles of the psalms of the day: an invitatory psalm that is already one of them is not
  // offered (GlobalViewFunctions.salmInvExists)
  getTitles() {
    const hours = this.props.hours;
    const titles = [];

    titles.push(hours.office.firstPsalm.title);
    titles.push(hours.office.secondPsalm.title);
    titles.push(hours.office.thirdPsalm.title);
    titles.push(hours.laudes.firstPsalm.title);
    titles.push(hours.laudes.thirdPsalm.title);
    titles.push(hours.vespers.firstPsalm.title);
    titles.push(hours.vespers.secondPsalm.title);
    titles.push(hours.nightPrayer.firstPsalm.title);

    if (hours.nightPrayer.hasMultiplePsalms) {
      titles.push(hours.nightPrayer.secondPsalm.title);
    }
    return titles;
  }

  liturgyComponent(type) {
    const common = {
      hours: this.props.hours,
      today: this.props.today,
      settings: this.props.settings,
    };
    switch (type) {
      case 'Ofici':
        return (
          <Ofici {...common} titols={this.getTitles()} onInvitationPsalmChange={this.props.onInvitationPsalmChange} />
        );

      case 'Laudes':
        return (
          <Laudes {...common} titols={this.getTitles()} onInvitationPsalmChange={this.props.onInvitationPsalmChange} />
        );

      case 'Vespres':
        return <Vespres {...common} />;

      case 'Tèrcia':
        return <HoraMenor {...common} HM={type} HORA_MENOR={this.props.hours.hours.thirdHour} />;

      case 'Sexta':
        return <HoraMenor {...common} HM={type} HORA_MENOR={this.props.hours.hours.sixthHour} />;

      case 'Nona':
        return <HoraMenor {...common} HM={type} HORA_MENOR={this.props.hours.hours.ninthHour} />;

      case 'Completes':
        return <Completes {...common} onVirginAntiphonChange={this.props.onVirginAntiphonChange} />;

      default:
        return <Text style={prayerTextStyles(this.context).black}>{type}</Text>;
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
});

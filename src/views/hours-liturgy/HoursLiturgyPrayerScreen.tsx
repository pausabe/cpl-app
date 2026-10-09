import React from 'react';
import { View, StyleSheet } from 'react-native';
import OfficeComponent from './specific-hour-liturgy/OfficeComponent';
import LaudesComponent from './specific-hour-liturgy/LaudesComponent';
import VespersComponent from './specific-hour-liturgy/VespersComponent';
import HoursComponent from './specific-hour-liturgy/HoursComponent';
import NightPrayerComponent from './specific-hour-liturgy/NightPrayerComponent';
import Gap from '../../components/Gap';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../components/PrayerText';
import EdgeToEdgeScrollView from '../../components/EdgeToEdgeScrollView';
import { prayerTextStyles, useTheme } from '../../theme';
import { useKeepAwake } from '../keepAwake';
import type HoursLiturgy from '../../models/hours-liturgy/HoursLiturgy';
import type { MassGospel } from '../../models/MassLiturgy';
import type { HourProps } from './specific-hour-liturgy/hourProps';

interface HoursLiturgyPrayerScreenProps extends HourProps {
  // "Ofici", "Laudes", "Tèrcia"…
  type: string;
  celebration?: string;
  // Lauds only: the Gospel of the day to read after the short responsory, when the setting is on
  laudesGospel?: MassGospel | null;
  onInvitationPsalmChange: (psalmNumber: string) => void;
  onVirginAntiphonChange: (antiphonNumber: string) => void;
}

// One hour of the Liturgy of the Hours. Everything comes through props from its controller
// (Controllers/PrayerController): the hours of the day (hours), the day (today), the settings, the
// Gospel Lauds takes when it is asked to (laudesGospel), whether the Dies iræ is chosen (diesIrae)
// and what to do when the user picks another invitatory psalm or Marian antiphon. When the home says something under the name of the hour
// (celebration: the first Vespers of tomorrow's feast), it goes on top, whole, as the heading of
// the prayer.
export default function HoursLiturgyPrayerScreen(props: HoursLiturgyPrayerScreenProps) {
  const theme = useTheme();
  useKeepAwake('hours-prayer');

  return (
    <View style={prayerTextStyles(theme).container}>
      <EdgeToEdgeScrollView testID="prayer-scroll" contentContainerStyle={styles.content}>
        <View style={[styles.column, { maxWidth: theme.layout.readingMaxWidth }]}>
          {props.celebration ? (
            <Text
              testID="hour-celebration"
              selectable={true}
              accessibilityRole="header"
              style={prayerTextStyles(theme).centeredTitle}
            >
              {props.celebration}
            </Text>
          ) : null}
          {props.celebration ? <Gap /> : null}
          <Hour {...props} />
        </View>
      </EdgeToEdgeScrollView>
    </View>
  );
}

// The titles of the psalms of the day: an invitatory psalm that is already one of them is not
// offered (canBeInvitatoryPsalm)
function titlesOf(hours: HoursLiturgy): string[] {
  const titles = [
    hours.office.firstPsalm.title,
    hours.office.secondPsalm.title,
    hours.office.thirdPsalm.title,
    hours.laudes.firstPsalm.title,
    hours.laudes.thirdPsalm.title,
    hours.vespers.firstPsalm.title,
    hours.vespers.secondPsalm.title,
    hours.nightPrayer.firstPsalm.title,
  ];
  if (hours.nightPrayer.hasMultiplePsalms) {
    titles.push(hours.nightPrayer.secondPsalm.title);
  }
  return titles;
}

function Hour({
  type,
  hours,
  today,
  settings,
  laudesGospel,
  diesIrae,
  onInvitationPsalmChange,
  onVirginAntiphonChange,
}: HoursLiturgyPrayerScreenProps) {
  const theme = useTheme();
  const common = { hours, today, settings };
  // The three hours that may say the Dies iræ
  const withDiesIrae = { ...common, diesIrae };
  switch (type) {
    case 'Ofici':
      return (
        <OfficeComponent {...withDiesIrae} titles={titlesOf(hours)} onInvitationPsalmChange={onInvitationPsalmChange} />
      );

    case 'Laudes':
      return (
        <LaudesComponent
          {...withDiesIrae}
          titles={titlesOf(hours)}
          onInvitationPsalmChange={onInvitationPsalmChange}
          gospel={laudesGospel}
        />
      );

    case 'Vespres':
      return <VespersComponent {...withDiesIrae} />;

    case 'Tèrcia':
      return <HoursComponent {...common} minorHourName={type} minorHour={hours.hours.thirdHour} />;

    case 'Sexta':
      return <HoursComponent {...common} minorHourName={type} minorHour={hours.hours.sixthHour} />;

    case 'Nona':
      return <HoursComponent {...common} minorHourName={type} minorHour={hours.hours.ninthHour} />;

    case 'Completes':
      return <NightPrayerComponent {...common} onVirginAntiphonChange={onVirginAntiphonChange} />;

    default:
      return <Text style={prayerTextStyles(theme).black}>{type}</Text>;
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

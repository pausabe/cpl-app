import React from 'react';
import { View } from 'react-native';
import Gap from '../../components/Gap';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../components/PrayerText';
import { trimmedText as trim } from '../../utils/prayerText';
import type { PrayerTextStyles } from '../../theme';
import type { MassGospel } from '../../models/MassLiturgy';

// A Gospel as the Mass reads it: its reference, the phrase that sums it up when it has one, its
// title and its text. Lauds draws it the same way when it takes the Gospel of the day: the same
// words in the same voice are the same audio, already made for the Mass.
export function gospelReading(styles: PrayerTextStyles, gospel: MassGospel) {
  const comment = trim(gospel.comment);
  return (
    <View style={{ flex: 1 }}>
      <Text selectable={true} style={styles.reference}>
        {trim(gospel.quote)}
      </Text>
      <Gap />
      {comment === '-' ? null : (
        <View>
          <Text selectable={true} style={styles.comment}>
            {comment}
          </Text>
          <Gap />
        </View>
      )}
      <Text selectable={true} style={styles.black}>
        {trim(gospel.title)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackJustified}>
        {trim(gospel.gospel)}
      </Text>
    </View>
  );
}

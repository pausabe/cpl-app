import React from 'react';
import PrayerFlow from '../../../components/PrayerFlow';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../../components/PrayerText';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import * as Logger from '../../../utils/logger';
import {
  completePrayer,
  intercessionsOf,
  withoutPsalmMarks,
  withoutStraySpaces as rs,
} from '../../../utils/prayerText';
import { prayerTextStyles, useTheme } from '../../../theme';
import {
  antiphonedPsalm,
  intercessions,
  opening,
  psalmody,
  section,
  shortReading,
  shortResponsory,
} from '../hourBlocks';
import type { HourProps } from './hourProps';

// Vespers. Gets the hours of the day (hours) and the day (today) through props.
export default function VespersComponent({ hours, today }: HourProps) {
  const styles = prayerTextStyles(useTheme());

  // Everything the hour shows goes through the flow, which sews the paragraphs that follow one
  // another into a single text: that way a selection can go from one to the next
  return <PrayerFlow>{content()}</PrayerFlow>;

  function content() {
    try {
      const vespers = hours.vespers;
      return (
        <>
          {opening(styles, today.specificLiturgyTime)}
          {section(
            'HIMNE',
            <Text selectable={true} style={styles.black}>
              {rs(vespers.anthem)}
            </Text>,
          )}
          {section('SALMÒDIA', psalmody(styles, [vespers.firstPsalm, vespers.secondPsalm, vespers.thirdPsalm]))}
          {section('LECTURA BREU', shortReading(styles, vespers.shortReading))}
          {section('RESPONSORI BREU', shortResponsory(vespers.shortResponsory))}
          {section(
            'CÀNTIC DE MARIA',
            antiphonedPsalm(
              styles,
              rs(vespers.evangelicalAntiphon),
              'Càntic\nLc 1, 46-55\nLa meva ànima magnifica el Senyor',
              withoutPsalmMarks(vespers.evangelicalChant),
            ),
          )}
          {section(
            'PREGÀRIES',
            intercessions(styles, intercessionsOf(vespers.prayers, 'vespers', hours.concreteNamesInPrayers)),
          )}
          {section(
            'ORACIÓ',
            <>
              <Text selectable={true} style={styles.black}>
                {completePrayer(rs(vespers.finalPrayer), false)}
              </Text>
              <Rubric label={'R.'}>{' Amén.'}</Rubric>
            </>,
          )}
          {section(
            'CONCLUSIÓ',
            <>
              <Rubric label={'V.'}>
                {' Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.'}
              </Rubric>
              <Rubric label={'R.'}>{' Amén.'}</Rubric>
            </>,
          )}
          <Gap />
        </>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'render', error as Error);
      return null;
    }
  }
}

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
  withoutTrailingSpace as rs,
} from '../../../utils/prayerText';
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { prayerTextStyles, useTheme } from '../../../theme';
import {
  antiphonedPsalm,
  intercessions,
  invitatoryOrOpening,
  psalmody,
  section,
  shortReading,
  shortResponsory,
  useInvitatory,
} from '../hourBlocks';
import type { InvitatoryHourProps } from './hourProps';

// Lauds. Gets through props the hours of the day (hours), the day (today), the settings and the
// titles of the day's psalms (titles); a new invitatory psalm goes to onInvitationPsalmChange.
export default function LaudesComponent({
  hours,
  today,
  settings,
  titles,
  onInvitationPsalmChange,
}: InvitatoryHourProps) {
  const styles = prayerTextStyles(useTheme());
  const invitatory = useInvitatory(settings, titles, onInvitationPsalmChange);

  // Everything the hour shows goes through the flow, which sews the paragraphs that follow one
  // another into a single text: that way a selection can go from one to the next
  return <PrayerFlow>{content()}</PrayerFlow>;

  function content() {
    try {
      const laudes = hours.laudes;
      return (
        <>
          {invitatoryOrOpening(styles, {
            time: today.specificLiturgyTime,
            invitation: hours.invitation,
            titles,
            invitatory,
            alwaysInvitatory: today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday,
          })}
          {section(
            'HIMNE',
            <Text selectable={true} style={styles.black}>
              {rs(laudes.anthem)}
            </Text>,
          )}
          {section('SALMÒDIA', psalmody(styles, [laudes.firstPsalm, laudes.secondPsalm, laudes.thirdPsalm]))}
          {section('LECTURA BREU', shortReading(styles, laudes.shortReading))}
          {section('RESPONSORI BREU', shortResponsory(laudes.shortResponsory))}
          {section(
            'CÀNTIC DE ZACARIES',
            antiphonedPsalm(
              styles,
              rs(laudes.evangelicalAntiphon),
              'Càntic\nLc 1, 68-79\nEl Messies i el seu Precursor',
              withoutPsalmMarks(laudes.evangelicalChant),
            ),
          )}
          {section(
            'PREGÀRIES',
            intercessions(styles, intercessionsOf(laudes.prayers, 'laudes', hours.concreteNamesInPrayers)),
          )}
          {section(
            'ORACIÓ',
            <>
              <Text selectable={true} style={styles.black}>
                {completePrayer(rs(laudes.finalPrayer), false)}
              </Text>
              <Rubric label={'R.'}>{' Amén.'}</Rubric>
            </>,
          )}
          {section(
            'CONCLUSIÓ',
            <>
              <Rubric label={'V. '}>
                {'Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.'}
              </Rubric>
              <Rubric label={'R. '}>{'Amén.'}</Rubric>
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

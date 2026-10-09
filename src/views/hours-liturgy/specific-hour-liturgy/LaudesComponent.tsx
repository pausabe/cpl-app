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
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { prayerTextStyles, useTheme } from '../../../theme';
import {
  antiphonedPsalm,
  hymn,
  intercessions,
  invitatoryOrOpening,
  psalmody,
  section,
  shortReading,
  shortResponsory,
  useInvitatory,
} from '../hourBlocks';
import { gospelReading } from '../../mass-liturgy/gospelReading';
import type { InvitatoryHourProps } from './hourProps';
import type { MassGospel } from '../../../models/MassLiturgy';

interface LaudesProps extends InvitatoryHourProps {
  // The Gospel of the day, when «Evangeli del dia a Laudes» is on (ViewModels/laudesGospel)
  gospel?: MassGospel | null;
}

// Lauds. Gets through props the hours of the day (hours), the day (today), the settings, the
// titles of the day's psalms (titles) and the Gospel of the day to read after the short
// responsory (gospel), if any; a new invitatory psalm goes to onInvitationPsalmChange.
export default function LaudesComponent({
  hours,
  today,
  settings,
  titles,
  onInvitationPsalmChange,
  gospel = null,
  diesIrae,
}: LaudesProps) {
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
          {section('HIMNE', hymn(styles, laudes.anthem, laudes.diesIraeAnthem, diesIrae))}
          {section('SALMÒDIA', psalmody(styles, [laudes.firstPsalm, laudes.secondPsalm, laudes.thirdPsalm]))}
          {section('LECTURA BREU', shortReading(styles, laudes.shortReading))}
          {section('RESPONSORI BREU', shortResponsory(laudes.shortResponsory))}
          {gospel ? section('EVANGELI', gospelReading(styles, gospel)) : null}
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

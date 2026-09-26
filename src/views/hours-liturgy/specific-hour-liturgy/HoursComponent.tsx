import React from 'react';
import PrayerFlow from '../../../components/PrayerFlow';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../../components/PrayerText';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import * as Logger from '../../../utils/logger';
import { completePrayer, withoutTrailingSpace as rs } from '../../../utils/prayerText';
import { PrayerTextStyles, prayerTextStyles, useTheme } from '../../../theme';
import { opening, psalmBody, psalmComment, section, shortReading } from '../hourBlocks';
import type { SpecificHour } from '../../../models/hours-liturgy/Hours';
import type { HourProps } from './hourProps';

interface MinorHourProps extends HourProps {
  minorHourName: string;
  minorHour: SpecificHour;
}

// A minor hour: Terce, Sext or None. Gets the hour (minorHour) and the day (today) through props.
export default function HoursComponent({ today, minorHour }: MinorHourProps) {
  const styles = prayerTextStyles(useTheme());

  // Everything the hour shows goes through the flow, which sews the paragraphs that follow one
  // another into a single text: that way a selection can go from one to the next
  return <PrayerFlow>{content()}</PrayerFlow>;

  function content() {
    try {
      return (
        <>
          {opening(styles, today.specificLiturgyTime)}
          {section(
            'HIMNE',
            <Text selectable={true} style={styles.black}>
              {rs(minorHour.anthem)}
            </Text>,
          )}
          {section('SALMÒDIA', psalmody(styles, minorHour))}
          {section(
            'LECTURA BREU',
            <>
              {shortReading(styles, minorHour.shortReading)}
              <Gap />
              <Rubric label={'V. '}>{rs(minorHour.responsory.versicle)}</Rubric>
              <Rubric label={'R. '}>{rs(minorHour.responsory.response)}</Rubric>
            </>,
          )}
          {section(
            'ORACIÓ',
            <>
              <Text selectable={true} style={styles.blackBold}>
                {'Preguem.'}
              </Text>
              <Text selectable={true} style={styles.black}>
                {completePrayer(rs(minorHour.finalPrayer), true)}
              </Text>
              <Rubric label={'R. '}>{'Amén.'}</Rubric>
            </>,
          )}
          {section(
            'CONCLUSIÓ',
            <>
              <Rubric label={'V. '}>{'Beneïm el Senyor.'}</Rubric>
              <Rubric label={'R. '}>{'Donem gràcies a Déu.'}</Rubric>
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

// The three psalms, each between its own antiphon; or, when the hour has only one antiphon, the
// three together between it
function psalmody(styles: PrayerTextStyles, hour: SpecificHour) {
  const multiple = hour.hasMultipleAntiphons;
  const psalms = [hour.firstPsalm, hour.secondPsalm, hour.thirdPsalm];
  return (
    <>
      {psalms.map((psalm, index) => {
        const label = multiple ? `Ant. ${index + 1}. ` : 'Ant. ';
        const antiphon = multiple ? rs(psalm.antiphon) : rs(hour.uniqueAntiphon);
        const first = index === 0;
        const last = index === psalms.length - 1;
        return (
          <React.Fragment key={index}>
            {multiple || first ? (
              <>
                <Rubric label={label}>{antiphon}</Rubric>
                <Gap />
              </>
            ) : null}
            {psalmBody(styles, {
              title: rs(psalm.title),
              comment: psalmComment(psalm),
              psalm: psalm.psalm,
              hasGloryPrayer: psalm.hasGloryPrayer,
            })}
            <Gap />
            {multiple || last ? <Rubric label={label}>{antiphon}</Rubric> : null}
            {multiple && !last ? <Gap /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

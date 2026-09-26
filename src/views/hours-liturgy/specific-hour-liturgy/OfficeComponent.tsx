import React from 'react';
import PrayerFlow from '../../../components/PrayerFlow';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../../components/PrayerText';
import HR from '../../../components/HRComponent';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import * as Logger from '../../../utils/logger';
import {
  completePrayer,
  responsoryTogether,
  withoutPsalmMarks,
  withoutTrailingSpace as rs,
} from '../../../utils/prayerText';
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { PrayerTextStyles, prayerTextStyles, useTheme } from '../../../theme';
import { antiphonedPsalm, invitatoryOrOpening, psalmody, section, useInvitatory } from '../hourBlocks';
import type Office from '../../../models/hours-liturgy/Office';
import type { Psalm, ReadingOfTheOffice } from '../../../models/liturgy-masters/CommonParts';
import type { InvitatoryHourProps } from './hourProps';

// The Office of Readings. Gets through props the hours of the day (hours), the day (today), the
// settings and the titles of the day's psalms (titles); a new invitatory psalm goes to
// onInvitationPsalmChange.
export default function OfficeComponent({
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
      const office = hours.office;
      const conclusion = section(
        'CONCLUSIÓ',
        <>
          <Rubric label={'V. '}>{'Beneïm el Senyor.'}</Rubric>
          <Rubric label={'R. '}>{'Donem gràcies a Déu.'}</Rubric>
        </>,
      );

      if (today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
        return (
          <>
            <Text selectable={true} style={styles.redCenter}>
              {"La Vetlla pasqual substitueix avui l'Ofici de lectura."}
            </Text>
            <Gap />
            <Text selectable={true} style={styles.redCenter}>
              {
                "Els qui no participen en la solemne Vetlla pasqual n'escolliran almenys quatre lectures, amb els corresponents salms responsorials i oracions. Les lectures més adients són les que segueixen."
              }
            </Text>
            <Gap />
            <Text selectable={true} style={styles.redCenter}>
              {"L'Ofici comença directament per les lectures."}
            </Text>
            <Gap />
            <HR />
            <Gap />
            {easterSundayReadings(styles, office)}
            {teDeumHymn(styles, office)}
            {section(
              'ORACIÓ',
              <>
                {preguem(styles)}
                {finalPrayer(styles, office)}
              </>,
            )}
            {conclusion}
            <Gap />
          </>
        );
      }

      const nightHymn = today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary && office.isDarkAnthem;
      return (
        <>
          {invitatoryOrOpening(styles, {
            time: today.specificLiturgyTime,
            invitation: hours.invitation,
            titles,
            invitatory,
            alwaysInvitatory: false,
          })}
          {section(
            <>
              {'HIMNE'}
              {nightHymn ? ' (nit)' : ' (dia)'}
            </>,
            <Text selectable={true} style={styles.black}>
              {rs(office.anthem)}
            </Text>,
          )}
          {section('SALMÒDIA', psalmody(styles, [office.firstPsalm, office.secondPsalm, office.thirdPsalm]))}
          {section(
            'VERS',
            <>
              <Rubric label={'V. '}>{rs(office.responsory.versicle)}</Rubric>
              <Rubric label={'R. '}>{rs(office.responsory.response)}</Rubric>
            </>,
          )}
          {section('LECTURES', readings(styles, office))}
          {teDeumHymn(styles, office)}
          {section(
            'ORACIÓ',
            <>
              {preguem(styles)}
              {finalPrayer(styles, office)}
              <Rubric label={'R. '}>{'Amén.'}</Rubric>
            </>,
          )}
          {conclusion}
          <Gap />
        </>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'remder', error as Error);
      return null;
    }
  }
}

function preguem(styles: PrayerTextStyles) {
  return (
    <Text selectable={true} style={styles.blackBold}>
      {'Preguem.'}
    </Text>
  );
}

function finalPrayer(styles: PrayerTextStyles, office: Office) {
  return (
    <Text selectable={true} style={styles.black}>
      {completePrayer(rs(office.finalPrayer), false)}
    </Text>
  );
}

// A reading: which one it is, its reference and the quote under it (if it has one and it is
// shown), its title and its text
function reading(styles: PrayerTextStyles, name: string, reading: ReadingOfTheOffice, withQuote: boolean) {
  return (
    <>
      <Text selectable={true} style={styles.red}>
        {name}
      </Text>
      <Text selectable={true} style={styles.black}>
        {rs(reading.reference)}
      </Text>
      {withQuote && reading.quote !== '-' ? (
        <Text selectable={true} style={styles.red}>
          {rs(reading.quote)}
        </Text>
      ) : null}
      <Gap />
      <Text selectable={true} style={styles.redCenterBold}>
        {rs(reading.title)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackJustified}>
        {rs(reading.reading)}
      </Text>
    </>
  );
}

// The responsory after a reading
function readingResponsory(styles: PrayerTextStyles, reading: ReadingOfTheOffice) {
  const responsory = reading.responsory;
  return (
    <>
      <Text selectable={true} style={styles.red}>
        {'Responsori'}
      </Text>
      {responsory.quote !== '-' ? (
        <Text selectable={true} style={styles.red}>
          {rs(responsory.quote)}
        </Text>
      ) : null}
      <Rubric label={'R. '}>{responsoryTogether(rs(responsory.firstPart), rs(responsory.secondPart))}</Rubric>
      <Rubric label={'V. '}>{rs(responsory.thirdPart)}</Rubric>
      <Rubric label={'R. '}>{rs(responsory.secondPart)}</Rubric>
    </>
  );
}

// The two readings, each with its responsory. The quote under the second one is not shown.
function readings(styles: PrayerTextStyles, office: Office) {
  try {
    return (
      <>
        {reading(styles, 'Lectura primera', office.firstReading, true)}
        <Gap />
        {readingResponsory(styles, office.firstReading)}
        <Gap />
        {reading(styles, 'Lectura segona', office.secondReading, false)}
        <Gap />
        {readingResponsory(styles, office.secondReading)}
      </>
    );
  } catch (error) {
    Logger.logError(Logger.LogKeys.Screens, 'readings', error as Error);
    return null;
  }
}

// A psalm of the Easter Vigil said at the Office: whole, with its antiphon
function vigilPsalm(styles: PrayerTextStyles, psalm: Psalm) {
  return antiphonedPsalm(styles, rs(psalm.antiphon), rs(psalm.title), withoutPsalmMarks(rs(psalm.psalm)));
}

// The prayer after a psalm of the Vigil
function vigilPrayer(styles: PrayerTextStyles, psalm: Psalm) {
  return (
    <>
      {preguem(styles)}
      <Text selectable={true} style={styles.black}>
        {rs(psalm.prayer)}
      </Text>
      <Rubric label={'R. '}>{'Amén.'}</Rubric>
    </>
  );
}

// On Easter Sunday, four readings of the Vigil in place of the Office: the first three with their
// psalm, and a prayer after the first two
function easterSundayReadings(styles: PrayerTextStyles, office: Office) {
  return (
    <>
      {reading(styles, 'Lectura primera', office.firstReading, true)}
      <Gap />
      {vigilPsalm(styles, office.firstPsalm)}
      <Gap />
      {vigilPrayer(styles, office.firstPsalm)}
      <Gap />
      {reading(styles, 'Lectura segona', office.secondReading, true)}
      <Gap />
      {vigilPsalm(styles, office.secondPsalm)}
      <Gap />
      {vigilPrayer(styles, office.secondPsalm)}
      <Gap />
      {reading(styles, 'Lectura tercera', office.thirdReading, true)}
      <Gap />
      {vigilPsalm(styles, office.thirdPsalm)}
      <Gap />
      {reading(styles, 'Lectura quarta', office.fourthReading, true)}
    </>
  );
}

// The Te Deum, on the days that have it, with the last part that can be left out
function teDeumHymn(styles: PrayerTextStyles, office: Office) {
  if (!office.teDeumInformation.enabled) return undefined;
  const [firstPart, rest] = office.teDeumInformation.anthem.split('\n\n[');
  return section(
    'HIMNE',
    <>
      <Text selectable={true} style={styles.black}>
        {firstPart}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.redItalic}>
        {'Aquesta última part es pot ometre:\n'}
      </Text>
      <Text selectable={true} style={styles.black}>
        {rest.split(']')[0]}
      </Text>
    </>,
  );
}

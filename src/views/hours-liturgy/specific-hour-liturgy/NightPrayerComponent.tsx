import React, { useState } from 'react';
import { View } from 'react-native';
import PrayerFlow from '../../../components/PrayerFlow';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../../components/PrayerText';
import HR from '../../../components/HRComponent';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import ChoiceChips from '../../../components/ChoiceChips';
import * as Logger from '../../../utils/logger';
import { withoutPsalmMarks, withoutTrailingSpace as rs } from '../../../utils/prayerText';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { PrayerTextStyles, prayerTextStyles, useTheme } from '../../../theme';
import {
  antiphonedPsalm,
  opening,
  psalmBody,
  psalmComment,
  responsoryVersicles,
  section,
  shortReading,
} from '../hourBlocks';
import type NightPrayer from '../../../models/hours-liturgy/NightPrayer';
import type { HourProps } from './hourProps';

// The four Marian antiphons to choose from outside Easter (in Easter, only the fifth)
const MARIAN_ANTIPHONS = ['1', '2', '3', '4'].map((value) => ({ value, label: `Ant. ${value}` }));

interface NightPrayerProps extends HourProps {
  onVirginAntiphonChange: (antiphonNumber: string) => void;
}

// Night Prayer. Gets through props the hours of the day (hours), the day (today) and the settings;
// a new Marian antiphon goes to onVirginAntiphonChange.
export default function NightPrayerComponent({ hours, today, settings, onVirginAntiphonChange }: NightPrayerProps) {
  const styles = prayerTextStyles(useTheme());
  const isEaster = today.genericLiturgyTime === GenericLiturgyTimeType.Easter;
  // In Easter, always the fifth antiphon (Regina caeli); outside it, the one chosen last time
  const [marianAntiphonNumber, setMarianAntiphonNumber] = useState(() => {
    const chosen = settings.virginAntiphonOption;
    if (isEaster && chosen !== '5') {
      onVirginAntiphonChange('5');
      return '5';
    }
    if (!isEaster && chosen === '5') {
      onVirginAntiphonChange('1');
      return '1';
    }
    return chosen;
  });

  function chooseMarianAntiphon(antiphonNumber: string) {
    setMarianAntiphonNumber(antiphonNumber);
    onVirginAntiphonChange(antiphonNumber);
  }

  // Everything the hour shows goes through the flow, which sews the paragraphs that follow one
  // another into a single text: that way a selection can go from one to the next
  return <PrayerFlow>{content()}</PrayerFlow>;

  function content() {
    try {
      const nightPrayer = hours.nightPrayer;
      if (nightPrayer === null) {
        Logger.logError(Logger.LogKeys.Screens, 'render', new Error('wierd error.......'));
        return null;
      }
      const onlyForThoseNotAtTheVigil =
        today.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum && today.date.getDay() === 6;

      return (
        <>
          {onlyForThoseNotAtTheVigil ? (
            <>
              <Text selectable={true} style={styles.redCenter}>
                {'Avui, només han de dir aquestes Completes els qui no participen en la Vetlla pasqual.'}
              </Text>
              <Gap />
              <HR />
              <Gap />
            </>
          ) : null}
          {opening(styles, today.specificLiturgyTime)}
          <Gap />
          <HR />
          <Gap />
          <Text selectable={true} style={styles.redCenter}>
            {'És lloable que aquí es faci examen de consciència.'}
          </Text>
          <Gap />
          <Text selectable={true} style={styles.black}>
            {nightPrayer.penitentialAct}
          </Text>
          {section(
            'HIMNE',
            <Text selectable={true} style={styles.black}>
              {rs(nightPrayer.anthem)}
            </Text>,
          )}
          {section('SALMÒDIA', psalmody(styles, nightPrayer))}
          {section('LECTURA BREU', shortReading(styles, nightPrayer.shortReading))}
          {section(
            'RESPONSORI BREU',
            nightPrayer.shortResponsory.hasSpecialAntiphon ? (
              <Rubric label={'Ant. '}>{rs(nightPrayer.shortResponsory.specialAntiphon)}</Rubric>
            ) : (
              responsoryVersicles(nightPrayer.shortResponsory, " Glòria al Pare i al Fill i a l'Esperit Sant.")
            ),
          )}
          {section(
            'CÀNTIC DE SIMEÓ',
            antiphonedPsalm(
              styles,
              rs(nightPrayer.evangelicalAntiphon),
              "Càntic\nLc 2, 29-32\nCrist, llum de les nacions i glòria d'Israel",
              withoutPsalmMarks(rs(nightPrayer.evangelicalChant)),
            ),
          )}
          {section(
            'ORACIÓ',
            <>
              <Text selectable={true} style={styles.blackBold}>
                {'Preguem.'}
              </Text>
              <Text selectable={true} style={styles.black}>
                {rs(nightPrayer.finalPrayer)}
              </Text>
              <Rubric label={'R. '}>{'Amén.'}</Rubric>
            </>,
          )}
          {section(
            'CONCLUSIÓ',
            <>
              <Rubric label={'V. '}>
                {'Que el Senyor totpoderós ens concedeixi una nit tranquil·la i una fi benaurada.'}
              </Rubric>
              <Rubric label={'R. '}>{'Amén.'}</Rubric>
            </>,
          )}
          <Gap />
          <HR />
          <Gap />
          <Text selectable={true} accessibilityRole="header" style={styles.centeredTitle}>
            {'Antífona final de la Mare de Déu'}
          </Text>
          {marianAntiphon()}
          <Gap />
        </>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'render', error as Error);
      return null;
    }
  }

  function marianAntiphon() {
    const nightPrayer = hours.nightPrayer;
    const antiphons: Record<string, string> = {
      '1': nightPrayer.virginMaryFinalAntiphonFirstOption,
      '2': nightPrayer.virginMaryFinalAntiphonSecondOption,
      '3': nightPrayer.virginMaryFinalAntiphonThirdOption,
      '4': nightPrayer.virginMaryFinalAntiphonFourthOption,
      '5': nightPrayer.virginMaryFinalAntiphonFifthOption,
    };
    return (
      <View>
        {!isEaster ? (
          <ChoiceChips
            accessibilityLabel="Antífona final de la Mare de Déu"
            options={MARIAN_ANTIPHONS}
            value={marianAntiphonNumber}
            onChange={chooseMarianAntiphon}
          />
        ) : (
          <Gap size="small" />
        )}
        <Text selectable={true} style={styles.black}>
          {rs(antiphons[marianAntiphonNumber])}
        </Text>
      </View>
    );
  }
}

// One psalm between its antiphon, or two: each between its own, or both between the same one
function psalmody(styles: PrayerTextStyles, nightPrayer: NightPrayer) {
  const first = nightPrayer.firstPsalm;
  const firstAntiphon = rs(first.antiphon);
  const firstBody = psalmBody(styles, {
    title: rs(first.title),
    comment: psalmComment(first),
    psalm: first.psalm,
    hasGloryPrayer: first.hasGloryPrayer,
  });

  if (!nightPrayer.hasMultiplePsalms) {
    return (
      <>
        <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
        <Gap />
        {firstBody}
        <Gap />
        <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
      </>
    );
  }

  const second = nightPrayer.secondPsalm;
  const differentAntiphons = !nightPrayer.useOnlyFirstPsalmAntiphon;
  const secondAntiphon = differentAntiphons ? rs(second.antiphon) : '';
  return (
    <>
      {differentAntiphons ? (
        <Rubric label={'Ant. 1. '}>{firstAntiphon}</Rubric>
      ) : (
        <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
      )}
      <Gap />
      {firstBody}
      <Gap />
      {differentAntiphons ? (
        <>
          <Rubric label={'Ant. 1. '}>{firstAntiphon}</Rubric>
          <Gap />
          <Rubric label={'Ant. 2. '}>{secondAntiphon}</Rubric>
          <Gap />
        </>
      ) : null}
      {psalmBody(styles, {
        title: rs(second.title),
        comment: psalmComment(second),
        psalm: second.psalm,
        hasGloryPrayer: second.hasGloryPrayer,
      })}
      <Gap />
      {differentAntiphons ? (
        <Rubric label={'Ant. 2. '}>{secondAntiphon}</Rubric>
      ) : (
        <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
      )}
    </>
  );
}

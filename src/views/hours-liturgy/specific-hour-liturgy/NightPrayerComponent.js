import React, { Component } from 'react';
import { View } from 'react-native';
import PrayerFlow from '../../../components/PrayerFlow';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../../components/PrayerText';
import HR from '../../../components/HRComponent';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import SectionTitle from '../../../components/SectionTitle';
import ChoiceChips from '../../../components/ChoiceChips';
import GlobalViewFunctions from '../../../utils/globalViewFunctions';
import * as Logger from '../../../utils/logger';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { StringManagement } from '../../../utils/StringManagement';
import { ThemeContext, prayerTextStyles } from '../../../theme';

// The four Marian antiphons to choose from outside Easter (in Easter, only the fifth)
const MARIAN_ANTIPHONS = ['1', '2', '3', '4'].map((value) => ({ value, label: `Ant. ${value}` }));

// Night Prayer. Gets through props the hours of the day (hours), the day (today) and the settings;
// a new Marian antiphon goes to onVirginAntiphonChange.
export default class NightPrayerComponent extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    // In Easter, always the fifth antiphon (Regina caeli); outside it, the one chosen last time
    let marianAntiphonNumber = props.settings.virginAntiphonOption;

    if (props.today.genericLiturgyTime === GenericLiturgyTimeType.Easter && marianAntiphonNumber !== '5') {
      marianAntiphonNumber = '5';
      props.onVirginAntiphonChange('5');
    } else if (!(props.today.genericLiturgyTime === GenericLiturgyTimeType.Easter) && marianAntiphonNumber === '5') {
      marianAntiphonNumber = '1';
      props.onVirginAntiphonChange('1');
    }

    this.state = {
      marianAntiphonNumber: marianAntiphonNumber,
    };
  }

  get styles() {
    return prayerTextStyles(this.context);
  }

  get hours() {
    return this.props.hours;
  }

  get today() {
    return this.props.today;
  }

  get nightPrayer() {
    return this.props.hours.nightPrayer;
  }

  onMarianAntiphonPress(marianAntiphonNumber) {
    this.setState({ marianAntiphonNumber: marianAntiphonNumber });
    this.props.onVirginAntiphonChange(marianAntiphonNumber);
  }

  marianAntiphon(marianAntiphonNumber) {
    let antiphon;

    switch (marianAntiphonNumber) {
      case '1':
        antiphon = GlobalViewFunctions.rs(this.nightPrayer.virginMaryFinalAntiphonFirstOption);
        break;
      case '2':
        antiphon = GlobalViewFunctions.rs(this.nightPrayer.virginMaryFinalAntiphonSecondOption);
        break;
      case '3':
        antiphon = GlobalViewFunctions.rs(this.nightPrayer.virginMaryFinalAntiphonThirdOption);
        break;
      case '4':
        antiphon = GlobalViewFunctions.rs(this.nightPrayer.virginMaryFinalAntiphonFourthOption);
        break;
      case '5':
        antiphon = GlobalViewFunctions.rs(this.nightPrayer.virginMaryFinalAntiphonFifthOption);
        break;
    }

    return (
      <View>
        {!(this.today.genericLiturgyTime === GenericLiturgyTimeType.Easter) ? (
          <ChoiceChips
            accessibilityLabel="Antífona final de la Mare de Déu"
            options={MARIAN_ANTIPHONS}
            value={marianAntiphonNumber}
            onChange={this.onMarianAntiphonPress.bind(this)}
          />
        ) : (
          <Gap size="small" />
        )}
        <Text selectable={true} style={this.styles.black}>
          {antiphon}
        </Text>
      </View>
    );
  }

  // Everything the hour shows goes through the flow, which sews the paragraphs that follow one
  // another into a single text: that way a selection can go from one to the next
  render() {
    return <PrayerFlow>{this.content()}</PrayerFlow>;
  }

  content() {
    try {
      if (this.nightPrayer !== null) {
        const gloriaStringIntro =
          'Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.';
        const isSpecialInitialMessage =
          this.today.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum && this.today.date.getDay() === 6;
        const specialInitialMessage =
          'Avui, només han de dir aquestes Completes els qui no participen en la Vetlla pasqual.';
        const openingVersicle = 'Sigueu amb nosaltres, Déu nostre.';
        const openingResponse = 'Senyor, veniu a ajudar-nos.';
        const isAlleluia =
          this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
          this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
          this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
          this.today.specificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
          this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum;
        const examinationOfConscienceRubric = 'És lloable que aquí es faci examen de consciència.';
        const penitentialAct = this.nightPrayer.penitentialAct;
        const hymn = GlobalViewFunctions.rs(this.nightPrayer.anthem);
        const hasTwoPsalms = this.nightPrayer.hasMultiplePsalms;
        const hasDifferentAntiphons = !this.nightPrayer.useOnlyFirstPsalmAntiphon;
        const firstAntiphon = GlobalViewFunctions.rs(this.nightPrayer.firstPsalm.antiphon);
        const firstTitle = GlobalViewFunctions.rs(this.nightPrayer.firstPsalm.title);
        const hasFirstComment = StringManagement.hasLiturgyContent(this.nightPrayer.firstPsalm.comment);
        const firstComment = hasFirstComment ? GlobalViewFunctions.rs(this.nightPrayer.firstPsalm.comment) : '';
        const firstPsalm = this.psalm(GlobalViewFunctions.rs(this.nightPrayer.firstPsalm.psalm));
        let secondAntiphon;
        let secondTitle;
        let hasSecondComment;
        let secondComment;
        let secondPsalm;
        if (hasTwoPsalms) {
          secondAntiphon = hasDifferentAntiphons ? GlobalViewFunctions.rs(this.nightPrayer.secondPsalm.antiphon) : '';
          secondTitle = GlobalViewFunctions.rs(this.nightPrayer.secondPsalm.title);
          hasSecondComment = StringManagement.hasLiturgyContent(this.nightPrayer.secondPsalm.comment);
          secondComment = hasSecondComment ? GlobalViewFunctions.rs(this.nightPrayer.secondPsalm.comment) : '';
          secondPsalm = this.psalm(GlobalViewFunctions.rs(this.nightPrayer.secondPsalm.psalm));
        }
        const shortReadingQuote = GlobalViewFunctions.rs(this.nightPrayer.shortReading.quote);
        const shortReadingText = GlobalViewFunctions.rs(this.nightPrayer.shortReading.shortReading);
        let specialAntiphon;
        let responsoryFirstAndSecondPart;
        let responsorySecondPart;
        let responsoryThirdPart;
        const isNormalResponsory = !this.nightPrayer.shortResponsory.hasSpecialAntiphon;
        if (isNormalResponsory) {
          responsoryFirstAndSecondPart = GlobalViewFunctions.respTogether(
            GlobalViewFunctions.rs(this.nightPrayer.shortResponsory.firstPart),
            GlobalViewFunctions.rs(this.nightPrayer.shortResponsory.secondPart),
          );
          responsorySecondPart = GlobalViewFunctions.rs(this.nightPrayer.shortResponsory.secondPart);
          responsoryThirdPart = GlobalViewFunctions.rs(this.nightPrayer.shortResponsory.thirdPart);
        } else {
          specialAntiphon = GlobalViewFunctions.rs(this.nightPrayer.shortResponsory.specialAntiphon);
        }
        const halfGloria = " Glòria al Pare i al Fill i a l'Esperit Sant.";
        const canticleAntiphon = GlobalViewFunctions.rs(this.nightPrayer.evangelicalAntiphon);
        const canticleTitle = "Càntic\nLc 2, 29-32\nCrist, llum de les nacions i glòria d'Israel";
        const canticleText = this.psalm(GlobalViewFunctions.rs(this.nightPrayer.evangelicalChant));
        const canticleGloria = 'Glòria.';
        const prayer = GlobalViewFunctions.rs(this.nightPrayer.finalPrayer);
        const blessedEndVersicle = 'Que el Senyor totpoderós ens concedeixi una nit tranquil·la i una fi benaurada.';
        const finalAntiphonTitle = 'Antífona final de la Mare de Déu';

        return (
          <View>
            {isSpecialInitialMessage ? (
              <View>
                <Text selectable={true} style={this.styles.redCenter}>
                  {specialInitialMessage}
                </Text>
                <Gap />
                <HR />
                <Gap />
              </View>
            ) : null}
            <Rubric label={'V. '}>{openingVersicle}</Rubric>
            <Rubric label={'R. '}>{openingResponse}</Rubric>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {gloriaStringIntro}
              {isAlleluia ? (
                <Text selectable={true} style={this.styles.black}>
                  {' Al·leluia.'}
                </Text>
              ) : null}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {examinationOfConscienceRubric}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {penitentialAct}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'HIMNE'}</SectionTitle>
            <Text selectable={true} style={this.styles.black}>
              {hymn}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'SALMÒDIA'}</SectionTitle>
            {hasTwoPsalms ? (
              <View>
                {hasDifferentAntiphons ? (
                  <Rubric label={'Ant. 1. '}>{firstAntiphon}</Rubric>
                ) : (
                  <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
                )}
                <Gap />
                <Text selectable={true} style={this.styles.redCenter}>
                  {firstTitle}
                </Text>
                <Gap />
                {hasFirstComment ? (
                  <>
                    <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                      {firstComment}
                    </Text>
                    <Gap />
                  </>
                ) : null}
                <Text selectable={true} style={this.styles.black}>
                  {firstPsalm}
                </Text>
                <Gap />
                {this.nightPrayer.firstPsalm.hasGloryPrayer ? (
                  <Text selectable={true} style={this.styles.blackItalic}>
                    {'Glòria.'}
                  </Text>
                ) : (
                  <Text selectable={true} style={this.styles.redItalic}>
                    {"S'omet el Glòria."}
                  </Text>
                )}
                <Gap />
                {hasDifferentAntiphons ? (
                  <View>
                    <Rubric label={'Ant. 1. '}>{firstAntiphon}</Rubric>
                    <Gap />
                    <Rubric label={'Ant. 2. '}>{secondAntiphon}</Rubric>
                    <Gap />
                  </View>
                ) : null}
                <Text selectable={true} style={this.styles.redCenter}>
                  {secondTitle}
                </Text>
                <Gap />
                {hasSecondComment !== '-' ? (
                  <>
                    <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                      {secondComment}
                    </Text>
                    <Gap />
                  </>
                ) : null}
                <Text selectable={true} style={this.styles.black}>
                  {secondPsalm}
                </Text>
                <Gap />
                {this.nightPrayer.secondPsalm.hasGloryPrayer ? (
                  <Text selectable={true} style={this.styles.blackItalic}>
                    {'Glòria.'}
                  </Text>
                ) : (
                  <Text selectable={true} style={this.styles.redItalic}>
                    {"S'omet el Glòria."}
                  </Text>
                )}
                <Gap />
                {hasDifferentAntiphons ? (
                  <View>
                    <Rubric label={'Ant. 2. '}>{secondAntiphon}</Rubric>
                  </View>
                ) : (
                  <View>
                    <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
                <Gap />
                <Text selectable={true} style={this.styles.redCenter}>
                  {firstTitle}
                </Text>
                <Gap />
                {hasFirstComment ? (
                  <>
                    <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                      {firstComment}
                    </Text>
                    <Gap />
                  </>
                ) : null}
                <Text selectable={true} style={this.styles.black}>
                  {firstPsalm}
                </Text>
                <Gap />
                {this.nightPrayer.firstPsalm.hasGloryPrayer ? (
                  <Text selectable={true} style={this.styles.blackItalic}>
                    {'Glòria.'}
                  </Text>
                ) : (
                  <Text selectable={true} style={this.styles.redItalic}>
                    {"S'omet el Glòria."}
                  </Text>
                )}
                <Gap />
                <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
              </View>
            )}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'LECTURA BREU'}</SectionTitle>
            <Text selectable={true} style={this.styles.red}>
              {shortReadingQuote}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {shortReadingText}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'RESPONSORI BREU'}</SectionTitle>
            {isNormalResponsory ? (
              <View>
                <Rubric label={'V. '}>{responsoryFirstAndSecondPart}</Rubric>
                <Rubric label={'R. '}>{responsoryFirstAndSecondPart}</Rubric>
                <Gap />
                <Rubric label={'V. '}>{responsoryThirdPart}</Rubric>
                <Rubric label={'R. '}>{responsorySecondPart}</Rubric>
                <Gap />
                <Rubric label={'V. '}>{halfGloria}</Rubric>
                <Rubric label={'R. '}>{responsoryFirstAndSecondPart}</Rubric>
              </View>
            ) : (
              <View>
                <Rubric label={'Ant. '}>{specialAntiphon}</Rubric>
              </View>
            )}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'CÀNTIC DE SIMEÓ'}</SectionTitle>
            <Rubric label={'Ant. '}>{canticleAntiphon}</Rubric>
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {canticleTitle}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {canticleText}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.blackItalic}>
              {canticleGloria}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{canticleAntiphon}</Rubric>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'ORACIÓ'}</SectionTitle>
            <Text selectable={true} style={this.styles.blackBold}>
              {'Preguem.'}
            </Text>
            <Text selectable={true} style={this.styles.black}>
              {prayer}
            </Text>
            <Rubric label={'R. '}>{'Amén.'}</Rubric>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'CONCLUSIÓ'}</SectionTitle>
            <Rubric label={'V. '}>{blessedEndVersicle}</Rubric>
            <Rubric label={'R. '}>{'Amén.'}</Rubric>
            <Gap />
            <HR />
            <Gap />
            <Text selectable={true} accessibilityRole="header" style={this.styles.centeredTitle}>
              {finalAntiphonTitle}
            </Text>
            {this.marianAntiphon(this.state.marianAntiphonNumber)}
            <Gap />
          </View>
        );
      } else {
        Logger.logError(Logger.LogKeys.Screens, 'render', new Error('wierd error.......'));
        return null;
      }
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'render', error);
      return null;
    }
  }

  psalm(psalm) {
    if (!psalm) return null;
    psalm = psalm.replace(/    [*]/g, '');
    psalm = psalm.replace(/   [*]/g, '');
    psalm = psalm.replace(/  [*]/g, '');
    psalm = psalm.replace(/ [*]/g, '');
    psalm = psalm.replace(/    [†]/g, '');
    psalm = psalm.replace(/   [†]/g, '');
    psalm = psalm.replace(/  [†]/g, '');
    psalm = psalm.replace(/ [†]/g, '');
    return psalm;
  }
}

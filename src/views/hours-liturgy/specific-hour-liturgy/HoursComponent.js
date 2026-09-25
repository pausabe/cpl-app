import React, { Component } from 'react';
import { View } from 'react-native';
import PrayerFlow from '../../../components/PrayerFlow';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../../components/PrayerText';
import HR from '../../../components/HRComponent';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import SectionTitle from '../../../components/SectionTitle';
import GlobalViewFunctions from '../../../utils/globalViewFunctions';
import * as Logger from '../../../utils/logger';
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { StringManagement } from '../../../utils/StringManagement';
import { ThemeContext, prayerTextStyles } from '../../../theme';

// A minor hour: Terce, Sext or None. Gets the hour (minorHour) and the day (today) through props.
export default class HoursComponent extends Component {
  static contextType = ThemeContext;

  get styles() {
    return prayerTextStyles(this.context);
  }

  get today() {
    return this.props.today;
  }

  get specificHour() {
    return this.props.minorHour;
  }

  // Everything the hour shows goes through the flow, which sews the paragraphs that follow one
  // another into a single text: that way a selection can go from one to the next
  render() {
    return <PrayerFlow>{this.content()}</PrayerFlow>;
  }

  content() {
    try {
      const gloriaStringIntro =
        'Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.';
      const isAlleluia =
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum;

      return (
        <View>
          <Rubric label={'V. '}>{'Sigueu amb nosaltres, Déu nostre.'}</Rubric>
          <Rubric label={'R. '}>{'Senyor, veniu a ajudar-nos.'}</Rubric>
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
          <SectionTitle>{'HIMNE'}</SectionTitle>
          {this.hymn()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'SALMÒDIA'}</SectionTitle>
          {this.psalmody()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'LECTURA BREU'}</SectionTitle>
          {this.shortReadingAndResponsory()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'ORACIÓ'}</SectionTitle>
          <Text selectable={true} style={this.styles.blackBold}>
            {'Preguem.'}
          </Text>
          {this.finalPrayer()}
          <Rubric label={'R. '}>{'Amén.'}</Rubric>
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'CONCLUSIÓ'}</SectionTitle>
          <Rubric label={'V. '}>{'Beneïm el Senyor.'}</Rubric>
          <Rubric label={'R. '}>{'Donem gràcies a Déu.'}</Rubric>
          <Gap />
        </View>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'render', error);
      return null;
    }
  }

  psalm(psalm) {
    if (!psalm) return null;
    psalm = psalm.replace(/ {4}[*]/g, '');
    psalm = psalm.replace(/ {3}[*]/g, '');
    psalm = psalm.replace(/ {2}[*]/g, '');
    psalm = psalm.replace(/ [*]/g, '');
    psalm = psalm.replace(/ {4}[†]/g, '');
    psalm = psalm.replace(/ {3}[†]/g, '');
    psalm = psalm.replace(/ {2}[†]/g, '');
    psalm = psalm.replace(/ [†]/g, '');
    return psalm;
  }

  hymn() {
    const hymn = GlobalViewFunctions.rs(this.specificHour.anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {hymn}
      </Text>
    );
  }

  psalmody() {
    const hasMultipleAntiphons = this.specificHour.hasMultipleAntiphons;
    const firstAntiphon = hasMultipleAntiphons ? GlobalViewFunctions.rs(this.specificHour.firstPsalm.antiphon) : '';
    const uniqueAntiphon = !hasMultipleAntiphons ? GlobalViewFunctions.rs(this.specificHour.uniqueAntiphon) : '';
    const firstTitle = GlobalViewFunctions.rs(this.specificHour.firstPsalm.title);
    const hasFirstComment = StringManagement.hasLiturgyContent(this.specificHour.firstPsalm.comment);
    const firstComment = hasFirstComment ? GlobalViewFunctions.rs(this.specificHour.firstPsalm.comment) : '';
    const firstPsalm = this.psalm(GlobalViewFunctions.rs(this.specificHour.firstPsalm.psalm));
    const secondAntiphon = hasMultipleAntiphons ? GlobalViewFunctions.rs(this.specificHour.secondPsalm.antiphon) : '';
    const secondTitle = GlobalViewFunctions.rs(this.specificHour.secondPsalm.title);
    const hasSecondComment = StringManagement.hasLiturgyContent(this.specificHour.secondPsalm.comment);
    const secondComment = hasSecondComment ? GlobalViewFunctions.rs(this.specificHour.secondPsalm.comment) : '';
    const secondPsalm = this.psalm(GlobalViewFunctions.rs(this.specificHour.secondPsalm.psalm));
    const thirdAntiphon = hasMultipleAntiphons ? GlobalViewFunctions.rs(this.specificHour.thirdPsalm.antiphon) : '';
    const thirdTitle = GlobalViewFunctions.rs(this.specificHour.thirdPsalm.title);
    const hasThirdComment = StringManagement.hasLiturgyContent(this.specificHour.thirdPsalm.comment);
    const thirdComment = hasThirdComment ? GlobalViewFunctions.rs(this.specificHour.thirdPsalm.comment) : '';
    const thirdPsalm = this.psalm(GlobalViewFunctions.rs(this.specificHour.thirdPsalm.psalm));

    return (
      <View>
        {hasMultipleAntiphons ? (
          <View>
            <Rubric label={'Ant. 1. '}>{firstAntiphon}</Rubric>
          </View>
        ) : (
          <View>
            <Rubric label={'Ant. '}>{uniqueAntiphon}</Rubric>
          </View>
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
        {this.specificHour.firstPsalm.hasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        {hasMultipleAntiphons ? (
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
        {hasSecondComment ? (
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
        {this.specificHour.secondPsalm.hasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        {hasMultipleAntiphons ? (
          <View>
            <Rubric label={'Ant. 2. '}>{secondAntiphon}</Rubric>
            <Gap />
            <Rubric label={'Ant. 3. '}>{thirdAntiphon}</Rubric>
            <Gap />
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.redCenter}>
          {thirdTitle}
        </Text>
        <Gap />
        {hasThirdComment ? (
          <>
            <Text selectable={true} style={this.styles.blackSmallItalicRight}>
              {thirdComment}
            </Text>
            <Gap />
          </>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {thirdPsalm}
        </Text>
        <Gap />
        {this.specificHour.thirdPsalm.hasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        {hasMultipleAntiphons ? (
          <View>
            <Rubric label={'Ant. 3. '}>{thirdAntiphon}</Rubric>
          </View>
        ) : (
          <View>
            <Rubric label={'Ant. '}>{uniqueAntiphon}</Rubric>
          </View>
        )}
      </View>
    );
  }

  shortReadingAndResponsory() {
    const shortReadingQuote = GlobalViewFunctions.rs(this.specificHour.shortReading.quote);
    const shortReadingText = GlobalViewFunctions.rs(this.specificHour.shortReading.shortReading);
    const responsoryVersicle = GlobalViewFunctions.rs(this.specificHour.responsory.versicle);
    const responsoryResponse = GlobalViewFunctions.rs(this.specificHour.responsory.response);

    return (
      <View>
        <Text selectable={true} style={this.styles.red}>
          {shortReadingQuote}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {shortReadingText}
        </Text>
        <Gap />
        <Rubric label={'V. '}>{responsoryVersicle}</Rubric>
        <Rubric label={'R. '}>{responsoryResponse}</Rubric>
      </View>
    );
  }

  finalPrayer() {
    const prayer = GlobalViewFunctions.completePrayer(GlobalViewFunctions.rs(this.specificHour.finalPrayer), true);
    return (
      <Text selectable={true} style={this.styles.black}>
        {prayer}
      </Text>
    );
  }
}

import React, { Component } from 'react';
import { Text, View } from 'react-native';
import HR from '../../../components/HRComponent';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import SectionTitle from '../../../components/SectionTitle';
import * as Logger from '../../../utils/logger';
import GlobalViewFunctions from '../../../utils/globalViewFunctions';
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { StringManagement } from '../../../utils/StringManagement';
import { ThemeContext, prayerTextStyles } from '../../../theme';

// Vespers. Gets the hours of the day (hours) and the day (today) through props.
export default class VespersComponent extends Component {
  static contextType = ThemeContext;

  get styles() {
    return prayerTextStyles(this.context);
  }

  get hours() {
    return this.props.hours;
  }

  get today() {
    return this.props.today;
  }

  render() {
    try {
      const gloriaStringIntro =
        'Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.';
      const openingVersicle = 'Sigueu amb nosaltres, Déu nostre.';
      const openingResponse = 'Senyor, veniu a ajudar-nos.';
      // TODO: [UI Refactor] encapsulate
      const isAlleluia =
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum;

      return (
        <View>
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
          {this.shortReading()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'RESPONSORI BREU'}</SectionTitle>
          {this.responsory()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'CÀNTIC DE MARIA'}</SectionTitle>
          {this.chant()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'PREGÀRIES'}</SectionTitle>
          {this.prayers()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'ORACIÓ'}</SectionTitle>
          {this.finalPrayer()}
          <Rubric label={'R.'}>{' Amén.'}</Rubric>
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'CONCLUSIÓ'}</SectionTitle>
          <Rubric label={'V.'}>
            {' Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.'}
          </Rubric>
          <Rubric label={'R.'}>{' Amén.'}</Rubric>
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

  hymn() {
    const hymn = GlobalViewFunctions.rs(this.hours.vespers.anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {hymn}
      </Text>
    );
  }

  psalmody() {
    const firstAntiphon = GlobalViewFunctions.rs(this.hours.vespers.firstPsalm.antiphon);
    const firstTitle = GlobalViewFunctions.rs(this.hours.vespers.firstPsalm.title);
    let firstComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.vespers.firstPsalm.comment))
      firstComment = GlobalViewFunctions.rs(this.hours.vespers.firstPsalm.comment);
    const firstPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.vespers.firstPsalm.psalm));
    const secondAntiphon = GlobalViewFunctions.rs(this.hours.vespers.secondPsalm.antiphon);
    const secondTitle = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.vespers.secondPsalm.title));
    let secondComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.vespers.secondPsalm.comment))
      secondComment = GlobalViewFunctions.rs(this.hours.vespers.secondPsalm.comment);
    const secondPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.vespers.secondPsalm.psalm));
    const thirdAntiphon = GlobalViewFunctions.rs(this.hours.vespers.thirdPsalm.antiphon);
    const thirdTitle = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.vespers.thirdPsalm.title));
    let thirdComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.vespers.thirdPsalm.comment))
      thirdComment = GlobalViewFunctions.rs(this.hours.vespers.thirdPsalm.comment);
    const thirdPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.vespers.thirdPsalm.psalm));

    return (
      <View>
        <Rubric label={'Ant. 1.'}> {firstAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {firstTitle}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.vespers.firstPsalm.comment) ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 2 }}>
              <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                {firstComment}
              </Text>
              <Gap />
            </View>
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {firstPsalm}
        </Text>
        <Gap />
        {this.hours.vespers.firstPsalm.hasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        <Rubric label={'Ant. 1.'}> {firstAntiphon}</Rubric>
        <Gap />
        <Rubric label={'Ant. 2.'}> {secondAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {secondTitle}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.vespers.secondPsalm.comment) ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 2 }}>
              <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                {secondComment}
              </Text>
              <Gap />
            </View>
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {secondPsalm}
        </Text>
        <Gap />
        {this.hours.vespers.secondPsalm.hasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        <Rubric label={'Ant. 2.'}> {secondAntiphon}</Rubric>
        <Gap />
        <Rubric label={'Ant. 3.'}> {thirdAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {thirdTitle}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.vespers.thirdPsalm.comment) ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 2 }}>
              <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                {thirdComment}
              </Text>
              <Gap />
            </View>
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {thirdPsalm}
        </Text>
        <Gap />
        {this.hours.vespers.thirdPsalm.hasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        <Rubric label={'Ant. 3.'}> {thirdAntiphon}</Rubric>
      </View>
    );
  }

  shortReading() {
    const shortReadingQuote = GlobalViewFunctions.rs(this.hours.vespers.shortReading.quote);
    const shortReadingText = GlobalViewFunctions.rs(this.hours.vespers.shortReading.shortReading);
    return (
      <View>
        <Text selectable={true} style={this.styles.red}>
          {shortReadingQuote}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {shortReadingText}
        </Text>
      </View>
    );
  }

  responsory() {
    if (this.hours.vespers.shortResponsory.hasSpecialAntiphon) {
      const antiphon = GlobalViewFunctions.rs(this.hours.vespers.shortResponsory.specialAntiphon);
      return (
        <View>
          <Rubric label={'Ant.'}> {antiphon}</Rubric>
        </View>
      );
    } else {
      const responsoryFirstAndSecondPart = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.vespers.shortResponsory.firstPart),
        GlobalViewFunctions.rs(this.hours.vespers.shortResponsory.secondPart),
      );
      const responsorySecondPart = GlobalViewFunctions.rs(this.hours.vespers.shortResponsory.secondPart);
      const responsoryThirdPart = GlobalViewFunctions.rs(this.hours.vespers.shortResponsory.thirdPart);
      const halfGloria = "Glòria al Pare i al Fill i a l'Esperit Sant.";

      // TODO: [UI Refactor] duplicated code
      return (
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
      );
    }
  }

  chant() {
    const antiphon = GlobalViewFunctions.rs(this.hours.vespers.evangelicalAntiphon);
    const title = 'Càntic\nLc 1, 46-55\nLa meva ànima magnifica el Senyor';
    const canticleText = this.psalm(this.hours.vespers.evangelicalChant);
    const gloria = 'Glòria.';

    // TODO: [UI Refactor] duplicated code
    return (
      <View>
        <Rubric label={'Ant. '}>{antiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {title}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {canticleText}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {gloria}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antiphon}</Rubric>
      </View>
    );
  }

  convertN(intercessions, pope, bishop) {
    if (intercessions.search('papa N.') !== -1) {
      intercessions = intercessions.replace('papa N.', 'papa ' + pope);
    } else if (intercessions.search('Papa N.') !== -1) {
      intercessions = intercessions.replace('Papa N.', 'papa ' + pope);
    }
    if (intercessions.search('bisbe N.') !== -1) {
      intercessions = intercessions.replace('bisbe N.', 'bisbe ' + bishop);
    }
    return intercessions;
  }

  prayers() {
    let allIntercessions = GlobalViewFunctions.rs(this.hours.vespers.prayers);

    if (
      allIntercessions === null ||
      allIntercessions === undefined ||
      allIntercessions === '' ||
      allIntercessions === '-'
    )
      return (
        <Text selectable={true} style={this.styles.black}>
          {'-'}
        </Text>
      );

    allIntercessions = this.convertN(
      allIntercessions,
      this.hours.concreteNamesInPrayers.pope,
      this.hours.concreteNamesInPrayers.bishop,
    );
    let dashCount,
      newlineCount,
      intercessionsIntro,
      intercessionsWithoutIntro,
      intercessionsResponse,
      intercessions,
      intercessionsFinalPart;

    if (allIntercessions.match(/—/g, '')) dashCount = allIntercessions.match(/—/g, '').length;
    else
      return (
        <Text selectable={true} style={this.styles.black}>
          {allIntercessions}
        </Text>
      );
    if (allIntercessions.match(/\n/g, '')) newlineCount = allIntercessions.match(/\n/g, '').length;
    else
      return (
        <Text selectable={true} style={this.styles.black}>
          {allIntercessions}
        </Text>
      );

    if (newlineCount !== dashCount * 3 + 3) {
      //every prayer have 3 spaces and intro have 3 more
      return (
        <Text selectable={true} style={this.styles.black}>
          {allIntercessions}
        </Text>
      );
    } else {
      intercessionsIntro = allIntercessions.split(':')[0];
      if (allIntercessions.search(intercessionsIntro + ':') !== -1) {
        intercessionsWithoutIntro = allIntercessions.replace(intercessionsIntro + ':', '');
        if (intercessionsWithoutIntro !== '') {
          while (intercessionsWithoutIntro.charAt(0) === '\n' || intercessionsWithoutIntro.charAt(0) === ' ') {
            intercessionsWithoutIntro = intercessionsWithoutIntro.substring(1, intercessionsWithoutIntro.length);
          }
        }
      } else {
        Logger.log(Logger.LogKeys.Screens, 'intercessions', 'InfoLog. something incorrect. Intercessions 1');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allIntercessions}
          </Text>
        );
      }

      intercessionsResponse = intercessionsWithoutIntro.split('\n')[0];
      if (intercessionsWithoutIntro.search(intercessionsResponse + '\n\n') !== -1) {
        intercessions = intercessionsWithoutIntro.replace(intercessionsResponse + '\n\n', '');
      } else {
        Logger.log(Logger.LogKeys.Screens, 'intercessions', 'InfoLog. something incorrect. Intercessions 2');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allIntercessions}
          </Text>
        );
      }

      if (intercessions.search(': Pare nostre.') !== -1) {
        intercessions = intercessions.replace(': Pare nostre.', ':');
      } else {
        if (intercessions.search(':  Pare nostre.') !== -1) {
          intercessions = intercessions.replace(':  Pare nostre.', ':');
        } else {
          Logger.log(Logger.LogKeys.Screens, 'intercessions', 'InfoLog. something incorrect. Intercessions 3');
          return (
            <Text selectable={true} style={this.styles.black}>
              {allIntercessions}
            </Text>
          );
        }
      }

      intercessionsFinalPart =
        intercessions.split('—')[dashCount - 1].split('.\n\n')[1] + '—' + intercessions.split('—')[dashCount];
      if (intercessions.search('\n\n' + intercessionsFinalPart) !== -1) {
        intercessions = intercessions.replace('\n\n' + intercessionsFinalPart, '');
      } else {
        Logger.log(Logger.LogKeys.Screens, 'intercessions', 'InfoLog. something incorrect. Intercessions 4');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allIntercessions}
          </Text>
        );
      }
    }

    const otherIntentionsRubric = 'Aquí es poden afegir altres intencions.';

    return (
      <View>
        <Text selectable={true} style={this.styles.black}>
          {intercessionsIntro}
          {':'}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {intercessionsResponse}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {intercessions}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.redItalic}>
          {otherIntentionsRubric}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {intercessionsFinalPart}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {'Pare nostre.'}
        </Text>
      </View>
    );
  }

  finalPrayer() {
    const prayer = GlobalViewFunctions.completePrayer(GlobalViewFunctions.rs(this.hours.vespers.finalPrayer), false);
    return (
      <Text selectable={true} style={this.styles.black}>
        {prayer}
      </Text>
    );
  }
}

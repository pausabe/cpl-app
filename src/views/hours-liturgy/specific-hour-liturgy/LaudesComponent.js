import React, { Component } from 'react';
import { Text, View } from 'react-native';
import HR from '../../../components/HRComponent';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import SectionTitle from '../../../components/SectionTitle';
import ChoiceChips from '../../../components/ChoiceChips';
import ContinueButton from '../../../components/ContinueButton';
import GlobalViewFunctions from '../../../utils/globalViewFunctions';
import * as Logger from '../../../utils/logger';
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { StringManagement } from '../../../utils/StringManagement';
import { ThemeContext, prayerTextStyles } from '../../../theme';

const INVITATORY_PSALMS = ['94', '99', '66', '23'];

// Lauds. Gets through props the hours of the day (hours), the day (today), the settings and the
// titles of the day's psalms (titles); a new invitatory psalm goes to onInvitationPsalmChange.
export default class LaudesComponent extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    // The invitatory psalm chosen last time, unless it is one of the psalms of the day
    let invitatoryPsalmNumber = props.settings.invitationPsalmOption;
    if (!GlobalViewFunctions.invitatoryPsalmExists(invitatoryPsalmNumber, props.titles)) {
      invitatoryPsalmNumber = '94';
      props.onInvitationPsalmChange('94');
    }

    this.state = {
      showInvitatory: false,
      invitatoryPsalmNumber: invitatoryPsalmNumber,
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

  get titles() {
    return this.props.titles;
  }

  onInvitatoryPsalmPress(psalmNumber) {
    this.setState({ invitatoryPsalmNumber: psalmNumber });
    this.props.onInvitationPsalmChange(psalmNumber);
  }

  invitatoryPsalm(psalmNumber) {
    let psalm94 = this.hours.invitation.psalm94;
    let psalm99 = this.hours.invitation.psalm99;
    let psalm66 = this.hours.invitation.psalm66;
    let psalm23 = this.hours.invitation.psalm23;

    let psalmTitle = '';
    let psalmReference = '';
    let psalmText = '';

    switch (psalmNumber) {
      case '94':
        psalmTitle = 'Salm 94\nInvitació a lloar Déu';
        psalmReference = 'Mentre repetim aquell «avui», exhortem-nos cada dia els uns als altres (He 3, 13)';
        psalmText = psalm94;
        break;
      case '99':
        psalmTitle = 'Salm 99\nInvitació a lloar Déu en el seu temple';
        psalmReference = 'El Senyor vol que els redimits cantin himnes de victòria (St. Atanasi)';
        psalmText = psalm99;
        break;
      case '66':
        psalmTitle = 'Salm 66\nInvitació als pobles a lloar Déu';
        psalmReference =
          'Sapigueu que el missatge de la salvació de Déu ha estat enviat a tots els pobles (Fets 28, 28)';
        psalmText = psalm66;
        break;
      case '23':
        psalmTitle = 'Salm 23\nEntrada del Senyor al santuari';
        psalmReference = "Les portes del cel s'obriren a Crist quan hi fou endut amb la seva humanitat (St. Ireneu)";
        psalmText = psalm23;
        break;
    }

    const stanzas = psalmText.split('\n\n');
    const antiphon = GlobalViewFunctions.rs(this.hours.invitation.invitationAntiphon);
    const gloriaString =
      'Glòria al Pare i al Fill    \ni a l’Esperit Sant.\nCom era al principi, ara i sempre    \ni pels segles dels segles. Amén.';

    return (
      <View>
        <ChoiceChips
          accessibilityLabel="Salm de l'invitatori"
          options={INVITATORY_PSALMS.filter(
            (psalm) => psalm === '94' || GlobalViewFunctions.invitatoryPsalmExists(psalm, this.titles),
          ).map((psalm) => ({ value: psalm, label: `Salm ${psalm}` }))}
          value={psalmNumber}
          onChange={this.onInvitatoryPsalmPress.bind(this)}
        />

        <Rubric label={'Ant. '}>{antiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {psalmTitle}
        </Text>
        <Gap />
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }} />
          <View style={{ flex: 2 }}>
            <Text selectable={true} style={this.styles.blackSmallItalicRight}>
              {psalmReference}
            </Text>
          </View>
        </View>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {stanzas[0]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {stanzas[1]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {stanzas[2]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {stanzas[3]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antiphon}</Rubric>
        <Gap />
        {stanzas.length > 4 ? (
          <View>
            <Text selectable={true} style={this.styles.black}>
              {stanzas[4]}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{antiphon}</Rubric>
            <Gap />
          </View>
        ) : null}
        {stanzas.length > 5 ? (
          <View>
            <Text selectable={true} style={this.styles.black}>
              {stanzas[5]}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{antiphon}</Rubric>
            <Gap />
          </View>
        ) : null}
        {stanzas.length > 6 ? (
          <View>
            <Text selectable={true} style={this.styles.black}>
              {stanzas[6]}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{antiphon}</Rubric>
            <Gap />
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {gloriaString}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antiphon}</Rubric>
      </View>
    );
  }

  render() {
    try {
      return (
        <View>
          {this.introduction()}
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
          <SectionTitle>{'CÀNTIC DE ZACARIES'}</SectionTitle>
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
          {this.conclusion()}
          <Gap />
        </View>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'render', error);
      return null;
    }
  }

  // TODO: [UI Refactor] duplicated code
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

  // TODO: [UI Refactor] duplicated code
  invitatoryButtons() {
    return (
      <View>
        <ContinueButton
          label={(this.state.showInvitatory ? 'Amagar' : 'Començar amb') + " l'invitatori"}
          onPress={() => this.setState({ showInvitatory: !this.state.showInvitatory })}
        />
        {this.state.showInvitatory ? (
          <View>
            <SectionTitle>{'INVITATORI'}</SectionTitle>
          </View>
        ) : null}
      </View>
    );
  }

  // TODO: [UI Refactor] duplicated code
  introduction() {
    const gloriaStringIntro =
      'Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.';
    const showInvitatory =
      this.state.showInvitatory || this.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday;

    if (showInvitatory) {
      const openLipsVersicle = 'Obriu-me els llavis, Senyor.';
      const openLipsResponse = 'I proclamaré la vostra lloança.';

      return (
        // TODO: [UI Refactor] imporve this method... if else.. not good
        <View>
          {this.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ? null : (
            <View>{this.invitatoryButtons()}</View>
          )}
          <Rubric label={'V. '}>{openLipsVersicle}</Rubric>
          <Rubric label={'R. '}>{openLipsResponse}</Rubric>
          <Gap />
          <HR />
          <Gap />
          {this.invitatoryPsalm(this.state.invitatoryPsalmNumber)}
        </View>
      );
    } else {
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
          {this.invitatoryButtons()}
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
        </View>
      );
    }
  }

  hymn() {
    const hymn = GlobalViewFunctions.rs(this.hours.laudes.anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {hymn}
      </Text>
    );
  }

  psalmody() {
    const firstAntiphon = GlobalViewFunctions.rs(this.hours.laudes.firstPsalm.antiphon);
    const firstTitle = GlobalViewFunctions.rs(this.hours.laudes.firstPsalm.title);
    let firstComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.laudes.firstPsalm.comment))
      firstComment = GlobalViewFunctions.rs(this.hours.laudes.firstPsalm.comment);
    const firstPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.laudes.firstPsalm.psalm));
    const secondAntiphon = GlobalViewFunctions.rs(this.hours.laudes.secondPsalm.antiphon);
    const secondTitle = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.laudes.secondPsalm.title));
    let secondComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.laudes.secondPsalm.comment))
      secondComment = GlobalViewFunctions.rs(this.hours.laudes.secondPsalm.comment);
    const secondPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.laudes.secondPsalm.psalm));
    const thirdAntiphon = GlobalViewFunctions.rs(this.hours.laudes.thirdPsalm.antiphon);
    const thirdTitle = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.laudes.thirdPsalm.title));
    let thirdComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.laudes.thirdPsalm.comment))
      thirdComment = GlobalViewFunctions.rs(this.hours.laudes.thirdPsalm.comment);
    const thirdPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.laudes.thirdPsalm.psalm));

    return (
      <View>
        <Rubric label={'Ant. 1.'}> {firstAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {firstTitle}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.laudes.firstPsalm.comment) ? (
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
        {this.hours.laudes.firstPsalm.hasGloryPrayer ? (
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
        {StringManagement.hasLiturgyContent(this.hours.laudes.secondPsalm.comment) ? (
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
        {this.hours.laudes.secondPsalm.hasGloryPrayer ? (
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
        {StringManagement.hasLiturgyContent(this.hours.laudes.thirdPsalm.comment) ? (
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
        {this.hours.laudes.thirdPsalm.hasGloryPrayer ? (
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
    const shortReadingQuote = GlobalViewFunctions.rs(this.hours.laudes.shortReading.quote);
    const shortReadingText = GlobalViewFunctions.rs(this.hours.laudes.shortReading.shortReading);
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
    if (this.hours.laudes.shortResponsory.hasSpecialAntiphon) {
      const antiphon = GlobalViewFunctions.rs(this.hours.laudes.shortResponsory.specialAntiphon);
      return (
        <View>
          <Rubric label={'Ant.'}> {antiphon}</Rubric>
        </View>
      );
    } else {
      const responsoryFirstAndSecondPart = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.laudes.shortResponsory.firstPart),
        GlobalViewFunctions.rs(this.hours.laudes.shortResponsory.secondPart),
      );
      const responsorySecondPart = GlobalViewFunctions.rs(this.hours.laudes.shortResponsory.secondPart);
      const responsoryThirdPart = GlobalViewFunctions.rs(this.hours.laudes.shortResponsory.thirdPart);
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
    const antiphon = GlobalViewFunctions.rs(this.hours.laudes.evangelicalAntiphon);
    const title = 'Càntic\nLc 1, 68-79\nEl Messies i el seu Precursor';
    const canticleText = this.psalm(this.hours.laudes.evangelicalChant);
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

  // TODO: [UI Refactor] duplicated code
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
    let allIntercessions = GlobalViewFunctions.rs(this.hours.laudes.prayers);

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
        Logger.log(Logger.LogKeys.Screens, 'intercessions', 'InfoLog. something incorrect. Intercessions 3');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allIntercessions}
          </Text>
        );
      }

      intercessionsFinalPart = intercessions.split('—')[dashCount].split('.\n\n')[1];
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

    // TODO: [UI Refactor] duplicated code
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
    const prayer = GlobalViewFunctions.completePrayer(GlobalViewFunctions.rs(this.hours.laudes.finalPrayer), false);
    return (
      <Text selectable={true} style={this.styles.black}>
        {prayer}
      </Text>
    );
  }

  conclusion() {
    const blessingVersicle = 'Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.';
    return (
      <View>
        <Rubric label={'V. '}>{blessingVersicle}</Rubric>
        <Rubric label={'R. '}>{'Amén.'}</Rubric>
      </View>
    );
  }
}

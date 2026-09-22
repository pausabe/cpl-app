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

// Laudes. Gets through props the hours of the day (hours), the day (today), the settings and the
// titles of the day's psalms (titols); a new invitatory psalm goes to onInvitationPsalmChange.
export default class LaudesComponent extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    // The invitatory psalm chosen last time, unless it is one of the psalms of the day
    let auxNumSalmInv = props.settings.InvitationPsalmOption;
    if (!GlobalViewFunctions.salmInvExists(auxNumSalmInv, props.titols)) {
      auxNumSalmInv = '94';
      props.onInvitationPsalmChange('94');
    }

    this.state = {
      invitatori: false,
      numSalmInv: auxNumSalmInv,
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

  get titols() {
    return this.props.titols;
  }

  onSalmInvPress(numSalm) {
    this.setState({ numSalmInv: numSalm });
    this.props.onInvitationPsalmChange(numSalm);
  }

  salmInvitatori(numSalm) {
    let salm94 = this.hours.Invitation.Psalm94;
    let salm99 = this.hours.Invitation.Psalm99;
    let salm66 = this.hours.Invitation.Psalm66;
    let salm23 = this.hours.Invitation.Psalm23;

    let psalmTitle = '';
    let psalmReference = '';
    let psalmText = '';

    switch (numSalm) {
      case '94':
        psalmTitle = 'Salm 94\nInvitació a lloar Déu';
        psalmReference = 'Mentre repetim aquell «avui», exhortem-nos cada dia els uns als altres (He 3, 13)';
        psalmText = salm94;
        break;
      case '99':
        psalmTitle = 'Salm 99\nInvitació a lloar Déu en el seu temple';
        psalmReference = 'El Senyor vol que els redimits cantin himnes de victòria (St. Atanasi)';
        psalmText = salm99;
        break;
      case '66':
        psalmTitle = 'Salm 66\nInvitació als pobles a lloar Déu';
        psalmReference =
          'Sapigueu que el missatge de la salvació de Déu ha estat enviat a tots els pobles (Fets 28, 28)';
        psalmText = salm66;
        break;
      case '23':
        psalmTitle = 'Salm 23\nEntrada del Senyor al santuari';
        psalmReference = "Les portes del cel s'obriren a Crist quan hi fou endut amb la seva humanitat (St. Ireneu)";
        psalmText = salm23;
        break;
    }

    const estrofes = psalmText.split('\n\n');
    const antifona = GlobalViewFunctions.rs(this.hours.Invitation.InvitationAntiphon);
    const gloriaString =
      'Glòria al Pare i al Fill    \ni a l’Esperit Sant.\nCom era al principi, ara i sempre    \ni pels segles dels segles. Amén.';

    return (
      <View>
        <ChoiceChips
          accessibilityLabel="Salm de l'invitatori"
          options={INVITATORY_PSALMS.filter(
            (psalm) => psalm === '94' || GlobalViewFunctions.salmInvExists(psalm, this.titols),
          ).map((psalm) => ({ value: psalm, label: `Salm ${psalm}` }))}
          value={numSalm}
          onChange={this.onSalmInvPress.bind(this)}
        />

        <Rubric label={'Ant. '}>{antifona}</Rubric>
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
          {estrofes[0]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antifona}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {estrofes[1]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antifona}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {estrofes[2]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antifona}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {estrofes[3]}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antifona}</Rubric>
        <Gap />
        {estrofes.length > 4 ? (
          <View>
            <Text selectable={true} style={this.styles.black}>
              {estrofes[4]}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{antifona}</Rubric>
            <Gap />
          </View>
        ) : null}
        {estrofes.length > 5 ? (
          <View>
            <Text selectable={true} style={this.styles.black}>
              {estrofes[5]}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{antifona}</Rubric>
            <Gap />
          </View>
        ) : null}
        {estrofes.length > 6 ? (
          <View>
            <Text selectable={true} style={this.styles.black}>
              {estrofes[6]}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{antifona}</Rubric>
            <Gap />
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {gloriaString}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{antifona}</Rubric>
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
          {this.himne()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'SALMÒDIA'}</SectionTitle>
          {this.salmodia()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'LECTURA BREU'}</SectionTitle>
          {this.lecturaBreu()}
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'RESPONSORI BREU'}</SectionTitle>
          {this.responsori()}
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
  salm(salm) {
    if (!salm) return null;
    salm = salm.replace(/    [*]/g, '');
    salm = salm.replace(/   [*]/g, '');
    salm = salm.replace(/  [*]/g, '');
    salm = salm.replace(/ [*]/g, '');
    salm = salm.replace(/    [†]/g, '');
    salm = salm.replace(/   [†]/g, '');
    salm = salm.replace(/  [†]/g, '');
    salm = salm.replace(/ [†]/g, '');
    return salm;
  }

  // TODO: [UI Refactor] duplicated code
  invitatoriButtons() {
    return (
      <View>
        <ContinueButton
          label={(this.state.invitatori ? 'Amagar' : 'Començar amb') + " l'invitatori"}
          onPress={() => this.setState({ invitatori: !this.state.invitatori })}
        />
        {this.state.invitatori ? (
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
      this.state.invitatori || this.today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday;

    if (showInvitatory) {
      const aux_obriume = 'Obriu-me els llavis, Senyor.';
      const aux_proclamare = 'I proclamaré la vostra lloança.';

      return (
        // TODO: [UI Refactor] imporve this method... if else.. not good
        <View>
          {this.today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ? null : (
            <View>{this.invitatoriButtons()}</View>
          )}
          <Rubric label={'V. '}>{aux_obriume}</Rubric>
          <Rubric label={'R. '}>{aux_proclamare}</Rubric>
          <Gap />
          <HR />
          <Gap />
          {this.salmInvitatori(this.state.numSalmInv)}
        </View>
      );
    } else {
      const aux_sigueu = 'Sigueu amb nosaltres, Déu nostre.';
      const aux_senyor_veniu = 'Senyor, veniu a ajudar-nos.';
      // TODO: [UI Refactor] encapsulate
      const aux_isAleluia =
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum;

      return (
        <View>
          {this.invitatoriButtons()}
          <Rubric label={'V. '}>{aux_sigueu}</Rubric>
          <Rubric label={'R. '}>{aux_senyor_veniu}</Rubric>
          <Gap />
          <Text selectable={true} style={this.styles.black}>
            {gloriaStringIntro}
            {aux_isAleluia ? (
              <Text selectable={true} style={this.styles.black}>
                {' Al·leluia.'}
              </Text>
            ) : null}
          </Text>
        </View>
      );
    }
  }

  himne() {
    const aux_himne = GlobalViewFunctions.rs(this.hours.Laudes.Anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_himne}
      </Text>
    );
  }

  salmodia() {
    const aux_ant1 = GlobalViewFunctions.rs(this.hours.Laudes.FirstPsalm.Antiphon);
    const aux_titol1 = GlobalViewFunctions.rs(this.hours.Laudes.FirstPsalm.Title);
    let aux_com1 = '';
    if (StringManagement.hasLiturgyContent(this.hours.Laudes.FirstPsalm.Comment))
      aux_com1 = GlobalViewFunctions.rs(this.hours.Laudes.FirstPsalm.Comment);
    const aux_salm1 = this.salm(GlobalViewFunctions.rs(this.hours.Laudes.FirstPsalm.Psalm));
    const aux_ant2 = GlobalViewFunctions.rs(this.hours.Laudes.SecondPsalm.Antiphon);
    const aux_titol2 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.Laudes.SecondPsalm.Title));
    let aux_com2 = '';
    if (StringManagement.hasLiturgyContent(this.hours.Laudes.SecondPsalm.Comment))
      aux_com2 = GlobalViewFunctions.rs(this.hours.Laudes.SecondPsalm.Comment);
    const aux_salm2 = this.salm(GlobalViewFunctions.rs(this.hours.Laudes.SecondPsalm.Psalm));
    const aux_ant3 = GlobalViewFunctions.rs(this.hours.Laudes.ThirdPsalm.Antiphon);
    const aux_titol3 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.Laudes.ThirdPsalm.Title));
    let aux_com3 = '';
    if (StringManagement.hasLiturgyContent(this.hours.Laudes.ThirdPsalm.Comment))
      aux_com3 = GlobalViewFunctions.rs(this.hours.Laudes.ThirdPsalm.Comment);
    const aux_salm3 = this.salm(GlobalViewFunctions.rs(this.hours.Laudes.ThirdPsalm.Psalm));

    return (
      <View>
        <Rubric label={'Ant. 1.'}> {aux_ant1}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol1}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.Laudes.FirstPsalm.Comment) ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 2 }}>
              <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                {aux_com1}
              </Text>
              <Gap />
            </View>
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {aux_salm1}
        </Text>
        <Gap />
        {this.hours.Laudes.FirstPsalm.HasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        <Rubric label={'Ant. 1.'}> {aux_ant1}</Rubric>
        <Gap />
        <Rubric label={'Ant. 2.'}> {aux_ant2}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol2}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.Laudes.SecondPsalm.Comment) ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 2 }}>
              <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                {aux_com2}
              </Text>
              <Gap />
            </View>
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {aux_salm2}
        </Text>
        <Gap />
        {this.hours.Laudes.SecondPsalm.HasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        <Rubric label={'Ant. 2.'}> {aux_ant2}</Rubric>
        <Gap />
        <Rubric label={'Ant. 3.'}> {aux_ant3}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol3}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.Laudes.ThirdPsalm.Comment) ? (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 2 }}>
              <Text selectable={true} style={this.styles.blackSmallItalicRight}>
                {aux_com3}
              </Text>
              <Gap />
            </View>
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.black}>
          {aux_salm3}
        </Text>
        <Gap />
        {this.hours.Laudes.ThirdPsalm.HasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        <Rubric label={'Ant. 3.'}> {aux_ant3}</Rubric>
      </View>
    );
  }

  lecturaBreu() {
    const aux_vers = GlobalViewFunctions.rs(this.hours.Laudes.ShortReading.Quote);
    const aux_lectura_breu = GlobalViewFunctions.rs(this.hours.Laudes.ShortReading.ShortReading);
    return (
      <View>
        <Text selectable={true} style={this.styles.red}>
          {aux_vers}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {aux_lectura_breu}
        </Text>
      </View>
    );
  }

  responsori() {
    if (this.hours.Laudes.ShortResponsory.HasSpecialAntiphon) {
      const aux_ant = GlobalViewFunctions.rs(this.hours.Laudes.ShortResponsory.SpecialAntiphon);
      return (
        <View>
          <Rubric label={'Ant.'}> {aux_ant}</Rubric>
        </View>
      );
    } else {
      const aux_resp_1_2 = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.Laudes.ShortResponsory.FirstPart),
        GlobalViewFunctions.rs(this.hours.Laudes.ShortResponsory.SecondPart),
      );
      const aux_resp_2 = GlobalViewFunctions.rs(this.hours.Laudes.ShortResponsory.SecondPart);
      const aux_resp_3 = GlobalViewFunctions.rs(this.hours.Laudes.ShortResponsory.ThirdPart);
      const aux_gloria_half = "Glòria al Pare i al Fill i a l'Esperit Sant.";

      // TODO: [UI Refactor] duplicated code
      return (
        <View>
          <Rubric label={'V. '}>{aux_resp_1_2}</Rubric>
          <Rubric label={'R. '}>{aux_resp_1_2}</Rubric>
          <Gap />
          <Rubric label={'V. '}>{aux_resp_3}</Rubric>
          <Rubric label={'R. '}>{aux_resp_2}</Rubric>
          <Gap />
          <Rubric label={'V. '}>{aux_gloria_half}</Rubric>
          <Rubric label={'R. '}>{aux_resp_1_2}</Rubric>
        </View>
      );
    }
  }

  chant() {
    const aux_ant = GlobalViewFunctions.rs(this.hours.Laudes.EvangelicalAntiphon);
    const aux_titol = 'Càntic\nLc 1, 68-79\nEl Messies i el seu Precursor';
    const aux_salm = this.salm(this.hours.Laudes.EvangelicalChant);
    const aux_gloria = 'Glòria.';

    // TODO: [UI Refactor] duplicated code
    return (
      <View>
        <Rubric label={'Ant. '}>{aux_ant}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {aux_salm}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {aux_gloria}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{aux_ant}</Rubric>
      </View>
    );
  }

  // TODO: [UI Refactor] duplicated code
  convertN(pregs, papa, bisbe) {
    if (pregs.search('papa N.') !== -1) {
      pregs = pregs.replace('papa N.', 'papa ' + papa);
    } else if (pregs.search('Papa N.') !== -1) {
      pregs = pregs.replace('Papa N.', 'papa ' + papa);
    }
    if (pregs.search('bisbe N.') !== -1) {
      pregs = pregs.replace('bisbe N.', 'bisbe ' + bisbe);
    }
    return pregs;
  }

  prayers() {
    let allPregs = GlobalViewFunctions.rs(this.hours.Laudes.Prayers);

    if (allPregs === null || allPregs === undefined || allPregs === '' || allPregs === '-')
      return (
        <Text selectable={true} style={this.styles.black}>
          {'-'}
        </Text>
      );

    allPregs = this.convertN(
      allPregs,
      this.hours.ConcreteNamesInPrayers.Pope,
      this.hours.ConcreteNamesInPrayers.Bishop,
    );
    let numGuio, numEnter, introPregs, pregsNoIntro, respPregs, pregaries, pregsFinalPart;

    if (allPregs.match(/—/g, '')) numGuio = allPregs.match(/—/g, '').length;
    else
      return (
        <Text selectable={true} style={this.styles.black}>
          {allPregs}
        </Text>
      );
    if (allPregs.match(/\n/g, '')) numEnter = allPregs.match(/\n/g, '').length;
    else
      return (
        <Text selectable={true} style={this.styles.black}>
          {allPregs}
        </Text>
      );

    if (numEnter !== numGuio * 3 + 3) {
      //every prayer have 3 spaces and intro have 3 more
      return (
        <Text selectable={true} style={this.styles.black}>
          {allPregs}
        </Text>
      );
    } else {
      introPregs = allPregs.split(':')[0];
      if (allPregs.search(introPregs + ':') !== -1) {
        pregsNoIntro = allPregs.replace(introPregs + ':', '');
        if (pregsNoIntro !== '') {
          while (pregsNoIntro.charAt(0) === '\n' || pregsNoIntro.charAt(0) === ' ') {
            pregsNoIntro = pregsNoIntro.substring(1, pregsNoIntro.length);
          }
        }
      } else {
        Logger.log(Logger.LogKeys.Screens, 'pregaries', 'InfoLog. something incorrect. Pregaries 1');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allPregs}
          </Text>
        );
      }

      respPregs = pregsNoIntro.split('\n')[0];
      if (pregsNoIntro.search(respPregs + '\n\n') !== -1) {
        pregaries = pregsNoIntro.replace(respPregs + '\n\n', '');
      } else {
        Logger.log(Logger.LogKeys.Screens, 'pregaries', 'InfoLog. something incorrect. Pregaries 2');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allPregs}
          </Text>
        );
      }

      if (pregaries.search(': Pare nostre.') !== -1) {
        pregaries = pregaries.replace(': Pare nostre.', ':');
      } else {
        Logger.log(Logger.LogKeys.Screens, 'pregaries', 'InfoLog. something incorrect. Pregaries 3');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allPregs}
          </Text>
        );
      }

      pregsFinalPart = pregaries.split('—')[numGuio].split('.\n\n')[1];
      if (pregaries.search('\n\n' + pregsFinalPart) !== -1) {
        pregaries = pregaries.replace('\n\n' + pregsFinalPart, '');
      } else {
        Logger.log(Logger.LogKeys.Screens, 'pregaries', 'InfoLog. something incorrect. Pregaries 4');
        return (
          <Text selectable={true} style={this.styles.black}>
            {allPregs}
          </Text>
        );
      }
    }

    const aux_intencions = 'Aquí es poden afegir altres intencions.';

    // TODO: [UI Refactor] duplicated code
    return (
      <View>
        <Text selectable={true} style={this.styles.black}>
          {introPregs}
          {':'}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {respPregs}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {pregaries}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.redItalic}>
          {aux_intencions}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {pregsFinalPart}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {'Pare nostre.'}
        </Text>
      </View>
    );
  }

  finalPrayer() {
    const aux_oracio = GlobalViewFunctions.completeOracio(GlobalViewFunctions.rs(this.hours.Laudes.FinalPrayer), false);
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_oracio}
      </Text>
    );
  }

  conclusion() {
    const aux_benediccio = 'Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.';
    return (
      <View>
        <Rubric label={'V. '}>{aux_benediccio}</Rubric>
        <Rubric label={'R. '}>{'Amén.'}</Rubric>
      </View>
    );
  }
}

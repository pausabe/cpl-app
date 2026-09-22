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

// The Office of Readings. Gets through props the hours of the day (hours), the day (today), the
// settings and the titles of the day's psalms (titols); a new invitatory psalm goes to
// onInvitationPsalmChange.
export default class OfficeComponent extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    // The invitatory psalm chosen last time, unless it is one of the psalms of the day
    let auxNumSalmInv = props.settings.invitationPsalmOption;
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

  render() {
    try {
      if (this.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
        let aux_vetlla = "La Vetlla pasqual substitueix avui l'Ofici de lectura.";
        let aux_participen =
          "Els qui no participen en la solemne Vetlla pasqual n'escolliran almenys quatre lectures, amb els corresponents salms responsorials i oracions. Les lectures més adients són les que segueixen.";
        let aux_comença = "L'Ofici comença directament per les lectures.";

        return (
          <View>
            <Text selectable={true} style={this.styles.redCenter}>
              {aux_vetlla}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {aux_participen}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {aux_comença}
            </Text>
            <Gap />
            <HR />
            <Gap />
            {this.lecturesDiumPasqua()}
            {this.himneOhDeu()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'ORACIÓ'}</SectionTitle>
            <Text selectable={true} style={this.styles.blackBold}>
              {'Preguem.'}
            </Text>
            {this.finalPrayer()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'CONCLUSIÓ'}</SectionTitle>
            <Rubric label={'V. '}>{'Beneïm el Senyor.'}</Rubric>
            <Rubric label={'R. '}>{'Donem gràcies a Déu.'}</Rubric>
            <Gap />
          </View>
        );
      } else {
        return (
          <View>
            {this.introduction()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>
              {'HIMNE'}
              {this.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary && this.hours.office.isDarkAnthem
                ? ' (nit)'
                : ' (dia)'}
            </SectionTitle>
            {this.himne()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'SALMÒDIA'}</SectionTitle>
            {this.salmodia()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'VERS'}</SectionTitle>
            {this.vers()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'LECTURES'}</SectionTitle>
            {this.lectures()}
            {this.himneOhDeu()}
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
      }
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'remder', error);
      return null;
    }
  }

  onSalmInvPress(numSalm) {
    this.setState({ numSalmInv: numSalm });
    this.props.onInvitationPsalmChange(numSalm);
  }

  salmInvitatori(numSalm) {
    let salm94 = this.hours.invitation.psalm94;
    let salm99 = this.hours.invitation.psalm99;
    let salm66 = this.hours.invitation.psalm66;
    let salm23 = this.hours.invitation.psalm23;

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
    const antifona = GlobalViewFunctions.rs(this.hours.invitation.invitationAntiphon);
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
    const showInvitatory = this.state.invitatori;

    if (showInvitatory) {
      const aux_obriume = 'Obriu-me els llavis, Senyor.';
      const aux_proclamare = 'I proclamaré la vostra lloança.';

      return (
        <View>
          {this.invitatoriButtons()}
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
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
        this.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum;

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

  // TODO: [UI Refactor] duplicated code
  himne() {
    const aux_himne = GlobalViewFunctions.rs(this.hours.office.anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_himne}
      </Text>
    );
  }

  // TODO: [UI Refactor] at this point I will stop mention duplication. Is all super duplicated and all Views need a complete refactor
  salmodia() {
    const aux_ant1 = GlobalViewFunctions.rs(this.hours.office.firstPsalm.antiphon);
    const aux_titol1 = GlobalViewFunctions.rs(this.hours.office.firstPsalm.title);
    let aux_com1 = '';
    if (StringManagement.hasLiturgyContent(this.hours.office.firstPsalm.comment))
      aux_com1 = GlobalViewFunctions.rs(this.hours.office.firstPsalm.comment);
    const aux_salm1 = this.salm(GlobalViewFunctions.rs(this.hours.office.firstPsalm.psalm));
    const aux_ant2 = GlobalViewFunctions.rs(this.hours.office.secondPsalm.antiphon);
    const aux_titol2 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.office.secondPsalm.title));
    let aux_com2 = '';
    if (StringManagement.hasLiturgyContent(this.hours.office.secondPsalm.comment))
      aux_com2 = GlobalViewFunctions.rs(this.hours.office.secondPsalm.comment);
    const aux_salm2 = this.salm(GlobalViewFunctions.rs(this.hours.office.secondPsalm.psalm));
    const aux_ant3 = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.antiphon);
    const aux_titol3 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.office.thirdPsalm.title));
    let aux_com3 = '';
    if (StringManagement.hasLiturgyContent(this.hours.office.thirdPsalm.comment))
      aux_com3 = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.comment);
    const aux_salm3 = this.salm(GlobalViewFunctions.rs(this.hours.office.thirdPsalm.psalm));

    return (
      <View>
        <Rubric label={'Ant. 1.'}> {aux_ant1}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol1}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.office.firstPsalm.comment) ? (
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
        {this.hours.office.firstPsalm.hasGloryPrayer ? (
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
        {StringManagement.hasLiturgyContent(this.hours.office.secondPsalm.comment) ? (
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
        {this.hours.office.secondPsalm.hasGloryPrayer ? (
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
        {StringManagement.hasLiturgyContent(this.hours.office.thirdPsalm.comment) ? (
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
        {this.hours.office.thirdPsalm.hasGloryPrayer ? (
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

  vers() {
    const aux_respV = GlobalViewFunctions.rs(this.hours.office.responsory.versicle);
    const aux_respR = GlobalViewFunctions.rs(this.hours.office.responsory.response);

    return (
      <View>
        <Rubric label={'V. '}>{aux_respV}</Rubric>
        <Rubric label={'R. '}>{aux_respR}</Rubric>
      </View>
    );
  }

  lectures() {
    try {
      const aux_referencia1 = GlobalViewFunctions.rs(this.hours.office.firstReading.reference);
      const aux_titol_lectura1 = GlobalViewFunctions.rs(this.hours.office.firstReading.title);
      const aux_has_cita1 = this.hours.office.firstReading.quote !== '-';
      const aux_cita1 = aux_has_cita1 ? GlobalViewFunctions.rs(this.hours.office.firstReading.quote) : '';
      const aux_lectura1 = GlobalViewFunctions.rs(this.hours.office.firstReading.reading);
      const aux_has_citaResp1 = this.hours.office.firstReading.responsory.quote !== '-';
      const aux_cita_resp1 = aux_has_citaResp1
        ? GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.quote)
        : '';
      const aux_resp1_1_2 = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.firstPart),
        GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.secondPart),
      );
      const aux_resp1_2 = GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.secondPart);
      const aux_resp1_3 = GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.thirdPart);
      const aux_referencia2 = GlobalViewFunctions.rs(this.hours.office.secondReading.reference);
      const aux_titol_lectura2 = GlobalViewFunctions.rs(this.hours.office.secondReading.title);
      const aux_has_cita2 =
        this.hours.office.secondReading.quote != null && this.hours.office.secondReading.quote !== '-';
      const aux_cita2 = aux_has_cita2 ? GlobalViewFunctions.rs(this.hours.office.secondReading.quote) : '';
      const aux_lectura2 = GlobalViewFunctions.rs(this.hours.office.secondReading.reading);
      const aux_has_vers2 = this.hours.office.secondReading.responsory.quote !== '-';
      const aux_vers2 = aux_has_vers2 ? GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.quote) : '';
      const aux_resp2_1_2 = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.firstPart),
        GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.secondPart),
      );
      const aux_resp2_2 = GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.secondPart);
      const aux_resp2_3 = GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.thirdPart);

      return (
        <View>
          <Text selectable={true} style={this.styles.red}>
            {'Lectura primera'}
          </Text>
          <Text selectable={true} style={this.styles.black}>
            {aux_referencia1}
          </Text>
          {aux_has_cita1 ? (
            <Text selectable={true} style={this.styles.red}>
              {aux_cita1}
            </Text>
          ) : null}
          <Gap />
          <Text selectable={true} style={this.styles.redCenterBold}>
            {aux_titol_lectura1}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.blackJustified}>
            {aux_lectura1}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.red}>
            {'Responsori'}
          </Text>
          {aux_has_citaResp1 ? (
            <Text selectable={true} style={this.styles.red}>
              {aux_cita_resp1}
            </Text>
          ) : null}
          <Rubric label={'R. '}>{aux_resp1_1_2}</Rubric>
          <Rubric label={'V. '}>{aux_resp1_3}</Rubric>
          <Rubric label={'R. '}>{aux_resp1_2}</Rubric>
          <Gap />
          <Text selectable={true} style={this.styles.red}>
            {'Lectura segona'}
          </Text>
          <Text selectable={true} style={this.styles.black}>
            {aux_referencia2}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.redCenterBold}>
            {aux_titol_lectura2}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.blackJustified}>
            {aux_lectura2}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.red}>
            {'Responsori'}
          </Text>
          {aux_has_vers2 ? (
            <Text selectable={true} style={this.styles.red}>
              {aux_vers2}
            </Text>
          ) : null}
          <Rubric label={'R. '}>{aux_resp2_1_2}</Rubric>
          <Rubric label={'V. '}>{aux_resp2_3}</Rubric>
          <Rubric label={'R. '}>{aux_resp2_2}</Rubric>
        </View>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'lectures', error);
      return null;
    }
  }

  lecturesDiumPasqua() {
    const aux_referencia1 = GlobalViewFunctions.rs(this.hours.office.firstReading.reference);
    const aux_titol_lectura1 = GlobalViewFunctions.rs(this.hours.office.firstReading.title);
    const aux_has_cita1 = this.hours.office.firstReading.quote !== '-';
    const aux_cita1 = aux_has_cita1 ? GlobalViewFunctions.rs(this.hours.office.firstReading.quote) : '';
    const aux_lectura1 = GlobalViewFunctions.rs(this.hours.office.firstReading.reading);

    const aux_ant1 = GlobalViewFunctions.rs(this.hours.office.firstPsalm.antiphon);
    const aux_titol1 = GlobalViewFunctions.rs(this.hours.office.firstPsalm.title);
    const aux_salm1 = this.salm(GlobalViewFunctions.rs(this.hours.office.firstPsalm.psalm));
    const aux_gloria1 = 'Glòria.';
    const aux_oracio1 = GlobalViewFunctions.rs(this.hours.office.firstPsalm.prayer);

    const aux_referencia2 = GlobalViewFunctions.rs(this.hours.office.secondReading.reference);
    const aux_titol_lectura2 = GlobalViewFunctions.rs(this.hours.office.secondReading.title);
    const aux_has_cita2 = this.hours.office.secondReading.quote !== '-';
    const aux_cita2 = aux_has_cita2 ? GlobalViewFunctions.rs(this.hours.office.secondReading.quote) : '';
    const aux_lectura2 = GlobalViewFunctions.rs(this.hours.office.secondReading.reading);

    const aux_ant2 = GlobalViewFunctions.rs(this.hours.office.secondPsalm.antiphon);
    const aux_titol2 = GlobalViewFunctions.rs(this.hours.office.secondPsalm.title);
    const aux_salm2 = this.salm(GlobalViewFunctions.rs(this.hours.office.secondPsalm.psalm));
    const aux_gloria2 = 'Glòria.';
    const aux_oracio2 = GlobalViewFunctions.rs(this.hours.office.secondPsalm.prayer);

    const aux_referencia3 = GlobalViewFunctions.rs(this.hours.office.thirdReading.reference);
    const aux_titol_lectura3 = GlobalViewFunctions.rs(this.hours.office.thirdReading.title);
    const aux_has_cita3 = this.hours.office.thirdReading.quote !== '-';
    const aux_cita3 = aux_has_cita3 ? GlobalViewFunctions.rs(this.hours.office.thirdReading.quote) : '';
    const aux_lectura3 = GlobalViewFunctions.rs(this.hours.office.thirdReading.reading);

    const aux_ant3 = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.antiphon);
    const aux_titol3 = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.title);
    const aux_salm3 = this.salm(GlobalViewFunctions.rs(this.hours.office.thirdPsalm.psalm));
    const aux_gloria3 = 'Glòria.';
    const aux_oracio3 = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.prayer);

    const aux_referencia4 = GlobalViewFunctions.rs(this.hours.office.fourthReading.reference);
    const aux_titol_lectura4 = GlobalViewFunctions.rs(this.hours.office.fourthReading.title);
    const aux_has_cita4 = this.hours.office.fourthReading.quote !== '-';
    const aux_cita4 = aux_has_cita4 ? GlobalViewFunctions.rs(this.hours.office.fourthReading.quote) : '';
    const aux_lectura4 = GlobalViewFunctions.rs(this.hours.office.fourthReading.reading);

    return (
      <View>
        <Text selectable={true} style={this.styles.red}>
          {'Lectura primera'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {aux_referencia1}
        </Text>
        {aux_has_cita1 ? (
          <Text selectable={true} style={this.styles.red}>
            {aux_cita1}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {aux_titol_lectura1}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {aux_lectura1}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{aux_ant1}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol1}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {aux_salm1}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {aux_gloria1}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{aux_ant1}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.blackBold}>
          {'Preguem.'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {aux_oracio1}
        </Text>
        <Rubric label={'R. '}>{'Amén.'}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura segona'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {aux_referencia2}
        </Text>
        {aux_has_cita2 ? (
          <Text selectable={true} style={this.styles.red}>
            {aux_cita2}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {aux_titol_lectura2}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {aux_lectura2}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{aux_ant2}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol2}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {aux_salm2}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {aux_gloria2}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{aux_ant2}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.blackBold}>
          {'Preguem.'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {aux_oracio2}
        </Text>
        <Rubric label={'R. '}>{'Amén.'}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura tercera'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {aux_referencia3}
        </Text>
        {aux_has_cita3 ? (
          <Text selectable={true} style={this.styles.red}>
            {aux_cita3}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {aux_titol_lectura3}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {aux_lectura3}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{aux_ant3}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol3}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {aux_salm3}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {aux_gloria3}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{aux_ant3}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura quarta'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {aux_referencia4}
        </Text>
        {aux_has_cita4 ? (
          <Text selectable={true} style={this.styles.red}>
            {aux_cita4}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {aux_titol_lectura4}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {aux_lectura4}
        </Text>
      </View>
    );
  }

  himneOhDeu() {
    if (this.hours.office.teDeumInformation.enabled) {
      const aux0 = this.hours.office.teDeumInformation.anthem.split('\n\n[')[0];
      const aux1 = this.hours.office.teDeumInformation.anthem.split('\n\n[')[1];
      const himnePart1 = aux0;
      const himnePart2 = aux1.split(']')[0];
      return (
        <View>
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'HIMNE'}</SectionTitle>
          <Text selectable={true} style={this.styles.black}>
            {himnePart1}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.redItalic}>
            {'Aquesta última part es pot ometre:\n'}
          </Text>
          <Text selectable={true} style={this.styles.black}>
            {himnePart2}
          </Text>
        </View>
      );
    }
  }

  finalPrayer() {
    const aux_oracio = GlobalViewFunctions.completeOracio(GlobalViewFunctions.rs(this.hours.office.finalPrayer), false);
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_oracio}
      </Text>
    );
  }
}

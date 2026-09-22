import React, { Component } from 'react';
import { Text, View } from 'react-native';
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

// Completes. Gets through props the hours of the day (hours), the day (today) and the settings;
// a new Marian antiphon goes to onVirginAntiphonChange.
export default class NightPrayerComponent extends Component {
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    // In Easter, always the fifth antiphon (Regina caeli); outside it, the one chosen last time
    let auxNumAntMare = props.settings.VirginAntiphonOption;

    if (props.today.GenericLiturgyTime === GenericLiturgyTimeType.Easter && auxNumAntMare !== '5') {
      auxNumAntMare = '5';
      props.onVirginAntiphonChange('5');
    } else if (!(props.today.GenericLiturgyTime === GenericLiturgyTimeType.Easter) && auxNumAntMare === '5') {
      auxNumAntMare = '1';
      props.onVirginAntiphonChange('1');
    }

    this.state = {
      numAntMare: auxNumAntMare,
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

  get COMPLETES() {
    return this.props.hours.NightPrayer;
  }

  onAntMarePress(numAntMare) {
    this.setState({ numAntMare: numAntMare });
    this.props.onVirginAntiphonChange(numAntMare);
  }

  antMareComp(numAntMare) {
    let antMare;

    switch (numAntMare) {
      case '1':
        antMare = GlobalViewFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonFirstOption);
        break;
      case '2':
        antMare = GlobalViewFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonSecondOption);
        break;
      case '3':
        antMare = GlobalViewFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonThirdOption);
        break;
      case '4':
        antMare = GlobalViewFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonFourthOption);
        break;
      case '5':
        antMare = GlobalViewFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonFifthOption);
        break;
    }

    return (
      <View>
        {!(this.today.GenericLiturgyTime === GenericLiturgyTimeType.Easter) ? (
          <ChoiceChips
            accessibilityLabel="Antífona final de la Mare de Déu"
            options={MARIAN_ANTIPHONS}
            value={numAntMare}
            onChange={this.onAntMarePress.bind(this)}
          />
        ) : (
          <Gap size="small" />
        )}
        <Text selectable={true} style={this.styles.black}>
          {antMare}
        </Text>
      </View>
    );
  }

  render() {
    try {
      if (this.COMPLETES !== null) {
        const gloriaStringIntro =
          'Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.';
        const is_special_initial_message =
          this.today.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum && this.today.Date.getDay() === 6;
        const aux_special_initial_message =
          'Avui, només han de dir aquestes Completes els qui no participen en la Vetlla pasqual.';
        const aux_sigueu = 'Sigueu amb nosaltres, Déu nostre.';
        const aux_veniu = 'Senyor, veniu a ajudar-nos.';
        const is_aleluia =
          this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
          this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
          this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
          this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
          this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum;
        const aux_lloable = 'És lloable que aquí es faci examen de consciència.';
        const aux_acte_pen = this.COMPLETES.PenitentialAct;
        const aux_himne = GlobalViewFunctions.rs(this.COMPLETES.Anthem);
        const is_dos_salms = this.COMPLETES.HasMultiplePsalms;
        const has_distint_ant = !this.COMPLETES.UseOnlyFirstPsalmAntiphon;
        const aux_ant1 = GlobalViewFunctions.rs(this.COMPLETES.FirstPsalm.Antiphon);
        const aux_titol1 = GlobalViewFunctions.rs(this.COMPLETES.FirstPsalm.Title);
        const has_com1 = StringManagement.HasLiturgyContent(this.COMPLETES.FirstPsalm.Comment);
        const aux_com1 = has_com1 ? GlobalViewFunctions.rs(this.COMPLETES.FirstPsalm.Comment) : '';
        const aux_salm1 = this.salm(GlobalViewFunctions.rs(this.COMPLETES.FirstPsalm.Psalm));
        let aux_ant2;
        let aux_titol2;
        let has_com2;
        let aux_com2;
        let aux_salm2;
        if (is_dos_salms) {
          aux_ant2 = has_distint_ant ? GlobalViewFunctions.rs(this.COMPLETES.SecondPsalm.Antiphon) : '';
          aux_titol2 = GlobalViewFunctions.rs(this.COMPLETES.SecondPsalm.Title);
          has_com2 = StringManagement.HasLiturgyContent(this.COMPLETES.SecondPsalm.Comment);
          aux_com2 = has_com2 ? GlobalViewFunctions.rs(this.COMPLETES.SecondPsalm.Comment) : '';
          aux_salm2 = this.salm(GlobalViewFunctions.rs(this.COMPLETES.SecondPsalm.Psalm));
        }
        const aux_vers = GlobalViewFunctions.rs(this.COMPLETES.ShortReading.Quote);
        const aux_lectura_breu = GlobalViewFunctions.rs(this.COMPLETES.ShortReading.ShortReading);
        let aux_ant_special;
        let aux_resp_1_2;
        let aux_resp_2;
        let aux_resp_3;
        const is_normal_resp = !this.COMPLETES.ShortResponsory.HasSpecialAntiphon;
        if (is_normal_resp) {
          aux_resp_1_2 = GlobalViewFunctions.respTogether(
            GlobalViewFunctions.rs(this.COMPLETES.ShortResponsory.FirstPart),
            GlobalViewFunctions.rs(this.COMPLETES.ShortResponsory.SecondPart),
          );
          aux_resp_2 = GlobalViewFunctions.rs(this.COMPLETES.ShortResponsory.SecondPart);
          aux_resp_3 = GlobalViewFunctions.rs(this.COMPLETES.ShortResponsory.ThirdPart);
        } else {
          aux_ant_special = GlobalViewFunctions.rs(this.COMPLETES.ShortResponsory.SpecialAntiphon);
        }
        const aux_gloria_half = " Glòria al Pare i al Fill i a l'Esperit Sant.";
        const aux_ant_cantic = GlobalViewFunctions.rs(this.COMPLETES.EvangelicalAntiphon);
        const aux_titol_cantic = "Càntic\nLc 2, 29-32\nCrist, llum de les nacions i glòria d'Israel";
        const aux_cantic = this.salm(GlobalViewFunctions.rs(this.COMPLETES.EvangelicalChant));
        const aux_gloria_cantic = 'Glòria.';
        const aux_oracio = GlobalViewFunctions.rs(this.COMPLETES.FinalPrayer);
        const aux_fi_benaurada = 'Que el Senyor totpoderós ens concedeixi una nit tranquil·la i una fi benaurada.';
        const aux_antifona_final = 'Antífona final de la Mare de Déu';

        return (
          <View>
            {is_special_initial_message ? (
              <View>
                <Text selectable={true} style={this.styles.redCenter}>
                  {aux_special_initial_message}
                </Text>
                <Gap />
                <HR />
                <Gap />
              </View>
            ) : null}
            <Rubric label={'V. '}>{aux_sigueu}</Rubric>
            <Rubric label={'R. '}>{aux_veniu}</Rubric>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {gloriaStringIntro}
              {is_aleluia ? (
                <Text selectable={true} style={this.styles.black}>
                  {' Al·leluia.'}
                </Text>
              ) : null}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {aux_lloable}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {aux_acte_pen}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'HIMNE'}</SectionTitle>
            <Text selectable={true} style={this.styles.black}>
              {aux_himne}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'SALMÒDIA'}</SectionTitle>
            {is_dos_salms ? (
              <View>
                {has_distint_ant ? (
                  <Rubric label={'Ant. 1. '}>{aux_ant1}</Rubric>
                ) : (
                  <Rubric label={'Ant. '}>{aux_ant1}</Rubric>
                )}
                <Gap />
                <Text selectable={true} style={this.styles.redCenter}>
                  {aux_titol1}
                </Text>
                <Gap />
                {has_com1 ? (
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
                {this.COMPLETES.FirstPsalm.HasGloryPrayer ? (
                  <Text selectable={true} style={this.styles.blackItalic}>
                    {'Glòria.'}
                  </Text>
                ) : (
                  <Text selectable={true} style={this.styles.redItalic}>
                    {"S'omet el Glòria."}
                  </Text>
                )}
                <Gap />
                {has_distint_ant ? (
                  <View>
                    <Rubric label={'Ant. 1. '}>{aux_ant1}</Rubric>
                    <Gap />
                    <Rubric label={'Ant. 2. '}>{aux_ant2}</Rubric>
                    <Gap />
                  </View>
                ) : null}
                <Text selectable={true} style={this.styles.redCenter}>
                  {aux_titol2}
                </Text>
                <Gap />
                {has_com2 !== '-' ? (
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
                {this.COMPLETES.SecondPsalm.HasGloryPrayer ? (
                  <Text selectable={true} style={this.styles.blackItalic}>
                    {'Glòria.'}
                  </Text>
                ) : (
                  <Text selectable={true} style={this.styles.redItalic}>
                    {"S'omet el Glòria."}
                  </Text>
                )}
                <Gap />
                {has_distint_ant ? (
                  <View>
                    <Rubric label={'Ant. 2. '}>{aux_ant2}</Rubric>
                  </View>
                ) : (
                  <View>
                    <Rubric label={'Ant. '}>{aux_ant1}</Rubric>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <Rubric label={'Ant. '}>{aux_ant1}</Rubric>
                <Gap />
                <Text selectable={true} style={this.styles.redCenter}>
                  {aux_titol1}
                </Text>
                <Gap />
                {has_com1 ? (
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
                {this.COMPLETES.FirstPsalm.HasGloryPrayer ? (
                  <Text selectable={true} style={this.styles.blackItalic}>
                    {'Glòria.'}
                  </Text>
                ) : (
                  <Text selectable={true} style={this.styles.redItalic}>
                    {"S'omet el Glòria."}
                  </Text>
                )}
                <Gap />
                <Rubric label={'Ant. '}>{aux_ant1}</Rubric>
              </View>
            )}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'LECTURA BREU'}</SectionTitle>
            <Text selectable={true} style={this.styles.red}>
              {aux_vers}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {aux_lectura_breu}
            </Text>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'RESPONSORI BREU'}</SectionTitle>
            {is_normal_resp ? (
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
            ) : (
              <View>
                <Rubric label={'Ant. '}>{aux_ant_special}</Rubric>
              </View>
            )}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'CÀNTIC DE SIMEÓ'}</SectionTitle>
            <Rubric label={'Ant. '}>{aux_ant_cantic}</Rubric>
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {aux_titol_cantic}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.black}>
              {aux_cantic}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.blackItalic}>
              {aux_gloria_cantic}
            </Text>
            <Gap />
            <Rubric label={'Ant. '}>{aux_ant_cantic}</Rubric>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'ORACIÓ'}</SectionTitle>
            <Text selectable={true} style={this.styles.blackBold}>
              {'Preguem.'}
            </Text>
            <Text selectable={true} style={this.styles.black}>
              {aux_oracio}
            </Text>
            <Rubric label={'R. '}>{'Amén.'}</Rubric>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'CONCLUSIÓ'}</SectionTitle>
            <Rubric label={'V. '}>{aux_fi_benaurada}</Rubric>
            <Rubric label={'R. '}>{'Amén.'}</Rubric>
            <Gap />
            <HR />
            <Gap />
            <Text selectable={true} accessibilityRole="header" style={this.styles.centeredTitle}>
              {aux_antifona_final}
            </Text>
            {this.antMareComp(this.state.numAntMare)}
            <Gap />
          </View>
        );
      } else {
        Logger.LogError(Logger.LogKeys.Screens, 'render', new Error('wierd error.......'));
        return null;
      }
    } catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, 'render', error);
      return null;
    }
  }

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
}

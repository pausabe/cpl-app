import React, { Component } from 'react';
import { Text, View } from 'react-native';
import HR from '../../../components/HRComponent';
import Gap from '../../../components/Gap';
import Rubric from '../../../components/Rubric';
import SectionTitle from '../../../components/SectionTitle';
import GlobalViewFunctions from '../../../utils/globalViewFunctions';
import * as Logger from '../../../utils/logger';
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { StringManagement } from '../../../utils/StringManagement';
import { ThemeContext, prayerTextStyles } from '../../../theme';

// Tèrcia, Sexta or Nona. Gets the hour (HORA_MENOR) and the day (today) through props.
export default class HoursComponent extends Component {
  static contextType = ThemeContext;

  get styles() {
    return prayerTextStyles(this.context);
  }

  get today() {
    return this.props.today;
  }

  get specificHour() {
    return this.props.HORA_MENOR;
  }

  render() {
    try {
      const gloriaStringIntro =
        'Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.';
      const aux_isAleluia =
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
        this.today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum;

      return (
        <View>
          <Rubric label={'V. '}>{'Sigueu amb nosaltres, Déu nostre.'}</Rubric>
          <Rubric label={'R. '}>{'Senyor, veniu a ajudar-nos.'}</Rubric>
          <Gap />
          <Text selectable={true} style={this.styles.black}>
            {gloriaStringIntro}
            {aux_isAleluia ? (
              <Text selectable={true} style={this.styles.black}>
                {' Al·leluia.'}
              </Text>
            ) : null}
          </Text>
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
          {this.lecturaBreuResp()}
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

  salm(salm) {
    if (!salm) return null;
    salm = salm.replace(/ {4}[*]/g, '');
    salm = salm.replace(/ {3}[*]/g, '');
    salm = salm.replace(/ {2}[*]/g, '');
    salm = salm.replace(/ [*]/g, '');
    salm = salm.replace(/ {4}[†]/g, '');
    salm = salm.replace(/ {3}[†]/g, '');
    salm = salm.replace(/ {2}[†]/g, '');
    salm = salm.replace(/ [†]/g, '');
    return salm;
  }

  himne() {
    const aux_himne = GlobalViewFunctions.rs(this.specificHour.Anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_himne}
      </Text>
    );
  }

  salmodia() {
    const aux_antifones = this.specificHour.HasMultipleAntiphons;
    const aux_ant1 = aux_antifones ? GlobalViewFunctions.rs(this.specificHour.FirstPsalm.Antiphon) : '';
    const aux_ant = !aux_antifones ? GlobalViewFunctions.rs(this.specificHour.UniqueAntiphon) : '';
    const aux_titol1 = GlobalViewFunctions.rs(this.specificHour.FirstPsalm.Title);
    const aux_has_com1 = StringManagement.hasLiturgyContent(this.specificHour.FirstPsalm.Comment);
    const aux_com1 = aux_has_com1 ? GlobalViewFunctions.rs(this.specificHour.FirstPsalm.Comment) : '';
    const aux_salm1 = this.salm(GlobalViewFunctions.rs(this.specificHour.FirstPsalm.Psalm));
    const aux_ant2 = aux_antifones ? GlobalViewFunctions.rs(this.specificHour.SecondPsalm.Antiphon) : '';
    const aux_titol2 = GlobalViewFunctions.rs(this.specificHour.SecondPsalm.Title);
    const aux_has_com2 = StringManagement.hasLiturgyContent(this.specificHour.SecondPsalm.Comment);
    const aux_com2 = aux_has_com2 ? GlobalViewFunctions.rs(this.specificHour.SecondPsalm.Comment) : '';
    const aux_salm2 = this.salm(GlobalViewFunctions.rs(this.specificHour.SecondPsalm.Psalm));
    const aux_ant3 = aux_antifones ? GlobalViewFunctions.rs(this.specificHour.ThirdPsalm.Antiphon) : '';
    const aux_titol3 = GlobalViewFunctions.rs(this.specificHour.ThirdPsalm.Title);
    const aux_has_com3 = StringManagement.hasLiturgyContent(this.specificHour.ThirdPsalm.Comment);
    const aux_com3 = aux_has_com3 ? GlobalViewFunctions.rs(this.specificHour.ThirdPsalm.Comment) : '';
    const aux_salm3 = this.salm(GlobalViewFunctions.rs(this.specificHour.ThirdPsalm.Psalm));

    return (
      <View>
        {aux_antifones ? (
          <View>
            <Rubric label={'Ant. 1. '}>{aux_ant1}</Rubric>
          </View>
        ) : (
          <View>
            <Rubric label={'Ant. '}>{aux_ant}</Rubric>
          </View>
        )}
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol1}
        </Text>
        <Gap />
        {aux_has_com1 ? (
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
        {this.specificHour.FirstPsalm.HasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        {aux_antifones ? (
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
        {aux_has_com2 ? (
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
        {this.specificHour.SecondPsalm.HasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        {aux_antifones ? (
          <View>
            <Rubric label={'Ant. 2. '}>{aux_ant2}</Rubric>
            <Gap />
            <Rubric label={'Ant. 3. '}>{aux_ant3}</Rubric>
            <Gap />
          </View>
        ) : null}
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol3}
        </Text>
        <Gap />
        {aux_has_com3 ? (
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
        {this.specificHour.ThirdPsalm.HasGloryPrayer ? (
          <Text selectable={true} style={this.styles.blackItalic}>
            {'Glòria.'}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.redItalic}>
            {"S'omet el Glòria."}
          </Text>
        )}
        <Gap />
        {aux_antifones ? (
          <View>
            <Rubric label={'Ant. 3. '}>{aux_ant3}</Rubric>
          </View>
        ) : (
          <View>
            <Rubric label={'Ant. '}>{aux_ant}</Rubric>
          </View>
        )}
      </View>
    );
  }

  lecturaBreuResp() {
    const aux_vers = GlobalViewFunctions.rs(this.specificHour.ShortReading.Quote);
    const aux_lecturaBreu = GlobalViewFunctions.rs(this.specificHour.ShortReading.ShortReading);
    const aux_respV = GlobalViewFunctions.rs(this.specificHour.Responsory.Versicle);
    const aux_respR = GlobalViewFunctions.rs(this.specificHour.Responsory.Response);

    return (
      <View>
        <Text selectable={true} style={this.styles.red}>
          {aux_vers}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {aux_lecturaBreu}
        </Text>
        <Gap />
        <Rubric label={'V. '}>{aux_respV}</Rubric>
        <Rubric label={'R. '}>{aux_respR}</Rubric>
      </View>
    );
  }

  finalPrayer() {
    const aux_oracio = GlobalViewFunctions.completeOracio(GlobalViewFunctions.rs(this.specificHour.FinalPrayer), true);
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_oracio}
      </Text>
    );
  }
}

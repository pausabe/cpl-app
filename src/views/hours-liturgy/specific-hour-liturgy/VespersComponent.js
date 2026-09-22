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

  himne() {
    const aux_himne = GlobalViewFunctions.rs(this.hours.Vespers.Anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_himne}
      </Text>
    );
  }

  salmodia() {
    const aux_ant1 = GlobalViewFunctions.rs(this.hours.Vespers.FirstPsalm.Antiphon);
    const aux_titol1 = GlobalViewFunctions.rs(this.hours.Vespers.FirstPsalm.Title);
    let aux_com1 = '';
    if (StringManagement.hasLiturgyContent(this.hours.Vespers.FirstPsalm.Comment))
      aux_com1 = GlobalViewFunctions.rs(this.hours.Vespers.FirstPsalm.Comment);
    const aux_salm1 = this.salm(GlobalViewFunctions.rs(this.hours.Vespers.FirstPsalm.Psalm));
    const aux_ant2 = GlobalViewFunctions.rs(this.hours.Vespers.SecondPsalm.Antiphon);
    const aux_titol2 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.Vespers.SecondPsalm.Title));
    let aux_com2 = '';
    if (StringManagement.hasLiturgyContent(this.hours.Vespers.SecondPsalm.Comment))
      aux_com2 = GlobalViewFunctions.rs(this.hours.Vespers.SecondPsalm.Comment);
    const aux_salm2 = this.salm(GlobalViewFunctions.rs(this.hours.Vespers.SecondPsalm.Psalm));
    const aux_ant3 = GlobalViewFunctions.rs(this.hours.Vespers.ThirdPsalm.Antiphon);
    const aux_titol3 = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.Vespers.ThirdPsalm.Title));
    let aux_com3 = '';
    if (StringManagement.hasLiturgyContent(this.hours.Vespers.ThirdPsalm.Comment))
      aux_com3 = GlobalViewFunctions.rs(this.hours.Vespers.ThirdPsalm.Comment);
    const aux_salm3 = this.salm(GlobalViewFunctions.rs(this.hours.Vespers.ThirdPsalm.Psalm));

    return (
      <View>
        <Rubric label={'Ant. 1.'}> {aux_ant1}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {aux_titol1}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.Vespers.FirstPsalm.Comment) ? (
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
        {this.hours.Vespers.FirstPsalm.HasGloryPrayer ? (
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
        {StringManagement.hasLiturgyContent(this.hours.Vespers.SecondPsalm.Comment) ? (
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
        {this.hours.Vespers.SecondPsalm.HasGloryPrayer ? (
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
        {StringManagement.hasLiturgyContent(this.hours.Vespers.ThirdPsalm.Comment) ? (
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
        {this.hours.Vespers.ThirdPsalm.HasGloryPrayer ? (
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
    const aux_vers = GlobalViewFunctions.rs(this.hours.Vespers.ShortReading.Quote);
    const aux_lectura_breu = GlobalViewFunctions.rs(this.hours.Vespers.ShortReading.ShortReading);
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
    if (this.hours.Vespers.ShortResponsory.HasSpecialAntiphon) {
      const aux_ant = GlobalViewFunctions.rs(this.hours.Vespers.ShortResponsory.SpecialAntiphon);
      return (
        <View>
          <Rubric label={'Ant.'}> {aux_ant}</Rubric>
        </View>
      );
    } else {
      const aux_resp_1_2 = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.Vespers.ShortResponsory.FirstPart),
        GlobalViewFunctions.rs(this.hours.Vespers.ShortResponsory.SecondPart),
      );
      const aux_resp_2 = GlobalViewFunctions.rs(this.hours.Vespers.ShortResponsory.SecondPart);
      const aux_resp_3 = GlobalViewFunctions.rs(this.hours.Vespers.ShortResponsory.ThirdPart);
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
    const aux_ant = GlobalViewFunctions.rs(this.hours.Vespers.EvangelicalAntiphon);
    const aux_titol = 'Càntic\nLc 1, 46-55\nLa meva ànima magnifica el Senyor';
    const aux_salm = this.salm(this.hours.Vespers.EvangelicalChant);
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
    let allPregs = GlobalViewFunctions.rs(this.hours.Vespers.Prayers);

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
        if (pregaries.search(':  Pare nostre.') !== -1) {
          pregaries = pregaries.replace(':  Pare nostre.', ':');
        } else {
          Logger.log(Logger.LogKeys.Screens, 'pregaries', 'InfoLog. something incorrect. Pregaries 3');
          return (
            <Text selectable={true} style={this.styles.black}>
              {allPregs}
            </Text>
          );
        }
      }

      pregsFinalPart = pregaries.split('—')[numGuio - 1].split('.\n\n')[1] + '—' + pregaries.split('—')[numGuio];
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
    const aux_oracio = GlobalViewFunctions.completeOracio(
      GlobalViewFunctions.rs(this.hours.Vespers.FinalPrayer),
      false,
    );
    return (
      <Text selectable={true} style={this.styles.black}>
        {aux_oracio}
      </Text>
    );
  }
}

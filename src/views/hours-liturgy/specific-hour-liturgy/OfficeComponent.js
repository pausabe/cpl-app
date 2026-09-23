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
import ContinueButton from '../../../components/ContinueButton';
import GlobalViewFunctions from '../../../utils/globalViewFunctions';
import * as Logger from '../../../utils/logger';
import { SpecificLiturgyTimeType } from '../../../services/celebrationTimeEnums';
import { StringManagement } from '../../../utils/StringManagement';
import { ThemeContext, prayerTextStyles } from '../../../theme';

const INVITATORY_PSALMS = ['94', '99', '66', '23'];

// The Office of Readings. Gets through props the hours of the day (hours), the day (today), the
// settings and the titles of the day's psalms (titles); a new invitatory psalm goes to
// onInvitationPsalmChange.
export default class OfficeComponent extends Component {
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

  // Everything the hour shows goes through the flow, which sews the paragraphs that follow one
  // another into a single text: that way a selection can go from one to the next
  render() {
    return <PrayerFlow>{this.content()}</PrayerFlow>;
  }

  content() {
    try {
      if (this.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
        let easterVigilReplacesOffice = "La Vetlla pasqual substitueix avui l'Ofici de lectura.";
        let easterVigilReadingsNotice =
          "Els qui no participen en la solemne Vetlla pasqual n'escolliran almenys quatre lectures, amb els corresponents salms responsorials i oracions. Les lectures més adients són les que segueixen.";
        let officeStartsWithReadings = "L'Ofici comença directament per les lectures.";

        return (
          <View>
            <Text selectable={true} style={this.styles.redCenter}>
              {easterVigilReplacesOffice}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {easterVigilReadingsNotice}
            </Text>
            <Gap />
            <Text selectable={true} style={this.styles.redCenter}>
              {officeStartsWithReadings}
            </Text>
            <Gap />
            <HR />
            <Gap />
            {this.easterSundayReadings()}
            {this.teDeumHymn()}
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
            {this.hymn()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'SALMÒDIA'}</SectionTitle>
            {this.psalmody()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'VERS'}</SectionTitle>
            {this.versicle()}
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'LECTURES'}</SectionTitle>
            {this.readings()}
            {this.teDeumHymn()}
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
        <Text selectable={true} style={this.styles.blackSmallItalicRight}>
          {psalmReference}
        </Text>
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
    const showInvitatory = this.state.showInvitatory;

    if (showInvitatory) {
      const openLipsVersicle = 'Obriu-me els llavis, Senyor.';
      const openLipsResponse = 'I proclamaré la vostra lloança.';

      return (
        <View>
          {this.invitatoryButtons()}
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

  // TODO: [UI Refactor] duplicated code
  hymn() {
    const hymn = GlobalViewFunctions.rs(this.hours.office.anthem);
    return (
      <Text selectable={true} style={this.styles.black}>
        {hymn}
      </Text>
    );
  }

  // TODO: [UI Refactor] at this point I will stop mention duplication. Is all super duplicated and all Views need a complete refactor
  psalmody() {
    const firstAntiphon = GlobalViewFunctions.rs(this.hours.office.firstPsalm.antiphon);
    const firstTitle = GlobalViewFunctions.rs(this.hours.office.firstPsalm.title);
    let firstComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.office.firstPsalm.comment))
      firstComment = GlobalViewFunctions.rs(this.hours.office.firstPsalm.comment);
    const firstPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.office.firstPsalm.psalm));
    const secondAntiphon = GlobalViewFunctions.rs(this.hours.office.secondPsalm.antiphon);
    const secondTitle = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.office.secondPsalm.title));
    let secondComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.office.secondPsalm.comment))
      secondComment = GlobalViewFunctions.rs(this.hours.office.secondPsalm.comment);
    const secondPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.office.secondPsalm.psalm));
    const thirdAntiphon = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.antiphon);
    const thirdTitle = GlobalViewFunctions.canticSpace(GlobalViewFunctions.rs(this.hours.office.thirdPsalm.title));
    let thirdComment = '';
    if (StringManagement.hasLiturgyContent(this.hours.office.thirdPsalm.comment))
      thirdComment = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.comment);
    const thirdPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.office.thirdPsalm.psalm));

    return (
      <View>
        <Rubric label={'Ant. 1.'}> {firstAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {firstTitle}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.office.firstPsalm.comment) ? (
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
        <Rubric label={'Ant. 1.'}> {firstAntiphon}</Rubric>
        <Gap />
        <Rubric label={'Ant. 2.'}> {secondAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {secondTitle}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.office.secondPsalm.comment) ? (
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
        <Rubric label={'Ant. 2.'}> {secondAntiphon}</Rubric>
        <Gap />
        <Rubric label={'Ant. 3.'}> {thirdAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {thirdTitle}
        </Text>
        <Gap />
        {StringManagement.hasLiturgyContent(this.hours.office.thirdPsalm.comment) ? (
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
        <Rubric label={'Ant. 3.'}> {thirdAntiphon}</Rubric>
      </View>
    );
  }

  versicle() {
    const responsoryVersicle = GlobalViewFunctions.rs(this.hours.office.responsory.versicle);
    const responsoryResponse = GlobalViewFunctions.rs(this.hours.office.responsory.response);

    return (
      <View>
        <Rubric label={'V. '}>{responsoryVersicle}</Rubric>
        <Rubric label={'R. '}>{responsoryResponse}</Rubric>
      </View>
    );
  }

  readings() {
    try {
      const firstReadingReference = GlobalViewFunctions.rs(this.hours.office.firstReading.reference);
      const firstReadingTitle = GlobalViewFunctions.rs(this.hours.office.firstReading.title);
      const hasFirstReadingQuote = this.hours.office.firstReading.quote !== '-';
      const firstReadingQuote = hasFirstReadingQuote
        ? GlobalViewFunctions.rs(this.hours.office.firstReading.quote)
        : '';
      const firstReadingText = GlobalViewFunctions.rs(this.hours.office.firstReading.reading);
      const hasFirstResponsoryQuote = this.hours.office.firstReading.responsory.quote !== '-';
      const firstResponsoryQuote = hasFirstResponsoryQuote
        ? GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.quote)
        : '';
      const firstResponsoryFirstAndSecondPart = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.firstPart),
        GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.secondPart),
      );
      const firstResponsorySecondPart = GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.secondPart);
      const firstResponsoryThirdPart = GlobalViewFunctions.rs(this.hours.office.firstReading.responsory.thirdPart);
      const secondReadingReference = GlobalViewFunctions.rs(this.hours.office.secondReading.reference);
      const secondReadingTitle = GlobalViewFunctions.rs(this.hours.office.secondReading.title);
      const hasSecondReadingQuote =
        this.hours.office.secondReading.quote != null && this.hours.office.secondReading.quote !== '-';
      const secondReadingQuote = hasSecondReadingQuote
        ? GlobalViewFunctions.rs(this.hours.office.secondReading.quote)
        : '';
      const secondReadingText = GlobalViewFunctions.rs(this.hours.office.secondReading.reading);
      const hasSecondResponsoryQuote = this.hours.office.secondReading.responsory.quote !== '-';
      const secondResponsoryQuote = hasSecondResponsoryQuote
        ? GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.quote)
        : '';
      const secondResponsoryFirstAndSecondPart = GlobalViewFunctions.respTogether(
        GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.firstPart),
        GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.secondPart),
      );
      const secondResponsorySecondPart = GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.secondPart);
      const secondResponsoryThirdPart = GlobalViewFunctions.rs(this.hours.office.secondReading.responsory.thirdPart);

      return (
        <View>
          <Text selectable={true} style={this.styles.red}>
            {'Lectura primera'}
          </Text>
          <Text selectable={true} style={this.styles.black}>
            {firstReadingReference}
          </Text>
          {hasFirstReadingQuote ? (
            <Text selectable={true} style={this.styles.red}>
              {firstReadingQuote}
            </Text>
          ) : null}
          <Gap />
          <Text selectable={true} style={this.styles.redCenterBold}>
            {firstReadingTitle}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.blackJustified}>
            {firstReadingText}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.red}>
            {'Responsori'}
          </Text>
          {hasFirstResponsoryQuote ? (
            <Text selectable={true} style={this.styles.red}>
              {firstResponsoryQuote}
            </Text>
          ) : null}
          <Rubric label={'R. '}>{firstResponsoryFirstAndSecondPart}</Rubric>
          <Rubric label={'V. '}>{firstResponsoryThirdPart}</Rubric>
          <Rubric label={'R. '}>{firstResponsorySecondPart}</Rubric>
          <Gap />
          <Text selectable={true} style={this.styles.red}>
            {'Lectura segona'}
          </Text>
          <Text selectable={true} style={this.styles.black}>
            {secondReadingReference}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.redCenterBold}>
            {secondReadingTitle}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.blackJustified}>
            {secondReadingText}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.red}>
            {'Responsori'}
          </Text>
          {hasSecondResponsoryQuote ? (
            <Text selectable={true} style={this.styles.red}>
              {secondResponsoryQuote}
            </Text>
          ) : null}
          <Rubric label={'R. '}>{secondResponsoryFirstAndSecondPart}</Rubric>
          <Rubric label={'V. '}>{secondResponsoryThirdPart}</Rubric>
          <Rubric label={'R. '}>{secondResponsorySecondPart}</Rubric>
        </View>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'readings', error);
      return null;
    }
  }

  easterSundayReadings() {
    const firstReadingReference = GlobalViewFunctions.rs(this.hours.office.firstReading.reference);
    const firstReadingTitle = GlobalViewFunctions.rs(this.hours.office.firstReading.title);
    const hasFirstReadingQuote = this.hours.office.firstReading.quote !== '-';
    const firstReadingQuote = hasFirstReadingQuote ? GlobalViewFunctions.rs(this.hours.office.firstReading.quote) : '';
    const firstReadingText = GlobalViewFunctions.rs(this.hours.office.firstReading.reading);

    const firstAntiphon = GlobalViewFunctions.rs(this.hours.office.firstPsalm.antiphon);
    const firstTitle = GlobalViewFunctions.rs(this.hours.office.firstPsalm.title);
    const firstPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.office.firstPsalm.psalm));
    const firstGloria = 'Glòria.';
    const firstPrayer = GlobalViewFunctions.rs(this.hours.office.firstPsalm.prayer);

    const secondReadingReference = GlobalViewFunctions.rs(this.hours.office.secondReading.reference);
    const secondReadingTitle = GlobalViewFunctions.rs(this.hours.office.secondReading.title);
    const hasSecondReadingQuote = this.hours.office.secondReading.quote !== '-';
    const secondReadingQuote = hasSecondReadingQuote
      ? GlobalViewFunctions.rs(this.hours.office.secondReading.quote)
      : '';
    const secondReadingText = GlobalViewFunctions.rs(this.hours.office.secondReading.reading);

    const secondAntiphon = GlobalViewFunctions.rs(this.hours.office.secondPsalm.antiphon);
    const secondTitle = GlobalViewFunctions.rs(this.hours.office.secondPsalm.title);
    const secondPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.office.secondPsalm.psalm));
    const secondGloria = 'Glòria.';
    const secondPrayer = GlobalViewFunctions.rs(this.hours.office.secondPsalm.prayer);

    const thirdReadingReference = GlobalViewFunctions.rs(this.hours.office.thirdReading.reference);
    const thirdReadingTitle = GlobalViewFunctions.rs(this.hours.office.thirdReading.title);
    const hasThirdReadingQuote = this.hours.office.thirdReading.quote !== '-';
    const thirdReadingQuote = hasThirdReadingQuote ? GlobalViewFunctions.rs(this.hours.office.thirdReading.quote) : '';
    const thirdReadingText = GlobalViewFunctions.rs(this.hours.office.thirdReading.reading);

    const thirdAntiphon = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.antiphon);
    const thirdTitle = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.title);
    const thirdPsalm = this.psalm(GlobalViewFunctions.rs(this.hours.office.thirdPsalm.psalm));
    const thirdGloria = 'Glòria.';
    const thirdPrayer = GlobalViewFunctions.rs(this.hours.office.thirdPsalm.prayer);

    const fourthReadingReference = GlobalViewFunctions.rs(this.hours.office.fourthReading.reference);
    const fourthReadingTitle = GlobalViewFunctions.rs(this.hours.office.fourthReading.title);
    const hasFourthReadingQuote = this.hours.office.fourthReading.quote !== '-';
    const fourthReadingQuote = hasFourthReadingQuote
      ? GlobalViewFunctions.rs(this.hours.office.fourthReading.quote)
      : '';
    const fourthReadingText = GlobalViewFunctions.rs(this.hours.office.fourthReading.reading);

    return (
      <View>
        <Text selectable={true} style={this.styles.red}>
          {'Lectura primera'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {firstReadingReference}
        </Text>
        {hasFirstReadingQuote ? (
          <Text selectable={true} style={this.styles.red}>
            {firstReadingQuote}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {firstReadingTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {firstReadingText}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {firstTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {firstPsalm}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {firstGloria}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{firstAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.blackBold}>
          {'Preguem.'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {firstPrayer}
        </Text>
        <Rubric label={'R. '}>{'Amén.'}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura segona'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {secondReadingReference}
        </Text>
        {hasSecondReadingQuote ? (
          <Text selectable={true} style={this.styles.red}>
            {secondReadingQuote}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {secondReadingTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {secondReadingText}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{secondAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {secondTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {secondPsalm}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {secondGloria}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{secondAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.blackBold}>
          {'Preguem.'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {secondPrayer}
        </Text>
        <Rubric label={'R. '}>{'Amén.'}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura tercera'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {thirdReadingReference}
        </Text>
        {hasThirdReadingQuote ? (
          <Text selectable={true} style={this.styles.red}>
            {thirdReadingQuote}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {thirdReadingTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {thirdReadingText}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{thirdAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.redCenter}>
          {thirdTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {thirdPsalm}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackItalic}>
          {thirdGloria}
        </Text>
        <Gap />
        <Rubric label={'Ant. '}>{thirdAntiphon}</Rubric>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura quarta'}
        </Text>
        <Text selectable={true} style={this.styles.black}>
          {fourthReadingReference}
        </Text>
        {hasFourthReadingQuote ? (
          <Text selectable={true} style={this.styles.red}>
            {fourthReadingQuote}
          </Text>
        ) : null}
        <Gap />
        <Text selectable={true} style={this.styles.redCenterBold}>
          {fourthReadingTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {fourthReadingText}
        </Text>
      </View>
    );
  }

  teDeumHymn() {
    if (this.hours.office.teDeumInformation.enabled) {
      const anthemFirstPart = this.hours.office.teDeumInformation.anthem.split('\n\n[')[0];
      const anthemRest = this.hours.office.teDeumInformation.anthem.split('\n\n[')[1];
      const hymnFirstPart = anthemFirstPart;
      const hymnSecondPart = anthemRest.split(']')[0];
      return (
        <View>
          <Gap />
          <HR />
          <Gap />
          <SectionTitle>{'HIMNE'}</SectionTitle>
          <Text selectable={true} style={this.styles.black}>
            {hymnFirstPart}
          </Text>
          <Gap />
          <Text selectable={true} style={this.styles.redItalic}>
            {'Aquesta última part es pot ometre:\n'}
          </Text>
          <Text selectable={true} style={this.styles.black}>
            {hymnSecondPart}
          </Text>
        </View>
      );
    }
  }

  finalPrayer() {
    const prayer = GlobalViewFunctions.completePrayer(GlobalViewFunctions.rs(this.hours.office.finalPrayer), false);
    return (
      <Text selectable={true} style={this.styles.black}>
        {prayer}
      </Text>
    );
  }
}

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import GlobalViewFunctions from '../../utils/globalViewFunctions';
import HR from '../../components/HRComponent';
import Gap from '../../components/Gap';
import PrayerFlow from '../../components/PrayerFlow';
// A Text that on iOS can be selected by the piece, and a plain Text where it is not selectable
import Text from '../../components/PrayerText';
import EdgeToEdgeScrollView from '../../components/EdgeToEdgeScrollView';
import SectionTitle from '../../components/SectionTitle';
import ContinueButton from '../../components/ContinueButton';
import ChoiceChips from '../../components/ChoiceChips';
import * as Logger from '../../utils/logger';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../../services/celebrationTimeEnums';
import { palmSundayGospel } from '../../view-models/palmSundayGospel';
import { youtubeVideoId } from '../../view-models/video';
import GospelVideo from './GospelVideo';
import { ThemeContext, prayerTextStyles } from '../../theme';

// While the readings are open the screen does not go off
const KEEP_AWAKE_TAG = 'mass-readings';

export default class MassLiturgyPrayerScreen extends Component {
  componentDidMount() {
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
  }

  componentWillUnmount() {
    Promise.resolve(deactivateKeepAwake(KEEP_AWAKE_TAG)).catch(() => {});
  }

  // Everything comes through props from its controller (Controllers/PrayerController): where
  // to open (type), the Mass of the day (mass), the day (today) and whether to show the video.
  static contextType = ThemeContext;

  constructor(props) {
    super(props);
    const type = props.type;
    this.state = {
      needSecondReading: props.needSecondReading,
      showEasterVigilReadingsAndPsalms: type === 'VetllaPasquaLecturesSalms',
      showEasterVigilGospel: type === 'VetllaPasquaEvangeli',
      showPalmSunday: type === 'Rams',
      showFirstReading: type === '1Lect',
      showPsalm: type === 'Salm',
      showSecondReading: type === '2Lect',
      showGospel: type === 'Evangeli',
      displayVespers: props.useVespersTexts,
      gospelType: 'normal',
    };
  }

  get styles() {
    return prayerTextStyles(this.context);
  }

  //RENDER -------------------------------------------------------------------------------
  render() {
    try {
      return (
        <View style={this.styles.container}>
          <EdgeToEdgeScrollView testID="prayer-scroll" contentContainerStyle={styles.content}>
            <PrayerFlow style={[styles.column, { maxWidth: this.context.layout.readingMaxWidth }]}>
              {this.state.showEasterVigilReadingsAndPsalms ? (
                <View>
                  <Text selectable={true} style={this.styles.redCenter}>
                    {'Lectures de la Vetlla Pasqual'}
                  </Text>
                  <Gap />
                  {this.renderEasterVigilReadingsAndPsalms()}
                </View>
              ) : null}
              {this.state.showEasterVigilGospel ? this.renderEasterVigilGospel() : null}
              {this.state.showPalmSunday ? this.renderPalmSunday() : null}
              {this.state.showFirstReading ? this.renderFirstReading() : null}
              {this.state.showPsalm ? this.renderPsalm(this.state.needSecondReading) : null}
              {this.state.showSecondReading ? this.renderSecondReading() : null}
              {this.state.showGospel ? this.renderGospel() : null}
            </PrayerFlow>
          </EdgeToEdgeScrollView>
        </View>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'render', error);
      return null;
    }
  }

  renderEasterVigilReadingsAndPsalms() {
    return (
      <View style={{ flex: 1 }}>
        <Text selectable={true} style={this.styles.red}>
          {'Lectura primera '}
          {GlobalViewFunctions.trim(this.props.mass.today.firstReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.firstReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.firstReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.firstReading.reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.today.psalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.psalm.psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura segona '}
          {GlobalViewFunctions.trim(this.props.mass.today.secondReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.secondReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.secondReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.secondReading.reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.today.secondPsalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.secondPsalm.psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura tercera '}
          {GlobalViewFunctions.trim(this.props.mass.today.thirdReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.thirdReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.thirdReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.thirdReading.reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.today.thirdPsalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.thirdPsalm.psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura quarta '}
          {GlobalViewFunctions.trim(this.props.mass.today.fourthReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.fourthReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.fourthReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.fourthReading.reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.today.fourthPsalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.fourthPsalm.psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura cinquena '}
          {GlobalViewFunctions.trim(this.props.mass.today.fifthReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.fifthReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.fifthReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.fifthReading.reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.today.fifthPsalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.fifthPsalm.psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura sisena '}
          {GlobalViewFunctions.trim(this.props.mass.today.sixthReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.sixthReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.sixthReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.sixthReading.reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.today.sixthPsalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.sixthPsalm.psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura setena '}
          {GlobalViewFunctions.trim(this.props.mass.today.seventhReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.seventhReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.seventhReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.seventhReading.reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.today.seventhPsalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.seventhPsalm.psalm)}
        </Text>
        <Gap />

        <SectionTitle>{'Glòria'}</SectionTitle>
        {this.gloriaText()}
        <Gap />

        <Text selectable={true} style={this.styles.red}>
          {"Lectura de l'apòstol "}
          {GlobalViewFunctions.trim(this.props.mass.today.apostleReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.apostleReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.apostleReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.apostleReading.reading)}
        </Text>
        <Gap />

        {this.state.showEasterVigilGospel ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={"Continua amb l'Evangeli"}
            onPress={() => this.setState({ showEasterVigilGospel: true })}
          />
        )}
      </View>
    );
  }

  renderEasterVigilGospel() {
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Evangeli'}</SectionTitle>
        <Text selectable={true} style={this.styles.red}>
          {'Al·leluia. '}
          {GlobalViewFunctions.trim(this.props.mass.today.hallelujah.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.hallelujah.hallelujah)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.reference}>
          {GlobalViewFunctions.trim(this.props.mass.today.gospel.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.today.gospel.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.today.gospel.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.today.gospel.gospel)}
        </Text>
      </View>
    );
  }

  renderPalmSunday() {
    // The Gospel of the blessing of the palms, shared with the home (ViewModels/PalmSundayGospel)
    const gospel = palmSundayGospel(this.props.today.yearType) || { reference: '', phrase: '', title: '', text: '' };
    const gospelReference = gospel.reference;
    const gospelPhrase = gospel.phrase;
    const gospelTitle = gospel.title;
    const gospelText = gospel.text;

    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Evangeli'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {gospelReference}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {gospelPhrase}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {gospelTitle}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {gospelText}
        </Text>
        {this.state.showFirstReading ? (
          <View>
            <Gap />
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={'Continua amb la primera lectura'}
            onPress={() => this.setState({ showFirstReading: true })}
          />
        )}
      </View>
    );
  }

  renderFirstReading() {
    const displayGloria =
      (this.state.displayVespers && this.props.mass.vespers.hasGlory) ||
      (!this.state.displayVespers && this.props.mass.today.hasGlory);

    return (
      <View style={{ flex: 1 }}>
        {displayGloria ? (
          <View>
            <SectionTitle>{'Glòria'}</SectionTitle>
            {this.gloriaText()}
            <Gap />
            <HR />
            <Gap />
          </View>
        ) : null}
        <SectionTitle>{'Lectura primera'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.firstReading.quote)
            : GlobalViewFunctions.trim(this.props.mass.today.firstReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.firstReading.comment)
            : GlobalViewFunctions.trim(this.props.mass.today.firstReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.firstReading.title)
            : GlobalViewFunctions.trim(this.props.mass.today.firstReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.firstReading.reading)
            : GlobalViewFunctions.trim(this.props.mass.today.firstReading.reading)}
        </Text>
        <Gap />
        {this.state.showPsalm ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton showArrow label={'Continua amb el Salm'} onPress={() => this.setState({ showPsalm: true })} />
        )}
      </View>
    );
  }

  gloriaText() {
    return (
      <Text selectable={true} style={this.styles.blackJustified}>
        {
          'Glòria a Déu a dalt del cel,\ni a la terra pau a als homes que estima el Senyor.\nUs lloem,\nus beneïm,\nus adorem, \nus glorifiquem,\nus donem gràcies,\nper la vostra immensa glòria,\nSenyor Déu, Rei celestial,\nDéu Pare omnipotent.\nSenyor, Fill Unigènit, Jesucrist,\nSenyor Déu, Anyell de Déu, Fill del Pare,\nvós, que lleveu el pecat del món,\ntingueu pietat de nosaltres;\nvós, que lleveu el pecat del món,\nacolliu la nostra súplica;\nvós, que seieu a la dreta del Pare,\ntingueu pietat de nosaltres.\nPerquè vós sou l’únic Sant,\nvós l’únic Senyor,\nvós l’únic Altíssim,\nJesucrist,\namb l’Esperit Sant,\nen la glòria de Déu Pare. Amén.'
        }
      </Text>
    );
  }

  renderPsalm(needSecondReading) {
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Salm responsorial'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.psalm.quote)
            : GlobalViewFunctions.trim(this.props.mass.today.psalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.psalm.psalm)
            : GlobalViewFunctions.trim(this.props.mass.today.psalm.psalm)}
        </Text>
        <Gap />
        {(needSecondReading && this.state.showSecondReading) || (!needSecondReading && this.state.showGospel) ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={'Continua amb ' + (needSecondReading ? 'la segona lectura' : "l'Evangeli")}
            onPress={() => {
              this.setContinueState(needSecondReading);
            }}
          />
        )}
      </View>
    );
  }

  setContinueState(needSecondReading) {
    if (needSecondReading) this.setState({ showSecondReading: true });
    else this.setState({ showGospel: true });
  }

  renderSecondReading() {
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Lectura segona'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.secondReading.quote)
            : GlobalViewFunctions.trim(this.props.mass.today.secondReading.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.secondReading.comment)
            : GlobalViewFunctions.trim(this.props.mass.today.secondReading.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.secondReading.title)
            : GlobalViewFunctions.trim(this.props.mass.today.secondReading.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.secondReading.reading)
            : GlobalViewFunctions.trim(this.props.mass.today.secondReading.reading)}
        </Text>
        <Gap />
        {this.state.showGospel ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={"Continua amb l'Evangeli"}
            onPress={() => this.setState({ showGospel: true })}
          />
        )}
      </View>
    );
  }

  renderGospel() {
    let displayCreed =
      (this.state.displayVespers && this.props.mass.vespers.hasCreed) ||
      (!this.state.displayVespers && this.props.mass.today.hasCreed);
    let hallelujahQuote = this.state.displayVespers
      ? this.props.mass.vespers.hallelujah.quote !== '-'
        ? this.props.mass.vespers.hallelujah.quote
        : ''
      : this.props.mass.today.hallelujah.quote !== '-'
        ? this.props.mass.today.hallelujah.quote
        : '';
    const videoUrl = this.state.displayVespers ? this.props.mass.vespers.videoUrl : this.props.mass.today.videoUrl;

    return (
      <View>
        <SectionTitle>{'Evangeli'}</SectionTitle>

        {this.props.showVideos && youtubeVideoId(videoUrl) ? (
          <View>
            <GospelVideo videoId={youtubeVideoId(videoUrl)} />
            <Gap />
          </View>
        ) : null}

        {this.props.today.genericLiturgyTime !== GenericLiturgyTimeType.Lent &&
        this.props.today.genericLiturgyTime !== GenericLiturgyTimeType.PaschalTriduum ? (
          <Text selectable={true} style={this.styles.red}>
            {'Al·leluia. '}
            {hallelujahQuote}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.red}>
            {"Vers abans de l'evangeli"}
          </Text>
        )}
        <Text selectable={true} style={this.styles.black}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.hallelujah.hallelujah)
            : GlobalViewFunctions.trim(this.props.mass.today.hallelujah.hallelujah)}
        </Text>
        <Gap />

        {this.props.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ? (
          <ChoiceChips
            accessibilityLabel="Evangeli"
            options={EASTER_GOSPELS}
            value={this.state.gospelType}
            onChange={this.onGospelPress.bind(this)}
          />
        ) : null}

        <View>{this.state.gospelType === 'normal' ? this.normalGospel() : this.alternativeEasterGospel()}</View>
        {displayCreed ? (
          <View>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'Credo'}</SectionTitle>
            {this.creedText()}
          </View>
        ) : null}
      </View>
    );
  }

  onGospelPress(gospelType) {
    this.setState({ gospelType: gospelType });
  }

  normalGospel() {
    const comment = this.state.displayVespers
      ? GlobalViewFunctions.trim(this.props.mass.vespers.gospel.comment)
      : GlobalViewFunctions.trim(this.props.mass.today.gospel.comment);
    return (
      <View style={{ flex: 1 }}>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.gospel.quote)
            : GlobalViewFunctions.trim(this.props.mass.today.gospel.quote)}
        </Text>
        <Gap />
        {comment === undefined || comment === '-' ? null : (
          <View>
            <Text selectable={true} style={this.styles.comment}>
              {comment}
            </Text>
            <Gap />
          </View>
        )}
        <Text selectable={true} style={this.styles.black}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.gospel.title)
            : GlobalViewFunctions.trim(this.props.mass.today.gospel.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.displayVespers
            ? GlobalViewFunctions.trim(this.props.mass.vespers.gospel.gospel)
            : GlobalViewFunctions.trim(this.props.mass.today.gospel.gospel)}
        </Text>
      </View>
    );
  }

  alternativeEasterGospel() {
    return (
      <View style={{ flex: 1 }}>
        <Text selectable={true} style={this.styles.reference}>
          {'Lc 24,13-35'}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {'El reconegueren quan partia el pa'}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {'Lectura de l’evangeli segons sant Lluc'}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {
            'Aquell mateix diumenge dos dels deixebles de Jesús se n’anaven a un poble anomenat Emaús, a onze quilòmetres de Jerusalem, i conversaven entre ells comentant aquests incidents.\nMentre conversaven i discutien, Jesús mateix els aconseguí i es posà a caminar amb ells, però Déu impedia que els seus ulls el reconeguessin. Ell els preguntà: «De què discutiu entre vosaltres tot caminant?». Ells s’aturaren amb un posat trist i un dels dos, que es deia Cleofàs, li respongué: «De tots els forasters que hi havia aquests dies a Jerusalem, ets l’únic que no saps el que hi ha passat?». Els preguntà: «Què?». Li contestaren: «El cas de Jesús de Natzaret. S’havia revelat com un profeta poderós en obres i en paraules davant Déu i el poble. Els grans sacerdots i les autoritats del nostre poble l’entregaren perquè fos condemnat a mort i crucificat. Nosaltres esperàvem que ell seria el qui hauria alliberat Israel. Ara, de tot això ja fa tres dies. És cert que unes dones del nostre grup ens han esverat: han anat de bon matí al sepulcre, no hi han trobat el cos, i han vingut a dir-nos que fins i tot se’ls han aparegut uns àngels i els han assegurat que ell és viu. Alguns dels qui eren amb nosaltres han anat al sepulcre i ho han trobat tot exactament com les dones havien dit, però a ell, no l’han vist pas».\nEll els digué: «Sí que us costa d’entendre! Quins cors tan indecisos a creure tot allò que havien anunciat els profetes. No havia de patir tot això el Messies abans d’entrar en la seva glòria?». Llavors, començant pels llibres de Moisès i seguint els de tots els profetes, els exposava tots els llocs de les Escriptures que es referien a ell.\nMentrestant s’acostaven al poblet on es dirigien i ell va fer com si seguís més enllà. Però ells el forçaren pregant-lo: «Queda’t amb nosaltres que ja es fa tard i el dia ha començat a declinar». Jesús entrà per quedar-se amb ells. Quan s’hagué posat amb ells a taula, prengué el pa, digué la benedicció, el partí i els el donava. En aquell moment se’ls obriren els ulls i el reconegueren, però ell desaparegué. I es deien l’un a l’altre: «No és veritat que els nostres cors s’abrusaven dins nostre mentre ens parlava pel camí i ens obria el sentit de les Escriptures?». Llavors mateix s’alçaren de taula i se’n tornaren a Jerusalem. Allà trobaren reunits els onze i tots els qui anaven amb ells, que deien: «Realment el Senyor ha ressuscitat i s’ha aparegut a Simó». Ells també contaven el que els havia passat pel camí, i com l’havien reconegut quan partia el pa.'
          }
        </Text>
      </View>
    );
  }

  creedText() {
    return (
      <Text selectable={true} style={this.styles.blackJustified}>
        {
          "Crec en un Déu\nPare totpoderós,\ncreador del cel i de la terra.\n\nI en Jesucrist, únic Fill seu i Senyor nostre;\nel qual fou concebut per obra de l'Esperit Sant,\nnasqué de Maria Verge;\npatí sota el poder de Ponç Pilat,\nfou crucificat, mort i sepultat;\ndavallà als inferns,\nressuscità el tercer dia d'entre els morts;\nse'n pujà al cel,\nseu a la dreta de Déu Pare totpoderós;\ni d'allí ha de venir a judicar els vius i els morts.\n\nCrec en l'Esperit Sant;\nla santa Mare Església catòlica,\nla comunió dels sants;\nla remissió dels pecats;\nla resurrecció de la carn;\nla vida perdurable. Amén."
        }
      </Text>
    );
  }

  //------------------------------------------------------------------------------------
}

// On Easter Sunday, the Gospel of the day or the one of the evening (Emmaus)
const EASTER_GOSPELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'alternative', label: 'Alternatiu (vespre)' },
];

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  column: {
    width: '100%',
    alignSelf: 'center',
  },
});

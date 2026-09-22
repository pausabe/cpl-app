import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import GlobalViewFunctions from '../../Utils/GlobalViewFunctions';
import HR from '../../Components/HRComponent';
import Gap from '../../Components/Gap';
import EdgeToEdgeScrollView from '../../Components/EdgeToEdgeScrollView';
import SectionTitle from '../../Components/SectionTitle';
import ContinueButton from '../../Components/ContinueButton';
import ChoiceChips from '../../Components/ChoiceChips';
import * as Logger from '../../Utils/Logger';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../../Services/CelebrationTimeEnums';
import { palmSundayGospel } from '../../ViewModels/PalmSundayGospel';
import { youtubeVideoId } from '../../ViewModels/Video';
import GospelVideo from './GospelVideo';
import { ThemeContext, prayerTextStyles } from '../../Theme';

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
      Need_Lect2: props.needSecondReading,
      VetllaPasquaLecturesSalms: type === 'VetllaPasquaLecturesSalms',
      VetllaPasquaEvangeli: type === 'VetllaPasquaEvangeli',
      Rams: type === 'Rams',
      Lect1: type === '1Lect',
      Salm: type === 'Salm',
      Lect2: type === '2Lect',
      Evangeli: type === 'Evangeli',
      DisplayVespers: props.useVespersTexts,
      evangeliType: 'normal',
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
            <View style={[styles.column, { maxWidth: this.context.layout.readingMaxWidth }]}>
              {this.state.VetllaPasquaLecturesSalms ? (
                <View>
                  <Text selectable={true} style={this.styles.redCenter}>
                    {'Lectures de la Vetlla Pasqual'}
                  </Text>
                  <Gap />
                  {this.Render_VetllaPasquaLecturesSalms()}
                </View>
              ) : null}
              {this.state.VetllaPasquaEvangeli ? this.Render_VetllaPasquaEvangeli() : null}
              {this.state.Rams ? this.Render_Rams() : null}
              {this.state.Lect1 ? this.Render_1Lect() : null}
              {this.state.Salm ? this.Render_Salm(this.state.Need_Lect2) : null}
              {this.state.Lect2 ? this.Render_2Lect() : null}
              {this.state.Evangeli ? this.Render_Evangeli() : null}
            </View>
          </EdgeToEdgeScrollView>
        </View>
      );
    } catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, 'render', error);
      return null;
    }
  }

  Render_VetllaPasquaLecturesSalms() {
    return (
      <View style={{ flex: 1 }}>
        <Text selectable={true} style={this.styles.red}>
          {'Lectura primera '}
          {GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.Today.Psalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.Psalm.Psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura segona '}
          {GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.Today.SecondPsalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SecondPsalm.Psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura tercera '}
          {GlobalViewFunctions.trim(this.props.mass.Today.ThirdReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.ThirdReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.ThirdReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.ThirdReading.Reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.Today.ThirdPsalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.ThirdPsalm.Psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura quarta '}
          {GlobalViewFunctions.trim(this.props.mass.Today.FourthReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FourthReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FourthReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FourthReading.Reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.Today.FourthPsalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FourthPsalm.Psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura cinquena '}
          {GlobalViewFunctions.trim(this.props.mass.Today.FifthReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FifthReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FifthReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FifthReading.Reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.Today.FifthPsalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.FifthPsalm.Psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura sisena '}
          {GlobalViewFunctions.trim(this.props.mass.Today.SixthReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SixthReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SixthReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SixthReading.Reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.Today.SixthPsalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SixthPsalm.Psalm)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Lectura setena '}
          {GlobalViewFunctions.trim(this.props.mass.Today.SeventhReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SeventhReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SeventhReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SeventhReading.Reading)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.red}>
          {'Salm responsorial '}
          {GlobalViewFunctions.trim(this.props.mass.Today.SeventhPsalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.SeventhPsalm.Psalm)}
        </Text>
        <Gap />

        <SectionTitle>{'Glòria'}</SectionTitle>
        {this.GloriaText()}
        <Gap />

        <Text selectable={true} style={this.styles.red}>
          {"Lectura de l'apòstol "}
          {GlobalViewFunctions.trim(this.props.mass.Today.ApostleReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.ApostleReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.ApostleReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.ApostleReading.Reading)}
        </Text>
        <Gap />

        {this.state.VetllaPasquaEvangeli ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={"Continua amb l'Evangeli"}
            onPress={() => this.setState({ VetllaPasquaEvangeli: true })}
          />
        )}
      </View>
    );
  }

  Render_VetllaPasquaEvangeli() {
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Evangeli'}</SectionTitle>
        <Text selectable={true} style={this.styles.red}>
          {'Al·leluia. '}
          {GlobalViewFunctions.trim(this.props.mass.Today.Hallelujah.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.Hallelujah.Hallelujah)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.reference}>
          {GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Gospel)}
        </Text>
      </View>
    );
  }

  Render_Rams() {
    // The Gospel of the blessing of the palms, shared with the home (ViewModels/PalmSundayGospel)
    const gospel = palmSundayGospel(this.props.today.YearType) || { reference: '', phrase: '', title: '', text: '' };
    const evangeliRams = gospel.reference;
    const evangeliCitaRams = gospel.phrase;
    const evangeliTitolRams = gospel.title;
    const evangeliTextRams = gospel.text;

    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Evangeli'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {evangeliRams}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {evangeliCitaRams}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {evangeliTitolRams}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {evangeliTextRams}
        </Text>
        {this.state.Lect1 ? (
          <View>
            <Gap />
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={'Continua amb la primera lectura'}
            onPress={() => this.setState({ Lect1: true })}
          />
        )}
      </View>
    );
  }

  Render_1Lect() {
    const displayGloria =
      (this.state.DisplayVespers && this.props.mass.Vespers.HasGlory) ||
      (!this.state.DisplayVespers && this.props.mass.Today.HasGlory);

    return (
      <View style={{ flex: 1 }}>
        {displayGloria ? (
          <View>
            <SectionTitle>{'Glòria'}</SectionTitle>
            {this.GloriaText()}
            <Gap />
            <HR />
            <Gap />
          </View>
        ) : null}
        <SectionTitle>{'Lectura primera'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.FirstReading.Quote)
            : GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.FirstReading.Comment)
            : GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.FirstReading.Title)
            : GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.FirstReading.Reading)
            : GlobalViewFunctions.trim(this.props.mass.Today.FirstReading.Reading)}
        </Text>
        <Gap />
        {this.state.Salm ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton showArrow label={'Continua amb el Salm'} onPress={() => this.setState({ Salm: true })} />
        )}
      </View>
    );
  }

  GloriaText() {
    return (
      <Text selectable={true} style={this.styles.blackJustified}>
        {
          'Glòria a Déu a dalt del cel,\ni a la terra pau a als homes que estima el Senyor.\nUs lloem,\nus beneïm,\nus adorem, \nus glorifiquem,\nus donem gràcies,\nper la vostra immensa glòria,\nSenyor Déu, Rei celestial,\nDéu Pare omnipotent.\nSenyor, Fill Unigènit, Jesucrist,\nSenyor Déu, Anyell de Déu, Fill del Pare,\nvós, que lleveu el pecat del món,\ntingueu pietat de nosaltres;\nvós, que lleveu el pecat del món,\nacolliu la nostra súplica;\nvós, que seieu a la dreta del Pare,\ntingueu pietat de nosaltres.\nPerquè vós sou l’únic Sant,\nvós l’únic Senyor,\nvós l’únic Altíssim,\nJesucrist,\namb l’Esperit Sant,\nen la glòria de Déu Pare. Amén.'
        }
      </Text>
    );
  }

  Render_Salm(need_lect2) {
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Salm responsorial'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.Psalm.Quote)
            : GlobalViewFunctions.trim(this.props.mass.Today.Psalm.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.Psalm.Psalm)
            : GlobalViewFunctions.trim(this.props.mass.Today.Psalm.Psalm)}
        </Text>
        <Gap />
        {(need_lect2 && this.state.Lect2) || (!need_lect2 && this.state.Evangeli) ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={'Continua amb ' + (need_lect2 ? 'la segona lectura' : "l'Evangeli")}
            onPress={() => {
              this.Set_Continue_State(need_lect2);
            }}
          />
        )}
      </View>
    );
  }

  Set_Continue_State(need_lect2) {
    if (need_lect2) this.setState({ Lect2: true });
    else this.setState({ Evangeli: true });
  }

  Render_2Lect() {
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Lectura segona'}</SectionTitle>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.SecondReading.Quote)
            : GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.comment}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.SecondReading.Comment)
            : GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.black}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.SecondReading.Title)
            : GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.SecondReading.Reading)
            : GlobalViewFunctions.trim(this.props.mass.Today.SecondReading.Reading)}
        </Text>
        <Gap />
        {this.state.Evangeli ? (
          <View>
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={"Continua amb l'Evangeli"}
            onPress={() => this.setState({ Evangeli: true })}
          />
        )}
      </View>
    );
  }

  Render_Evangeli() {
    let displayCredo =
      (this.state.DisplayVespers && this.props.mass.Vespers.HasCreed) ||
      (!this.state.DisplayVespers && this.props.mass.Today.HasCreed);
    let aleluia_quote = this.state.DisplayVespers
      ? this.props.mass.Vespers.Hallelujah.Quote !== '-'
        ? this.props.mass.Vespers.Hallelujah.Quote
        : ''
      : this.props.mass.Today.Hallelujah.Quote !== '-'
        ? this.props.mass.Today.Hallelujah.Quote
        : '';
    const videoUrl = this.state.DisplayVespers ? this.props.mass.Vespers.videoUrl : this.props.mass.Today.videoUrl;

    return (
      <View>
        <SectionTitle>{'Evangeli'}</SectionTitle>

        {this.props.showVideos && youtubeVideoId(videoUrl) ? (
          <View>
            <GospelVideo videoId={youtubeVideoId(videoUrl)} />
            <Gap />
          </View>
        ) : null}

        {this.props.today.GenericLiturgyTime !== GenericLiturgyTimeType.Lent &&
        this.props.today.GenericLiturgyTime !== GenericLiturgyTimeType.PaschalTriduum ? (
          <Text selectable={true} style={this.styles.red}>
            {'Al·leluia. '}
            {aleluia_quote}
          </Text>
        ) : (
          <Text selectable={true} style={this.styles.red}>
            {"Vers abans de l'evangeli"}
          </Text>
        )}
        <Text selectable={true} style={this.styles.black}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.Hallelujah.Hallelujah)
            : GlobalViewFunctions.trim(this.props.mass.Today.Hallelujah.Hallelujah)}
        </Text>
        <Gap />

        {this.props.today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ? (
          <ChoiceChips
            accessibilityLabel="Evangeli"
            options={EASTER_GOSPELS}
            value={this.state.evangeliType}
            onChange={this._onEvangeliPress.bind(this)}
          />
        ) : null}

        <View>{this.state.evangeliType === 'normal' ? this.NormalEvangeli() : this.AlternativePasquaEvangeli()}</View>
        {displayCredo ? (
          <View>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'Credo'}</SectionTitle>
            {this.CredoText()}
          </View>
        ) : null}
      </View>
    );
  }

  _onEvangeliPress(evangeliType) {
    this.setState({ evangeliType: evangeliType });
  }

  NormalEvangeli() {
    const cita = this.state.DisplayVespers
      ? GlobalViewFunctions.trim(this.props.mass.Vespers.Gospel.Comment)
      : GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Comment);
    return (
      <View style={{ flex: 1 }}>
        <Text selectable={true} style={this.styles.reference}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.Gospel.Quote)
            : GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Quote)}
        </Text>
        <Gap />
        {cita === undefined || cita === '-' ? null : (
          <View>
            <Text selectable={true} style={this.styles.comment}>
              {cita}
            </Text>
            <Gap />
          </View>
        )}
        <Text selectable={true} style={this.styles.black}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.Gospel.Title)
            : GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Title)}
        </Text>
        <Gap />
        <Text selectable={true} style={this.styles.blackJustified}>
          {this.state.DisplayVespers
            ? GlobalViewFunctions.trim(this.props.mass.Vespers.Gospel.Gospel)
            : GlobalViewFunctions.trim(this.props.mass.Today.Gospel.Gospel)}
        </Text>
      </View>
    );
  }

  AlternativePasquaEvangeli() {
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

  CredoText() {
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

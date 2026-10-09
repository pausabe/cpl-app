import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { trimmedText as trim } from '../../utils/prayerText';
import { GenericLiturgyTimeType, SpecificLiturgyTimeType } from '../../services/celebrationTimeEnums';
import { palmSundayGospel } from '../../view-models/palmSundayGospel';
import { youtubeVideoId } from '../../view-models/video';
import GospelVideo from './GospelVideo';
import { gospelReading } from './gospelReading';
import { PrayerTextStyles, prayerTextStyles, useTheme } from '../../theme';
import { useKeepAwake } from '../keepAwake';
import type MassLiturgy from '../../models/MassLiturgy';
import type { DayMassLiturgy, MassPsalm, MassReading } from '../../models/MassLiturgy';
import type { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';

interface MassLiturgyPrayerScreenProps {
  // "1Lect", "Salm", "2Lect", "Evangeli", "Rams", "VetllaPasquaLecturesSalms", "VetllaPasquaEvangeli"
  type: string;
  needSecondReading: boolean;
  useVespersTexts: boolean;
  mass: MassLiturgy;
  today: LiturgySpecificDayInformation;
  showVideos: boolean;
}

// The readings of the Mass. Everything comes through props from its controller
// (Controllers/PrayerController): where to open (type), the Mass of the day (mass), the day
// (today) and whether to show the video. It opens on one reading, and «Continua amb…» adds the
// next one below it.
export default function MassLiturgyPrayerScreen({
  type,
  needSecondReading,
  useVespersTexts,
  mass: massLiturgy,
  today,
  showVideos,
}: MassLiturgyPrayerScreenProps) {
  const theme = useTheme();
  const styles = prayerTextStyles(theme);
  useKeepAwake('mass-readings');

  const [showEasterVigilGospel, setShowEasterVigilGospel] = useState(type === 'VetllaPasquaEvangeli');
  const [showFirstReading, setShowFirstReading] = useState(type === '1Lect');
  const [showPsalm, setShowPsalm] = useState(type === 'Salm');
  const [showSecondReading, setShowSecondReading] = useState(type === '2Lect');
  const [showGospel, setShowGospel] = useState(type === 'Evangeli');
  const [gospelType, setGospelType] = useState('normal');
  const showEasterVigilReadingsAndPsalms = type === 'VetllaPasquaLecturesSalms';
  const showPalmSunday = type === 'Rams';
  // The Mass of the evening before (which is there when the home offers it), or the one of the day
  const mass = (useVespersTexts ? massLiturgy.vespers : massLiturgy.today) as DayMassLiturgy;

  return content();

  // The readings are built from the data here: if something in it is broken, nothing is drawn
  // instead of the app falling down
  function content() {
    try {
      return (
        <View style={styles.container}>
          <EdgeToEdgeScrollView testID="prayer-scroll" contentContainerStyle={localStyles.content}>
            <PrayerFlow style={[localStyles.column, { maxWidth: theme.layout.readingMaxWidth }]}>
              {showEasterVigilReadingsAndPsalms ? (
                <View>
                  <Text selectable={true} style={styles.redCenter}>
                    {'Lectures de la Vetlla Pasqual'}
                  </Text>
                  <Gap />
                  {easterVigilReadingsAndPsalms()}
                </View>
              ) : null}
              {showEasterVigilGospel ? easterVigilGospel() : null}
              {showPalmSunday ? palmSunday() : null}
              {showFirstReading ? firstReading() : null}
              {showPsalm ? psalm() : null}
              {showSecondReading ? secondReading() : null}
              {showGospel ? gospel() : null}
            </PrayerFlow>
          </EdgeToEdgeScrollView>
        </View>
      );
    } catch (error) {
      Logger.logError(Logger.LogKeys.Screens, 'render', error as Error);
      Logger.reportProblem('prayer-mass', error);
      return null;
    }
  }

  // What closes a reading: the button that adds the next one, or, once it is there, the line
  // before it
  function continueWith(nextShown: boolean, label: string, showNext: () => void) {
    return nextShown ? (
      <View>
        <HR />
        <Gap />
      </View>
    ) : (
      <ContinueButton showArrow label={label} onPress={showNext} />
    );
  }

  // The seven readings of the Vigil with their psalms, the Glòria and the reading of the apostle
  function easterVigilReadingsAndPsalms() {
    const day = massLiturgy.today;
    const readings: [string, MassReading, MassPsalm][] = [
      ['primera', day.firstReading, day.psalm],
      ['segona', day.secondReading, day.secondPsalm],
      ['tercera', day.thirdReading, day.thirdPsalm],
      ['quarta', day.fourthReading, day.fourthPsalm],
      ['cinquena', day.fifthReading, day.fifthPsalm],
      ['sisena', day.sixthReading, day.sixthPsalm],
      ['setena', day.seventhReading, day.seventhPsalm],
    ];
    return (
      <View style={{ flex: 1 }}>
        {readings.map(([ordinal, reading, readingPsalm]) => (
          <React.Fragment key={ordinal}>
            {vigilReading(styles, `Lectura ${ordinal} `, reading)}
            <Text selectable={true} style={styles.red}>
              {'Salm responsorial '}
              {trim(readingPsalm.quote)}
            </Text>
            <Gap />
            <Text selectable={true} style={styles.black}>
              {trim(readingPsalm.psalm)}
            </Text>
            <Gap />
          </React.Fragment>
        ))}

        <SectionTitle>{'Glòria'}</SectionTitle>
        {gloria(styles)}
        <Gap />

        {vigilReading(styles, "Lectura de l'apòstol ", day.apostleReading)}

        {continueWith(showEasterVigilGospel, "Continua amb l'Evangeli", () => setShowEasterVigilGospel(true))}
      </View>
    );
  }

  function easterVigilGospel() {
    const day = massLiturgy.today;
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Evangeli'}</SectionTitle>
        <Text selectable={true} style={styles.red}>
          {'Al·leluia. '}
          {trim(day.hallelujah.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.black}>
          {trim(day.hallelujah.hallelujah)}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.reference}>
          {trim(day.gospel.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.comment}>
          {trim(day.gospel.comment)}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.black}>
          {trim(day.gospel.title)}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.blackJustified}>
          {trim(day.gospel.gospel)}
        </Text>
      </View>
    );
  }

  function palmSunday() {
    // The Gospel of the blessing of the palms, shared with the home (ViewModels/PalmSundayGospel)
    const palmsGospel = palmSundayGospel(today.yearType) || { reference: '', phrase: '', title: '', text: '' };
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Evangeli'}</SectionTitle>
        <Text selectable={true} style={styles.reference}>
          {palmsGospel.reference}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.comment}>
          {palmsGospel.phrase}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.black}>
          {palmsGospel.title}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.blackJustified}>
          {palmsGospel.text}
        </Text>
        {showFirstReading ? (
          <View>
            <Gap />
            <HR />
            <Gap />
          </View>
        ) : (
          <ContinueButton
            showArrow
            label={'Continua amb la primera lectura'}
            onPress={() => setShowFirstReading(true)}
          />
        )}
      </View>
    );
  }

  function firstReading() {
    return (
      <View style={{ flex: 1 }}>
        {mass.hasGlory ? (
          <View>
            <SectionTitle>{'Glòria'}</SectionTitle>
            {gloria(styles)}
            <Gap />
            <HR />
            <Gap />
          </View>
        ) : null}
        {massReading(styles, 'Lectura primera', mass.firstReading)}
        {continueWith(showPsalm, 'Continua amb el Salm', () => setShowPsalm(true))}
      </View>
    );
  }

  function psalm() {
    const nextShown = needSecondReading ? showSecondReading : showGospel;
    return (
      <View style={{ flex: 1 }}>
        <SectionTitle>{'Salm responsorial'}</SectionTitle>
        <Text selectable={true} style={styles.reference}>
          {trim(mass.psalm.quote)}
        </Text>
        <Gap />
        <Text selectable={true} style={styles.blackJustified}>
          {trim(mass.psalm.psalm)}
        </Text>
        <Gap />
        {continueWith(nextShown, 'Continua amb ' + (needSecondReading ? 'la segona lectura' : "l'Evangeli"), () =>
          needSecondReading ? setShowSecondReading(true) : setShowGospel(true),
        )}
      </View>
    );
  }

  function secondReading() {
    return (
      <View style={{ flex: 1 }}>
        {massReading(styles, 'Lectura segona', mass.secondReading)}
        {continueWith(showGospel, "Continua amb l'Evangeli", () => setShowGospel(true))}
      </View>
    );
  }

  function gospel() {
    const hallelujahQuote = mass.hallelujah.quote !== '-' ? mass.hallelujah.quote : '';
    const videoId = youtubeVideoId(mass.videoUrl);
    const hasAlleluia =
      today.genericLiturgyTime !== GenericLiturgyTimeType.Lent &&
      today.genericLiturgyTime !== GenericLiturgyTimeType.PaschalTriduum;

    return (
      <View>
        <SectionTitle>{'Evangeli'}</SectionTitle>

        {showVideos && videoId ? (
          <View>
            <GospelVideo videoId={videoId} />
            <Gap />
          </View>
        ) : null}

        {hasAlleluia ? (
          <Text selectable={true} style={styles.red}>
            {'Al·leluia. '}
            {hallelujahQuote}
          </Text>
        ) : (
          <Text selectable={true} style={styles.red}>
            {"Vers abans de l'evangeli"}
          </Text>
        )}
        <Text selectable={true} style={styles.black}>
          {trim(mass.hallelujah.hallelujah)}
        </Text>
        <Gap />

        {today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ? (
          <ChoiceChips
            accessibilityLabel="Evangeli"
            options={EASTER_GOSPELS}
            value={gospelType}
            onChange={setGospelType}
          />
        ) : null}

        <View>{gospelType === 'normal' ? gospelReading(styles, mass.gospel) : emmausGospel(styles)}</View>
        {mass.hasCreed ? (
          <View>
            <Gap />
            <HR />
            <Gap />
            <SectionTitle>{'Credo'}</SectionTitle>
            <Text selectable={true} style={styles.blackJustified}>
              {CREED}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
}

// A reading of the Vigil: which one and its reference in one line, the phrase that sums it up,
// its title and its text
function vigilReading(styles: PrayerTextStyles, name: string, reading: MassReading) {
  return (
    <>
      <Text selectable={true} style={styles.red}>
        {name}
        {trim(reading.quote)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.comment}>
        {trim(reading.comment)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {trim(reading.title)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackJustified}>
        {trim(reading.reading)}
      </Text>
      <Gap />
    </>
  );
}

// The first or the second reading, under its title
function massReading(styles: PrayerTextStyles, title: string, reading: MassReading) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Text selectable={true} style={styles.reference}>
        {trim(reading.quote)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.comment}>
        {trim(reading.comment)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {trim(reading.title)}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackJustified}>
        {trim(reading.reading)}
      </Text>
      <Gap />
    </>
  );
}

function gloria(styles: PrayerTextStyles) {
  return (
    <Text selectable={true} style={styles.blackJustified}>
      {GLORIA}
    </Text>
  );
}

// The Gospel of Easter Sunday evening, the disciples of Emmaus
function emmausGospel(styles: PrayerTextStyles) {
  return (
    <View style={{ flex: 1 }}>
      <Text selectable={true} style={styles.reference}>
        {'Lc 24,13-35'}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.comment}>
        {'El reconegueren quan partia el pa'}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.black}>
        {'Lectura de l’evangeli segons sant Lluc'}
      </Text>
      <Gap />
      <Text selectable={true} style={styles.blackJustified}>
        {EMMAUS_GOSPEL}
      </Text>
    </View>
  );
}

// On Easter Sunday, the Gospel of the day or the one of the evening (Emmaus)
const EASTER_GOSPELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'alternative', label: 'Alternatiu (vespre)' },
];

const GLORIA =
  'Glòria a Déu a dalt del cel,\ni a la terra pau a als homes que estima el Senyor.\nUs lloem,\nus beneïm,\nus adorem, \nus glorifiquem,\nus donem gràcies,\nper la vostra immensa glòria,\nSenyor Déu, Rei celestial,\nDéu Pare omnipotent.\nSenyor, Fill Unigènit, Jesucrist,\nSenyor Déu, Anyell de Déu, Fill del Pare,\nvós, que lleveu el pecat del món,\ntingueu pietat de nosaltres;\nvós, que lleveu el pecat del món,\nacolliu la nostra súplica;\nvós, que seieu a la dreta del Pare,\ntingueu pietat de nosaltres.\nPerquè vós sou l’únic Sant,\nvós l’únic Senyor,\nvós l’únic Altíssim,\nJesucrist,\namb l’Esperit Sant,\nen la glòria de Déu Pare. Amén.';

const CREED =
  "Crec en un Déu\nPare totpoderós,\ncreador del cel i de la terra.\n\nI en Jesucrist, únic Fill seu i Senyor nostre;\nel qual fou concebut per obra de l'Esperit Sant,\nnasqué de Maria Verge;\npatí sota el poder de Ponç Pilat,\nfou crucificat, mort i sepultat;\ndavallà als inferns,\nressuscità el tercer dia d'entre els morts;\nse'n pujà al cel,\nseu a la dreta de Déu Pare totpoderós;\ni d'allí ha de venir a judicar els vius i els morts.\n\nCrec en l'Esperit Sant;\nla santa Mare Església catòlica,\nla comunió dels sants;\nla remissió dels pecats;\nla resurrecció de la carn;\nla vida perdurable. Amén.";

const EMMAUS_GOSPEL =
  'Aquell mateix diumenge dos dels deixebles de Jesús se n’anaven a un poble anomenat Emaús, a onze quilòmetres de Jerusalem, i conversaven entre ells comentant aquests incidents.\nMentre conversaven i discutien, Jesús mateix els aconseguí i es posà a caminar amb ells, però Déu impedia que els seus ulls el reconeguessin. Ell els preguntà: «De què discutiu entre vosaltres tot caminant?». Ells s’aturaren amb un posat trist i un dels dos, que es deia Cleofàs, li respongué: «De tots els forasters que hi havia aquests dies a Jerusalem, ets l’únic que no saps el que hi ha passat?». Els preguntà: «Què?». Li contestaren: «El cas de Jesús de Natzaret. S’havia revelat com un profeta poderós en obres i en paraules davant Déu i el poble. Els grans sacerdots i les autoritats del nostre poble l’entregaren perquè fos condemnat a mort i crucificat. Nosaltres esperàvem que ell seria el qui hauria alliberat Israel. Ara, de tot això ja fa tres dies. És cert que unes dones del nostre grup ens han esverat: han anat de bon matí al sepulcre, no hi han trobat el cos, i han vingut a dir-nos que fins i tot se’ls han aparegut uns àngels i els han assegurat que ell és viu. Alguns dels qui eren amb nosaltres han anat al sepulcre i ho han trobat tot exactament com les dones havien dit, però a ell, no l’han vist pas».\nEll els digué: «Sí que us costa d’entendre! Quins cors tan indecisos a creure tot allò que havien anunciat els profetes. No havia de patir tot això el Messies abans d’entrar en la seva glòria?». Llavors, començant pels llibres de Moisès i seguint els de tots els profetes, els exposava tots els llocs de les Escriptures que es referien a ell.\nMentrestant s’acostaven al poblet on es dirigien i ell va fer com si seguís més enllà. Però ells el forçaren pregant-lo: «Queda’t amb nosaltres que ja es fa tard i el dia ha començat a declinar». Jesús entrà per quedar-se amb ells. Quan s’hagué posat amb ells a taula, prengué el pa, digué la benedicció, el partí i els el donava. En aquell moment se’ls obriren els ulls i el reconegueren, però ell desaparegué. I es deien l’un a l’altre: «No és veritat que els nostres cors s’abrusaven dins nostre mentre ens parlava pel camí i ens obria el sentit de les Escriptures?». Llavors mateix s’alçaren de taula i se’n tornaren a Jerusalem. Allà trobaren reunits els onze i tots els qui anaven amb ells, que deien: «Realment el Senyor ha ressuscitat i s’ha aparegut a Simó». Ells també contaven el que els havia passat pel camí, i com l’havien reconegut quan partia el pa.';

const localStyles = StyleSheet.create({
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

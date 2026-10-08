import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import HoursLiturgyPrayerScreen from '../views/hours-liturgy/HoursLiturgyPrayerScreen';
import MassLiturgyPrayerScreen from '../views/mass-liturgy/MassLiturgyPrayerScreen';
import HeaderButton from '../components/HeaderButton';
import TextSettingsSheet from '../components/TextSettingsSheet';
import SettingsService from '../services/SettingsService';
import { getSnapshot, updateSettings, useLiturgy } from './liturgyStore';
import { useTextSettings } from './appearanceSettings';
import { SpeechSink } from '../components/SpeechSink';
import { SpeechFollow } from '../components/SpeechFollow';
import ListenBar from '../components/ListenBar';
import ListenSheet from '../components/ListenSheet';
import ListenUnavailableDialog from '../components/ListenUnavailableDialog';
import { clearScreenSpeech, getScreenSpeech, setScreenSpeech } from './speechStore';
import * as Listen from './listenController';
import { speechScript } from '../view-models/speech/script';
import { listenLabels } from '../view-models/speech/listenLabels';
import { laudesGospel } from '../view-models/laudesGospel';
import type { SpeechParagraph } from '../view-models/speech/paragraph';

// The prayer (LHDisplay) and the readings (LDDisplay): they get the day's data from here. In the top
// bar, the headphones read the prayer aloud (listenController) and the "Aa" button opens the sheet
// with the text size and the dark mode. While an hour is read aloud, a small player stays at the
// foot of every prayer.

export interface HoursRouteParams {
  // "Ofici", "Laudes", "Tèrcia"… (HourTile.screenType)
  type: string;
  // For the top bar: "Ofici de lectura"
  title: string;
  // What the home shows under the name of the hour, shortened when it does not fit: the first
  // Vespers of tomorrow's celebration ("Mare de Déu de la Mercè"). The prayer shows it whole.
  subtitle?: string;
}

export interface MassRouteParams {
  // "1Lect", "Salm", "2Lect", "Evangeli", "Rams", "VetllaPasquaLecturesSalms", "VetllaPasquaEvangeli"
  type: string;
  title: string;
  needSecondReading: boolean;
  useVespersTexts: boolean;
}

// The two buttons of the top bar: alike, side by side (on iOS 26, in one capsule of glass). The
// headphones are faded while the prayer cannot be heard yet.
function useHeaderButtons(navigation: any, onListen: () => void, listenDimmed: boolean) {
  const [open, setOpen] = useState(false);
  const textSettings = useTextSettings();
  // The bar is set up once; what the headphones do changes with what is playing
  const listen = useRef(onListen);
  useLayoutEffect(() => {
    listen.current = onListen;
  });
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <HeaderButton
            icon="headphones"
            accessibilityLabel="Escolta la pregària"
            testID="listen-button"
            dimmed={listenDimmed}
            onPress={() => listen.current()}
          />
          <HeaderButton
            text="Aa"
            accessibilityLabel="Mida del text i tema"
            testID="text-settings-button"
            onPress={() => setOpen(true)}
          />
        </View>
      ),
    });
  }, [navigation, listenDimmed]);
  return <TextSettingsSheet visible={open} onClose={() => setOpen(false)} {...textSettings} />;
}

// Reading the prayer of the screen aloud: what the headphones do, the small player at the foot and
// its sheet. The headphones start the hour of the screen; if it is already the one being read,
// they open the sheet.
function useListening(hour: string, title: string) {
  const state = Listen.useListen();
  const availability = Listen.useListenAvailability();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const active = state.phase !== 'idle';
  useEffect(() => {
    Listen.refreshListenAvailability();
    Listen.loadSpeed();
    // Leaving the prayer stops it: otherwise Laudes would open reading Completes
    return () => Listen.leftHour(hour);
  }, [hour]);
  const onListen = () => {
    // Not yet: it says so, and nothing else happens
    if (!availability.enabled && !active) {
      setUnavailable(true);
      return;
    }
    if (active && state.hour === hour && state.phase !== 'finished') {
      setSheetOpen(true);
      return;
    }
    const speech = getScreenSpeech();
    if (!speech || speech.hour !== hour) return;
    const pieces = speechScript(hour, speech.paragraphs, getSnapshot().ourFather);
    if (pieces.length) Listen.listen(hour, title, pieces);
  };
  const labels = listenLabels(state);
  // The paragraph and strophe being read, for the screen to mark them and keep them in sight
  const reading = active && state.hour === hour && state.phase !== 'finished' ? state.pieces[state.index] : undefined;
  const paragraph = reading?.paragraph ?? -1;
  const strophe = reading?.strophe ?? 0;
  const follow = useMemo(() => (paragraph >= 0 ? { paragraph, strophe } : null), [paragraph, strophe]);
  const playing = state.phase === 'playing' || state.phase === 'preparing' || state.phase === 'waiting';
  const bar = active ? (
    <ListenBar
      playing={playing}
      title={labels.part}
      subtitle={labels.subtitle}
      progress={labels.progress}
      onToggle={Listen.toggle}
      onNext={Listen.nextPart}
      onOpen={() => setSheetOpen(true)}
      onClose={Listen.stop}
    />
  ) : null;
  const parts = Listen.partsOf(state.pieces);
  const currentPart = [...parts].reverse().find((p) => p.index <= state.index)?.index ?? -1;
  const sheet = (
    <ListenSheet
      visible={sheetOpen && active}
      onClose={() => setSheetOpen(false)}
      hour={state.title}
      part={labels.part}
      time={labels.time}
      progress={labels.progress}
      playing={playing}
      notice={state.notice}
      parts={parts}
      currentPart={currentPart}
      speed={state.speed}
      minSpeed={Listen.MIN_SPEED}
      maxSpeed={Listen.MAX_SPEED}
      speedStep={Listen.SPEED_STEP}
      onToggle={Listen.toggle}
      onPrevious={Listen.previousPart}
      onNext={Listen.nextPart}
      onPart={Listen.jump}
      onSpeed={Listen.setSpeed}
      onStop={() => {
        Listen.stop();
        setSheetOpen(false);
      }}
    />
  );
  const notice = (
    <ListenUnavailableDialog
      visible={unavailable}
      message={availability.message}
      onDismiss={() => setUnavailable(false)}
    />
  );
  return { onListen, bar, sheet, notice, follow, dimmed: !availability.enabled && !active };
}

// The sink the PrayerFlow of the screen hands its paragraphs to, kept under the name of the hour
// («Laudes», «Missa»…) for the voice; they go when the screen is closed.
function useSpeechSink(hour: string) {
  useEffect(() => () => clearScreenSpeech(hour), [hour]);
  return useCallback((paragraphs: SpeechParagraph[]) => setScreenSpeech(hour, paragraphs), [hour]);
}

// The invitatory psalm and the Marian antiphon chosen in a prayer are kept for the next time, as
// always. The screens call these while they draw, so they only change the loaded settings in
// place and save them: nothing else has to redraw.
function chooseInvitationPsalm(psalm: string) {
  updateSettings({ invitationPsalmOption: psalm }, false);
  SettingsService.setSettingInvitationPsalm(psalm);
}

function chooseVirginAntiphon(antiphon: string) {
  updateSettings({ virginAntiphonOption: antiphon }, false);
  SettingsService.setSettingVirginAntiphon(antiphon);
}

// A setting that is on or off, read when the prayer opens: it changes nothing else, so it does not
// go through the loaded settings (and the liturgy is not loaded again when it changes)
function useSwitchSetting(read: () => Promise<string>): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let active = true;
    read().then((value) => active && setOn(value === 'true'));
    return () => {
      active = false;
    };
  }, [read]);
  return on;
}

export function HoursPrayerController({ route, navigation }: { route: { params: HoursRouteParams }; navigation: any }) {
  const { hours, day, settings, mass } = useLiturgy();
  const listening = useListening(route.params.type, route.params.title);
  const sheet = useHeaderButtons(navigation, listening.onListen, listening.dimmed);
  const sink = useSpeechSink(route.params.type);
  const withGospel = useSwitchSetting(SettingsService.getSettingLaudesGospel);
  const gospel =
    withGospel && route.params.type === 'Laudes'
      ? laudesGospel({ today: day.today, tomorrow: day.tomorrow, gospel: mass.today.gospel })
      : null;
  return (
    <SpeechSink.Provider value={sink}>
      <View style={styles.screen}>
        <SpeechFollow.Provider value={listening.follow}>
          <HoursLiturgyPrayerScreen
            type={route.params.type}
            celebration={route.params.subtitle}
            hours={hours}
            today={day.today}
            settings={settings}
            laudesGospel={gospel}
            onInvitationPsalmChange={chooseInvitationPsalm}
            onVirginAntiphonChange={chooseVirginAntiphon}
          />
        </SpeechFollow.Provider>
        {listening.bar}
      </View>
      {sheet}
      {listening.sheet}
      {listening.notice}
    </SpeechSink.Provider>
  );
}

export function MassPrayerController({ route, navigation }: { route: { params: MassRouteParams }; navigation: any }) {
  const { mass, day } = useLiturgy();
  const listening = useListening('Missa', 'Lectures de la missa');
  const sheet = useHeaderButtons(navigation, listening.onListen, listening.dimmed);
  const sink = useSpeechSink('Missa');
  const showVideos = useSwitchSetting(SettingsService.getSettingShowVideos);
  return (
    <SpeechSink.Provider value={sink}>
      <View style={styles.screen}>
        <SpeechFollow.Provider value={listening.follow}>
          <MassLiturgyPrayerScreen
            type={route.params.type}
            needSecondReading={route.params.needSecondReading}
            useVespersTexts={route.params.useVespersTexts}
            mass={mass}
            today={day.today}
            showVideos={showVideos}
          />
        </SpeechFollow.Provider>
        {listening.bar}
      </View>
      {sheet}
      {listening.sheet}
      {listening.notice}
    </SpeechSink.Provider>
  );
}

const styles = StyleSheet.create({
  // The prayer above, and the small player at its foot while an hour is read aloud
  screen: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import HoursLiturgyPrayerScreen from '../views/hours-liturgy/HoursLiturgyPrayerScreen';
import { SpeechSink } from '../components/SpeechSink';
import SettingsService from '../services/SettingsService';
import { buildHours } from '../view-models/hours';
import { laudesGospel } from '../view-models/laudesGospel';
import { speechScript } from '../view-models/speech/script';
import type { SpeechParagraph } from '../view-models/speech/paragraph';
import { currentDate, getSnapshot, useLiturgy } from './liturgyStore';
import {
  cancelPreparing,
  hourPrepared,
  needsPreparing,
  startPreparing,
  subscribePreparation,
  today,
  usePreparation,
} from './carController';

// The hours of today, drawn one at a time out of sight to keep their words for the car
// (controllers/carController). It lives under the home, which is always there while the app is open.
// Nothing of it is seen, touched or read by a screen reader. It draws only on a phone that has been
// in a car, once a day.

// The screen hands its paragraphs a few times while it settles: these many milliseconds without a
// change and they are the ones
const SETTLE_MS = 400;
// An hour that gives no words in this long is left out, so that the rest still get ready
const GIVE_UP_MS = 8000;
const nothing = () => undefined;

export default function CarScriptPreparer() {
  const { hours, day, settings, mass } = useLiturgy();
  const preparation = usePreparation();
  const { width } = useWindowDimensions();
  const [withGospel, setWithGospel] = useState(false);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef<SpeechParagraph[] | null>(null);

  // Started when the home shows today, and again if the car connects
  useEffect(() => {
    const check = () => {
      const day = today();
      if (today(currentDate()) !== day || !needsPreparing(day)) return;
      SettingsService.getSettingLaudesGospel()
        .then((value) => {
          setWithGospel(value === 'true');
          const tiles = buildHours({
            vespersTitle: getSnapshot().hours.vespers?.title ?? '',
            specificLiturgyTime: getSnapshot().day.today.specificLiturgyTime,
            hour: new Date().getHours(),
          });
          startPreparing(
            day,
            tiles.map((t) => ({ hour: t.screenType, title: t.label, subtitle: t.subtitle ?? '' })),
          );
        })
        .catch(() => undefined);
    };
    check();
    return subscribePreparation(check);
  }, [day]);

  // Another day on the home in the middle of it: what was being drawn is not today's any more
  useEffect(() => {
    if (preparation && today(currentDate()) !== preparation.day) cancelPreparing();
  }, [day, preparation]);

  const current = preparation ? preparation.hours[preparation.done.length] : undefined;

  const sink = useCallback(
    (paragraphs: SpeechParagraph[]) => {
      if (!current) return;
      latest.current = paragraphs;
      if (settle.current) clearTimeout(settle.current);
      settle.current = setTimeout(() => {
        settle.current = null;
        const words = latest.current ?? [];
        latest.current = null;
        hourPrepared({
          hour: current.hour,
          title: current.title,
          subtitle: current.subtitle,
          pieces: speechScript(current.hour, words, getSnapshot().ourFather),
        });
      }, SETTLE_MS);
    },
    [current],
  );

  useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current);
    },
    [],
  );

  useEffect(() => {
    if (!current) return;
    const giveUp = setTimeout(() => {
      if (!latest.current && !settle.current) {
        hourPrepared({ hour: current.hour, title: current.title, subtitle: current.subtitle, pieces: [] });
      }
    }, GIVE_UP_MS);
    return () => clearTimeout(giveUp);
  }, [current]);

  if (!current) return null;
  const gospel =
    withGospel && current.hour === 'Laudes'
      ? laudesGospel({ today: day.today, tomorrow: day.tomorrow, gospel: mass.today.gospel })
      : null;
  return (
    <View
      testID="car-script-preparer"
      pointerEvents="none"
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[styles.hidden, { width }]}
    >
      <SpeechSink.Provider value={sink}>
        <HoursLiturgyPrayerScreen
          key={current.hour}
          type={current.hour}
          celebration={current.subtitle || undefined}
          hours={hours}
          today={day.today}
          settings={settings}
          laudesGospel={gospel}
          onInvitationPsalmChange={nothing}
          onVirginAntiphonChange={nothing}
        />
      </SpeechSink.Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  // Off the screen and transparent: drawn, never seen
  hidden: {
    position: 'absolute',
    top: 0,
    left: -20000,
    opacity: 0,
  },
});

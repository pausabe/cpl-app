import React, { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import * as ExpoApplication from 'expo-application';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import SettingsService, { DioceseName, PrayingPlace } from '../Services/SettingsService';
import { SessionLogs } from '../Utils/Logger';
import SettingsScreen, { SettingsValues } from '../Views/Settings/SettingsScreen';
import * as LiturgyStore from './LiturgyStore';
import { useTextSettings } from './AppearanceSettings';

// Configuració. Reads the saved settings, and saves each change where it has always been saved
// (SettingsService). The Latin hymns, the diocese and the place change the liturgy: the day being
// shown is loaded again with them. The text size and the dark mode apply at once.

const DIOCESES = Object.values(DioceseName) as string[];
const PLACES = Object.values(PrayingPlace) as string[];

function versionName(): string {
  try {
    return (Constants as any).manifest2.extra.expoClient.version;
  } catch (e) {
    return ExpoApplication.nativeApplicationVersion ?? '';
  }
}

type OtherValues = Omit<SettingsValues, 'textSizeStep' | 'darkMode'>;

async function loadOtherValues(): Promise<OtherValues> {
  return {
    useLatin: (await SettingsService.getSettingUseLatin()) === 'true',
    diocese: (await SettingsService.getSettingDiocesis()) as string,
    place: (await SettingsService.getSettingLloc()) as string,
    showVideos: (await SettingsService.getSettingShowVideos()) === 'true',
  };
}

export default function SettingsController() {
  const { database, hours } = LiturgyStore.useLiturgy();
  const textSettings = useTextSettings();
  const [others, setOthers] = useState<OtherValues | null>(null);

  useEffect(() => {
    let active = true;
    loadOtherValues().then((values) => active && setOthers(values));
    return () => {
      active = false;
    };
  }, []);

  const reloadLiturgy = () => LiturgyStore.reload(LiturgyStore.currentDate());
  const change = (changes: Partial<OtherValues>) =>
    setOthers((current) => (current ? { ...current, ...changes } : current));

  const values: SettingsValues | null = others
    ? {
        ...others,
        textSizeStep: textSettings.textSizeStep,
        darkMode: textSettings.darkMode,
      }
    : null;

  return (
    <SettingsScreen
      values={values}
      dioceses={DIOCESES}
      places={PLACES}
      info={{
        appVersion: `${versionName()} (${ExpoApplication.nativeBuildVersion ?? ''})`,
        databaseVersion: String(database.Version ?? ''),
        technical: [
          `Esquema de color: ${Appearance.getColorScheme()}`,
          `Precedència: avui (${hours.TodayCelebrationInformation?.Precedence}) demà (${hours.TomorrowCelebrationInformation?.Precedence})`,
          `EAS-runtimeVersion: ${Updates.runtimeVersion}`,
          `EAS-channel: ${Updates.channel}`,
          `EAS-updateId: ${Updates.updateId}`,
        ],
        logs: SessionLogs,
      }}
      onTextSizeChange={textSettings.onTextSizeChange}
      onDarkModeChange={textSettings.onDarkModeChange}
      onLatinChange={async (enabled) => {
        change({ useLatin: enabled });
        await SettingsService.setSettingUseLatin(enabled ? 'true' : 'false', undefined);
        await reloadLiturgy();
      }}
      onDioceseChange={async (diocese) => {
        change({ diocese });
        await SettingsService.setSettingDiocesis(diocese, undefined);
        await reloadLiturgy();
      }}
      onPlaceChange={async (place) => {
        change({ place });
        await SettingsService.setSettingLloc(place, undefined);
        await reloadLiturgy();
      }}
      onShowVideosChange={async (enabled) => {
        change({ showVideos: enabled });
        await SettingsService.setSettingShowVideos(enabled ? 'true' : 'false', undefined);
      }}
    />
  );
}

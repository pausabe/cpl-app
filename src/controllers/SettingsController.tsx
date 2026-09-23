import React, { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import * as ExpoApplication from 'expo-application';
import Constants from 'expo-constants';
import SettingsService, { DioceseName, PrayingPlace } from '../services/SettingsService';
import { SessionLogs } from '../utils/logger';
import SettingsScreen, { SettingsValues } from '../views/settings/SettingsScreen';
import * as LiturgyStore from './liturgyStore';
import { bundledDatabaseInformation, currentDatabaseVersion } from '../services/databaseManagerService';
import { useTextSettings } from './appearanceSettings';

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
    diocese: (await SettingsService.getSettingDiocese()) as string,
    place: (await SettingsService.getSettingPrayingPlace()) as string,
    showVideos: (await SettingsService.getSettingShowVideos()) === 'true',
  };
}

export default function SettingsController() {
  const { database, hours } = LiturgyStore.useLiturgy();
  // Which published database the phone is praying with: the one inside the app until one is
  // downloaded from the publishing website
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  useEffect(() => {
    currentDatabaseVersion()
      .then(setPublishedVersion)
      .catch(() => setPublishedVersion(null));
  }, []);
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
        databaseVersion: String(database.version ?? ''),
        technical: [
          `Esquema de color: ${Appearance.getColorScheme()}`,
          `Precedència: avui (${hours.todayCelebrationInformation?.precedence}) demà (${hours.tomorrowCelebrationInformation?.precedence})`,
          `Publicació de la base de dades: ${publishedVersion ?? '?'} (dins l'app: ${bundledDatabaseInformation().version})`,
          `Compatibilitat: ${bundledDatabaseInformation().compat}`,
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
        await SettingsService.setSettingDiocese(diocese, undefined);
        await reloadLiturgy();
      }}
      onPlaceChange={async (place) => {
        change({ place });
        await SettingsService.setSettingPrayingPlace(place, undefined);
        await reloadLiturgy();
      }}
      onShowVideosChange={async (enabled) => {
        change({ showVideos: enabled });
        await SettingsService.setSettingShowVideos(enabled ? 'true' : 'false', undefined);
      }}
    />
  );
}

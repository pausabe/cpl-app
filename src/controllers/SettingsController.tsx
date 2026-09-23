import React, { useEffect, useState } from 'react';
import { Appearance, Linking } from 'react-native';
import * as ExpoApplication from 'expo-application';
import Constants from 'expo-constants';
import SettingsService, { DioceseName, PrayingPlace } from '../services/SettingsService';
import { SessionLogs } from '../utils/logger';
import SettingsScreen, { SettingsValues } from '../views/settings/SettingsScreen';
import { LocationStatus } from '../view-models/notices';
import WebSheet from '../components/WebSheet';
import * as LiturgyStore from './liturgyStore';
import { bundledDatabaseInformation, currentDatabaseVersion } from '../services/databaseManagerService';
import { currentIdentifier } from '../services/usageService';
import { askAgainOnTheNextOpening } from '../services/databaseUpdateService';
import { useTextSettings } from './appearanceSettings';
import { autoselectDiocese } from './dioceseAutoselection';

// Configuració. Reads the saved settings, and saves each change where it has always been saved
// (SettingsService). The Latin hymns, the diocese and the place change the liturgy: the day being
// shown is loaded again with them. The text size and the dark mode apply at once.

const PRIVACY_URL = 'https://www.cpl.es/politica-de-privacidad/';

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
  // The code this phone sends today so that it can be counted once, and nothing else about it
  const [usage, setUsage] = useState<{ device: string; madeOn: string } | null>(null);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  // How the last search for the diocese went, so that the screen can say so
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  useEffect(() => {
    currentDatabaseVersion()
      .then(setPublishedVersion)
      .catch(() => setPublishedVersion(null));
    currentIdentifier()
      .then(setUsage)
      .catch(() => setUsage(null));
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

  // Once out to the phone's own settings, whatever they do there is theirs: the refusal is
  // forgotten so that coming back and pressing again asks for the position, not for the settings.
  const openPhoneSettings = () => {
    Linking.openSettings().catch(() => undefined);
    setLocationStatus('idle');
  };

  // Looking for the diocese where the phone is. When it finds one the row above changes, which
  // says it better than any message; every other outcome leaves the setting alone and is told.
  const useMyLocation = async () => {
    setLocationStatus('locating');
    const outcome = await autoselectDiocese();
    if (outcome.kind !== 'saved') {
      setLocationStatus(outcome.kind);
      return;
    }
    change({ diocese: outcome.diocese });
    setLocationStatus('idle');
    await reloadLiturgy();
  };

  const values: SettingsValues | null = others
    ? {
        ...others,
        textSizeStep: textSettings.textSizeStep,
        darkMode: textSettings.darkMode,
      }
    : null;

  // What the bottom of the screen shows, and what the «Copia-ho tot» button copies
  const info = {
    appVersion: `${versionName()} (${ExpoApplication.nativeBuildVersion ?? ''})`,
    databaseVersion: String(database.version ?? ''),
    technical: [
      `Esquema de color: ${Appearance.getColorScheme()}`,
      `Precedència: avui (${hours.todayCelebrationInformation?.precedence}) demà (${hours.tomorrowCelebrationInformation?.precedence})`,
      `Publicació de la base de dades: ${publishedVersion ?? '?'} (dins l'app: ${bundledDatabaseInformation().version})`,
      `Compatibilitat: ${bundledDatabaseInformation().compat}`,
      `Identificador: ${usage?.device ?? 'encara cap'}${usage ? ` (fet el ${usage.madeOn})` : ''}`,
    ],
    logs: SessionLogs,
  };

  return (
    <>
      <SettingsScreen
        values={values}
        dioceses={DIOCESES}
        places={PLACES}
        locationStatus={locationStatus}
        onUseMyLocation={useMyLocation}
        onOpenPhoneSettings={openPhoneSettings}
        info={info}
        onTextSizeChange={textSettings.onTextSizeChange}
        onDarkModeChange={textSettings.onDarkModeChange}
        onLatinChange={async (enabled) => {
          change({ useLatin: enabled });
          await SettingsService.setSettingUseLatin(enabled ? 'true' : 'false', undefined);
          await reloadLiturgy();
        }}
        onDioceseChange={async (diocese) => {
          change({ diocese });
          setLocationStatus('idle');
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
        onAskAgainForTheDatabase={() => {
          askAgainOnTheNextOpening().catch(() => undefined);
        }}
        onPrivacy={() => setPrivacyVisible(true)}
      />
      <WebSheet
        visible={privacyVisible}
        title="Política de privacitat"
        url={PRIVACY_URL}
        onClose={() => setPrivacyVisible(false)}
        testID="privacy-sheet"
      />
    </>
  );
}

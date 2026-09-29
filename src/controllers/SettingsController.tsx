import React, { useEffect, useState } from 'react';
import { Appearance, Linking } from 'react-native';
import * as ExpoApplication from 'expo-application';
import Constants from 'expo-constants';
import SettingsService, {
  DEFAULT_EDITION,
  DioceseName,
  PrayingPlace,
  editionName,
  editionsOffered,
} from '../services/SettingsService';
import { SessionLogs } from '../utils/logger';
import SettingsScreen, { SettingsValues } from '../views/settings/SettingsScreen';
import { EditionStatus, LocationStatus } from '../view-models/notices';
import WebSheet from '../components/WebSheet';
import * as LiturgyStore from './liturgyStore';
import {
  bundledDatabaseInformation,
  currentDatabaseVersion,
  openedDatabaseEdition,
  openedDatabaseVersion,
} from '../services/databaseManagerService';
import { currentIdentifier } from '../services/usageService';
import { askAgainOnTheNextOpening, knownEditions, prepareEdition } from '../services/databaseUpdateService';
import { useTextSettings } from './appearanceSettings';
import { autoselectDiocese } from './dioceseAutoselection';
import { obtainPlaceOptions, PlaceOptions, resolvePlace } from '../services/calendarService';

// Configuració. Reads the saved settings, and saves each change where it has always been saved
// (SettingsService). The language of the texts, the Latin hymns, the diocese and the place change
// the liturgy: the day being shown is loaded again with them. The text size and the dark mode apply
// at once.

const PRIVACY_URL = 'https://www.cpl.es/politica-de-privacidad/';

// The dioceses and places of before; a database with calendars brings its own (see calendarService)
const DIOCESES = Object.values(DioceseName) as string[];
const PLACES = Object.values(PrayingPlace) as string[];
const FIXED_OPTIONS: PlaceOptions = { dioceses: DIOCESES, placesOf: () => PLACES };

function versionName(): string {
  try {
    return (Constants as any).manifest2.extra.expoClient.version;
  } catch (e) {
    return ExpoApplication.nativeApplicationVersion ?? '';
  }
}

type OtherValues = Omit<SettingsValues, 'textSizeStep' | 'darkMode'>;

// The editions to choose from: those the website has for this app, and always the Catalan one and
// the one chosen, so that whoever chose another one can come back. Nothing to choose while the
// website has only the Catalan one.
export function editionChoices(known: string[], chosen: string): string[] {
  const editions = [...new Set([DEFAULT_EDITION, ...known, chosen])];
  return editions.length > 1 ? editions : [];
}

interface Loaded {
  others: OtherValues;
  options: PlaceOptions;
  editions: string[];
}

// What the screen shows: the diocese and the place are those of the database open, as the app
// prays with them (see dataService), and its calendars are what can be chosen
async function load(): Promise<Loaded> {
  const opened = openedDatabaseEdition() ?? DEFAULT_EDITION;
  const fromDatabase = await obtainPlaceOptions().catch(() => null);
  const saved = {
    diocese: await SettingsService.getSettingDiocese(opened),
    place: await SettingsService.getSettingPrayingPlace(opened),
  };
  const chosen = await SettingsService.getSettingEdition();
  return {
    others: {
      useLatin: (await SettingsService.getSettingUseLatin()) === 'true',
      edition: chosen,
      ...(fromDatabase ? resolvePlace(fromDatabase, saved.diocese, saved.place) : saved),
      showVideos: (await SettingsService.getSettingShowVideos()) === 'true',
    },
    options: fromDatabase ?? FIXED_OPTIONS,
    editions: editionsOffered() ? editionChoices(await knownEditions(), chosen) : [],
  };
}

// Which publication is being prayed with, which one is waiting and which one the app carries
// inside. They are three different things and saying only one of them misleads: a database
// downloaded a minute ago is on the phone but is not the one open, and the one inside the app
// stays at whatever it was when the app was built.
export function publicationLine(opened: number | null, ready: number | null, bundled: number): string {
  const waiting = ready !== null && opened !== null && ready > opened ? `, baixada la ${ready}` : '';
  // «Dins l'app» es llegia com la que fa servir ara: la que l'app porta enganxada des que es va
  // compilar és amb la que va arribar de la botiga, i només canvia quan se n'instal·la una de nova
  return `Publicació en ús: ${opened ?? '?'}${waiting} (l'app va arribar amb la ${bundled})`;
}

export default function SettingsController() {
  const { database, hours } = LiturgyStore.useLiturgy();
  // The newest published database the phone has, which is the one it will open next time: a
  // database downloaded while the app is open is not the one being prayed with yet
  const [readyVersion, setReadyVersion] = useState<number | null>(null);
  // The code this phone sends today so that it can be counted once, and nothing else about it
  const [usage, setUsage] = useState<{ device: string; madeOn: string } | null>(null);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  // How the last search for the diocese went, so that the screen can say so
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  useEffect(() => {
    currentDatabaseVersion()
      .then(setReadyVersion)
      .catch(() => setReadyVersion(null));
    currentIdentifier()
      .then(setUsage)
      .catch(() => setUsage(null));
  }, []);
  const textSettings = useTextSettings();
  const [others, setOthers] = useState<OtherValues | null>(null);
  const [options, setOptions] = useState<PlaceOptions>(FIXED_OPTIONS);
  const [editions, setEditions] = useState<string[]>([]);
  const [editionStatus, setEditionStatus] = useState<EditionStatus>('idle');

  const show = ({ others: values, options: fromDatabase, editions: choices }: Loaded) => {
    setOthers(values);
    setOptions(fromDatabase);
    setEditions(choices);
  };

  useEffect(() => {
    let active = true;
    load().then((loaded) => active && show(loaded));
    return () => {
      active = false;
    };
  }, []);

  const reloadLiturgy = () => LiturgyStore.reload(LiturgyStore.currentDate());
  const change = (changes: Partial<OtherValues>) =>
    setOthers((current) => (current ? { ...current, ...changes } : current));

  // Another language of the texts: its database first, downloaded if the phone does not have it, and
  // then the day loaded again with it. Its calendars are what the diocese and the place can be now.
  const changeEdition = async (edition: string) => {
    if (editionStatus === 'downloading') return;
    setEditionStatus('downloading');
    const outcome = await prepareEdition(edition);
    if (outcome !== 'ready') {
      setEditionStatus(outcome);
      return;
    }
    await SettingsService.setSettingEdition(edition);
    change({ edition });
    setEditionStatus('idle');
    await reloadLiturgy();
    show(await load());
  };

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
        edition: editionName(others.edition),
        textSizeStep: textSettings.textSizeStep,
        darkMode: textSettings.darkMode,
      }
    : null;
  // The diocese and the place are saved for the edition open, which is the chosen one once the phone
  // has it
  const opened = openedDatabaseEdition() ?? DEFAULT_EDITION;

  // What the bottom of the screen shows, and what the «Copia-ho tot» button copies
  const info = {
    appVersion: `${versionName()} (${ExpoApplication.nativeBuildVersion ?? ''})`,
    databaseVersion: String(database.version ?? ''),
    technical: [
      `Esquema de color: ${Appearance.getColorScheme()}`,
      `Precedència: avui (${hours.todayCelebrationInformation?.precedence}) demà (${hours.tomorrowCelebrationInformation?.precedence})`,
      publicationLine(openedDatabaseVersion(), readyVersion, bundledDatabaseInformation().version),
      `Compatibilitat: ${bundledDatabaseInformation().compat}`,
      `Edició: ${opened}`,
      `Identificador: ${usage?.device ?? 'encara cap'}${usage ? ` (fet el ${usage.madeOn})` : ''}`,
    ],
    logs: SessionLogs,
  };

  return (
    <>
      <SettingsScreen
        values={values}
        editions={editions.map(editionName)}
        editionStatus={editionStatus}
        onEditionChange={(name) => {
          const edition = editions.find((candidate) => editionName(candidate) === name);
          if (edition) changeEdition(edition);
        }}
        dioceses={options.dioceses}
        places={others ? options.placesOf(others.diocese) : PLACES}
        locationStatus={locationStatus}
        onUseMyLocation={useMyLocation}
        onOpenPhoneSettings={openPhoneSettings}
        info={info}
        onTextSizeChange={textSettings.onTextSizeChange}
        onDarkModeChange={textSettings.onDarkModeChange}
        onLatinChange={async (enabled) => {
          change({ useLatin: enabled });
          await SettingsService.setSettingUseLatin(enabled ? 'true' : 'false');
          await reloadLiturgy();
        }}
        onDioceseChange={async (diocese) => {
          // A diocese without the place chosen until now (Andorra has only one) takes its first one
          const places = options.placesOf(diocese);
          const place = others && !places.includes(others.place) ? places[0] : undefined;
          change(place ? { diocese, place } : { diocese });
          setLocationStatus('idle');
          await SettingsService.setSettingDiocese(diocese, options.dioceses, opened);
          if (place) await SettingsService.setSettingPrayingPlace(place, places, opened);
          await reloadLiturgy();
        }}
        onPlaceChange={async (place) => {
          change({ place });
          await SettingsService.setSettingPrayingPlace(
            place,
            others ? options.placesOf(others.diocese) : PLACES,
            opened,
          );
          await reloadLiturgy();
        }}
        onShowVideosChange={async (enabled) => {
          change({ showVideos: enabled });
          await SettingsService.setSettingShowVideos(enabled ? 'true' : 'false');
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

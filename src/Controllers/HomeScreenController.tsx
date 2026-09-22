import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {AppState, Appearance, Linking, Platform, View} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {StatusBar} from 'expo-status-bar';
import {useAssets} from 'expo-asset';
import GlobalKeys from '../Utils/GlobalKeys';
import * as Logger from '../Utils/Logger';
import {DateManagement} from '../Utils/DateManagement';
import * as StorageService from '../Services/Storage/StorageService';
import StorageKeys from '../Services/Storage/StorageKeys';
import {SpecificLiturgyTimeType} from '../Services/CelebrationTimeEnums';
import * as LiturgyStore from './LiturgyStore';
import {followSystemAppearance} from './AppearanceSettings';
import {useTheme} from '../Theme';
import HeaderButton from '../Components/HeaderButton';
import HomeScreen from '../Views/Home/HomeScreen';
import LatePrayerDialog from '../Views/Home/LatePrayerDialog';
import CalendarDialog from '../Views/Home/CalendarDialog';
import WhatsNewSheet from '../Views/Home/WhatsNewSheet';
import WebSheet from '../Components/WebSheet';
import {wasOpenedBefore} from './FirstRun';
import LoadError from '../Views/Home/LoadError';
import {buildDayCard} from '../ViewModels/DayCard';
import {buildHours, HourTile} from '../ViewModels/Hours';
import {buildMass, massChoiceToStore, MassChoice, MassScreenType, resolveMassChoice} from '../ViewModels/Mass';
import {latePrayerTexts} from '../ViewModels/Notices';

// The home. It loads the day when the app opens and when the day changes, and keeps doing what
// it always did: coming back to the app on another day loads today's liturgy, between midnight
// and 3 h it asks whether yesterday's is wanted, the calendar changes the day, and the switch of
// an optional memorial is remembered for the day. It builds what the home shows (ViewModels) and
// gives it to the view (Views/Home/HomeScreen), which only draws.

const LOAD_ERROR_MESSAGE = "Ha sorgit un error inesperat i no és possible obrir l'aplicació de manera normal.\nProva de desinstal·lar l'aplicació i a tornar-la a instal·lar i si el problema persisteix, posa't en contacte amb cpl@cpl.es\nDisculpa les molèsties.";
const MESSAGE_URL = 'https://www.cpl.es/contacto/';
const DONATION_URL = 'https://buy.stripe.com/6oE16v3LV6oa7VC4gg';

// The notice "Ara ho tens tot a l'inici", once. Set to false to stop showing it.
const SHOW_WHATS_NEW = true;
const WHATS_NEW_SEEN_KEY = 'WhatsNewSeen_9.0.0';

type Status = 'loading' | 'ready' | 'error';

function isLatePrayer(): boolean {
    const hour = new Date().getHours();
    return hour >= 0 && hour < GlobalKeys.late_prayer;
}

// The hour of the day, kept up to date: at every o'clock and when coming back to the app
function useCurrentHour(): number {
    const [hour, setHour] = useState(() => new Date().getHours());
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const schedule = () => {
            const now = new Date();
            const next = new Date(now);
            next.setHours(now.getHours() + 1, 0, 5, 0);
            timer = setTimeout(() => {
                setHour(new Date().getHours());
                schedule();
            }, next.getTime() - now.getTime());
        };
        schedule();
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') setHour(new Date().getHours());
        });
        return () => {
            clearTimeout(timer);
            subscription.remove();
        };
    }, []);
    return hour;
}

export default function HomeScreenController({navigation}: {navigation: any}) {
    const theme = useTheme();
    const snapshot = LiturgyStore.useLiturgy();
    const hour = useCurrentHour();
    const [databaseAssets, databaseAssetsError] = useAssets([require('../Assets/db/cpl-app.db')]);
    const [status, setStatus] = useState<Status>(LiturgyStore.isLoaded() ? 'ready' : 'loading');
    const [latePrayerVisible, setLatePrayerVisible] = useState(false);
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [whatsNewPending, setWhatsNewPending] = useState(false);
    const [webPage, setWebPage] = useState<'message' | 'donation' | null>(null);
    const [massChoice, setMassChoice] = useState<{day: string; choice: MassChoice} | null>(null);
    // Whether this home has loaded the day itself: until then the store may still hold a day
    // loaded before (in the tests, the previous test's), which must not decide the Mass
    const [loadedHere, setLoadedHere] = useState(false);
    const started = useRef(false);

    const load = useCallback(async (date: Date, databaseAsset?: unknown): Promise<boolean> => {
        try {
            await LiturgyStore.reload(date, databaseAsset);
            setStatus('ready');
            setLoadedHere(true);
            return true;
        } catch (error) {
            Logger.LogError(Logger.LogKeys.HomeScreenController, 'load', error as Error);
            setStatus('error');
            return false;
        }
    }, []);

    // --- Opening the app -------------------------------------------------------------------
    useEffect(() => {
        if (started.current) return;
        if (databaseAssetsError) {
            started.current = true;
            setStatus('error');
            SplashScreen.hideAsync().catch(() => undefined);
            return;
        }
        if (!databaseAssets || !databaseAssets[0]) return;
        started.current = true;
        (async () => {
            // Before the first load, which copies the database
            const openedBefore = await wasOpenedBefore();
            const loaded = await load(new Date(), databaseAssets[0]);
            const late = loaded && isLatePrayer();
            setLatePrayerVisible(late);
            if (loaded && SHOW_WHATS_NEW && !(await StorageService.GetData(WHATS_NEW_SEEN_KEY))) {
                // Only to whoever knew the old home
                if (openedBefore) setWhatsNewPending(true);
                else StorageService.StoreData(WHATS_NEW_SEEN_KEY, 'true');
            }
            // The splash has covered everything until now (App.js): it goes once the day is
            // drawn, with the colours of the chosen theme. With the midnight notice on iOS the
            // splash, the modal and the timer do not get along: at once.
            setTimeout(() => {
                SplashScreen.hideAsync().catch(() => undefined);
            }, late && Platform.OS === 'ios' ? 0 : 100);
        })();
    }, [databaseAssets, databaseAssetsError]);

    // --- Coming back to the app on another day, and the system switching light / dark ---------
    useEffect(() => {
        const appState = AppState.addEventListener('change', async (next) => {
            if (next !== 'active' || !LiturgyStore.isLoaded()) return;
            const now = new Date();
            if (!DateManagement.DatesAreTheEqual(now, LiturgyStore.lastRefreshDate())) {
                navigation.popToTop();
                setCalendarVisible(false);
                setLatePrayerVisible(false);
                await load(now);
            }
        });
        const appearance = Appearance.addChangeListener(() => {
            followSystemAppearance().catch((error) =>
                Logger.LogError(Logger.LogKeys.HomeScreenController, 'followSystemAppearance', error));
        });
        return () => {
            appState.remove();
            appearance.remove();
        };
    }, [navigation, load]);

    // --- Top bar: calendar on the left, settings on the right, as always -------------------
    useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <HeaderButton icon="calendar" accessibilityLabel="Calendari" testID="calendar-button"
                              onPress={() => setCalendarVisible(true)}/>
            ),
            headerRight: () => (
                <HeaderButton icon="settings" accessibilityLabel="Configuració" testID="settings-button"
                              onPress={() => navigation.navigate('Settings')}/>
            ),
        });
    }, [navigation]);

    const today: Date | undefined = snapshot.day.Today.Date;
    const todayKey = today ? DateManagement.GetDateKeyToBeStored(today) : '';

    // --- Avui | Vespertina: the choice of the day, kept for the day ---------------------------
    const choiceInput = status === 'ready' && loadedHere && today ? {
        todayKey,
        hasVespers: !!snapshot.mass.HasVespers,
        tomorrowIsEasterSunday: snapshot.day.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday,
        hour: today.getHours(),
        afternoonHour: GlobalKeys.afternoon_hour,
    } : null;
    useEffect(() => {
        if (!choiceInput) return;
        let active = true;
        StorageService.GetData(StorageKeys.CurrentMassVespersSelector).then((stored) => {
            const decision = resolveMassChoice({...choiceInput, stored: stored as string});
            if (!active) return;
            setMassChoice({day: choiceInput.todayKey, choice: decision.choice});
            if (decision.save) {
                StorageService.StoreData(StorageKeys.CurrentMassVespersSelector, massChoiceToStore(choiceInput.todayKey, decision.choice));
            }
        });
        return () => {
            active = false;
        };
    }, [snapshot.revision, status, loadedHere]);

    const choice: MassChoice = massChoice && massChoice.day === todayKey
        ? massChoice.choice
        : choiceInput ? resolveMassChoice({...choiceInput, stored: null}).choice : 'normal';

    const onMassChoice = (next: MassChoice) => {
        setMassChoice({day: todayKey, choice: next});
        StorageService.StoreData(StorageKeys.CurrentMassVespersSelector, massChoiceToStore(todayKey, next));
    };

    // --- What the home shows -------------------------------------------------------------------
    const model = useMemo(() => {
        if (status !== 'ready' || !today) return null;
        const {day, celebration, settings, hours, mass} = snapshot;
        return {
            day: buildDayCard(day.Today, celebration, settings),
            hours: buildHours({vespersTitle: hours.Vespers?.Title, specificLiturgyTime: day.Today.SpecificLiturgyTime, hour}),
            mass: buildMass({today: day.Today, tomorrow: day.Tomorrow, mass, choice}),
        };
    }, [snapshot, status, hour, choice]);

    // --- What the user does --------------------------------------------------------------------
    const showDate = async (date: Date) => {
        setCalendarVisible(false);
        setLatePrayerVisible(false);
        if (today && DateManagement.DatesAreTheEqual(date, today)) return;
        await load(date);
    };

    const onOptionalMemoryChange = async (enabled: boolean) => {
        if (!today) return;
        await StorageService.StoreData(StorageKeys.OptionalFestivity, enabled ? DateManagement.GetDateKeyToBeStored(today) : 'none');
        LiturgyStore.updateSettings({OptionalFestivityEnabled: enabled});
        await load(today);
    };

    const onOpenHour = (tile: HourTile) => navigation.navigate('LHDisplay', {
        type: tile.screenType,
        title: tile.label,
        ...(tile.subtitle ? {subtitle: tile.subtitle} : {}),
    });

    const onOpenReading = (opens: MassScreenType) => {
        if (!model) return;
        navigation.navigate('LDDisplay', {type: opens, title: 'Missa', ...model.mass.params});
    };

    // On iOS the donation goes to Safari: the App Store only lets an app collect donations
    // outside it (guideline 3.2.2). On Android, in a sheet like the message.
    const onDonation = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL(DONATION_URL);
        } else {
            setWebPage('donation');
        }
    };

    const closeWhatsNew = () => {
        setWhatsNewPending(false);
        StorageService.StoreData(WHATS_NEW_SEEN_KEY, 'true');
    };

    if (status === 'error') {
        return <LoadError message={LOAD_ERROR_MESSAGE}/>;
    }
    if (!model || !today) {
        return <View style={{flex: 1, backgroundColor: theme.colors.homeBackground}}/>;
    }

    return (
        <View style={{flex: 1}}>
            <HomeScreen
                day={model.day}
                hours={model.hours}
                mass={model.mass}
                onOpenHour={onOpenHour}
                onOpenReading={onOpenReading}
                onMassChoice={onMassChoice}
                onOptionalMemoryChange={onOptionalMemoryChange}
                onMessage={() => setWebPage('message')}
                onDonation={onDonation}/>
            <WebSheet
                visible={webPage === 'message'}
                title="Missatge"
                url={MESSAGE_URL}
                onClose={() => setWebPage(null)}
                testID="message-sheet"/>
            <WebSheet
                visible={webPage === 'donation'}
                title="Donatiu lliure"
                url={DONATION_URL}
                onClose={() => setWebPage(null)}
                testID="donation-sheet"/>
            <CalendarDialog
                visible={calendarVisible}
                value={today}
                minimumDate={snapshot.database.MinimumSelectableDate}
                maximumDate={snapshot.database.MaximumSelectableDate}
                onCancel={() => setCalendarVisible(false)}
                onToday={() => showDate(new Date())}
                onChange={showDate}/>
            <LatePrayerDialog
                visible={latePrayerVisible}
                texts={latePrayerTexts(today, DateManagement.GetYesterday(today))}
                onYesterday={() => showDate(DateManagement.GetYesterday(today))}
                onToday={() => setLatePrayerVisible(false)}/>
            <WhatsNewSheet visible={whatsNewPending && !latePrayerVisible} onClose={closeWhatsNew}/>
            <StatusBar style="light"/>
        </View>
    );
}

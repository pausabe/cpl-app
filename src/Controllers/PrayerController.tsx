import React, {useEffect, useLayoutEffect, useState} from 'react';
import HoursLiturgyPrayerScreen from '../Views/HoursLiturgy/HoursLiturgyPrayerScreen';
import MassLiturgyPrayerScreen from '../Views/MassLiturgy/MassLiturgyPrayerScreen';
import HeaderButton from '../Components/HeaderButton';
import TextSettingsSheet from '../Components/TextSettingsSheet';
import SettingsService from '../Services/SettingsService';
import {updateSettings, useLiturgy} from './LiturgyStore';
import {useTextSettings} from './AppearanceSettings';

// The prayer (LHDisplay) and the readings (LDDisplay): they get the day's data from here, and
// the "Aa" button in the top bar opens the sheet with the text size and the dark mode.

export interface HoursRouteParams {
    // "Ofici", "Laudes", "Tèrcia"… (HourTile.screenType)
    type: string;
    // For the top bar: "Ofici de lectura"
    title: string;
}

export interface MassRouteParams {
    // "1Lect", "Salm", "2Lect", "Evangeli", "Rams", "VetllaPasquaLecturesSalms", "VetllaPasquaEvangeli"
    type: string;
    title: string;
    need_lectura2: boolean;
    useVespersTexts: boolean;
}

function useTextSettingsButton(navigation: any) {
    const [open, setOpen] = useState(false);
    const textSettings = useTextSettings();
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <HeaderButton
                    text="Aa"
                    accessibilityLabel="Mida del text i tema"
                    testID="text-settings-button"
                    onPress={() => setOpen(true)}/>
            ),
        });
    }, [navigation]);
    return <TextSettingsSheet visible={open} onClose={() => setOpen(false)} {...textSettings}/>;
}

// The invitatory psalm and the Marian antiphon chosen in a prayer are kept for the next time, as
// always. The screens call these while they draw, so they only change the loaded settings in
// place and save them: nothing else has to redraw.
function chooseInvitationPsalm(psalm: string) {
    updateSettings({InvitationPsalmOption: psalm}, false);
    SettingsService.setSettingNumSalmInv(psalm);
}

function chooseVirginAntiphon(antiphon: string) {
    updateSettings({VirginAntiphonOption: antiphon}, false);
    SettingsService.setSettingNumAntMare(antiphon);
}

export function HoursPrayerController({route, navigation}: {route: {params: HoursRouteParams}; navigation: any}) {
    const {hours, day, settings} = useLiturgy();
    const sheet = useTextSettingsButton(navigation);
    return (
        <>
            <HoursLiturgyPrayerScreen
                type={route.params.type}
                hours={hours}
                today={day.Today}
                settings={settings}
                onInvitationPsalmChange={chooseInvitationPsalm}
                onVirginAntiphonChange={chooseVirginAntiphon}/>
            {sheet}
        </>
    );
}

export function MassPrayerController({route, navigation}: {route: {params: MassRouteParams}; navigation: any}) {
    const {mass, day} = useLiturgy();
    const sheet = useTextSettingsButton(navigation);
    const [showVideos, setShowVideos] = useState(false);
    useEffect(() => {
        let active = true;
        SettingsService.getSettingShowVideos().then((value) => active && setShowVideos(value === 'true'));
        return () => {
            active = false;
        };
    }, []);
    return (
        <>
            <MassLiturgyPrayerScreen
                type={route.params.type}
                needSecondReading={route.params.need_lectura2}
                useVespersTexts={route.params.useVespersTexts}
                mass={mass}
                today={day.Today}
                showVideos={showVideos}/>
            {sheet}
        </>
    );
}

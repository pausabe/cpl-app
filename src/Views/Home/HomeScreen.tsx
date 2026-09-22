import React, {useEffect, useState} from 'react';
import {LayoutChangeEvent, ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../Theme';
import {DayCard as DayCardModel} from '../../ViewModels/DayCard';
import {HourTile} from '../../ViewModels/Hours';
import {MassBlock as MassBlockModel, MassChoice, MassScreenType} from '../../ViewModels/Mass';
import DayCard from './DayCard';
import HoursGrid from './HoursGrid';
import MassBlock from './MassBlock';
import HomeFooter from './HomeFooter';
import DescriptionSheet from './DescriptionSheet';
import EdgeFade from '../../Components/EdgeFade';

// The home, "el tauler": everything of every day on one screen. The card of the day, the seven
// hours with the one of now, the Mass with the phrase of the Gospel, and Message and Donation in
// a bar at the bottom that is always there: on a small screen the rest scrolls under it and
// fades into it. It scrolls only when everything does not fit; when there is room to spare, the
// hours grow. On a tablet, one centred column.
//
// It only draws what HomeScreenController gives it.
export interface HomeScreenProps {
    day: DayCardModel;
    hours: HourTile[];
    mass: MassBlockModel;
    onOpenHour: (tile: HourTile) => void;
    onOpenReading: (opens: MassScreenType) => void;
    onMassChoice: (choice: MassChoice) => void;
    onOptionalMemoryChange: (enabled: boolean) => void;
    onMessage: () => void;
    onDonation: () => void;
}

export default function HomeScreen(props: HomeScreenProps) {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [descriptionOpen, setDescriptionOpen] = useState(false);
    // What the bottom bar covers: the scroll leaves that much room at its end
    const [footerHeight, setFooterHeight] = useState(FADE_HEIGHT + 52 + insets.bottom);
    const onFooterLayout = (event: LayoutChangeEvent) => setFooterHeight(Math.ceil(event.nativeEvent.layout.height));

    // Another day, another saint: the sheet does not stay open
    useEffect(() => setDescriptionOpen(false), [props.day.dateText, props.day.title]);

    return (
        <View testID="home" style={[styles.screen, {backgroundColor: theme.colors.homeBackground}]}>
            <ScrollView contentContainerStyle={[styles.scroll, {paddingBottom: footerHeight}]} automaticallyAdjustContentInsets={false}>
                <View style={[styles.column, {maxWidth: theme.layout.homeMaxWidth}]}>
                    <DayCard
                        day={props.day}
                        onOptionalMemoryChange={props.onOptionalMemoryChange}
                        onReadMore={() => setDescriptionOpen(true)}/>
                    <HoursGrid hours={props.hours} onOpen={props.onOpenHour}/>
                    <MassBlock mass={props.mass} onOpen={props.onOpenReading} onChoose={props.onMassChoice}/>
                    <View style={styles.spacer}/>
                </View>
            </ScrollView>
            <View testID="home-footer" style={styles.footer} pointerEvents="box-none" onLayout={onFooterLayout}>
                <EdgeFade color={theme.colors.homeBackground} height={FADE_HEIGHT}/>
                <View style={{backgroundColor: theme.colors.homeBackground, paddingBottom: Math.max(insets.bottom, 6)}}>
                    <HomeFooter onMessage={props.onMessage} onDonation={props.onDonation}/>
                </View>
            </View>
            {props.day.description ? (
                <DescriptionSheet day={props.day} visible={descriptionOpen} onClose={() => setDescriptionOpen(false)}/>
            ) : null}
        </View>
    );
}

// The fade above the bottom bar
const FADE_HEIGHT = 28;
// Between the card of the day, the hours and the Mass: more than inside each of them
const SECTION_GAP = 30;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
    },
    column: {
        flexGrow: 1,
        width: '100%',
        alignSelf: 'center',
        paddingTop: 14,
        paddingHorizontal: 16,
        gap: SECTION_GAP,
    },
    spacer: {
        flexGrow: 1,
    },
    footer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
});

import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
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

// The home, "el tauler": everything of every day on one screen. The card of the day, the seven
// hours with the one of now, the Mass with the phrase of the Gospel, and Message and Donation at
// the bottom. It scrolls only when everything does not fit; when there is room to spare, the
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

    // Another day, another saint: the sheet does not stay open
    useEffect(() => setDescriptionOpen(false), [props.day.dateText, props.day.title]);

    return (
        <View testID="home" style={[styles.screen, {backgroundColor: theme.colors.homeBackground}]}>
            <ScrollView contentContainerStyle={styles.scroll} automaticallyAdjustContentInsets={false}>
                <View style={[styles.column, {maxWidth: theme.layout.homeMaxWidth, paddingBottom: 8 + insets.bottom}]}>
                    <DayCard
                        day={props.day}
                        onOptionalMemoryChange={props.onOptionalMemoryChange}
                        onReadMore={() => setDescriptionOpen(true)}/>
                    <HoursGrid hours={props.hours} onOpen={props.onOpenHour}/>
                    <MassBlock mass={props.mass} onOpen={props.onOpenReading} onChoose={props.onMassChoice}/>
                    <View style={styles.spacer}/>
                    <HomeFooter onMessage={props.onMessage} onDonation={props.onDonation}/>
                </View>
            </ScrollView>
            {props.day.description ? (
                <DescriptionSheet day={props.day} visible={descriptionOpen} onClose={() => setDescriptionOpen(false)}/>
            ) : null}
        </View>
    );
}

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
        gap: 12,
    },
    spacer: {
        flexGrow: 1,
    },
});

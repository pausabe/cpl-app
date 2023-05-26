import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ImageBackground,
    TouchableOpacity
} from 'react-native';
import * as Logger from '../../Utils/Logger';
import GlobalKeys from '../../Utils/GlobalKeys';
import {StringManagement} from "../../Utils/StringManagement";
import MassLiturgyMainState from '../../States/MassLiturgyMainState';
import MassLiturgy from '../../Models/MassLiturgy';
import { MassPrayer, VespersSelectorType } from '../../Controllers/MassLiturgy/MassLiturgyMainViewController';
import HR from '../../Components/HRComponent';
import LiturgyDayInformation from '../../Models/LiturgyDayInformation';
import { SpecificLiturgyTimeType } from '../../Services/Data/CelebrationTimeEnums';

export default function MassLiturgyMainView(props: { 
    ViewState: MassLiturgyMainState; 
    MassLiturgy: MassLiturgy; 
    LiturgyDayInformation: LiturgyDayInformation,
    VesperSelectorChanged: any; 
    PrayerSelected: any }) {
    try {
        // TODO: move repeated things (background, safe area...) to a common place for all 3 main views
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: GlobalKeys.screensBackgroundColor}}>
                {
                    <ImageBackground source={require('../../Assets/img/bg/home_background.jpg')}
                                        style={styles.backgroundImage} blurRadius={5}>
                        <View style={{flex: 1,}}>
                            {props.MassLiturgy.HasVespers ?
                                <View style={styles.liturgiaContainerVespers}>
                                    { VespersSelectorView(props.MassLiturgy, props.ViewState.VespersSelectorType, props.VesperSelectorChanged) }
                                </View>
                                :
                                null }
                            <View style={props.ViewState.IsNecessarySecondReading? styles.liturgiaContainer_need_lectura2 : styles.liturgiaContainer}>
                                { ButtonsView(props.LiturgyDayInformation, props.ViewState.IsNecessarySecondReading, props.PrayerSelected) }
                            </View>
                        </View>
                    </ImageBackground>
                }
            </SafeAreaView>
        );
    } catch (error) {
        Logger.LogError(Logger.LogKeys.MassLiturgyMainView, "MassLiturgyMainView", error);
        return null;
    }
}

function VespersSelectorView(massLiturgy: MassLiturgy, currentVesperSelectorType: VespersSelectorType, VesperSelectorChanged: any) {
    if (!massLiturgy.HasVespers) {
        return null;
    }

    return (
        <View style={styles.buttons_containerVespers}>
            <TouchableOpacity
                style={currentVesperSelectorType === VespersSelectorType.Vespers? 
                    styles.buttonContainer : styles.buttonContainerPressedLeft}
                onPress={ OnVesperSelectorPressed.bind(this, VesperSelectorChanged, VespersSelectorType.Normal) }>
                <Text style={styles.buttonText}>{"Avui"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={currentVesperSelectorType === VespersSelectorType.Vespers? 
                    styles.buttonContainerPressedRight : styles.buttonContainer}
                onPress={ OnVesperSelectorPressed.bind(this, VesperSelectorChanged, VespersSelectorType.Vespers) }>
                <Text style={styles.buttonText}>{"Vespertina"}</Text>
                <View style={{padding: 1, paddingHorizontal: 5}}>
                    <View>
                        {StringManagement.HasLiturgyContent(massLiturgy.Vespers.Title) ?
                            <Text numberOfLines={1}
                                    style={styles.redCenter}>{massLiturgy.Vespers.Title}</Text>
                            : null
                        }
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

function OnVesperSelectorPressed(VesperSelectorChanged: any, desiredVesperSelectorType: VespersSelectorType) {
    try {
        VesperSelectorChanged(desiredVesperSelectorType);
    } catch (error) {
        Logger.LogError(Logger.LogKeys.MassLiturgyMainView, "OnVesperSelectorPressed", error);
    }
}

function ButtonsView(liturgyDayInformation: LiturgyDayInformation, needForSecondLecture: Boolean, PrayerSelected: any) {
    return (
        <View style={styles.buttons_container}>
            {liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ?
                <View style={{flex: 1}}>
                    <TouchableOpacity style={styles.buttonContainer}
                                        onPress={ OnPrayerSelected.bind(this, PrayerSelected, MassPrayer.VetllaPasquaLecturesSalms) }>
                        <Text style={styles.buttonText}>{"Lectures i salms"}</Text>
                    </TouchableOpacity>
                    <HR margin_horizontal={20}/>
                    <TouchableOpacity style={styles.buttonContainer}
                                        onPress={ OnPrayerSelected.bind(this, PrayerSelected, MassPrayer.VetllaPasquaEvangeli) }>
                        <Text style={styles.buttonText}>{"Evangeli"}</Text>
                    </TouchableOpacity>
                    <HR margin_horizontal={20}/>
                </View>
                :
                <View style={{flex: 1}}>
                    {liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ?
                        <View style={{flex: 1}}>
                            <TouchableOpacity style={styles.buttonContainer}
                                                onPress={ OnPrayerSelected.bind(this, PrayerSelected, MassPrayer.PalmSunday) }>
                                <Text style={styles.buttonText}>{"Benedicció dels Rams"}</Text>
                            </TouchableOpacity>
                            <HR margin_horizontal={20}/>
                        </View>
                        :
                        null}
                    <TouchableOpacity style={styles.buttonContainer}
                                        onPress={ OnPrayerSelected.bind(this, PrayerSelected, MassPrayer.FirstReading) }>
                        <Text style={styles.buttonText}>{"Primera lectura"}</Text>
                    </TouchableOpacity>
                    <HR margin_horizontal={20}/>
                    <TouchableOpacity style={styles.buttonContainer}
                                        onPress={ OnPrayerSelected.bind(this, MassPrayer.Psalm) }>
                        <Text style={styles.buttonText}>{"Salm"}</Text>
                    </TouchableOpacity>
                    <HR margin_horizontal={20}/>
                    {needForSecondLecture ?
                        <View style={{flex: 1}}>
                            <TouchableOpacity style={styles.buttonContainer}
                                                onPress={ OnPrayerSelected.bind(this, PrayerSelected, MassPrayer.SecondReading) }>
                                <Text style={styles.buttonText}>{"Segona lectura"}</Text>
                            </TouchableOpacity>
                            <HR margin_horizontal={20}/>
                        </View>
                        : null}
                    <TouchableOpacity style={styles.buttonContainer}
                                        onPress={ OnPrayerSelected.bind(this, PrayerSelected, MassPrayer.Gospel) }>
                        <Text style={styles.buttonText}>{"Evangeli"}</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>
    )
}

function OnPrayerSelected(PrayerSelected: any, desiredMassPrayer: MassPrayer) {
    try {
        PrayerSelected(desiredMassPrayer);
    } catch (error) {
        Logger.LogError(Logger.LogKeys.MassLiturgyMainView, "OnVespersPressed", error);
    }
}


const styles = StyleSheet.create({
    liturgiaContainer: {
        flex: 6,
        marginVertical: 100,
        marginHorizontal: 30,
    },
    liturgiaContainerVespers: {
        height: 90,
        marginHorizontal: 30,
        marginTop: 30,
        marginBottom: -30,
    },
    liturgiaContainer_need_lectura2: {
        flex: 6,
        marginVertical: 70,
        marginHorizontal: 30,
    },
    backgroundImage: {
        flex: 1,
        backgroundColor: 'rgb(5, 169, 176)',
        width: null,
        height: null,
    },
    buttons_container: {
        flex: 1,
        opacity: 0.75,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    buttons_containerVespers: {
        flex: 1,
        marginTop: 30,
        opacity: 0.75,
        backgroundColor: 'white',
        borderRadius: 15,
        flexDirection: 'row',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    buttonContainerPressedLeft: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(30,30,30,0.15)',
        borderTopLeftRadius: 15,
        borderBottomLeftRadius: 15,
    },
    buttonContainerPressedRight: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(30,30,30,0.15)',
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
    },
    buttonText: {
        textAlign: 'center',
        color: 'black',
        fontSize: 20,
        fontWeight: 'normal'
    },
    redCenter: {
        color: '#FF0000',
        fontSize: 15,
        textAlign: 'center'
    },
})

import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import * as Logger from '../../Utils/Logger';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter'
import HR from '../../Components/HRComponent';
import GlobalKeys from '../../Utils/GlobalKeys';
import {
    CurrentLiturgyDayInformation,
    CurrentMassLiturgy,
    CurrentHoursLiturgy,
    CurrentSettings
} from "../../Services/DataService";
import {SpecificLiturgyTimeType} from "../../Services/CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";
import {DateManagement} from "../../Utils/DateManagement";
import * as StorageService from "../../Services/Storage/StorageService";
import StorageKeys from "../../Services/Storage/StorageKeys";

const VESPERS_SELECTOR_TYPES = {
    NONE: 'none',
    NORMAL: 'normal',
    VESPERS: 'vespers'
};

export default class MassLiturgyMainScreen extends Component {
    //CONSTRUCTOR --------------------------------------------------------------------------
    constructor(props) {
        super(props);

        this.state = {renderError: false}
    }

    //PREVIEWS --------------------------------------------------------------------------
    UNSAFE_componentWillMount() {
        this.eventEmitter = new EventEmitter();
    }

    componentDidMount() {
        this._unsubscribe = this.props.navigation.addListener('focus', () => this.Refresh_Layout());
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    Refresh_Layout() {
        this.getCurrentVesperSelection().then((currentVesperSelectorType) => {
            this.CURRENT_VESPERS_SELECTOR_TYPE = currentVesperSelectorType;
            try {
                if (this.CURRENT_VESPERS_SELECTOR_TYPE === VESPERS_SELECTOR_TYPES.NONE) {
                    if (CurrentLiturgyDayInformation.Tomorrow.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
                        CurrentMassLiturgy.HasVespers &&
                        CurrentLiturgyDayInformation.Today.Date.getHours() >= GlobalKeys.afternoon_hour) {
                        this.CURRENT_VESPERS_SELECTOR_TYPE = VESPERS_SELECTOR_TYPES.VESPERS;
                        this.StoreVesperSelection(VESPERS_SELECTOR_TYPES.VESPERS);
                    }
                    else{
                        this.CURRENT_VESPERS_SELECTOR_TYPE = VESPERS_SELECTOR_TYPES.NORMAL;
                        this.StoreVesperSelection(VESPERS_SELECTOR_TYPES.NORMAL);
                    }
                }

                let need_lectura2 = false;
                if (this.CURRENT_VESPERS_SELECTOR_TYPE === VESPERS_SELECTOR_TYPES.NORMAL) {
                    need_lectura2 = StringManagement.HasLiturgyContent(CurrentMassLiturgy.Today.SecondReading.Reading);
                } else if (this.CURRENT_VESPERS_SELECTOR_TYPE === VESPERS_SELECTOR_TYPES.VESPERS && CurrentMassLiturgy.Vespers) {
                    need_lectura2 = StringManagement.HasLiturgyContent(CurrentMassLiturgy.Vespers.SecondReading.Reading);
                }

                this.setState({need_lectura2: need_lectura2});

            } catch (error) {
                Logger.LogError(Logger.LogKeys.Screens, "Refresh_Layout", error);
                this.setState({renderError: true})
            }
        });

    }

    getCurrentVesperSelection() {
        return new Promise((resolve) => {
            StorageService.GetData(StorageKeys.CurrentMassVespersSelector).then((currentMassVesperSelector) => {
                if (currentMassVesperSelector &&
                    currentMassVesperSelector.includes("_") &&
                    currentMassVesperSelector.split("_")[0] === DateManagement.GetDateKeyToBeStored(CurrentLiturgyDayInformation.Today.Date) &&
                    currentMassVesperSelector.split("_")[1] !== 'undefined') {
                    resolve(currentMassVesperSelector.split("_")[1]);
                }
                else{
                    resolve(VESPERS_SELECTOR_TYPES.NONE);
                }
            });
        });
    }

    //CALLBACKS ----------------------------------------------------------------------------
    On_Button_Pressed(prayer_type, need_lectura2) {
        const title = "Missa";

        const params = {
            title: title,
            props: {
                type: prayer_type,
                events: this.eventEmitter,
                need_lectura2: need_lectura2,
                useVespersTexts: this.CURRENT_VESPERS_SELECTOR_TYPE === VESPERS_SELECTOR_TYPES.VESPERS
            },
        };
        this.props.navigation.navigate('LDDisplay', params);
    }

    //RENDER -------------------------------------------------------------------------------
    render() {
        try {

            if (this.state == null) {
                this.Refresh_Layout()
                return false
            }

            if (this.state.renderError) {
                return (
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Text style={{textAlign: 'center', color: 'black', fontSize: 20, fontWeight: 'normal'}}>
                            {"Ha sorgit un error inesperat."}
                        </Text>
                    </View>
                )
            }

            return (
                <SafeAreaView style={{flex: 1, backgroundColor: GlobalKeys.screensBackgroundColor}}>
                    {
                        <ImageBackground source={require('../../Assets/img/bg/home_background.jpg')}
                                         style={styles.backgroundImage} blurRadius={5}>
                            <View style={{flex: 1,}}>
                                {CurrentMassLiturgy.HasVespers ?
                                    <View style={styles.liturgiaContainerVespers}>
                                        {this.VespersSelector()}
                                    </View>
                                    :
                                    null}
                                <View
                                    style={this.state.need_lectura2 ? styles.liturgiaContainer_need_lectura2 : styles.liturgiaContainer}>
                                    {this.Buttons(this.state.need_lectura2)}
                                </View>
                            </View>
                        </ImageBackground>
                    }
                </SafeAreaView>
            );

        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "render", error);
            return null
        }
    }

    VespersSelector() {
        try {
            if (CurrentMassLiturgy.HasVespers) {
                return (
                    <View style={styles.buttons_containerVespers}>
                        <TouchableOpacity
                            style={this.CURRENT_VESPERS_SELECTOR_TYPE === VESPERS_SELECTOR_TYPES.VESPERS ? styles.buttonContainer : styles.buttonContainerPressedLeft}
                            onPress={this.OnNormalPressed.bind(this)}>
                            <Text style={styles.buttonText}>{"Avui"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={this.CURRENT_VESPERS_SELECTOR_TYPE === VESPERS_SELECTOR_TYPES.VESPERS ? styles.buttonContainerPressedRight : styles.buttonContainer}
                            onPress={this.OnVespersPressed.bind(this)}>
                            <Text style={styles.buttonText}>{"Vespertina"}</Text>
                            <View style={{padding: 1, paddingHorizontal: 5}}>
                                {StringManagement.HasLiturgyContent(CurrentHoursLiturgy.Vespers.Title) ?
                                    <View>
                                        {CurrentLiturgyDayInformation.Tomorrow.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday ?
                                            <Text numberOfLines={1}
                                                  style={styles.redCenter}>{CurrentHoursLiturgy.Vespers.Title}</Text>
                                            : null
                                        }
                                    </View>
                                    :
                                    <View>
                                        {CurrentLiturgyDayInformation.Today.Date.getDay() === 6 ?
                                            <Text numberOfLines={1}
                                                  style={styles.redCenter}>{"Missa de Diumenge"}</Text>
                                            : null
                                        }
                                    </View>
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                );
            } else {
                return null;
            }
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "VespersSelector", error);
            return null;
        }
    }

    OnNormalPressed() {
        try {
            this.CURRENT_VESPERS_SELECTOR_TYPE = VESPERS_SELECTOR_TYPES.NORMAL;
            this.StoreVesperSelection(VESPERS_SELECTOR_TYPES.NORMAL);
            this.setState({need_lectura2: StringManagement.HasLiturgyContent(CurrentMassLiturgy.Today.SecondReading.Reading)})
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "OnNormalPressed", error);
        }
    }

    OnVespersPressed() {
        try {
            this.CURRENT_VESPERS_SELECTOR_TYPE = VESPERS_SELECTOR_TYPES.VESPERS;
            this.StoreVesperSelection(VESPERS_SELECTOR_TYPES.VESPERS);
            this.setState({need_lectura2: StringManagement.HasLiturgyContent(CurrentMassLiturgy.Vespers.SecondReading.Reading)})
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "OnVespersPressed", error);
        }
    }

    StoreVesperSelection(vesperSelectorType) {
        const stringDate = DateManagement.GetDateKeyToBeStored(CurrentLiturgyDayInformation.Today.Date);
        StorageService.StoreData(StorageKeys.CurrentMassVespersSelector, stringDate + '_' + vesperSelectorType);
    }

    Buttons(need_lectura2) {
        try {
            return (
                <View style={styles.buttons_container}>
                    {CurrentLiturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ?
                        <View style={{flex: 1}}>
                            <TouchableOpacity style={styles.buttonContainer}
                                              onPress={this.On_Button_Pressed.bind(this, "VetllaPasquaLecturesSalms", need_lectura2)}>
                                <Text style={styles.buttonText}>{"Lectures i salms"}</Text>
                            </TouchableOpacity>
                            <HR margin_horizontal={20}/>
                            <TouchableOpacity style={styles.buttonContainer}
                                              onPress={this.On_Button_Pressed.bind(this, "VetllaPasquaEvangeli", need_lectura2)}>
                                <Text style={styles.buttonText}>{"Evangeli"}</Text>
                            </TouchableOpacity>
                            <HR margin_horizontal={20}/>
                        </View>
                        :
                        <View style={{flex: 1}}>
                            {CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ?
                                <View style={{flex: 1}}>
                                    <TouchableOpacity style={styles.buttonContainer}
                                                      onPress={this.On_Button_Pressed.bind(this, "Rams", need_lectura2)}>
                                        <Text style={styles.buttonText}>{"Benedicció dels Rams"}</Text>
                                    </TouchableOpacity>
                                    <HR margin_horizontal={20}/>
                                </View>
                                :
                                null}
                            <TouchableOpacity style={styles.buttonContainer}
                                              onPress={this.On_Button_Pressed.bind(this, "1Lect", need_lectura2)}>
                                <Text style={styles.buttonText}>{"Primera lectura"}</Text>
                            </TouchableOpacity>
                            <HR margin_horizontal={20}/>
                            <TouchableOpacity style={styles.buttonContainer}
                                              onPress={this.On_Button_Pressed.bind(this, "Salm", need_lectura2)}>
                                <Text style={styles.buttonText}>{"Salm"}</Text>
                            </TouchableOpacity>
                            <HR margin_horizontal={20}/>
                            {need_lectura2 ?
                                <View style={{flex: 1}}>
                                    <TouchableOpacity style={styles.buttonContainer}
                                                      onPress={this.On_Button_Pressed.bind(this, "2Lect", need_lectura2)}>
                                        <Text style={styles.buttonText}>{"Segona lectura"}</Text>
                                    </TouchableOpacity>
                                    <HR margin_horizontal={20}/>
                                </View>
                                : null}
                            <TouchableOpacity style={styles.buttonContainer}
                                              onPress={this.On_Button_Pressed.bind(this, "Evangeli", need_lectura2)}>
                                <Text style={styles.buttonText}>{"Evangeli"}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
            )
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "Buttons", error);
            return null;
        }
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

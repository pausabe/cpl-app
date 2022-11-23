import React, {Component} from 'react';
import {
    AppRegistry,
    Text,
    View,
    Platform,
    TouchableOpacity
} from 'react-native';
import HR from '../../../Components/HRComponent';
import GlobalKeys from '../../../Utils/GlobalKeys';
import GlobalFunctions from '../../../Utils/GlobalFunctions';
import SettingsService from '../../../Services/SettingsService';
import * as Logger from '../../../Utils/Logger';
import {CurrentHoursLiturgy, CurrentLiturgyDayInformation, CurrentSettings} from "../../../Services/DataService";
import {GenericLiturgyTimeType, SpecificLiturgyTimeType} from "../../../Services/CelebrationTimeEnums";

export default class NightPrayerComponent extends Component {
    constructor(props) {
        super(props);
        
        this.styles = {
            black: GlobalFunctions.getStyle("GENERIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackBold: GlobalFunctions.getStyle("GENERIC_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackItalic: GlobalFunctions.getStyle("GENERIC_ITALIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackSmallItalicRight: GlobalFunctions.getStyle("GENERIC_SMALL_ITALIC_RIGHT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            blackJustified: GlobalFunctions.getStyle("GENERIC_JUSTIFIED", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            red: GlobalFunctions.getStyle("ACCENT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redItalic: GlobalFunctions.getStyle("ACCENT_ITALIC", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redCenter: GlobalFunctions.getStyle("ACCENT_CENTER", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redCenterBold: GlobalFunctions.getStyle("ACCENT_CENTER_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            redSmallItalicRight: GlobalFunctions.getStyle("ACCENT_SMALL_ITALIC_RIGHT", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            hiddenPrayerButton: GlobalFunctions.getStyle("HIDDEN_PRAYER_BUTTON", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            prayerTabButton: GlobalFunctions.getStyle("PRAYER_TAB_BUTTON", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
            prayerTabButtonBold: GlobalFunctions.getStyle("PRAYER_TAB_BUTTON_BOLD", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
        };

        let auxNumAntMare = CurrentSettings.VirginAntiphonOption;

        if (CurrentLiturgyDayInformation.Today.GenericLiturgyTime === GenericLiturgyTimeType.Easter && auxNumAntMare !== '5') {
            auxNumAntMare = '5';
            props.setNumAntMare('5');
            SettingsService.setSettingNumAntMare('5');
        } else if (!(CurrentLiturgyDayInformation.Today.GenericLiturgyTime === GenericLiturgyTimeType.Easter) && auxNumAntMare === '5') {
            auxNumAntMare = '1';
            props.setNumAntMare('1');
            SettingsService.setSettingNumAntMare('1');
        }

        this.state = {
            numAntMare: auxNumAntMare
        }

        this.COMPLETES = CurrentHoursLiturgy.NightPrayer;
        this.setNumAntMare = props.setNumAntMare;
    }

    onAntMarePress(numAntMare) {
        this.setState({numAntMare: numAntMare});
        this.setNumAntMare(numAntMare);
        SettingsService.setSettingNumAntMare(numAntMare);
    }

    antMareComp(numAntMare) {
        let ant1Style = this.styles.prayerTabButton;
        let ant2Style = this.styles.prayerTabButton;
        let ant3Style = this.styles.prayerTabButton;
        let ant4Style = this.styles.prayerTabButton;
        let ant5Style = this.styles.prayerTabButton;

        let antMare;

        switch (numAntMare) {
            case '1':
                antMare = GlobalFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonFirstOption);
                ant1Style = this.styles.prayerTabButtonBold;
                break;
            case '2':
                antMare = GlobalFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonSecondOption);
                ant2Style = this.styles.prayerTabButtonBold;
                break;
            case '3':
                antMare = GlobalFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonThirdOption);
                ant3Style = this.styles.prayerTabButtonBold;
                break;
            case '4':
                antMare = GlobalFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonFourthOption);
                ant4Style = this.styles.prayerTabButtonBold;
                break;
            case '5':
                antMare = GlobalFunctions.rs(this.COMPLETES.VirginMaryFinalAntiphonFifthOption);
                ant5Style = this.styles.prayerTabButtonBold;
                break;
        }

        return (
            <View>
                <View style={{alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', paddingVertical: 10}}>
                        {!(CurrentLiturgyDayInformation.Today.GenericLiturgyTime === GenericLiturgyTimeType.Easter) ?
                            <TouchableOpacity onPress={this.onAntMarePress.bind(this, '1')}>
                                <Text style={ant1Style}>{"Ant. 1  "}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {!(CurrentLiturgyDayInformation.Today.GenericLiturgyTime === GenericLiturgyTimeType.Easter) ?
                            <TouchableOpacity onPress={this.onAntMarePress.bind(this, '2')}>
                                <Text style={ant2Style}>{"  Ant. 2  "}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {!(CurrentLiturgyDayInformation.Today.GenericLiturgyTime === GenericLiturgyTimeType.Easter) ?
                            <TouchableOpacity onPress={this.onAntMarePress.bind(this, '3')}>
                                <Text style={ant3Style}>{"  Ant. 3  "}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {!(CurrentLiturgyDayInformation.Today.GenericLiturgyTime === GenericLiturgyTimeType.Easter) ?
                            <TouchableOpacity onPress={this.onAntMarePress.bind(this, '4')}>
                                <Text style={ant4Style}>{"  Ant. 4"}</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                    </View>
                </View>

                <Text selectable={true} style={this.styles.black}>{antMare}</Text>
            </View>
        );
    }

    render() {
        try {
            if (this.COMPLETES !== null) {
                const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";
                const is_special_initial_message =
                    CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentTriduum &&
                    CurrentLiturgyDayInformation.Today.Date.getDay() === 6;
                const aux_special_initial_message = "Avui, només han de dir aquestes Completes els qui no participen en la Vetlla pasqual.";
                const aux_sigueu = "Sigueu amb nosaltres, Déu nostre.";
                const aux_veniu = "Senyor, veniu a ajudar-nos.";
                const is_aleluia = CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes &&
                    CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentWeeks &&
                    CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PalmSunday &&
                    CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.HolyWeek &&
                    CurrentLiturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentTriduum;
                const aux_lloable = "És lloable que aquí es faci examen de consciència.";
                const aux_acte_pen = this.COMPLETES.PenitentialAct;
                const aux_himne = GlobalFunctions.rs(this.COMPLETES.Anthem);
                const is_dos_salms = this.COMPLETES.HasMultiplePsalms;
                const has_distint_ant = !this.COMPLETES.UseOnlyFirstPsalmAntiphon;
                const aux_ant1 = GlobalFunctions.rs(this.COMPLETES.FirstPsalm.Antiphon);
                const aux_titol1 = GlobalFunctions.rs(this.COMPLETES.FirstPsalm.Title);
                const has_com1 = this.COMPLETES.FirstPsalm.Comment !== '-';
                const aux_com1 = has_com1 ? GlobalFunctions.rs(this.COMPLETES.FirstPsalm.Comment) : "";
                const aux_salm1 = this.salm(GlobalFunctions.rs(this.COMPLETES.FirstPsalm.Psalm));
                let aux_ant2;
                let aux_titol2;
                let has_com2;
                let aux_com2;
                let aux_salm2;
                if (is_dos_salms) {
                    aux_ant2 = has_distint_ant ? GlobalFunctions.rs(this.COMPLETES.SecondPsalm.Antiphon) : "";
                    aux_titol2 = GlobalFunctions.rs(this.COMPLETES.SecondPsalm.Title);
                    has_com2 = this.COMPLETES.SecondPsalm.Comment !== '-';
                    aux_com2 = has_com2 ? GlobalFunctions.rs(this.COMPLETES.SecondPsalm.Comment) : "";
                    aux_salm2 = this.salm(GlobalFunctions.rs(this.COMPLETES.SecondPsalm.Psalm));
                }
                const aux_vers = GlobalFunctions.rs(this.COMPLETES.ShortReading.Quote);
                const aux_lectura_breu = GlobalFunctions.rs(this.COMPLETES.ShortReading.ShortReading);
                let aux_ant_special;
                let aux_resp_1_2;
                let aux_resp_2;
                let aux_resp_3;
                const is_normal_resp = !this.COMPLETES.ShortResponsory.HasSpecialAntiphon;
                if (is_normal_resp) {
                    aux_resp_1_2 = GlobalFunctions.respTogether(GlobalFunctions.rs(this.COMPLETES.ShortResponsory.FirstPart), GlobalFunctions.rs(this.COMPLETES.ShortResponsory.SecondPart));
                    aux_resp_2 = GlobalFunctions.rs(this.COMPLETES.ShortResponsory.SecondPart);
                    aux_resp_3 = GlobalFunctions.rs(this.COMPLETES.ShortResponsory.ThirdPart);
                } else {
                    aux_ant_special = GlobalFunctions.rs(this.COMPLETES.ShortResponsory.SpecialAntiphon);
                }
                const aux_gloria_half = " Glòria al Pare i al Fill i a l'Esperit Sant.";
                const aux_ant_cantic = GlobalFunctions.rs(this.COMPLETES.EvangelicalAntiphon);
                const aux_titol_cantic = "Càntic\nLc 2, 29-32\nCrist, llum de les nacions i glòria d'Israel";
                const aux_cantic = this.salm(GlobalFunctions.rs(this.COMPLETES.EvangelicalChant));
                const aux_gloria_cantic = "Glòria.";
                const aux_oracio = GlobalFunctions.rs(this.COMPLETES.FinalPrayer);
                const aux_fi_benaurada = "Que el Senyor totpoderós ens concedeixi una nit tranquil·la i una fi benaurada.";
                const aux_antifona_final = "Antífona final de la Mare de Déu";

                return (
                    <View>
                        {is_special_initial_message ?
                            <View>
                                <Text selectable={true}
                                      style={this.styles.redCenter}>{aux_special_initial_message}</Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                <HR/>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                            </View>
                            :
                            null
                        }
                        <Text selectable={true} style={this.styles.red}>{"V. "}
                            <Text selectable={true} style={this.styles.black}>{aux_sigueu}</Text>
                        </Text>
                        <Text selectable={true} style={this.styles.red}>{"R. "}
                            <Text selectable={true} style={this.styles.black}>{aux_veniu}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.black}>{gloriaStringIntro}
                            {is_aleluia ?
                                <Text selectable={true} style={this.styles.black}>{" Al·leluia."}</Text> : null
                            }
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.redCenter}>{aux_lloable}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.black}>{aux_acte_pen}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"HIMNE"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.black}>{aux_himne}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"SALMÒDIA"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {is_dos_salms ?
                            <View>
                                {has_distint_ant ?
                                    <Text selectable={true} style={this.styles.red}>{"Ant. 1. "}
                                        <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                                    </Text>
                                    :
                                    <Text selectable={true} style={this.styles.red}>{"Ant. "}
                                        <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                                    </Text>
                                }
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {has_com1 ?
                                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View
                                        style={{flex: 2}}>
                                        <Text selectable={true}
                                              style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
                                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                    </View></View> : null}
                                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {this.COMPLETES.FirstPsalm.HasGloryPrayer ?
                                    <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                                    :
                                    <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {has_distint_ant ?
                                    <View>
                                        <Text selectable={true} style={this.styles.red}>{"Ant. 1. "}
                                            <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                                        </Text>
                                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                        <Text selectable={true} style={this.styles.red}>{"Ant. 2. "}
                                            <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
                                        </Text>
                                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                    </View>
                                    : null
                                }
                                <Text selectable={true} style={this.styles.redCenter}>{aux_titol2}</Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {has_com2 !== '-' ?
                                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View
                                        style={{flex: 2}}>
                                        <Text selectable={true}
                                              style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
                                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                    </View></View> : null}
                                <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {this.COMPLETES.SecondPsalm.HasGloryPrayer ?
                                    <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                                    :
                                    <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {has_distint_ant ?
                                    <View>
                                        <Text selectable={true} style={this.styles.red}>{"Ant. 2. "}
                                            <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
                                        </Text>
                                    </View>
                                    :
                                    <View>
                                        <Text selectable={true} style={this.styles.red}>{"Ant. "}
                                            <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                                        </Text>
                                    </View>
                                }
                            </View>
                            :
                            <View>
                                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                                </Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {has_com1 ?
                                    <View style={{flexDirection: 'row'}}><View style={{flex: 1}}/><View
                                        style={{flex: 2}}>
                                        <Text selectable={true}
                                              style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
                                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                    </View></View> : null}
                                <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                {this.COMPLETES.FirstPsalm.HasGloryPrayer ?
                                    <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                                    :
                                    <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
                                </Text>
                            </View>
                        }
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"LECTURA BREU"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{aux_vers}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.black}>{aux_lectura_breu}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"RESPONSORI BREU"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {is_normal_resp ?
                            <View>
                                <Text selectable={true} style={this.styles.red}>{"V. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                                </Text>
                                <Text selectable={true} style={this.styles.red}>{"R. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                                </Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                <Text selectable={true} style={this.styles.red}>{"V. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_resp_3}</Text>
                                </Text>
                                <Text selectable={true} style={this.styles.red}>{"R. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_resp_2}</Text>
                                </Text>
                                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                                <Text selectable={true} style={this.styles.red}>{"V. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_gloria_half}</Text>
                                </Text>
                                <Text selectable={true} style={this.styles.red}>{"R. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
                                </Text>
                            </View>
                            :
                            <View>
                                <Text selectable={true} style={this.styles.red}>{"Ant. "}
                                    <Text selectable={true} style={this.styles.black}>{aux_ant_special}</Text>
                                </Text>
                            </View>
                        }
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"CÀNTIC DE SIMEÓ"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"Ant. "}
                            <Text selectable={true} style={this.styles.black}>{aux_ant_cantic}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.redCenter}>{aux_titol_cantic}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.black}>{aux_cantic}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria_cantic}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"Ant. "}
                            <Text selectable={true} style={this.styles.black}>{aux_ant_cantic}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"ORACIÓ"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.blackBold}>{"Preguem."}</Text>
                        <Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>
                        <Text selectable={true} style={this.styles.red}>{"R. "}
                            <Text selectable={true} style={this.styles.black}>{"Amén."}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"CONCLUSIÓ"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.red}>{"V. "}
                            <Text selectable={true} style={this.styles.black}>{aux_fi_benaurada}</Text>
                        </Text>
                        <Text selectable={true} style={this.styles.red}>{"R. "}
                            <Text selectable={true} style={this.styles.black}>{"Amén."}</Text>
                        </Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <HR/>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        <Text selectable={true} style={this.styles.redCenter}>{aux_antifona_final}</Text>
                        {this.antMareComp(this.state.numAntMare)}
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text/>}
                        {Platform.OS === 'android' ? null : <Text/>}
                    </View>
                );
            } else {
                Logger.LogError(Logger.LogKeys.Screens, "render", new Error("wierd error......."));
                return null;
            }
        } catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "render", error);
            return null;
        }
    }

    salm(salm) {
        if (!salm) return null;
        salm = salm.replace(/    [*]/g, '');
        salm = salm.replace(/   [*]/g, '');
        salm = salm.replace(/  [*]/g, '');
        salm = salm.replace(/ [*]/g, '');
        salm = salm.replace(/    [†]/g, '');
        salm = salm.replace(/   [†]/g, '');
        salm = salm.replace(/  [†]/g, '');
        salm = salm.replace(/ [†]/g, '');
        return salm;
    }

}

AppRegistry.registerComponent('NightPrayerComponent', () => NightPrayerComponent);

import React, {Component} from 'react';
import { View, ScrollView, Text, Platform, TouchableOpacity } from 'react-native';
import GlobalFunctions from '../../Utils/GlobalFunctions';
import HR from '../../Components/HRComponent';
import * as Logger from '../../Utils/Logger';
import {
    CurrentLiturgyDayInformation,
    CurrentMassLiturgy,
    CurrentSettings
} from "../../Services/DataService";
import {YearType} from "../../Services/DatabaseEnums";
import {GenericLiturgyTimeType, SpecificLiturgyTimeType} from "../../Services/CelebrationTimeEnums";

export default class MassLiturgyPrayerScreen extends Component {
    //PREVIEWS --------------------------------------------------------------------------
    UNSAFE_componentWillMount() {
        this.screen_props = this.props.route.params.props;
        this.eventEmitter = this.screen_props.events;

        this.setState({
            Need_Lect2: this.screen_props.need_lectura2,
            VetllaPasquaLecturesSalms: this.screen_props.type === 'VetllaPasquaLecturesSalms',
            VetllaPasquaEvangeli: this.screen_props.type === 'VetllaPasquaEvangeli',
            Rams: this.screen_props.type === 'Rams',
            Lect1: this.screen_props.type === '1Lect',
            Salm: this.screen_props.type === 'Salm',
            Lect2: this.screen_props.type === '2Lect',
            Evangeli: this.screen_props.type === 'Evangeli',
            DisplayVespers: this.screen_props.useVespersTexts,
            evangeliType: 'normal'
        })
    }

    //CONSTRUCTOR --------------------------------------------------------------------------
    constructor(props) {
        super(props);

        this.styles = {
            container: GlobalFunctions.getStyle("CONTAINER", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled),
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
    }

    //RENDER -------------------------------------------------------------------------------
    render() {
        try {
            return (
                <View style={GlobalFunctions.getStyle("CONTAINER", Platform.OS, CurrentSettings.TextSize, CurrentSettings.DarkModeEnabled)}>
                    <ScrollView automaticallyAdjustContentInsets={false} >
                        <View style={{ flex: 1, paddingHorizontal: 10, paddingTop: 10 }}>
                            {this.state.VetllaPasquaLecturesSalms ?
                                <View>
                                    <Text selectable={true} style={this.styles.redCenter}>{"Lectures de la Vetlla Pasqual"}</Text>
                                    {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                                    {this.Render_VetllaPasquaLecturesSalms()}
                                </View>
                                : null}
                            {this.state.VetllaPasquaEvangeli ?
                                this.Render_VetllaPasquaEvangeli()
                                : null}
                            {this.state.Rams ?
                                this.Render_Rams()
                                : null}
                            {this.state.Lect1 ?
                                this.Render_1Lect()
                                : null}
                            {this.state.Salm ?
                                this.Render_Salm(this.state.Need_Lect2)
                                : null}
                            {this.state.Lect2 ?
                                this.Render_2Lect()
                                : null}
                            {this.state.Evangeli ?
                                this.Render_Evangeli()
                                : null}
                            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                            {Platform.OS === 'android' ? null : <Text />}
                        </View>
                    </ScrollView>
                </View>
            )
        }
        catch (error) {
            Logger.LogError(Logger.LogKeys.Screens, "render", error);
            return null;
        }
    }

    Render_VetllaPasquaLecturesSalms() {
        return (
            <View style={{ flex: 1 }}>
                <Text selectable={true} style={this.styles.red}>{"Lectura primera "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.Psalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.Psalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Lectura segona "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondPsalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondPsalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Lectura tercera "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.ThirdReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.ThirdReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.ThirdReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.ThirdReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.ThirdPsalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.ThirdPsalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Lectura quarta "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.FourthReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FourthReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FourthReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FourthReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.FourthPsalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FourthPsalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Lectura cinquena "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.FifthReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FifthReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FifthReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FifthReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.FifthPsalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.FifthPsalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Lectura sisena "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.SixthReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SixthReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SixthReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SixthReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.SixthPsalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SixthPsalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Lectura setena "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.SeventhReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SeventhReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SeventhReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SeventhReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.SeventhPsalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.SeventhPsalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}

                <Text selectable={true} style={this.styles.red}>{"Glòria"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {this.GloriaText()}
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}

                <Text selectable={true} style={this.styles.red}>{"Lectura de l'apòstol "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.ApostleReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.ApostleReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.ApostleReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.ApostleReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}

                {this.state.VetllaPasquaEvangeli ?
                    <View>
                        <HR />
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                    :
                    <TouchableOpacity onPress={() => this.setState({ VetllaPasquaEvangeli: true })}>
                        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <Text style={this.styles.hiddenPrayerButton}>{"Continua amb l'Evangeli"}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    Render_VetllaPasquaEvangeli() {
        return (
            <View style={{ flex: 1 }}>
                <Text selectable={true} style={this.styles.red}>{"Evangeli"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{"Al·leluia. "}{GlobalFunctions.trim(CurrentMassLiturgy.Today.Hallelujah.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.Hallelujah.Hallelujah)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Gospel)}</Text>
            </View>
        )
    }

    Render_Rams() {
        var evangeliRams = "";
        var evangeliCitaRams = "";
        var evangeliTitolRams = "";
        var evangeliTextRams = "";

        switch (CurrentLiturgyDayInformation.Today.YearType) {
            case YearType.A:
                evangeliRams = "Mt 21,1-11";
                evangeliCitaRams = "Beneït el qui ve en nom del Senyor";
                evangeliTitolRams = "Lectura de l’evangeli segons sant Mateu";
                evangeliTextRams = "Quan eren prop de Jerusalem, arribaren a Betfagé, a la muntanya de les Oliveres. Allà Jesús envià dos deixebles amb aquest encàrrec: «Aneu al poble d’aquí al davant, i trobareu tot seguit una somera fermada, amb el seu pollí. Deslligueu-la i porteu-me’ls. Si algú us deia res, responeu-li que el Senyor els ha de menester, però els tornarà de seguida».\nTot això va succeir perquè es complís el que el Senyor havia anunciat pel profeta: «Digueu a la ciutat de Sió: Mira, el teu rei fa humilment la seva entrada, muntat en una somera, en un pollí, fill d’un animal de càrrega».\nEls deixebles hi anaren, feren el que Jesús els havia manat, portaren la somera i el pollí, els guarniren amb els seus mantells, i ell hi pujà. Molta gent entapissava el camí amb els seus mantells, altres tallaven branques dels arbres per encatifar el camí i la gent que anava al davant i que el seguia cridava: «Hosanna al Fill de David. Beneït el qui ve en nom del Senyor. Hosanna a dalt del cel».\nQuan hagué entrat a Jerusalem, s’agità tota la ciutat. Molts preguntaven: «Qui és aquest?». La gent que anava amb ell responia: «És el profeta Jesús, de Natzaret de Galilea».";
                break;
            case YearType.B:
                evangeliRams = "Mc 11,1-10";
                evangeliCitaRams = "Beneït el qui ve en nom del Senyor";
                evangeliTitolRams = "Lectura de l’evangeli segons sant Marc";
                evangeliTextRams = "Quan s’acostaven a Jerusalem, vora Betfagé i Betània, cap a la muntanya de les Oliveres, Jesús envià dos dels seus deixebles amb aquest encàrrec: «Aneu al poble d’aquí al davant, i així que hi entrareu trobareu un pollí fermat, que ningú no ha muntat encara. Deslligueu-lo i porteu-lo. Si algú us preguntava: Per què ho feu?, digueu-li: el Senyor l’ha de menester, i de seguida el tornarà aquí.»\nElls se n’anaren i trobaren un pollí fermat, fora, al portal d’una casa, i el deslligaren. Alguns dels qui eren allà els deien: «Què feu, que deslligueu el pollí?» Ells respongueren tal com els havia dit Jesús, i els deixaren fer. Porten a Jesús el pollí, el guarneixen amb els seus mantells i ell hi puja.\nMolts estenien els mantells pel camí, i d’altres, ramatge que collien dels camps, i els qui el precedien o el seguien cridaven: «Hosanna. Beneït el qui ve en nom del Senyor. Beneït el Regne del nostre pare David, que està a punt d’arribar. Hosanna a dalt del cel.»";
                break;
            case YearType.C:
                evangeliRams = "Lc 19,28-40";
                evangeliCitaRams = "Beneït el qui ve en nom del Senyor";
                evangeliTitolRams = "Lectura de l’evangeli segons sant Lluc";
                evangeliTextRams = "En aquell temps, Jesús anava al davant pujant a Jerusalem. Quan era a prop de Betfagué i de Betània, a la muntanya de les Oliveres, envià dos dels seus deixebles amb aquest encàrrec: «Aneu al poble d’aquí al davant i, entrant, hi trobareu un pollí fermat, que ningú no ha muntat mai. Deslligueu-lo i porteu-lo. Si algú us preguntava per què el deslligueu, respondreu que el Senyor l’ha de menester». Els dos que Jesús enviava se n’anaren i ho trobaren tot tal com Jesús els ho havia dit. Mentre deslligaven el pollí, els amos els digueren: «Per què el deslligueu?». Ells respongueren: «El Senyor l’ha de menester». Portaren el pollí a Jesús, el guarniren tirant-li els mantells a sobre i hi feren pujar Jesús.\nA mesura que Jesús avançava estenien els mantells pel camí. Quan s’acostava a la baixada de la muntanya de les Oliveres, tota la multitud dels seus addictes, plena d’alegria, començà de lloar Déu a grans crits per tots els prodigis que havien vist, i deien: «Beneït sigui el rei, el qui ve en nom del Senyor. Pau al cel, i glòria allà dalt».\nAlguns fariseus que anaven amb la multitud li digueren: «Mestre, renya els teus seguidors». Ell respongué: «Us asseguro que si aquests callessin, cridarien les pedres».";
                break;
        }

        return (
            <View style={{ flex: 1 }}>
                <Text selectable={true} style={this.styles.red}>{"Evangeli"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{evangeliRams}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{evangeliCitaRams}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{evangeliTitolRams}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{evangeliTextRams}</Text>
                {this.state.Lect1 ?
                    <View>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                        <HR />
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                    :
                    <TouchableOpacity onPress={() => this.setState({ Lect1: true })}>
                        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <Text style={this.styles.hiddenPrayerButton}>{"Continua amb la primera lectura"}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    Render_1Lect() {
        const displayGloria = (this.state.DisplayVespers &&
        CurrentMassLiturgy.Vespers.HasGlory ||
            (!this.state.DisplayVespers && CurrentMassLiturgy.Today.HasGlory));

        return (
            <View style={{ flex: 1 }}>
                {displayGloria ?
                    <View>
                        <Text selectable={true} style={this.styles.red}>{"Glòria"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                        {this.GloriaText()}
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                        <HR />
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                    :
                    null
                }
                <Text selectable={true} style={this.styles.red}>{"Lectura primera"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.FirstReading.Quote) : GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.FirstReading.Comment) : GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.FirstReading.Title) : GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.FirstReading.Reading) : GlobalFunctions.trim(CurrentMassLiturgy.Today.FirstReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {this.state.Salm ?
                    <View>
                        <HR />
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                    :
                    <TouchableOpacity onPress={() => this.setState({ Salm: true })}>
                        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <Text style={this.styles.hiddenPrayerButton}>{"Continua amb el Salm"}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    GloriaText() {
        return <Text selectable={true} style={this.styles.blackJustified}>{"Glòria a Déu a dalt del cel,\ni a la terra pau a als homes que estima el Senyor.\nUs lloem,\nus beneïm,\nus adorem, \nus glorifiquem,\nus donem gràcies,\nper la vostra immensa glòria,\nSenyor Déu, Rei celestial,\nDéu Pare omnipotent.\nSenyor, Fill Unigènit, Jesucrist,\nSenyor Déu, Anyell de Déu, Fill del Pare,\nvós, que lleveu el pecat del món,\ntingueu pietat de nosaltres;\nvós, que lleveu el pecat del món,\nacolliu la nostra súplica;\nvós, que seieu a la dreta del Pare,\ntingueu pietat de nosaltres.\nPerquè vós sou l’únic Sant,\nvós l’únic Senyor,\nvós l’únic Altíssim,\nJesucrist,\namb l’Esperit Sant,\nen la glòria de Déu Pare. Amén."}</Text>;
    }

    Render_Salm(need_lect2) {
        return (
            <View style={{ flex: 1 }}>
                <Text selectable={true} style={this.styles.red}>{"Salm responsorial"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.Psalm.Quote) : GlobalFunctions.trim(CurrentMassLiturgy.Today.Psalm.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.Psalm.Psalm) : GlobalFunctions.trim(CurrentMassLiturgy.Today.Psalm.Psalm)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {(need_lect2 && this.state.Lect2) || (!need_lect2 && this.state.Evangeli) ?
                    <View>
                        <HR />
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                    :
                    <TouchableOpacity onPress={() => { this.Set_Continue_State(need_lect2) }}>
                        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <Text style={this.styles.hiddenPrayerButton}>{"Continua amb " + (need_lect2 ? "la segona lectura" : "l'Evangeli")}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    Set_Continue_State(need_lect2) {
        if (need_lect2)
            this.setState({ Lect2: true });
        else
            this.setState({ Evangeli: true });
    }

    Render_2Lect() {
        return (
            <View style={{ flex: 1 }}>
                <Text selectable={true} style={this.styles.red}>{"Lectura segona"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.red}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.SecondReading.Quote) : GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.SecondReading.Comment) : GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Comment)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.SecondReading.Title) : GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.SecondReading.Reading) : GlobalFunctions.trim(CurrentMassLiturgy.Today.SecondReading.Reading)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {this.state.Evangeli ?
                    <View>
                        <HR />
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                    :
                    <TouchableOpacity onPress={() => this.setState({ Evangeli: true })}>
                        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <Text style={this.styles.hiddenPrayerButton}>{"Continua amb l'Evangeli"}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }

    Render_Evangeli() {
        var displayCredo = (this.state.DisplayVespers &&
            CurrentMassLiturgy.Vespers.HasCreed ||
            (!this.state.DisplayVespers && CurrentMassLiturgy.Today.HasCreed));
        var aleluia_quote = (this.state.DisplayVespers ? CurrentMassLiturgy.Vespers.Hallelujah.Quote !== '-'? CurrentMassLiturgy.Vespers.Hallelujah.Quote : "" : CurrentMassLiturgy.Today.Hallelujah.Quote !== '-'? CurrentMassLiturgy.Today.Hallelujah.Quote : "")
        return (
            <View>
                <Text selectable={true} style={this.styles.red}>{"Evangeli"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {(CurrentLiturgyDayInformation.Today.GenericLiturgyTime !== GenericLiturgyTimeType.Lent && CurrentLiturgyDayInformation.Today.GenericLiturgyTime !== GenericLiturgyTimeType.PaschalTriduum) ?
                    <Text selectable={true} style={this.styles.red}>{"Al·leluia. "}{aleluia_quote}</Text>
                    :
                    <Text selectable={true} style={this.styles.red}>{"Vers abans de l'evangeli"}</Text>
                }
                <Text selectable={true} style={this.styles.black}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.Hallelujah.Hallelujah) : GlobalFunctions.trim(CurrentMassLiturgy.Today.Hallelujah.Hallelujah)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}

                {CurrentLiturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ?
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                            <TouchableOpacity onPress={this._onEvangeliPress.bind(this, 'normal')}>
                                <Text style={this.state.evangeliType === "normal" ? this.styles.prayerTabButtonBold : this.styles.prayerTabButton}>{"Normal  "}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this._onEvangeliPress.bind(this, 'alternative')}>
                                <Text style={this.state.evangeliType === "normal" ? this.styles.prayerTabButton : this.styles.prayerTabButtonBold}>{"  Alternatiu (vespre)"}</Text>
                            </TouchableOpacity>
                        </View>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                    :
                    null
                }

                <View>

                    {this.state.evangeliType === "normal" ?
                        this.NormalEvangeli()
                        :
                        this.AlternativePasquaEvangeli()
                    }
                </View>
                {displayCredo ?
                    <View>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                        <HR />
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                        <Text selectable={true} style={this.styles.red}>{"Credo"}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                        {this.CredoText()}
                    </View>
                    :
                    null
                }
            </View>
        );
    }

    _onEvangeliPress(evangeliType) {
        this.setState({ evangeliType: evangeliType });
    }

    NormalEvangeli() {
        const cita = this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.Gospel.Comment) : GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Comment);
        return (
            <View style={{ flex: 1 }}>
                <Text selectable={true} style={this.styles.red}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.Gospel.Quote) : GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Quote)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                {cita === undefined || cita === '-' ?
                    null
                    :
                    <View>
                        <Text selectable={true} style={this.styles.blackItalic}>{cita}</Text>
                        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                    </View>
                }
                <Text selectable={true} style={this.styles.black}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.Gospel.Title) : GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Title)}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{this.state.DisplayVespers ? GlobalFunctions.trim(CurrentMassLiturgy.Vespers.Gospel.Gospel) : GlobalFunctions.trim(CurrentMassLiturgy.Today.Gospel.Gospel)}</Text>
            </View>
        )
    }

    AlternativePasquaEvangeli() {
        return (
            <View style={{ flex: 1 }}>
                <Text selectable={true} style={this.styles.red}>{"Lc 24,13-35"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackItalic}>{"El reconegueren quan partia el pa"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.black}>{"Lectura de l’evangeli segons sant Lluc"}</Text>
                {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
                <Text selectable={true} style={this.styles.blackJustified}>{"Aquell mateix diumenge dos dels deixebles de Jesús se n’anaven a un poble anomenat Emaús, a onze quilòmetres de Jerusalem, i conversaven entre ells comentant aquests incidents.\nMentre conversaven i discutien, Jesús mateix els aconseguí i es posà a caminar amb ells, però Déu impedia que els seus ulls el reconeguessin. Ell els preguntà: «De què discutiu entre vosaltres tot caminant?». Ells s’aturaren amb un posat trist i un dels dos, que es deia Cleofàs, li respongué: «De tots els forasters que hi havia aquests dies a Jerusalem, ets l’únic que no saps el que hi ha passat?». Els preguntà: «Què?». Li contestaren: «El cas de Jesús de Natzaret. S’havia revelat com un profeta poderós en obres i en paraules davant Déu i el poble. Els grans sacerdots i les autoritats del nostre poble l’entregaren perquè fos condemnat a mort i crucificat. Nosaltres esperàvem que ell seria el qui hauria alliberat Israel. Ara, de tot això ja fa tres dies. És cert que unes dones del nostre grup ens han esverat: han anat de bon matí al sepulcre, no hi han trobat el cos, i han vingut a dir-nos que fins i tot se’ls han aparegut uns àngels i els han assegurat que ell és viu. Alguns dels qui eren amb nosaltres han anat al sepulcre i ho han trobat tot exactament com les dones havien dit, però a ell, no l’han vist pas».\nEll els digué: «Sí que us costa d’entendre! Quins cors tan indecisos a creure tot allò que havien anunciat els profetes. No havia de patir tot això el Messies abans d’entrar en la seva glòria?». Llavors, començant pels llibres de Moisès i seguint els de tots els profetes, els exposava tots els llocs de les Escriptures que es referien a ell.\nMentrestant s’acostaven al poblet on es dirigien i ell va fer com si seguís més enllà. Però ells el forçaren pregant-lo: «Queda’t amb nosaltres que ja es fa tard i el dia ha començat a declinar». Jesús entrà per quedar-se amb ells. Quan s’hagué posat amb ells a taula, prengué el pa, digué la benedicció, el partí i els el donava. En aquell moment se’ls obriren els ulls i el reconegueren, però ell desaparegué. I es deien l’un a l’altre: «No és veritat que els nostres cors s’abrusaven dins nostre mentre ens parlava pel camí i ens obria el sentit de les Escriptures?». Llavors mateix s’alçaren de taula i se’n tornaren a Jerusalem. Allà trobaren reunits els onze i tots els qui anaven amb ells, que deien: «Realment el Senyor ha ressuscitat i s’ha aparegut a Simó». Ells també contaven el que els havia passat pel camí, i com l’havien reconegut quan partia el pa."}</Text>
            </View>
        )
    }

    CredoText() {
        return <Text selectable={true} style={this.styles.blackJustified}>{"Crec en un Déu\nPare totpoderós,\ncreador del cel i de la terra.\n\nI en Jesucrist, únic Fill seu i Senyor nostre;\nel qual fou concebut per obra de l’Esperit Sant,\nnasqué de Maria Verge;\npatí sota el poder de Ponç Pilat,\nfou crucificat, mort i sepultat;\ndavallà als inferns,\nressuscità el tercer dia d’entre els morts;\nse’n pujà al cel,\nseu a la dreta de Déu Pare totpoderós;\ni d’allí ha de venir a judicar els vius i els morts.\n\nCrec en l’Esperit Sant;\nla santa Mare Església catòlica,\nla comunió dels sants;\nla remissió dels pecats;\nla resurrecció de la carn;\nla vida perdurable. Amén."}</Text>;
    }

    //------------------------------------------------------------------------------------
}
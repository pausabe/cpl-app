import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  Platform,
  TouchableOpacity,
  Share
} from 'react-native';
import HR from '../../../../Components/HRComponent';
import GLOBAL from '../../../../Globals/Globals';
import GF from '../../../../Globals/GlobalFunctions';
import SettingsManager from '../../../../Controllers/Classes/SettingsManager';

export default class LaudesDisplay extends Component {
  componentDidMount(){
  }

  componentWillUnmount(){
  }

  constructor(props){
    super(props);

    console.log("PlaceLog. LaudesDisplay");

    var auxNumSalmInv = G_VALUES.numSalmInv;

    if(!GF.salmInvExists(auxNumSalmInv,props.titols)){
      auxNumSalmInv = '94';
      props.setNumSalmInv('94');
      SettingsManager.setSettingNumSalmInv('94');
    }

    this.state = {
      invitatori: props.superTestMode,
      numSalmInv: auxNumSalmInv,
    }

    this.styles = {
      container: GF.getStyle("CONTAINER", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      black: GF.getStyle("GENERIC", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      blackBold: GF.getStyle("GENERIC_BOLD", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      blackItalic: GF.getStyle("GENERIC_ITALIC", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      blackSmallItalicRight: GF.getStyle("GENERIC_SMALL_ITALIC_RIGHT", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      blackJustified: GF.getStyle("GENERIC_JUSTIFIED", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      red: GF.getStyle("ACCENT", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      redItalic: GF.getStyle("ACCENT_ITALIC", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      redCenter: GF.getStyle("ACCENT_CENTER", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      redCenterBold: GF.getStyle("ACCENT_CENTER_BOLD", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      redSmallItalicRight: GF.getStyle("ACCENT_SMALL_ITALIC_RIGHT", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      hiddenPrayerButton: GF.getStyle("HIDDEN_PRAYER_BUTTON", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      prayerTabButton: GF.getStyle("PRAYER_TAB_BUTTON", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
      prayerTabButtonBold: GF.getStyle("PRAYER_TAB_BUTTON_BOLD", Platform.OS, G_VALUES.textSize, G_VALUES.darkModeEnabled),
    };

    this.LAUDES = LH_VALUES.laudes;
    this.superTestMode = props.superTestMode;
    this.testErrorCB = props.testErrorCB;
    this.setNumSalmInv = props.setNumSalmInv;
    this.titols = props.titols;
  }

  _onSalmInvPress(numSalm){
    this.setState({numSalmInv:numSalm});
    this.setNumSalmInv(numSalm);
    SettingsManager.setSettingNumSalmInv(numSalm);
  }

  salmInvitatori(numSalm, salm94, salm99, salm66, salm23){
    var style94 = this.styles.prayerTabButton;
    var style99 = this.styles.prayerTabButton;
    var style66 = this.styles.prayerTabButton;
    var style23 = this.styles.prayerTabButton;

    switch (numSalm) {
      case '94':
        titolSalm = "Salm 94\nInvitació a lloar Déu";
        refSalm = "Mentre repetim aquell «avui», exhortem-nos cada dia els uns als altres (He 3, 13)";
        salm = salm94;
        style94 = this.styles.prayerTabButtonBold;
        break;
      case '99':
        titolSalm = "Salm 99\nInvitació a lloar Déu en el seu temple";
        refSalm = "El Senyor vol que els redimits cantin himnes de victòria (St. Atanasi)";
        salm = salm99;
        style99 = this.styles.prayerTabButtonBold;
        break;
      case '66':
        titolSalm = "Salm 66\nInvitació als pobles a lloar Déu";
        refSalm = "Sapigueu que el missatge de la salvació de Déu ha estat enviat a tots els pobles (Fets 28, 28)";
        salm = salm66;
        style66 = this.styles.prayerTabButtonBold;
        break;
      case '23':
        titolSalm = "Salm 23\nEntrada del Senyor al santuari";
        refSalm = "Les portes del cel s'obriren a Crist quan hi fou endut amb la seva humanitat (St. Ireneu)";
        salm = salm23;
        style23 = this.styles.prayerTabButtonBold;
        break;
    }

    var estrofes = salm.split("\n\n");
    var antifona = GF.rs(this.LAUDES.antInvitatori, this.superTestMode, this.testErrorCB.bind(this));
    var gloriaString = "Glòria al Pare i al Fill    \ni a l’Esperit Sant.\nCom era al principi, ara i sempre    \ni pels segles dels segles. Amén.";

    return(
      <View>

        <View style={{alignItems: 'center'}}>
          <View style={{flexDirection: 'row',paddingVertical: 10}}>
            <TouchableOpacity onPress={this._onSalmInvPress.bind(this,'94')}>
              <Text style={style94}>{"Salm 94  "}</Text>
            </TouchableOpacity>
            {GF.salmInvExists('99',this.titols)?
              <TouchableOpacity onPress={this._onSalmInvPress.bind(this,'99')}>
                <Text style={style99}>{"  Salm 99  "}</Text>
              </TouchableOpacity>
            :
              null
            }
            {GF.salmInvExists('66',this.titols)?
              <TouchableOpacity onPress={this._onSalmInvPress.bind(this,'66')}>
                <Text style={style66}>{"  Salm 66  "}</Text>
              </TouchableOpacity>
            :
              null
            }
            {GF.salmInvExists('23',this.titols)?
              <TouchableOpacity onPress={this._onSalmInvPress.bind(this,'23')}>
                <Text style={style23}>{"  Salm 23"}</Text>
              </TouchableOpacity>
            :
              null
            }
          </View>
        </View>

        <Text selectable={true} style={this.styles.red}>{"Ant. "}
          <Text selectable={true} style={this.styles.black}>{antifona}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{titolSalm}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
        <Text selectable={true} style={this.styles.blackSmallItalicRight}>{refSalm}</Text></View></View>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{estrofes[0]}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{"Ant. "}
          <Text selectable={true} style={this.styles.black}>{antifona}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{estrofes[1]}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{"Ant. "}
          <Text selectable={true} style={this.styles.black}>{antifona}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{estrofes[2]}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{"Ant. "}
          <Text selectable={true} style={this.styles.black}>{antifona}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{estrofes[3]}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{"Ant. "}
          <Text selectable={true} style={this.styles.black}>{antifona}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {estrofes.length > 4?
          <View>
            <Text selectable={true} style={this.styles.black}>{estrofes[4]}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"Ant. "}
              <Text selectable={true} style={this.styles.black}>{antifona}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          </View>
        : null}
        {estrofes.length > 5?
          <View>
            <Text selectable={true} style={this.styles.black}>{estrofes[5]}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"Ant. "}
              <Text selectable={true} style={this.styles.black}>{antifona}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          </View>
        : null}
        {estrofes.length > 6?
          <View>
            <Text selectable={true} style={this.styles.black}>{estrofes[6]}</Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{"Ant. "}
              <Text selectable={true} style={this.styles.black}>{antifona}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          </View>
        : null}
        <Text selectable={true} style={this.styles.black}>{gloriaString}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{"Ant. "}
          <Text selectable={true} style={this.styles.black}>{antifona}</Text>
        </Text>
      </View>
    );
  }

  render() {
    try {

      return (
        <View style={this.styles.container}>
          {this.introduccio(G_VALUES.LT, G_VALUES.setmana, this.LAUDES.salm94,
                              this.LAUDES.salm99, this.LAUDES.salm66, this.LAUDES.salm23)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'HIMNE'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.himne(G_VALUES.LT, G_VALUES.date.getDay(), G_VALUES.setmana)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'SALMÒDIA'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.salmodia(G_VALUES.LT, G_VALUES.setmana, G_VALUES.date.getDay())}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'LECTURA BREU'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.lecturaBreu(G_VALUES.LT)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'RESPONSORI BREU'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.responsori(G_VALUES.LT)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'CÀNTIC DE ZACARIES'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.cantic(G_VALUES.LT, G_VALUES.date.getDay(), G_VALUES.ABC)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'PREGÀRIES'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.pregaries(G_VALUES.LT)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'ORACIÓ'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.oracio(G_VALUES.LT, G_VALUES.date.getDay())}
          <Text selectable={true} style={this.styles.red}>{'R.'}
            <Text selectable={true} style={this.styles.black}>{' Amén.'}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'CONCLUSIÓ'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.conclusio()}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {Platform.OS === 'android' ? null : <Text />}
        </View>
      );
    }
    catch (e) {
      console.log(e);
      if(this.superTestMode) this.testErrorCB();
      return null;
    }
  }

  salm(salm){
    if(!salm) return null;

    if(true){
      salm = salm.replace(/    [*]/g,'');
      salm = salm.replace(/   [*]/g,'');
      salm = salm.replace(/  [*]/g,'');
      salm = salm.replace(/ [*]/g,'');
      salm = salm.replace(/    [†]/g,'');
      salm = salm.replace(/   [†]/g,'');
      salm = salm.replace(/  [†]/g,'');
      salm = salm.replace(/ [†]/g,'');
    }
    return salm;
  }

  _invitatoriButton(){
    return(
      <View>
        <TouchableOpacity onPress={() => this.setState({invitatori: !this.state.invitatori})}>
          <View style={{alignItems: 'center',paddingVertical: 10}}>
            <Text style={this.styles.hiddenPrayerButton}>{this.state.invitatori?"Amagar":"Començar amb"}{" l'invitatori"}</Text>
          </View>
        </TouchableOpacity>
        {this.state.invitatori?
          <View>
            <Text selectable={true} style={this.styles.red}>{"INVITATORI"}</Text>
              {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          </View>
          :null
        }
      </View>
    );
  }

  introduccio(LT, setmana, salm94, salm99, salm66, salm23){
    const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";

    if(!this.LAUDES.diumPasqua && !this.state.invitatori){//this.LAUDES.invitatori !== "Laudes"){
      var aux_sigueu = 'Sigueu amb nosaltres, Déu nostre.';
      var aux_senyor_veniu = 'Senyor, veniu a ajudar-nos.';
      var aux_isAleluia = G_VALUES.LT !== GLOBAL.Q_CENDRA && G_VALUES.LT !== GLOBAL.Q_SETMANES && G_VALUES.LT !== GLOBAL.Q_DIUM_RAMS && G_VALUES.LT !== GLOBAL.Q_SET_SANTA && G_VALUES.LT !== GLOBAL.Q_TRIDU;

      return(
        <View>
          {this._invitatoriButton()}
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{aux_sigueu}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{aux_senyor_veniu}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.black}>{gloriaStringIntro}
            {aux_isAleluia ?
              <Text selectable={true} style={this.styles.black}>{' Al·leluia.'}</Text> : null
            }
          </Text>
        </View>
      )
    }
    else{
      var aux_obriume = 'Obriu-me els llavis, Senyor.';
      var aux_proclamare = 'I proclamaré la vostra lloança.';

      /*this.shareText += 'V. ' + aux_obriume + '\n';
      this.shareText += 'R. ' + aux_proclamare + '\n\n';*/

      return(
        <View>
          {!this.LAUDES.diumPasqua?
            <View>{this._invitatoriButton()}</View>
            : null
          }
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{aux_obriume}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{aux_proclamare}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.salmInvitatori(this.state.numSalmInv, salm94, salm99, salm66, salm23)}
        </View>
      )
    }
  }
  himne(LT, weekDay, setmana){
    var aux_himne = GF.rs(this.LAUDES.himne, this.superTestMode, this.testErrorCB.bind(this));

    /*this.shareText += 'HIMNE\n\n';
    this.shareText += aux_himne + '\n\n';*/
    return(<Text selectable={true} style={this.styles.black}>{aux_himne}</Text>);
  }

  salmodia(LT, setmana, weekDay){
    var aux_ant1 = GF.rs(this.LAUDES.ant1, this.superTestMode, this.testErrorCB.bind(this));
    var aux_titol1 = GF.rs(this.LAUDES.titol1, this.superTestMode, this.testErrorCB.bind(this));
    var aux_com1 = "";
    if(this.LAUDES.com1 !== '-')
      aux_com1 = GF.rs(this.LAUDES.com1, this.superTestMode, this.testErrorCB.bind(this));
    var aux_salm1 = this.salm(GF.rs(this.LAUDES.salm1, this.superTestMode, this.testErrorCB.bind(this)));
    var aux_ant2 = GF.rs(this.LAUDES.ant2, this.superTestMode, this.testErrorCB.bind(this));
    var aux_titol2 = GF.canticSpace(GF.rs(this.LAUDES.titol2, this.superTestMode, this.testErrorCB.bind(this)));
    var aux_com2 = "";
    if(this.LAUDES.com2 !== '-')
      aux_com2 = GF.rs(this.LAUDES.com2, this.superTestMode, this.testErrorCB.bind(this));
    var aux_salm2 = this.salm(GF.rs(this.LAUDES.salm2, this.superTestMode, this.testErrorCB.bind(this)));
    var aux_ant3 = GF.rs(this.LAUDES.ant3, this.superTestMode, this.testErrorCB.bind(this));
    var aux_titol3 = GF.canticSpace(GF.rs(this.LAUDES.titol3, this.superTestMode, this.testErrorCB.bind(this)));
    var aux_com3 = "";
    if(this.LAUDES.com3 !== '-')
      aux_com3 = GF.rs(this.LAUDES.com3, this.superTestMode, this.testErrorCB.bind(this));
    var aux_salm3 = this.salm(GF.rs(this.LAUDES.salm3, this.superTestMode, this.testErrorCB.bind(this)));

    /*this.shareText += 'SALMÒDIA\n\n';
    this.shareText += 'Ant. 1. ';
    this.shareText += aux_ant1 + '\n\n';
    this.shareText += aux_titol1 + '\n\n';
    this.shareText += aux_com1 + '\n\n';
    this.shareText += aux_salm1 + '\n\n';
    this.shareText += aux_gloria1 + '\n\n';
    this.shareText += 'Ant. 1. ';
    this.shareText += aux_ant1 + '\n\n';
    this.shareText += 'Ant. 2. ';
    this.shareText += aux_ant2 + '\n\n';
    this.shareText += aux_titol2 + '\n\n';
    this.shareText += aux_com2 + '\n\n';
    this.shareText += aux_salm2 + '\n\n';
    this.shareText += aux_gloria2 + '\n\n';
    this.shareText += 'Ant. 2. ';
    this.shareText += aux_ant2 + '\n\n';
    this.shareText += 'Ant. 3. ';
    this.shareText += aux_ant3 + '\n\n';
    this.shareText += aux_titol3 + '\n\n';
    this.shareText += aux_com3 + '\n\n';
    this.shareText += aux_salm3 + '\n\n';
    this.shareText += aux_gloria3 + '\n\n';
    this.shareText += 'Ant. 3. ';
    this.shareText += aux_ant3 + '\n\n';*/

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{'Ant. 1.'}
          <Text selectable={true} style={this.styles.black}> {aux_ant1}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.LAUDES.com1 !== '-' ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.LAUDES.gloria1 == "1"?
          <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
          :
          <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 1.'}
          <Text selectable={true} style={this.styles.black}> {aux_ant1}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 2.'}
          <Text selectable={true} style={this.styles.black}> {aux_ant2}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol2}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.LAUDES.com2 !== '-' ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.LAUDES.gloria2 == "1"?
          <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
          :
          <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 2.'}
          <Text selectable={true} style={this.styles.black}> {aux_ant2}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 3.'}
          <Text selectable={true} style={this.styles.black}> {aux_ant3}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol3}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.LAUDES.com3 !== '-' ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com3}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm3}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.LAUDES.gloria3 == "1"?
          <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
          :
          <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. 3.'}
          <Text selectable={true} style={this.styles.black}> {aux_ant3}</Text>
        </Text>
      </View>
    );
  }

  lecturaBreu(LT){
    var aux_vers = GF.rs(this.LAUDES.vers, this.superTestMode, this.testErrorCB.bind(this))
    var aux_lectura_breu = GF.rs(this.LAUDES.lecturaBreu, this.superTestMode, this.testErrorCB.bind(this));

    /*this.shareText += 'LECTURA BREU\n\n';
    this.shareText += aux_vers + '\n';
    this.shareText += aux_lectura_breu + '\n\n';*/

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{aux_vers}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{aux_lectura_breu}</Text>
      </View>
    )
  }

  responsori(LT){
    //this.shareText += 'RESPONSORI BREU\n\n';

    if(this.LAUDES.calAntEspecial){
      var aux_ant = GF.rs(this.LAUDES.antEspecialLaudes, this.superTestMode, this.testErrorCB.bind(this));
      //this.shareText += 'Ant. ' + aux_ant + '\n\n';

      return(
        <View>
          <Text selectable={true} style={this.styles.red}>{'Ant.'}
            <Text selectable={true} style={this.styles.black}> {aux_ant}</Text>
          </Text>
        </View>
      )
    }
    else{
      var aux_resp_1_2 = GF.respTogether(GF.rs(this.LAUDES.respBreu1, this.superTestMode, this.testErrorCB.bind(this)),GF.rs(this.LAUDES.respBreu2, this.superTestMode, this.testErrorCB.bind(this)));
      var aux_resp_3 = GF.rs(this.LAUDES.respBreu3, this.superTestMode, this.testErrorCB.bind(this));
      var aux_resp_2 = GF.rs(this.LAUDES.respBreu2, this.superTestMode, this.testErrorCB.bind(this));
      var aux_gloria_half = "Glòria al Pare i al Fill i a l'Esperit Sant.";

      /*this.shareText += 'V. ' + aux_resp_1_2 + '\n';
      this.shareText += 'R. ' + aux_resp_1_2 + '\n\n';
      this.shareText += 'V. ' + aux_resp_3 + '\n';
      this.shareText += 'R. ' + aux_resp_2 + '\n\n';
      this.shareText += 'V. ' + aux_gloria_half + '\n';
      this.shareText += 'R. ' + aux_resp_1_2 + '\n\n';*/

      return(
        <View>
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_3}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_2}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{aux_gloria_half}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{aux_resp_1_2}</Text>
          </Text>
        </View>
      )
    }
  }

  cantic(LT, weekDay, litYear){
    var aux_ant = GF.rs(this.LAUDES.antCantic, this.superTestMode, this.testErrorCB.bind(this));
    var aux_titol = "Càntic\nLc 1, 68-79\nEl Messies i el seu Precursor";
    var aux_salm = this.salm(this.LAUDES.cantic);
    var aux_gloria = "Glòria.";

    /*this.shareText += 'CÀNTIC DE ZACARIES\n\n';
    this.shareText += 'Ant. ' + aux_ant + '\n\n';
    this.shareText += aux_titol + '\n\n';
    this.shareText += aux_salm + '\n\n';
    this.shareText += aux_gloria + '\n\n';
    this.shareText += 'Ant. ' + aux_ant + '\n\n';*/

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{'Ant. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
        </Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{aux_salm}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.blackItalic}>{aux_gloria}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'Ant. '}
          <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
        </Text>
      </View>
    );
  }

  convertN(pregs,papa,bisbe){ //desconec si a Laudes existeix aquest cas
    if(pregs.search("papa N.") !== -1){
      pregs = pregs.replace("papa N.","papa "+papa);
    }
    else if(pregs.search("Papa N.") !== -1){
      pregs = pregs.replace("Papa N.","papa "+papa);
    }
    if(pregs.search("bisbe N.") !== -1){
      pregs = pregs.replace("bisbe N.","bisbe "+bisbe);
    }
    return pregs;
  }

  pregaries(LT){
    var allPregs = GF.rs(this.LAUDES.pregaries, this.superTestMode, this.testErrorCB.bind(this));

    //this.shareText += 'PREGÀRIES\n\n';

    //var aux_share_characters_before = this.shareText.length;

    //this.shareText += allPregs + '\n\n';

    if(allPregs === null || allPregs === undefined || allPregs === '' || allPregs === '-')
      return(<Text selectable={true} style={this.styles.black}>{"-"}</Text>);

      allPregs = this.convertN(allPregs, this.LAUDES.papa, this.LAUDES.bisbe);

      if(allPregs.match(/—/g, "")) var numGuio = allPregs.match(/—/g, "").length;
      else return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      if(allPregs.match(/\n/g, "")) var numEnter = allPregs.match(/\n/g, "").length;
      else return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);

    if(numEnter !== numGuio*3+3){//every prayer have 3 spaces and intro have 3 more
      console.log("InfoLog. incorrect spaces in pregaries");
      return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
    }
    else{
      var introPregs = allPregs.split(":")[0];
      // console.log("introPregs: " + introPregs);
      // console.log("allPregs:\n" + allPregs);
      if(allPregs.search(introPregs+':') !== -1){
        var pregsNoIntro = allPregs.replace(introPregs+':','');
        if(pregsNoIntro !== ''){
          while(pregsNoIntro.charAt(0) === '\n' || pregsNoIntro.charAt(0) === ' '){
            pregsNoIntro = pregsNoIntro.substring(1,pregsNoIntro.length);
          }
        }
      }
      else{
        console.log("InfoLog. something incorrect. Pregaries 1");
        return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      }

      var respPregs = pregsNoIntro.split("\n")[0];
      if(pregsNoIntro.search(respPregs+'\n\n') !== -1){
        var pregaries = pregsNoIntro.replace(respPregs+'\n\n','');
      }
      else{
        console.log("InfoLog. something incorrect. Pregaries 2");
        return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      }

      if(pregaries.search(": Pare nostre.") !== -1){
        pregaries = pregaries.replace(": Pare nostre.",':');
      }
      else{
        console.log("InfoLog. something incorrect. Pregaries 3");
        return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      }

      var pregsFinalPart = pregaries.split("—")[numGuio].split(".\n\n")[1];
      if(pregaries.search('\n\n'+pregsFinalPart) !== -1){
        pregaries = pregaries.replace('\n\n'+pregsFinalPart,'');
      }
      else{
        console.log("InfoLog. something incorrect. Pregaries 4");
        return(<Text selectable={true} style={this.styles.black}>{allPregs}</Text>);
      }
    }

    //this.shareText = this.shareText.substr(0, aux_share_characters_before);

    var aux_intencions = "Aquí es poden afegir altres intencions.";

    /*this.shareText += introPregs + ':\n\n';
    this.shareText += respPregs + '\n\n';
    this.shareText += pregaries + '\n\n';
    this.shareText += aux_intencions + '\n\n';
    this.shareText += pregsFinalPart + '\n\n';
    this.shareText += "Pare nostre." + '\n\n';*/

    return(
      <View>
        <Text selectable={true} style={this.styles.black}>{introPregs}{':'}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.blackItalic}>{respPregs}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{pregaries}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redItalic}>{aux_intencions}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{pregsFinalPart}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.blackItalic}>{"Pare nostre."}</Text>
      </View>
    );
  }

  oracio(LT, weekDay){
    var aux_oracio = GF.completeOracio(GF.rs(this.LAUDES.oracio, this.superTestMode, this.testErrorCB.bind(this)),false);

    //this.shareText += 'ORACIÓ\n\n';
    //this.shareText += aux_oracio + '\n' + 'R. Amén.' + '\n\n';
    return(<Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>);
  }

  conclusio(){
    var aux_benediccio = 'Que el Senyor ens beneeixi i ens guardi de tot mal, i ens dugui a la vida eterna.';

    /*this.shareText += 'CONCLUSIÓ\n\n';
    this.shareText += 'V. ' + aux_benediccio + '\n' + 'R. Amén.' + '\n\n';

    if(Platform.OS === 'ios'){
      this.shareText += "_____\nCol·labora fent un donatiu:";
    }*/

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{'V. '}
          <Text selectable={true} style={this.styles.black}>{aux_benediccio}</Text>
        </Text>
        <Text selectable={true} style={this.styles.red}>{'R. '}
          <Text selectable={true} style={this.styles.black}>{'Amén.'}</Text>
        </Text>
      </View>
    )
  }
}

AppRegistry.registerComponent('LaudesDisplay', () => LaudesDisplay);

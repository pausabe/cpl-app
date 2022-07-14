import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  Platform,
  Share
} from 'react-native';
import HR from '../../../Components/HRComponent';
import GLOBAL from '../../../Utils/GlobalKeys';
import GF from '../../../Utils/GlobalFunctions';
import * as Logger from '../../../Utils/Logger';
import {GlobalData} from "../../../Services/DataService";

export default class HoursComponent extends Component {
  componentDidMount(){
  }

  componentWillUnmount(){
  }

  constructor(props){
    super(props);
    this.styles = {
      black: GF.getStyle("GENERIC", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackBold: GF.getStyle("GENERIC_BOLD", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackItalic: GF.getStyle("GENERIC_ITALIC", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackSmallItalicRight: GF.getStyle("GENERIC_SMALL_ITALIC_RIGHT", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      blackJustified: GF.getStyle("GENERIC_JUSTIFIED", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      red: GF.getStyle("ACCENT", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redItalic: GF.getStyle("ACCENT_ITALIC", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redCenter: GF.getStyle("ACCENT_CENTER", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redCenterBold: GF.getStyle("ACCENT_CENTER_BOLD", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      redSmallItalicRight: GF.getStyle("ACCENT_SMALL_ITALIC_RIGHT", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      hiddenPrayerButton: GF.getStyle("HIDDEN_PRAYER_BUTTON", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      prayerTabButton: GF.getStyle("PRAYER_TAB_BUTTON", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
      prayerTabButtonBold: GF.getStyle("PRAYER_TAB_BUTTON_BOLD", Platform.OS, GlobalData.textSize, GlobalData.darkModeEnabled),
    };

  }

  render() {
    try {

      const gloriaStringIntro = "Glòria al Pare i al Fill\ni a l’Esperit Sant.\nCom era al principi, ara i sempre\ni pels segles dels segles. Amén.";
      var aux_isAleluia = GlobalData.LT !== GLOBAL.Q_CENDRA && GlobalData.LT !== GLOBAL.Q_SETMANES && GlobalData.LT !== GLOBAL.Q_DIUM_RAMS && GlobalData.LT !== GLOBAL.Q_SET_SANTA && GlobalData.LT !== GLOBAL.Q_TRIDU;

      return (
        <View>
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{'Sigueu amb nosaltres, Déu nostre.'}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{'Senyor, veniu a ajudar-nos.'}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.black}>{gloriaStringIntro}
          {aux_isAleluia?
            <Text selectable={true} style={this.styles.black}>{" Al·leluia."}</Text> : null
          }
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'HIMNE'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.himne(GlobalData.LT, GlobalData.date.getDay(), GlobalData.setmana, this.props.HM)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'SALMÒDIA'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.salmodia(GlobalData.LT, GlobalData.setmana, GlobalData.date.getDay(), this.props.HM)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'LECTURA BREU'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {this.lecturaBreuResp(GlobalData.LT, this.props.HM)}
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'ORACIÓ'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.blackBold}>{'Preguem.'}</Text>
          {this.oracio(GlobalData.LT, GlobalData.date.getDay(), this.props.HM)}
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{'Amén.'}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <HR/>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'CONCLUSIÓ'}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          <Text selectable={true} style={this.styles.red}>{'V. '}
            <Text selectable={true} style={this.styles.black}>{'Beneïm el Senyor.'}</Text>
          </Text>
          <Text selectable={true} style={this.styles.red}>{'R. '}
            <Text selectable={true} style={this.styles.black}>{'Donem gràcies a Déu.'}</Text>
          </Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          {Platform.OS === 'android' ? null : <Text />}
        </View>
      );
    }
    catch (error) {
      Logger.LogError(Logger.LogKeys.Screens, "render", error);
      if(this.props.superTestMode) this.props.testErrorCB();
      return null;
    }
  }

  salm(salm){
    if(!salm) return "";

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

  himne(LT, weekDay, setmana, HM){
    var aux_himne = GF.rs(this.props.HORA_MENOR.himne, this.props.superTestMode, this.props.testErrorCB.bind(this));

    return(<Text selectable={true} style={this.styles.black}>{aux_himne}</Text>);
  }

  salmodia(LT, setmana, weekDay, HM){
    var aux_antifones = this.props.HORA_MENOR.antifones;
    var aux_ant1 = aux_antifones? GF.rs(this.props.HORA_MENOR.ant1, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_ant = !aux_antifones? GF.rs(this.props.HORA_MENOR.ant, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_titol1 = GF.rs(this.props.HORA_MENOR.titol1, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_has_com1 = this.props.HORA_MENOR.com1 !== '-';
    var aux_com1 = aux_has_com1? GF.rs(this.props.HORA_MENOR.com1, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_salm1 = this.salm(GF.rs(this.props.HORA_MENOR.salm1, this.props.superTestMode, this.props.testErrorCB.bind(this)));
    var aux_ant2 = aux_antifones? GF.rs(this.props.HORA_MENOR.ant2, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_titol2 = GF.rs(this.props.HORA_MENOR.titol2, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_has_com2 = this.props.HORA_MENOR.com2 !== '-';
    var aux_com2 = aux_has_com2? GF.rs(this.props.HORA_MENOR.com2, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_salm2 = this.salm(GF.rs(this.props.HORA_MENOR.salm2, this.props.superTestMode, this.props.testErrorCB.bind(this)));
    var aux_ant3 = aux_antifones? GF.rs(this.props.HORA_MENOR.ant3, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_titol3 = GF.rs(this.props.HORA_MENOR.titol3, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_has_com3 = this.props.HORA_MENOR.com3 !== '-';
    var aux_com3 = aux_has_com3? GF.rs(this.props.HORA_MENOR.com3, this.props.superTestMode, this.props.testErrorCB.bind(this)) : "";
    var aux_salm3 = this.salm(GF.rs(this.props.HORA_MENOR.salm3, this.props.superTestMode, this.props.testErrorCB.bind(this)));

    return(
      <View>
        {aux_antifones?
          <View>
            <Text selectable={true} style={this.styles.red}>{'Ant. 1. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
            </Text>
          </View>
        :
          <View>
            <Text selectable={true} style={this.styles.red}>{'Ant. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
            </Text>
          </View>
        }
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol1}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_has_com1 ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com1}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm1}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.props.HORA_MENOR.gloria1 == "1"?
                <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                :
                <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_antifones ?
          <View>
            <Text selectable={true} style={this.styles.red}>{'Ant. 1. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant1}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'Ant. 2. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          </View>
        : null }
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol2}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_has_com2 ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com2}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm2}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.props.HORA_MENOR.gloria2 == "1"?
                <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                :
                <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_antifones ?
          <View>
            <Text selectable={true} style={this.styles.red}>{'Ant. 2. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant2}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
            <Text selectable={true} style={this.styles.red}>{'Ant. 3. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant3}</Text>
            </Text>
            {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
          </View>
        : null }
        <Text selectable={true} style={this.styles.redCenter}>{aux_titol3}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_has_com3 ?
          <View style={{flexDirection: 'row'}}><View style={{flex:1}}/><View style={{flex:2}}>
          <Text selectable={true} style={this.styles.blackSmallItalicRight}>{aux_com3}</Text>
          {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}</View></View> : null}
        <Text selectable={true} style={this.styles.black}>{aux_salm3}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {this.props.HORA_MENOR.gloria3 == "1"?
                <Text selectable={true} style={this.styles.blackItalic}>{"Glòria."}</Text>
                :
                <Text selectable={true} style={this.styles.redItalic}>{"S'omet el Glòria."}</Text>}
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        {aux_antifones ?
          <View>
            <Text selectable={true} style={this.styles.red}>{'Ant. 3. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant3}</Text>
            </Text>
          </View>
        :
          <View>
            <Text selectable={true} style={this.styles.red}>{'Ant. '}
              <Text selectable={true} style={this.styles.black}>{aux_ant}</Text>
            </Text>
          </View>
        }
      </View>
    );
  }

  lecturaBreuResp(LT, HM){
    var aux_vers = GF.rs(this.props.HORA_MENOR.vers, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_lecturaBreu = GF.rs(this.props.HORA_MENOR.lecturaBreu, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_respV = GF.rs(this.props.HORA_MENOR.respV, this.props.superTestMode, this.props.testErrorCB.bind(this));
    var aux_respR = GF.rs(this.props.HORA_MENOR.respR, this.props.superTestMode, this.props.testErrorCB.bind(this));

    return(
      <View>
        <Text selectable={true} style={this.styles.red}>{aux_vers}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.black}>{aux_lecturaBreu}</Text>
        {Platform.OS === 'android' ? <Text>{"\n"}</Text> : <Text />}
        <Text selectable={true} style={this.styles.red}>{'V. '}
          <Text selectable={true} style={this.styles.black}>{aux_respV}</Text>
        </Text>
        <Text selectable={true} style={this.styles.red}>{'R. '}
          <Text selectable={true} style={this.styles.black}>{aux_respR}</Text>
        </Text>
      </View>
    )
  }

  oracio(LT, weekDay, HM){
    var aux_oracio = GF.completeOracio(GF.rs(this.props.HORA_MENOR.oracio, this.props.superTestMode, this.props.testErrorCB.bind(this)),true);
    /*this.shareText += "ORACIÓ\n\nPreguem.\n";
    this.shareText += aux_oracio + '\n\n';

    this.shareText += 'CONCLUSIÓ\n\n';
    this.shareText += 'V. Beneïm el Senyor.\nR. Donem gràcies a Déu.' + '\n\n';

    if(Platform.OS === 'ios'){
      this.shareText += "_____\nCol·labora fent un donatiu:";
    }*/

    return(<Text selectable={true} style={this.styles.black}>{aux_oracio}</Text>);
  }
}

AppRegistry.registerComponent('HoursComponent', () => HoursComponent);

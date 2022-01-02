import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Appearance } from 'react-native';
import Constants from 'expo-constants';
import * as Logger from '../Utils/Logger';
import HR from '../Components/HRComponent';
import SettingsComponentAdapter from "../Adapters/SettingsComponentAdapter";
import * as DeviceInfo from 'expo-device';

export default class SettingsScreen extends Component {
  constructor(props){
    super(props);
  }

  refreshHome(){    
    this.props.route.params.Refresh_Date();
  }

  UNSAFE_componentWillMount(){
      SettingsComponentAdapter.getSettingsOptions(this.refreshHome.bind(this)).then(result =>{
          this.setState({options: result});
      }).catch(error =>  Logger.LogError(Logger.LogKeys.Screens, "UNSAFE_componentWillMount", "", error));
  }

  render() {
      if(!this.state || this.state && !this.state.options){
          return (
            <View style={styles.scrollContainer}>
              <ScrollView automaticallyAdjustContentInsets={false} style={styles.itemList}></ScrollView>
            </View>
          );
      }
      return (
        <View style={styles.scrollContainer}>
          <ScrollView automaticallyAdjustContentInsets={false} style={styles.itemList}>
            <View style={{height:15}}/>
            
            <HR/>
            {this.state.options}
            <View style={{height:10}}/>
            <View style={{padding: 5, paddingTop: 10,}}>
              <Text style={{textAlign:'center', color:'grey', fontSize:11}}>{"Text oficial de la Comissió Interdiocesana de Litúrgia de la Conferència Episcopal Tarraconense, aprovat pels bisbes de les diòcesis de parla catalana i confirmat per la Congregació per al Culte Diví i la Disciplina dels Sagraments: Prot. N. 312/15, 27 d'abril de 2016"}</Text>
              <View style={{height:15}}/>
              <Text style={{textAlign:'center', color:'grey', fontSize:11}}>{"Versió de l'aplicació: ("}{Platform.OS == "ios"? Constants.manifest.ios.buildNumber : Constants.manifest.android.versionCode}{")"}{Constants.manifest.version}</Text>
              <Text style={{textAlign:'center', color:'grey', fontSize:11}}>{"Versió de la base de dades: "}{G_VALUES.databaseVersion}</Text>
              <Text style={{textAlign:'center', color:'grey', fontSize:11}}>{"OTA("}{Constants.manifest.releaseChannel}{"): "}{Constants.manifest.updates.enabled? "Sí" : "No"}</Text>
              <Text style={{textAlign:'center', color:'grey', fontSize:11}}>{"Esquema de color: "}{Appearance.getColorScheme()}</Text>
            </View>
            <View style={{height:10}}/>
          </ScrollView>
        </View>
      );
    }
}

function paddingBar(){
  if(Platform.OS === 'ios'){
    var iosVer = parseInt(DeviceInfo.osVersion.split(".",1));
    if(iosVer>=11) return 0;
    return 0;
  }
  return 0;//64;
}

const styles = StyleSheet.create({
    itemList: {
        flex: 1,
    },
    scrollContainer: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingTop: paddingBar(),
      backgroundColor: 'rgb(242, 242, 242)'
    },
    normalText: {
        textAlign: 'center',
        color: '#000000',
        fontWeight: '300'
    },
    buttonView: {
      minHeight: 45,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems:'center',
      backgroundColor: 'white'
    },
    text: {
        color: "black",
        fontSize: 16
    },
})

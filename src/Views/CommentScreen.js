import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator
 } from 'react-native';
import WebView from 'react-native-webview'
import * as DeviceInfo from 'expo-device';
import GLOBAL from "../Utils/GlobalKeys";

function paddingBar(){
  if(Platform.OS === 'ios'){
    var iosVer = parseInt(DeviceInfo.osVersion.split(".",1));
    if(iosVer>=11) return 44;
    return 64;
  }
  return 0;
}

export default class CommentScreen extends Component {
  Internet_Error(){
    return (
      <View style={styles.internet_error_container}>
        <Text/>
        <Text style={styles.internal_error_text}>{"És necessari tenir una connexió a internet"}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <WebView
          source={{uri: 'https://mescpl.cpl.es/contacte/'}}
          startInLoadingState={true}
          renderError={() => this.Internet_Error() }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  internet_error_container: {
    flex: 1,
    paddingTop: paddingBar()
  },
  internal_error_text: {
    textAlign: 'center',
  }
});

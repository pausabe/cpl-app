import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform
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

export default class DonationScreen extends Component {
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
          source={{uri: 'https://buy.stripe.com/6oE16v3LV6oa7VC4gg'}}
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

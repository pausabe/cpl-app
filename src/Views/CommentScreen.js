import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview'
import { ThemeContext } from '../Theme';

// The contact page of the CPL, in the app
export default class CommentScreen extends Component {
  static contextType = ThemeContext;

  Internet_Error(){
    const {colors} = this.context;
    return (
      <View style={[styles.internet_error_container, {backgroundColor: colors.homeBackground}]}>
        <Text style={[styles.internal_error_text, {color: colors.text}]}>{"És necessari tenir una connexió a internet"}</Text>
      </View>
    );
  }

  render() {
    return (
      <SafeAreaView edges={["bottom"]} style={[styles.container, {backgroundColor: this.context.colors.homeBackground}]}>
        <WebView
          source={{uri: 'https://www.cpl.es/contacto/'}}
          startInLoadingState={true}
          renderError={() => this.Internet_Error() }
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  internet_error_container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  internal_error_text: {
    textAlign: 'center',
    fontSize: 17,
  }
});

import React, { Component } from 'react';
import { View } from 'react-native';
import { ThemeContext } from '../theme';

// The thin line between the parts of a prayer
export default class HRComponent extends Component {
  static contextType = ThemeContext;

  render() {
    return (
      <View
        testID={this.props.testID}
        style={{
          borderBottomColor: this.context.colors.divider,
          borderBottomWidth: 1,
          marginHorizontal: this.props.margin_horizontal !== undefined ? this.props.margin_horizontal : 0,
        }}
      />
    );
  }
}

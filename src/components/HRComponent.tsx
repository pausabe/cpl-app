import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';

// The thin line between the parts of a prayer
export default function HRComponent({ testID, marginHorizontal }: { testID?: string; marginHorizontal?: number }) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      style={{
        borderBottomColor: theme.colors.divider,
        borderBottomWidth: 1,
        marginHorizontal: marginHorizontal !== undefined ? marginHorizontal : 0,
      }}
    />
  );
}

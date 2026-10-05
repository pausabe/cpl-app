import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { DayRank, RANK_LETTERS } from '../../view-models/calendar';

// The letter of a celebration, as a printed liturgical calendar writes it: M a memorial, F a
// feast, S a solemnity, in the serif of the titles and in the colour of the celebration. Hidden
// from a screen reader: the day says its rank with its name.
interface RankLetterProps {
  rank: DayRank;
  color: string;
  size?: number;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export default function RankLetter({ rank, color, size = 13, style, testID }: RankLetterProps) {
  const theme = useTheme();
  return (
    <Text
      testID={testID}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      maxFontSizeMultiplier={1.3}
      style={[{ fontFamily: theme.fonts.serifSemiBold, fontSize: size, lineHeight: size * 1.15, color }, style]}
    >
      {RANK_LETTERS[rank]}
    </Text>
  );
}

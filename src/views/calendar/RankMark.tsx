import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { DayRank } from '../../view-models/calendar';

// The mark of the rank of a day, in the colour of its season: a dot for a memorial, a star for a
// feast and a filled one for a solemnity. The more of a star, the greater the day. Decorative:
// the day says its rank with its name.
const STAR = 'M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z';

interface RankMarkProps {
  rank: DayRank;
  color: string;
  // The side of the star; the dot is half of it
  size?: number;
  testID?: string;
}

export default function RankMark({ rank, color, size = 11, testID }: RankMarkProps) {
  if (rank === 'memory') {
    const dot = Math.round(size / 2);
    return (
      <View
        testID={testID}
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
        style={{ width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }}
      />
    );
  }
  const filled = rank === 'solemnity';
  return (
    <View testID={testID} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d={STAR}
          fill={filled ? color : 'none'}
          stroke={color}
          strokeWidth={filled ? 1.5 : 2.6}
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

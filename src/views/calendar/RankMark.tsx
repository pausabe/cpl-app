import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { DayRank } from '../../view-models/calendar';

// The mark of the rank of a day, in the colour of its season: candles, as on the altar, more of
// them the greater the celebration. One for a memorial, two for a feast, three for a solemnity,
// the one in the middle a little taller. A weekday has none. Decorative: the day says its rank
// with its name.
const CANDLES: Record<DayRank, number> = { memory: 1, feast: 2, solemnity: 3 };
// A candle is 6 wide and 24 tall, with 2 between two of them
const CANDLE = 6;
const GAP = 2;
const RAISE = 1.5;

interface RankMarkProps {
  rank: DayRank;
  color: string;
  // How tall the candles are; how wide, it depends on how many
  size?: number;
  testID?: string;
}

function rankMarkWidth(rank: DayRank, size: number): number {
  const count = CANDLES[rank];
  return (size * (CANDLE * count + GAP * (count - 1))) / (24 + RAISE);
}

export default function RankMark({ rank, color, size = 12, testID }: RankMarkProps) {
  const count = CANDLES[rank];
  const width = CANDLE * count + GAP * (count - 1);
  return (
    <View testID={testID} accessibilityElementsHidden={true} importantForAccessibility="no-hide-descendants">
      <Svg width={rankMarkWidth(rank, size)} height={size} viewBox={`0 ${-RAISE} ${width} ${24 + RAISE}`}>
        {Array.from({ length: count }, (_, index) => {
          const x = index * (CANDLE + GAP);
          // The candle in the middle of three, a little taller
          const taller = count === 3 && index === 1 ? RAISE : 0;
          const top = 1.5 - taller;
          return (
            <React.Fragment key={index}>
              <Path
                d={`M${x + 3} ${top}c1.6 2 2.3 3.3 2.3 4.4a2.3 2.3 0 0 1-4.6 0c0-1.1.7-2.4 2.3-4.4z`}
                fill={color}
              />
              <Rect x={x + 1} y={10.5 - taller} width={4} height={13 + taller} rx={1} fill={color} />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

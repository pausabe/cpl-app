import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import BottomSheet from './BottomSheet';
import Icon from './Icon';

// A list to choose one option, in a sheet: the diocese, the place. The one chosen has a tick.
interface OptionSheetProps {
  visible: boolean;
  title: string;
  options: string[];
  value: string;
  onChoose: (value: string) => void;
  onClose: () => void;
}

export default function OptionSheet({ visible, title, options, value, onChoose, onClose }: OptionSheetProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel={title} testID="option-sheet">
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <ScrollView style={styles.list} accessibilityRole="radiogroup">
        {options.map((option, index) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChoose(option)}
              style={({ pressed }) => [
                styles.row,
                { minHeight: theme.touch.comfortable, borderTopColor: colors.divider },
                index > 0 ? styles.separated : null,
                pressed ? { backgroundColor: colors.chipBackground } : null,
              ]}
            >
              <Text style={[styles.label, { color: colors.text, fontWeight: selected ? '700' : '400' }]}>{option}</Text>
              <View style={styles.tick}>
                {selected ? <Icon name="check" size={22} color={colors.accentText} /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  list: {
    flexGrow: 0,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  separated: {
    borderTopWidth: 1,
  },
  label: {
    flex: 1,
    fontSize: 17,
  },
  tick: {
    width: 28,
    alignItems: 'flex-end',
  },
});

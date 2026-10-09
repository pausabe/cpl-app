import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import BottomSheet from '../../components/BottomSheet';
import ActionButton from '../../components/ActionButton';
import { ColorCode, MemorialSheet as MemorialSheetModel } from '../../view-models/dayCard';

// «Què celebres avui?»: on a day with more than one optional memorial, the weekday and each of the
// memorials, with the beginning of its story, to choose one. Touching one chooses it at once (the
// day is loaded again with it, as the switch does), and the sheet stays until «Fet», touching
// outside it or the back button. One option is chosen at a time, as radio buttons.
interface MemorialSheetProps {
  sheet: MemorialSheetModel;
  colorCode: ColorCode;
  visible: boolean;
  onChoose: (memorialId: number | null) => void;
  onClose: () => void;
}

export default function MemorialSheet({ sheet, colorCode, visible, onChoose, onClose }: MemorialSheetProps) {
  const theme = useTheme();
  const { colors } = theme;
  const liturgical = theme.liturgical(colorCode);
  const saved = sheet.options.find((option) => option.selected)?.id ?? null;
  // The one touched, while the day is loaded again with it: chosen at once, here
  const [touched, setTouched] = useState<{ id: number | null } | null>(null);
  const chosen = touched ? touched.id : saved;

  const choose = (memorialId: number | null) => {
    if (memorialId === chosen) return;
    setTouched({ id: memorialId });
    onChoose(memorialId);
  };
  const close = () => {
    setTouched(null);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={close} accessibilityLabel={sheet.title} testID="memorials-sheet">
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {sheet.title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.text2 }]}>{sheet.subtitle}</Text>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        indicatorStyle={theme.scrollIndicator}
        accessibilityRole="radiogroup"
      >
        {sheet.options.map((option) => {
          const selected = option.id === chosen;
          return (
            <Pressable
              key={option.id ?? 'weekday'}
              testID={option.id === null ? 'memorial-weekday' : `memorial-${option.id}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, selected }}
              accessibilityLabel={option.title}
              accessibilityHint={option.subtitle || undefined}
              onPress={() => choose(option.id)}
              style={({ pressed }) => [
                styles.option,
                {
                  minHeight: theme.touch.large,
                  borderRadius: theme.radius.card,
                  borderColor: selected ? liturgical.accent : colors.rule,
                  backgroundColor: selected ? liturgical.tint : colors.sheet,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <View style={[styles.radio, { borderColor: selected ? liturgical.accent : colors.text3 }]}>
                {selected ? <View style={[styles.dot, { backgroundColor: liturgical.accent }]} /> : null}
              </View>
              <View style={styles.texts}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                {option.subtitle ? (
                  <Text numberOfLines={2} style={[styles.optionSubtitle, { color: colors.text2 }]}>
                    {option.subtitle}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <ActionButton label="Fet" onPress={close} style={styles.done} testID="memorials-done" />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 4,
    fontSize: 22,
    lineHeight: 27,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 19,
  },
  list: {
    marginTop: 14,
    flexGrow: 0,
    flexShrink: 1,
  },
  listContent: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  // The ring of a radio button, with the dot of the one chosen
  radio: {
    marginTop: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  texts: {
    flex: 1,
    gap: 3,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  optionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  done: {
    marginTop: 16,
  },
});

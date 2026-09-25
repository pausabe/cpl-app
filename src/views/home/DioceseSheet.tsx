import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';
import BottomSheet from '../../components/BottomSheet';
import ActionButton from '../../components/ActionButton';
import {
  DioceseOfferTexts,
  LOCATION_NOTICES,
  LocationStatus,
  LOOKING_FOR_YOU,
  OPEN_PHONE_SETTINGS,
} from '../../view-models/notices';

// Offered once on the home, to whoever has never chosen a diocese. Two ways out and both are
// doors: the phone can look for it, or they go and pick it themselves. Nothing is decided for
// them and nothing is written until one of the two is pressed.
export default function DioceseSheet({
  visible,
  texts,
  status,
  onUseMyLocation,
  onOpenPhoneSettings,
  onChooseMyself,
  onClose,
}: {
  visible: boolean;
  texts: DioceseOfferTexts;
  status: LocationStatus;
  onUseMyLocation: () => void;
  onOpenPhoneSettings: () => void;
  onChooseMyself: () => void;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { colors } = theme;
  const locating = status === 'locating';
  const denied = status === 'denied';
  const notice = LOCATION_NOTICES[status];
  return (
    <BottomSheet visible={visible} onClose={onClose} accessibilityLabel="Diòcesi" testID="diocese-offer">
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
      >
        {texts.title}
      </Text>
      <Text style={[styles.body, { color: colors.text }]}>{texts.body}</Text>
      {notice ? <Text style={[styles.notice, { color: colors.text3 }]}>{notice}</Text> : null}
      <ActionButton
        label={locating ? LOOKING_FOR_YOU : denied ? OPEN_PHONE_SETTINGS : texts.find}
        disabled={locating}
        onPress={denied ? onOpenPhoneSettings : onUseMyLocation}
        style={styles.button}
        testID="diocese-offer-locate"
      />
      <ActionButton
        label={texts.choose}
        variant="outlined"
        onPress={onChooseMyself}
        style={styles.secondButton}
        testID="diocese-offer-choose"
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 6,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 25,
  },
  notice: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    marginTop: 18,
  },
  secondButton: {
    marginTop: 10,
  },
});

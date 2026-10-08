import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme';
import ActionButton from './ActionButton';
import BottomSheet from './BottomSheet';

// Missatge: a few words to the CPL, written here and sent to the publishing website, where Pau and
// the CPL read and answer them. The name and the email are optional; without an email there is no
// answer, and it says so. It says too what goes with the message (the versions, the diocese).

export type MessageStatus = 'idle' | 'sending' | 'sent' | 'offline' | 'tooMany' | 'refused' | 'badEmail';

export interface MessageFields {
  text: string;
  name: string;
  email: string;
}

interface MessageSheetProps {
  visible: boolean;
  onClose: () => void;
  fields: MessageFields;
  onChange: (fields: MessageFields) => void;
  status: MessageStatus;
  onSend: () => void;
  onPrivacy: () => void;
}

const PROBLEMS: Partial<Record<MessageStatus, string>> = {
  offline: "No s'ha pogut enviar. Comprova la connexió i torna-ho a provar: el que has escrit no es perd.",
  tooMany: 'Avui ja has enviat uns quants missatges. Torna-ho a provar demà, si et plau.',
  refused: "No s'ha pogut enviar. Si torna a passar, escriu a cpl@cpl.es.",
  badEmail: 'Aquest correu no sembla correcte. Revisa’l, o deixa’l en blanc.',
};

export default function MessageSheet({
  visible,
  onClose,
  fields,
  onChange,
  status,
  onSend,
  onPrivacy,
}: MessageSheetProps) {
  const theme = useTheme();
  const { colors } = theme;
  const sending = status === 'sending';
  const input = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.chipBackground },
  ];
  const label = (text: string) => <Text style={[styles.label, { color: colors.text }]}>{text}</Text>;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      accessibilityLabel="Missatge"
      testID="message-sheet"
      avoidKeyboard={true}
    >
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={theme.maxFontScaleForLabels}
          style={[styles.title, { color: colors.text, fontFamily: theme.fonts.serifSemiBold }]}
        >
          Missatge
        </Text>
        <Pressable
          testID="message-sheet-close"
          accessibilityRole="button"
          onPress={onClose}
          hitSlop={8}
          style={({ pressed }) => [styles.close, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text
            maxFontSizeMultiplier={theme.maxFontScaleForLabels}
            style={[styles.closeText, { color: colors.accentText }]}
          >
            Tanca
          </Text>
        </Pressable>
      </View>
      {status === 'sent' ? (
        <View style={styles.thanks} testID="message-sent">
          <Text style={[styles.thanksTitle, { color: colors.text }]}>Gràcies!</Text>
          <Text style={[styles.text, { color: colors.text2 }]}>
            {fields.email.trim()
              ? `Hem rebut el teu missatge. Et respondrem a ${fields.email.trim()}.`
              : 'Hem rebut el teu missatge.'}
          </Text>
          <ActionButton label="Tanca" onPress={onClose} />
        </View>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
          <Text style={[styles.text, { color: colors.text2 }]}>
            Escriu el que vulguis a la CPL: un error de l’app, un text que no és correcte, una idea o unes paraules.
          </Text>
          {label('Missatge')}
          <TextInput
            testID="message-text"
            accessibilityLabel="Missatge"
            multiline={true}
            textAlignVertical="top"
            maxLength={4000}
            placeholder="Què ens vols dir?"
            placeholderTextColor={colors.text3}
            value={fields.text}
            onChangeText={(text) => onChange({ ...fields, text })}
            style={[...input, styles.multiline]}
          />
          {label('Nom (opcional)')}
          <TextInput
            testID="message-name"
            accessibilityLabel="Nom (opcional)"
            maxLength={100}
            autoComplete="name"
            textContentType="name"
            value={fields.name}
            onChangeText={(name) => onChange({ ...fields, name })}
            style={input}
          />
          {label('Correu (opcional)')}
          <TextInput
            testID="message-email"
            accessibilityLabel="Correu (opcional)"
            maxLength={200}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            value={fields.email}
            onChangeText={(email) => onChange({ ...fields, email })}
            style={input}
          />
          <Text style={[styles.help, { color: colors.text3 }]}>Sense correu no et podrem respondre.</Text>
          {PROBLEMS[status] ? (
            <Text
              testID="message-problem"
              accessibilityLiveRegion="polite"
              style={[styles.problem, { color: colors.text }]}
            >
              {PROBLEMS[status]}
            </Text>
          ) : null}
          <ActionButton
            testID="message-send"
            label={sending ? 'Enviant…' : 'Envia'}
            disabled={sending || !fields.text.trim()}
            onPress={onSend}
          />
          <Text style={[styles.help, { color: colors.text3 }]}>
            {
              "Amb el missatge s'hi afegeixen la versió de l'app i del sistema, la diòcesi i la publicació dels textos, per entendre millor els errors. "
            }
            <Text accessibilityRole="link" onPress={onPrivacy} style={[styles.link, { color: colors.text2 }]}>
              Política de privacitat
            </Text>
          </Text>
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  close: {
    minHeight: 44,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 17,
    fontWeight: '600',
  },
  form: {
    gap: 8,
    paddingBottom: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  input: {
    fontSize: 17,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 46,
  },
  multiline: {
    minHeight: 130,
    maxHeight: 220,
  },
  help: {
    fontSize: 14,
    lineHeight: 19,
  },
  problem: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 4,
  },
  link: {
    textDecorationLine: 'underline',
  },
  thanks: {
    gap: 14,
    paddingVertical: 8,
  },
  thanksTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});

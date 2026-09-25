import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_TEXT_SIZE_SETTING, useTheme } from '../../theme';
import Card from '../../components/Card';
import CopyButton from '../../components/CopyButton';
import EdgeToEdgeScrollView from '../../components/EdgeToEdgeScrollView';
import Icon from '../../components/Icon';
import OptionSheet from '../../components/OptionSheet';
import SegmentedControl from '../../components/SegmentedControl';
import SwitchRow from '../../components/SwitchRow';
import TextSizeControl from '../../components/TextSizeControl';
import { DarkModeChoice, THEME_SEGMENTS } from '../../components/TextSettingsSheet';
import {
  LOCATION_NOTICES,
  LocationStatus,
  LOOKING_FOR_YOU,
  OPEN_PHONE_SETTINGS,
  USE_MY_LOCATION,
} from '../../view-models/notices';
import { TechnicalData, technicalReport, versionLines } from '../../view-models/technicalData';

// Configuració: the same six options as always, in three groups. Everything comes from its
// controller (Controllers/SettingsController), which also saves the changes.

export interface SettingsValues {
  textSizeStep: number;
  darkMode: DarkModeChoice;
  useLatin: boolean;
  diocese: string;
  place: string;
  showVideos: boolean;
}

// The versions in plain sight, and behind ten touches on the approval text the technical lines
// and the logs
export type SettingsInfo = TechnicalData;

export interface SettingsScreenProps {
  values: SettingsValues | null;
  dioceses: string[];
  places: string[];
  info: SettingsInfo;
  onTextSizeChange: (step: number) => void;
  onDarkModeChange: (choice: DarkModeChoice) => void;
  onLatinChange: (enabled: boolean) => void;
  onDioceseChange: (diocese: string) => void;
  locationStatus: LocationStatus;
  onUseMyLocation: () => void;
  onOpenPhoneSettings: () => void;
  onPlaceChange: (place: string) => void;
  onShowVideosChange: (enabled: boolean) => void;
  onAskAgainForTheDatabase: () => void;
  onPrivacy: () => void;
}

const APPROVAL =
  "Text oficial de la Comissió Interdiocesana de Litúrgia de la Conferència Episcopal Tarraconense, aprovat pels bisbes de les diòcesis de parla catalana i confirmat per la Congregació per al Culte Diví i la Disciplina dels Sagraments: Prot. N. 312/15, 27 d'abril de 2016";
const TOUCHES_FOR_TECHNICAL_DATA = 10;
// Trying out a publication without waiting for the six hours between one look and the next. It
// downloads nothing by itself: it only forgets when the app last asked, so that the next opening
// asks again. The database that arrives is used the opening after that, as it always is.
const ASK_AGAIN = "Torna a preguntar en obrir l'app";

export default function SettingsScreen(props: SettingsScreenProps) {
  const theme = useTheme();
  const { colors } = theme;
  const { values, info } = props;
  const [sheet, setSheet] = useState<'diocese' | 'place' | null>(null);
  const [touches, setTouches] = useState(0);
  const technicalVisible = touches >= TOUCHES_FOR_TECHNICAL_DATA;
  // It stays saying «Fet»: whoever pressed it is on their way to closing the app, which is the
  // whole point of the button
  const [askedAgain, setAskedAgain] = useState(false);

  const divider = <View style={[styles.divider, { backgroundColor: colors.divider }]} />;
  const groupLabel = (label: string, first = false) => (
    <Text
      accessibilityRole="header"
      style={[styles.groupLabel, { color: colors.text3 }, first ? null : styles.groupSpacing]}
    >
      {label}
    </Text>
  );
  const pickerRow = (label: string, value: string, onPress: () => void, help?: string) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      accessibilityHint={help}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pickerRow,
        { minHeight: theme.touch.large },
        pressed ? { backgroundColor: colors.chipBackground } : null,
      ]}
    >
      <View style={styles.pickerLine}>
        <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>{label}</Text>
        <Text style={[styles.rowLabel, { color: colors.text2 }]}>{value}</Text>
        <Icon name="chevronDown" size={20} color={colors.text2} />
      </View>
      {help ? <Text style={[styles.help, { color: colors.text3 }]}>{help}</Text> : null}
    </Pressable>
  );

  const locationRow = () => {
    const locating = props.locationStatus === 'locating';
    const denied = props.locationStatus === 'denied';
    const notice = LOCATION_NOTICES[props.locationStatus];
    const label = locating ? LOOKING_FOR_YOU : denied ? OPEN_PHONE_SETTINGS : USE_MY_LOCATION;
    return (
      <View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={denied ? OPEN_PHONE_SETTINGS : 'Fes servir la meva ubicació per triar la diòcesi'}
          accessibilityState={{ disabled: locating, busy: locating }}
          disabled={locating}
          onPress={denied ? props.onOpenPhoneSettings : props.onUseMyLocation}
          testID="use-my-location"
          style={({ pressed }) => [
            styles.locationRow,
            { minHeight: theme.touch.min },
            pressed ? { backgroundColor: colors.chipBackground } : null,
          ]}
        >
          <Text style={[styles.locationLabel, { color: locating ? colors.text3 : colors.accentText }]}>{label}</Text>
        </Pressable>
        {notice ? <Text style={[styles.locationNotice, { color: colors.text3 }]}>{notice}</Text> : null}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.settingsBackground }]}>
      <EdgeToEdgeScrollView testID="settings-scroll">
        <View testID="settings-column" style={[styles.content, { maxWidth: theme.layout.homeMaxWidth }]}>
          {values ? (
            <View style={styles.groups}>
              {groupLabel('Lectura', true)}
              <Card radius={theme.radius.tile}>
                <View style={styles.block}>
                  <View style={styles.sizeTitle}>
                    <Text style={[styles.rowLabel, { color: colors.text }]}>Mida del text</Text>
                    <Text testID="text-size-value" style={[styles.sizeValue, { color: colors.text2 }]}>
                      {`Mida ${values.textSizeStep} de ${MAX_TEXT_SIZE_SETTING}`}
                    </Text>
                  </View>
                  <TextSizeControl step={values.textSizeStep} onChange={props.onTextSizeChange} />
                </View>
                {divider}
                <View style={styles.block}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Tema</Text>
                  <SegmentedControl
                    accessibilityLabel="Tema"
                    segments={THEME_SEGMENTS}
                    value={values.darkMode}
                    onChange={props.onDarkModeChange}
                  />
                </View>
                {divider}
                <SwitchRow
                  label="Himnes en llatí"
                  labelSize={17}
                  value={values.useLatin}
                  onValueChange={props.onLatinChange}
                  style={styles.switchRow}
                />
              </Card>

              {groupLabel('Calendari')}
              <Card radius={theme.radius.tile}>
                {pickerRow('Diòcesi', values.diocese, () => setSheet('diocese'))}
                {locationRow()}
                {divider}
                {pickerRow(
                  'Lloc',
                  values.place,
                  () => setSheet('place'),
                  'Algunes celebracions canvien segons on reses, com la dedicació de la catedral.',
                )}
              </Card>

              {groupLabel('Missa')}
              <Card radius={theme.radius.tile}>
                <SwitchRow
                  label="Vídeo de llengua de signes a l’Evangeli"
                  labelSize={17}
                  value={values.showVideos}
                  onValueChange={props.onShowVideosChange}
                  style={[styles.switchRow, styles.tallSwitchRow]}
                />
              </Card>
            </View>
          ) : null}

          <View style={styles.footer}>
            <Text
              onPress={() => setTouches(touches + 1)}
              // Nothing must look pressable here: without this, iOS greys the text on every
              // touch and gives away that there is something behind it
              suppressHighlighting={true}
              style={[styles.footerText, { color: colors.text3 }]}
            >
              {APPROVAL}
            </Text>
            <Text
              accessibilityRole="link"
              onPress={props.onPrivacy}
              style={[styles.footerText, styles.link, { color: colors.text2 }]}
            >
              Política de privacitat
            </Text>
            <Text style={[styles.footerText, { color: colors.text3 }]}>{versionLines(info)}</Text>
            {technicalVisible ? (
              <View testID="technical-data">
                {info.technical.map((line) => (
                  <Text key={line} selectable={true} style={[styles.footerText, { color: colors.text3 }]}>
                    {line}
                  </Text>
                ))}
                <CopyButton text={() => technicalReport(info)} style={styles.copy} testID="copy-technical-data" />
                <Pressable
                  testID="ask-again-for-the-database"
                  accessibilityRole="button"
                  accessibilityLabel={askedAgain ? 'Fet' : ASK_AGAIN}
                  hitSlop={{ top: 14, bottom: 14, left: 24, right: 24 }}
                  style={styles.askAgain}
                  onPress={() => {
                    setAskedAgain(true);
                    props.onAskAgainForTheDatabase();
                  }}
                >
                  <Text style={[styles.askAgainLabel, { color: colors.accentText }]}>
                    {askedAgain ? 'Fet' : ASK_AGAIN}
                  </Text>
                </Pressable>
                <Text selectable={true} style={[styles.logs, { color: colors.text3 }]}>
                  {'Logs: \n'}
                  {info.logs}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </EdgeToEdgeScrollView>

      {values ? (
        <>
          <OptionSheet
            visible={sheet === 'diocese'}
            title="Diòcesi"
            options={props.dioceses}
            value={values.diocese}
            onClose={() => setSheet(null)}
            onChoose={(diocese) => {
              setSheet(null);
              if (diocese !== values.diocese) props.onDioceseChange(diocese);
            }}
          />
          <OptionSheet
            visible={sheet === 'place'}
            title="Lloc"
            options={props.places}
            value={values.place}
            onClose={() => setSheet(null)}
            onChoose={(place) => {
              setSheet(null);
              if (place !== values.place) props.onPlaceChange(place);
            }}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  // As wide as the home at most, so that on a tablet the two screens line up
  content: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  groups: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  groupSpacing: {
    paddingTop: 8,
  },
  block: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  rowLabel: {
    fontSize: 17,
  },
  sizeTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  sizeValue: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  switchRow: {
    minHeight: 54,
    paddingHorizontal: 16,
  },
  tallSwitchRow: {
    minHeight: 60,
    paddingVertical: 8,
  },
  pickerRow: {
    justifyContent: 'center',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    gap: 3,
  },
  pickerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  help: {
    fontSize: 14,
    lineHeight: 19,
    paddingRight: 28,
  },
  locationRow: {
    justifyContent: 'center',
    paddingBottom: 10,
    paddingLeft: 16,
    paddingRight: 12,
  },
  locationLabel: {
    fontSize: 16,
  },
  locationNotice: {
    fontSize: 14,
    lineHeight: 19,
    paddingLeft: 16,
    paddingRight: 28,
    paddingBottom: 12,
  },
  footer: {
    paddingTop: 18,
    paddingHorizontal: 8,
    gap: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
  logs: {
    fontSize: 11,
    textAlign: 'left',
    marginTop: 8,
  },
  copy: {
    marginTop: 12,
  },
  askAgain: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  askAgainLabel: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import SettingsService, { DarkModeOption } from '../services/SettingsService';
import { textSizeStep } from '../theme/typography';
import * as LiturgyStore from './liturgyStore';

// The text size and the dark mode: saved where they have always been (SettingsService) and
// applied at once, without reloading the liturgy, which does not depend on them.

export type DarkModeChoice = 'Automàtic' | 'Activat' | 'Desactivat';

// What DataService does when it loads the settings (determineDarkModeIsEnabled)
export function darkModeEnabledFor(choice: string, systemScheme: string | null | undefined): boolean {
  switch (choice) {
    case DarkModeOption.On:
      return true;
    case DarkModeOption.Off:
      return false;
    case DarkModeOption.System:
      return systemScheme === 'dark';
  }
  return false;
}

export async function setTextSize(step: number): Promise<void> {
  const value = String(textSizeStep(step));
  LiturgyStore.updateSettings({ TextSize: value as any });
  await SettingsService.setSettingTextSize(value, undefined);
}

export async function setDarkMode(choice: DarkModeChoice): Promise<void> {
  LiturgyStore.updateSettings({ DarkModeEnabled: darkModeEnabledFor(choice, Appearance.getColorScheme()) });
  await SettingsService.setSettingDarkMode(choice, undefined);
}

export async function loadDarkMode(): Promise<DarkModeChoice> {
  return (await SettingsService.getSettingDarkMode()) as DarkModeChoice;
}

// The system switched between light and dark: follow it if the setting is "Automàtic"
export async function followSystemAppearance(): Promise<void> {
  if ((await loadDarkMode()) === DarkModeOption.System) {
    const enabled = darkModeEnabledFor(DarkModeOption.System, Appearance.getColorScheme());
    if (LiturgyStore.getSnapshot().settings.DarkModeEnabled !== enabled) {
      LiturgyStore.updateSettings({ DarkModeEnabled: enabled });
    }
  }
}

// For the "Aa" sheet: the current values and how to change them
export function useTextSettings() {
  const { settings } = LiturgyStore.useLiturgy();
  const [darkMode, setDarkModeState] = useState<DarkModeChoice>('Automàtic');
  useEffect(() => {
    let active = true;
    loadDarkMode().then((choice) => active && setDarkModeState(choice));
    return () => {
      active = false;
    };
  }, []);
  return {
    textSizeStep: textSizeStep(settings.TextSize),
    darkMode,
    onTextSizeChange: (step: number) => setTextSize(step),
    onDarkModeChange: (choice: DarkModeChoice) => {
      setDarkModeState(choice);
      return setDarkMode(choice);
    },
  };
}

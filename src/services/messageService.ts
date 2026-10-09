import * as Device from 'expo-device';
import SettingsService from './SettingsService';
import { appVersion, callApi, phonePlatform } from './cplApi';
import { openedDatabaseVersion } from './databaseManagerService';
import { isGooglePlayRobot } from './googlePlayRobot';
import { currentIdentifier } from './usageService';

// A message to the CPL from the app (Missatge, on the home), instead of the form of its website.
// cpl-api keeps it, and Pau and the CPL read it and answer it on the publishing website
// (cpl-cloud, src/shared/messages.ts). With it go the versions of the app and of the system, the
// diocese and the publication of the texts, which the form says before sending, to understand the
// errors; and the phone's identifier, only so that cpl-api can count how many it sends a day.

export interface MessageDraft {
  text: string;
  name: string;
  email: string;
}

export type SendOutcome = 'sent' | 'offline' | 'tooMany' | 'refused';

const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

// An email is optional, but if there is one it has to look like one: otherwise nobody can answer
export function emailLooksRight(email: string): boolean {
  const trimmed = email.trim();
  return trimmed === '' || EMAIL_PATTERN.test(trimmed);
}

export async function sendMessage(draft: MessageDraft): Promise<SendOutcome> {
  // What Google Play's robot writes is nobody's: it goes nowhere, and the robot sees the thanks as
  // anyone would, so that its report shows no error
  if (isGooglePlayRobot()) return 'sent';
  const body: Record<string, string | number> = { text: draft.text.trim() };
  if (draft.name.trim()) body.name = draft.name.trim();
  if (draft.email.trim()) body.email = draft.email.trim();
  const app = appVersion();
  const platform = phonePlatform();
  if (app) body.app = app;
  if (platform) body.platform = platform;
  if (Device.osVersion) body.os = String(Device.osVersion).slice(0, 40);
  try {
    const diocese = await SettingsService.getSettingDiocese();
    if (diocese) body.diocese = String(diocese).slice(0, 80);
  } catch {
    // Without it
  }
  const database = openedDatabaseVersion();
  if (database) body.database = database;
  const device = await currentIdentifier().catch(() => null);
  if (device) body.device = device.device;
  try {
    const response = await callApi('/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (response.ok) return 'sent';
    if (response.status === 429) return 'tooMany';
    return response.status >= 500 ? 'offline' : 'refused';
  } catch {
    return 'offline';
  }
}

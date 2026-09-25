import SettingsService, { DioceseName } from '../services/SettingsService';
import { currentPosition } from '../services/deviceLocationService';
import { resolveDiocese } from '../services/dioceseLocationService';

// Choosing the diocese from where the phone is. It is an action, never a mode: the diocese stays
// one value somebody once decided on, and this is only a shortcut for writing it. Nothing here
// runs on its own, so praying away from home never moves anybody's calendar behind their back.
//
// It is reached from two places, and both do the same thing: the welcome of a fresh install, and
// the button in Configuració.

export type AutoselectionOutcome =
  // Located, and the diocese is now saved: it was not the one they had
  | { kind: 'saved'; diocese: DioceseName }
  // Located, and they already had the diocese they are in
  | { kind: 'unchanged'; diocese: DioceseName }
  // Located, but no diocese can be named: outside the territory the app covers, or so near a
  // border that the margin of error of the position reaches the other side
  | { kind: 'nowhere' }
  // The location permission was not given
  | { kind: 'denied' }
  // No position at all: the location services are off, or the fix never arrived
  | { kind: 'failed' };

/**
 * Looks for the diocese where the phone is and saves it, unless it was already the one saved.
 *
 * It only ever writes a diocese it is sure about. Every other outcome leaves the setting exactly
 * as it was: not naming a diocese is an answer, and a worse one to fake than to admit.
 */
export async function autoselectDiocese(): Promise<AutoselectionOutcome> {
  const position = await currentPosition();
  if (position.kind === 'denied') {
    return { kind: 'denied' };
  }
  if (position.kind === 'failed') {
    return { kind: 'failed' };
  }

  const diocese = resolveDiocese(position.latitude, position.longitude, position.accuracyMeters);
  if (diocese === null) {
    return { kind: 'nowhere' };
  }

  const saved = await SettingsService.getSettingDiocese();
  if (saved === diocese) {
    return { kind: 'unchanged', diocese };
  }
  await SettingsService.setSettingDiocese(diocese, undefined);
  return { kind: 'saved', diocese };
}

/**
 * Whether this phone should be offered the diocese to be found for it.
 *
 * Only to whoever has never chosen one: what they are praying with is the default, and they have
 * no way of knowing. Whoever did choose is left alone, wherever they happen to be, and still has
 * the button in Configuració.
 */
export async function shouldOfferAutoselection(): Promise<boolean> {
  return !(await SettingsService.dioceseWasEverChosen());
}

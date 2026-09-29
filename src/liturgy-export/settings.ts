// The settings the export path prays with.
//
// `dataService.obtainCurrentSettings` reads them from the phone; here they are given, because
// the export resolves the same date for twenty dioceses in a row and there is no phone. Every
// field of `Settings` is assigned on purpose: leaving one out would silently pray with
// `undefined`, and TypeScript is what says so when a field is renamed or added.
import { Settings } from '../models/Settings';
import { getDioceseCodeFromDioceseName } from '../services/databaseDataHelper';
import { DioceseCode } from '../services/databaseEnums';

export type ExportProfile = {
  /** As the Settings screen spells it: "Barcelona", "Sant Feliu de Llobregat", "Andorra"… */
  dioceseName: string;
  /** "Diòcesi", "Catedral" or "Ciutat" — it changes the rank of a few celebrations. */
  prayingPlace?: string;
  useLatin?: boolean;
  invitationPsalmOption?: string;
  virginAntiphonOption?: string;
  optionalFestivityEnabled?: boolean;
};

export function buildSettings({
  dioceseName,
  prayingPlace = 'Diòcesi',
  useLatin = false,
  invitationPsalmOption = '94',
  virginAntiphonOption = '1',
  optionalFestivityEnabled = false,
}: ExportProfile): Settings {
  const settings = new Settings();
  settings.prayingPlace = prayingPlace;
  settings.dioceseName = dioceseName;
  settings.dioceseCode = getDioceseCodeFromDioceseName(dioceseName, prayingPlace);
  // Andorra's code is two letters already; every other diocese keeps the place off the end.
  settings.dioceseCode2Letters =
    settings.dioceseCode === DioceseCode.Andorra ? settings.dioceseCode : settings.dioceseCode.substring(0, 2);
  settings.useLatin = useLatin;
  settings.invitationPsalmOption = invitationPsalmOption;
  settings.virginAntiphonOption = virginAntiphonOption;
  settings.optionalFestivityEnabled = optionalFestivityEnabled;
  // The three that only change how the screen looks. They are set so that nothing downstream
  // reads an undefined, never because the export cares.
  settings.textSize = '3';
  settings.darkModeEnabled = false;
  return settings;
}

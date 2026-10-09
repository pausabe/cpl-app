import { LiturgySpecificDayInformation, SpecialCelebrationTypeEnum } from '../../models/LiturgyDayInformation';
import { NO_OPTIONAL_MEMORIALS, OptionalMemorials } from '../../models/OptionalMemorials';
import { Settings } from '../../models/Settings';
import { CelebrationType } from '../databaseEnums';
import * as DatabaseDataService from '../databaseDataService';
import * as DatabaseHelper from '../databaseDataHelper';
import SaintsMemories from '../../models/liturgy-masters/SaintsMemories';
import { obtainSaintsMemoriesOrSolemnitiesMasterIdentifier } from './liturgyMastersService';

// The optional memorials of a day in the place of the settings, and which one is prayed. On a day
// with more than one the home offers them all (the sheet «Què celebres avui?»); with one, the switch
// it always had.

// The days whose memorial is optional and is looked for by its date: not a Sunday, not a day with
// texts of its own, and not one of the memorials of variable date (the Immaculate Heart…), which
// have their row
function offersOptionalMemorials(day: LiturgySpecificDayInformation, settings: Settings): boolean {
  return (
    day.celebrationType === CelebrationType.OptionalMemory &&
    day.date.getDay() !== 0 &&
    day.specialCelebration.specialCelebrationType !== SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
    obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(day, settings) === -1
  );
}

export async function obtainOptionalMemorials(
  day: LiturgySpecificDayInformation,
  settings: Settings,
): Promise<OptionalMemorials> {
  if (!offersOptionalMemorials(day, settings)) return NO_OPTIONAL_MEMORIALS;
  const dateString = DatabaseHelper.getDateShortDatabaseCode(day.date, day.movedDay.originDateShortDatabaseCode);
  const rows = await DatabaseDataService.obtainOptionalMemorialsAsync(
    dateString,
    settings.dioceseName,
    settings.prayingPlace,
    day.genericLiturgyTime,
  );
  const options = rows.map((row) => ({
    id: Number(row.id),
    title: String(row.nomMemoria ?? ''),
    description: String(row.infoMemoria ?? ''),
  }));
  if (!settings.optionalFestivityEnabled) return { options, chosen: null };
  if (options.some((option) => option.id === settings.optionalMemorialId)) {
    return { options, chosen: settings.optionalMemorialId as number };
  }
  // Turned on with no memorial said (the switch, or a choice saved before there was a choice): the
  // one the app has always offered, the row the hours have then
  const offered = await DatabaseDataService.obtainSolemnitiesAndMemoriesAsync(
    SaintsMemories.masterName,
    dateString,
    settings.dioceseCode,
    settings.prayingPlace,
    settings.dioceseName,
    day.genericLiturgyTime,
  );
  return { options, chosen: offered ? Number(offered.id) : null };
}

// --- The memorial chosen, as it is saved -------------------------------------------------------
//
// One day only, the day it was chosen: "9:9:2026" (the day, the month from 0 and the year), as the
// switch has always saved it, and the row of santsMemories after it when one of several was chosen,
// "9:9:2026:382". The weekday, or the switch turned off, is "none". A date alone still means the
// memorial the app used to offer.
export const NOT_CELEBRATED = 'none';

export function optionalMemorialToStore(date: Date, memorialId: number | null = null): string {
  const day = `${date.getDate()}:${date.getMonth()}:${date.getFullYear()}`;
  return memorialId === null ? day : `${day}:${memorialId}`;
}

export interface StoredOptionalMemorial {
  enabled: boolean;
  memorialId?: number;
}

export function readStoredOptionalMemorial(stored: string | null | undefined, date: Date): StoredOptionalMemorial {
  if (!stored || stored === NOT_CELEBRATED) return { enabled: false };
  const parts = stored.split(':');
  if (parts.length !== 3 && parts.length !== 4) return { enabled: false };
  const [day, month, year] = parts.map((part) => parseInt(part, 10));
  const enabled = day === date.getDate() && month === date.getMonth() && year === date.getFullYear();
  if (!enabled) return { enabled: false };
  const memorialId = parts.length === 4 ? parseInt(parts[3], 10) : NaN;
  return Number.isInteger(memorialId) && memorialId > 0 ? { enabled, memorialId } : { enabled };
}

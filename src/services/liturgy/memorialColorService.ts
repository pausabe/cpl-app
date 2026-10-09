import { executeQueryAsync, openedDatabaseVersion } from '../databaseManagerService';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { CelebrationType } from '../databaseEnums';
import * as Logger from '../../utils/logger';

// The colour of an optional memorial that is celebrated.
//
// The database gives one colour a day (anyliturgic, Color): on a day of optional memorials, the
// weekday's, green in Ordinary Time, even when the memorial prayed is a martyr's. The databases
// cpl-cloud's process X writes also say the colour litcal gives the celebration of each row of
// santsMemories, in the season of the row: the table _celebration_colors (calendar/src/colors.ts in
// cpl-cloud). A row of a season where the memorial is at most a commemoration (Lent, the last days of
// Advent) is not there, and neither is the table in a database of before: then the day keeps its
// colour, as it always had.

let loaded: { version: number | null; colors: Promise<Map<number, string>> } | undefined;

// The colours of the database that is open, by row of santsMemories; none if it does not have them
function memorialColors(): Promise<Map<number, string>> {
  const version = openedDatabaseVersion();
  if (!loaded || loaded.version !== version) loaded = { version, colors: readMemorialColors() };
  return loaded.colors;
}

async function readMemorialColors(): Promise<Map<number, string>> {
  try {
    const tables = await executeQueryAsync(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = '_celebration_colors'",
    );
    if (tables.length === 0) return new Map();
    const rows = await executeQueryAsync('SELECT sants_memories_id, color FROM _celebration_colors');
    return new Map(
      rows.map((row: { sants_memories_id: number; color: string }) => [
        Number(row.sants_memories_id),
        String(row.color),
      ]),
    );
  } catch (error) {
    // A colour is not worth a day without its liturgy: the day keeps its own
    Logger.logError(Logger.LogKeys.DatabaseDataService, 'readMemorialColors', error);
    return new Map();
  }
}

// The colour of the optional memorial celebrated on a day, as the database writes colours (R, V, M,
// B), or null. The memorial is the row of santsMemories whose texts the day has (that of the liturgy
// masters), and it only counts on a day of optional memorials or of Saint Mary on Saturday when the
// memorial is celebrated. Whether the card shows it celebrated, the card says (view-models/dayCard).
export async function obtainCelebratedMemorialColor(
  day: LiturgySpecificDayInformation,
  settings: Settings,
  memorialRow: number | undefined,
): Promise<string | null> {
  const optional =
    day.celebrationType === CelebrationType.OptionalMemory ||
    day.celebrationType === CelebrationType.OptionalVirginMemory;
  if (!optional || !settings.optionalFestivityEnabled || memorialRow === undefined || memorialRow === null) {
    return null;
  }
  return (await memorialColors()).get(Number(memorialRow)) ?? null;
}

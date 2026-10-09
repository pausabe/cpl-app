import HoursLiturgy from '../../models/hours-liturgy/HoursLiturgy';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import { DiesIraeHymn } from '../../models/liturgy-masters/Various';
import { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { CelebrationType } from '../databaseEnums';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';

// «Durant aquesta setmana, els dies de fèria, hom pot emprar aquests himnes» (Litúrgia de les Hores,
// vol. IV, p. 471): in the last week of Ordinary Time, the Dies iræ may be said instead of the hymn of
// the day, a third of it at each hour. On the weekdays with no celebration (an optional memorial not
// celebrated is one), at the Office of Readings and Lauds from Monday to Saturday, and at Vespers from
// Monday to Friday: on Saturday evening they are the first Vespers of the first Sunday of Advent. Only
// where the hour says the hymn of the psalter: Vespers with a hymn of tomorrow's celebration keep it.
// Each hour that offers it gets it in the language of the hymns (Configuració → Himnes en llatí).
export function offerDiesIrae(
  hoursLiturgy: HoursLiturgy,
  liturgyMasters: LiturgyMasters,
  today: LiturgySpecificDayInformation,
  settings: Settings,
  vespersHaveTheirOwnHymn: boolean,
): void {
  if (!isWeekdayOfTheLastWeek(today, settings)) {
    return;
  }
  const { office, laudes, vespers } = liturgyMasters.various.diesIrae;
  const inLanguage = (hymn: DiesIraeHymn | null) => (hymn ? (settings.useLatin ? hymn.latin : hymn.catalan) : null);

  const forOffice = inLanguage(office);
  if (forOffice) hoursLiturgy.office.diesIraeAnthem = forOffice;
  const forLaudes = inLanguage(laudes);
  if (forLaudes) hoursLiturgy.laudes.diesIraeAnthem = forLaudes;
  const forVespers = inLanguage(vespers);
  if (forVespers && today.dayOfTheWeek <= 5 && !vespersHaveTheirOwnHymn) {
    hoursLiturgy.vespers.diesIraeAnthem = forVespers;
  }
}

function isWeekdayOfTheLastWeek(today: LiturgySpecificDayInformation, settings: Settings): boolean {
  const optionalNotCelebrated =
    (today.celebrationType === CelebrationType.OptionalMemory ||
      today.celebrationType === CelebrationType.OptionalVirginMemory) &&
    !settings.optionalFestivityEnabled;
  return (
    today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
    Number(today.week) === 34 &&
    today.dayOfTheWeek >= 1 &&
    today.dayOfTheWeek <= 6 &&
    (today.celebrationType === CelebrationType.Fair || optionalNotCelebrated)
  );
}

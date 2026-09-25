// Today and tomorrow, as the liturgy understands them: the season, the week of the psalter,
// the rank of what is celebrated, and the two flags that no table carries.
//
// It used to live inside `dataService`, private, and the app was its only caller. The export
// path to saints-app needs the very same day — resolved for a diocese it is given rather than
// for the one stored on the phone — and a second copy of this would be a copy that drifts.
import * as CelebrationIdentifierService from '../celebrationIdentifierService';
import { Celebration } from '../celebrationIdentifierService';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import * as DatabaseDataService from '../databaseDataService';
import * as SpecialCelebrationService from '../specialCelebrationService';
import LiturgyDayInformation, { LiturgySpecificDayInformation } from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';

export async function obtainLiturgyDayInformation(date: Date, settings: Settings): Promise<LiturgyDayInformation> {
  const liturgyDayInformation = new LiturgyDayInformation();
  liturgyDayInformation.today = await obtainOneDay(date, settings);
  const tomorrowDate = new Date(date);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  liturgyDayInformation.tomorrow = await obtainOneDay(tomorrowDate, settings);
  return liturgyDayInformation;
}

async function obtainOneDay(date: Date, settings: Settings): Promise<LiturgySpecificDayInformation> {
  const day = await DatabaseDataService.obtainLiturgySpecificDayInformation(date, settings);
  day.specialCelebration = SpecialCelebrationService.obtainSpecialCelebration(day, settings);
  day.isSpecialChristmas = isSpecialChristmas(day);
  return day;
}

// The days between 17 December and the Baptism of the Lord that take their office from the
// day of the month instead of from the psalter. The Holy Family is inside the range by date
// and outside it by rank, so it is named out.
const DECEMBER_DAYS = [17, 18, 19, 20, 21, 22, 23, 24, 29, 30, 31];
const JANUARY_DAYS = [2, 3, 4, 5, 7, 8, 9, 10, 11, 12];

function isSpecialChristmas(day: LiturgySpecificDayInformation): boolean {
  if (day.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) return false;
  if (CelebrationIdentifierService.checkCelebration(Celebration.SacredFamily, day)) return false;
  if (day.date.getMonth() === 11) return DECEMBER_DAYS.includes(day.date.getDate());
  if (day.date.getMonth() === 0) return JANUARY_DAYS.includes(day.date.getDate());
  return false;
}

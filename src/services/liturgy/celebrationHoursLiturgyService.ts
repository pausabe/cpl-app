import HoursLiturgy from '../../models/hours-liturgy/HoursLiturgy';
import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import LiturgyDayInformation, {
  LiturgySpecificDayInformation,
  SpecialCelebrationTypeEnum,
} from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { CelebrationType, YearType } from '../databaseEnums';
import Vespers from '../../models/hours-liturgy/Vespers';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import SaintsSolemnities from '../../models/liturgy-masters/SaintsSolemnities';
import SaintsMemories from '../../models/liturgy-masters/SaintsMemories';
import SpecialDaysParts from '../../models/liturgy-masters/SpecialDaysParts';
import EasterSunday from '../../models/liturgy-masters/EasterSunday';
import SolemnityAndFestivityParts from '../../models/liturgy-masters/SolemnityAndFestivityParts';
import { StringManagement } from '../../utils/StringManagement';
import PalmSundayParts from '../../models/liturgy-masters/PalmSundayParts';
import CommonPartsOfHolyWeek from '../../models/liturgy-masters/CommonPartsOfHolyWeek';
import PartsOfEasterTriduum from '../../models/liturgy-masters/PartsOfEasterTriduum';
import CommonAdventAndChristmasParts from '../../models/liturgy-masters/CommonAdventAndChristmasParts';
import AdventWeekParts from '../../models/liturgy-masters/AdventWeekParts';
import AdventSundayParts from '../../models/liturgy-masters/AdventSundayParts';

export function obtainCelebrationHoursLiturgy(
  todayLiturgyMasters: LiturgyMasters,
  tomorrowLiturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgyDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy: HoursLiturgy = buildHoursLiturgy(todayLiturgyMasters, liturgyDayInformation.Today, settings);
  hoursLiturgy.TomorrowCelebrationInformation = buildHoursLiturgy(
    tomorrowLiturgyMasters,
    liturgyDayInformation.Tomorrow,
    settings,
  ).TodayCelebrationInformation;
  hoursLiturgy.VespersOptions.TomorrowFirstVespersWithCelebration = getFirstVespersWithCelebration(
    todayLiturgyMasters,
    liturgyDayInformation.Tomorrow,
    settings,
  );
  return hoursLiturgy;
}

function buildHoursLiturgy(
  liturgyMasters: LiturgyMasters,
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
) {
  let hoursLiturgy: HoursLiturgy;

  if (
    liturgySpecificDayInformation.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay
  ) {
    hoursLiturgy = getSpecialDayHoursLiturgy(liturgyMasters.SpecialDaysParts, settings);
  } else if (
    liturgySpecificDayInformation.SpecialCelebration.SpecialCelebrationType ===
    SpecialCelebrationTypeEnum.SolemnityAndFestivity
  ) {
    hoursLiturgy = getSolemnityAndFestivityHoursLiturgy(
      liturgyMasters.SolemnityAndFestivityParts,
      liturgySpecificDayInformation,
      settings,
    );
  } else if (liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
    hoursLiturgy = getEasterSundayHoursLiturgy(liturgyMasters.EasterSunday, settings);
    hoursLiturgy.Office.TeDeumInformation.Anthem = settings.UseLatin
      ? liturgyMasters.Various.TeDeumLatinAnthem
      : liturgyMasters.Various.TeDeumCatalanAnthem;
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalChant =
      liturgyMasters.Various.VespersEvangelicalChant;
  } else {
    hoursLiturgy = getNormalCelebrationHoursLiturgy(liturgyMasters, liturgySpecificDayInformation, settings);
  }

  return hoursLiturgy;
}

function getNormalCelebrationHoursLiturgy(
  liturgyMasters: LiturgyMasters,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();
  switch (liturgyDayInformation.CelebrationType) {
    case CelebrationType.Solemnity:
      hoursLiturgy = getSaintsSolemnitiesHoursLiturgy(liturgyMasters.SaintsSolemnities, settings);
      break;
    case CelebrationType.Festivity:
      if (liturgyDayInformation.Date.getDay() !== 0) {
        hoursLiturgy = getSaintsSolemnitiesHoursLiturgy(liturgyMasters.SaintsSolemnities, settings);
      }
      break;
    case CelebrationType.OptionalMemory:
    case CelebrationType.OptionalVirginMemory:
      if (liturgyDayInformation.Date.getDay() !== 0) {
        const saintsMemoriesHoursLiturgy = getSaintsMemoriesHoursLiturgy(
          liturgyMasters.SaintsMemories,
          liturgyDayInformation,
          settings,
        );
        if (settings.OptionalFestivityEnabled) {
          hoursLiturgy = saintsMemoriesHoursLiturgy;
        } else {
          hoursLiturgy.TodayCelebrationInformation = saintsMemoriesHoursLiturgy.TodayCelebrationInformation;
        }
      }
      break;
    case CelebrationType.Memory:
      if (liturgyDayInformation.Date.getDay() !== 0) {
        hoursLiturgy = getSaintsMemoriesHoursLiturgy(liturgyMasters.SaintsMemories, liturgyDayInformation, settings);
      }
      break;
  }
  return hoursLiturgy;
}

function getFirstVespersWithCelebration(
  liturgyMasters: LiturgyMasters,
  tomorrowLiturgyInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  if (
    tomorrowLiturgyInformation.SpecialCelebration.SpecialCelebrationType ===
    SpecialCelebrationTypeEnum.SolemnityAndFestivity
  ) {
    return getSolemnityAndFestivityFirstVespersOfTomorrow(
      liturgyMasters.SolemnityAndFestivityWhenFirstVespersParts,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  if (tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) {
    return getPalmSundayFistVespersOfTomorrow(
      liturgyMasters.PalmSundayParts,
      liturgyMasters.CommonPartsOfHolyWeek,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  if (
    tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum &&
    tomorrowLiturgyInformation.Date.getDay() === 5
  ) {
    return getEasterTriduumFistVespersOfTomorrow(liturgyMasters.PartsOfEasterTriduum, settings);
  }
  if (
    tomorrowLiturgyInformation.Date.getDay() === 0 &&
    tomorrowLiturgyInformation.Week === '1' &&
    tomorrowLiturgyInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
  ) {
    return getAdventSundayFirstVespersOfTomorrow(
      liturgyMasters.AdventFirstVespersOfSundayParts,
      liturgyMasters.AdventWeekParts,
      liturgyMasters.CommonAdventAndChristmasParts,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  if (tomorrowLiturgyInformation.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay) {
    return getSpecialDaysFirstVespersOfTomorrow(liturgyMasters.SpecialDaysParts, tomorrowLiturgyInformation, settings);
  }
  if (
    tomorrowLiturgyInformation.CelebrationType === CelebrationType.Solemnity ||
    tomorrowLiturgyInformation.CelebrationType === CelebrationType.Festivity
  ) {
    return getSaintsSolemnitiesFirstVespersOfTomorrow(
      liturgyMasters.SaintsSolemnitiesWhenFirstsVespersParts,
      tomorrowLiturgyInformation,
      settings,
    );
  }
  return new Vespers();
}

function getEasterSundayHoursLiturgy(easterSunday: EasterSunday, settings: Settings): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.TodayCelebrationInformation.Title = 'Diumenge de Pasqua';

  hoursLiturgy.Invitation.InvitationAntiphon = easterSunday.InvitationAntiphon;

  hoursLiturgy.Office.FirstReading = easterSunday.OfficeFirstReading;
  hoursLiturgy.Office.FirstPsalm.Antiphon = easterSunday.OfficeFirstPsalm.Antiphon;
  hoursLiturgy.Office.FirstPsalm.Title = easterSunday.OfficeFirstPsalm.Title;
  hoursLiturgy.Office.FirstPsalm.Psalm = easterSunday.OfficeFirstPsalm.Psalm;
  hoursLiturgy.Office.FirstPsalm.Prayer = easterSunday.OfficeFirstPsalm.Prayer;
  hoursLiturgy.Office.SecondReading = easterSunday.OfficeSecondReading;
  hoursLiturgy.Office.SecondPsalm.Antiphon = easterSunday.OfficeSecondPsalm.Antiphon;
  hoursLiturgy.Office.SecondPsalm.Title = easterSunday.OfficeSecondPsalm.Title;
  hoursLiturgy.Office.SecondPsalm.Psalm = easterSunday.OfficeSecondPsalm.Psalm;
  hoursLiturgy.Office.SecondPsalm.Prayer = easterSunday.OfficeSecondPsalm.Prayer;
  hoursLiturgy.Office.ThirdReading = easterSunday.OfficeThirdReading;
  hoursLiturgy.Office.ThirdPsalm.Antiphon = easterSunday.OfficeThirdPsalm.Antiphon;
  hoursLiturgy.Office.ThirdPsalm.Title = easterSunday.OfficeThirdPsalm.Title;
  hoursLiturgy.Office.ThirdPsalm.Psalm = easterSunday.OfficeThirdPsalm.Psalm;
  hoursLiturgy.Office.ThirdPsalm.Prayer = easterSunday.OfficeThirdPsalm.Prayer;
  hoursLiturgy.Office.FourthReading = easterSunday.OfficeFourthReading;
  hoursLiturgy.Office.FourthPsalm.Antiphon = easterSunday.OfficeFourthPsalm.Antiphon;
  hoursLiturgy.Office.FourthPsalm.Title = easterSunday.OfficeFourthPsalm.Title;
  hoursLiturgy.Office.FourthPsalm.Psalm = easterSunday.OfficeFourthPsalm.Psalm;
  hoursLiturgy.Office.FourthPsalm.Prayer = easterSunday.OfficeFourthPsalm.Prayer;
  hoursLiturgy.Office.TeDeumInformation.Enabled = true;
  hoursLiturgy.Office.FinalPrayer = easterSunday.OfficeFinalPrayer;

  hoursLiturgy.Laudes.Anthem = settings.UseLatin ? easterSunday.LaudesLatinAnthem : easterSunday.LaudesCatalanAnthem;
  hoursLiturgy.Laudes.FirstPsalm = easterSunday.LaudesFirstPsalm;
  hoursLiturgy.Laudes.SecondPsalm = easterSunday.LaudesSecondPsalm;
  hoursLiturgy.Laudes.ThirdPsalm = easterSunday.LaudesThirdPsalm;
  hoursLiturgy.Laudes.ShortReading = easterSunday.LaudesShortReading;
  hoursLiturgy.Laudes.ShortResponsory = easterSunday.LaudesShortResponsory;
  hoursLiturgy.Laudes.EvangelicalAntiphon = easterSunday.LaudesEvangelicalAntiphon;
  hoursLiturgy.Laudes.Prayers = easterSunday.LaudesPrayers;
  hoursLiturgy.Laudes.FinalPrayer = easterSunday.LaudesFinalPrayer;

  hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin
    ? easterSunday.ThirdHourParts.LatinAnthem
    : easterSunday.ThirdHourParts.CatalanAnthem;
  hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = easterSunday.ThirdHourParts.Antiphon;
  hoursLiturgy.Hours.ThirdHour.FirstPsalm = easterSunday.HourPrayerFirstPsalm;
  hoursLiturgy.Hours.ThirdHour.SecondPsalm = easterSunday.HourPrayerSecondPsalm;
  hoursLiturgy.Hours.ThirdHour.ThirdPsalm = easterSunday.HourPrayerThirdPsalm;
  hoursLiturgy.Hours.ThirdHour.ShortReading = easterSunday.ThirdHourParts.ShortReading;
  hoursLiturgy.Hours.ThirdHour.Responsory = easterSunday.ThirdHourParts.Responsory;
  hoursLiturgy.Hours.ThirdHour.FinalPrayer = easterSunday.ThirdHourParts.FinalPrayer;
  hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin
    ? easterSunday.SixthHourParts.LatinAnthem
    : easterSunday.SixthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.SixthHour.UniqueAntiphon = easterSunday.SixthHourParts.Antiphon;
  hoursLiturgy.Hours.SixthHour.FirstPsalm = easterSunday.HourPrayerFirstPsalm;
  hoursLiturgy.Hours.SixthHour.SecondPsalm = easterSunday.HourPrayerSecondPsalm;
  hoursLiturgy.Hours.SixthHour.ThirdPsalm = easterSunday.HourPrayerThirdPsalm;
  hoursLiturgy.Hours.SixthHour.ShortReading = easterSunday.SixthHourParts.ShortReading;
  hoursLiturgy.Hours.SixthHour.Responsory = easterSunday.SixthHourParts.Responsory;
  hoursLiturgy.Hours.SixthHour.FinalPrayer = easterSunday.SixthHourParts.FinalPrayer;
  hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin
    ? easterSunday.NinthHourParts.LatinAnthem
    : easterSunday.NinthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.NinthHour.UniqueAntiphon = easterSunday.NinthHourParts.Antiphon;
  hoursLiturgy.Hours.NinthHour.FirstPsalm = easterSunday.HourPrayerFirstPsalm;
  hoursLiturgy.Hours.NinthHour.SecondPsalm = easterSunday.HourPrayerSecondPsalm;
  hoursLiturgy.Hours.NinthHour.ThirdPsalm = easterSunday.HourPrayerThirdPsalm;
  hoursLiturgy.Hours.NinthHour.ShortReading = easterSunday.NinthHourParts.ShortReading;
  hoursLiturgy.Hours.NinthHour.Responsory = easterSunday.NinthHourParts.Responsory;
  hoursLiturgy.Hours.NinthHour.FinalPrayer = easterSunday.NinthHourParts.FinalPrayer;

  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin
    ? easterSunday.VespersLatinAnthem
    : easterSunday.VespersCatalanAnthem;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = easterSunday.VespersFirstPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = easterSunday.VespersSecondPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = easterSunday.VespersThirdPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = easterSunday.VespersShortReading;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = easterSunday.VespersShortResponsory;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
    easterSunday.VespersEvangelicalAntiphon;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = easterSunday.VespersPrayers;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = easterSunday.VespersFinalPrayer;

  return hoursLiturgy;
}

function getSolemnityAndFestivityHoursLiturgy(
  solemnityAndFestivityParts: SolemnityAndFestivityParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.TodayCelebrationInformation = solemnityAndFestivityParts.Celebration;

  hoursLiturgy.Invitation.InvitationAntiphon = solemnityAndFestivityParts.InvitationAntiphon;

  hoursLiturgy.Office.Anthem = settings.UseLatin
    ? solemnityAndFestivityParts.OfficeLatinAnthem
    : solemnityAndFestivityParts.OfficeCatalanAnthem;
  hoursLiturgy.Office.FirstPsalm = solemnityAndFestivityParts.OfficeFirstPsalm;
  hoursLiturgy.Office.SecondPsalm = solemnityAndFestivityParts.OfficeSecondPsalm;
  hoursLiturgy.Office.ThirdPsalm = solemnityAndFestivityParts.OfficeThirdPsalm;
  hoursLiturgy.Office.Responsory = solemnityAndFestivityParts.OfficeResponsory;
  hoursLiturgy.Office.FirstReading = solemnityAndFestivityParts.OfficeFirstReading;
  hoursLiturgy.Office.SecondReading = solemnityAndFestivityParts.OfficeSecondReading;
  hoursLiturgy.Office.TeDeumInformation.Enabled = true;
  hoursLiturgy.Office.FinalPrayer = solemnityAndFestivityParts.OfficeFinalPrayer;

  hoursLiturgy.Laudes.Anthem = settings.UseLatin
    ? solemnityAndFestivityParts.LaudesLatinAnthem
    : solemnityAndFestivityParts.LaudesCatalanAnthem;
  hoursLiturgy.Laudes.FirstPsalm.Antiphon = solemnityAndFestivityParts.LaudesFirstAntiphon;
  hoursLiturgy.Laudes.SecondPsalm.Antiphon = solemnityAndFestivityParts.LaudesSecondAntiphon;
  hoursLiturgy.Laudes.ThirdPsalm.Antiphon = solemnityAndFestivityParts.LaudesThirdAntiphon;
  hoursLiturgy.Laudes.ShortReading = solemnityAndFestivityParts.LaudesShortReading;
  hoursLiturgy.Laudes.ShortResponsory = solemnityAndFestivityParts.LaudesShortResponsory;
  switch (liturgyDayInformation.YearType) {
    case YearType.A:
      hoursLiturgy.Laudes.EvangelicalAntiphon = solemnityAndFestivityParts.LaudesEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      hoursLiturgy.Laudes.EvangelicalAntiphon = solemnityAndFestivityParts.LaudesEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      hoursLiturgy.Laudes.EvangelicalAntiphon = solemnityAndFestivityParts.LaudesEvangelicalAntiphonYearC;
      break;
  }

  hoursLiturgy.Laudes.Prayers = solemnityAndFestivityParts.LaudesPrayers;
  hoursLiturgy.Laudes.FinalPrayer = solemnityAndFestivityParts.LaudesFinalPrayer;

  hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin
    ? solemnityAndFestivityParts.ThirdHourParts.LatinAnthem
    : solemnityAndFestivityParts.ThirdHourParts.CatalanAnthem;
  hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = solemnityAndFestivityParts.ThirdHourParts.Antiphon;
  hoursLiturgy.Hours.ThirdHour.FirstPsalm = solemnityAndFestivityParts.HoursFirstPsalm;
  hoursLiturgy.Hours.ThirdHour.SecondPsalm = solemnityAndFestivityParts.HoursSecondPsalm;
  hoursLiturgy.Hours.ThirdHour.ThirdPsalm = solemnityAndFestivityParts.HoursThirdPsalm;
  hoursLiturgy.Hours.ThirdHour.ShortReading = solemnityAndFestivityParts.ThirdHourParts.ShortReading;
  hoursLiturgy.Hours.ThirdHour.Responsory = solemnityAndFestivityParts.ThirdHourParts.Responsory;
  hoursLiturgy.Hours.ThirdHour.FinalPrayer = solemnityAndFestivityParts.ThirdHourParts.FinalPrayer;
  hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin
    ? solemnityAndFestivityParts.SixthHourParts.LatinAnthem
    : solemnityAndFestivityParts.SixthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.SixthHour.UniqueAntiphon = solemnityAndFestivityParts.SixthHourParts.Antiphon;
  hoursLiturgy.Hours.SixthHour.FirstPsalm = solemnityAndFestivityParts.HoursFirstPsalm;
  hoursLiturgy.Hours.SixthHour.SecondPsalm = solemnityAndFestivityParts.HoursSecondPsalm;
  hoursLiturgy.Hours.SixthHour.ThirdPsalm = solemnityAndFestivityParts.HoursThirdPsalm;
  hoursLiturgy.Hours.SixthHour.ShortReading = solemnityAndFestivityParts.SixthHourParts.ShortReading;
  hoursLiturgy.Hours.SixthHour.Responsory = solemnityAndFestivityParts.SixthHourParts.Responsory;
  hoursLiturgy.Hours.SixthHour.FinalPrayer = solemnityAndFestivityParts.SixthHourParts.FinalPrayer;
  hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin
    ? solemnityAndFestivityParts.NinthHourParts.LatinAnthem
    : solemnityAndFestivityParts.NinthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.NinthHour.UniqueAntiphon = solemnityAndFestivityParts.NinthHourParts.Antiphon;
  hoursLiturgy.Hours.NinthHour.FirstPsalm = solemnityAndFestivityParts.HoursFirstPsalm;
  hoursLiturgy.Hours.NinthHour.SecondPsalm = solemnityAndFestivityParts.HoursSecondPsalm;
  hoursLiturgy.Hours.NinthHour.ThirdPsalm = solemnityAndFestivityParts.HoursThirdPsalm;
  hoursLiturgy.Hours.NinthHour.ShortReading = solemnityAndFestivityParts.NinthHourParts.ShortReading;
  hoursLiturgy.Hours.NinthHour.Responsory = solemnityAndFestivityParts.NinthHourParts.Responsory;
  hoursLiturgy.Hours.NinthHour.FinalPrayer = solemnityAndFestivityParts.NinthHourParts.FinalPrayer;

  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin
    ? solemnityAndFestivityParts.SecondVespersLatinAnthem
    : solemnityAndFestivityParts.SecondVespersCatalanAnthem;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm =
    solemnityAndFestivityParts.SecondVespersFirstPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm =
    solemnityAndFestivityParts.SecondVespersSecondPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm =
    solemnityAndFestivityParts.SecondVespersThirdPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading =
    solemnityAndFestivityParts.SecondVespersShortReading;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory =
    solemnityAndFestivityParts.SecondVespersShortResponsory;
  switch (liturgyDayInformation.YearType) {
    case YearType.A:
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
        solemnityAndFestivityParts.SecondVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
        solemnityAndFestivityParts.SecondVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
        solemnityAndFestivityParts.SecondVespersEvangelicalAntiphonYearC;
      break;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers =
    solemnityAndFestivityParts.SecondVespersPrayers;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer =
    solemnityAndFestivityParts.SecondVespersFinalPrayer;

  return hoursLiturgy;
}

function getSpecialDayHoursLiturgy(specialDaysParts: SpecialDaysParts, settings: Settings): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.TodayCelebrationInformation = specialDaysParts.Celebration;

  hoursLiturgy.Invitation.InvitationAntiphon = specialDaysParts.InvitationAntiphon;

  hoursLiturgy.Office.Anthem = settings.UseLatin
    ? specialDaysParts.OfficeLatinAnthem
    : specialDaysParts.OfficeCatalanAnthem;
  hoursLiturgy.Office.FirstPsalm = specialDaysParts.OfficeFirstPsalm;
  hoursLiturgy.Office.SecondPsalm = specialDaysParts.OfficeSecondPsalm;
  hoursLiturgy.Office.ThirdPsalm = specialDaysParts.OfficeThirdPsalm;
  hoursLiturgy.Office.Responsory = specialDaysParts.OfficeResponsory;
  hoursLiturgy.Office.FirstReading = specialDaysParts.OfficeFirstReading;
  hoursLiturgy.Office.SecondReading = specialDaysParts.OfficeSecondReading;
  hoursLiturgy.Office.TeDeumInformation.Enabled = true;
  hoursLiturgy.Office.FinalPrayer = specialDaysParts.OfficeFinalPrayer;

  hoursLiturgy.Laudes.Anthem = settings.UseLatin
    ? specialDaysParts.LaudesLatinAnthem
    : specialDaysParts.LaudesCatalanAnthem;
  hoursLiturgy.Laudes.FirstPsalm = specialDaysParts.LaudesFirstPsalm;
  hoursLiturgy.Laudes.SecondPsalm = specialDaysParts.LaudesSecondPsalm;
  hoursLiturgy.Laudes.ThirdPsalm = specialDaysParts.LaudesThirdPsalm;
  hoursLiturgy.Laudes.ShortReading = specialDaysParts.LaudesShortReading;
  hoursLiturgy.Laudes.ShortResponsory = specialDaysParts.LaudesShortResponsory;
  hoursLiturgy.Laudes.EvangelicalAntiphon = specialDaysParts.LaudesEvangelicalAntiphon;
  hoursLiturgy.Laudes.Prayers = specialDaysParts.LaudesPrayers;
  hoursLiturgy.Laudes.FinalPrayer = specialDaysParts.LaudesFinalPrayer;

  hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin
    ? specialDaysParts.ThirdHourParts.LatinAnthem
    : specialDaysParts.ThirdHourParts.CatalanAnthem;
  hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = specialDaysParts.ThirdHourParts.Antiphon;
  hoursLiturgy.Hours.ThirdHour.FirstPsalm = specialDaysParts.HoursFirstPsalm;
  hoursLiturgy.Hours.ThirdHour.SecondPsalm = specialDaysParts.HoursSecondPsalm;
  hoursLiturgy.Hours.ThirdHour.ThirdPsalm = specialDaysParts.HoursThirdPsalm;
  hoursLiturgy.Hours.ThirdHour.ShortReading = specialDaysParts.ThirdHourParts.ShortReading;
  hoursLiturgy.Hours.ThirdHour.Responsory = specialDaysParts.ThirdHourParts.Responsory;
  hoursLiturgy.Hours.ThirdHour.FinalPrayer = specialDaysParts.ThirdHourParts.FinalPrayer;
  hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin
    ? specialDaysParts.SixthHourParts.LatinAnthem
    : specialDaysParts.SixthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.SixthHour.UniqueAntiphon = specialDaysParts.SixthHourParts.Antiphon;
  hoursLiturgy.Hours.SixthHour.FirstPsalm = specialDaysParts.HoursFirstPsalm;
  hoursLiturgy.Hours.SixthHour.SecondPsalm = specialDaysParts.HoursSecondPsalm;
  hoursLiturgy.Hours.SixthHour.ThirdPsalm = specialDaysParts.HoursThirdPsalm;
  hoursLiturgy.Hours.SixthHour.ShortReading = specialDaysParts.SixthHourParts.ShortReading;
  hoursLiturgy.Hours.SixthHour.Responsory = specialDaysParts.SixthHourParts.Responsory;
  hoursLiturgy.Hours.SixthHour.FinalPrayer = specialDaysParts.SixthHourParts.FinalPrayer;
  hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin
    ? specialDaysParts.NinthHourParts.LatinAnthem
    : specialDaysParts.NinthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.NinthHour.UniqueAntiphon = specialDaysParts.NinthHourParts.Antiphon;
  hoursLiturgy.Hours.NinthHour.FirstPsalm = specialDaysParts.HoursFirstPsalm;
  hoursLiturgy.Hours.NinthHour.SecondPsalm = specialDaysParts.HoursSecondPsalm;
  hoursLiturgy.Hours.NinthHour.ThirdPsalm = specialDaysParts.HoursThirdPsalm;
  hoursLiturgy.Hours.NinthHour.ShortReading = specialDaysParts.NinthHourParts.ShortReading;
  hoursLiturgy.Hours.NinthHour.Responsory = specialDaysParts.NinthHourParts.Responsory;
  hoursLiturgy.Hours.NinthHour.FinalPrayer = specialDaysParts.NinthHourParts.FinalPrayer;

  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin
    ? specialDaysParts.SecondVespersLatinAnthem
    : specialDaysParts.SecondVespersCatalanAnthem;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = specialDaysParts.SecondVespersFirstPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = specialDaysParts.SecondVespersSecondPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = specialDaysParts.SecondVespersThirdPsalm;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading =
    specialDaysParts.SecondVespersShortReading;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory =
    specialDaysParts.SecondVespersShortResponsory;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
    specialDaysParts.SecondVespersEvangelicalAntiphon;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = specialDaysParts.SecondVespersPrayers;
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = specialDaysParts.SecondVespersFinalPrayer;

  return hoursLiturgy;
}

function getSaintsSolemnitiesHoursLiturgy(saintsSolemnities: SaintsSolemnities, settings: Settings): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.TodayCelebrationInformation = saintsSolemnities.Celebration;

  hoursLiturgy.Invitation.InvitationAntiphon = saintsSolemnities.InvitationAntiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Invitation.InvitationAntiphon) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Invitation.InvitationAntiphon = saintsSolemnities.CommonOffices.InvitationAntiphon;
  }
  hoursLiturgy.Office.Anthem = settings.UseLatin
    ? saintsSolemnities.OfficeLatinAnthem
    : saintsSolemnities.OfficeCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.Anthem) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Office.Anthem = settings.UseLatin
      ? saintsSolemnities.CommonOffices.OfficeLatinAnthem
      : saintsSolemnities.CommonOffices.OfficeCatalanAnthem;
  }
  hoursLiturgy.Office.FirstPsalm = saintsSolemnities.OfficeFirstPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.FirstPsalm.Psalm) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Office.FirstPsalm = saintsSolemnities.CommonOffices.OfficeFirstPsalm;
  }
  hoursLiturgy.Office.SecondPsalm = saintsSolemnities.OfficeSecondPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.SecondPsalm.Psalm) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Office.SecondPsalm = saintsSolemnities.CommonOffices.OfficeSecondPsalm;
  }
  hoursLiturgy.Office.ThirdPsalm = saintsSolemnities.OfficeThirdPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.ThirdPsalm.Psalm) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Office.ThirdPsalm = saintsSolemnities.CommonOffices.OfficeThirdPsalm;
  }
  hoursLiturgy.Office.Responsory = saintsSolemnities.OfficeResponsory;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.Responsory.Versicle) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Office.Responsory = saintsSolemnities.CommonOffices.OfficeResponsory;
  }
  hoursLiturgy.Office.FirstReading = saintsSolemnities.OfficeFirstReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Office.FirstReading.Reading) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Office.FirstReading = saintsSolemnities.CommonOffices.OfficeFirstReading;
  }
  hoursLiturgy.Office.SecondReading = saintsSolemnities.OfficeSecondReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Office.SecondReading.Reading) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Office.SecondReading = saintsSolemnities.CommonOffices.OfficeSecondReading;
  }
  hoursLiturgy.Office.TeDeumInformation.Enabled = true;
  hoursLiturgy.Office.FinalPrayer = saintsSolemnities.OfficeFinalPrayer;

  hoursLiturgy.Laudes.Anthem = settings.UseLatin
    ? saintsSolemnities.LaudesLatinAnthem
    : saintsSolemnities.LaudesCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.Anthem) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Laudes.Anthem = settings.UseLatin
      ? saintsSolemnities.CommonOffices.LaudesLatinAnthem
      : saintsSolemnities.CommonOffices.LaudesCatalanAnthem;
  }
  if (saintsSolemnities.CommonOffices) {
    hoursLiturgy.Laudes.FirstPsalm = saintsSolemnities.CommonOffices.LaudesFirstPsalm;
    hoursLiturgy.Laudes.SecondPsalm = saintsSolemnities.CommonOffices.LaudesSecondPsalm;
    hoursLiturgy.Laudes.ThirdPsalm = saintsSolemnities.CommonOffices.LaudesThirdPsalm;
  }
  if (StringManagement.hasLiturgyContent(saintsSolemnities.LaudesFirstAntiphon)) {
    hoursLiturgy.Laudes.FirstPsalm.Antiphon = saintsSolemnities.LaudesFirstAntiphon;
  }
  if (StringManagement.hasLiturgyContent(saintsSolemnities.LaudesSecondAntiphon)) {
    hoursLiturgy.Laudes.SecondPsalm.Antiphon = saintsSolemnities.LaudesSecondAntiphon;
  }
  if (StringManagement.hasLiturgyContent(saintsSolemnities.LaudesThirdAntiphon)) {
    hoursLiturgy.Laudes.ThirdPsalm.Antiphon = saintsSolemnities.LaudesThirdAntiphon;
  }
  hoursLiturgy.Laudes.ShortReading = saintsSolemnities.LaudesShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.ShortReading.ShortReading) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Laudes.ShortReading = saintsSolemnities.CommonOffices.LaudesShortReading;
  }
  hoursLiturgy.Laudes.ShortResponsory = saintsSolemnities.LaudesShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.ShortResponsory.FirstPart) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Laudes.ShortResponsory = saintsSolemnities.CommonOffices.LaudesShortResponsory;
  }
  hoursLiturgy.Laudes.EvangelicalAntiphon = saintsSolemnities.LaudesEvangelicalAntiphon;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.EvangelicalAntiphon) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Laudes.EvangelicalAntiphon = saintsSolemnities.CommonOffices.LaudesEvangelicalAntiphon;
  }
  hoursLiturgy.Laudes.Prayers = saintsSolemnities.LaudesPrayers;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.Prayers) && saintsSolemnities.CommonOffices) {
    hoursLiturgy.Laudes.Prayers = saintsSolemnities.CommonOffices.LaudesPrayers;
  }
  hoursLiturgy.Laudes.FinalPrayer = saintsSolemnities.LaudesFinalPrayer;

  hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin
    ? saintsSolemnities.ThirdHourParts.LatinAnthem
    : saintsSolemnities.ThirdHourParts.CatalanAnthem;
  hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsSolemnities.ThirdHourParts.Antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.ThirdHour.UniqueAntiphon) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsSolemnities.CommonOffices.ThirdHourParts.Antiphon;
  }
  hoursLiturgy.Hours.ThirdHour.FirstPsalm = saintsSolemnities.HoursFirstPsalm;
  hoursLiturgy.Hours.ThirdHour.SecondPsalm = saintsSolemnities.HoursSecondPsalm;
  hoursLiturgy.Hours.ThirdHour.ThirdPsalm = saintsSolemnities.HoursThirdPsalm;
  hoursLiturgy.Hours.ThirdHour.ShortReading = saintsSolemnities.ThirdHourParts.ShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.ThirdHour.ShortReading.ShortReading) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.ThirdHour.ShortReading = saintsSolemnities.CommonOffices.ThirdHourParts.ShortReading;
  }
  hoursLiturgy.Hours.ThirdHour.Responsory = saintsSolemnities.ThirdHourParts.Responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.ThirdHour.Responsory.Response) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.ThirdHour.Responsory = saintsSolemnities.CommonOffices.ThirdHourParts.Responsory;
  }
  hoursLiturgy.Hours.ThirdHour.FinalPrayer = saintsSolemnities.ThirdHourParts.FinalPrayer;
  hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin
    ? saintsSolemnities.SixthHourParts.LatinAnthem
    : saintsSolemnities.SixthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsSolemnities.SixthHourParts.Antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.SixthHour.UniqueAntiphon) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsSolemnities.CommonOffices.SixthHourParts.Antiphon;
  }
  hoursLiturgy.Hours.SixthHour.FirstPsalm = saintsSolemnities.HoursFirstPsalm;
  hoursLiturgy.Hours.SixthHour.SecondPsalm = saintsSolemnities.HoursSecondPsalm;
  hoursLiturgy.Hours.SixthHour.ThirdPsalm = saintsSolemnities.HoursThirdPsalm;
  hoursLiturgy.Hours.SixthHour.ShortReading = saintsSolemnities.SixthHourParts.ShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.SixthHour.ShortReading.ShortReading) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.SixthHour.ShortReading = saintsSolemnities.CommonOffices.SixthHourParts.ShortReading;
  }
  hoursLiturgy.Hours.SixthHour.Responsory = saintsSolemnities.SixthHourParts.Responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.SixthHour.Responsory.Response) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.SixthHour.Responsory = saintsSolemnities.CommonOffices.SixthHourParts.Responsory;
  }
  hoursLiturgy.Hours.SixthHour.FinalPrayer = saintsSolemnities.SixthHourParts.FinalPrayer;
  hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin
    ? saintsSolemnities.NinthHourParts.LatinAnthem
    : saintsSolemnities.NinthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsSolemnities.NinthHourParts.Antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.NinthHour.UniqueAntiphon) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsSolemnities.CommonOffices.NinthHourParts.Antiphon;
  }
  hoursLiturgy.Hours.NinthHour.FirstPsalm = saintsSolemnities.HoursFirstPsalm;
  hoursLiturgy.Hours.NinthHour.SecondPsalm = saintsSolemnities.HoursSecondPsalm;
  hoursLiturgy.Hours.NinthHour.ThirdPsalm = saintsSolemnities.HoursThirdPsalm;
  hoursLiturgy.Hours.NinthHour.ShortReading = saintsSolemnities.NinthHourParts.ShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.NinthHour.ShortReading.ShortReading) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.NinthHour.ShortReading = saintsSolemnities.CommonOffices.NinthHourParts.ShortReading;
  }
  hoursLiturgy.Hours.NinthHour.Responsory = saintsSolemnities.NinthHourParts.Responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.NinthHour.Responsory.Response) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.Hours.NinthHour.Responsory = saintsSolemnities.CommonOffices.NinthHourParts.Responsory;
  }
  hoursLiturgy.Hours.NinthHour.FinalPrayer = saintsSolemnities.NinthHourParts.FinalPrayer;

  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin
    ? saintsSolemnities.SecondVespersLatinAnthem
    : saintsSolemnities.SecondVespersCatalanAnthem;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin
      ? saintsSolemnities.CommonOffices.SecondVespersLatinAnthem
      : saintsSolemnities.CommonOffices.SecondVespersCatalanAnthem;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsSolemnities.SecondVespersFirstPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm.Psalm,
    ) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm =
      saintsSolemnities.CommonOffices.SecondVespersFirstPsalm;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm =
    saintsSolemnities.SecondVespersSecondPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm.Psalm,
    ) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm =
      saintsSolemnities.CommonOffices.SecondVespersSecondPsalm;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsSolemnities.SecondVespersThirdPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm.Psalm,
    ) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm =
      saintsSolemnities.CommonOffices.SecondVespersThirdPsalm;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading =
    saintsSolemnities.SecondVespersShortReading;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading.ShortReading,
    ) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading =
      saintsSolemnities.CommonOffices.SecondVespersShortReading;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory =
    saintsSolemnities.SecondVespersShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory.FirstPart,
    ) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory =
      saintsSolemnities.CommonOffices.SecondVespersShortResponsory;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
    saintsSolemnities.SecondVespersEvangelicalAntiphon;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon,
    ) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
      saintsSolemnities.CommonOffices.SecondVespersEvangelicalAntiphon;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsSolemnities.SecondVespersPrayers;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers =
      saintsSolemnities.CommonOffices.SecondVespersPrayers;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer =
    saintsSolemnities.SecondVespersFinalPrayer;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer) &&
    saintsSolemnities.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer =
      saintsSolemnities.CommonOffices.SecondVespersFinalPrayer;
  }

  return hoursLiturgy;
}

function getSaintsMemoriesHoursLiturgy(
  saintsMemories: SaintsMemories,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): HoursLiturgy {
  let hoursLiturgy = new HoursLiturgy();

  hoursLiturgy.TodayCelebrationInformation = saintsMemories.Celebration;

  hoursLiturgy.Invitation.InvitationAntiphon = saintsMemories.InvitationAntiphon;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Invitation.InvitationAntiphon) && saintsMemories.CommonOffices) {
    hoursLiturgy.Invitation.InvitationAntiphon = saintsMemories.CommonOffices.InvitationAntiphon;
  }

  hoursLiturgy.Office.Anthem = settings.UseLatin
    ? saintsMemories.OfficeLatinAnthem
    : saintsMemories.OfficeCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.Anthem) && saintsMemories.CommonOffices) {
    hoursLiturgy.Office.Anthem = settings.UseLatin
      ? saintsMemories.CommonOffices.OfficeLatinAnthem
      : saintsMemories.CommonOffices.OfficeCatalanAnthem;
  }
  hoursLiturgy.Office.FirstPsalm = saintsMemories.OfficeFirstPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.FirstPsalm.Psalm) && saintsMemories.CommonOffices) {
    hoursLiturgy.Office.FirstPsalm = saintsMemories.CommonOffices.OfficeFirstPsalm;
  }
  hoursLiturgy.Office.SecondPsalm = saintsMemories.OfficeSecondPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.SecondPsalm.Psalm) && saintsMemories.CommonOffices) {
    hoursLiturgy.Office.SecondPsalm = saintsMemories.CommonOffices.OfficeSecondPsalm;
  }
  hoursLiturgy.Office.ThirdPsalm = saintsMemories.OfficeThirdPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.ThirdPsalm.Psalm) && saintsMemories.CommonOffices) {
    hoursLiturgy.Office.ThirdPsalm = saintsMemories.CommonOffices.OfficeThirdPsalm;
  }
  hoursLiturgy.Office.Responsory = saintsMemories.OfficeResponsory;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.FirstPsalm.Psalm) && saintsMemories.CommonOffices) {
    hoursLiturgy.Office.FirstPsalm = saintsMemories.CommonOffices.OfficeFirstPsalm;
  }
  hoursLiturgy.Office.FirstReading = saintsMemories.OfficeFirstReading;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.FirstReading.Reading) && saintsMemories.CommonOffices) {
    hoursLiturgy.Office.FirstReading = saintsMemories.CommonOffices.OfficeFirstReading;
  }
  hoursLiturgy.Office.SecondReading = saintsMemories.OfficeSecondReading;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Office.SecondReading.Reading) && saintsMemories.CommonOffices) {
    hoursLiturgy.Office.SecondReading = saintsMemories.CommonOffices.OfficeSecondReading;
  }
  hoursLiturgy.Office.TeDeumInformation.Enabled = false;
  hoursLiturgy.Office.FinalPrayer = saintsMemories.OfficeFinalPrayer;

  hoursLiturgy.Laudes.Anthem = settings.UseLatin
    ? saintsMemories.LaudesLatinAnthem
    : saintsMemories.LaudesCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.Anthem) && saintsMemories.CommonOffices) {
    hoursLiturgy.Laudes.Anthem = settings.UseLatin
      ? saintsMemories.CommonOffices.LaudesLatinAnthem
      : saintsMemories.CommonOffices.LaudesCatalanAnthem;
  }
  hoursLiturgy.Laudes.FirstPsalm = saintsMemories.LaudesFirstPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.FirstPsalm.Psalm) && saintsMemories.CommonOffices) {
    hoursLiturgy.Laudes.FirstPsalm = saintsMemories.CommonOffices.LaudesFirstPsalm;
  }
  hoursLiturgy.Laudes.SecondPsalm = saintsMemories.LaudesSecondPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.SecondPsalm.Psalm) && saintsMemories.CommonOffices) {
    hoursLiturgy.Laudes.SecondPsalm = saintsMemories.CommonOffices.LaudesSecondPsalm;
  }
  hoursLiturgy.Laudes.ThirdPsalm = saintsMemories.LaudesThirdPsalm;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.ThirdPsalm.Psalm) && saintsMemories.CommonOffices) {
    hoursLiturgy.Laudes.ThirdPsalm = saintsMemories.CommonOffices.LaudesThirdPsalm;
  }
  hoursLiturgy.Laudes.ShortReading = saintsMemories.LaudesShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.ShortReading.ShortReading) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Laudes.ShortReading = saintsMemories.CommonOffices.LaudesShortReading;
  }
  hoursLiturgy.Laudes.ShortResponsory = saintsMemories.LaudesShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.ShortResponsory.FirstPart) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Laudes.ShortResponsory = saintsMemories.CommonOffices.LaudesShortResponsory;
  }
  hoursLiturgy.Laudes.EvangelicalAntiphon = saintsMemories.LaudesEvangelicalAntiphon;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.EvangelicalAntiphon) && saintsMemories.CommonOffices) {
    hoursLiturgy.Laudes.EvangelicalAntiphon = saintsMemories.CommonOffices.LaudesEvangelicalAntiphon;
  }
  hoursLiturgy.Laudes.Prayers = saintsMemories.LaudesPrayers;
  if (!StringManagement.hasLiturgyContent(hoursLiturgy.Laudes.Prayers) && saintsMemories.CommonOffices) {
    hoursLiturgy.Laudes.Prayers = saintsMemories.CommonOffices.LaudesPrayers;
  }
  hoursLiturgy.Laudes.FinalPrayer = saintsMemories.LaudesFinalPrayer;

  hoursLiturgy.Hours.ThirdHour.Anthem = settings.UseLatin
    ? saintsMemories.ThirdHourParts.LatinAnthem
    : saintsMemories.ThirdHourParts.CatalanAnthem;
  hoursLiturgy.Hours.ThirdHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsMemories.ThirdHourParts.Antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.ThirdHour.UniqueAntiphon) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.ThirdHour.UniqueAntiphon = saintsMemories.CommonOffices.ThirdHourParts.Antiphon;
  }
  hoursLiturgy.Hours.ThirdHour.FirstPsalm = saintsMemories.HoursFirstPsalm;
  hoursLiturgy.Hours.ThirdHour.SecondPsalm = saintsMemories.HoursSecondPsalm;
  hoursLiturgy.Hours.ThirdHour.ThirdPsalm = saintsMemories.HoursThirdPsalm;
  hoursLiturgy.Hours.ThirdHour.ShortReading = saintsMemories.ThirdHourParts.ShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.ThirdHour.ShortReading.ShortReading) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.ThirdHour.ShortReading = saintsMemories.CommonOffices.ThirdHourParts.ShortReading;
  }
  hoursLiturgy.Hours.ThirdHour.Responsory = saintsMemories.ThirdHourParts.Responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.ThirdHour.Responsory.Response) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.ThirdHour.Responsory = saintsMemories.CommonOffices.ThirdHourParts.Responsory;
  }
  hoursLiturgy.Hours.ThirdHour.FinalPrayer = saintsMemories.ThirdHourParts.FinalPrayer;
  hoursLiturgy.Hours.SixthHour.Anthem = settings.UseLatin
    ? saintsMemories.SixthHourParts.LatinAnthem
    : saintsMemories.SixthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.SixthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsMemories.SixthHourParts.Antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.SixthHour.UniqueAntiphon) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.SixthHour.UniqueAntiphon = saintsMemories.CommonOffices.SixthHourParts.Antiphon;
  }
  hoursLiturgy.Hours.SixthHour.FirstPsalm = saintsMemories.HoursFirstPsalm;
  hoursLiturgy.Hours.SixthHour.SecondPsalm = saintsMemories.HoursSecondPsalm;
  hoursLiturgy.Hours.SixthHour.ThirdPsalm = saintsMemories.HoursThirdPsalm;
  hoursLiturgy.Hours.SixthHour.ShortReading = saintsMemories.SixthHourParts.ShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.SixthHour.ShortReading.ShortReading) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.SixthHour.ShortReading = saintsMemories.CommonOffices.SixthHourParts.ShortReading;
  }
  hoursLiturgy.Hours.SixthHour.Responsory = saintsMemories.SixthHourParts.Responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.SixthHour.Responsory.Response) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.SixthHour.Responsory = saintsMemories.CommonOffices.SixthHourParts.Responsory;
  }
  hoursLiturgy.Hours.SixthHour.FinalPrayer = saintsMemories.SixthHourParts.FinalPrayer;
  hoursLiturgy.Hours.NinthHour.Anthem = settings.UseLatin
    ? saintsMemories.NinthHourParts.LatinAnthem
    : saintsMemories.NinthHourParts.CatalanAnthem;
  hoursLiturgy.Hours.NinthHour.HasMultipleAntiphons = false;
  hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsMemories.NinthHourParts.Antiphon;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.NinthHour.UniqueAntiphon) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.NinthHour.UniqueAntiphon = saintsMemories.CommonOffices.NinthHourParts.Antiphon;
  }
  hoursLiturgy.Hours.NinthHour.FirstPsalm = saintsMemories.HoursFirstPsalm;
  hoursLiturgy.Hours.NinthHour.SecondPsalm = saintsMemories.HoursSecondPsalm;
  hoursLiturgy.Hours.NinthHour.ThirdPsalm = saintsMemories.HoursThirdPsalm;
  hoursLiturgy.Hours.NinthHour.ShortReading = saintsMemories.NinthHourParts.ShortReading;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.NinthHour.ShortReading.ShortReading) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.NinthHour.ShortReading = saintsMemories.CommonOffices.NinthHourParts.ShortReading;
  }
  hoursLiturgy.Hours.NinthHour.Responsory = saintsMemories.NinthHourParts.Responsory;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.Hours.NinthHour.Responsory.Response) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.Hours.NinthHour.Responsory = saintsMemories.CommonOffices.NinthHourParts.Responsory;
  }
  hoursLiturgy.Hours.NinthHour.FinalPrayer = saintsMemories.NinthHourParts.FinalPrayer;

  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin
    ? saintsMemories.VespersLatinAnthem
    : saintsMemories.VespersCatalanAnthem;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Anthem = settings.UseLatin
      ? saintsMemories.CommonOffices.SecondVespersLatinAnthem
      : saintsMemories.CommonOffices.SecondVespersCatalanAnthem;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm = saintsMemories.VespersFirstPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm.Psalm,
    ) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FirstPsalm =
      saintsMemories.CommonOffices.SecondVespersFirstPsalm;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm = saintsMemories.VespersSecondPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm.Psalm,
    ) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.SecondPsalm =
      saintsMemories.CommonOffices.SecondVespersSecondPsalm;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm = saintsMemories.VespersThirdPsalm;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm.Psalm,
    ) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ThirdPsalm =
      saintsMemories.CommonOffices.SecondVespersThirdPsalm;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading = saintsMemories.VespersShortReading;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading.ShortReading,
    ) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortReading =
      saintsMemories.CommonOffices.SecondVespersShortReading;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory = saintsMemories.VespersShortResponsory;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory.FirstPart,
    ) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.ShortResponsory =
      saintsMemories.CommonOffices.SecondVespersShortResponsory;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
    saintsMemories.VespersEvangelicalAntiphon;
  if (
    !StringManagement.hasLiturgyContent(
      hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon,
    ) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.EvangelicalAntiphon =
      saintsMemories.CommonOffices.SecondVespersEvangelicalAntiphon;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers = saintsMemories.VespersPrayers;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.Prayers =
      saintsMemories.CommonOffices.SecondVespersPrayers;
  }
  hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer = saintsMemories.VespersFinalPrayer;
  if (
    !StringManagement.hasLiturgyContent(hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer) &&
    saintsMemories.CommonOffices
  ) {
    hoursLiturgy.VespersOptions.TodaySecondVespersWithCelebration.FinalPrayer =
      saintsMemories.CommonOffices.SecondVespersFinalPrayer;
  }

  return hoursLiturgy;
}

function getSolemnityAndFestivityFirstVespersOfTomorrow(
  solemnityAndFestivityParts: SolemnityAndFestivityParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.Title = solemnityAndFestivityParts.Celebration.Title;
  vespers.Anthem = settings.UseLatin
    ? solemnityAndFestivityParts.FirstVespersLatinAnthem
    : solemnityAndFestivityParts.FirstVespersCatalanAnthem;
  vespers.FirstPsalm = solemnityAndFestivityParts.FirstVespersFirstPsalm;
  vespers.SecondPsalm = solemnityAndFestivityParts.FirstVespersSecondPsalm;
  vespers.ThirdPsalm = solemnityAndFestivityParts.FirstVespersThirdPsalm;
  vespers.ShortReading = solemnityAndFestivityParts.FirstVespersShortReading;
  vespers.ShortResponsory = solemnityAndFestivityParts.FirstVespersShortResponsory;
  switch (liturgyDayInformation.YearType) {
    case YearType.A:
      vespers.EvangelicalAntiphon = solemnityAndFestivityParts.FirstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.EvangelicalAntiphon = solemnityAndFestivityParts.FirstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.EvangelicalAntiphon = solemnityAndFestivityParts.FirstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.Prayers = solemnityAndFestivityParts.FirstVespersPrayers;
  vespers.FinalPrayer = solemnityAndFestivityParts.FirstVespersFinalPrayer;
  return vespers;
}

function getSpecialDaysFirstVespersOfTomorrow(
  specialDaysParts: SpecialDaysParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.Title = specialDaysParts.Celebration.Title;
  vespers.Anthem = settings.UseLatin
    ? specialDaysParts.FirstVespersLatinAnthem
    : specialDaysParts.FirstVespersCatalanAnthem;
  vespers.FirstPsalm = specialDaysParts.FirstVespersFirstPsalm;
  vespers.SecondPsalm = specialDaysParts.FirstVespersSecondPsalm;
  vespers.ThirdPsalm = specialDaysParts.FirstVespersThirdPsalm;
  vespers.ShortReading = specialDaysParts.FirstVespersShortReading;
  vespers.ShortResponsory = specialDaysParts.FirstVespersShortResponsory;
  switch (liturgyDayInformation.YearType) {
    case YearType.A:
      vespers.EvangelicalAntiphon = specialDaysParts.FirstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.EvangelicalAntiphon = specialDaysParts.FirstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.EvangelicalAntiphon = specialDaysParts.FirstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.Prayers = specialDaysParts.FirstVespersPrayers;
  vespers.FinalPrayer = specialDaysParts.FirstVespersFinalPrayer;
  return vespers;
}

function getSaintsSolemnitiesFirstVespersOfTomorrow(
  saintsSolemnities: SaintsSolemnities,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.Title = saintsSolemnities.Celebration.Title;
  vespers.Anthem = settings.UseLatin
    ? saintsSolemnities.FirstVespersLatinAnthem
    : saintsSolemnities.FirstVespersCatalanAnthem;
  if (!StringManagement.hasLiturgyContent(vespers.Anthem) && saintsSolemnities.CommonOffices) {
    vespers.Anthem = settings.UseLatin
      ? saintsSolemnities.CommonOffices.FirstVespersLatinAnthem
      : saintsSolemnities.CommonOffices.FirstVespersCatalanAnthem;
  }
  vespers.FirstPsalm = saintsSolemnities.FirstVespersFirstPsalm;
  if (!StringManagement.hasLiturgyContent(vespers.FirstPsalm.Psalm) && saintsSolemnities.CommonOffices) {
    vespers.FirstPsalm = saintsSolemnities.CommonOffices.FirstVespersFirstPsalm;
  }
  vespers.SecondPsalm = saintsSolemnities.FirstVespersSecondPsalm;
  if (!StringManagement.hasLiturgyContent(vespers.SecondPsalm.Psalm) && saintsSolemnities.CommonOffices) {
    vespers.SecondPsalm = saintsSolemnities.CommonOffices.FirstVespersSecondPsalm;
  }
  vespers.ThirdPsalm = saintsSolemnities.FirstVespersThirdPsalm;
  if (!StringManagement.hasLiturgyContent(vespers.ThirdPsalm.Psalm) && saintsSolemnities.CommonOffices) {
    vespers.ThirdPsalm = saintsSolemnities.CommonOffices.FirstVespersThirdPsalm;
  }
  vespers.ShortReading = saintsSolemnities.FirstVespersShortReading;
  if (!StringManagement.hasLiturgyContent(vespers.ShortReading.ShortReading) && saintsSolemnities.CommonOffices) {
    vespers.ShortReading = saintsSolemnities.CommonOffices.FirstVespersShortReading;
  }
  vespers.ShortResponsory = saintsSolemnities.FirstVespersShortResponsory;
  if (!StringManagement.hasLiturgyContent(vespers.ShortResponsory.FirstPart) && saintsSolemnities.CommonOffices) {
    vespers.ShortResponsory = saintsSolemnities.CommonOffices.FirstVespersShortResponsory;
  }
  vespers.EvangelicalAntiphon = saintsSolemnities.FirstVespersEvangelicalAntiphon;
  if (!StringManagement.hasLiturgyContent(vespers.EvangelicalAntiphon) && saintsSolemnities.CommonOffices) {
    vespers.EvangelicalAntiphon = saintsSolemnities.CommonOffices.FirstVespersEvangelicalAntiphon;
  }
  vespers.Prayers = saintsSolemnities.FirstVespersPrayers;
  if (!StringManagement.hasLiturgyContent(vespers.Prayers) && saintsSolemnities.CommonOffices) {
    vespers.Prayers = saintsSolemnities.CommonOffices.FirstVespersPrayers;
  }
  vespers.FinalPrayer = saintsSolemnities.FirstVespersFinalPrayer;
  return vespers;
}

function getPalmSundayFistVespersOfTomorrow(
  palmSundayParts: PalmSundayParts,
  commonPartsOfHolyWeek: CommonPartsOfHolyWeek,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.Title = 'Diumenge de Rams';
  vespers.Anthem = settings.UseLatin
    ? commonPartsOfHolyWeek.VespersLatinAnthem
    : commonPartsOfHolyWeek.VespersCatalanAnthem;
  vespers.FirstPsalm.Antiphon = palmSundayParts.FirstVespersFirstAntiphon;
  vespers.SecondPsalm.Antiphon = palmSundayParts.FirstVespersSecondAntiphon;
  vespers.ThirdPsalm.Antiphon = palmSundayParts.FirstVespersThirdAntiphon;
  vespers.ShortReading = palmSundayParts.FirstVespersShortReading;
  vespers.ShortResponsory = palmSundayParts.FirstVespersShortResponsory;
  switch (liturgyDayInformation.YearType) {
    case YearType.A:
      vespers.EvangelicalAntiphon = palmSundayParts.FirstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.EvangelicalAntiphon = palmSundayParts.FirstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.EvangelicalAntiphon = palmSundayParts.FirstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.Prayers = palmSundayParts.FirstVespersPrayers;
  vespers.FinalPrayer = palmSundayParts.FirstVespersFinalPrayer;
  return vespers;
}

function getEasterTriduumFistVespersOfTomorrow(
  partsOfEasterTriduum: PartsOfEasterTriduum,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.Title = 'Tridu Pasqual';
  vespers.Anthem = settings.UseLatin
    ? partsOfEasterTriduum.VespersLatinAnthem
    : partsOfEasterTriduum.VespersCatalanAnthem;
  vespers.FirstPsalm = partsOfEasterTriduum.VespersFirstPsalm;
  vespers.SecondPsalm = partsOfEasterTriduum.VespersSecondPsalm;
  vespers.ThirdPsalm = partsOfEasterTriduum.VespersThirdPsalm;
  vespers.ShortReading = partsOfEasterTriduum.VespersShortReading;
  vespers.ShortResponsory = partsOfEasterTriduum.VespersShortResponsory;
  vespers.EvangelicalAntiphon = partsOfEasterTriduum.VespersEvangelicalAntiphon;
  vespers.Prayers = partsOfEasterTriduum.VespersPrayers;
  vespers.FinalPrayer = partsOfEasterTriduum.VespersFinalPrayer;
  return vespers;
}

function getAdventSundayFirstVespersOfTomorrow(
  adventSundayParts: AdventSundayParts,
  adventWeekParts: AdventWeekParts,
  commonAdventAndChristmasParts: CommonAdventAndChristmasParts,
  liturgyDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Vespers {
  let vespers = new Vespers();
  vespers.Title = "Diumenge d'advent";
  vespers.Anthem = settings.UseLatin
    ? commonAdventAndChristmasParts.VespersLatinAnthem
    : commonAdventAndChristmasParts.VespersCatalanAnthem;
  vespers.FirstPsalm.Antiphon = adventSundayParts.FirstVespersFirstAntiphon;
  vespers.SecondPsalm.Antiphon = adventSundayParts.FirstVespersSecondAntiphon;
  vespers.ThirdPsalm.Antiphon = adventSundayParts.FirstVespersThirdAntiphon;
  vespers.ShortReading = adventWeekParts.VespersShortReading;
  vespers.ShortResponsory = adventWeekParts.VespersShortResponsory;
  switch (liturgyDayInformation.YearType) {
    case YearType.A:
      vespers.EvangelicalAntiphon = adventSundayParts.FirstVespersEvangelicalAntiphonYearA;
      break;
    case YearType.B:
      vespers.EvangelicalAntiphon = adventSundayParts.FirstVespersEvangelicalAntiphonYearB;
      break;
    case YearType.C:
      vespers.EvangelicalAntiphon = adventSundayParts.FirstVespersEvangelicalAntiphonYearC;
      break;
  }
  vespers.Prayers = adventWeekParts.VespersPrayers;
  vespers.FinalPrayer = adventWeekParts.VespersFinalPrayer;
  return vespers;
}

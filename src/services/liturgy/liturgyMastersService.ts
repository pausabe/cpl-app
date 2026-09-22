import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import SoulKeys from '../soulKeys';
import * as DatabaseDataService from '../databaseDataService';
import OfficeCommonPsalter from '../../models/liturgy-masters/OfficeCommonPsalter';
import secureCall from '../../utils/secureCall';
import InvitationCommonPsalter from '../../models/liturgy-masters/InvitationCommonPsalter';
import OfficeOfOrdinaryTime from '../../models/liturgy-masters/OfficeOfOrdinaryTime';
import PrayersOfOrdinaryTime from '../../models/liturgy-masters/PrayersOfOrdinaryTime';
import CommonPartsUntilFifthWeekOfLentTime from '../../models/liturgy-masters/CommonPartsUntilFifthWeekOfLentTime';
import PartsOfLentTime from '../../models/liturgy-masters/PartsOfLentTime';
import PartsOfFiveWeeksOfLentTime from '../../models/liturgy-masters/PartsOfFiveWeeksOfLentTime';
import CommonPartsOfHolyWeek from '../../models/liturgy-masters/CommonPartsOfHolyWeek';
import PalmSundayParts from '../../models/liturgy-masters/PalmSundayParts';
import PartsOfHolyWeek from '../../models/liturgy-masters/PartsOfHolyWeek';
import PartsOfEasterTriduum from '../../models/liturgy-masters/PartsOfEasterTriduum';
import PartsOfEasterBeforeAscension from '../../models/liturgy-masters/PartsOfEasterBeforeAscension';
import PartsOfEasterOctave from '../../models/liturgy-masters/PartsOfEasterOctave';
import PartsOfEasterAfterAscension from '../../models/liturgy-masters/PartsOfEasterAfterAscension';
import EasterWeekParts from '../../models/liturgy-masters/EasterWeekParts';
import CommonAdventAndChristmasParts from '../../models/liturgy-masters/CommonAdventAndChristmasParts';
import AdventWeekParts from '../../models/liturgy-masters/AdventWeekParts';
import AdventSundayParts from '../../models/liturgy-masters/AdventSundayParts';
import AdventFairDaysParts from '../../models/liturgy-masters/AdventFairDaysParts';
import AdventFairDaysAntiphons from '../../models/liturgy-masters/AdventFairDaysAntiphons';
import ChristmasWhenOctaveParts from '../../models/liturgy-masters/ChristmasWhenOctaveParts';
import ChristmasBeforeEpiphanyParts from '../../models/liturgy-masters/ChristmasBeforeEpiphanyParts';
import SpecialCommonPartsOfEasterSundays from '../../models/liturgy-masters/SpecialCommonPartsOfEasterSundays';
import LaudesCommonPsalter from '../../models/liturgy-masters/LaudesCommonPsalter';
import CommonSpecialPartsOfEaster from '../../models/liturgy-masters/CommonSpecialPartsOfEaster';
import EasterSundayParts from '../../models/liturgy-masters/EasterSundayParts';
import EasterSunday from '../../models/liturgy-masters/EasterSunday';
import FiveWeeksOfSundayLentParts from '../../models/liturgy-masters/FiveWeeksOfSundayLentParts';
import VespersCommonPsalter from '../../models/liturgy-masters/VespersCommonPsalter';
import SolemnityAndFestivityParts from '../../models/liturgy-masters/SolemnityAndFestivityParts';
import CommonHourPsalter from '../../models/liturgy-masters/CommonHourPsalter';
import CommonNightPrayerPsalter from '../../models/liturgy-masters/CommonNightPrayerPsalter';
import CommonOfficeWhenStrongTimesPsalter from '../../models/liturgy-masters/CommonOfficeWhenStrongTimesPsalter';
import SaintsSolemnities from '../../models/liturgy-masters/SaintsSolemnities';
import SaintsMemories from '../../models/liturgy-masters/SaintsMemories';
import SpecialDaysParts from '../../models/liturgy-masters/SpecialDaysParts';
import LiturgyDayInformation, {
  LiturgySpecificDayInformation,
  SpecialCelebrationTypeEnum,
} from '../../models/LiturgyDayInformation';
import { Settings } from '../../models/Settings';
import { CelebrationType } from '../databaseEnums';
import * as CelebrationIdentifierService from '../celebrationIdentifierService';
import * as CelebrationIdentifier from '../celebrationIdentifierService';
import { Celebration } from '../celebrationIdentifierService';
import CommonOffice from '../../models/liturgy-masters/CommonOffices';
import Various from '../../models/liturgy-masters/Various';
import { SpecificLiturgyTimeType } from '../celebrationTimeEnums';
import * as DatabaseHelper from '../databaseDataHelper';
import { StringManagement } from '../../utils/StringManagement';

export async function obtainLiturgyMasters(
  currentLiturgyDayInformation: LiturgyDayInformation,
  settings: Settings,
): Promise<LiturgyMasters> {
  const liturgyMasters = new LiturgyMasters();
  liturgyMasters.OfficeCommonPsalter = await obtainOfficeCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.InvitationCommonPsalter = await obtainInvitationCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.OfficeOfOrdinaryTime = await obtainOfficeOfOrdinaryTime(currentLiturgyDayInformation);
  liturgyMasters.PrayersOfOrdinaryTime = await obtainPrayersOfOrdinaryTime(currentLiturgyDayInformation);
  liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers =
    await obtainPrayersOfOrdinaryTimeWhenFirstVespers(currentLiturgyDayInformation);
  liturgyMasters.CommonPartsUntilFifthWeekOfLentTime =
    await obtainCommonPartsUntilFifthWeekOfLentTime(currentLiturgyDayInformation);
  liturgyMasters.PartsOfLentTime = await obtainPartsOfLentTime(currentLiturgyDayInformation);
  liturgyMasters.PartsOfFiveWeeksOfLentTime = await obtainPartsOfFiveWeeksOfLentTime(currentLiturgyDayInformation);
  liturgyMasters.CommonPartsOfHolyWeek = await obtainCommonPartsOfHolyWeek(currentLiturgyDayInformation);
  liturgyMasters.PalmSundayParts = await obtainPalmSundayParts(currentLiturgyDayInformation);
  liturgyMasters.PartsOfHolyWeek = await obtainPartsOfHolyWeek(currentLiturgyDayInformation);
  liturgyMasters.PartsOfEasterTriduum = await obtainPartsOfEasterTriduum(currentLiturgyDayInformation);
  liturgyMasters.PartsOfEasterBeforeAscension = await obtainPartsOfEasterBeforeAscension(currentLiturgyDayInformation);
  liturgyMasters.PartsOfEasterOctave = await obtainPartsOfEasterOctave(currentLiturgyDayInformation);
  liturgyMasters.PartsOfEasterAfterAscension = await obtainPartsOfEasterAfterAscension(currentLiturgyDayInformation);
  liturgyMasters.EasterWeekParts = await obtainEasterWeekParts(currentLiturgyDayInformation);
  liturgyMasters.CommonAdventAndChristmasParts =
    await obtainCommonAdventAndChristmasParts(currentLiturgyDayInformation);
  liturgyMasters.AdventWeekParts = await obtainAdventWeekParts(currentLiturgyDayInformation);
  liturgyMasters.AdventSundayParts = await obtainAdventSundayParts(currentLiturgyDayInformation);
  liturgyMasters.AdventFirstVespersOfSundayParts =
    await obtainAdventFirstVespersOfSundayParts(currentLiturgyDayInformation);
  liturgyMasters.AdventFairDaysParts = await obtainAdventFairDaysParts(currentLiturgyDayInformation);
  liturgyMasters.AdventFairDaysAntiphons = await obtainAdventFairDaysAntiphons(currentLiturgyDayInformation);
  liturgyMasters.ChristmasWhenOctaveParts = await obtainChristmasWhenOctaveParts(currentLiturgyDayInformation);
  liturgyMasters.ChristmasBeforeEpiphanyParts = await obtainChristmasBeforeEpiphanyParts(currentLiturgyDayInformation);
  liturgyMasters.SpecialCommonPartsOfEasterSundays =
    await obtainSpecialCommonPartsOfEasterSundays(currentLiturgyDayInformation);
  liturgyMasters.LaudesCommonPsalter = await obtainLaudesCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.CommonSpecialPartsOfEaster = await obtainCommonSpecialPartsOfEaster(currentLiturgyDayInformation);
  liturgyMasters.EasterSundayParts = await obtainEasterSundayParts(currentLiturgyDayInformation);
  liturgyMasters.EasterFirstVespersOfSundayParts =
    await obtainEasterFirstVespersOfSundayParts(currentLiturgyDayInformation);
  liturgyMasters.EasterSunday = await obtainEasterSunday(currentLiturgyDayInformation);
  liturgyMasters.FiveWeeksOfSundayLentParts = await obtainFiveWeeksOfSundayLentParts(currentLiturgyDayInformation);
  liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts =
    await obtainFiveWeeksOfFirstsVespersOfSundayLentParts(currentLiturgyDayInformation);
  liturgyMasters.VespersCommonPsalter = await obtainVespersCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.SolemnityAndFestivityParts = await obtainSolemnityAndFestivityParts(currentLiturgyDayInformation);
  liturgyMasters.SolemnityAndFestivityWhenFirstVespersParts =
    await obtainSolemnityAndFestivityWhenFirstVespersParts(currentLiturgyDayInformation);
  liturgyMasters.CommonHourPsalter = await obtainCommonHourPsalter(currentLiturgyDayInformation);
  liturgyMasters.CommonNightPrayerPsalter = await obtainCommonNightPrayerPsalter(currentLiturgyDayInformation);
  liturgyMasters.CommonOfficeWhenStrongTimesPsalter =
    await obtainCommonOfficeWhenStrongTimesPsalter(currentLiturgyDayInformation);
  liturgyMasters.SaintsSolemnities = await obtainSaintsSolemnities(currentLiturgyDayInformation, settings);
  liturgyMasters.SaintsSolemnitiesWhenFirstsVespersParts = await obtainSaintsSolemnitiesWhenFirstsVespersParts(
    currentLiturgyDayInformation,
    settings,
  );
  liturgyMasters.SaintsMemories = await obtainSaintsMemories(currentLiturgyDayInformation, settings);
  liturgyMasters.SpecialDaysParts = await obtainSpecialDaysParts(currentLiturgyDayInformation);
  liturgyMasters.Various = await obtainVarious();
  return liturgyMasters;
}

async function obtainOfficeCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<OfficeCommonPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave &&
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave
    ) {
      const id =
        (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(OfficeCommonPsalter.MasterName, id);
      return new OfficeCommonPsalter(row);
    }
  }, new OfficeCommonPsalter());
}

async function obtainInvitationCommonPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<InvitationCommonPsalter> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id =
        (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(InvitationCommonPsalter.MasterName, id);
      return new InvitationCommonPsalter(row);
    }
  }, new InvitationCommonPsalter());
}

async function obtainOfficeOfOrdinaryTime(liturgyDayInformation: LiturgyDayInformation): Promise<OfficeOfOrdinaryTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id = (parseInt(liturgyDayInformation.Today.Week) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(OfficeOfOrdinaryTime.MasterName, id);
      return new OfficeOfOrdinaryTime(row);
    }
  }, new OfficeOfOrdinaryTime());
}

async function obtainPrayersOfOrdinaryTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PrayersOfOrdinaryTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id = parseInt(liturgyDayInformation.Today.Week);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
      return new PrayersOfOrdinaryTime(row);
    }
  }, new PrayersOfOrdinaryTime());
}

async function obtainPrayersOfOrdinaryTimeWhenFirstVespers(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PrayersOfOrdinaryTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id = parseInt(liturgyDayInformation.Tomorrow.Week);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
      return new PrayersOfOrdinaryTime(row);
    }
  }, new PrayersOfOrdinaryTime());
}

async function obtainCommonPartsUntilFifthWeekOfLentTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonPartsUntilFifthWeekOfLentTime> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(
        CommonPartsUntilFifthWeekOfLentTime.MasterName,
        id,
      );
      return new CommonPartsUntilFifthWeekOfLentTime(row);
    }
  }, new CommonPartsUntilFifthWeekOfLentTime());
}

async function obtainPartsOfLentTime(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfLentTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
      const id = liturgyDayInformation.Today.Date.getDay() - 2;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfLentTime.MasterName, id);
      return new PartsOfLentTime(row);
    }
  }, new PartsOfLentTime());
}

async function obtainPartsOfFiveWeeksOfLentTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfFiveWeeksOfLentTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
      const id = (parseInt(liturgyDayInformation.Today.Week) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfFiveWeeksOfLentTime.MasterName, id);
      return new PartsOfFiveWeeksOfLentTime(row);
    }
  }, new PartsOfFiveWeeksOfLentTime());
}

async function obtainCommonPartsOfHolyWeek(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonPartsOfHolyWeek> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonPartsOfHolyWeek.MasterName, id);
      return new CommonPartsOfHolyWeek(row);
    }
  }, new CommonPartsOfHolyWeek());
}

async function obtainPalmSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<PalmSundayParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PalmSundayParts.MasterName, id);
      return new PalmSundayParts(row);
    }
  }, new PalmSundayParts());
}

async function obtainPartsOfHolyWeek(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfHolyWeek> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
      liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek
    ) {
      const id = liturgyDayInformation.Today.Date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfHolyWeek.MasterName, id);
      return new PartsOfHolyWeek(row);
    }
  }, new PartsOfHolyWeek());
}

async function obtainPartsOfEasterTriduum(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfEasterTriduum> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum ||
      (liturgyDayInformation.Tomorrow.Date.getDay() === 5 &&
        liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum)
    ) {
      const id = liturgyDayInformation.Today.Date.getDay() - 3;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterTriduum.MasterName, id);
      return new PartsOfEasterTriduum(row);
    }
  }, new PartsOfEasterTriduum());
}

async function obtainPartsOfEasterBeforeAscension(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfEasterBeforeAscension> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterBeforeAscension.MasterName, id);
      return new PartsOfEasterBeforeAscension(row);
    }
  }, new PartsOfEasterBeforeAscension());
}

async function obtainPartsOfEasterOctave(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfEasterOctave> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      const id = liturgyDayInformation.Today.Date.getDay() === 0 ? 7 : liturgyDayInformation.Today.Date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterOctave.MasterName, id);
      return new PartsOfEasterOctave(row);
    }
  }, new PartsOfEasterOctave());
}

async function obtainPartsOfEasterAfterAscension(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfEasterAfterAscension> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterAfterAscension.MasterName, id);
      return new PartsOfEasterAfterAscension(row);
    }
  }, new PartsOfEasterAfterAscension());
}

async function obtainEasterWeekParts(liturgyDayInformation: LiturgyDayInformation): Promise<EasterWeekParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = (parseInt(liturgyDayInformation.Today.Week) - 2) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
      if (id === 43) {
        // Id 43 should be for Pentecost sunday, but it's inside another Master and not this one
        id = 1;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterWeekParts.MasterName, id);
      return new EasterWeekParts(row);
    }
  }, new EasterWeekParts());
}

async function obtainCommonAdventAndChristmasParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonAdventAndChristmasParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      let id = 1;
      switch (liturgyDayInformation.Today.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.AdventWeeks:
          id = 1;
          break;
        case SpecificLiturgyTimeType.AdventFairs:
          id = 2;
          break;
        case SpecificLiturgyTimeType.ChristmasOctave:
          id = 3;
          break;
        case SpecificLiturgyTimeType.ChristmasBeforeOrdinary:
          if (liturgyDayInformation.Today.Date.getDate() < 6) {
            id = 3;
          } else {
            id = 4;
          }
          break;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonAdventAndChristmasParts.MasterName, id);
      return new CommonAdventAndChristmasParts(row);
    }
  }, new CommonAdventAndChristmasParts());
}

function todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation: LiturgyDayInformation): boolean {
  return (
    liturgyDayInformation.Tomorrow.Date.getDay() === 0 &&
    liturgyDayInformation.Tomorrow.Week === '1' &&
    liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
  );
}

async function obtainAdventWeekParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventWeekParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      //Week begins with saturday
      let auxCicle = liturgyDayInformation.Today.WeekCycle;
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        auxCicle = '1';
      }
      let id;
      if (
        liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
        liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
      ) {
        id = 1;
      } else {
        id = (parseInt(auxCicle) - 1) * 7 + liturgyDayInformation.Today.Date.getDay() + 2;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventWeekParts.MasterName, id);
      return new AdventWeekParts(row);
    }
  }, new AdventWeekParts());
}

async function obtainAdventSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventSundayParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs
    ) {
      let id = parseInt(liturgyDayInformation.Today.WeekCycle);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
      return new AdventSundayParts(row);
    }
  }, new AdventSundayParts());
}

async function obtainAdventFirstVespersOfSundayParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<AdventSundayParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      let id = parseInt(liturgyDayInformation.Today.WeekCycle) + 1;
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        id = 1;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
      return new AdventSundayParts(row);
    }
  }, new AdventSundayParts());
}

async function obtainAdventFairDaysParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventFairDaysParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      let id = liturgyDayInformation.Today.Date.getDate() - 16;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventFairDaysParts.MasterName, id);
      return new AdventFairDaysParts(row);
    }
  }, new AdventFairDaysParts());
}

async function obtainAdventFairDaysAntiphons(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<AdventFairDaysAntiphons> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      let id = liturgyDayInformation.Today.Date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventFairDaysAntiphons.MasterName, id);
      return new AdventFairDaysAntiphons(row);
    }
  }, new AdventFairDaysAntiphons());
}

async function obtainChristmasWhenOctaveParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<ChristmasWhenOctaveParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
      !CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation.Today)
    ) {
      let id = liturgyDayInformation.Today.Date.getDate() === 1 ? 1 : liturgyDayInformation.Today.Date.getDate() - 25;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(ChristmasWhenOctaveParts.MasterName, id);
      return new ChristmasWhenOctaveParts(row);
    }
  }, new ChristmasWhenOctaveParts());
}

async function obtainChristmasBeforeEpiphanyParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<ChristmasBeforeEpiphanyParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary) {
      const id =
        liturgyDayInformation.Today.Date.getDate() < 6
          ? liturgyDayInformation.Today.Date.getDate() - 1
          : liturgyDayInformation.Today.Date.getDate() - 2;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(ChristmasBeforeEpiphanyParts.MasterName, id);
      return new ChristmasBeforeEpiphanyParts(row);
    }
  }, new ChristmasBeforeEpiphanyParts());
}

async function obtainSpecialCommonPartsOfEasterSundays(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<SpecialCommonPartsOfEasterSundays> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(
        SpecialCommonPartsOfEasterSundays.MasterName,
        id,
      );
      return new SpecialCommonPartsOfEasterSundays(row);
    }
  }, new SpecialCommonPartsOfEasterSundays());
}

async function obtainLaudesCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<LaudesCommonPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      let weekCycle = parseInt(liturgyDayInformation.Today.WeekCycle);
      let dayNumber = liturgyDayInformation.Today.Date.getDay();

      // Special conditions for Christmastime
      const christmasOctaveSpecialDays =
        liturgyDayInformation.Today.Date.getMonth() === 11 &&
        (liturgyDayInformation.Today.Date.getDate() === 29 ||
          liturgyDayInformation.Today.Date.getDate() === 30 ||
          liturgyDayInformation.Today.Date.getDate() === 31);
      if (
        liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity ||
        liturgyDayInformation.Today.CelebrationType === CelebrationType.Festivity ||
        christmasOctaveSpecialDays ||
        CelebrationIdentifier.checkCelebration(Celebration.Epiphany, liturgyDayInformation.Today)
      ) {
        weekCycle = 1;
        dayNumber = 0;
      }
      if (CelebrationIdentifier.checkCelebration(Celebration.SacredFamily, liturgyDayInformation.Today)) {
        weekCycle = 2;
        dayNumber = liturgyDayInformation.Today.Date.getDay();
      }

      const id = (weekCycle - 1) * 7 + (dayNumber + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(LaudesCommonPsalter.MasterName, id);
      return new LaudesCommonPsalter(row);
    }
  }, new LaudesCommonPsalter());
}

async function obtainCommonSpecialPartsOfEaster(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonSpecialPartsOfEaster> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 6 + liturgyDayInformation.Today.Date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonSpecialPartsOfEaster.MasterName, id);
      return new CommonSpecialPartsOfEaster(row);
    }
  }, new CommonSpecialPartsOfEaster());
}

async function obtainEasterSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<EasterSundayParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = parseInt(liturgyDayInformation.Today.Week) - 1;
      if (id === 7) {
        id = 6;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
      return new EasterSundayParts(row);
    }
  }, new EasterSundayParts());
}

async function obtainEasterFirstVespersOfSundayParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<EasterSundayParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = parseInt(liturgyDayInformation.Today.Week);
      if (id === 7 || id === 8) {
        id = 6;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
      return new EasterSundayParts(row);
    }
  }, new EasterSundayParts());
}

async function obtainEasterSunday(liturgyDayInformation: LiturgyDayInformation): Promise<EasterSunday> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday
    ) {
      let id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterSunday.MasterName, id);
      return new EasterSunday(row);
    }
  }, new EasterSunday());
}

async function obtainFiveWeeksOfSundayLentParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<FiveWeeksOfSundayLentParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
      let id = parseInt(liturgyDayInformation.Today.Week);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
      return new FiveWeeksOfSundayLentParts(row);
    }
  }, new FiveWeeksOfSundayLentParts());
}

async function obtainFiveWeeksOfFirstsVespersOfSundayLentParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<FiveWeeksOfSundayLentParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks ||
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes
    ) {
      let id = 1;
      if (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes) {
        id = parseInt(liturgyDayInformation.Today.Week) + 1;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
      return new FiveWeeksOfSundayLentParts(row);
    }
  }, new FiveWeeksOfSundayLentParts());
}

async function obtainVespersCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<VespersCommonPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      let weekDayNormalVespers =
        liturgyDayInformation.Today.Date.getDay() === 6 ? 1 : liturgyDayInformation.Today.Date.getDay() + 2;
      let cicle = parseInt(liturgyDayInformation.Today.WeekCycle);
      if (liturgyDayInformation.Today.Date.getDay() === 6) {
        cicle = cicle === 4 ? 1 : cicle + 1;
      }
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        cicle = 1;
      }
      const id = (cicle - 1) * 7 + weekDayNormalVespers;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(VespersCommonPsalter.MasterName, id);
      return new VespersCommonPsalter(row);
    }
  }, new VespersCommonPsalter());
}

async function obtainSolemnityAndFestivityParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<SolemnityAndFestivityParts> {
  return await secureCall(async () => {
    let id;
    if (
      liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType ===
      SpecialCelebrationTypeEnum.SolemnityAndFestivity
    ) {
      id = liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier;
    } else if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal;
    }
    if (id) {
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(SolemnityAndFestivityParts.MasterName, id);
      return new SolemnityAndFestivityParts(row);
    }
  }, new SolemnityAndFestivityParts());
}

async function obtainSolemnityAndFestivityWhenFirstVespersParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<SolemnityAndFestivityParts> {
  return await secureCall(async () => {
    let id;
    if (
      liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType ===
      SpecialCelebrationTypeEnum.SolemnityAndFestivity
    ) {
      id = liturgyDayInformation.Tomorrow.SpecialCelebration.SolemnityAndFestivityMasterIdentifier;
    } else if (liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal;
    }
    if (id) {
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(SolemnityAndFestivityParts.MasterName, id);
      return new SolemnityAndFestivityParts(row);
    }
  }, new SolemnityAndFestivityParts());
}

async function obtainCommonHourPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<CommonHourPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      const id =
        (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonHourPsalter.MasterName, id);
      return new CommonHourPsalter(row);
    }
  }, new CommonHourPsalter());
}

async function obtainCommonNightPrayerPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonNightPrayerPsalter> {
  return await secureCall(async () => {
    let id = liturgyDayInformation.Today.Date.getDay() === 6 ? 1 : liturgyDayInformation.Today.Date.getDay() + 2;
    if (
      (liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ||
        liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType ===
          SpecialCelebrationTypeEnum.SolemnityAndFestivity ||
        liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Solemnity) &&
      !(liturgyDayInformation.Today.Date.getDay() === 6 || liturgyDayInformation.Today.Date.getDay() === 0)
    ) {
      id = 8;
    }
    if (
      (liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity ||
        liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType ===
          SpecialCelebrationTypeEnum.SolemnityAndFestivity) &&
      !(liturgyDayInformation.Today.Date.getDay() === 6 || liturgyDayInformation.Today.Date.getDay() === 0)
    ) {
      id = 9;
    }
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      id = 2;
    }
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = 9;
    }
    if (
      liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek &&
      (liturgyDayInformation.Today.Date.getDay() === 4 ||
        liturgyDayInformation.Today.Date.getDay() === 5 ||
        liturgyDayInformation.Today.Date.getDay() === 6)
    ) {
      id = 9;
    }
    if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum) {
      id = 9;
    }
    const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonNightPrayerPsalter.MasterName, id);
    return new CommonNightPrayerPsalter(row);
  }, new CommonNightPrayerPsalter());
}

async function obtainCommonOfficeWhenStrongTimesPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonOfficeWhenStrongTimesPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.StrongTime
    ) {
      const id = liturgyDayInformation.Today.SpecialCelebration.StrongTimesMasterIdentifier;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(
        CommonOfficeWhenStrongTimesPsalter.MasterName,
        id,
      );
      return new CommonOfficeWhenStrongTimesPsalter(row);
    }
  }, new CommonOfficeWhenStrongTimesPsalter());
}

async function obtainSaintsSolemnities(
  liturgyDayInformation: LiturgyDayInformation,
  settings: Settings,
): Promise<SaintsSolemnities> {
  return await secureCall(async () => {
    if (
      (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
        liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !==
          SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
        liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !==
          SpecialCelebrationTypeEnum.SpecialDay &&
        (liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity ||
          liturgyDayInformation.Today.CelebrationType === CelebrationType.Festivity)) ||
      StringManagement.hasLiturgyContent(liturgyDayInformation.Today.MovedDay.OriginDateShortDatabaseCode)
    ) {
      let saintsMemoryOrSolemnityMasterIdentifier = obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(
        liturgyDayInformation.Today,
        settings,
      );
      if (saintsMemoryOrSolemnityMasterIdentifier === -1) {
        let day = DatabaseHelper.getDateShortDatabaseCode(
          liturgyDayInformation.Today.Date,
          settings.DioceseCode2Letters,
          liturgyDayInformation.Today.MovedDay.OriginDateShortDatabaseCode,
          liturgyDayInformation.Today.MovedDay.DioceseCode2Letters,
        );
        const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesAsync(
          SaintsSolemnities.MasterName,
          day,
          settings.DioceseCode,
          settings.PrayingPlace,
          settings.DioceseName,
          liturgyDayInformation.Today.GenericLiturgyTime,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.CommonOffices = await obtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
        return saintsSolemnitiesParts;
      } else {
        const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
          SaintsSolemnities.MasterName,
          saintsMemoryOrSolemnityMasterIdentifier,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.CommonOffices = await obtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
        return saintsSolemnitiesParts;
      }
    }
  }, new SaintsSolemnities());
}

async function obtainSaintsSolemnitiesWhenFirstsVespersParts(
  liturgyDayInformation: LiturgyDayInformation,
  settings: Settings,
): Promise<SaintsSolemnities> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Tomorrow.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
      liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType !==
        SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
      liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType !==
        SpecialCelebrationTypeEnum.SpecialDay &&
      (liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Solemnity ||
        liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Festivity)
    ) {
      let saintsMemoryOrSolemnityMasterIdentifier = obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(
        liturgyDayInformation.Tomorrow,
        settings,
      );
      if (saintsMemoryOrSolemnityMasterIdentifier !== -1) {
        const row = DatabaseDataService.obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
          SaintsSolemnities.MasterName,
          saintsMemoryOrSolemnityMasterIdentifier,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.CommonOfficesForFirstVespers = await obtainCommonOffices(
          saintsSolemnitiesParts.Celebration.Category,
        );
        return saintsSolemnitiesParts;
      } else {
        let day = '-';
        if (
          liturgyDayInformation.Tomorrow.MovedDay.OriginDateShortDatabaseCode !== '-' &&
          DatabaseHelper.isMovedDiocese(
            settings.DioceseName,
            liturgyDayInformation.Tomorrow.MovedDay.DioceseCode2Letters,
          )
        ) {
          day = liturgyDayInformation.Tomorrow.MovedDay.OriginDateShortDatabaseCode;
        }

        if (day === '-') {
          day = DatabaseHelper.getDateShortDatabaseCode(
            liturgyDayInformation.Tomorrow.Date,
            settings.DioceseName,
            '-',
            '-',
          );
        }
        const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesAsync(
          SaintsSolemnities.MasterName,
          day,
          settings.DioceseCode,
          settings.PrayingPlace,
          settings.DioceseName,
          liturgyDayInformation.Today.GenericLiturgyTime,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.CommonOfficesForFirstVespers = await obtainCommonOffices(
          saintsSolemnitiesParts.Celebration.Category,
        );
        return saintsSolemnitiesParts;
      }
    }
  }, new SaintsSolemnities());
}

async function obtainSaintsMemories(
  liturgyDayInformation: LiturgyDayInformation,
  settings: Settings,
): Promise<SaintsMemories> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !==
        SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
      (liturgyDayInformation.Today.CelebrationType === CelebrationType.Memory ||
        liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalMemory ||
        liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory)
    ) {
      let masterIdentifierOfVariableDays = obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(
        liturgyDayInformation.Today,
        settings,
      );

      if (
        liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory &&
        masterIdentifierOfVariableDays === -1
      ) {
        const row = await DatabaseDataService.obtainFreeVirginMemoryAsync();
        const saintsMemories = new SaintsMemories(row);
        saintsMemories.CommonOffices = await obtainCommonOffices(saintsMemories.Celebration.Category);
        return saintsMemories;
      } else {
        if (masterIdentifierOfVariableDays === -1) {
          const day = DatabaseHelper.getDateShortDatabaseCode(
            liturgyDayInformation.Today.Date,
            settings.DioceseName,
            liturgyDayInformation.Today.MovedDay.OriginDateShortDatabaseCode,
            liturgyDayInformation.Today.MovedDay.DioceseCode2Letters,
          );
          const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesAsync(
            SaintsMemories.MasterName,
            day,
            settings.DioceseCode,
            settings.PrayingPlace,
            settings.DioceseName,
            liturgyDayInformation.Today.GenericLiturgyTime,
          );
          const saintsMemories = new SaintsMemories(row);
          saintsMemories.CommonOffices = await obtainCommonOffices(saintsMemories.Celebration.Category);
          return saintsMemories;
        } else {
          const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
            SaintsMemories.MasterName,
            masterIdentifierOfVariableDays,
          );
          const saintsMemories = new SaintsMemories(row);
          saintsMemories.CommonOffices = await obtainCommonOffices(saintsMemories.Celebration.Category);
          return saintsMemories;
        }
      }
    }
  }, new SaintsMemories());
}

async function obtainSpecialDaysParts(liturgyDayInformation: LiturgyDayInformation): Promise<SpecialDaysParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay ||
      liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay
    ) {
      let id = liturgyDayInformation.Today.SpecialCelebration.SpecialDaysMasterIdentifier;
      if (
        liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType ===
        SpecialCelebrationTypeEnum.SpecialDay
      ) {
        id = liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialDaysMasterIdentifier;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(SpecialDaysParts.MasterName, id);
      return new SpecialDaysParts(row);
    }
  }, new SpecialDaysParts());
}

async function obtainVarious(): Promise<Various> {
  return await secureCall(async () => {
    const table = await DatabaseDataService.obtainMasterTableFromDatabase(Various.MasterName);
    return new Various(table);
  }, new Various());
}

async function obtainCommonOffices(category: string): Promise<CommonOffice> {
  return await secureCall(async () => {
    if (category && category !== '0000') {
      const row = await DatabaseDataService.obtainCommonOfficesAsync(category);
      return new CommonOffice(row);
    }
  }, new CommonOffice());
}

/*
  Return id of #santsMemories or #santsSolemnitats or -1 if there isn't there
*/
function obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(
  liturgyDateInformation: LiturgySpecificDayInformation,
  settings: Settings,
) {
  if (
    CelebrationIdentifierService.checkCelebration(
      Celebration.ImmaculateHeartOfTheBlessedVirginMary,
      liturgyDateInformation,
    )
  ) {
    return SoulKeys.santsMemories_CorImmaculatBenauradaVergeMaria;
  }
  if (
    CelebrationIdentifierService.checkCelebration(
      Celebration.MotherOfGodFromTheTibbon,
      liturgyDateInformation,
      settings,
    )
  ) {
    if (liturgyDateInformation.CelebrationType === CelebrationType.Memory) {
      return SoulKeys.santsMemories_MareDeuCinta;
    }
    if (liturgyDateInformation.CelebrationType === CelebrationType.Solemnity) {
      return SoulKeys.santsSolemnitats_MareDeuCinta;
    }
  }
  if (CelebrationIdentifierService.checkCelebration(Celebration.JesusChristHighPriestForever, liturgyDateInformation)) {
    return SoulKeys.santsSolemnitats_JesucristGranSacerdotSempre;
  }
  if (
    CelebrationIdentifierService.checkCelebration(
      Celebration.BlessedVirginMaryMotherOfTheChurch,
      liturgyDateInformation,
    )
  ) {
    return SoulKeys.santsMemories_BenauradaVergeMariaMareEsglesia;
  }
  return -1;
}

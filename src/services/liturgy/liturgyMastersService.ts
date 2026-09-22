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
  liturgyMasters.officeCommonPsalter = await obtainOfficeCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.invitationCommonPsalter = await obtainInvitationCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.officeOfOrdinaryTime = await obtainOfficeOfOrdinaryTime(currentLiturgyDayInformation);
  liturgyMasters.prayersOfOrdinaryTime = await obtainPrayersOfOrdinaryTime(currentLiturgyDayInformation);
  liturgyMasters.prayersOfOrdinaryTimeWhenFirstVespers =
    await obtainPrayersOfOrdinaryTimeWhenFirstVespers(currentLiturgyDayInformation);
  liturgyMasters.commonPartsUntilFifthWeekOfLentTime =
    await obtainCommonPartsUntilFifthWeekOfLentTime(currentLiturgyDayInformation);
  liturgyMasters.partsOfLentTime = await obtainPartsOfLentTime(currentLiturgyDayInformation);
  liturgyMasters.partsOfFiveWeeksOfLentTime = await obtainPartsOfFiveWeeksOfLentTime(currentLiturgyDayInformation);
  liturgyMasters.commonPartsOfHolyWeek = await obtainCommonPartsOfHolyWeek(currentLiturgyDayInformation);
  liturgyMasters.palmSundayParts = await obtainPalmSundayParts(currentLiturgyDayInformation);
  liturgyMasters.partsOfHolyWeek = await obtainPartsOfHolyWeek(currentLiturgyDayInformation);
  liturgyMasters.partsOfEasterTriduum = await obtainPartsOfEasterTriduum(currentLiturgyDayInformation);
  liturgyMasters.partsOfEasterBeforeAscension = await obtainPartsOfEasterBeforeAscension(currentLiturgyDayInformation);
  liturgyMasters.partsOfEasterOctave = await obtainPartsOfEasterOctave(currentLiturgyDayInformation);
  liturgyMasters.partsOfEasterAfterAscension = await obtainPartsOfEasterAfterAscension(currentLiturgyDayInformation);
  liturgyMasters.easterWeekParts = await obtainEasterWeekParts(currentLiturgyDayInformation);
  liturgyMasters.commonAdventAndChristmasParts =
    await obtainCommonAdventAndChristmasParts(currentLiturgyDayInformation);
  liturgyMasters.adventWeekParts = await obtainAdventWeekParts(currentLiturgyDayInformation);
  liturgyMasters.adventSundayParts = await obtainAdventSundayParts(currentLiturgyDayInformation);
  liturgyMasters.adventFirstVespersOfSundayParts =
    await obtainAdventFirstVespersOfSundayParts(currentLiturgyDayInformation);
  liturgyMasters.adventFairDaysParts = await obtainAdventFairDaysParts(currentLiturgyDayInformation);
  liturgyMasters.adventFairDaysAntiphons = await obtainAdventFairDaysAntiphons(currentLiturgyDayInformation);
  liturgyMasters.christmasWhenOctaveParts = await obtainChristmasWhenOctaveParts(currentLiturgyDayInformation);
  liturgyMasters.christmasBeforeEpiphanyParts = await obtainChristmasBeforeEpiphanyParts(currentLiturgyDayInformation);
  liturgyMasters.specialCommonPartsOfEasterSundays =
    await obtainSpecialCommonPartsOfEasterSundays(currentLiturgyDayInformation);
  liturgyMasters.laudesCommonPsalter = await obtainLaudesCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.commonSpecialPartsOfEaster = await obtainCommonSpecialPartsOfEaster(currentLiturgyDayInformation);
  liturgyMasters.easterSundayParts = await obtainEasterSundayParts(currentLiturgyDayInformation);
  liturgyMasters.easterFirstVespersOfSundayParts =
    await obtainEasterFirstVespersOfSundayParts(currentLiturgyDayInformation);
  liturgyMasters.easterSunday = await obtainEasterSunday(currentLiturgyDayInformation);
  liturgyMasters.fiveWeeksOfSundayLentParts = await obtainFiveWeeksOfSundayLentParts(currentLiturgyDayInformation);
  liturgyMasters.fiveWeeksOfFirstsVespersOfSundayLentParts =
    await obtainFiveWeeksOfFirstsVespersOfSundayLentParts(currentLiturgyDayInformation);
  liturgyMasters.vespersCommonPsalter = await obtainVespersCommonPsalter(currentLiturgyDayInformation);
  liturgyMasters.solemnityAndFestivityParts = await obtainSolemnityAndFestivityParts(currentLiturgyDayInformation);
  liturgyMasters.solemnityAndFestivityWhenFirstVespersParts =
    await obtainSolemnityAndFestivityWhenFirstVespersParts(currentLiturgyDayInformation);
  liturgyMasters.commonHourPsalter = await obtainCommonHourPsalter(currentLiturgyDayInformation);
  liturgyMasters.commonNightPrayerPsalter = await obtainCommonNightPrayerPsalter(currentLiturgyDayInformation);
  liturgyMasters.commonOfficeWhenStrongTimesPsalter =
    await obtainCommonOfficeWhenStrongTimesPsalter(currentLiturgyDayInformation);
  liturgyMasters.saintsSolemnities = await obtainSaintsSolemnities(currentLiturgyDayInformation, settings);
  liturgyMasters.saintsSolemnitiesWhenFirstsVespersParts = await obtainSaintsSolemnitiesWhenFirstsVespersParts(
    currentLiturgyDayInformation,
    settings,
  );
  liturgyMasters.saintsMemories = await obtainSaintsMemories(currentLiturgyDayInformation, settings);
  liturgyMasters.specialDaysParts = await obtainSpecialDaysParts(currentLiturgyDayInformation);
  liturgyMasters.various = await obtainVarious();
  return liturgyMasters;
}

async function obtainOfficeCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<OfficeCommonPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave
    ) {
      const id =
        (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(OfficeCommonPsalter.masterName, id);
      return new OfficeCommonPsalter(row);
    }
  }, new OfficeCommonPsalter());
}

async function obtainInvitationCommonPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<InvitationCommonPsalter> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id =
        (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(InvitationCommonPsalter.masterName, id);
      return new InvitationCommonPsalter(row);
    }
  }, new InvitationCommonPsalter());
}

async function obtainOfficeOfOrdinaryTime(liturgyDayInformation: LiturgyDayInformation): Promise<OfficeOfOrdinaryTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id = (parseInt(liturgyDayInformation.today.week) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(OfficeOfOrdinaryTime.masterName, id);
      return new OfficeOfOrdinaryTime(row);
    }
  }, new OfficeOfOrdinaryTime());
}

async function obtainPrayersOfOrdinaryTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PrayersOfOrdinaryTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id = parseInt(liturgyDayInformation.today.week);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PrayersOfOrdinaryTime.masterName, id);
      return new PrayersOfOrdinaryTime(row);
    }
  }, new PrayersOfOrdinaryTime());
}

async function obtainPrayersOfOrdinaryTimeWhenFirstVespers(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PrayersOfOrdinaryTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      const id = parseInt(liturgyDayInformation.tomorrow.week);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PrayersOfOrdinaryTime.masterName, id);
      return new PrayersOfOrdinaryTime(row);
    }
  }, new PrayersOfOrdinaryTime());
}

async function obtainCommonPartsUntilFifthWeekOfLentTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonPartsUntilFifthWeekOfLentTime> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(
        CommonPartsUntilFifthWeekOfLentTime.masterName,
        id,
      );
      return new CommonPartsUntilFifthWeekOfLentTime(row);
    }
  }, new CommonPartsUntilFifthWeekOfLentTime());
}

async function obtainPartsOfLentTime(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfLentTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
      const id = liturgyDayInformation.today.date.getDay() - 2;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfLentTime.masterName, id);
      return new PartsOfLentTime(row);
    }
  }, new PartsOfLentTime());
}

async function obtainPartsOfFiveWeeksOfLentTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfFiveWeeksOfLentTime> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
      const id = (parseInt(liturgyDayInformation.today.week) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfFiveWeeksOfLentTime.masterName, id);
      return new PartsOfFiveWeeksOfLentTime(row);
    }
  }, new PartsOfFiveWeeksOfLentTime());
}

async function obtainCommonPartsOfHolyWeek(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonPartsOfHolyWeek> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonPartsOfHolyWeek.masterName, id);
      return new CommonPartsOfHolyWeek(row);
    }
  }, new CommonPartsOfHolyWeek());
}

async function obtainPalmSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<PalmSundayParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PalmSundayParts.masterName, id);
      return new PalmSundayParts(row);
    }
  }, new PalmSundayParts());
}

async function obtainPartsOfHolyWeek(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfHolyWeek> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
      liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek
    ) {
      const id = liturgyDayInformation.today.date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfHolyWeek.masterName, id);
      return new PartsOfHolyWeek(row);
    }
  }, new PartsOfHolyWeek());
}

async function obtainPartsOfEasterTriduum(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfEasterTriduum> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum ||
      (liturgyDayInformation.tomorrow.date.getDay() === 5 &&
        liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum)
    ) {
      const id = liturgyDayInformation.today.date.getDay() - 3;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterTriduum.masterName, id);
      return new PartsOfEasterTriduum(row);
    }
  }, new PartsOfEasterTriduum());
}

async function obtainPartsOfEasterBeforeAscension(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfEasterBeforeAscension> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks
    ) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterBeforeAscension.masterName, id);
      return new PartsOfEasterBeforeAscension(row);
    }
  }, new PartsOfEasterBeforeAscension());
}

async function obtainPartsOfEasterOctave(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfEasterOctave> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      const id = liturgyDayInformation.today.date.getDay() === 0 ? 7 : liturgyDayInformation.today.date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterOctave.masterName, id);
      return new PartsOfEasterOctave(row);
    }
  }, new PartsOfEasterOctave());
}

async function obtainPartsOfEasterAfterAscension(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfEasterAfterAscension> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(PartsOfEasterAfterAscension.masterName, id);
      return new PartsOfEasterAfterAscension(row);
    }
  }, new PartsOfEasterAfterAscension());
}

async function obtainEasterWeekParts(liturgyDayInformation: LiturgyDayInformation): Promise<EasterWeekParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = (parseInt(liturgyDayInformation.today.week) - 2) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
      if (id === 43) {
        // Id 43 should be for Pentecost sunday, but it's inside another Master and not this one
        id = 1;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterWeekParts.masterName, id);
      return new EasterWeekParts(row);
    }
  }, new EasterWeekParts());
}

async function obtainCommonAdventAndChristmasParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonAdventAndChristmasParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      let id = 1;
      switch (liturgyDayInformation.today.specificLiturgyTime) {
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
          if (liturgyDayInformation.today.date.getDate() < 6) {
            id = 3;
          } else {
            id = 4;
          }
          break;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonAdventAndChristmasParts.masterName, id);
      return new CommonAdventAndChristmasParts(row);
    }
  }, new CommonAdventAndChristmasParts());
}

function todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation: LiturgyDayInformation): boolean {
  return (
    liturgyDayInformation.tomorrow.date.getDay() === 0 &&
    liturgyDayInformation.tomorrow.week === '1' &&
    liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
  );
}

async function obtainAdventWeekParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventWeekParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      //Week begins with saturday
      let auxCicle = liturgyDayInformation.today.weekCycle;
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        auxCicle = '1';
      }
      let id;
      if (
        liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
        liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
      ) {
        id = 1;
      } else {
        id = (parseInt(auxCicle) - 1) * 7 + liturgyDayInformation.today.date.getDay() + 2;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventWeekParts.masterName, id);
      return new AdventWeekParts(row);
    }
  }, new AdventWeekParts());
}

async function obtainAdventSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventSundayParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs
    ) {
      let id = parseInt(liturgyDayInformation.today.weekCycle);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventSundayParts.masterName, id);
      return new AdventSundayParts(row);
    }
  }, new AdventSundayParts());
}

async function obtainAdventFirstVespersOfSundayParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<AdventSundayParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      let id = parseInt(liturgyDayInformation.today.weekCycle) + 1;
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        id = 1;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventSundayParts.masterName, id);
      return new AdventSundayParts(row);
    }
  }, new AdventSundayParts());
}

async function obtainAdventFairDaysParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventFairDaysParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      let id = liturgyDayInformation.today.date.getDate() - 16;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventFairDaysParts.masterName, id);
      return new AdventFairDaysParts(row);
    }
  }, new AdventFairDaysParts());
}

async function obtainAdventFairDaysAntiphons(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<AdventFairDaysAntiphons> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      let id = liturgyDayInformation.today.date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(AdventFairDaysAntiphons.masterName, id);
      return new AdventFairDaysAntiphons(row);
    }
  }, new AdventFairDaysAntiphons());
}

async function obtainChristmasWhenOctaveParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<ChristmasWhenOctaveParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
      !CelebrationIdentifier.checkCelebration(Celebration.Christmas, liturgyDayInformation.today)
    ) {
      let id = liturgyDayInformation.today.date.getDate() === 1 ? 1 : liturgyDayInformation.today.date.getDate() - 25;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(ChristmasWhenOctaveParts.masterName, id);
      return new ChristmasWhenOctaveParts(row);
    }
  }, new ChristmasWhenOctaveParts());
}

async function obtainChristmasBeforeEpiphanyParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<ChristmasBeforeEpiphanyParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary) {
      const id =
        liturgyDayInformation.today.date.getDate() < 6
          ? liturgyDayInformation.today.date.getDate() - 1
          : liturgyDayInformation.today.date.getDate() - 2;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(ChristmasBeforeEpiphanyParts.masterName, id);
      return new ChristmasBeforeEpiphanyParts(row);
    }
  }, new ChristmasBeforeEpiphanyParts());
}

async function obtainSpecialCommonPartsOfEasterSundays(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<SpecialCommonPartsOfEasterSundays> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      const id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(
        SpecialCommonPartsOfEasterSundays.masterName,
        id,
      );
      return new SpecialCommonPartsOfEasterSundays(row);
    }
  }, new SpecialCommonPartsOfEasterSundays());
}

async function obtainLaudesCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<LaudesCommonPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      let weekCycle = parseInt(liturgyDayInformation.today.weekCycle);
      let dayNumber = liturgyDayInformation.today.date.getDay();

      // Special conditions for Christmastime
      const christmasOctaveSpecialDays =
        liturgyDayInformation.today.date.getMonth() === 11 &&
        (liturgyDayInformation.today.date.getDate() === 29 ||
          liturgyDayInformation.today.date.getDate() === 30 ||
          liturgyDayInformation.today.date.getDate() === 31);
      if (
        liturgyDayInformation.today.celebrationType === CelebrationType.Solemnity ||
        liturgyDayInformation.today.celebrationType === CelebrationType.Festivity ||
        christmasOctaveSpecialDays ||
        CelebrationIdentifier.checkCelebration(Celebration.Epiphany, liturgyDayInformation.today)
      ) {
        weekCycle = 1;
        dayNumber = 0;
      }
      if (CelebrationIdentifier.checkCelebration(Celebration.SacredFamily, liturgyDayInformation.today)) {
        weekCycle = 2;
        dayNumber = liturgyDayInformation.today.date.getDay();
      }

      const id = (weekCycle - 1) * 7 + (dayNumber + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(LaudesCommonPsalter.masterName, id);
      return new LaudesCommonPsalter(row);
    }
  }, new LaudesCommonPsalter());
}

async function obtainCommonSpecialPartsOfEaster(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonSpecialPartsOfEaster> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      const id = (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 6 + liturgyDayInformation.today.date.getDay();
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonSpecialPartsOfEaster.masterName, id);
      return new CommonSpecialPartsOfEaster(row);
    }
  }, new CommonSpecialPartsOfEaster());
}

async function obtainEasterSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<EasterSundayParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = parseInt(liturgyDayInformation.today.week) - 1;
      if (id === 7) {
        id = 6;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterSundayParts.masterName, id);
      return new EasterSundayParts(row);
    }
  }, new EasterSundayParts());
}

async function obtainEasterFirstVespersOfSundayParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<EasterSundayParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = parseInt(liturgyDayInformation.today.week);
      if (id === 7 || id === 8) {
        id = 6;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterSundayParts.masterName, id);
      return new EasterSundayParts(row);
    }
  }, new EasterSundayParts());
}

async function obtainEasterSunday(liturgyDayInformation: LiturgyDayInformation): Promise<EasterSunday> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday
    ) {
      let id = 1;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(EasterSunday.masterName, id);
      return new EasterSunday(row);
    }
  }, new EasterSunday());
}

async function obtainFiveWeeksOfSundayLentParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<FiveWeeksOfSundayLentParts> {
  return await secureCall(async () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
      let id = parseInt(liturgyDayInformation.today.week);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.masterName, id);
      return new FiveWeeksOfSundayLentParts(row);
    }
  }, new FiveWeeksOfSundayLentParts());
}

async function obtainFiveWeeksOfFirstsVespersOfSundayLentParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<FiveWeeksOfSundayLentParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes
    ) {
      let id = 1;
      if (liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentAshes) {
        id = parseInt(liturgyDayInformation.today.week) + 1;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.masterName, id);
      return new FiveWeeksOfSundayLentParts(row);
    }
  }, new FiveWeeksOfSundayLentParts());
}

async function obtainVespersCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<VespersCommonPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      let weekDayNormalVespers =
        liturgyDayInformation.today.date.getDay() === 6 ? 1 : liturgyDayInformation.today.date.getDay() + 2;
      let cicle = parseInt(liturgyDayInformation.today.weekCycle);
      if (liturgyDayInformation.today.date.getDay() === 6) {
        cicle = cicle === 4 ? 1 : cicle + 1;
      }
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        cicle = 1;
      }
      const id = (cicle - 1) * 7 + weekDayNormalVespers;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(VespersCommonPsalter.masterName, id);
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
      liturgyDayInformation.today.specialCelebration.specialCelebrationType ===
      SpecialCelebrationTypeEnum.SolemnityAndFestivity
    ) {
      id = liturgyDayInformation.today.specialCelebration.SolemnityAndFestivityMasterIdentifier;
    } else if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal;
    }
    if (id) {
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(SolemnityAndFestivityParts.masterName, id);
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
      liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType ===
      SpecialCelebrationTypeEnum.SolemnityAndFestivity
    ) {
      id = liturgyDayInformation.tomorrow.specialCelebration.SolemnityAndFestivityMasterIdentifier;
    } else if (liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal;
    }
    if (id) {
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(SolemnityAndFestivityParts.masterName, id);
      return new SolemnityAndFestivityParts(row);
    }
  }, new SolemnityAndFestivityParts());
}

async function obtainCommonHourPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<CommonHourPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      const id =
        (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonHourPsalter.masterName, id);
      return new CommonHourPsalter(row);
    }
  }, new CommonHourPsalter());
}

async function obtainCommonNightPrayerPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonNightPrayerPsalter> {
  return await secureCall(async () => {
    let id = liturgyDayInformation.today.date.getDay() === 6 ? 1 : liturgyDayInformation.today.date.getDay() + 2;
    if (
      (liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ||
        liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType ===
          SpecialCelebrationTypeEnum.SolemnityAndFestivity ||
        liturgyDayInformation.tomorrow.celebrationType === CelebrationType.Solemnity) &&
      !(liturgyDayInformation.today.date.getDay() === 6 || liturgyDayInformation.today.date.getDay() === 0)
    ) {
      id = 8;
    }
    if (
      (liturgyDayInformation.today.celebrationType === CelebrationType.Solemnity ||
        liturgyDayInformation.today.specialCelebration.specialCelebrationType ===
          SpecialCelebrationTypeEnum.SolemnityAndFestivity) &&
      !(liturgyDayInformation.today.date.getDay() === 6 || liturgyDayInformation.today.date.getDay() === 0)
    ) {
      id = 9;
    }
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      id = 2;
    }
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = 9;
    }
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek &&
      (liturgyDayInformation.today.date.getDay() === 4 ||
        liturgyDayInformation.today.date.getDay() === 5 ||
        liturgyDayInformation.today.date.getDay() === 6)
    ) {
      id = 9;
    }
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum) {
      id = 9;
    }
    const row = await DatabaseDataService.obtainMasterRowFromDatabase(CommonNightPrayerPsalter.masterName, id);
    return new CommonNightPrayerPsalter(row);
  }, new CommonNightPrayerPsalter());
}

async function obtainCommonOfficeWhenStrongTimesPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonOfficeWhenStrongTimesPsalter> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.StrongTime
    ) {
      const id = liturgyDayInformation.today.specialCelebration.StrongTimesMasterIdentifier;
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(
        CommonOfficeWhenStrongTimesPsalter.masterName,
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
      (liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
        liturgyDayInformation.today.specialCelebration.specialCelebrationType !==
          SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
        liturgyDayInformation.today.specialCelebration.specialCelebrationType !==
          SpecialCelebrationTypeEnum.SpecialDay &&
        (liturgyDayInformation.today.celebrationType === CelebrationType.Solemnity ||
          liturgyDayInformation.today.celebrationType === CelebrationType.Festivity)) ||
      StringManagement.hasLiturgyContent(liturgyDayInformation.today.movedDay.originDateShortDatabaseCode)
    ) {
      let saintsMemoryOrSolemnityMasterIdentifier = obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(
        liturgyDayInformation.today,
        settings,
      );
      if (saintsMemoryOrSolemnityMasterIdentifier === -1) {
        let day = DatabaseHelper.getDateShortDatabaseCode(
          liturgyDayInformation.today.date,
          settings.dioceseCode2Letters,
          liturgyDayInformation.today.movedDay.originDateShortDatabaseCode,
          liturgyDayInformation.today.movedDay.dioceseCode2Letters,
        );
        const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesAsync(
          SaintsSolemnities.masterName,
          day,
          settings.dioceseCode,
          settings.prayingPlace,
          settings.dioceseName,
          liturgyDayInformation.today.genericLiturgyTime,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.commonOffices = await obtainCommonOffices(saintsSolemnitiesParts.celebration.category);
        return saintsSolemnitiesParts;
      } else {
        const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
          SaintsSolemnities.masterName,
          saintsMemoryOrSolemnityMasterIdentifier,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.commonOffices = await obtainCommonOffices(saintsSolemnitiesParts.celebration.category);
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
      liturgyDayInformation.tomorrow.specificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
      liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType !==
        SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
      liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType !==
        SpecialCelebrationTypeEnum.SpecialDay &&
      (liturgyDayInformation.tomorrow.celebrationType === CelebrationType.Solemnity ||
        liturgyDayInformation.tomorrow.celebrationType === CelebrationType.Festivity)
    ) {
      let saintsMemoryOrSolemnityMasterIdentifier = obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(
        liturgyDayInformation.tomorrow,
        settings,
      );
      if (saintsMemoryOrSolemnityMasterIdentifier !== -1) {
        const row = DatabaseDataService.obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
          SaintsSolemnities.masterName,
          saintsMemoryOrSolemnityMasterIdentifier,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.commonOfficesForFirstVespers = await obtainCommonOffices(
          saintsSolemnitiesParts.celebration.category,
        );
        return saintsSolemnitiesParts;
      } else {
        let day = '-';
        if (
          liturgyDayInformation.tomorrow.movedDay.originDateShortDatabaseCode !== '-' &&
          DatabaseHelper.isMovedDiocese(
            settings.dioceseName,
            liturgyDayInformation.tomorrow.movedDay.dioceseCode2Letters,
          )
        ) {
          day = liturgyDayInformation.tomorrow.movedDay.originDateShortDatabaseCode;
        }

        if (day === '-') {
          day = DatabaseHelper.getDateShortDatabaseCode(
            liturgyDayInformation.tomorrow.date,
            settings.dioceseName,
            '-',
            '-',
          );
        }
        const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesAsync(
          SaintsSolemnities.masterName,
          day,
          settings.dioceseCode,
          settings.prayingPlace,
          settings.dioceseName,
          liturgyDayInformation.today.genericLiturgyTime,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.commonOfficesForFirstVespers = await obtainCommonOffices(
          saintsSolemnitiesParts.celebration.category,
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
      liturgyDayInformation.today.specialCelebration.specialCelebrationType !==
        SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
      (liturgyDayInformation.today.celebrationType === CelebrationType.Memory ||
        liturgyDayInformation.today.celebrationType === CelebrationType.OptionalMemory ||
        liturgyDayInformation.today.celebrationType === CelebrationType.OptionalVirginMemory)
    ) {
      let masterIdentifierOfVariableDays = obtainSaintsMemoriesOrSolemnitiesMasterIdentifier(
        liturgyDayInformation.today,
        settings,
      );

      if (
        liturgyDayInformation.today.celebrationType === CelebrationType.OptionalVirginMemory &&
        masterIdentifierOfVariableDays === -1
      ) {
        const row = await DatabaseDataService.obtainFreeVirginMemoryAsync();
        const saintsMemories = new SaintsMemories(row);
        saintsMemories.commonOffices = await obtainCommonOffices(saintsMemories.celebration.category);
        return saintsMemories;
      } else {
        if (masterIdentifierOfVariableDays === -1) {
          const day = DatabaseHelper.getDateShortDatabaseCode(
            liturgyDayInformation.today.date,
            settings.dioceseName,
            liturgyDayInformation.today.movedDay.originDateShortDatabaseCode,
            liturgyDayInformation.today.movedDay.dioceseCode2Letters,
          );
          const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesAsync(
            SaintsMemories.masterName,
            day,
            settings.dioceseCode,
            settings.prayingPlace,
            settings.dioceseName,
            liturgyDayInformation.today.genericLiturgyTime,
          );
          const saintsMemories = new SaintsMemories(row);
          saintsMemories.commonOffices = await obtainCommonOffices(saintsMemories.celebration.category);
          return saintsMemories;
        } else {
          const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
            SaintsMemories.masterName,
            masterIdentifierOfVariableDays,
          );
          const saintsMemories = new SaintsMemories(row);
          saintsMemories.commonOffices = await obtainCommonOffices(saintsMemories.celebration.category);
          return saintsMemories;
        }
      }
    }
  }, new SaintsMemories());
}

async function obtainSpecialDaysParts(liturgyDayInformation: LiturgyDayInformation): Promise<SpecialDaysParts> {
  return await secureCall(async () => {
    if (
      liturgyDayInformation.today.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay ||
      liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay
    ) {
      let id = liturgyDayInformation.today.specialCelebration.SpecialDaysMasterIdentifier;
      if (
        liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType ===
        SpecialCelebrationTypeEnum.SpecialDay
      ) {
        id = liturgyDayInformation.tomorrow.specialCelebration.SpecialDaysMasterIdentifier;
      }
      const row = await DatabaseDataService.obtainMasterRowFromDatabase(SpecialDaysParts.masterName, id);
      return new SpecialDaysParts(row);
    }
  }, new SpecialDaysParts());
}

async function obtainVarious(): Promise<Various> {
  return await secureCall(async () => {
    const table = await DatabaseDataService.obtainMasterTableFromDatabase(Various.masterName);
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
    if (liturgyDateInformation.celebrationType === CelebrationType.Memory) {
      return SoulKeys.santsMemories_MareDeuCinta;
    }
    if (liturgyDateInformation.celebrationType === CelebrationType.Solemnity) {
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

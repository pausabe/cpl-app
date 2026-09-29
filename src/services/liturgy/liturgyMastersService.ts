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

// The row of a master table for the day, as the model of that table. The function says which row
// (its id), or nothing on the days the table is not needed: then, as when the query fails, the model
// comes back empty (see secureCall).
interface MasterTable<T> {
  new (databaseRow?: any): T;
  masterName: string;
}

function fromMaster<T>(Master: MasterTable<T>, idOfTheDay: () => number | undefined): Promise<T> {
  return secureCall(async () => {
    const id = idOfTheDay();
    if (id === undefined) return undefined;
    return new Master(await DatabaseDataService.obtainMasterRowFromDatabase(Master.masterName, id));
  }, new Master());
}

async function obtainOfficeCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<OfficeCommonPsalter> {
  return fromMaster(OfficeCommonPsalter, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave
    ) {
      return (
        (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1)
      );
    }
  });
}

async function obtainInvitationCommonPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<InvitationCommonPsalter> {
  return fromMaster(InvitationCommonPsalter, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      return (
        (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1)
      );
    }
  });
}

async function obtainOfficeOfOrdinaryTime(liturgyDayInformation: LiturgyDayInformation): Promise<OfficeOfOrdinaryTime> {
  return fromMaster(OfficeOfOrdinaryTime, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      return (parseInt(liturgyDayInformation.today.week) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
    }
  });
}

async function obtainPrayersOfOrdinaryTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PrayersOfOrdinaryTime> {
  return fromMaster(PrayersOfOrdinaryTime, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      return parseInt(liturgyDayInformation.today.week);
    }
  });
}

async function obtainPrayersOfOrdinaryTimeWhenFirstVespers(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PrayersOfOrdinaryTime> {
  return fromMaster(PrayersOfOrdinaryTime, () => {
    if (liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
      return parseInt(liturgyDayInformation.tomorrow.week);
    }
  });
}

async function obtainCommonPartsUntilFifthWeekOfLentTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonPartsUntilFifthWeekOfLentTime> {
  return fromMaster(CommonPartsUntilFifthWeekOfLentTime, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks
    ) {
      return 1;
    }
  });
}

async function obtainPartsOfLentTime(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfLentTime> {
  return fromMaster(PartsOfLentTime, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
      return liturgyDayInformation.today.date.getDay() - 2;
    }
  });
}

async function obtainPartsOfFiveWeeksOfLentTime(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfFiveWeeksOfLentTime> {
  return fromMaster(PartsOfFiveWeeksOfLentTime, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
      return (parseInt(liturgyDayInformation.today.week) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
    }
  });
}

async function obtainCommonPartsOfHolyWeek(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonPartsOfHolyWeek> {
  return fromMaster(CommonPartsOfHolyWeek, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek
    ) {
      return 1;
    }
  });
}

async function obtainPalmSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<PalmSundayParts> {
  return fromMaster(PalmSundayParts, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
      liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday
    ) {
      return 1;
    }
  });
}

async function obtainPartsOfHolyWeek(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfHolyWeek> {
  return fromMaster(PartsOfHolyWeek, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
      liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.HolyWeek
    ) {
      return liturgyDayInformation.today.date.getDay();
    }
  });
}

async function obtainPartsOfEasterTriduum(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfEasterTriduum> {
  return fromMaster(PartsOfEasterTriduum, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum ||
      (liturgyDayInformation.tomorrow.date.getDay() === 5 &&
        liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum)
    ) {
      return liturgyDayInformation.today.date.getDay() - 3;
    }
  });
}

async function obtainPartsOfEasterBeforeAscension(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfEasterBeforeAscension> {
  return fromMaster(PartsOfEasterBeforeAscension, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks
    ) {
      return 1;
    }
  });
}

async function obtainPartsOfEasterOctave(liturgyDayInformation: LiturgyDayInformation): Promise<PartsOfEasterOctave> {
  return fromMaster(PartsOfEasterOctave, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
      return liturgyDayInformation.today.date.getDay() === 0 ? 7 : liturgyDayInformation.today.date.getDay();
    }
  });
}

async function obtainPartsOfEasterAfterAscension(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<PartsOfEasterAfterAscension> {
  return fromMaster(PartsOfEasterAfterAscension, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      return 1;
    }
  });
}

async function obtainEasterWeekParts(liturgyDayInformation: LiturgyDayInformation): Promise<EasterWeekParts> {
  return fromMaster(EasterWeekParts, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = (parseInt(liturgyDayInformation.today.week) - 2) * 7 + (liturgyDayInformation.today.date.getDay() + 1);
      if (id === 43) {
        // Id 43 should be for Pentecost sunday, but it's inside another Master and not this one
        id = 1;
      }
      return id;
    }
  });
}

async function obtainCommonAdventAndChristmasParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonAdventAndChristmasParts> {
  return fromMaster(CommonAdventAndChristmasParts, () => {
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
      return id;
    }
  });
}

function todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation: LiturgyDayInformation): boolean {
  return (
    liturgyDayInformation.tomorrow.date.getDay() === 0 &&
    liturgyDayInformation.tomorrow.week === '1' &&
    liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
  );
}

async function obtainAdventWeekParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventWeekParts> {
  return fromMaster(AdventWeekParts, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      //Week begins with saturday
      let auxCycle = liturgyDayInformation.today.weekCycle;
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        auxCycle = '1';
      }
      let id;
      if (
        liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
        liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks
      ) {
        id = 1;
      } else {
        id = (parseInt(auxCycle) - 1) * 7 + liturgyDayInformation.today.date.getDay() + 2;
      }
      return id;
    }
  });
}

async function obtainAdventSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventSundayParts> {
  return fromMaster(AdventSundayParts, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs
    ) {
      let id = parseInt(liturgyDayInformation.today.weekCycle);
      return id;
    }
  });
}

async function obtainAdventFirstVespersOfSundayParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<AdventSundayParts> {
  return fromMaster(AdventSundayParts, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs ||
      todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)
    ) {
      let id = parseInt(liturgyDayInformation.today.weekCycle) + 1;
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        id = 1;
      }
      return id;
    }
  });
}

async function obtainAdventFairDaysParts(liturgyDayInformation: LiturgyDayInformation): Promise<AdventFairDaysParts> {
  return fromMaster(AdventFairDaysParts, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      let id = liturgyDayInformation.today.date.getDate() - 16;
      return id;
    }
  });
}

async function obtainAdventFairDaysAntiphons(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<AdventFairDaysAntiphons> {
  return fromMaster(AdventFairDaysAntiphons, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
      let id = liturgyDayInformation.today.date.getDay();
      return id;
    }
  });
}

async function obtainChristmasWhenOctaveParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<ChristmasWhenOctaveParts> {
  return fromMaster(ChristmasWhenOctaveParts, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
      !CelebrationIdentifierService.checkCelebration(Celebration.Christmas, liturgyDayInformation.today)
    ) {
      let id = liturgyDayInformation.today.date.getDate() === 1 ? 1 : liturgyDayInformation.today.date.getDate() - 25;
      return id;
    }
  });
}

async function obtainChristmasBeforeEpiphanyParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<ChristmasBeforeEpiphanyParts> {
  return fromMaster(ChristmasBeforeEpiphanyParts, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary) {
      return liturgyDayInformation.today.date.getDate() < 6
        ? liturgyDayInformation.today.date.getDate() - 1
        : liturgyDayInformation.today.date.getDate() - 2;
    }
  });
}

async function obtainSpecialCommonPartsOfEasterSundays(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<SpecialCommonPartsOfEasterSundays> {
  return fromMaster(SpecialCommonPartsOfEasterSundays, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      return 1;
    }
  });
}

async function obtainLaudesCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<LaudesCommonPsalter> {
  return fromMaster(LaudesCommonPsalter, () => {
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
        CelebrationIdentifierService.checkCelebration(Celebration.Epiphany, liturgyDayInformation.today)
      ) {
        weekCycle = 1;
        dayNumber = 0;
      }
      if (CelebrationIdentifierService.checkCelebration(Celebration.SacredFamily, liturgyDayInformation.today)) {
        weekCycle = 2;
        dayNumber = liturgyDayInformation.today.date.getDay();
      }
      // Ash Wednesday's Laudes does not follow the running psalter. The day itself runs in week IV
      // — its Office of Readings, its Vespers and the three days that follow all do — but Laudes
      // alone takes the penitential psalmody of FRIDAY of week III: Ps 50 (Miserere), the canticle
      // of Jeremiah 14, 17-21 and Ps 99. Lent starts mid-week, so week I is held back for the first
      // Sunday of Lent and these four days borrow from weeks III and IV.
      // Without this the day falls through to Wednesday of week IV (Ps 107), which is what cpl-app
      // printed on every Ash Wednesday from 2017 to 2026. The Catalan texts were already in
      // salteriComuLaudes row 20; nothing but the routing was missing. [CPL-LIT-001]
      if (CelebrationIdentifierService.checkCelebration(Celebration.AshWednesday, liturgyDayInformation.today)) {
        weekCycle = 3;
        dayNumber = 5;
      }

      return (weekCycle - 1) * 7 + (dayNumber + 1);
    }
  });
}

async function obtainCommonSpecialPartsOfEaster(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonSpecialPartsOfEaster> {
  return fromMaster(CommonSpecialPartsOfEaster, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      return (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 6 + liturgyDayInformation.today.date.getDay();
    }
  });
}

async function obtainEasterSundayParts(liturgyDayInformation: LiturgyDayInformation): Promise<EasterSundayParts> {
  return fromMaster(EasterSundayParts, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = parseInt(liturgyDayInformation.today.week) - 1;
      if (id === 7) {
        id = 6;
      }
      return id;
    }
  });
}

async function obtainEasterFirstVespersOfSundayParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<EasterSundayParts> {
  return fromMaster(EasterSundayParts, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
      let id = parseInt(liturgyDayInformation.today.week);
      if (id === 7 || id === 8) {
        id = 6;
      }
      return id;
    }
  });
}

async function obtainEasterSunday(liturgyDayInformation: LiturgyDayInformation): Promise<EasterSunday> {
  return fromMaster(EasterSunday, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterOctave ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday
    ) {
      let id = 1;
      return id;
    }
  });
}

async function obtainFiveWeeksOfSundayLentParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<FiveWeeksOfSundayLentParts> {
  return fromMaster(FiveWeeksOfSundayLentParts, () => {
    if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
      let id = parseInt(liturgyDayInformation.today.week);
      return id;
    }
  });
}

async function obtainFiveWeeksOfFirstsVespersOfSundayLentParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<FiveWeeksOfSundayLentParts> {
  return fromMaster(FiveWeeksOfSundayLentParts, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks ||
      liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.LentAshes
    ) {
      let id = 1;
      if (liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.LentAshes) {
        id = parseInt(liturgyDayInformation.today.week) + 1;
      }
      return id;
    }
  });
}

async function obtainVespersCommonPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<VespersCommonPsalter> {
  return fromMaster(VespersCommonPsalter, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      let weekDayNormalVespers =
        liturgyDayInformation.today.date.getDay() === 6 ? 1 : liturgyDayInformation.today.date.getDay() + 2;
      let cycle = parseInt(liturgyDayInformation.today.weekCycle);
      if (liturgyDayInformation.today.date.getDay() === 6) {
        cycle = cycle === 4 ? 1 : cycle + 1;
      }
      if (todayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
        cycle = 1;
      }
      return (cycle - 1) * 7 + weekDayNormalVespers;
    }
  });
}

async function obtainSolemnityAndFestivityParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<SolemnityAndFestivityParts> {
  return fromMaster(SolemnityAndFestivityParts, () => {
    let id;
    if (
      liturgyDayInformation.today.specialCelebration.specialCelebrationType ===
      SpecialCelebrationTypeEnum.SolemnityAndFestivity
    ) {
      id = liturgyDayInformation.today.specialCelebration.solemnityAndFestivityMasterIdentifier;
    } else if (liturgyDayInformation.today.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal;
    }
    if (id) {
      return id;
    }
  });
}

async function obtainSolemnityAndFestivityWhenFirstVespersParts(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<SolemnityAndFestivityParts> {
  return fromMaster(SolemnityAndFestivityParts, () => {
    let id;
    if (
      liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType ===
      SpecialCelebrationTypeEnum.SolemnityAndFestivity
    ) {
      id = liturgyDayInformation.tomorrow.specialCelebration.solemnityAndFestivityMasterIdentifier;
    } else if (liturgyDayInformation.tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal;
    }
    if (id) {
      return id;
    }
  });
}

async function obtainCommonHourPsalter(liturgyDayInformation: LiturgyDayInformation): Promise<CommonHourPsalter> {
  return fromMaster(CommonHourPsalter, () => {
    if (
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
      liturgyDayInformation.today.specificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave
    ) {
      return (
        (parseInt(liturgyDayInformation.today.weekCycle) - 1) * 7 + (liturgyDayInformation.today.date.getDay() + 1)
      );
    }
  });
}

async function obtainCommonNightPrayerPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonNightPrayerPsalter> {
  return fromMaster(CommonNightPrayerPsalter, () => {
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
    return id;
  });
}

async function obtainCommonOfficeWhenStrongTimesPsalter(
  liturgyDayInformation: LiturgyDayInformation,
): Promise<CommonOfficeWhenStrongTimesPsalter> {
  return fromMaster(CommonOfficeWhenStrongTimesPsalter, () => {
    if (
      liturgyDayInformation.today.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.StrongTime
    ) {
      return liturgyDayInformation.today.specialCelebration.strongTimesMasterIdentifier;
    }
  });
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
          liturgyDayInformation.today.movedDay.originDateShortDatabaseCode,
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
        const row = await DatabaseDataService.obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
          SaintsSolemnities.masterName,
          saintsMemoryOrSolemnityMasterIdentifier,
        );
        const saintsSolemnitiesParts = new SaintsSolemnities(row);
        saintsSolemnitiesParts.commonOfficesForFirstVespers = await obtainCommonOffices(
          saintsSolemnitiesParts.celebration.category,
        );
        return saintsSolemnitiesParts;
      } else {
        const day = DatabaseHelper.getDateShortDatabaseCode(
          liturgyDayInformation.tomorrow.date,
          liturgyDayInformation.tomorrow.movedDay.originDateShortDatabaseCode,
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
            liturgyDayInformation.today.movedDay.originDateShortDatabaseCode,
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
  return fromMaster(SpecialDaysParts, () => {
    if (
      liturgyDayInformation.today.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay ||
      liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay
    ) {
      let id = liturgyDayInformation.today.specialCelebration.specialDaysMasterIdentifier;
      if (
        liturgyDayInformation.tomorrow.specialCelebration.specialCelebrationType ===
        SpecialCelebrationTypeEnum.SpecialDay
      ) {
        id = liturgyDayInformation.tomorrow.specialCelebration.specialDaysMasterIdentifier;
      }
      return id;
    }
  });
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

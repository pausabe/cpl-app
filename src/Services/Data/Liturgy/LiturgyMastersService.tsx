import LiturgyMasters from "../../../Models/LiturgyMasters/LiturgyMasters";
import SoulKeys from '../SoulKeys';
import * as DatabaseDataService from '../DatabaseDataService';
import OfficeCommonPsalter from "../../../Models/LiturgyMasters/OfficeCommonPsalter";
import SecureCall from "../../../Utils/SecureCall";
import InvitationCommonPsalter from "../../../Models/LiturgyMasters/InvitationCommonPsalter";
import OfficeOfOrdinaryTime from "../../../Models/LiturgyMasters/OfficeOfOrdinaryTime";
import PrayersOfOrdinaryTime from "../../../Models/LiturgyMasters/PrayersOfOrdinaryTime";
import CommonPartsUntilFifthWeekOfLentTime from "../../../Models/LiturgyMasters/CommonPartsUntilFifthWeekOfLentTime";
import PartsOfLentTime from "../../../Models/LiturgyMasters/PartsOfLentTime";
import PartsOfFiveWeeksOfLentTime from "../../../Models/LiturgyMasters/PartsOfFiveWeeksOfLentTime";
import CommonPartsOfHolyWeek from "../../../Models/LiturgyMasters/CommonPartsOfHolyWeek";
import PalmSundayParts from "../../../Models/LiturgyMasters/PalmSundayParts";
import PartsOfHolyWeek from "../../../Models/LiturgyMasters/PartsOfHolyWeek";
import PartsOfEasterTriduum from "../../../Models/LiturgyMasters/PartsOfEasterTriduum";
import PartsOfEasterBeforeAscension from "../../../Models/LiturgyMasters/PartsOfEasterBeforeAscension";
import PartsOfEasterOctave from "../../../Models/LiturgyMasters/PartsOfEasterOctave";
import PartsOfEasterAfterAscension from "../../../Models/LiturgyMasters/PartsOfEasterAfterAscension";
import EasterWeekParts from "../../../Models/LiturgyMasters/EasterWeekParts";
import CommonAdventAndChristmasParts from "../../../Models/LiturgyMasters/CommonAdventAndChristmasParts";
import AdventWeekParts from "../../../Models/LiturgyMasters/AdventWeekParts";
import AdventSundayParts from "../../../Models/LiturgyMasters/AdventSundayParts";
import AdventFairDaysParts from "../../../Models/LiturgyMasters/AdventFairDaysParts";
import AdventFairDaysAntiphons from "../../../Models/LiturgyMasters/AdventFairDaysAntiphons";
import ChristmasWhenOctaveParts from "../../../Models/LiturgyMasters/ChristmasWhenOctaveParts";
import ChristmasBeforeEpiphanyParts from "../../../Models/LiturgyMasters/ChristmasBeforeEpiphanyParts";
import SpecialCommonPartsOfEasterSundays from "../../../Models/LiturgyMasters/SpecialCommonPartsOfEasterSundays";
import LaudesCommonPsalter from "../../../Models/LiturgyMasters/LaudesCommonPsalter";
import CommonSpecialPartsOfEaster from "../../../Models/LiturgyMasters/CommonSpecialPartsOfEaster";
import EasterSundayParts from "../../../Models/LiturgyMasters/EasterSundayParts";
import EasterSunday from "../../../Models/LiturgyMasters/EasterSunday";
import FiveWeeksOfSundayLentParts from "../../../Models/LiturgyMasters/FiveWeeksOfSundayLentParts";
import VespersCommonPsalter from "../../../Models/LiturgyMasters/VespersCommonPsalter";
import SolemnityAndFestivityParts from "../../../Models/LiturgyMasters/SolemnityAndFestivityParts";
import CommonHourPsalter from "../../../Models/LiturgyMasters/CommonHourPsalter";
import CommonNightPrayerPsalter from "../../../Models/LiturgyMasters/CommonNightPrayerPsalter";
import CommonOfficeWhenStrongTimesPsalter from "../../../Models/LiturgyMasters/CommonOfficeWhenStrongTimesPsalter";
import SaintsSolemnities from "../../../Models/LiturgyMasters/SaintsSolemnities";
import SaintsMemories from "../../../Models/LiturgyMasters/SaintsMemories";
import SpecialDaysParts from "../../../Models/LiturgyMasters/SpecialDaysParts";
import LiturgyDayInformation, {
    LiturgySpecificDayInformation,
    SpecialCelebrationTypeEnum
} from "../../../Models/LiturgyDayInformation";
import {Settings} from "../../../Models/Settings";
import {CelebrationType} from "../DatabaseEnums";
import * as CelebrationIdentifierService from "../CelebrationIdentifierService";
import * as CelebrationIdentifier from "../CelebrationIdentifierService";
import {Celebration} from "../CelebrationIdentifierService";
import CommonOffice from "../../../Models/LiturgyMasters/CommonOffices";
import Various from "../../../Models/LiturgyMasters/Various";
import {SpecificLiturgyTimeType} from "../CelebrationTimeEnums";
import * as DatabaseHelper from "../../Database/DatabaseDataHelper";

export async function ObtainLiturgyMasters(currentLiturgyDayInformation : LiturgyDayInformation, settings : Settings) : Promise<LiturgyMasters>{
    const liturgyMasters = new LiturgyMasters();
    liturgyMasters.OfficeCommonPsalter = await ObtainOfficeCommonPsalter(currentLiturgyDayInformation);
    liturgyMasters.InvitationCommonPsalter = await ObtainInvitationCommonPsalter(currentLiturgyDayInformation);
    liturgyMasters.OfficeOfOrdinaryTime = await ObtainOfficeOfOrdinaryTime(currentLiturgyDayInformation);
    liturgyMasters.PrayersOfOrdinaryTime = await ObtainPrayersOfOrdinaryTime(currentLiturgyDayInformation);
    liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers = await ObtainPrayersOfOrdinaryTimeWhenFirstVespers(currentLiturgyDayInformation);
    liturgyMasters.CommonPartsUntilFifthWeekOfLentTime = await ObtainCommonPartsUntilFifthWeekOfLentTime(currentLiturgyDayInformation);
    liturgyMasters.PartsOfLentTime = await ObtainPartsOfLentTime(currentLiturgyDayInformation);
    liturgyMasters.PartsOfFiveWeeksOfLentTime = await ObtainPartsOfFiveWeeksOfLentTime(currentLiturgyDayInformation);
    liturgyMasters.CommonPartsOfHolyWeek = await ObtainCommonPartsOfHolyWeek(currentLiturgyDayInformation);
    liturgyMasters.PalmSundayParts = await ObtainPalmSundayParts(currentLiturgyDayInformation);
    liturgyMasters.PartsOfHolyWeek = await ObtainPartsOfHolyWeek(currentLiturgyDayInformation);
    liturgyMasters.PartsOfEasterTriduum = await ObtainPartsOfEasterTriduum(currentLiturgyDayInformation);
    liturgyMasters.PartsOfEasterBeforeAscension = await ObtainPartsOfEasterBeforeAscension(currentLiturgyDayInformation);
    liturgyMasters.PartsOfEasterOctave = await ObtainPartsOfEasterOctave(currentLiturgyDayInformation);
    liturgyMasters.PartsOfEasterAfterAscension = await ObtainPartsOfEasterAfterAscension(currentLiturgyDayInformation);
    liturgyMasters.EasterWeekParts = await ObtainEasterWeekParts(currentLiturgyDayInformation);
    liturgyMasters.CommonAdventAndChristmasParts = await ObtainCommonAdventAndChristmasParts(currentLiturgyDayInformation);
    liturgyMasters.AdventWeekParts = await ObtainAdventWeekParts(currentLiturgyDayInformation);
    liturgyMasters.AdventSundayParts = await ObtainAdventSundayParts(currentLiturgyDayInformation);
    liturgyMasters.AdventFirstVespersOfSundayParts = await ObtainAdventFirstVespersOfSundayParts(currentLiturgyDayInformation);
    liturgyMasters.AdventFairDaysParts = await ObtainAdventFairDaysParts(currentLiturgyDayInformation);
    liturgyMasters.AdventFairDaysAntiphons = await ObtainAdventFairDaysAntiphons(currentLiturgyDayInformation);
    liturgyMasters.ChristmasWhenOctaveParts = await ObtainChristmasWhenOctaveParts(currentLiturgyDayInformation);
    liturgyMasters.ChristmasBeforeEpiphanyParts = await ObtainChristmasBeforeEpiphanyParts(currentLiturgyDayInformation);
    liturgyMasters.SpecialCommonPartsOfEasterSundays = await ObtainSpecialCommonPartsOfEasterSundays(currentLiturgyDayInformation);
    liturgyMasters.LaudesCommonPsalter = await ObtainLaudesCommonPsalter(currentLiturgyDayInformation);
    liturgyMasters.CommonSpecialPartsOfEaster = await ObtainCommonSpecialPartsOfEaster(currentLiturgyDayInformation);
    liturgyMasters.EasterSundayParts = await ObtainEasterSundayParts(currentLiturgyDayInformation);
    liturgyMasters.EasterFirstVespersOfSundayParts = await ObtainEasterFirstVespersOfSundayParts(currentLiturgyDayInformation);
    liturgyMasters.EasterSunday = await ObtainEasterSunday(currentLiturgyDayInformation);
    liturgyMasters.FiveWeeksOfSundayLentParts = await ObtainFiveWeeksOfSundayLentParts(currentLiturgyDayInformation);
    liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts = await ObtainFiveWeeksOfFirstsVespersOfSundayLentParts(currentLiturgyDayInformation);
    liturgyMasters.VespersCommonPsalter = await ObtainVespersCommonPsalter(currentLiturgyDayInformation);
    liturgyMasters.SolemnityAndFestivityParts = await ObtainSolemnityAndFestivityParts(currentLiturgyDayInformation);
    liturgyMasters.SolemnityAndFestivityWhenFirstVespersParts = await ObtainSolemnityAndFestivityWhenFirstVespersParts(currentLiturgyDayInformation);
    liturgyMasters.CommonHourPsalter = await ObtainCommonHourPsalter(currentLiturgyDayInformation);
    liturgyMasters.CommonNightPrayerPsalter = await ObtainCommonNightPrayerPsalter(currentLiturgyDayInformation);
    liturgyMasters.CommonOfficeWhenStrongTimesPsalter = await ObtainCommonOfficeWhenStrongTimesPsalter(currentLiturgyDayInformation);
    liturgyMasters.SaintsSolemnities = await ObtainSaintsSolemnities(currentLiturgyDayInformation, settings);
    liturgyMasters.SaintsSolemnitiesWhenFirstsVespersParts = await ObtainSaintsSolemnitiesWhenFirstsVespersParts(currentLiturgyDayInformation, settings);
    liturgyMasters.SaintsMemories = await ObtainSaintsMemories(currentLiturgyDayInformation, settings);
    liturgyMasters.SpecialDaysParts = await ObtainSpecialDaysParts(currentLiturgyDayInformation);
    liturgyMasters.Various = await ObtainVarious();
    return liturgyMasters;
}

async function ObtainOfficeCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<OfficeCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum &&
            liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave &&
            liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.ChristmasOctave) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(OfficeCommonPsalter.MasterName, id);
            return new OfficeCommonPsalter(row);
        }
    }, new OfficeCommonPsalter());
}

async function ObtainInvitationCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<InvitationCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(InvitationCommonPsalter.MasterName, id);
            return new InvitationCommonPsalter(row);
        }
    }, new InvitationCommonPsalter());
}

async function ObtainOfficeOfOrdinaryTime(liturgyDayInformation : LiturgyDayInformation) : Promise<OfficeOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
            const id = (parseInt(liturgyDayInformation.Today.Week) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(OfficeOfOrdinaryTime.MasterName, id);
            return new OfficeOfOrdinaryTime(row);
        }
    }, new OfficeOfOrdinaryTime());
}

async function ObtainPrayersOfOrdinaryTime(liturgyDayInformation : LiturgyDayInformation) : Promise<PrayersOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
            const id = parseInt(liturgyDayInformation.Today.Week);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
            return new PrayersOfOrdinaryTime(row);
        }
    }, new PrayersOfOrdinaryTime());
}

async function ObtainPrayersOfOrdinaryTimeWhenFirstVespers(liturgyDayInformation : LiturgyDayInformation) : Promise<PrayersOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary) {
            const id = parseInt(liturgyDayInformation.Tomorrow.Week);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
            return new PrayersOfOrdinaryTime(row);
        }
    }, new PrayersOfOrdinaryTime());
}

async function ObtainCommonPartsUntilFifthWeekOfLentTime(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonPartsUntilFifthWeekOfLentTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonPartsUntilFifthWeekOfLentTime.MasterName, id);
            return new CommonPartsUntilFifthWeekOfLentTime(row);
        }
    }, new CommonPartsUntilFifthWeekOfLentTime());
}

async function ObtainPartsOfLentTime(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfLentTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
            const id = liturgyDayInformation.Today.Date.getDay() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfLentTime.MasterName, id);
            return new PartsOfLentTime(row);
        }
    }, new PartsOfLentTime());
}

async function ObtainPartsOfFiveWeeksOfLentTime(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfFiveWeeksOfLentTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
            const id = (parseInt(liturgyDayInformation.Today.Week) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfFiveWeeksOfLentTime.MasterName, id);
            return new PartsOfFiveWeeksOfLentTime(row);
        }
    }, new PartsOfFiveWeeksOfLentTime());
}

async function ObtainCommonPartsOfHolyWeek(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonPartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
            liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday || liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonPartsOfHolyWeek.MasterName, id);
            return new CommonPartsOfHolyWeek(row);
        }
    }, new CommonPartsOfHolyWeek());
}

async function ObtainPalmSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<PalmSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday ||
            liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PalmSundayParts.MasterName, id);
            return new PalmSundayParts(row);
        }
    }, new PalmSundayParts());
}

async function ObtainPartsOfHolyWeek(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek ||
            liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek) {
            const id = liturgyDayInformation.Today.Date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfHolyWeek.MasterName, id);
            return new PartsOfHolyWeek(row);
        }
    }, new PartsOfHolyWeek());
}

async function ObtainPartsOfEasterTriduum(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterTriduum> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum ||
            (liturgyDayInformation.Tomorrow.Date.getDay() === 5 &&
                liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum)) {
            const id = liturgyDayInformation.Today.Date.getDay() - 3;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterTriduum.MasterName, id);
            return new PartsOfEasterTriduum(row);
        }
    }, new PartsOfEasterTriduum());
}

async function ObtainPartsOfEasterBeforeAscension(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterBeforeAscension> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterBeforeAscension.MasterName, id);
            return new PartsOfEasterBeforeAscension(row);
        }
    }, new PartsOfEasterBeforeAscension());
}

async function ObtainPartsOfEasterOctave(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterOctave> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
            const id = liturgyDayInformation.Today.Date.getDay() === 0 ? 7 : liturgyDayInformation.Today.Date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterOctave.MasterName, id);
            return new PartsOfEasterOctave(row);
        }
    }, new PartsOfEasterOctave());
}

async function ObtainPartsOfEasterAfterAscension(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterAfterAscension> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterAfterAscension.MasterName, id);
            return new PartsOfEasterAfterAscension(row);
        }
    }, new PartsOfEasterAfterAscension());
}

async function ObtainEasterWeekParts(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterWeekParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
            let id = (parseInt(liturgyDayInformation.Today.Week) - 2) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            if (id === 43) { // Id 43 should be for Pentecost sunday, but it's inside another Master and not this one
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterWeekParts.MasterName, id);
            return new EasterWeekParts(row);
        }
    }, new EasterWeekParts());
}

async function ObtainCommonAdventAndChristmasParts(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonAdventAndChristmasParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary ||
            TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
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
                    }
                    else {
                        id = 4;
                    }
                    break;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonAdventAndChristmasParts.MasterName, id);
            return new CommonAdventAndChristmasParts(row);
        }
    }, new CommonAdventAndChristmasParts());
}

function TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation : LiturgyDayInformation) : boolean{
    return liturgyDayInformation.Tomorrow.Date.getDay() === 0 &&
        liturgyDayInformation.Tomorrow.Week === '1' &&
        liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks;
}

async function ObtainAdventWeekParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventWeekParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks || TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
            //Week begins with saturday
            let auxCicle = liturgyDayInformation.Today.WeekCycle;
            if (TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
                auxCicle = '1';
            }
            let id;
            if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary && liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks) {
                id = 1;
            }
            else {
                id = (parseInt(auxCicle) - 1) * 7 + liturgyDayInformation.Today.Date.getDay() + 2;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventWeekParts.MasterName, id);
            return new AdventWeekParts(row);
        }
    }, new AdventWeekParts());
}

async function ObtainAdventSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
            let id = parseInt(liturgyDayInformation.Today.WeekCycle);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
            return new AdventSundayParts(row);
        }
    }, new AdventSundayParts());
}

async function ObtainAdventFirstVespersOfSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks ||
            liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs ||
            TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
            let id = parseInt(liturgyDayInformation.Today.WeekCycle) + 1;
            if (TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
            return new AdventSundayParts(row);
        }
    }, new AdventSundayParts());
}

async function ObtainAdventFairDaysParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventFairDaysParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
            let id = liturgyDayInformation.Today.Date.getDate() - 16;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventFairDaysParts.MasterName, id);
            return new AdventFairDaysParts(row);
        }
    }, new AdventFairDaysParts());
}

async function ObtainAdventFairDaysAntiphons(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventFairDaysAntiphons> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs) {
            let id = liturgyDayInformation.Today.Date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventFairDaysAntiphons.MasterName, id);
            return new AdventFairDaysAntiphons(row);
        }
    }, new AdventFairDaysAntiphons());
}

async function ObtainChristmasWhenOctaveParts(liturgyDayInformation : LiturgyDayInformation) : Promise<ChristmasWhenOctaveParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave &&
            !CelebrationIdentifier.CheckCelebration(Celebration.Christmas, liturgyDayInformation.Today)) {
            let id = liturgyDayInformation.Today.Date.getDate() === 1?
                1 : liturgyDayInformation.Today.Date.getDate() - 25;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(ChristmasWhenOctaveParts.MasterName, id);
            return new ChristmasWhenOctaveParts(row);
        }
    }, new ChristmasWhenOctaveParts());
}

async function ObtainChristmasBeforeEpiphanyParts(liturgyDayInformation : LiturgyDayInformation) : Promise<ChristmasBeforeEpiphanyParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary) {
            const id = liturgyDayInformation.Today.Date.getDate() < 6 ? liturgyDayInformation.Today.Date.getDate() - 1 : liturgyDayInformation.Today.Date.getDate() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(ChristmasBeforeEpiphanyParts.MasterName, id);
            return new ChristmasBeforeEpiphanyParts(row);
        }
    }, new ChristmasBeforeEpiphanyParts());
}

async function ObtainSpecialCommonPartsOfEasterSundays(liturgyDayInformation : LiturgyDayInformation) : Promise<SpecialCommonPartsOfEasterSundays> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SpecialCommonPartsOfEasterSundays.MasterName, id);
            return new SpecialCommonPartsOfEasterSundays(row);
        }
    }, new SpecialCommonPartsOfEasterSundays());
}

async function ObtainLaudesCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<LaudesCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum && liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave) {
            let weekCycle = parseInt(liturgyDayInformation.Today.WeekCycle);
            let dayNumber = liturgyDayInformation.Today.Date.getDay();

            // Special conditions for Christmastime
            const christmasOctaveSpecialDays =
                (liturgyDayInformation.Today.Date.getMonth() === 11 &&
                    (liturgyDayInformation.Today.Date.getDate() === 29 ||
                        liturgyDayInformation.Today.Date.getDate() === 30 ||
                        liturgyDayInformation.Today.Date.getDate() === 31));
            if (liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity ||
                liturgyDayInformation.Today.CelebrationType === CelebrationType.Festivity ||
                christmasOctaveSpecialDays ||
                CelebrationIdentifier.CheckCelebration(Celebration.Epiphany, liturgyDayInformation.Today)) {
                weekCycle = 1;
                dayNumber = 0;
            }
            if (CelebrationIdentifier.CheckCelebration(Celebration.SacredFamily, liturgyDayInformation.Today)) {
                weekCycle = 2;
                dayNumber = liturgyDayInformation.Today.Date.getDay();
            }

            const id = (weekCycle - 1) * 7 + (dayNumber + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LaudesCommonPsalter.MasterName, id);
            return new LaudesCommonPsalter(row);
        }
    }, new LaudesCommonPsalter());
}

async function ObtainCommonSpecialPartsOfEaster(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonSpecialPartsOfEaster> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 6 + (liturgyDayInformation.Today.Date.getDay());
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonSpecialPartsOfEaster.MasterName, id);
            return new CommonSpecialPartsOfEaster(row);
        }
    }, new CommonSpecialPartsOfEaster());
}

async function ObtainEasterSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
            let id = parseInt(liturgyDayInformation.Today.Week) - 1;
            if (id === 7) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
            return new EasterSundayParts(row);
        }
    }, new EasterSundayParts());
}

async function ObtainEasterFirstVespersOfSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks) {
            let id = parseInt(liturgyDayInformation.Today.Week);
            if (id === 7 || id === 8) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
            return new EasterSundayParts(row);
        }
    }, new EasterSundayParts());
}

async function ObtainEasterSunday(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterSunday> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave || liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) {
            let id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSunday.MasterName, id);
            return new EasterSunday(row);
        }
    }, new EasterSunday());
}

async function ObtainFiveWeeksOfSundayLentParts(liturgyDayInformation : LiturgyDayInformation) : Promise<FiveWeeksOfSundayLentParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks) {
            let id = parseInt(liturgyDayInformation.Today.Week);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
            return new FiveWeeksOfSundayLentParts(row);
        }
    }, new FiveWeeksOfSundayLentParts());
}

async function ObtainFiveWeeksOfFirstsVespersOfSundayLentParts(liturgyDayInformation : LiturgyDayInformation) : Promise<FiveWeeksOfSundayLentParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentWeeks || liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes) {
            let id = 1;
            if (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.LentAshes) {
                id = parseInt(liturgyDayInformation.Today.Week) + 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
            return new FiveWeeksOfSundayLentParts(row);
        }
    }, new FiveWeeksOfSundayLentParts());
}

async function ObtainVespersCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<VespersCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum && liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave) {
            let weekDayNormalVespers = liturgyDayInformation.Today.Date.getDay() === 6 ? 1 : liturgyDayInformation.Today.Date.getDay() + 2;
            let cicle = parseInt(liturgyDayInformation.Today.WeekCycle);
            if (liturgyDayInformation.Today.Date.getDay() === 6) {
                cicle = cicle === 4? 1 : cicle + 1;
            }
            if (TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
                cicle = 1;
            }
            const id = (cicle - 1) * 7 + weekDayNormalVespers;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(VespersCommonPsalter.MasterName, id);
            return new VespersCommonPsalter(row);
        }
    }, new VespersCommonPsalter());
}

async function ObtainSolemnityAndFestivityParts(liturgyDayInformation : LiturgyDayInformation) : Promise<SolemnityAndFestivityParts> {
    return await SecureCall(async () => {
        let id;
        if (liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SolemnityAndFestivity){
            id = liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier;
        }
        else if(liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
            id = SoulKeys.tempsSolemnitatsFestes_Nadal;
        }
        if(id){
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SolemnityAndFestivityParts.MasterName, id);
            return new SolemnityAndFestivityParts(row);
        }
    }, new SolemnityAndFestivityParts());
}

async function ObtainSolemnityAndFestivityWhenFirstVespersParts(liturgyDayInformation : LiturgyDayInformation) : Promise<SolemnityAndFestivityParts> {
    return await SecureCall(async () => {
        let id;
        if (liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SolemnityAndFestivity){
            id = liturgyDayInformation.Tomorrow.SpecialCelebration.SolemnityAndFestivityMasterIdentifier;
        }
        else if(liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
            id = SoulKeys.tempsSolemnitatsFestes_Nadal;
        }
        if(id){
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SolemnityAndFestivityParts.MasterName, id);
            return new SolemnityAndFestivityParts(row);
        }
    }, new SolemnityAndFestivityParts());
}

async function ObtainCommonHourPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonHourPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.PaschalTriduum && liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterOctave) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonHourPsalter.MasterName, id);
            return new CommonHourPsalter(row);
        }
    }, new CommonHourPsalter());
}

async function ObtainCommonNightPrayerPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonNightPrayerPsalter> {
    return await SecureCall(async () => {
        let id = liturgyDayInformation.Today.Date.getDay() === 6 ? 1 : liturgyDayInformation.Today.Date.getDay() + 2;
        if ((liturgyDayInformation.Tomorrow.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday ||
            liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SolemnityAndFestivity
            || liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Solemnity) &&
            !(liturgyDayInformation.Today.Date.getDay() === 6 || liturgyDayInformation.Today.Date.getDay() === 0)) {
            id = 8;
        }
        if ((liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity ||
            liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SolemnityAndFestivity) &&
            !(liturgyDayInformation.Today.Date.getDay() === 6 || liturgyDayInformation.Today.Date.getDay() === 0)) {
            id = 9;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterOctave) {
            id = 2;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.ChristmasOctave) {
            id = 9;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.HolyWeek &&
            (liturgyDayInformation.Today.Date.getDay() === 4 || liturgyDayInformation.Today.Date.getDay() === 5 ||
                liturgyDayInformation.Today.Date.getDay() === 6)) {
            id = 9;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === SpecificLiturgyTimeType.PaschalTriduum) {
            id = 9;
        }
        const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonNightPrayerPsalter.MasterName, id);
        return new CommonNightPrayerPsalter(row);
    }, new CommonNightPrayerPsalter());
}

async function ObtainCommonOfficeWhenStrongTimesPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonOfficeWhenStrongTimesPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.StrongTime) {
            const id = liturgyDayInformation.Today.SpecialCelebration.StrongTimesMasterIdentifier;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonOfficeWhenStrongTimesPsalter.MasterName, id);
            return new CommonOfficeWhenStrongTimesPsalter(row);
        }
    }, new CommonOfficeWhenStrongTimesPsalter());
}

async function ObtainSaintsSolemnities(liturgyDayInformation : LiturgyDayInformation, settings : Settings) : Promise<SaintsSolemnities> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
            liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
                liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SpecialDay &&
                (liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity ||
                    liturgyDayInformation.Today.CelebrationType === CelebrationType.Festivity)) {
            let saintsMemoryOrSolemnityMasterIdentifier = ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDayInformation.Today);
            if (saintsMemoryOrSolemnityMasterIdentifier === -1) {
                let day = DatabaseHelper.GetDateShortDatabaseCode(liturgyDayInformation.Today.Date, settings.DioceseName, liturgyDayInformation.Today.MovedDay.OriginDateShortDatabaseCode, liturgyDayInformation.Today.MovedDay.DioceseCode);
                const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesAsync(SaintsSolemnities.MasterName, day, settings.DioceseCode, settings.PrayingPlace, settings.DioceseName, liturgyDayInformation.Today.GenericLiturgyTime);
                const saintsSolemnitiesParts = new SaintsSolemnities(row);
                saintsSolemnitiesParts.CommonOffices = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
            else {
                const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(SaintsSolemnities.MasterName, saintsMemoryOrSolemnityMasterIdentifier);
                const saintsSolemnitiesParts = new SaintsSolemnities(row);
                saintsSolemnitiesParts.CommonOffices = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
        }
    }, new SaintsSolemnities());
}

async function ObtainSaintsSolemnitiesWhenFirstsVespersParts(liturgyDayInformation : LiturgyDayInformation, settings : Settings) : Promise<SaintsSolemnities> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Tomorrow.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
            liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
            liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SpecialDay &&
            (liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Solemnity ||
                liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Festivity)) {
            let saintsMemoryOrSolemnityMasterIdentifier = ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDayInformation.Tomorrow);
            if (saintsMemoryOrSolemnityMasterIdentifier !== -1) {
                const row = DatabaseDataService.ObtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(SaintsSolemnities.MasterName, saintsMemoryOrSolemnityMasterIdentifier);
                const saintsSolemnitiesParts = new SaintsSolemnities(row);
                saintsSolemnitiesParts.CommonOfficesForFirstVespers = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
            else {
                let day = '-';
                if (liturgyDayInformation.Tomorrow.MovedDay.OriginDateShortDatabaseCode !== '-' &&
                    DatabaseHelper.IsMovedDiocese(settings.DioceseName, liturgyDayInformation.Tomorrow.MovedDay.DioceseCode)) {
                    day = liturgyDayInformation.Tomorrow.MovedDay.OriginDateShortDatabaseCode;
                }

                if (day === '-') {
                    day = DatabaseHelper.GetDateShortDatabaseCode(liturgyDayInformation.Tomorrow.Date, settings.DioceseName, '-', '-');
                }
                const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesAsync(SaintsSolemnities.MasterName, day, settings.DioceseCode, settings.PrayingPlace, settings.DioceseName, liturgyDayInformation.Today.GenericLiturgyTime);
                const saintsSolemnitiesParts = new SaintsSolemnities(row);
                saintsSolemnitiesParts.CommonOfficesForFirstVespers = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
        }
    }, new SaintsSolemnities());
}

async function ObtainSaintsMemories(liturgyDayInformation : LiturgyDayInformation, settings : Settings) : Promise<SaintsMemories> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType !== SpecialCelebrationTypeEnum.SolemnityAndFestivity &&
            (liturgyDayInformation.Today.CelebrationType === CelebrationType.Memory ||
                liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalMemory ||
                liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory)) {
            let masterIdentifierOfVariableDays = ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDayInformation.Today);

            if (liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory &&
                masterIdentifierOfVariableDays === -1) {
                const row = await DatabaseDataService.ObtainFreeVirginMemoryAsync();
                const saintsMemories = new SaintsMemories(row);
                saintsMemories.CommonOffices = await ObtainCommonOffices(saintsMemories.Celebration.Category);
                return saintsMemories;
            }
            else {
                if (masterIdentifierOfVariableDays === -1) {
                    const day = DatabaseHelper.GetDateShortDatabaseCode(liturgyDayInformation.Today.Date, settings.DioceseName, liturgyDayInformation.Today.MovedDay.OriginDateShortDatabaseCode, liturgyDayInformation.Today.MovedDay.DioceseCode);
                    const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesAsync(SaintsMemories.MasterName, day, settings.DioceseCode, settings.PrayingPlace, settings.DioceseName, liturgyDayInformation.Today.GenericLiturgyTime);
                    const saintsMemories = new SaintsMemories(row);
                    saintsMemories.CommonOffices = await ObtainCommonOffices(saintsMemories.Celebration.Category);
                    return saintsMemories;
                }
                else {
                    const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(SaintsMemories.MasterName, masterIdentifierOfVariableDays);
                    const saintsMemories = new SaintsMemories(row);
                    saintsMemories.CommonOffices = await ObtainCommonOffices(saintsMemories.Celebration.Category);
                    return saintsMemories;
                }
            }
        }
    }, new SaintsMemories());
}

async function ObtainSpecialDaysParts(liturgyDayInformation : LiturgyDayInformation) : Promise<SpecialDaysParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay ||
            liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay) {
            let id = liturgyDayInformation.Today.SpecialCelebration.SpecialDaysMasterIdentifier;
            if (liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialCelebrationType === SpecialCelebrationTypeEnum.SpecialDay) {
                id = liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialDaysMasterIdentifier;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SpecialDaysParts.MasterName, id);
            return new SpecialDaysParts(row);
        }
    }, new SpecialDaysParts());
}

async function ObtainVarious() : Promise<Various> {
    return await SecureCall(async () => {
        const table = await DatabaseDataService.ObtainMasterTableFromDatabase(Various.MasterName);
        return new Various(table);
    }, new Various());
}

async function ObtainCommonOffices(category : string) : Promise<CommonOffice>{
    return await SecureCall(async () => {
        if (category && category !== '0000') {
            const row = await DatabaseDataService.ObtainCommonOfficesAsync(category);
            return new CommonOffice(row);
        }
    }, new CommonOffice());
}

/*
  Return id of #santsMemories or #santsSolemnitats or -1 if there isn't there
*/
function ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDateInformation : LiturgySpecificDayInformation) {
    if (CelebrationIdentifierService.CheckCelebration(Celebration.ImmaculateHeartOfTheBlessedVirginMary, liturgyDateInformation)) {
        return SoulKeys.santsMemories_CorImmaculatBenauradaVergeMaria;
    }
    if(CelebrationIdentifierService.CheckCelebration(Celebration.MotherOfGodFromTheTibbon, liturgyDateInformation)){
        if (liturgyDateInformation.CelebrationType === CelebrationType.Memory) {
            return SoulKeys.santsMemories_MareDeuCinta;
        }
        if (liturgyDateInformation.CelebrationType === CelebrationType.Solemnity) {
            return SoulKeys.santsSolemnitats_MareDeuCinta;
        }
    }
    if(CelebrationIdentifierService.CheckCelebration(Celebration.JesusChristHighPriestForever, liturgyDateInformation)){
        return SoulKeys.santsSolemnitats_JesucristGranSacerdotSempre;
    }
    if(CelebrationIdentifierService.CheckCelebration(Celebration.BlessedVirginMaryMotherOfTheChurch, liturgyDateInformation)){
        return SoulKeys.santsMemories_BenauradaVergeMariaMareEsglesia;
    }
    return -1;
}

import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import GlobalKeys from "../../Utils/GlobalKeys";
import SoulKeys from '../SoulKeys';
import * as DatabaseDataService from '../DatabaseDataService';
import OfficeCommonPsalter from "../../Models/LiturgyMasters/OfficeCommonPsalter";
import SecureCall from "../../Utils/SecureCall";
import InvitationCommonPsalter from "../../Models/LiturgyMasters/InvitationCommonPsalter";
import GlobalFunctions from '../../Utils/GlobalFunctions';
import OfficeOfOrdinaryTime from "../../Models/LiturgyMasters/OfficeOfOrdinaryTime";
import PrayersOfOrdinaryTime from "../../Models/LiturgyMasters/PrayersOfOrdinaryTime";
import CommonPartsUntilFifthWeekOfLentTime from "../../Models/LiturgyMasters/CommonPartsUntilFifthWeekOfLentTime";
import PartsOfLentTime from "../../Models/LiturgyMasters/PartsOfLentTime";
import PartsOfFiveWeeksOfLentTime from "../../Models/LiturgyMasters/PartsOfFiveWeeksOfLentTime";
import CommonPartsOfHolyWeek from "../../Models/LiturgyMasters/CommonPartsOfHolyWeek";
import PalmSundayParts from "../../Models/LiturgyMasters/PalmSundayParts";
import PartsOfHolyWeek from "../../Models/LiturgyMasters/PartsOfHolyWeek";
import PartsOfEasterTriduum from "../../Models/LiturgyMasters/PartsOfEasterTriduum";
import PartsOfEasterBeforeAscension from "../../Models/LiturgyMasters/PartsOfEasterBeforeAscension";
import PartsOfEasterOctave from "../../Models/LiturgyMasters/PartsOfEasterOctave";
import PartsOfEasterAfterAscension from "../../Models/LiturgyMasters/PartsOfEasterAfterAscension";
import EasterWeekParts from "../../Models/LiturgyMasters/EasterWeekParts";
import CommonAdventAndChristmasParts from "../../Models/LiturgyMasters/CommonAdventAndChristmasParts";
import AdventWeekParts from "../../Models/LiturgyMasters/AdventWeekParts";
import AdventSundayParts from "../../Models/LiturgyMasters/AdventSundayParts";
import AdventFairDaysParts from "../../Models/LiturgyMasters/AdventFairDaysParts";
import AdventFairDaysAntiphons from "../../Models/LiturgyMasters/AdventFairDaysAntiphons";
import ChristmasWhenOctaveParts from "../../Models/LiturgyMasters/ChristmasWhenOctaveParts";
import ChristmasBeforeEpiphanyParts from "../../Models/LiturgyMasters/ChristmasBeforeEpiphanyParts";
import SpecialCommonPartsOfEasterSundays from "../../Models/LiturgyMasters/SpecialCommonPartsOfEasterSundays";
import LaudesCommonPsalter from "../../Models/LiturgyMasters/LaudesCommonPsalter";
import CommonSpecialPartsOfEaster from "../../Models/LiturgyMasters/CommonSpecialPartsOfEaster";
import EasterSundayParts from "../../Models/LiturgyMasters/EasterSundayParts";
import EasterSunday from "../../Models/LiturgyMasters/EasterSunday";
import FiveWeeksOfSundayLentParts from "../../Models/LiturgyMasters/FiveWeeksOfSundayLentParts";
import VespersCommonPsalter from "../../Models/LiturgyMasters/VespersCommonPsalter";
import SolemnityAndFestivityParts from "../../Models/LiturgyMasters/SolemnityAndFestivityParts";
import CommonHourPsalter from "../../Models/LiturgyMasters/CommonHourPsalter";
import CommonNightPrayerPsalter from "../../Models/LiturgyMasters/CommonNightPrayerPsalter";
import CommonOfficeWhenStrongTimesPsalter from "../../Models/LiturgyMasters/CommonOfficeWhenStrongTimesPsalter";
import SaintsSolemnitiesParts from "../../Models/LiturgyMasters/SaintsSolemnitiesParts";
import SaintsMemories from "../../Models/LiturgyMasters/SaintsMemories";
import SpecialDaysParts from "../../Models/LiturgyMasters/SpecialDaysParts";
import LiturgyDayInformation, {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import GLOBAL from "../../Utils/GlobalKeys";
import {CelebrationType} from "../DatabaseEnums";
import * as CelebrationIdentifierService from "../CelebrationIdentifierService";
import CommonOffices from "../../Models/LiturgyMasters/CommonOffices";
import Various from "../../Models/LiturgyMasters/Various";

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
    liturgyMasters.CommonHourPsalter = await ObtainCommonHourPsalter(currentLiturgyDayInformation);
    liturgyMasters.CommonNightPrayerPsalter = await ObtainCommonNightPrayerPsalter(currentLiturgyDayInformation);
    liturgyMasters.CommonOfficeWhenStrongTimesPsalter = await ObtainCommonOfficeWhenStrongTimesPsalter(currentLiturgyDayInformation);
    liturgyMasters.SaintsSolemnitiesParts = await ObtainSaintsSolemnitiesParts(currentLiturgyDayInformation, settings);
    liturgyMasters.SaintsSolemnitiesWhenFirstsVespersParts = await ObtainSaintsSolemnitiesWhenFirstsVespersParts(currentLiturgyDayInformation, settings);
    liturgyMasters.SaintsMemories = await ObtainSaintsMemories(currentLiturgyDayInformation, settings);
    liturgyMasters.SpecialDaysParts = await ObtainSpecialDaysParts(currentLiturgyDayInformation);
    liturgyMasters.Various = await ObtainVarious(currentLiturgyDayInformation);
    return liturgyMasters;
}

async function ObtainOfficeCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<OfficeCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.Q_TRIDU &&
            liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.P_OCTAVA &&
            liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.N_OCTAVA) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(OfficeCommonPsalter.MasterName, id);
            return new OfficeCommonPsalter(row);
        }
    });
}

async function ObtainInvitationCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<InvitationCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.O_ORDINARI) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(InvitationCommonPsalter.MasterName, id);
            return new InvitationCommonPsalter(row);
        }
    });
}

async function ObtainOfficeOfOrdinaryTime(liturgyDayInformation : LiturgyDayInformation) : Promise<OfficeOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.O_ORDINARI) {
            const id = (parseInt(liturgyDayInformation.Today.Week) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(OfficeOfOrdinaryTime.MasterName, id);
            return new OfficeOfOrdinaryTime(row);
        }
    });
}

async function ObtainPrayersOfOrdinaryTime(liturgyDayInformation : LiturgyDayInformation) : Promise<PrayersOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.O_ORDINARI) {
            const id = parseInt(liturgyDayInformation.Today.Week);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
            return new PrayersOfOrdinaryTime(row);
        }
    });
}

async function ObtainPrayersOfOrdinaryTimeWhenFirstVespers(liturgyDayInformation : LiturgyDayInformation) : Promise<PrayersOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.O_ORDINARI) {
            const id = parseInt(liturgyDayInformation.Today.Week) + 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
            return new PrayersOfOrdinaryTime(row);
        }
    });
}

async function ObtainCommonPartsUntilFifthWeekOfLentTime(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonPartsUntilFifthWeekOfLentTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_CENDRA || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_SETMANES) {
            const id = parseInt(liturgyDayInformation.Today.Week);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonPartsUntilFifthWeekOfLentTime.MasterName, id);
            return new CommonPartsUntilFifthWeekOfLentTime(row);
        }
    });
}

async function ObtainPartsOfLentTime(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfLentTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_CENDRA) {
            const id = liturgyDayInformation.Today.Date.getDay() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfLentTime.MasterName, id);
            return new PartsOfLentTime(row);
        }
    });
}

async function ObtainPartsOfFiveWeeksOfLentTime(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfFiveWeeksOfLentTime> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_SETMANES) {
            const id = (parseInt(liturgyDayInformation.Today.Week) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfFiveWeeksOfLentTime.MasterName, id);
            return new PartsOfFiveWeeksOfLentTime(row);
        }
    });
}

async function ObtainCommonPartsOfHolyWeek(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonPartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_DIUM_RAMS || liturgyDayInformation.Tomorrow.SpecificLiturgyTime === GLOBAL.Q_DIUM_RAMS || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_SET_SANTA) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonPartsOfHolyWeek.MasterName, id);
            return new CommonPartsOfHolyWeek(row);
        }
    });
}

async function ObtainPalmSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<PalmSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_DIUM_RAMS || liturgyDayInformation.Tomorrow.SpecificLiturgyTime === GLOBAL.Q_DIUM_RAMS) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PalmSundayParts.MasterName, id);
            return new PalmSundayParts(row);
        }
    });
}

async function ObtainPartsOfHolyWeek(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_DIUM_RAMS || liturgyDayInformation.Tomorrow.SpecificLiturgyTime === GLOBAL.Q_DIUM_RAMS) {
            const id = liturgyDayInformation.Today.Date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfHolyWeek.MasterName, id);
            return new PartsOfHolyWeek(row);
        }
    });
}

async function ObtainPartsOfEasterTriduum(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterTriduum> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_TRIDU || (liturgyDayInformation.Tomorrow.Date.getDay() === 5 && liturgyDayInformation.Tomorrow.SpecificLiturgyTime === GLOBAL.Q_TRIDU)) {
            const id = liturgyDayInformation.Today.Date.getDay() - 3;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterTriduum.MasterName, id);
            return new PartsOfEasterTriduum(row);
        }
    });
}

async function ObtainPartsOfEasterBeforeAscension(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterBeforeAscension> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_OCTAVA || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterTriduum.MasterName, id);
            return new PartsOfEasterBeforeAscension(row);
        }
    });
}

async function ObtainPartsOfEasterOctave(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterOctave> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_OCTAVA) {
            const id = liturgyDayInformation.Today.Date.getDay() === 0 ? 7 : liturgyDayInformation.Today.Date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterOctave.MasterName, id);
            return new PartsOfEasterOctave(row);
        }
    });
}

async function ObtainPartsOfEasterAfterAscension(liturgyDayInformation : LiturgyDayInformation) : Promise<PartsOfEasterAfterAscension> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterAfterAscension.MasterName, id);
            return new PartsOfEasterAfterAscension(row);
        }
    });
}

async function ObtainEasterWeekParts(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterWeekParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_SETMANES) {
            let id = (parseInt(liturgyDayInformation.Today.Week) - 2) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            if (id === 43) { // Id 43 should be for Pentecost sunday, but it's inside another Master and not this one
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterWeekParts.MasterName, id);
            return new EasterWeekParts(row);
        }
    });
}

async function ObtainCommonAdventAndChristmasParts(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonAdventAndChristmasParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_SETMANES ||
            liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_FERIES ||
            liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.N_OCTAVA ||
            liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.N_ABANS ||
            TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
            let id = 1;
            switch (liturgyDayInformation.Today.SpecificLiturgyTime) {
                case GlobalKeys.A_SETMANES:
                    id = 1;
                    break;
                case GlobalKeys.A_FERIES:
                    id = 2;
                    break;
                case GlobalKeys.N_OCTAVA:
                    id = 3;
                    break;
                case GlobalKeys.N_ABANS:
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
    });
}

function TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation : LiturgyDayInformation) : boolean{
    return liturgyDayInformation.Tomorrow.Date.getDay() === 0 &&
        liturgyDayInformation.Tomorrow.Week === '1' &&
        liturgyDayInformation.Tomorrow.SpecificLiturgyTime === GLOBAL.A_SETMANES;
}

async function ObtainAdventWeekParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventWeekParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_SETMANES || TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
            //Week begins with saturday
            let auxCicle = liturgyDayInformation.Today.WeekCycle;
            if (TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
                auxCicle = '1';
            }
            let id;
            if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.O_ORDINARI && liturgyDayInformation.Tomorrow.SpecificLiturgyTime === GlobalKeys.A_SETMANES) {
                id = 1;
            }
            else {
                id = (parseInt(auxCicle) - 1) * 7 + liturgyDayInformation.Today.Date.getDay() + 2;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventWeekParts.MasterName, id);
            return new AdventWeekParts(row);
        }
    });
}

async function ObtainAdventSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_SETMANES || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_FERIES) {
            let id = parseInt(liturgyDayInformation.Today.WeekCycle);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
            return new AdventSundayParts(row);
        }
    });
}

async function ObtainAdventFirstVespersOfSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_SETMANES ||
            liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_FERIES ||
            TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
            let id = parseInt(liturgyDayInformation.Today.WeekCycle) + 1;
            if (TodayVespersWillBeFromTomorrowAdventFirstOnes(liturgyDayInformation)) {
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
            return new AdventSundayParts(row);
        }
    });
}

async function ObtainAdventFairDaysParts(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventFairDaysParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_FERIES) {
            let id = liturgyDayInformation.Today.Date.getDate() - 16;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventFairDaysParts.MasterName, id);
            return new AdventFairDaysParts(row);
        }
    });
}

async function ObtainAdventFairDaysAntiphons(liturgyDayInformation : LiturgyDayInformation) : Promise<AdventFairDaysAntiphons> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.A_FERIES) {
            let id = liturgyDayInformation.Today.Date.getDate();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventFairDaysAntiphons.MasterName, id);
            return new AdventFairDaysAntiphons(row);
        }
    });
}

async function ObtainChristmasWhenOctaveParts(liturgyDayInformation : LiturgyDayInformation) : Promise<ChristmasWhenOctaveParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.N_OCTAVA && liturgyDayInformation.Today.Date.getDate() !== 25) {
            let id = liturgyDayInformation.Today.Date.getDate() - 25;
            if (liturgyDayInformation.Today.Date.getDate() === 1) {
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(ChristmasWhenOctaveParts.MasterName, id);
            return new ChristmasWhenOctaveParts(row);
        }
    });
}

async function ObtainChristmasBeforeEpiphanyParts(liturgyDayInformation : LiturgyDayInformation) : Promise<ChristmasBeforeEpiphanyParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.N_ABANS) {
            const id = liturgyDayInformation.Today.Date.getDate() < 6 ? liturgyDayInformation.Today.Date.getDate() - 1 : liturgyDayInformation.Today.Date.getDate() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(ChristmasBeforeEpiphanyParts.MasterName, id);
            return new ChristmasBeforeEpiphanyParts(row);
        }
    });
}

async function ObtainSpecialCommonPartsOfEasterSundays(liturgyDayInformation : LiturgyDayInformation) : Promise<SpecialCommonPartsOfEasterSundays> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SpecialCommonPartsOfEasterSundays.MasterName, id);
            return new SpecialCommonPartsOfEasterSundays(row);
        }
    });
}

async function ObtainLaudesCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<LaudesCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.Q_TRIDU && liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.P_OCTAVA) {
            let cicleAux = parseInt(liturgyDayInformation.Today.WeekCycle);
            let auxDay = liturgyDayInformation.Today.Date.getDay();
            if ((liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier !== -1 && liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier !== 2) ||
                liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity ||
                liturgyDayInformation.Today.CelebrationType === CelebrationType.Festivity ||
                (liturgyDayInformation.Today.Date.getMonth() === 11 &&
                    (liturgyDayInformation.Today.Date.getDate() === 29 ||
                        liturgyDayInformation.Today.Date.getDate() === 30 ||
                        liturgyDayInformation.Today.Date.getDate() === 31)) ||
                (liturgyDayInformation.Today.Date.getMonth() === 0 && liturgyDayInformation.Today.Date.getDate() === 6)) {
                cicleAux = 1;
                auxDay = 0;
            }
            else if (liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier === 2) {
                cicleAux = 2;
            }
            const id = (cicleAux - 1) * 7 + (auxDay + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LaudesCommonPsalter.MasterName, id);
            return new LaudesCommonPsalter(row);
        }
    });
}

async function ObtainCommonSpecialPartsOfEaster(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonSpecialPartsOfEaster> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_SETMANES) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 6 + (liturgyDayInformation.Today.Date.getDay());
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonSpecialPartsOfEaster.MasterName, id);
            return new CommonSpecialPartsOfEaster(row);
        }
    });
}

async function ObtainEasterSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_SETMANES) {
            let id = parseInt(liturgyDayInformation.Today.Week) - 1;
            if (id === 7) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
            return new EasterSundayParts(row);
        }
    });
}

async function ObtainEasterFirstVespersOfSundayParts(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterSundayParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_SETMANES) {
            let id = parseInt(liturgyDayInformation.Today.Week);
            if (id === 7 || id === 8) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
            return new EasterSundayParts(row);
        }
    });
}

async function ObtainEasterSunday(liturgyDayInformation : LiturgyDayInformation) : Promise<EasterSunday> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_OCTAVA || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_DIUM_PASQUA) {
            let id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSunday.MasterName, id);
            return new EasterSunday(row);
        }
    });
}

async function ObtainFiveWeeksOfSundayLentParts(liturgyDayInformation : LiturgyDayInformation) : Promise<FiveWeeksOfSundayLentParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_SETMANES) {
            let id = parseInt(liturgyDayInformation.Today.Week);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
            return new FiveWeeksOfSundayLentParts(row);
        }
    });
}

async function ObtainFiveWeeksOfFirstsVespersOfSundayLentParts(liturgyDayInformation : LiturgyDayInformation) : Promise<FiveWeeksOfSundayLentParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_SETMANES || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_CENDRA) {
            let id = 1;
            if (liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.Q_CENDRA) {
                id = parseInt(liturgyDayInformation.Today.Week) + 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
            return new FiveWeeksOfSundayLentParts(row);
        }
    });
}

async function ObtainVespersCommonPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<VespersCommonPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.Q_TRIDU && liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.P_OCTAVA) {
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
    });
}

async function ObtainSolemnityAndFestivityParts(liturgyDayInformation : LiturgyDayInformation) : Promise<SolemnityAndFestivityParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier !== -1 || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_TRIDU || liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.N_OCTAVA) {
            let id;
            if (liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier === -1 && liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.N_OCTAVA) {
                id = SoulKeys.tempsSolemnitatsFestes_Nadal;
            }
            else {
                id = liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SolemnityAndFestivityParts.MasterName, id);
            return new SolemnityAndFestivityParts(row);
        }
    });
}

async function ObtainCommonHourPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonHourPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.Q_TRIDU && liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.P_OCTAVA) {
            const id = (parseInt(liturgyDayInformation.Today.WeekCycle) - 1) * 7 + (liturgyDayInformation.Today.Date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonHourPsalter.MasterName, id);
            return new CommonHourPsalter(row);
        }
    });
}

async function ObtainCommonNightPrayerPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonNightPrayerPsalter> {
    return await SecureCall(async () => {
        let id = liturgyDayInformation.Today.Date.getDay() === 6 ? 1 : liturgyDayInformation.Today.Date.getDay() + 2;
        if ((liturgyDayInformation.Tomorrow.SpecificLiturgyTime === GlobalKeys.Q_DIUM_PASQUA || liturgyDayInformation.Tomorrow.SpecialCelebration.SolemnityAndFestivityMasterIdentifier !== -1 || liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Solemnity) && !(liturgyDayInformation.Today.Date.getDay() === 6 || liturgyDayInformation.Today.Date.getDay() === 0)) {
            id = 8;
        }
        if ((liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity || liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier !== -1) && !(liturgyDayInformation.Today.Date.getDay() === 6 || liturgyDayInformation.Today.Date.getDay() === 0)) {
            id = 9;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.P_OCTAVA) {
            id = 2;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.N_OCTAVA) {
            id = 9;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_SET_SANTA && (liturgyDayInformation.Today.Date.getDay() === 4 || liturgyDayInformation.Today.Date.getDay() === 5 || liturgyDayInformation.Today.Date.getDay() === 6)) {
            id = 9;
        }
        if (liturgyDayInformation.Today.SpecificLiturgyTime === GlobalKeys.Q_TRIDU) {
            id = 9;
        }
        const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonNightPrayerPsalter.MasterName, id);
        return new CommonNightPrayerPsalter(row);
    });
}

async function ObtainCommonOfficeWhenStrongTimesPsalter(liturgyDayInformation : LiturgyDayInformation) : Promise<CommonOfficeWhenStrongTimesPsalter> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecialCelebration.StrongTimesMasterIdentifier !== -1) {
            const id = liturgyDayInformation.Today.SpecialCelebration.StrongTimesMasterIdentifier;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonOfficeWhenStrongTimesPsalter.MasterName, id);
            return new CommonOfficeWhenStrongTimesPsalter(row);
        }
    });
}

async function ObtainSaintsSolemnitiesParts(liturgyDayInformation : LiturgyDayInformation, settings : Settings) : Promise<SaintsSolemnitiesParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecificLiturgyTime !== GlobalKeys.Q_DIUM_PASQUA && (((liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier === -1 && liturgyDayInformation.Today.SpecialCelebration.SpecialDaysMasterIdentifier === -1) && (liturgyDayInformation.Today.CelebrationType === CelebrationType.Solemnity || liturgyDayInformation.Today.CelebrationType === CelebrationType.Festivity)))) {
            let saintsMemoryOrSolemnityMasterIdentifier = ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDayInformation.Today);
            if (saintsMemoryOrSolemnityMasterIdentifier === -1) {
                let day = GlobalFunctions.calculeDia(liturgyDayInformation.Today.Date, settings.DioceseName, liturgyDayInformation.Today.MovedDay.Date, liturgyDayInformation.Today.MovedDay.DioceseName);
                const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesAsync(SaintsSolemnitiesParts.MasterName, day, settings.DioceseCode, settings.PrayingPlace, settings.DioceseName, liturgyDayInformation.Today.GenericLiturgyTime);
                const saintsSolemnitiesParts = new SaintsSolemnitiesParts(row);
                saintsSolemnitiesParts.CommonOffices = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
            else {
                const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(SaintsSolemnitiesParts.MasterName, saintsMemoryOrSolemnityMasterIdentifier);
                const saintsSolemnitiesParts = new SaintsSolemnitiesParts(row);
                saintsSolemnitiesParts.CommonOffices = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
        }
    });
}

async function ObtainSaintsSolemnitiesWhenFirstsVespersParts(liturgyDayInformation : LiturgyDayInformation, settings : Settings) : Promise<SaintsSolemnitiesParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Tomorrow.CelebrationType === CelebrationType.Solemnity) {
            let saintsMemoryOrSolemnityMasterIdentifier = ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDayInformation.Tomorrow);
            if (saintsMemoryOrSolemnityMasterIdentifier !== -1) {
                const row = DatabaseDataService.ObtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(SaintsSolemnitiesParts.MasterName, saintsMemoryOrSolemnityMasterIdentifier);
                const saintsSolemnitiesParts = new SaintsSolemnitiesParts(row);
                saintsSolemnitiesParts.CommonOfficesForFirstVespers = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
            else {
                let day = '-';
                if (liturgyDayInformation.Tomorrow.MovedDay.Date !== '-' && GlobalFunctions.isDiocesiMogut(settings.DioceseName, liturgyDayInformation.Tomorrow.MovedDay.DioceseName)) {
                    day = liturgyDayInformation.Tomorrow.MovedDay.Date;
                }

                if (day === '-') {
                    let tomorrowDay = new Date(liturgyDayInformation.Today.Date.getFullYear(), liturgyDayInformation.Today.Date.getMonth(), (liturgyDayInformation.Today.Date.getDate() + 1));
                    day = GlobalFunctions.calculeDia(tomorrowDay, settings.DioceseName, '-', '-');
                }
                const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesAsync(SaintsSolemnitiesParts.MasterName, day, settings.DioceseCode, settings.PrayingPlace, settings.DioceseName, liturgyDayInformation.Today.GenericLiturgyTime);
                const saintsSolemnitiesParts = new SaintsSolemnitiesParts(row);
                saintsSolemnitiesParts.CommonOfficesForFirstVespers = await ObtainCommonOffices(saintsSolemnitiesParts.Celebration.Category);
                return saintsSolemnitiesParts;
            }
        }
    });
}

async function ObtainSaintsMemories(liturgyDayInformation : LiturgyDayInformation, settings : Settings) : Promise<SaintsMemories> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecialCelebration.SolemnityAndFestivityMasterIdentifier === -1 && (liturgyDayInformation.Today.CelebrationType === CelebrationType.Memory || liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalMemory || liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory)) {
            let saintsMemoryOrSolemnityMasterIdentifier = ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDayInformation.Today);

            if (liturgyDayInformation.Today.CelebrationType === CelebrationType.OptionalVirginMemory && saintsMemoryOrSolemnityMasterIdentifier === -1) {
                const row = await DatabaseDataService.ObtainFreeVirginMemoryAsync();
                const saintsMemories = new SaintsMemories(row);
                saintsMemories.CommonOffices = await ObtainCommonOffices(saintsMemories.Celebration.Category);
                return saintsMemories;
            }
            else {
                if (saintsMemoryOrSolemnityMasterIdentifier === -1) {
                    const day = GlobalFunctions.calculeDia(liturgyDayInformation.Today.Date, settings.DioceseName, liturgyDayInformation.Today.MovedDay.Date, liturgyDayInformation.Today.MovedDay.DioceseName);
                    const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesAsync(SaintsMemories.MasterName, day, settings.DioceseCode, settings.PrayingPlace, settings.DioceseName, liturgyDayInformation.Today.GenericLiturgyTime);
                    const saintsMemories = new SaintsMemories(row);
                    saintsMemories.CommonOffices = await ObtainCommonOffices(saintsMemories.Celebration.Category);
                    return saintsMemories;
                }
                else {
                    const row = await DatabaseDataService.ObtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(SaintsMemories.MasterName, saintsMemoryOrSolemnityMasterIdentifier);
                    const saintsMemories = new SaintsMemories(row);
                    saintsMemories.CommonOffices = await ObtainCommonOffices(saintsMemories.Celebration.Category);
                    return saintsMemories;
                }
            }
        }
    });
}

async function ObtainSpecialDaysParts(liturgyDayInformation : LiturgyDayInformation) : Promise<SpecialDaysParts> {
    return await SecureCall(async () => {
        if (liturgyDayInformation.Today.SpecialCelebration.SpecialDaysMasterIdentifier !== -1 ||
            liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialDaysMasterIdentifier !== -1) {
            let id = liturgyDayInformation.Today.SpecialCelebration.SpecialDaysMasterIdentifier;
            if (liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialDaysMasterIdentifier !== -1) {
                id = liturgyDayInformation.Tomorrow.SpecialCelebration.SpecialDaysMasterIdentifier;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SpecialDaysParts.MasterName, id);
            return new SpecialDaysParts(row);
        }
    });
}

async function ObtainVarious(liturgyDayInformation : LiturgyDayInformation) : Promise<Various> {
    return await SecureCall(async () => {
        const table = await DatabaseDataService.ObtainMasterTableFromDatabase(Various.MasterName);
        return new Various(table);
    });
}

async function ObtainCommonOffices(category : string) : Promise<CommonOffices>{
    return await SecureCall(async () => {
        if (category && category !== '0000') {
            const row = await DatabaseDataService.ObtainCommonOfficesAsync(category);
            return new CommonOffices(row);
        }
    });
}

/*
  Return id of #santsMemories or #santsSolemnitats or -1 if there isn't there
*/
function ObtainSaintsMemoriesOrSolemnitiesMasterIdentifier(liturgyDateInformation : LiturgySpecificDayInformation) {
    if (CelebrationIdentifierService.IsImmaculateHeartOfTheBlessedVirginMary(liturgyDateInformation)) {
        return SoulKeys.santsMemories_CorImmaculatBenauradaVergeMaria;
    }
    if(CelebrationIdentifierService.MotherOfGodFromTheTibbon(liturgyDateInformation)){
        if (liturgyDateInformation.CelebrationType === CelebrationType.Memory) {
            return SoulKeys.santsMemories_MareDeuCinta;
        }
        if (liturgyDateInformation.CelebrationType === CelebrationType.Solemnity) {
            return SoulKeys.santsSolemnitats_MareDeuCinta;
        }
    }
    if(CelebrationIdentifierService.JesusChristHighPriestForever(liturgyDateInformation)){
        return SoulKeys.santsSolemnitats_JesucristGranSacerdotSempre;
    }
    if(CelebrationIdentifierService.BlessedVirginMaryMotherOfTheChurch(liturgyDateInformation)){
        return SoulKeys.santsMemories_BenauradaVergeMariaMareEsglesia;
    }
    return -1;
}

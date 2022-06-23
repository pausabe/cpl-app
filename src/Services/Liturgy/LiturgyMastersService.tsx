import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import GlobalKeys from "../../Utils/GlobalKeys";
import SoulKeys from '../../Controllers/Classes/SOUL/SoulKeys';
import * as DatabaseDataService from '../DatabaseDataService';
import OfficeCommonPsalter from "../../Models/LiturgyMasters/OfficeCommonPsalter";
import SecureCall from "../../Utils/SecureCall";
import InvitatoryCommonPsalter from "../../Models/LiturgyMasters/InvitatoryCommonPsalter";
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

export async function ObtainLiturgyMasters(globalData) : Promise<LiturgyMasters>{
    const liturgyMasters = new LiturgyMasters();
    liturgyMasters.OfficeCommonPsalter = await ObtainOfficeCommonPsalter(globalData);
    liturgyMasters.InvitatoryCommonPsalter = await ObtainInvitatoryCommonPsalter(globalData);
    liturgyMasters.OfficeOfOrdinaryTime = await ObtainOfficeOfOrdinaryTime(globalData);
    liturgyMasters.PrayersOfOrdinaryTime = await ObtainPrayersOfOrdinaryTime(globalData);
    liturgyMasters.PrayersOfOrdinaryTimeWhenFirstVespers = await ObtainPrayersOfOrdinaryTimeWhenFirstVespers(globalData);
    liturgyMasters.CommonPartsUntilFifthWeekOfLentTime = await ObtainCommonPartsUntilFifthWeekOfLentTime(globalData);
    liturgyMasters.PartsOfLentTime = await ObtainPartsOfLentTime(globalData);
    liturgyMasters.PartsOfFiveWeeksOfLentTime = await ObtainPartsOfFiveWeeksOfLentTime(globalData);
    liturgyMasters.CommonPartsOfHolyWeek = await ObtainCommonPartsOfHolyWeek(globalData);
    liturgyMasters.PalmSundayParts = await ObtainPalmSundayParts(globalData);
    liturgyMasters.PartsOfHolyWeek = await ObtainPartsOfHolyWeek(globalData);
    liturgyMasters.PartsOfEasterTriduum = await ObtainPartsOfEasterTriduum(globalData);
    liturgyMasters.PartsOfEasterBeforeAscension = await ObtainPartsOfEasterBeforeAscension(globalData);
    liturgyMasters.PartsOfEasterOctave = await ObtainPartsOfEasterOctave(globalData);
    liturgyMasters.PartsOfEasterAfterAscension = await ObtainPartsOfEasterAfterAscension(globalData);
    liturgyMasters.EasterWeekParts = await ObtainEasterWeekParts(globalData);
    liturgyMasters.CommonAdventAndChristmasParts = await ObtainCommonAdventAndChristmasParts(globalData);
    liturgyMasters.AdventWeekParts = await ObtainAdventWeekParts(globalData);
    liturgyMasters.AdventSundayParts = await ObtainAdventSundayParts(globalData);
    liturgyMasters.AdventFirstVespersOfSundayParts = await ObtainAdventFirstVespersOfSundayParts(globalData);
    liturgyMasters.AdventFairDaysParts = await ObtainAdventFairDaysParts(globalData);
    liturgyMasters.AdventFairDaysAntiphons = await ObtainAdventFairDaysAntiphons(globalData);
    liturgyMasters.ChristmasWhenOctaveParts = await ObtainChristmasWhenOctaveParts(globalData);
    liturgyMasters.ChristmasBeforeEpiphanyParts = await ObtainChristmasBeforeEpiphanyParts(globalData);
    liturgyMasters.SpecialCommonPartsOfEasterSundays = await ObtainSpecialCommonPartsOfEasterSundays(globalData);
    liturgyMasters.LaudesCommonPsalter = await ObtainLaudesCommonPsalter(globalData);
    liturgyMasters.CommonSpecialPartsOfEaster = await ObtainCommonSpecialPartsOfEaster(globalData);
    liturgyMasters.EasterSundayParts = await ObtainEasterSundayParts(globalData);
    liturgyMasters.EasterFirstVespersOfSundayParts = await ObtainEasterFirstVespersOfSundayParts(globalData);
    liturgyMasters.EasterSunday = await ObtainEasterSunday(globalData);
    liturgyMasters.FiveWeeksOfSundayLentParts = await ObtainFiveWeeksOfSundayLentParts(globalData);
    liturgyMasters.FiveWeeksOfFirstsVespersOfSundayLentParts = await ObtainFiveWeeksOfFirstsVespersOfSundayLentParts(globalData);
    liturgyMasters.VespersCommonPsalter = await ObtainVespersCommonPsalter(globalData);
    liturgyMasters.SolemnityAndFestivityParts = await ObtainSolemnityAndFestivityParts(globalData);
    liturgyMasters.CommonHourPsalter = await ObtainCommonHourPsalter(globalData);
    liturgyMasters.CommonNightPrayerPsalter = await ObtainCommonNightPrayerPsalter(globalData);
    liturgyMasters.CommonOfficeWhenStrongTimesPsalter = await ObtainCommonOfficeWhenStrongTimesPsalter(globalData);
    liturgyMasters.SaintsSolemnitiesParts = await ObtainSaintsSolemnitiesParts(globalData);
    liturgyMasters.SaintsSolemnitiesWhenFirstsVespersParts = await ObtainSaintsSolemnitiesWhenFirstsVespersParts(globalData);
    liturgyMasters.SaintsMemories = await ObtainSaintsMemories(globalData);
    liturgyMasters.SpecialDaysParts = await ObtainSpecialDaysParts(globalData);
    return liturgyMasters;
}

async function ObtainOfficeCommonPsalter(globalData) : Promise<OfficeCommonPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_TRIDU &&
            globalData.LT !== GlobalKeys.P_OCTAVA &&
            globalData.LT !== GlobalKeys.N_OCTAVA) {
            const id = (parseInt(globalData.cicle) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(OfficeCommonPsalter.MasterName, id);
            return new OfficeCommonPsalter(row);
        }
    });
}

async function ObtainInvitatoryCommonPsalter(globalData) : Promise<InvitatoryCommonPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = (parseInt(globalData.cicle) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(InvitatoryCommonPsalter.MasterName, id);
            return new InvitatoryCommonPsalter(row);
        }
    });
}

async function ObtainOfficeOfOrdinaryTime(globalData) : Promise<OfficeOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = (parseInt(globalData.setmana) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(OfficeOfOrdinaryTime.MasterName, id);
            return new OfficeOfOrdinaryTime(row);
        }
    });
}

async function ObtainPrayersOfOrdinaryTime(globalData) : Promise<PrayersOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = parseInt(globalData.setmana);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
            return new PrayersOfOrdinaryTime(row);
        }
    });
}

async function ObtainPrayersOfOrdinaryTimeWhenFirstVespers(globalData) : Promise<PrayersOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = parseInt(globalData.setmana) + 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PrayersOfOrdinaryTime.MasterName, id);
            return new PrayersOfOrdinaryTime(row);
        }
    });
}

async function ObtainCommonPartsUntilFifthWeekOfLentTime(globalData) : Promise<CommonPartsUntilFifthWeekOfLentTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_CENDRA || globalData.LT === GlobalKeys.Q_SETMANES) {
            const id = parseInt(globalData.setmana);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonPartsUntilFifthWeekOfLentTime.MasterName, id);
            return new CommonPartsUntilFifthWeekOfLentTime(row);
        }
    });
}

async function ObtainPartsOfLentTime(globalData) : Promise<PartsOfLentTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_CENDRA) {
            const id = globalData.date.getDay() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfLentTime.MasterName, id);
            return new PartsOfLentTime(row);
        }
    });
}

async function ObtainPartsOfFiveWeeksOfLentTime(globalData) : Promise<PartsOfFiveWeeksOfLentTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_SETMANES) {
            const id = (parseInt(globalData.setmana) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfFiveWeeksOfLentTime.MasterName, id);
            return new PartsOfFiveWeeksOfLentTime(row);
        }
    });
}

async function ObtainCommonPartsOfHolyWeek(globalData) : Promise<CommonPartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_DIUM_RAMS || tomorrowCal === 'DR' || globalData.LT === GlobalKeys.Q_SET_SANTA) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonPartsOfHolyWeek.MasterName, id);
            return new CommonPartsOfHolyWeek(row);
        }
    });
}

async function ObtainPalmSundayParts(globalData) : Promise<PalmSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_DIUM_RAMS || tomorrowCal === 'DR') {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PalmSundayParts.MasterName, id);
            return new PalmSundayParts(row);
        }
    });
}

async function ObtainPartsOfHolyWeek(globalData) : Promise<PartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_DIUM_RAMS || tomorrowCal === 'DR') {
            const id = globalData.date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfHolyWeek.MasterName, id);
            return new PartsOfHolyWeek(row);
        }
    });
}

async function ObtainPartsOfEasterTriduum(globalData) : Promise<PartsOfEasterTriduum> {
    return await SecureCall(async () => {
        if (tomorrowCal === 'T' || globalData.LT === GlobalKeys.Q_TRIDU) {
            const id = globalData.date.getDay() - 3;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterTriduum.MasterName, id);
            return new PartsOfEasterTriduum(row);
        }
    });
}

async function ObtainPartsOfEasterBeforeAscension(globalData) : Promise<PartsOfEasterBeforeAscension> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_OCTAVA || globalData.LT === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterTriduum.MasterName, id);
            return new PartsOfEasterBeforeAscension(row);
        }
    });
}

async function ObtainPartsOfEasterOctave(globalData) : Promise<PartsOfEasterOctave> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_OCTAVA) {
            const id = globalData.date.getDay() === 0 ? 7 : globalData.date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterOctave.MasterName, id);
            return new PartsOfEasterOctave(row);
        }
    });
}

async function ObtainPartsOfEasterAfterAscension(globalData) : Promise<PartsOfEasterAfterAscension> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(PartsOfEasterAfterAscension.MasterName, id);
            return new PartsOfEasterAfterAscension(row);
        }
    });
}

async function ObtainEasterWeekParts(globalData) : Promise<EasterWeekParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            let id = (parseInt(globalData.setmana) - 2) * 7 + (globalData.date.getDay() + 1);
            if (id === 43) id = 1; //TODO: diumenge de pentacosta (no està dins tempsPasquaSetmanes). Apaño perquè no peti
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterWeekParts.MasterName, id);
            return new EasterWeekParts(row);
        }
    });
}

async function ObtainCommonAdventAndChristmasParts(globalData) : Promise<CommonAdventAndChristmasParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_SETMANES ||
            globalData.LT === GlobalKeys.A_FERIES ||
            globalData.LT === GlobalKeys.N_OCTAVA ||
            globalData.LT === GlobalKeys.N_ABANS ||
            tomorrowCal === 'A') {
            let id = 1;
            switch (globalData.LT) {
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
                    if (globalData.date.getDate() < 6) {
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

async function ObtainAdventWeekParts(globalData) : Promise<AdventWeekParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_SETMANES || tomorrowCal === 'A') {
            //Week begins with saturday
            let auxCicle = globalData.cicle;
            if (tomorrowCal === 'A') {
                auxCicle = 1;
            }
            let id;
            if (globalData.LT === GlobalKeys.O_ORDINARI && globalData.dataTomorrow.LT === GlobalKeys.A_SETMANES) {
                id = 1;
            }
            else {
                id = (parseInt(auxCicle) - 1) * 7 + globalData.date.getDay() + 2;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventWeekParts.MasterName, id);
            return new AdventWeekParts(row);
        }
    });
}

async function ObtainAdventSundayParts(globalData) : Promise<AdventSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_SETMANES || globalData.LT === GlobalKeys.A_FERIES) {
            let id = parseInt(globalData.cicle);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
            return new AdventSundayParts(row);
        }
    });
}

async function ObtainAdventFirstVespersOfSundayParts(globalData) : Promise<AdventSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_SETMANES || globalData.LT === GlobalKeys.A_FERIES || tomorrowCal === 'A') {
            let id = parseInt(globalData.cicle) + 1;
            if (tomorrowCal === 'A') {
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventSundayParts.MasterName, id);
            return new AdventSundayParts(row);
        }
    });
}

async function ObtainAdventFairDaysParts(globalData) : Promise<AdventFairDaysParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_FERIES) {
            let id = globalData.date.getDate() - 16;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventFairDaysParts.MasterName, id);
            return new AdventFairDaysParts(row);
        }
    });
}

async function ObtainAdventFairDaysAntiphons(globalData) : Promise<AdventFairDaysAntiphons> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_FERIES && auxDay !== 0) {
            let id = globalData.date.getDate();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(AdventFairDaysAntiphons.MasterName, id);
            return new AdventFairDaysAntiphons(row);
        }
    });
}

async function ObtainChristmasWhenOctaveParts(globalData) : Promise<ChristmasWhenOctaveParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.N_OCTAVA && globalData.date.getDate() !== 25) {
            let id = globalData.date.getDate() - 25;
            if (globalData.date.getDate() === 1) {
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(ChristmasWhenOctaveParts.MasterName, id);
            return new ChristmasWhenOctaveParts(row);
        }
    });
}

async function ObtainChristmasBeforeEpiphanyParts(globalData) : Promise<ChristmasBeforeEpiphanyParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.N_ABANS) {
            const id = globalData.date.getDate() < 6 ? globalData.date.getDate() - 1 : globalData.date.getDate() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(ChristmasBeforeEpiphanyParts.MasterName, id);
            return new ChristmasBeforeEpiphanyParts(row);
        }
    });
}

async function ObtainSpecialCommonPartsOfEasterSundays(globalData) : Promise<SpecialCommonPartsOfEasterSundays> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SpecialCommonPartsOfEasterSundays.MasterName, id);
            return new SpecialCommonPartsOfEasterSundays(row);
        }
    });
}

async function ObtainLaudesCommonPsalter(globalData) : Promise<LaudesCommonPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_TRIDU && globalData.LT !== GlobalKeys.P_OCTAVA) {
            let cicleAux = parseInt(globalData.cicle);
            let auxDay = globalData.date.getDay();
            if (params.idTSF !== -1 ||
                globalData.celType === 'S' ||
                globalData.celType === 'F' ||
                (globalData.date.getMonth() === 11 &&
                    (globalData.date.getDate() === 29 ||
                        globalData.date.getDate() === 30 ||
                        globalData.date.getDate() === 31)) ||
                (globalData.date.getMonth() === 0 && globalData.date.getDate() === 6)) {
                cicleAux = 1;
                auxDay = 0;
            }
            else if (params.idTSF === 2) {
                cicleAux = 2;
            }
            const id = (cicleAux - 1) * 7 + (auxDay + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LaudesCommonPsalter.MasterName, id);
            return new LaudesCommonPsalter(row);
        }
    });
}

async function ObtainCommonSpecialPartsOfEaster(globalData) : Promise<CommonSpecialPartsOfEaster> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            const id = (parseInt(globalData.cicle) - 1) * 6 + (globalData.date.getDay());
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonSpecialPartsOfEaster.MasterName, id);
            return new CommonSpecialPartsOfEaster(row);
        }
    });
}

async function ObtainEasterSundayParts(globalData) : Promise<EasterSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            let id = parseInt(globalData.setmana) - 1;
            if (id === 7) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
            return new EasterSundayParts(row);
        }
    });
}

async function ObtainEasterFirstVespersOfSundayParts(globalData) : Promise<EasterSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            let id = parseInt(globalData.setmana);
            if (id === 7 || id === 8) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSundayParts.MasterName, id);
            return new EasterSundayParts(row);
        }
    });
}

async function ObtainEasterSunday(globalData) : Promise<EasterSunday> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_OCTAVA || globalData.LT === GlobalKeys.Q_DIUM_PASQUA) {
            let id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(EasterSunday.MasterName, id);
            return new EasterSunday(row);
        }
    });
}

async function ObtainFiveWeeksOfSundayLentParts(globalData) : Promise<FiveWeeksOfSundayLentParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_SETMANES) {
            let id = parseInt(globalData.setmana);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
            return new FiveWeeksOfSundayLentParts(row);
        }
    });
}

async function ObtainFiveWeeksOfFirstsVespersOfSundayLentParts(globalData) : Promise<FiveWeeksOfSundayLentParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_SETMANES || globalData.LT === GlobalKeys.Q_CENDRA) {
            let id = 1;
            if (globalData.LT !== GlobalKeys.Q_CENDRA) {
                id = parseInt(globalData.setmana) + 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(FiveWeeksOfSundayLentParts.MasterName, id);
            return new FiveWeeksOfSundayLentParts(row);
        }
    });
}

async function ObtainVespersCommonPsalter(globalData) : Promise<VespersCommonPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_TRIDU && globalData.LT !== GlobalKeys.P_OCTAVA) {
            let weekDayNormalVespers = globalData.date.getDay() === 6 ? 1 : globalData.date.getDay() + 2;
            let cicle = parseInt(globalData.cicle);
            if (globalData.date.getDay() === 6) {
                cicle = cicle === 4? 1 : cicle + 1;
            }
            if (tomorrowCal === 'A') {
                cicle = 1;
            }
            const id = (cicle - 1) * 7 + weekDayNormalVespers;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(VespersCommonPsalter.MasterName, id);
            return new VespersCommonPsalter(row);
        }
    });
}

async function ObtainSolemnityAndFestivityParts(globalData) : Promise<SolemnityAndFestivityParts> {
    return await SecureCall(async () => {
        if (params.idTSF !== -1 || globalData.LT === GlobalKeys.Q_TRIDU || globalData.LT === GlobalKeys.N_OCTAVA) {
            let id;
            if (params.idTSF === -1 && globalData.LT === GlobalKeys.N_OCTAVA) {
                id = SoulKeys.tempsSolemnitatsFestes_Nadal;
            }
            else {
                id = params.idTSF;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SolemnityAndFestivityParts.MasterName, id);
            return new SolemnityAndFestivityParts(row);
        }
    });
}

async function ObtainCommonHourPsalter(globalData) : Promise<CommonHourPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_TRIDU && globalData.LT !== GlobalKeys.P_OCTAVA) {
            const id = (parseInt(globalData.cicle) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonHourPsalter.MasterName, id);
            return new CommonHourPsalter(row);
        }
    });
}

async function ObtainCommonNightPrayerPsalter(globalData) : Promise<CommonNightPrayerPsalter> {
    return await SecureCall(async () => {
        let id = globalData.date.getDay() === 6 ? 1 : globalData.date.getDay() + 2;
        if ((globalData.dataTomorrow.LT === GlobalKeys.Q_DIUM_PASQUA || tomorrowCal === 'TSF' || tomorrowCal === 'S') && !(globalData.date.getDay() === 6 || globalData.date.getDay() === 0)) {
            id = 8;
        }
        if ((globalData.celType === 'S' || idTSF !== -1) && !(globalData.date.getDay() === 6 || globalData.date.getDay() === 0)) {
            id = 9;
        }
        if (globalData.LT === GlobalKeys.P_OCTAVA) {
            id = 2;
        }
        if (globalData.LT === GlobalKeys.N_OCTAVA) {
            id = 9;
        }
        if (globalData.LT === GlobalKeys.Q_SET_SANTA && (globalData.date.getDay() === 4 || globalData.date.getDay() === 5 || globalData.date.getDay() === 6)) {
            id = 9;
        }
        if (globalData.LT === GlobalKeys.Q_TRIDU) {
            id = 9;
        }
        const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonNightPrayerPsalter.MasterName, id);
        return new CommonNightPrayerPsalter(row);
    });
}

async function ObtainCommonOfficeWhenStrongTimesPsalter(globalData) : Promise<CommonOfficeWhenStrongTimesPsalter> {
    return await SecureCall(async () => {
        if (idTF !== -1) {
            const id = idTF;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(CommonOfficeWhenStrongTimesPsalter.MasterName, id);
            // TODO:
            //queryRows.salteriComuOficiTF.com2 = '-';
            //queryRows.salteriComuOficiTF.com3 = '-';
            return new CommonOfficeWhenStrongTimesPsalter(row);
        }
        // TODO:
        /*
        else {
            queryRows.salteriComuOficiTF = '';
         }
         */
    });
}

async function ObtainSaintsSolemnitiesParts(globalData) : Promise<SaintsSolemnitiesParts> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_DIUM_PASQUA && (((params.idTSF === -1 && params.idDE === -1) && (globalData.celType === 'S' || globalData.celType === 'F')))) {
            let idDM = diesMov(globalData.date, globalData.LT, globalData.setmana, globalData.pentacosta, globalData.celType);
            if (idDM === -1) {
                let day = GlobalFunctions.calculeDia(globalData.date, globalData.diocesi, globalData.diaMogut, globalData.diocesiMogut);
                // TODO:
                DatabaseDataService.getSolMem(SaintsSolemnitiesParts.MasterName, day, globalData.diocesi, globalData.lloc, globalData.diocesiName, globalData.tempsespecific, (result) => {
                    queryRows.santsSolemnitats = result;
                    getOficisComuns(params, result, false);
                });
            }
            else {
                // TODO:
                DatabaseDataService.getSolMemDiesMov(SaintsSolemnitiesParts.MasterName, idDM, (result) => {
                    queryRows.santsSolemnitats = result;
                    getOficisComuns(params, result, false);
                });
            }
        }
    });
}

async function ObtainSaintsSolemnitiesWhenFirstsVespersParts(globalData) : Promise<SaintsSolemnitiesParts> {
    return await SecureCall(async () => {
        if (tomorrowCal === 'S') {
            let idDM = diesMov(globalData.dataTomorrow.date, globalData.dataTomorrow.LT, globalData.dataTomorrow.setmana, globalData.pentacosta, globalData.dataTomorrow.celType);
            if (idDM !== -1) {
                params.vespres1 = true;
                // TODO:
                DatabaseDataService.getSolMemDiesMov(SaintsSolemnitiesParts.MasterName, idDM, (result) => {
                    queryRows.santsSolemnitatsFVespres1 = result;
                    getOficisComuns(params, result, true);
                });
            }
            else {
                let day = '-';
                if (globalData.dataTomorrow.diaMogut !== '-' && GlobalFunctions.isDiocesiMogut(globalData.diocesi, globalData.dataTomorrow.diocesiMogut)) {
                    day = globalData.dataTomorrow.diaMogut;
                }

                if (day === '-') {
                    let tomorrowDay = new Date(globalData.date.getFullYear(), globalData.date.getMonth(), (globalData.date.getDate() + 1));
                    day = GlobalFunctions.calculeDia(tomorrowDay, globalData.diocesi, '-', '-');
                }
                params.vespres1 = true;
                // TODO:
                DatabaseDataService.getSolMem(SaintsSolemnitiesParts.MasterName, day, globalData.diocesi, globalData.lloc, globalData.diocesiName, globalData.tempsespecific, (result) => {
                    queryRows.santsSolemnitatsFVespres1 = result;
                    getOficisComuns(params, result, true);
                });
            }
        }
    });
}

async function ObtainSaintsMemories(globalData) : Promise<SaintsMemories> {
    return await SecureCall(async () => {
        if (params.idTSF === -1 && (globalData.celType === 'M' || globalData.celType === 'L' || globalData.celType === 'V')) {
            let idDM = diesMov(globalData.date, globalData.LT, globalData.setmana, globalData.pentacosta, globalData.celType);

            if (globalData.celType === 'V' && idDM === -1) {
                DatabaseDataService.getV((result) => {
                    queryRows.santsMemories = result;
                    getOficisComuns(params, result, false);
                });
            }
            else {
                if (idDM === -1) {
                    const day = GlobalFunctions.calculeDia(globalData.date, globalData.diocesi, globalData.diaMogut, globalData.diocesiMogut);
                    DatabaseDataService.getSolMem(SaintsMemories.MasterName, day, globalData.diocesi, globalData.lloc, globalData.diocesiName, globalData.tempsespecific, (result) => {
                        queryRows.santsMemories = result;
                        getOficisComuns(params, result, false);
                    });
                }
                else {
                    DatabaseDataService.getSolMemDiesMov(SaintsMemories.MasterName, idDM, (result) => {
                        queryRows.santsMemories = result;
                        getOficisComuns(params, result, false);
                    });
                }
            }
        }
    });
}

async function ObtainSpecialDaysParts(globalData) : Promise<SpecialDaysParts> {
    return await SecureCall(async (master: string, rowId: number) => {
        if (tomorrowCal === 'DE' || params.idDE !== -1) {
            let id = params.idDE;
            if (tomorrowCal === 'DE') {
                id = idDETomorrow;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(SpecialDaysParts.MasterName, id);
            return new SpecialDaysParts(row);
        }
    });
}
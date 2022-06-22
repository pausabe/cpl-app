import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import GlobalKeys from "../../Utils/GlobalKeys";
import SoulKeys from '../../Controllers/Classes/SOUL/SoulKeys';
import * as DatabaseDataService from '../DatabaseDataService';
import OfficeCommonPsalter from "../../Models/LiturgyMasters/OfficeCommonPsalter";
import LiturgyMastersKeys from "../../Models/LiturgyMasters/LiturgyMastersKeys";
import SecureCall from "../../Utils/SecureCall";
import InvitatoryCommonPsalter from "../../Models/LiturgyMasters/InvitatoryCommonPsalter";
import GlobalFunctions from '../../Utils/GlobalFunctions';

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
    liturgyMasters.ObtainCommonAdventAndChristmasParts = await ObtainCommonAdventAndChristmasParts(globalData);
    liturgyMasters.ObtainAdventWeekParts = await ObtainAdventWeekParts(globalData);
    liturgyMasters.ObtainAdventSundayParts = await ObtainAdventSundayParts(globalData);
    liturgyMasters.ObtainAdventFirstVespersOfSundayParts = await ObtainAdventFirstVespersOfSundayParts(globalData);
    liturgyMasters.ObtainAdventFairDaysParts = await ObtainAdventFairDaysParts(globalData);
    liturgyMasters.ObtainAdventFairDaysAntiphons = await ObtainAdventFairDaysAntiphons(globalData);
    liturgyMasters.ObtainChristmasWhenOctaveParts = await ObtainChristmasWhenOctaveParts(globalData);
    liturgyMasters.ObtainChristmasBeforeEpiphanyParts = await ObtainChristmasBeforeEpiphanyParts(globalData);
    liturgyMasters.ObtainSpecialCommonPartsOfEasterSundays = await ObtainSpecialCommonPartsOfEasterSundays(globalData);
    liturgyMasters.ObtainLaudesCommonPsalter = await ObtainLaudesCommonPsalter(globalData);
    liturgyMasters.ObtainCommonSpecialPartsOfEaster = await ObtainCommonSpecialPartsOfEaster(globalData);
    liturgyMasters.ObtainEasterSundayParts = await ObtainEasterSundayParts(globalData);
    liturgyMasters.ObtainEasterFirstVespersOfSundayParts = await ObtainEasterFirstVespersOfSundayParts(globalData);
    liturgyMasters.ObtainEasterSunday = await ObtainEasterSunday(globalData);
    liturgyMasters.ObtainFiveWeeksOfSundayLentParts = await ObtainFiveWeeksOfSundayLentParts(globalData);
    liturgyMasters.ObtainFiveWeeksOfFirstsVespersOfSundayLentParts = await ObtainFiveWeeksOfFirstsVespersOfSundayLentParts(globalData);
    liturgyMasters.ObtainVespersCommonPsalter = await ObtainVespersCommonPsalter(globalData);
    liturgyMasters.ObtainSolemnityOrFestivityParts = await ObtainSolemnityOrFestivityParts(globalData);
    liturgyMasters.ObtainCommonHourPsalter = await ObtainCommonHourPsalter(globalData);
    liturgyMasters.ObtainCommonNightPrayerPsalter = await ObtainCommonNightPrayerPsalter(globalData);
    liturgyMasters.ObtainCommonOfficeWhenStrongTimesPsalter = await ObtainCommonOfficeWhenStrongTimesPsalter(globalData);
    liturgyMasters.ObtainSaintsOrSolemnitiesParts = await ObtainSaintsOrSolemnitiesParts(globalData);
    liturgyMasters.ObtainSaintsOrSolemnitiesWhenFirstsVespersParts = await ObtainSaintsOrSolemnitiesWhenFirstsVespersParts(globalData);
    liturgyMasters.ObtainSaintsOrMemories = await ObtainSaintsOrMemories(globalData);
    liturgyMasters.SpecialDaysParts = await ObtainSpecialDaysParts(globalData);
    return liturgyMasters;
}

async function ObtainOfficeCommonPsalter(globalData) : Promise<OfficeCommonPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_TRIDU &&
            globalData.LT !== GlobalKeys.P_OCTAVA &&
            globalData.LT !== GlobalKeys.N_OCTAVA) {
            const id = (parseInt(globalData.cicle) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.OfficeCommonPsalter, id);
            return new OfficeCommonPsalter(row);
        }
    });
}

async function ObtainInvitatoryCommonPsalter(globalData) : Promise<InvitatoryCommonPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = (parseInt(globalData.cicle) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.InvitatoryCommonPsalter, id);
            return new InvitatoryCommonPsalter(row);
        }
    });
}

//tempsOrdinariOfici
async function ObtainOfficeOfOrdinaryTime(globalData) : Promise<OfficeOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = (parseInt(globalData.setmana) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.OfficeOfOrdinaryTime, id);
            return new OfficeOfOrdinaryTime(row);
        }
    });
}

//tempsOrdinariOracions
async function ObtainPrayersOfOrdinaryTime(globalData) : Promise<PrayersOfOrdinaryTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = parseInt(globalData.setmana);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PrayersOfOrdinaryTime, id);
            return new PrayersOfOrdinaryTime(row);
        }
    });
}

//tempsOrdinariOracions (firsts vespers)
async function ObtainPrayersOfOrdinaryTimeWhenFirstVespers(globalData) : Promise<PrayersOfOrdinaryTimeWhenFirstVespers> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.O_ORDINARI) {
            const id = parseInt(globalData.setmana) + 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PrayersOfOrdinaryTimeWhenFirstVespers, id);
            return new PrayersOfOrdinaryTimeWhenFirstVespers(row);
        }
    });
}

//tempsQuaresmaComuFV
async function ObtainCommonPartsUntilFifthWeekOfLentTime(globalData) : Promise<CommonPartsUntilFifthWeekOfLentTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_CENDRA || globalData.LT === GlobalKeys.Q_SETMANES) {
            const id = parseInt(globalData.setmana);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.CommonPartsUntilFifthWeekOfLentTime, id);
            return new CommonPartsUntilFifthWeekOfLentTime(row);
        }
    });
}

//tempsQuaresmaCendra
async function ObtainPartsOfLentTime(globalData) : Promise<PartsOfLentTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_CENDRA) {
            const id = globalData.date.getDay() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PartsOfLentTime, id);
            return new PartsOfLentTime(row);
        }
    });
}

//tempsQuaresmaVSetmanes
async function ObtainPartsOfFiveWeeksOfLentTime(globalData) : Promise<PartsOfFiveWeeksOfLentTime> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_SETMANES) {
            const id = (parseInt(globalData.setmana) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PartsOfFiveWeeksOfLentTime, id);
            return new PartsOfFiveWeeksOfLentTime(row);
        }
    });
}

//tempsQuaresmaComuSS
async function ObtainCommonPartsOfHolyWeek(globalData) : Promise<CommonPartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_DIUM_RAMS || tomorrowCal === 'DR' || globalData.LT === GlobalKeys.Q_SET_SANTA) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.CommonPartsOfHolyWeek, id);
            return new CommonPartsOfHolyWeek(row);
        }
    });
}

//tempsQuaresmaRams
async function ObtainPalmSundayParts(globalData) : Promise<PalmSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_DIUM_RAMS || tomorrowCal === 'DR') {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PalmSundayParts, id);
            return new PalmSundayParts(row);
        }
    });
}

//tempsQuaresmaSetSanta
async function ObtainPartsOfHolyWeek(globalData) : Promise<PartsOfHolyWeek> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_DIUM_RAMS || tomorrowCal === 'DR') {
            const id = globalData.date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PartsOfHolyWeek, id);
            return new PartsOfHolyWeek(row);
        }
    });
}

//tempsQuaresmaTridu
async function ObtainPartsOfEasterTriduum(globalData) : Promise<PartsOfEasterTriduum> {
    return await SecureCall(async () => {
        if (tomorrowCal === 'T' || globalData.LT === GlobalKeys.Q_TRIDU) {
            const id = globalData.date.getDay() - 3;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PartsOfEasterTriduum, id);
            return new PartsOfEasterTriduum(row);
        }
    });
}

//tempsPasquaAA
async function ObtainPartsOfEasterBeforeAscension(globalData) : Promise<PartsOfEasterBeforeAscension> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_OCTAVA || globalData.LT === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PartsOfEasterTriduum, id);
            return new PartsOfEasterBeforeAscension(row);
        }
    });
}

//tempsPasquaOct
async function ObtainPartsOfEasterOctave(globalData) : Promise<PartsOfEasterOctave> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_OCTAVA) {
            const id = globalData.date.getDay() === 0 ? 7 : globalData.date.getDay();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PartsOfEasterOctave, id);
            return new PartsOfEasterOctave(row);
        }
    });
}

//tempsPasquaDA
async function ObtainPartsOfEasterAfterAscension(globalData) : Promise<PartsOfEasterAfterAscension> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PartsOfEasterAfterAscension, id);
            return new PartsOfEasterAfterAscension(row);
        }
    });
}

//tempsPasquaSetmanes
async function ObtainEasterWeekParts(globalData) : Promise<EasterWeekParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            let id = (parseInt(globalData.setmana) - 2) * 7 + (globalData.date.getDay() + 1);
            if (id === 43) id = 1; //TODO: diumenge de pentacosta (no està dins tempsPasquaSetmanes). Apaño perquè no peti
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.EasterWeekParts, id);
            return new EasterWeekParts(row);
        }
    });
}

//tempsAdventNadalComu
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
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.CommonAdventAndChristmasParts, id);
            return new CommonAdventAndChristmasParts(row);
        }
    });
}

//tempsAdventSetmanes
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
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.AdventWeekParts, id);
            return new AdventWeekParts(row);
        }
    });
}

//tempsAdventSetmanesDium
async function ObtainAdventSundayParts(globalData) : Promise<AdventSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_SETMANES || globalData.LT === GlobalKeys.A_FERIES) {
            let id = parseInt(globalData.cicle);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.AdventSundayParts, id);
            return new AdventSundayParts(row);
        }
    });
}

//tempsAdventSetmanesDium (firsts vespers)
async function ObtainAdventFirstVespersOfSundayParts(globalData) : Promise<AdventFirstVespersOfSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_SETMANES || globalData.LT === GlobalKeys.A_FERIES || tomorrowCal === 'A') {
            let id = parseInt(globalData.cicle) + 1;
            if (tomorrowCal === 'A') {
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.AdventFirstVespersOfSundayParts, id);
            return new AdventFirstVespersOfSundayParts(row);
        }
    });
}

//tempsAdventFeries
async function ObtainAdventFairDaysParts(globalData) : Promise<AdventFairDaysParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_FERIES) {
            let id = globalData.date.getDate() - 16;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.AdventFairDaysParts, id);
            return new AdventFairDaysParts(row);
        }
    });
}

//tempsAdventFeriesAnt
async function ObtainAdventFairDaysAntiphons(globalData) : Promise<AdventFairDaysAntiphons> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.A_FERIES && auxDay !== 0) {
            let id = globalData.date.getDate();
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.AdventFairDaysAntiphons, id);
            return new AdventFairDaysAntiphons(row);
        }
    });
}

//tempsNadalOctava
async function ObtainChristmasWhenOctaveParts(globalData) : Promise<ChristmasWhenOctaveParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.N_OCTAVA && globalData.date.getDate() !== 25) {
            let id = globalData.date.getDate() - 25;
            if (globalData.date.getDate() === 1) {
                id = 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.ChristmasWhenOctaveParts, id);
            return new ChristmasWhenOctaveParts(row);
        }
    });
}

//tempsNadalAbansEpifania
async function ObtainChristmasBeforeEpiphanyParts(globalData) : Promise<ChristmasBeforeEpiphanyParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.N_ABANS) {
            const id = globalData.date.getDate() < 6 ? globalData.date.getDate() - 1 : globalData.date.getDate() - 2;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.ChristmasBeforeEpiphanyParts, id);
            return new ChristmasBeforeEpiphanyParts(row);
        }
    });
}

//salteriComuEspPasquaDium
async function ObtainSpecialCommonPartsOfEasterSundays(globalData) : Promise<SpecialCommonPartsOfEasterSundays> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            const id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.SpecialCommonPartsOfEasterSundays, id);
            return new SpecialCommonPartsOfEasterSundays(row);
        }
    });
}

//salteriComuLaudes
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
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.LaudesCommonPsalter, id);
            return new LaudesCommonPsalter(row);
        }
    });
}

//salteriComuEspPasqua
async function ObtainCommonSpecialPartsOfEaster(globalData) : Promise<CommonSpecialPartsOfEaster> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            const id = (parseInt(globalData.cicle) - 1) * 6 + (globalData.date.getDay());
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.CommonSpecialPartsOfEaster, id);
            return new CommonSpecialPartsOfEaster(row);
        }
    });
}

//tempsPasquaSetmanesDium
async function ObtainEasterSundayParts(globalData) : Promise<EasterSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            let id = parseInt(globalData.setmana) - 1;
            if (id === 7) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.EasterSundayParts, id);
            return new EasterSundayParts(row);
        }
    });
}

//tempsPasquaSetmanesDium (firsts vespers)
async function ObtainEasterFirstVespersOfSundayParts(globalData) : Promise<EasterFirstVespersOfSundayParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_SETMANES) {
            let id = parseInt(globalData.setmana);
            if (id === 7 || id === 8) {
                id = 6;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.EasterFirstVespersOfSundayParts, id);
            return new EasterFirstVespersOfSundayParts(row);
        }
    });
}

//tempsQuaresmaDiumPasq
async function ObtainEasterSunday(globalData) : Promise<EasterSunday> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.P_OCTAVA || globalData.LT === GlobalKeys.Q_DIUM_PASQUA) {
            let id = 1;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.EasterSunday, id);
            return new EasterSunday(row);
        }
    });
}

//tempsQuaresmaVSetmanesDium
async function ObtainFiveWeeksOfSundayLentParts(globalData) : Promise<FiveWeeksOfSundayLentParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_SETMANES) {
            let id = parseInt(globalData.setmana);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.FiveWeeksOfSundayLentParts, id);
            return new FiveWeeksOfSundayLentParts(row);
        }
    });
}

//tempsQuaresmaVSetmanesDium (firsts vespers)
async function ObtainFiveWeeksOfFirstsVespersOfSundayLentParts(globalData) : Promise<FiveWeeksOfFirstsVespersOfSundayLentParts> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_SETMANES || globalData.LT === GlobalKeys.Q_CENDRA) {
            let id = 1;
            if (globalData.LT !== GlobalKeys.Q_CENDRA) {
                id = parseInt(globalData.setmana) + 1;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.FiveWeeksOfFirstsVespersOfSundayLentParts, id);
            return new FiveWeeksOfFirstsVespersOfSundayLentParts(row);
        }
    });
}

//salteriComuVespres
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
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.VespersCommonPsalter, id);
            return new VespersCommonPsalter(row);
        }
    });
}

//tempsSolemnitatsFestes
async function ObtainSolemnityOrFestivityParts(globalData) : Promise<SolemnityOrFestivityParts> {
    return await SecureCall(async () => {
        if (params.idTSF !== -1 || globalData.LT === GlobalKeys.Q_TRIDU || globalData.LT === GlobalKeys.N_OCTAVA) {
            let id;
            if (params.idTSF === -1 && globalData.LT === GlobalKeys.N_OCTAVA) {
                id = SoulKeys.tempsSolemnitatsFestes_Nadal;
            }
            else {
                id = params.idTSF;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.SolemnityOrFestivityParts, id);
            return new SolemnityOrFestivityParts(row);
        }
    });
}

//salteriComuHora
async function ObtainCommonHourPsalter(globalData) : Promise<CommonHourPsalter> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_TRIDU && globalData.LT !== GlobalKeys.P_OCTAVA) {
            const id = (parseInt(globalData.cicle) - 1) * 7 + (globalData.date.getDay() + 1);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.CommonHourPsalter, id);
            return new CommonHourPsalter(row);
        }
    });
}

//salteriComuCompletes
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
        const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.CommonNightPrayerPsalter, id);
        return new CommonNightPrayerPsalter(row);
    });
}

//salteriComuOficiTF
async function ObtainCommonOfficeWhenStrongTimesPsalter(globalData) : Promise<CommonOfficeWhenStrongTimesPsalter> {
    return await SecureCall(async () => {
        if (idTF !== -1) {
            const id = idTF;
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.CommonOfficeWhenStrongTimesPsalter, id);
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

//santsSolemnitats
async function ObtainSaintsOrSolemnitiesParts(globalData) : Promise<SaintsOrSolemnitiesParts> {
    return await SecureCall(async () => {
        if (globalData.LT !== GlobalKeys.Q_DIUM_PASQUA && (((params.idTSF === -1 && params.idDE === -1) && (globalData.celType === 'S' || globalData.celType === 'F')))) {
            let idDM = diesMov(globalData.date, globalData.LT, globalData.setmana, globalData.pentacosta, globalData.celType);
            if (idDM === -1) {
                let day = GlobalFunctions.calculeDia(globalData.date, globalData.diocesi, globalData.diaMogut, globalData.diocesiMogut);
                // TODO:
                DatabaseDataService.getSolMem("santsSolemnitats", day, globalData.diocesi, globalData.lloc, globalData.diocesiName, globalData.tempsespecific, (result) => {
                    queryRows.santsSolemnitats = result;
                    getOficisComuns(params, result, false);
                });
            }
            else {
                // TODO:
                DatabaseDataService.getSolMemDiesMov("santsSolemnitats", idDM, (result) => {
                    queryRows.santsSolemnitats = result;
                    getOficisComuns(params, result, false);
                });
            }
        }
    });
}

//santsSolemnitats (firsts vespers)
async function ObtainSaintsOrSolemnitiesWhenFirstsVespersParts(globalData) : Promise<SaintsOrSolemnitiesWhenFirstsVespersParts> {
    return await SecureCall(async () => {
        if (tomorrowCal === 'S') {
            let idDM = diesMov(globalData.dataTomorrow.date, globalData.dataTomorrow.LT, globalData.dataTomorrow.setmana, globalData.pentacosta, globalData.dataTomorrow.celType);
            if (idDM !== -1) {
                params.vespres1 = true;
                // TODO:
                DatabaseDataService.getSolMemDiesMov("santsSolemnitats", idDM, (result) => {
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
                DatabaseDataService.getSolMem("santsSolemnitats", day, globalData.diocesi, globalData.lloc, globalData.diocesiName, globalData.tempsespecific, (result) => {
                    queryRows.santsSolemnitatsFVespres1 = result;
                    getOficisComuns(params, result, true);
                });
            }
        }
    });
}

//santsMemories
async function ObtainSaintsOrMemories(globalData) : Promise<SaintsOrMemories> {
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
                    DatabaseDataService.getSolMem("santsMemories", day, globalData.diocesi, globalData.lloc, globalData.diocesiName, globalData.tempsespecific, (result) => {
                        queryRows.santsMemories = result;
                        getOficisComuns(params, result, false);
                    });
                }
                else {
                    DatabaseDataService.getSolMemDiesMov("santsMemories", idDM, (result) => {
                        queryRows.santsMemories = result;
                        getOficisComuns(params, result, false);
                    });
                }
            }
        }
    });
}

//diesespecials
async function ObtainSpecialDaysParts(globalData) : Promise<SpecialDaysParts> {
    return await SecureCall(async () => {
        if (tomorrowCal === 'DE' || params.idDE !== -1) {
            let id = params.idDE;
            if (tomorrowCal === 'DE') {
                id = idDETomorrow;
            }
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.SpecialDaysParts, id);
            return new SpecialDaysParts(row);
        }
    });
}
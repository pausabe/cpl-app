import SoulKeys from "./SoulKeys";
import {
    LiturgySpecificDayInformation, NoIdentifierNumber,
    SpecialCelebration
} from "../Models/LiturgyDayInformation";
import {Settings} from "../Models/Settings";
import {DioceseCode} from "./DatabaseEnums";
import * as CelebrationIdentifier from "./CelebrationIdentifierService";
import {SpecificLiturgyTimeType} from "./CelebrationTimeEnums";

export function ObtainSpecialCelebration(liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : SpecialCelebration{
    let specialCelebration = new SpecialCelebration();
    if(liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterSunday){
        return specialCelebration;
    }

    specialCelebration.SpecialDaysMasterIdentifier = ObtainSpecialDaysMasterIdentifier(liturgyDayInformation, settings);
    specialCelebration.SolemnityAndFestivityMasterIdentifier = ObtainSolemnityAndFestivityMasterIdentifier(liturgyDayInformation);
    specialCelebration.StrongTimesMasterIdentifier = ObtainStrongTimesMasterIdentifier(liturgyDayInformation);

    return specialCelebration;
}

function ObtainSpecialDaysMasterIdentifier(liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : number{
    const date = liturgyDayInformation.Date;
    const specificLiturgyTime = liturgyDayInformation.SpecificLiturgyTime;
    const week = liturgyDayInformation.Week;
    const dioceseCode = settings.DioceseCode;

    //1- Sagrada Família quan és el 30 de desembre
    if (CelebrationIdentifier.IsSacredFamily(date) && date.getDate() === 30) {
        return SoulKeys.diesespecials_SagradaFamilia30Desembre;
    }

    //2- Mare de Déu (1 gener) quan cau en diumenge
    if (CelebrationIdentifier.IsMatherOfGod(liturgyDayInformation.Date) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeMaredeDeu1Gener;
    }

    const auxDay = new Date(date.getFullYear(), date.getMonth(), (date.getDate() - 7));

    //3- Diumenge II de Nadal, quan s’escau el dia 2 de gener
    if (CelebrationIdentifier.IsSacredFamily(auxDay) && date.getDate() === 2) {
        return SoulKeys.diesespecials_DiumengeIINadal2Gener;
    }

    //4- Diumenge II de Nadal, quan s’escau el dia 3 de gener
    if (CelebrationIdentifier.IsSacredFamily(auxDay) && date.getDate() === 3) {
        return SoulKeys.diesespecials_DiumengeIINadal3Gener;
    }

    //5- Diumenge II de Nadal, quan s’escau el dia 4 de gener
    if (CelebrationIdentifier.IsSacredFamily(auxDay) && date.getDate() === 4) {
        return SoulKeys.diesespecials_DiumengeIINadal4Gener;
    }

    //6- Diumenge II de Nadal, quan s’escau el dia 5 de gener
    if (CelebrationIdentifier.IsSacredFamily(auxDay) && date.getDate() === 5) {
        return SoulKeys.diesespecials_DiumengeIINadal5Gener;
    }

    //7- Baptisme del Senyor quan és 7 de gener
    if (CelebrationIdentifier.IsBaptism(date) && date.getDate() === 7) {
        return SoulKeys.diesespecials_BaptismeSenyor7Gener;
    }

    //8- Presentació del Senyor (2 febrer) quan cau en diumenge
    if (CelebrationIdentifier.IsLordPresentation(liturgyDayInformation) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengePresentacioSenyor2febrer;
    }

    //9- Transfiguració del Senyor (6 agost) quan cau en diumenge
    if (CelebrationIdentifier.IsLordTransfiguration(liturgyDayInformation) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeTransfiguracioSenyor6;
    }

    //10- Exaltació Santa Creu (14 de setembre) quan cau en diumenge
    if (CelebrationIdentifier.IsExaltationHolyCross(liturgyDayInformation) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeExaltacioSantaCreu14Setembre;
    }

    //11- Dedic. Sant Joan del Laterà (9 de novembre) quan cau en diumenge
    if (CelebrationIdentifier.IsDedicationSantJoanLatera(liturgyDayInformation) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeDedicacioSantJoanLatera9Novembre;
    }

    //12- Santa Eulàlia (12 de febrer) quan cau en diumenge i és temps de durant l’any
    if (CelebrationIdentifier.IsSaintEulalia(liturgyDayInformation) &&
        date.getDay() === 0 &&
        specificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
        (dioceseCode === DioceseCode.BaV || dioceseCode === DioceseCode.BaC)) {
        return SoulKeys.diesespecials_DiumengeTempsDurantAnySantaEulalia12Febrer;
    }

    //13- Sant Joan (24 de juny) quan cau en diumenge
    if (CelebrationIdentifier.IsSantJoan(liturgyDayInformation) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantJoan24Juny;
    }

    //14- Sants Pere i Pau (29 de juny) quan cau en diumenge
    if (CelebrationIdentifier.IsSantsPerePau(date) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantsPerePau29Juny;
    }

    //15- Sant Jaume (25 de juliol) quan cau en diumenge
    if (CelebrationIdentifier.IsSaintJames(date) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantJaume25Juliol;
    }

    //16- Assumpció Maria (15 d’agost) quan cau en diumenge
    if (CelebrationIdentifier.IsAssumption(date) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeAssumpcioMaria15Agost;
    }

    //17- Sta. Tecla (23 setembre) quan cau en diumenge
    if (CelebrationIdentifier.IsSaintTecla(date) &&
        (dioceseCode === DioceseCode.TaV || dioceseCode === DioceseCode.TaD) &&
        date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantaTecla23Setembre;
    }

    //18- Mare de Déu de la Mercè (24 de setembre) quan cau en diumenge
    const currentDioceseDisplayMatherOfGodOfMerce =
        dioceseCode === DioceseCode.BaD || dioceseCode === DioceseCode.SFD || dioceseCode === DioceseCode.TeD ||
        dioceseCode === DioceseCode.GiD || dioceseCode === DioceseCode.LlD || dioceseCode === DioceseCode.SoD ||
        dioceseCode === DioceseCode.TaD || dioceseCode === DioceseCode.ToD || dioceseCode === DioceseCode.UrD ||
        dioceseCode === DioceseCode.ViD;
    if (CelebrationIdentifier.IsMatherOfGodOfMerce(date) &&
        date.getDay() === 0 &&
        currentDioceseDisplayMatherOfGodOfMerce) {
        return SoulKeys.diesespecials_DiumengeMareDeuMerce24Setembre;
    }

    //19- Tots Sants (1 de novembre) quan cau en diumenge
    if (CelebrationIdentifier.IsAllSaints(liturgyDayInformation.Date) && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeTotsSants1Novembre;
    }

    //20- Diumenge IV d’Advent, dia 18
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '4' && date.getDate() === 18 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent18;
    }

    //21- Diumenge IV d’Advent, dia 19
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '4' && date.getDate() === 19 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent19;
    }

    //22- Diumenge IV d’Advent, dia 20
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '4' && date.getDate() === 20 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent20;
    }

    //23- Diumenge IV d’Advent, dia 21
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '4' && date.getDate() === 21 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent21;
    }

    //24- Diumenge IV d’Advent, dia 22
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '4' && date.getDate() === 22 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent22;
    }

    //25- Diumenge IV d’Advent, dia 23
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '4' && date.getDate() === 23 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent23;
    }

    //26- Diumenge IV d’Advent, dia 24
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '4' && date.getDate() === 24 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent24;
    }

    //27- Diumenge III d'Advent, quan és fèria
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventFairs && week === '3' && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIIIAdventFeria;
    }

    //28- Quan el dia 24 de desembre (fèria) s’escau en dilluns
    if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 1) {
        return SoulKeys.diesespecials_24DesembreDilluns;
    }

    //29- Quan el dia 24 de desembre (fèria) s’escau en dimarts
    if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 2) {
        return SoulKeys.diesespecials_24DesembreDimarts;
    }

    //30- Quan el dia 24 de desembre (fèria) s’escau en dimecres
    if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 3) {
        return SoulKeys.diesespecials_24DesembreDimecres;
    }

    //31- Quan el dia 24 de desembre (fèria) s’escau en dijous
    if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 4) {
        return SoulKeys.diesespecials_24DesembreDijous;
    }

    //32- Quan el dia 24 de desembre (fèria) s’escau en divendres
    if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 5) {
        return SoulKeys.diesespecials_24DesembreDivendres;
    }

    //33- Quan el dia 24 de desembre (fèria) s’escau en dissabte
    if (date.getMonth() === 11 && date.getDate() === 24 && date.getDay() === 6) {
        return SoulKeys.diesespecials_24DesembreDissabte;
    }

    return NoIdentifierNumber;
}

function ObtainSolemnityAndFestivityMasterIdentifier(liturgyDayInformation : LiturgySpecificDayInformation) : number {
    //1- Nadal
    if (CelebrationIdentifier.IsChristmas(liturgyDayInformation.Date)) {
        return SoulKeys.tempsSolemnitatsFestes_Nadal;
    }

    //2- Sagrada Família
    if (CelebrationIdentifier.IsSacredFamily(liturgyDayInformation.Date)) {
        return SoulKeys.tempsSolemnitatsFestes_SagradaFamilia;
    }

    //3- Mare de Déu
    if (CelebrationIdentifier.IsMatherOfGod(liturgyDayInformation.Date)) {
        return SoulKeys.tempsSolemnitatsFestes_MareDeu;
    }

    //4- Epifania
    if (CelebrationIdentifier.IsEpiphany(liturgyDayInformation.Date)) {
        return SoulKeys.tempsSolemnitatsFestes_Epifania;
    }

    //5- Baptisme
    if (CelebrationIdentifier.IsBaptism(liturgyDayInformation.Date)) {
        return SoulKeys.tempsSolemnitatsFestes_Baptisme;
    }

    //6- Ascensió
    if (CelebrationIdentifier.IsAscension(liturgyDayInformation)) {
        return SoulKeys.tempsSolemnitatsFestes_Ascensio;
    }

    //7- Diumenge pentacosta
    if (CelebrationIdentifier.IsPentecost(liturgyDayInformation)) {
        return SoulKeys.tempsSolemnitatsFestes_DiumengePentacosta;
    }

    //8- Santíssima trinitat
    if (CelebrationIdentifier.IsHolyTrinity(liturgyDayInformation)) {
        return SoulKeys.tempsSolemnitatsFestes_SantissimaTrinitat;
    }

    //9- Santíssim cos i sang de crist
    if (CelebrationIdentifier.IsBodyAndBlood(liturgyDayInformation)) {
        return SoulKeys.tempsSolemnitatsFestes_SantissimCosSangCrist;
    }

    //10- Sagrat cor de Jesús
    if (CelebrationIdentifier.IsSacredHeartOfJesus(liturgyDayInformation)) {
        return SoulKeys.tempsSolemnitatsFestes_SagratCorJesus;
    }

    //11- Nostre senyor Jesucrist
    if (CelebrationIdentifier.IsOurLordJesusChrist(liturgyDayInformation)) {
        return SoulKeys.tempsSolemnitatsFestes_NostreSenyorJesucrist;
    }

    return NoIdentifierNumber;
}

function ObtainStrongTimesMasterIdentifier(liturgyDayInformation : LiturgySpecificDayInformation) {
    const date = liturgyDayInformation.Date;
    const specificLiturgyTime = liturgyDayInformation.SpecificLiturgyTime;
    const week = liturgyDayInformation.Week;

    //1- Dissabte I Advent
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks && week === '1' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIAdvent;
    }

    //2- Dissabte II Advent
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks && week === '2' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIIAdvent;
    }

    //3- Divendres IV Advent (si és el 23 de desembre)
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks && week === '4' && date.getDate() === 23 && date.getMonth() == 11 && date.getDay() == 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVAdvent23Desembre;
    }

    //4- Divendres IV Advent (si és el 24 de desembre)
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks && week === '4' && date.getDate() === 24 && date.getMonth() == 11 && date.getDay() == 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVAdvent24Desembre;
    }

    //5- Dissabte IV Advent (24 de desembre)
    if (specificLiturgyTime === SpecificLiturgyTimeType.AdventWeeks && week === '4' && date.getDate() === 24 && date.getMonth() == 11 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIVAdvent;
    }

    //6- Dissabte I Nadal (si és el 2 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '1' && date.getDate() === 2 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal2Gener;
    }

    //7- Dissabte I Nadal (si és el 3 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '1' && date.getDate() === 3 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal3Gener;
    }

    //8- Dissabte I Nadal (si és el 4 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '1' && date.getDate() === 4 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal4Gener;
    }

    //9- Dissabte I Nadal (si és el 5 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '1' && date.getDate() === 5 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal5Gener;
    }

    //10- Dissabte II Nadal (si és el 7 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '2' && date.getDate() === 7 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal7Gener;
    }

    //11- Dissabte II Nadal (si és el 8 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '2' && date.getDate() === 8 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal8Gener;
    }

    //12- Dissabte II Nadal (si és el 9 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '2' && date.getDate() === 9 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal9Gener;
    }

    //13- Dissabte II Nadal (si és el 10 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '2' && date.getDate() === 10 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal10Gener;
    }

    //14- Dissabte II Nadal (si és el 11 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '2' && date.getDate() === 11 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal11Gener;
    }

    //15- Dissabte II Nadal (si és el 12 de gener)
    if (specificLiturgyTime === SpecificLiturgyTimeType.ChristmasBeforeOrdinary && week === '2' && date.getDate() === 12 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal12Gener;
    }

    //16- Divendres després de Cendra, Quaresma
    if (specificLiturgyTime === SpecificLiturgyTimeType.LentAshes && date.getDay() === 5) {
        return SoulKeys.salteriComuOficiTF_DivendresDespresCendraQuaresma;
    }

    //17- Dissabte després de Cendra, Quaresma
    if (specificLiturgyTime === SpecificLiturgyTimeType.LentAshes && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteDespresCendraQuaresma;
    }

    //18- Dissabte I Quaresma
    if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '1' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIQuaresma;
    }

    //19- Dissabte II Quaresma
    if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '2' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIIQuaresma;
    }

    //20- Divendres IV Quaresma
    if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '4' && date.getDay() === 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVQuaresma;
    }

    //21- Dissabte IV Quaresma
    if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '4' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIVQuaresma;
    }

    //22- Dissabte V Quaresma
    if (specificLiturgyTime === SpecificLiturgyTimeType.LentWeeks && week === '5' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteVQuaresma;
    }

    //23- Dissabte II Pasqua
    if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '2' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIIPasqua;
    }

    //24- Divendres IV Pasqua
    if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '4' && date.getDay() === 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVPasqua;
    }

    //25- Dissabte IV Pasqua
    if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '4' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_issabteIVPasqua;
    }

    //26- Dissabte V Pasqua
    if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '5' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteVPasqua;
    }

    //27- Dissabte VI Pasqua
    if (specificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks && week === '6' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteVIPasqua;
    }

    return NoIdentifierNumber;
}

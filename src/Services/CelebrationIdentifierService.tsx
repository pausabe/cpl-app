import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import {CelebrationType} from "./DatabaseEnums";
import {SpecificLiturgyTimeType} from "./CelebrationTimeEnums";
import {DateManagement} from "../Utils/DateManagement";

export enum Celebration {
    Assumption,
    ImmaculateConception,
    SaintJoseph,
    SaintTecla,
    MatherOfGodOfMerce,
    SaintsPereAndPau,
    SaintJames,
    SaintJohnBaptist,
    AllSaints,
    SaintJohn,
    SaintEulalia,
    DedicationSantJoanLatera,
    ExaltationHolyCross,
    LordTransfiguration,
    LordPresentation,
    Epiphany,
    Baptism,
    MatherOfGod,
    Christmas,
    Pentecost,
    HolyHeartOfJesus,
    HolyBodyAndBloodOfChrist,
    HolyTrinity,
    BodyAndBlood,
    SacredHeartOfJesus,
    OurLordJesusChrist,
    AshWednesday,
    ImmaculateHeartOfTheBlessedVirginMary,
    MotherOfGodFromTheTibbon,
    JesusChristHighPriestForever,
    BlessedVirginMaryMotherOfTheChurch,
    Ascension,
    SacredFamily
}

export function CheckCelebration(celebration: Celebration, liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    const dateWhenNotMoved = liturgySpecificDayInformation.Date;
    const dateWhenMoved = liturgySpecificDayInformation.MovedDay.OriginDate;
    const todayWeCelebrateAMovedDay = dateWhenMoved !== undefined;

    let isCelebrationWhenNotMoved = false;
    let isCelebrationWhenMoved = false;


    switch (celebration) {
        // Can be moved
        case Celebration.Assumption:
            isCelebrationWhenNotMoved = IsAssumption(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsAssumption(dateWhenMoved);
            break;
        case Celebration.ImmaculateConception:
            isCelebrationWhenNotMoved = IsImmaculateConception(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsImmaculateConception(dateWhenMoved);
            break;
        case Celebration.SaintJoseph:
            isCelebrationWhenNotMoved = IsSaintJoseph(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsSaintJoseph(dateWhenMoved);
            break;
        case Celebration.SaintTecla:
            isCelebrationWhenNotMoved = IsSaintTecla(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsSaintTecla(dateWhenMoved);
            break;
        case Celebration.MatherOfGodOfMerce:
            isCelebrationWhenNotMoved = IsMatherOfGodOfMerce(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsMatherOfGodOfMerce(dateWhenMoved);
            break;
        case Celebration.SaintsPereAndPau:
            isCelebrationWhenNotMoved = IsSaintsPereAndPau(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsSaintsPereAndPau(dateWhenMoved);
            break;
        case Celebration.SaintJames:
            isCelebrationWhenNotMoved = IsSaintJames(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsSaintJames(dateWhenMoved);
            break;
        case Celebration.SaintJohnBaptist:
            isCelebrationWhenNotMoved = IsSaintJohnBaptist(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsSaintJohnBaptist(dateWhenMoved);
            break;
        case Celebration.AllSaints:
            isCelebrationWhenNotMoved = IsAllSaints(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsAllSaints(dateWhenMoved);
            break;
        case Celebration.SaintJohn:
            isCelebrationWhenNotMoved = IsSaintJohn(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsSaintJohn(dateWhenMoved);
            break;
        case Celebration.SaintEulalia:
            isCelebrationWhenNotMoved = IsSaintEulalia(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsSaintEulalia(dateWhenMoved);
            break;
        case Celebration.DedicationSantJoanLatera:
            isCelebrationWhenNotMoved = IsDedicationSantJoanLatera(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsDedicationSantJoanLatera(dateWhenMoved);
            break;
        case Celebration.ExaltationHolyCross:
            isCelebrationWhenNotMoved = IsExaltationHolyCross(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsExaltationHolyCross(dateWhenMoved);
            break;
        case Celebration.LordTransfiguration:
            isCelebrationWhenNotMoved = IsLordTransfiguration(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsLordTransfiguration(dateWhenMoved);
            break;
        case Celebration.LordPresentation:
            isCelebrationWhenNotMoved = IsLordPresentation(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsLordPresentation(dateWhenMoved);
            break;
        case Celebration.Epiphany:
            isCelebrationWhenNotMoved = IsEpiphany(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsEpiphany(dateWhenMoved);
            break;
        case Celebration.Baptism:
            isCelebrationWhenNotMoved = IsBaptism(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsBaptism(dateWhenMoved);
            break;
        case Celebration.MatherOfGod:
            isCelebrationWhenNotMoved = IsMatherOfGod(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsMatherOfGod(dateWhenMoved);
            break;
        case Celebration.Christmas:
            isCelebrationWhenNotMoved = IsChristmas(dateWhenNotMoved);
            isCelebrationWhenMoved = todayWeCelebrateAMovedDay && IsChristmas(dateWhenMoved);
            break;

        // Never will be moved
        case Celebration.HolyHeartOfJesus:
            isCelebrationWhenNotMoved = IsHolyHeartOfJesus(liturgySpecificDayInformation);
            break;
        case Celebration.Pentecost:
            isCelebrationWhenNotMoved = IsPentecost(liturgySpecificDayInformation);
            break;
        case Celebration.HolyBodyAndBloodOfChrist:
            isCelebrationWhenNotMoved = IsHolyBodyAndBloodOfChrist(liturgySpecificDayInformation);
            break;
        case Celebration.HolyTrinity:
            isCelebrationWhenNotMoved = IsHolyTrinity(liturgySpecificDayInformation);
            break;
        case Celebration.BodyAndBlood:
            isCelebrationWhenNotMoved = IsBodyAndBlood(liturgySpecificDayInformation);
            break;
        case Celebration.SacredHeartOfJesus:
            isCelebrationWhenNotMoved = IsSacredHeartOfJesus(liturgySpecificDayInformation);
            break;
        case Celebration.OurLordJesusChrist:
            isCelebrationWhenNotMoved = IsOurLordJesusChrist(liturgySpecificDayInformation);
            break;
        case Celebration.AshWednesday:
            isCelebrationWhenNotMoved = IsAshWednesday(liturgySpecificDayInformation);
            break;
        case Celebration.ImmaculateHeartOfTheBlessedVirginMary:
            isCelebrationWhenNotMoved = IsImmaculateHeartOfTheBlessedVirginMary(liturgySpecificDayInformation);
            break;
        case Celebration.MotherOfGodFromTheTibbon:
            isCelebrationWhenNotMoved = IsMotherOfGodFromTheTibbon(liturgySpecificDayInformation.Date);
            break;
        case Celebration.JesusChristHighPriestForever:
            isCelebrationWhenNotMoved = IsJesusChristHighPriestForever(liturgySpecificDayInformation);
            break;
        case Celebration.BlessedVirginMaryMotherOfTheChurch:
            isCelebrationWhenNotMoved = IsBlessedVirginMaryMotherOfTheChurch(liturgySpecificDayInformation);
            break;
        case Celebration.Ascension:
            isCelebrationWhenNotMoved = IsAscension(liturgySpecificDayInformation);
            break;
        case Celebration.SacredFamily:
            isCelebrationWhenNotMoved = IsSacredFamily(liturgySpecificDayInformation.Date);
            break;

    }

    if (todayWeCelebrateAMovedDay) {
        return isCelebrationWhenMoved;
    }
    if (liturgySpecificDayInformation.MovedDay.TodayIsMoved) {
        return false;
    }
    return isCelebrationWhenNotMoved;
}

export function GetSaturdayBeforePentecostDate(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
    let saturdayBeforePentecost = new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(), liturgySpecificDayInformation.PentecostDay.getMonth(), liturgySpecificDayInformation.PentecostDay.getDate());
    saturdayBeforePentecost.setDate(saturdayBeforePentecost.getDate() - 1);
    return saturdayBeforePentecost;
}

export function GetMondayAfterEasterOctaveDate(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
    let mondayAfterEasterOctave = new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(), liturgySpecificDayInformation.PentecostDay.getMonth(), liturgySpecificDayInformation.PentecostDay.getDate());
    mondayAfterEasterOctave.setDate(mondayAfterEasterOctave.getDate() - 41);
    return mondayAfterEasterOctave;
}

export function GetSaturdayAfterEpiphanyDate(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
    let saturdayAfterEpiphany = new Date(liturgySpecificDayInformation.Date.getFullYear(), 0, 6);
    if (saturdayAfterEpiphany.getDay() === 6) {
        saturdayAfterEpiphany.setDate(saturdayAfterEpiphany.getDate() + 1);
    }
    while (saturdayAfterEpiphany.getDay() !== 6) {
        saturdayAfterEpiphany.setDate(saturdayAfterEpiphany.getDate() + 1);
    }
    return saturdayAfterEpiphany;
}

export function GetSacredFamily(fullYear: number): Date {
    let sacredFamily: Date;
    for (let i = 26; i <= 31; i++) {
        sacredFamily = new Date(fullYear, 11, i);
        if (sacredFamily.getDay() === 0) {
            return sacredFamily;
        }
    }
    // There is this weird rule that if Christmas is in Sunday then SacredFamily will be the 30th
    return new Date(fullYear, 11, 30);
}

export function GetSecondSundayAfterChristmas(date: Date): Date {
    // From a week after christmas to first sunday = second sunday
    let dateIterator = new Date(date.getFullYear(), 0, 1);
    while (dateIterator.getDay() !== 0) {
        dateIterator.setDate(dateIterator.getDate() + 1);
    }
    return dateIterator;
}

// The following celebrations can be moved for precedence purposes

function IsAssumption(date: Date): boolean {
    return date.getMonth() === 7 && date.getDate() === 15;
}

function IsImmaculateConception(date: Date): boolean {
    return date.getMonth() === 11 && date.getDate() === 8;
}

function IsSaintJoseph(date: Date) {
    return date.getMonth() === 2 && date.getDate() === 19;
}

function IsSaintTecla(date: Date): boolean {
    return date.getMonth() === 8 && date.getDate() === 23;
}

function IsMatherOfGodOfMerce(date: Date): boolean {
    return date.getMonth() === 8 && date.getDate() === 24;
}

function IsSaintsPereAndPau(date: Date): boolean {
    return date.getMonth() === 5 && date.getDate() === 29;
}

function IsSaintJames(date: Date): boolean {
    return date.getMonth() === 6 && date.getDate() === 25;
}

function IsSaintJohnBaptist(date: Date): boolean {
    return date.getMonth() === 5 && date.getDate() === 24;
}

function IsAllSaints(date: Date): boolean {
    return date.getMonth() === 10 && date.getDate() === 1;
}

function IsSaintJohn(date: Date): boolean {
    return date.getMonth() === 5 && date.getDate() === 24;
}

function IsSaintEulalia(date: Date): boolean {
    return date.getMonth() === 1 && date.getDate() === 12;
}

function IsDedicationSantJoanLatera(date: Date): boolean {
    return date.getMonth() === 10 && date.getDate() === 9;
}

function IsExaltationHolyCross(date: Date): boolean {
    return date.getMonth() === 8 && date.getDate() === 14;
}

function IsLordTransfiguration(date: Date): boolean {
    return date.getMonth() === 7 && date.getDate() === 6;
}

function IsLordPresentation(date: Date): boolean {
    return date.getMonth() === 1 && date.getDate() === 2;
}

function IsEpiphany(date: Date): boolean {
    return date.getDate() === 6 && date.getMonth() === 0;
}

function IsChristmas(date: Date): boolean {
    return date.getDate() === 25 && date.getMonth() === 11;
}

function IsBaptism(date: Date): boolean {
    if (date.getMonth() !== 0) return false;
    if (date.getDay() !== 0) return false;
    return !(date.getDate() < 7 || date.getDate() > 13);
}

function IsMatherOfGod(date: Date): boolean {
    return date.getMonth() === 0 && date.getDate() === 1;
}

// The following celebrations can't be moved for precedence purposes

function IsPentecost(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    return DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, liturgySpecificDayInformation.PentecostDay);
}

function IsHolyHeartOfJesus(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    //Divendres de la tercera setmana després de Pentecosta (Divendres després de Corpus) A (166) B (167) C (168)
    //Sagrat cor de Jesús
    const holyHeartOfJesus = new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(),
        liturgySpecificDayInformation.PentecostDay.getMonth(),
        liturgySpecificDayInformation.PentecostDay.getDate() + 19);
    return DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, holyHeartOfJesus);
}

function IsHolyBodyAndBloodOfChrist(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    //Diumenge després de la Santíssima Trinitat A (163) B (164) C (165)
    //Santíssim cos i sang de crist
    const holyBodyAndBloodOfChrist = new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(),
        liturgySpecificDayInformation.PentecostDay.getMonth(),
        liturgySpecificDayInformation.PentecostDay.getDate() + 14);
    return DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, holyBodyAndBloodOfChrist);
}

function IsHolyTrinity(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    //Diumenge després de Pentecosta A (160) B (161) C (162)
    const holyTrinity = GetHolyTrinity(liturgySpecificDayInformation);
    return DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, holyTrinity);
}

function GetHolyTrinity(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
    return new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(),
        liturgySpecificDayInformation.PentecostDay.getMonth(),
        liturgySpecificDayInformation.PentecostDay.getDate() + 7);
}

function IsBodyAndBlood(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    const bodyAndBlood = GetBodyAndBlood(liturgySpecificDayInformation);
    return DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, bodyAndBlood);
}

function GetBodyAndBlood(liturgySpecificDayInformation: LiturgySpecificDayInformation): Date {
    const holyTrinity = GetHolyTrinity(liturgySpecificDayInformation);
    return new Date(holyTrinity.getFullYear(), holyTrinity.getMonth(), holyTrinity.getDate() + 7);
}

function IsSacredHeartOfJesus(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    const bodyAndBlood = GetBodyAndBlood(liturgySpecificDayInformation);
    const sacredHeartOfJesus = new Date(bodyAndBlood.getFullYear(), bodyAndBlood.getMonth(), bodyAndBlood.getDate() + 5);
    return DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, sacredHeartOfJesus);
}

function IsOurLordJesusChrist(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    return liturgySpecificDayInformation.Date.getDay() === 0 &&
        liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Ordinary &&
        liturgySpecificDayInformation.Week === '34';
}

function IsAshWednesday(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    return liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.LentAshes &&
        liturgySpecificDayInformation.DayOfTheWeek === 3;
}

function IsImmaculateHeartOfTheBlessedVirginMary(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    //santsMemories M - dissabte de la tercera setmana després de Pentecosta (COR IMMACULAT DE LA BENAURADA VERGE MARIA)
    if (liturgySpecificDayInformation.CelebrationType === CelebrationType.Memory) {
        let corImmaculat = new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(), liturgySpecificDayInformation.PentecostDay.getMonth(), liturgySpecificDayInformation.PentecostDay.getDate() + 20);
        if (liturgySpecificDayInformation.Date.getDate() === corImmaculat.getDate() &&
            liturgySpecificDayInformation.Date.getMonth() === corImmaculat.getMonth() &&
            liturgySpecificDayInformation.Date.getFullYear() === corImmaculat.getFullYear()) {
            return true;
        }
    }
    return false;
}

function IsMotherOfGodFromTheTibbon(date: Date): boolean {
    //santsMemories M - dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
    //santsSolemnitats S - dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
    const auxDay = new Date(date.getFullYear(), 8, 2);
    let b = true;
    let dies = 0;
    while (b && dies < 7) {
        if (auxDay.getDay() === 0) {
            b = false;
        }
        auxDay.setDate(auxDay.getDate() + 1)
        dies += 1;
    }
    const tibbonDate = new Date(date.getFullYear(), 8, dies);
    return DateManagement.DatesAreTheEqual(date, tibbonDate);
}

function IsJesusChristHighPriestForever(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    //santsSolemnitats F - dijous després de Pentecosta (Jesucrist, gran sacerdot per sempre)
    if (liturgySpecificDayInformation.CelebrationType === CelebrationType.Festivity) {
        const granSacerdot = new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(), liturgySpecificDayInformation.PentecostDay.getMonth(), liturgySpecificDayInformation.PentecostDay.getDate() + 4);
        if (DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, granSacerdot)) {
            return true;
        }
    }
    return false;
}

function IsBlessedVirginMaryMotherOfTheChurch(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    //santsMemories M - dilluns després de Pentecosta (Benaurada Verge Maria, Mare de l’Església)
    if (liturgySpecificDayInformation.CelebrationType === CelebrationType.Memory) {
        const benaurada = new Date(liturgySpecificDayInformation.PentecostDay.getFullYear(), liturgySpecificDayInformation.PentecostDay.getMonth(), liturgySpecificDayInformation.PentecostDay.getDate() + 1);
        if (DateManagement.DatesAreTheEqual(liturgySpecificDayInformation.Date, benaurada)) {
            return true;
        }
    }
    return false;
}

function IsAscension(liturgySpecificDayInformation: LiturgySpecificDayInformation): boolean {
    return liturgySpecificDayInformation.Date.getDay() === 0 &&
        liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.EasterWeeks &&
        liturgySpecificDayInformation.Week === '7';
}

function IsSacredFamily(date: Date): boolean {
    const sacredFamilyDate = GetSacredFamily(date.getFullYear());
    return DateManagement.DatesAreTheEqual(date, sacredFamilyDate);
}
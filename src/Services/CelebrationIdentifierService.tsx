import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import {CelebrationType} from "./DatabaseEnums";
import {CompareDates} from "../Utils/DateManagement";
import {SpecificLiturgyTimeType} from "./CelebrationTimeEnums";

export function IsAssumption(date: Date) {
    return date.getMonth() === 7 && date.getDate() === 15;
}

export function IsSantsPerePau(date: Date) {
    return date.getMonth() === 5 && date.getDate() === 29;
}

export function IsSaintJohnBaptist(date: Date) {
    return date.getMonth() === 5 && date.getDate() === 24;
}

export function GetSaturdayBeforePentecostDate(liturgyDateInformation: LiturgySpecificDayInformation): Date {
    let saturdayBeforePentecost = new Date(liturgyDateInformation.PentecostDay.getDate());
    saturdayBeforePentecost.setDate(saturdayBeforePentecost.getDate() - 1);
    return saturdayBeforePentecost;
}

export function GetMondayAfterEasterOctaveDate(liturgyDateInformation: LiturgySpecificDayInformation): Date {
    // TODO: test it, not sure (easter monday, mona)
    let mondayAfterEasterOctave = new Date(liturgyDateInformation.PentecostDay.getDate());
    mondayAfterEasterOctave.setDate(mondayAfterEasterOctave.getDate() - 48);
    return mondayAfterEasterOctave;
}

export function GetSaturdayAfterEpiphanyDate(liturgyDateInformation: LiturgySpecificDayInformation): Date {
    let saturdayAfterEpiphany = new Date(liturgyDateInformation.Date.getFullYear(), 0, 6);
    if(saturdayAfterEpiphany.getDay() === 6){
        saturdayAfterEpiphany.setDate(saturdayAfterEpiphany.getDate() + 1);
    }
    while(saturdayAfterEpiphany.getDay() !== 6){
        saturdayAfterEpiphany.setDate(saturdayAfterEpiphany.getDate() + 1);
    }
    return saturdayAfterEpiphany;
}

export function IsAllSaints(liturgyDayInformation: LiturgySpecificDayInformation) {
    return liturgyDayInformation.Date.getMonth() === 10 && liturgyDayInformation.Date.getDate() === 1;
}

export function IsSantJoan(liturgyDayInformation: LiturgySpecificDayInformation) {
    return liturgyDayInformation.Date.getMonth() === 5 && liturgyDayInformation.Date.getDate() === 24;
}

export function IsSantaEulalia(liturgyDayInformation: LiturgySpecificDayInformation) {
    return liturgyDayInformation.Date.getMonth() === 1 && liturgyDayInformation.Date.getDate() === 12;
}

export function IsDedicationSantJoanLatera(liturgyDayInformation: LiturgySpecificDayInformation) {
    return liturgyDayInformation.Date.getMonth() === 10 && liturgyDayInformation.Date.getDate() === 9;
}

export function IsExaltationHolyCross(liturgyDayInformation: LiturgySpecificDayInformation) {
    return liturgyDayInformation.Date.getMonth() === 8 && liturgyDayInformation.Date.getDate() === 14;
}

export function IsLordTransfiguration(liturgyDateInformation: LiturgySpecificDayInformation) {
    return liturgyDateInformation.Date.getMonth() === 7 && liturgyDateInformation.Date.getDate() === 6;
}

export function IsLordPresentation(liturgyDateInformation: LiturgySpecificDayInformation) {
    return liturgyDateInformation.Date.getMonth() === 1 && liturgyDateInformation.Date.getDate() === 2;
}
export function AshWednesday(liturgyDateInformation : LiturgySpecificDayInformation) {
    return liturgyDateInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.Q_CENDRA &&
        liturgyDateInformation.DayOfTheWeek === 3;
}

export function IsPentecost(liturgyDateInformation : LiturgySpecificDayInformation) {
    return CompareDates(liturgyDateInformation.Date, liturgyDateInformation.PentecostDay);
}

export function IsAscension(liturgyDateInformation : LiturgySpecificDayInformation) {
    return liturgyDateInformation.Date.getDay() === 0 &&
        liturgyDateInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.P_SETMANES &&
        liturgyDateInformation.Week === '7';
}

export function IsEpiphany(date: Date) {
    return date.getDate() === 6 &&
        date.getMonth() === 0;
}

export function IsChristmas(date: Date) {
    return date.getDate() === 25 &&
        date.getMonth() === 11;
}

export function IsSacredFamily(today : Date) : boolean{
    if (today.getMonth() !== 11) return false; // December
    if (today.getDay() !== 0) return false; // Sunday
    if (today.getDate() < 26 || today.getDate() > 31) return false; // Between [26 & 31]
    return true;
}

export function IsBaptism(today : Date) : boolean{
    if (today.getMonth() !== 0) return false;
    if (today.getDay() !== 0) return false;
    return !(today.getDate() < 7 || today.getDate() > 13);
}

export function IsMatherOfGod(date: Date) {
    return date.getMonth() === 0 &&
        date.getDate() === 1
}

export function IsImmaculateHeartOfTheBlessedVirginMary(liturgyDateInformation : LiturgySpecificDayInformation) : boolean{
    //santsMemories M - Dissabte de la tercera setmana després de Pentecosta (COR IMMACULAT DE LA BENAURADA VERGE MARIA)
    if (liturgyDateInformation.CelebrationType === CelebrationType.Memory) {
        let corImmaculat = new Date(liturgyDateInformation.PentecostDay.getFullYear(), liturgyDateInformation.PentecostDay.getMonth(), liturgyDateInformation.PentecostDay.getDate() + 20);
        if (liturgyDateInformation.Date.getDate() === corImmaculat.getDate() &&
            liturgyDateInformation.Date.getMonth() === corImmaculat.getMonth() &&
            liturgyDateInformation.Date.getFullYear() === corImmaculat.getFullYear()) {
            return true;
        }
    }
    return false;
}

export function MotherOfGodFromTheTibbon(liturgyDateInformation : LiturgySpecificDayInformation) : boolean{
    //santsMemories M - Dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
    //santsSolemnitats S - Dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
    const auxDay = new Date(liturgyDateInformation.Date.getFullYear(), 8, 2);
    let b = true;
    let dies = 0;
    while (b && dies < 7) {
        if (auxDay.getDay() === 0) {
            b = false;
        }
        auxDay.setDate(auxDay.getDate() + 1)
        dies += 1;
    }
    const cinta = new Date(liturgyDateInformation.Date.getFullYear(), 8, dies);
    return liturgyDateInformation.Date.getDate() === cinta.getDate() &&
        liturgyDateInformation.Date.getMonth() === cinta.getMonth() &&
        liturgyDateInformation.Date.getFullYear() === cinta.getFullYear();
}

export function JesusChristHighPriestForever(liturgyDateInformation : LiturgySpecificDayInformation) : boolean{
    //santsSolemnitats F - Dijous després de Pentecosta (Jesucrist, gran sacerdot per sempre)
    if (liturgyDateInformation.CelebrationType === CelebrationType.Festivity) {
        const granSacerdot = new Date(liturgyDateInformation.PentecostDay.getFullYear(), liturgyDateInformation.PentecostDay.getMonth(), liturgyDateInformation.PentecostDay.getDate() + 4);
        if (liturgyDateInformation.Date.getDate() === granSacerdot.getDate() &&
            liturgyDateInformation.Date.getMonth() === granSacerdot.getMonth() &&
            liturgyDateInformation.Date.getFullYear() === granSacerdot.getFullYear()) {
            return true;
        }
    }
    return false;
}

export function BlessedVirginMaryMotherOfTheChurch(liturgyDateInformation : LiturgySpecificDayInformation) : boolean{
    //santsMemories M - Dilluns despres de Pentecosta (Benaurada Verge Maria, Mare de l’Església)
    if (liturgyDateInformation.CelebrationType === CelebrationType.Memory) {
        const benaurada = new Date(liturgyDateInformation.PentecostDay.getFullYear(), liturgyDateInformation.PentecostDay.getMonth(), liturgyDateInformation.PentecostDay.getDate() + 1);
        if (liturgyDateInformation.Date.getDate() === benaurada.getDate() &&
            liturgyDateInformation.Date.getMonth() === benaurada.getMonth() &&
            liturgyDateInformation.Date.getFullYear() === benaurada.getFullYear()) {
            return true;
        }
    }
    return false;
}
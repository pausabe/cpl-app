import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import {CelebrationType} from "./DatabaseEnums";

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
import GLOBAL from "../Utils/GlobalKeys";
import SoulKeys from "./SoulKeys";
import {
    LiturgySpecificDayInformation,
    SpecialCelebration
} from "../Models/LiturgyDayInformation";
import {Settings} from "../Models/Settings";
import {DioceseCode} from "./DatabaseEnums";

export function ObtainSpecialCelebration(liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : SpecialCelebration{
    let specialCelebration = new SpecialCelebration();
    if(liturgyDayInformation.SpecificLiturgyTime == GLOBAL.Q_DIUM_PASQUA){
        return specialCelebration;
    }
    specialCelebration.SpecialDaysMasterIdentifier = ObtainSpecialDaysMasterIdentifier(liturgyDayInformation, settings);
    if (specialCelebration.SpecialDaysMasterIdentifier === -1){
        // Special days always precede Solemnity and Fair ones. We let with the '-1' value the ID
        specialCelebration.SolemnityAndFestivityMasterIdentifier = ObtainSolemnityAndFestivityMasterIdentifier(liturgyDayInformation);
    }
    specialCelebration.StrongTimesMasterIdentifier = ObtainStrongTimesMasterIdentifier(liturgyDayInformation);
    specialCelebration.SomeCelebration = specialCelebration.SpecialDaysMasterIdentifier !== -1 ||
        specialCelebration.SolemnityAndFestivityMasterIdentifier !== -1 ||
        specialCelebration.StrongTimesMasterIdentifier !== -1;
    return specialCelebration;

    // TODO: im not taking into account the following code:
    /*
    idTSFTomorrow = findTempsSolemnitatsFestes(date, LT, setmana, pentacosta);

      // By precedence we dont want tomorrow TFS if today is more important
      let idTFSToday = findTempsSolemnitatsFestes(GlobalData.date, GlobalData.LT, GlobalData.setmana, GlobalData.pentacosta);
      if(idTFSToday != -1 && idTFSToday < idTSFTomorrow){
        Logger.Log(Logger.LogKeys.HomeScreenController, "tomorrowCalVespres1CEL", "tomorrow is: " + idTSFTomorrow + " but today is more important: " + idTFSToday);
        idTSFTomorrow = -1;
      }
     */
}

/*
  Return id of #diesespecials or -1 if there isn't there
*/
function ObtainSpecialDaysMasterIdentifier(liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : number{
    const date = liturgyDayInformation.Date;
    const specificLiturgyTime = liturgyDayInformation.SpecificLiturgyTime;
    const week = liturgyDayInformation.Week;
    const dioceseCode = settings.DioceseCode;

    //1- Sagrada Família quan és el 30 de desembre
    if (IsSacredFamily(date) && date.getDate() === 30) {
        return SoulKeys.diesespecials_SagradaFamilia30Desembre;
    }

    //2- Mare de Déu (1 gener) quan cau en diumenge
    if (date.getMonth() === 0 && date.getDate() === 1 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeMaredeDeu1Gener;
    }

    const auxDay = new Date(date.getFullYear(), date.getMonth(), (date.getDate() - 7));

    //3- Diumenge II de Nadal, quan s’escau el dia 2 de gener
    if (IsSacredFamily(auxDay) && date.getDate() === 2) {
        return SoulKeys.diesespecials_DiumengeIINadal2Gener;
    }

    //4- Diumenge II de Nadal, quan s’escau el dia 3 de gener
    if (IsSacredFamily(auxDay) && date.getDate() === 3) {
        return SoulKeys.diesespecials_DiumengeIINadal3Gener;
    }

    //5- Diumenge II de Nadal, quan s’escau el dia 4 de gener
    if (IsSacredFamily(auxDay) && date.getDate() === 4) {
        return SoulKeys.diesespecials_DiumengeIINadal4Gener;
    }

    //6- Diumenge II de Nadal, quan s’escau el dia 5 de gener
    if (IsSacredFamily(auxDay) && date.getDate() === 5) {
        return SoulKeys.diesespecials_DiumengeIINadal5Gener;
    }

    //7- Baptisme del Senyor quan és 7 de gener
    if (IsBaptism(date) && date.getDate() === 7) {
        return SoulKeys.diesespecials_BaptismeSenyor7Gener;
    }

    //8- Presentació del Senyor (2 febrer) quan cau en diumenge
    if (date.getMonth() === 1 && date.getDate() === 2 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengePresentacioSenyor2febrer;
    }

    //9- Transfiguració del Senyor (6 agost) quan cau en diumenge
    if (date.getMonth() === 7 && date.getDate() === 6 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeTransfiguracioSenyor6;
    }

    //10- Exaltació Santa Creu (14 de setembre) quan cau en diumenge
    if (date.getMonth() === 8 && date.getDate() === 14 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeExaltacioSantaCreu14Setembre;
    }

    //11- Dedic. Sant Joan del Laterà (9 de novembre) quan cau en diumenge
    if (date.getMonth() === 10 && date.getDate() === 9 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeDedicacioSantJoanLatera9Novembre;
    }

    //12- Santa Eulàlia (12 de febrer) quan cau en diumenge i és temps de durant l’any
    if ((dioceseCode === DioceseCode.BaV || dioceseCode === DioceseCode.BaC) && date.getMonth() === 1 &&
        date.getDate() === 12 && date.getDay() === 0 && specificLiturgyTime === GLOBAL.O_ORDINARI) {
        return SoulKeys.diesespecials_DiumengeTempsDurantAnySantaEulalia12Febrer;
    }

    //13- Sant Joan (24 de juny) quan cau en diumenge
    if (date.getMonth() === 5 && date.getDate() === 24 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantJoan24Juny;
    }

    //14- Sants Pere i Pau (29 de juny) quan cau en diumenge
    if (date.getMonth() === 5 && date.getDate() === 29 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantsPerePau29Juny;
    }

    //15- Sant Jaume (25 de juliol) quan cau en diumenge
    if (date.getMonth() === 6 && date.getDate() === 25 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantJaume25Juliol;
    }

    //16- Assumpció Maria (15 d’agost) quan cau en diumenge
    if (date.getMonth() === 7 && date.getDate() === 15 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeAssumpcioMaria15Agost;
    }

    //17- Sta. Tecla (23 setembre) quan cau en diumenge
    if ((dioceseCode === DioceseCode.TaV || dioceseCode === DioceseCode.TaD) && date.getMonth() === 8 &&
        date.getDate() === 23 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeSantaTecla23Setembre;
    }

    //18- Mare de Déu de la Mercè (24 de setembre) quan cau en diumenge
    if ((dioceseCode === DioceseCode.BaD || dioceseCode === DioceseCode.SFD || dioceseCode === DioceseCode.TeD ||
            dioceseCode === DioceseCode.GiD || dioceseCode === DioceseCode.LlD || dioceseCode === DioceseCode.SoD || dioceseCode === DioceseCode.TaD
            || dioceseCode === DioceseCode.ToD || dioceseCode === DioceseCode.UrD || dioceseCode === DioceseCode.ViD) &&
        date.getMonth() === 8 && date.getDate() === 24 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeMareDeuMerce24Setembre;
    }

    //19- Tots Sants (1 de novembre) quan cau en diumenge
    if (date.getMonth() === 10 && date.getDate() === 1 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeTotsSants1Novembre;
    }

    //20- Diumenge IV d’Advent, dia 18
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '4' && date.getDate() === 18 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent18;
    }

    //21- Diumenge IV d’Advent, dia 19
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '4' && date.getDate() === 19 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent19;
    }

    //22- Diumenge IV d’Advent, dia 20
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '4' && date.getDate() === 20 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent20;
    }

    //23- Diumenge IV d’Advent, dia 21
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '4' && date.getDate() === 21 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent21;
    }

    //24- Diumenge IV d’Advent, dia 22
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '4' && date.getDate() === 22 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent22;
    }

    //25- Diumenge IV d’Advent, dia 23
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '4' && date.getDate() === 23 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent23;
    }

    //26- Diumenge IV d’Advent, dia 24
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '4' && date.getDate() === 24 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeIVAdvent24;
    }

    //27- Diumenge III d'Advent, quan és fèria
    if (specificLiturgyTime === GLOBAL.A_FERIES && week === '3' && date.getDay() === 0) {
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

    return -1;
}

/*
  Return id of #tempsSolemnitatsFestes or -1 if there isnt there
*/
function ObtainSolemnityAndFestivityMasterIdentifier(liturgyDayInformation : LiturgySpecificDayInformation) : number {
    const date = liturgyDayInformation.Date;
    const specificLiturgyTime = liturgyDayInformation.SpecificLiturgyTime;
    const week = liturgyDayInformation.Week;
    const pentecostDay = liturgyDayInformation.PentecostDay;

    //1- Nadal
    if (date.getDate() === 25 && date.getMonth() === 11) {
        return SoulKeys.tempsSolemnitatsFestes_Nadal;
    }

    //2- Sagrada Família
    if (IsSacredFamily(date)) {
        return SoulKeys.tempsSolemnitatsFestes_SagradaFamilia;
    }

    //3- Mare de Déu
    if (date.getDate() === 1 && date.getMonth() === 0) {
        return SoulKeys.tempsSolemnitatsFestes_MareDeu;
    }

    //4- Epifania
    if (date.getDate() === 6 && date.getMonth() === 0) {
        return SoulKeys.tempsSolemnitatsFestes_Epifania;
    }

    //5- Baptisme
    if (IsBaptism(date)) {
        return SoulKeys.tempsSolemnitatsFestes_Baptisme;
    }

    //6- Ascensió
    if (date.getDay() === 0 && specificLiturgyTime === GLOBAL.P_SETMANES && week === '7') {
        return SoulKeys.tempsSolemnitatsFestes_Ascensio;
    }

    //7- Diumenge pentacosta
    if (date.getDate() === pentecostDay.getDate() && date.getMonth() === pentecostDay.getMonth() &&
        date.getFullYear() === pentecostDay.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_DiumengePentacosta;
    }

    //8- Santíssima trinitat
    const trinitat = new Date(pentecostDay.getFullYear(), pentecostDay.getMonth(), pentecostDay.getDate() + 7);
    if (date.getDate() === trinitat.getDate() && date.getMonth() === trinitat.getMonth() &&
        date.getFullYear() === trinitat.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_SantissimaTrinitat;
    }

    //9- Santíssim cos i sang de crist
    const cosSang = new Date(trinitat.getFullYear(), trinitat.getMonth(), trinitat.getDate() + 7);
    if (date.getDate() === cosSang.getDate() && date.getMonth() === cosSang.getMonth() &&
        date.getFullYear() === cosSang.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_SantissimCosSangCrist;
    }

    //10- Sagrat cor de Jesús
    const sagratCor = new Date(cosSang.getFullYear(), cosSang.getMonth(), cosSang.getDate() + 5);
    if (date.getDate() === sagratCor.getDate() && date.getMonth() === sagratCor.getMonth() &&
        date.getFullYear() === sagratCor.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_SagratCorJesus;
    }

    //11- Nostre senyor Jesucrist
    if (date.getDay() === 0 && specificLiturgyTime === GLOBAL.O_ORDINARI && week === '34') {
        return SoulKeys.tempsSolemnitatsFestes_NostreSenyorJesucrist;
    }

    return -1;
}

/*
  Return id of #salteriComuOficiTF or -1 if there isn't there
*/
function ObtainStrongTimesMasterIdentifier(liturgyDayInformation : LiturgySpecificDayInformation) {
    const date = liturgyDayInformation.Date;
    const specificLiturgyTime = liturgyDayInformation.SpecificLiturgyTime;
    const week = liturgyDayInformation.Week;

    //1- Dissabte I Advent
    if (specificLiturgyTime === GLOBAL.A_SETMANES && week === '1' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIAdvent;
    }

    //2- Dissabte II Advent
    if (specificLiturgyTime === GLOBAL.A_SETMANES && week === '2' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIIAdvent;
    }

    //3- Divendres IV Advent (si és el 23 de desembre)
    if (specificLiturgyTime === GLOBAL.A_SETMANES && week === '4' && date.getDate() === 23 && date.getMonth() == 11 && date.getDay() == 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVAdvent23Desembre;
    }

    //4- Divendres IV Advent (si és el 24 de desembre)
    if (specificLiturgyTime === GLOBAL.A_SETMANES && week === '4' && date.getDate() === 24 && date.getMonth() == 11 && date.getDay() == 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVAdvent24Desembre;
    }

    //5- Dissabte IV Advent (24 de desembre)
    if (specificLiturgyTime === GLOBAL.A_SETMANES && week === '4' && date.getDate() === 24 && date.getMonth() == 11 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIVAdvent;
    }

    //6- Dissabte I Nadal (si és el 2 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '1' && date.getDate() === 2 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal2Gener;
    }

    //7- Dissabte I Nadal (si és el 3 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '1' && date.getDate() === 3 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal3Gener;
    }

    //8- Dissabte I Nadal (si és el 4 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '1' && date.getDate() === 4 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal4Gener;
    }

    //9- Dissabte I Nadal (si és el 5 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '1' && date.getDate() === 5 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteINadal5Gener;
    }

    //10- Dissabte II Nadal (si és el 7 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '2' && date.getDate() === 7 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal7Gener;
    }

    //11- Dissabte II Nadal (si és el 8 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '2' && date.getDate() === 8 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal8Gener;
    }

    //12- Dissabte II Nadal (si és el 9 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '2' && date.getDate() === 9 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal9Gener;
    }

    //13- Dissabte II Nadal (si és el 10 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '2' && date.getDate() === 10 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal10Gener;
    }

    //14- Dissabte II Nadal (si és el 11 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '2' && date.getDate() === 11 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal11Gener;
    }

    //15- Dissabte II Nadal (si és el 12 de gener)
    if (specificLiturgyTime === GLOBAL.N_ABANS && week === '2' && date.getDate() === 12 && date.getMonth() === 0 && date.getDay() == 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIINadal12Gener;
    }

    //16- Divendres després de Cendra, Quaresma
    if (specificLiturgyTime === GLOBAL.Q_CENDRA && date.getDay() === 5) {
        return SoulKeys.salteriComuOficiTF_DivendresDespresCendraQuaresma;
    }

    //17- Dissabte després de Cendra, Quaresma
    if (specificLiturgyTime === GLOBAL.Q_CENDRA && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteDespresCendraQuaresma;
    }

    //18- Dissabte I Quaresma
    if (specificLiturgyTime === GLOBAL.Q_SETMANES && week === '1' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIQuaresma;
    }

    //19- Dissabte II Quaresma
    if (specificLiturgyTime === GLOBAL.Q_SETMANES && week === '2' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIIQuaresma;
    }

    //20- Divendres IV Quaresma
    if (specificLiturgyTime === GLOBAL.Q_SETMANES && week === '4' && date.getDay() === 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVQuaresma;
    }

    //21- Dissabte IV Quaresma
    if (specificLiturgyTime === GLOBAL.Q_SETMANES && week === '4' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIVQuaresma;
    }

    //22- Dissabte V Quaresma
    if (specificLiturgyTime === GLOBAL.Q_SETMANES && week === '5' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteVQuaresma;
    }

    //23- Dissabte II Pasqua
    if (specificLiturgyTime === GLOBAL.P_SETMANES && week === '2' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteIIPasqua;
    }

    //24- Divendres IV Pasqua
    if (specificLiturgyTime === GLOBAL.P_SETMANES && week === '4' && date.getDay() === 5) {
        return SoulKeys.salteriComuOficiTF_DivendresIVPasqua;
    }

    //25- Dissabte IV Pasqua
    if (specificLiturgyTime === GLOBAL.P_SETMANES && week === '4' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_issabteIVPasqua;
    }

    //26- Dissabte V Pasqua
    if (specificLiturgyTime === GLOBAL.P_SETMANES && week === '5' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteVPasqua;
    }

    //27- Dissabte VI Pasqua
    if (specificLiturgyTime === GLOBAL.P_SETMANES && week === '6' && date.getDay() === 6) {
        return SoulKeys.salteriComuOficiTF_DissabteVIPasqua;
    }

    return -1;
}

function IsSacredFamily(today : Date) : boolean{
    if (today.getMonth() !== 11) return false; // December
    if (today.getDay() !== 0) return false; // Sunday
    if (today.getDate() < 26 || today.getDate() > 31) return false; // Between [26 & 31]
    return true;
}

function IsBaptism(today : Date) : boolean{
    if (today.getMonth() !== 0) return false;
    if (today.getDay() !== 0) return false;
    return !(today.getDate() < 7 || today.getDate() > 13);

}

import * as Logger from '../../Utils/Logger';
import OficiSoul from '../../Controllers/Classes/SOUL/OficiSoul';
import LaudesSoul from '../../Controllers/Classes/SOUL/LaudesSoul';
import VespresSoul from '../../Controllers/Classes/SOUL/VespresSoul';
import HoraMenorSoul from '../../Controllers/Classes/SOUL/HoraMenorSoul';
import CompletesSoul from '../../Controllers/Classes/SOUL/CompletesSoul';
import CelebracioSoul from '../../Controllers/Classes/SOUL/CelebracioSoul';
import GLOBAL from '../../Utils/GlobalKeys';
import GF from '../../Utils/GlobalFunctions';
import SoulKeys from '../../Controllers/Classes/SOUL/SoulKeys';
import * as DatabaseDataService from '../DatabaseDataService';
import HoursLiturgy from "../../Models/HoursLiturgyModel";

let GlobalData;
let queryRows = {
  salteriComuOfici: '', //1
  salteriComuInvitatori: '', //2
  tempsOrdinariOfici: '', //3
  tempsOrdinariOracions: '', //4.1
  tempsOrdinariOracionsVespres1: '', //4.2
  tempsQuaresmaComuFV: '', //5
  tempsQuaresmaCendra: '', //6
  tempsQuaresmaVSetmanes: '', //7
  tempsQuaresmaComuSS: '', //8
  tempsQuaresmaRams: '', //9
  tempsQuaresmaSetSanta: '', //10
  tempsQuaresmaTridu: '', //11
  tempsPasquaAA: '', //12
  tempsPasquaOct: '', //13
  tempsPasquaDA: '', //14
  tempsPasquaSetmanes: '', //15
  tempsAdventNadalComu: '', //16
  tempsAdventSetmanes: '', //17
  tempsAdventSetmanesDium: '', //18.1
  tempsAdventSetmanesDiumVespres1: '', //18.2
  tempsAdventFeries: '', //19.1
  tempsAdventFeriesAnt: '', //19.2
  tempsNadalOctava: '', //20
  tempsNadalAbansEpifania: '', //21
  salteriComuEspPasquaDium: '', //22
  diversos: '', //23
  salteriComuLaudes: '', //24
  salteriComuEspPasqua: '', //25
  tempsPasquaSetmanesDium: '', //26.1
  tempsPasquaSetmanesDiumVespres1: '', //26.2
  tempsQuaresmaDiumPasq: '', //27
  tempsQuaresmaVSetmanesDium: '', //28.1
  tempsQuaresmaVSetmanesDiumVespres1: '', //28.2
  salteriComuVespres: '', //29
  tempsSolemnitatsFestes: '', //30.1
  tempsSolemnitatsFestesVespres1: '', //30.2
  salteriComuHora: '', //31
  salteriComuCompletes: '', //32
  salteriComuOficiTF: '', //33
  santsSolemnitats: '', //34.1
  santsSolemnitatsFVespres1: '', //34.2
  santsMemories: '', //35
  OficisComuns: null, //36.1
  OficisComunsVespres1: null,
  diesespecials: '', //37
}
let LITURGIA = { //8
  info_cel: null,
  info_celTom: null,
  ofici: null,
  laudes: null,
  vespres1: false,
  vespres: null,
  tercia: null,
  sexta: null,
  nona: null,
  completes: null,
}
let INFO_CEL;
let OFICI;
let LAUDES;
let TERCIA;
let SEXTA;
let NONA;
let VESPRES;
let VESPRES1;
let COMPLETES;
let countLit = 7;
let idDE;
let idTSF;
let oficiComuCount;
let id;
let prec;
let tomorrowCal;
let weekDayNormal;
let auxCicle;
let idDM;
let cicleAux;
let idLaudes;
let auxDay;
let weekDayNormalVESPRES;
let idTSFTomorrow;
let idDETomorrow;
let categoria;
let info_cel;
let count;
let celbracioSoul;
let oficiSoul;
let laudesSoul;
let vespresSoul;
let horaMenorSoul;
let completesSoul;
let vespresCelDEF;
let CEL;

export function ObtainHoursLiturgy(globalData) : Promise<HoursLiturgy> {
  GlobalData = globalData;

  prec = 22;
  if (GlobalData.date.getDay() === 0) {//diumenge
    prec = 9;
    if (GlobalData.LT === GLOBAL.A_SETMANES ||
      GlobalData.LT === GLOBAL.A_FERIES ||
      GlobalData.LT === GLOBAL.Q_CENDRA ||
      GlobalData.LT === GLOBAL.Q_SETMANES ||
      GlobalData.LT === GLOBAL.Q_SET_SANTA ||
      GlobalData.LT === GLOBAL.P_OCTAVA ||
      GlobalData.LT === GLOBAL.P_SETMANES) {
      prec = 2;
    }
  }
  let idDE_aux = findDiesEspecials(GlobalData.date, GlobalData.LT, GlobalData.setmana, GlobalData.pentacosta, GlobalData.diocesi);
  idDE = idDE_aux;
  let idTSF_aux;
  if (idDE_aux === -1)
    idTSF_aux = findTempsSolemnitatsFestes(GlobalData.date, GlobalData.LT, GlobalData.setmana, GlobalData.pentacosta);
  else idTSF_aux = -1;
  idTSF = idTSF_aux;
  const idTF = findTF(GlobalData.date, GlobalData.LT, GlobalData.setmana, GlobalData.pentacosta);

  tomorrowCal = '-';
  tomorrowCal = tomorrowCalVespres1CEL(GlobalData.dataTomorrow.date, GlobalData.dataTomorrow.LT,
  GlobalData.dataTomorrow.setmana, GlobalData.pentacosta, GlobalData.diocesi);

  let params = {
    date: GlobalData.date,
    vespres1: false,
    celType: GlobalData.celType,
    diocesi: GlobalData.diocesi,
    llati: GlobalData.llati,
    idTSF: idTSF_aux,
    idDE: idDE_aux,
    Set_Soul_CB: Set_Soul_CB,
  }


}

function getOficisComuns(params, result, isForVespres1) {
  if (result) {
    categoria = result.Categoria;
    if (categoria !== '0000') {
      //taula 36 (#??): -
      DatabaseDataService.getOC(categoria, (result, cat) => {
        if (params.vespres1 && isForVespres1) {
          queryRows.OficisComunsVespres1 = result;
        }
        else {
          queryRows.OficisComuns = result;
        }
        dataReceived(params);
      });
    }

    else {
      dataReceived(params);
    }

  }
  else {
    Logger.LogError(Logger.LogKeys.HomeScreenController, "getOficisComuns", "InfoLog. Error OC. No result from DB");
    creatingEmptyCEL();
    info_cel = {
      nomCel: '-',
      infoCel: '-',
      typeCel: '-'
    }
    LITURGIA.info_cel = info_cel;
    calls(params.Set_Soul_CB);
  }
}

function dataReceived(params) {
  count -= 1;

  if (count === 0) {
    if (celbracioSoul === undefined) {
      celbracioSoul = new CelebracioSoul(queryRows, params.idTSF, params.idDE, params.Set_Soul_CB, this, tomorrowCal, GlobalData);
    }
    else {
      celbracioSoul.makePrayer(queryRows, params.idTSF, params.idDE, params.Set_Soul_CB, this, tomorrowCal);
    }
  }
}

function setSoul(Set_Soul_CB, type, pregaria) {
    switch (type) {
      case "ofici":
        countLit -= 1;
        LITURGIA.ofici = pregaria;
        break;
      case "laudes":
        countLit -= 1;
        LITURGIA.laudes = pregaria;
        break;
      case "vespres":
        countLit -= 1;
        LITURGIA.vespres = pregaria;
        break;
      case "tercia":
        countLit -= 1;
        LITURGIA.tercia = pregaria;
        break;
      case "sexta":
        LITURGIA.sexta = pregaria;
        countLit -= 1;
        break;
      case "nona":
        countLit -= 1;
        LITURGIA.nona = pregaria;
        break;
      case "completes":
        countLit -= 1;
        LITURGIA.completes = pregaria;
        break;
      case "celebracio":
        CEL = pregaria;
        
        LITURGIA.info_cel = pregaria.INFO_CEL;

        calls(Set_Soul_CB);
        break;
    }

    if (countLit === 0) {
      countLit = 7;
      Set_Soul_CB(LITURGIA, LITURGIA.info_cel);
    }
  }

function calls(Set_Soul_CB) {
    setSomeInfo();
    if (
      tomorrowCal === '-' || //demà no hi ha cap celebració
      tomorrowCal === 'F' || //demà hi ha Festa

      // TODO: HARDCODED These conditions below is there to fix Montserrat's Day. Fix properly (fa que les vespres siguin de Montserrat i no de St Jordi)
      (GlobalData.date.getFullYear() == 2019 && GlobalData.date.getMonth() == 3 && GlobalData.date.getDate() == 30) ||
      (GlobalData.date.getFullYear() == 2022 && GlobalData.date.getMonth() == 3 && GlobalData.date.getDate() == 27) ||

      (idTSF !== -1 && tomorrowCal !== 'TSF') || //quan dues TSF seguides es fa Vespres1 de la segona TSF. Basicamen evito el conflicte de les Vespres de Sagrada Familia quan cau en 31/12 i l'andemà és Mare de Déi 1/1 (únic conflicte possible entre TSF)
      (idDE !== -1 && tomorrowCal === '-') || //avui és DE i demà no hi ha celebració
      (GlobalData.date.getDay() === 0 && tomorrowCal === 'S' && GlobalData.LT !== GLOBAL.O_ORDINARI) //Amb això generalitzo que DiumengeOrdinari>S i potser no és així
    ) {
      LITURGIA.vespres1 = false;
      vespresCelDEF = CEL.VESPRES;
      
    }
    else if (tomorrowCal === 'T') { //demà és divendres Sant
      LITURGIA.vespres1 = false;
      vespresCelDEF = CEL.VESPRES1;
    }
    else {
      LITURGIA.vespres1 = true;
      vespresCelDEF = CEL.VESPRES1;
    }

    if (oficiSoul === undefined) {
      oficiSoul = new OficiSoul(queryRows, CEL.OFICI, Set_Soul_CB, this, GlobalData);
      laudesSoul = new LaudesSoul(queryRows, CEL.LAUDES, Set_Soul_CB, this, GlobalData);
      vespresSoul = new VespresSoul(queryRows, vespresCelDEF, Set_Soul_CB, this, GlobalData);
      horaMenorSoul = new HoraMenorSoul(queryRows, CEL.HORA_MENOR, Set_Soul_CB, this, GlobalData);
      completesSoul = new CompletesSoul(queryRows, Set_Soul_CB, this, GlobalData);
    }
    else {
      oficiSoul.makePrayer(queryRows, CEL.OFICI, Set_Soul_CB, this);
      laudesSoul.makePrayer(queryRows, CEL.LAUDES, Set_Soul_CB, this);
      vespresSoul.makePrayer(queryRows, vespresCelDEF, Set_Soul_CB, this);
      horaMenorSoul.makePrayer(queryRows, CEL.HORA_MENOR, Set_Soul_CB, this);
      completesSoul.makePrayer(queryRows, Set_Soul_CB, this);
    }
  }

function setSomeInfo() {
    if (GlobalData.LT === GLOBAL.Q_DIUM_RAMS) {
      LITURGIA.info_cel.nomCel = "Diumenge de Rams";
      LITURGIA.info_cel.infoCel = '-';
      LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.Q_SET_SANTA) {
      LITURGIA.info_cel.nomCel = weekDayName(GlobalData.date.getDay()) + " Sant";
      LITURGIA.info_cel.infoCel = '-';
      LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.Q_TRIDU) {
      LITURGIA.info_cel.nomCel = weekDayName(GlobalData.date.getDay()) + " Sant";
      LITURGIA.info_cel.infoCel = '-';
      LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.P_OCTAVA) {
      LITURGIA.info_cel.nomCel = "Octava de Pasqua";
      LITURGIA.info_cel.infoCel = '-';
      LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-'
      && GlobalData.LT === GLOBAL.N_OCTAVA
      && idTSF === -1 && idDE === -1) {
      LITURGIA.info_cel.nomCel = "Octava de Nadal";
      LITURGIA.info_cel.infoCel = '-';
      LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.Q_CENDRA) {
      LITURGIA.info_cel.nomCel = "Cendra";
      LITURGIA.info_cel.infoCel = '-';
      LITURGIA.info_cel.typeCel = '-';
    }
    else if (LITURGIA.info_cel.nomCel === '-' && GlobalData.LT === GLOBAL.A_FERIES) {
      LITURGIA.info_cel.nomCel = "Fèria d’Advent";
      LITURGIA.info_cel.infoCel = '-';
      LITURGIA.info_cel.typeCel = '-';
    }
  }

function weekDayName(num) {
    switch (num) {
      case 0:
        return ("Diumenge");
        break;
      case 1:
        return ("Dilluns");
        break;
      case 2:
        return ("Dimarts");
        break;
      case 3:
        return ("Dimecres");
        break;
      case 4:
        return ("Dijous");
        break;
      case 5:
        return ("Divendres");
        break;
      case 6:
        return ("Dissabte");
        break;
    }
  }

function tomorrowCalVespres1CEL(date, LT, setmana, pentacosta, diocesi) {
    if (LT !== GLOBAL.Q_DIUM_PASQUA) {
      if (LT === GLOBAL.Q_DIUM_RAMS) return 'DR';
      if (date.getDay() === 5 && LT === GLOBAL.Q_TRIDU) return 'T';
      if (date.getDay() === 0 && setmana === '1' && LT === GLOBAL.A_SETMANES) return 'A';

      idDETomorrow = findDiesEspecials(date, LT, setmana, pentacosta, diocesi);
      if (idDETomorrow !== -1 && idDETomorrow !== 1)
        return 'DE';

      idTSFTomorrow = findTempsSolemnitatsFestes(date, LT, setmana, pentacosta);
 
      // By precedence we dont want tomorrow TFS if today is more important
      let idTFSToday = findTempsSolemnitatsFestes(GlobalData.date, GlobalData.LT, GlobalData.setmana, GlobalData.pentacosta);
      if(idTFSToday != -1 && idTFSToday < idTSFTomorrow){
        Logger.Log(Logger.LogKeys.HomeScreenController, "tomorrowCalVespres1CEL", "tomorrow is: " + idTSFTomorrow + " but today is more important: " + idTFSToday);
        idTSFTomorrow = -1;
      }

      if (idTSFTomorrow !== -1) {
        return 'TSF';
      }

      if (GlobalData.dataTomorrow.celType === 'S') return 'S';
    }
    return '-';
  }

/*
  Return id of #santsMemories or #santsSolemnitats or -1 if there isn't there
*/
function diesMov(date, LT, setmana, pentacosta, celType) {
    let precAux;
    //santsMemories M - Dissabte de la tercera setmana després de Pentecosta (COR IMMACULAT DE LA BENAURADA VERGE MARIA)
    if (celType === 'M') {
      let corImmaculat = new Date(pentacosta.getFullYear(), pentacosta.getMonth(), pentacosta.getDate() + 20);
      if (date.getDate() === corImmaculat.getDate() && date.getMonth() === corImmaculat.getMonth() &&
        date.getFullYear() === corImmaculat.getFullYear()) {
        precAux = 10;
        if (precAux < prec) prec = precAux;
        return SoulKeys.santsMemories_CorImmaculatBenauradaVergeMaria;
      }
    }

    //santsMemories M - Dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
    //santsSolemnitats S - Dissabte abans del primer diumenge de setembre (MARE DE DÉU DE LA CINTA)
    var auxDay = new Date(date.getFullYear(), 8, 2);
    var b = true;
    var dies = 0;
    while (b && dies < 7) {
      if (auxDay.getDay() === 0) {
        b = false;
      }
      auxDay.setDate(auxDay.getDate() + 1)
      dies += 1;
    }
    var cinta = new Date(date.getFullYear(), 8, dies);
    if (date.getDate() === cinta.getDate() && date.getMonth() === cinta.getMonth() &&
      date.getFullYear() === cinta.getFullYear()) {
      if (celType === 'M') {
        precAux = 10;
        if (precAux < prec) prec = precAux;
        return SoulKeys.santsMemories_MareDeuCinta;
      }
      if (celType === 'S') {
        precAux = 4;
        if (precAux < prec) prec = precAux;
        return SoulKeys.santsSolemnitats_MareDeuCinta;
      }
    }

    //santsSolemnitats F - Dijous després de Pentecosta (Jesucrist, gran sacerdot per sempre)
    if (celType === 'F') {
      var granSacerdot = new Date(pentacosta.getFullYear(), pentacosta.getMonth(), pentacosta.getDate() + 4);
      if (date.getDate() === granSacerdot.getDate() && date.getMonth() === granSacerdot.getMonth() &&
        date.getFullYear() === granSacerdot.getFullYear()) {
        precAux = 8;
        if (precAux < prec) prec = precAux;
        return SoulKeys.santsSolemnitats_JesucristGranSacerdotSempre;
      }
    }

    //santsMemories M - Dilluns despres de Pentecosta (Benaurada Verge Maria, Mare de l’Església)
    if (celType === 'M') {
      var benaurada = new Date(pentacosta.getFullYear(), pentacosta.getMonth(), pentacosta.getDate() + 1);
      if (date.getDate() === benaurada.getDate() && date.getMonth() === benaurada.getMonth() &&
        date.getFullYear() === benaurada.getFullYear()) {
        precAux = 10;
        if (precAux < prec) prec = precAux;
        return SoulKeys.santsMemories_BenauradaVergeMariaMareEsglesia;
      }
    }

    return -1;
  }

/*
  Return id of #salteriComuOficiTF or -1 if there isn't there
*/
function findTF(date, LT, setmana, pentacosta) {
    //1- Dissabte I Advent
    if (LT === GLOBAL.A_SETMANES && setmana === '1' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIAdvent;
    }

    //2- Dissabte II Advent
    if (LT === GLOBAL.A_SETMANES && setmana === '2' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIIAdvent;
    }

    //3- Divendres IV Advent (si és el 23 de desembre)
    if (LT === GLOBAL.A_SETMANES && setmana === '4' && date.getDate() === 23 && date.getMonth() == 11 && date.getDay() == 5) {
      return SoulKeys.salteriComuOficiTF_DivendresIVAdvent23Desembre;
    }

    //4- Divendres IV Advent (si és el 24 de desembre)
    if (LT === GLOBAL.A_SETMANES && setmana === '4' && date.getDate() === 24 && date.getMonth() == 11 && date.getDay() == 5) {
      return SoulKeys.salteriComuOficiTF_DivendresIVAdvent24Desembre;
    }

    //5- Dissabte IV Advent (24 de desembre)
    if (LT === GLOBAL.A_SETMANES && setmana === '4' && date.getDate() === 24 && date.getMonth() == 11 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIVAdvent;
    }

    //6- Dissabte I Nadal (si és el 2 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '1' && date.getDate() === 2 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteINadal2Gener;
    }

    //7- Dissabte I Nadal (si és el 3 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '1' && date.getDate() === 3 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteINadal3Gener;
    }

    //8- Dissabte I Nadal (si és el 4 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '1' && date.getDate() === 4 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteINadal4Gener;
    }

    //9- Dissabte I Nadal (si és el 5 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '1' && date.getDate() === 5 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteINadal5Gener;
    }

    //10- Dissabte II Nadal (si és el 7 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '2' && date.getDate() === 7 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIINadal7Gener;
    }

    //11- Dissabte II Nadal (si és el 8 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '2' && date.getDate() === 8 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIINadal8Gener;
    }

    //12- Dissabte II Nadal (si és el 9 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '2' && date.getDate() === 9 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIINadal9Gener;
    }

    //13- Dissabte II Nadal (si és el 10 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '2' && date.getDate() === 10 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIINadal10Gener;
    }

    //14- Dissabte II Nadal (si és el 11 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '2' && date.getDate() === 11 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIINadal11Gener;
    }

    //15- Dissabte II Nadal (si és el 12 de gener)
    if (LT === GLOBAL.N_ABANS && setmana === '2' && date.getDate() === 12 && date.getMonth() === 0 && date.getDay() == 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIINadal12Gener;
    }

    //16- Divendres després de Cendra, Quaresma
    if (LT === GLOBAL.Q_CENDRA && date.getDay() === 5) {
      return SoulKeys.salteriComuOficiTF_DivendresDespresCendraQuaresma;
    }

    //17- Dissabte després de Cendra, Quaresma
    if (LT === GLOBAL.Q_CENDRA && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteDespresCendraQuaresma;
    }

    //18- Dissabte I Quaresma
    if (LT === GLOBAL.Q_SETMANES && setmana === '1' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIQuaresma;
    }

    //19- Dissabte II Quaresma
    if (LT === GLOBAL.Q_SETMANES && setmana === '2' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIIQuaresma;
    }

    //20- Divendres IV Quaresma
    if (LT === GLOBAL.Q_SETMANES && setmana === '4' && date.getDay() === 5) {
      return SoulKeys.salteriComuOficiTF_DivendresIVQuaresma;
    }

    //21- Dissabte IV Quaresma
    if (LT === GLOBAL.Q_SETMANES && setmana === '4' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIVQuaresma;
    }

    //22- Dissabte V Quaresma
    if (LT === GLOBAL.Q_SETMANES && setmana === '5' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteVQuaresma;
    }

    //23- Dissabte II Pasqua
    if (LT === GLOBAL.P_SETMANES && setmana === '2' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteIIPasqua;
    }

    //24- Divendres IV Pasqua
    if (LT === GLOBAL.P_SETMANES && setmana === '4' && date.getDay() === 5) {
      return SoulKeys.salteriComuOficiTF_DivendresIVPasqua;
    }

    //25- Dissabte IV Pasqua
    if (LT === GLOBAL.P_SETMANES && setmana === '4' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_issabteIVPasqua;
    }

    //26- Dissabte V Pasqua
    if (LT === GLOBAL.P_SETMANES && setmana === '5' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteVPasqua;
    }

    //27- Dissabte VI Pasqua
    if (LT === GLOBAL.P_SETMANES && setmana === '6' && date.getDay() === 6) {
      return SoulKeys.salteriComuOficiTF_DissabteVIPasqua;
    }

    return -1;
  }
  
/*
  Return id of #diesespecials or -1 if there isn't there
*/
function findDiesEspecials(date, LT, setmana, pentacosta, diocesi) {
    //1- Sagrada Família quan és el 30 de desembre
    if (isSagradaFamilia(date) && date.getDate() === 30) {
      return SoulKeys.diesespecials_SagradaFamilia30Desembre;
    }

    //2- Mare de Déu (1 gener) quan cau en diumenge
    if (date.getMonth() === 0 && date.getDate() === 1 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeMaredeDeu1Gener;
    }

    var auxDay = new Date(date.getFullYear(), date.getMonth(), (date.getDate() - 7));

    //3- Diumenge II de Nadal, quan s’escau el dia 2 de gener
    if (isSagradaFamilia(auxDay) && date.getDate() === 2) {
      return SoulKeys.diesespecials_DiumengeIINadal2Gener;
    }

    //4- Diumenge II de Nadal, quan s’escau el dia 3 de gener
    if (isSagradaFamilia(auxDay) && date.getDate() === 3) {
      return SoulKeys.diesespecials_DiumengeIINadal3Gener;
    }

    //5- Diumenge II de Nadal, quan s’escau el dia 4 de gener
    if (isSagradaFamilia(auxDay) && date.getDate() === 4) {
      return SoulKeys.diesespecials_DiumengeIINadal4Gener;
    }

    //6- Diumenge II de Nadal, quan s’escau el dia 5 de gener
    if (isSagradaFamilia(auxDay) && date.getDate() === 5) {
      return SoulKeys.diesespecials_DiumengeIINadal5Gener;
    }

    //7- Baptisme del Senyor quan és 7 de gener
    if (isBaptisme(date) && date.getDate() === 7) {
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
    if ((diocesi === 'BaV' || diocesi === 'BaC') && date.getMonth() === 1 &&
      date.getDate() === 12 && date.getDay() === 0 && LT === GLOBAL.O_ORDINARI) {
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
    if ((diocesi === 'TaV' || diocesi === 'TaD') && date.getMonth() === 8 &&
      date.getDate() === 23 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeSantaTecla23Setembre;
    }

    //18- Mare de Déu de la Mercè (24 de setembre) quan cau en diumenge
    if ((diocesi === 'BaD' || diocesi === 'SFD' || diocesi === 'TeD' ||
      diocesi === 'GiD' || diocesi === 'LlD' || diocesi === 'SoD' || diocesi === 'TaD'
      || diocesi === 'ToD' || diocesi === 'UrD' || diocesi === 'ViD') &&
      date.getMonth() === 8 && date.getDate() === 24 && date.getDay() === 0) {
        return SoulKeys.diesespecials_DiumengeMareDeuMerce24Setembre;
    }

    //19- Tots Sants (1 de novembre) quan cau en diumenge
    if (date.getMonth() === 10 && date.getDate() === 1 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeTotsSants1Novembre;
    }

    //20- Diumenge IV d’Advent, dia 18
    if (LT === GLOBAL.A_FERIES && setmana === '4' && date.getDate() === 18 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeIVAdvent18;
    }

    //21- Diumenge IV d’Advent, dia 19
    if (LT === GLOBAL.A_FERIES && setmana === '4' && date.getDate() === 19 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeIVAdvent19;
    }

    //22- Diumenge IV d’Advent, dia 20
    if (LT === GLOBAL.A_FERIES && setmana === '4' && date.getDate() === 20 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeIVAdvent20;
    }

    //23- Diumenge IV d’Advent, dia 21
    if (LT === GLOBAL.A_FERIES && setmana === '4' && date.getDate() === 21 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeIVAdvent21;
    }

    //24- Diumenge IV d’Advent, dia 22
    if (LT === GLOBAL.A_FERIES && setmana === '4' && date.getDate() === 22 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeIVAdvent22;
    }

    //25- Diumenge IV d’Advent, dia 23
    if (LT === GLOBAL.A_FERIES && setmana === '4' && date.getDate() === 23 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeIVAdvent23;
    }

    //26- Diumenge IV d’Advent, dia 24
    if (LT === GLOBAL.A_FERIES && setmana === '4' && date.getDate() === 24 && date.getDay() === 0) {
      return SoulKeys.diesespecials_DiumengeIVAdvent24;
    }

    //27- Diumenge III d'Advent, quan és fèria
    if (LT === GLOBAL.A_FERIES && setmana === '3' && date.getDay() === 0) {
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
function findTempsSolemnitatsFestes(date, LT, setmana, pentacosta) {
    //1- Nadal
    if (date.getDate() === 25 && date.getMonth() === 11) {
      return SoulKeys.tempsSolemnitatsFestes_Nadal;
    }

    //2- Sagrada Família
    if (isSagradaFamilia(date)) {
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
    if (isBaptisme(date)) {
      return SoulKeys.tempsSolemnitatsFestes_Baptisme;
    }

    //6- Ascensió
    if (date.getDay() === 0 && LT === GLOBAL.P_SETMANES && setmana === '7') {
      return SoulKeys.tempsSolemnitatsFestes_Ascensio;
    }

    //7- Diumenge pentacosta
    if (date.getDate() === pentacosta.getDate() && date.getMonth() === pentacosta.getMonth() &&
      date.getFullYear() === pentacosta.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_DiumengePentacosta;
    }

    //8- Santíssima trinitat
    var trinitat = new Date(pentacosta.getFullYear(), pentacosta.getMonth(), pentacosta.getDate() + 7);
    if (date.getDate() === trinitat.getDate() && date.getMonth() === trinitat.getMonth() &&
      date.getFullYear() === trinitat.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_SantissimaTrinitat;
    }

    //9- Santíssim cos i sang de crist
    var cosSang = new Date(trinitat.getFullYear(), trinitat.getMonth(), trinitat.getDate() + 7);
    if (date.getDate() === cosSang.getDate() && date.getMonth() === cosSang.getMonth() &&
      date.getFullYear() === cosSang.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_SantissimCosSangCrist;
    }

    //10- Sagrat cor de Jesús
    var sagratCor = new Date(cosSang.getFullYear(), cosSang.getMonth(), cosSang.getDate() + 5);
    if (date.getDate() === sagratCor.getDate() && date.getMonth() === sagratCor.getMonth() &&
      date.getFullYear() === sagratCor.getFullYear()) {
        return SoulKeys.tempsSolemnitatsFestes_SagratCorJesus;
    }

    //11- Nostre senyor Jesucrist
    if (date.getDay() === 0 && LT === GLOBAL.O_ORDINARI && setmana === '34') {
      return SoulKeys.tempsSolemnitatsFestes_NostreSenyorJesucrist;
    }

    return -1;
  }

function isSagradaFamilia(today) {
    if (today.getMonth() !== 11) return false; // Dicember
    if (today.getDay() !== 0) return false; // Sunday
    if (today.getDate() < 26 || today.getDate() > 31) return false; // Between [26 & 31]
    return true;
  }

function isBaptisme(today) {
    if (today.getMonth() !== 0) return false;
    if (today.getDay() !== 0) return false;
    if (today.getDate() < 7 || today.getDate() > 13) return false;
    return true;
  }

function creatingEmptyCEL() {
    INFO_CEL = {
      nomCel: '-',
      infoCel: '-',
      typeCel: '-',
    }

    OFICI = { //60
      diumPasqua: false,
      invitatori: '-',
      antInvitatori: '-',
      salm94: '-',
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      respV: '-',
      respR: '-',
      referencia1: '-',
      cita1: '-',
      titolLectura1: '-',
      lectura1: '-',
      citaResp1: '-',
      resp1Part1: '-',
      resp1Part2: '-',
      resp1Part3: '-',
      referencia2: '-',
      cita2: '-',
      titolLectura2: '-',
      lectura2: '-',
      versResp2: '-',
      resp2Part1: '-',
      resp2Part2: '-',
      resp2Part3: '-',
      referencia3: '-',
      cita3: '-',
      titolLectura3: '-',
      lectura3: '-',
      versResp3: '-',
      resp3Part1: '-',
      resp3Part2: '-',
      resp3Part3: '-',
      referencia4: '-',
      cita4: '-',
      titolLectura4: '-',
      lectura4: '-',
      versResp4: '-',
      resp4Part1: '-',
      resp4Part2: '-',
      resp4Part3: '-',
      himneOhDeu: '-',
      himneOhDeuBool: '-',
      oracio: '-',
      oracio1: '-',
      oracio2: '-',
      oracio3: '-',
    }

    LAUDES = { //31
      diumPasqua: false,
      invitatori: '-',
      antInvitatori: '-',
      salm94: '-',
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      calAntEspecial: '-',
      antEspecialLaudes: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      cantic: '-',
      antCantic: '-',
      pregaries: '-',
      oracio: '-',
    }

    TERCIA = { //24
      diumPasqua: false,
      himne: '-',
      antifones: '-',
      ant: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      respV: '-',
      respR: '-',
      oracio: '-',
    }

    SEXTA = { //24
      diumPasqua: false,
      himne: '-',
      antifones: '-',
      ant: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      respV: '-',
      respR: '-',
      oracio: '-',
    }

    NONA = { //24
      diumPasqua: false,
      himne: '-',
      antifones: '-',
      ant: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      respV: '-',
      respR: '-',
      oracio: '-',
    }

    VESPRES1 = { //28
      diumPasqua: false,
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      calAntEspecial: '-',
      antEspecialVespres: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      cantic: '-',
      antCantic: '-',
      pregaries: '-',
      oracio: '-',
    }

    VESPRES = { //28
      diumPasqua: false,
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      calAntEspecial: '-',
      antEspecialVespres: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      cantic: '-',
      antCantic: '-',
      pregaries: '-',
      oracio: '-',
    }

    COMPLETES = { //24
      himneLlati: '-',
      himneCat: '-',
      antifones: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      vers: '-',
      lecturaBreu: '-',
      antRespEspecial: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      respV: '-',
      respR: '-',
      antCantic: '-',
      cantic: '-',
      oracio: '-',
      antMare: '-',
    }

    CEL = {
      INFO_CEL: INFO_CEL,
      OFICI: OFICI,
      LAUDES: LAUDES,
      HORA_MENOR: {
        TERCIA: TERCIA,
        SEXTA: SEXTA,
        NONA: NONA,
      },
      VESPRES: VESPRES,
      VESPRES1: VESPRES1,
      COMPLETES: COMPLETES,
    }
  }
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import GlobalKeys from "../../Utils/GlobalKeys";
import * as DatabaseDataService from '../DatabaseDataService';
import OfficeCommonPsalter from "../../Models/LiturgyMasters/OfficeCommonPsalter";
import LiturgyMastersKeys from "../../Models/LiturgyMasters/LiturgyMastersKeys";
import SecureCall from "../../Utils/SecureCall";
import InvitatoryCommonPsalter from "../../Models/LiturgyMasters/InvitatoryCommonPsalter";

export async function ObtainLiturgyMasters(globalData) : Promise<LiturgyMasters>{
    const liturgyMasters = new LiturgyMasters();
    liturgyMasters.OfficeCommonPsalter = await ObtainOfficeCommonPsalter(globalData);
    liturgyMasters.InvitatoryCommonPsalter = await ObtainInvitatoryCommonPsalter(globalData);
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

//tempsQuaresmaComuFV
async function ObtainCommonFVOfLentTime(globalData) : Promise<> {
    return await SecureCall(async () => {
        if (globalData.LT === GlobalKeys.Q_CENDRA || globalData.LT === GlobalKeys.Q_SETMANES) {
            const id = parseInt(globalData.setmana);
            const row = await DatabaseDataService.ObtainMasterRowFromDatabase(LiturgyMastersKeys.PrayersOfOrdinaryTime, id);
            return new PrayersOfOrdinaryTime(row);
        }
    });
}

/*

  //taula 5 (#11): Ofici(5), Laudes(3), Vespres(2), HoraMenor(2)
  if (GlobalData.LT === GLOBAL.Q_CENDRA || GlobalData.LT === GLOBAL.Q_SETMANES) {
    c += 1;
    id = 1;
    DatabaseDataService.getLiturgia("tempsQuaresmaComuFV", id, (result) => {
      queryRows.tempsQuaresmaComuFV = result;
      dataReceived(params);
    });
  }

  //taula 6 (#12): Ofici(6), Laudes(4), Vespres(3), HoraMenor(3)
  if (GlobalData.LT === GLOBAL.Q_CENDRA) {
    c += 1;
    id = GlobalData.date.getDay() - 2; //dimecres = 1, dijous = 2, ...
    DatabaseDataService.getLiturgia("tempsQuaresmaCendra", id, (result) => {
      queryRows.tempsQuaresmaCendra = result;
      dataReceived(params);
    });
  }

  //taula 7 (#14): Ofici(7), Laudes(5), Vespres(4), HoraMenor(4)
  if (GlobalData.LT === GLOBAL.Q_SETMANES) {
    c += 1;
    id = (parseInt(GlobalData.setmana) - 1) * 7 + (GlobalData.date.getDay() + 1);
    DatabaseDataService.getLiturgia("tempsQuaresmaVSetmanes", id, (result) => {
      queryRows.tempsQuaresmaVSetmanes = result;
      dataReceived(params);
    });
  }

  //taula 8 (#15): Ofici(8), Laudes(6), Vespres(5), HoraMenor(5)
  if (GlobalData.LT === GLOBAL.Q_DIUM_RAMS || tomorrowCal === 'DR' || GlobalData.LT === GLOBAL.Q_SET_SANTA) {
    c += 1;
    id = 1;
    DatabaseDataService.getLiturgia("tempsQuaresmaComuSS", id, (result) => {
      queryRows.tempsQuaresmaComuSS = result;
      dataReceived(params);
    });
  }

  //taula 9 (#16): Ofici(9), Laudes(7), Vespres(6), HoraMenor(6)
  if (GlobalData.LT === GLOBAL.Q_DIUM_RAMS || tomorrowCal === 'DR') {
    c += 1;
    id = 1;
    DatabaseDataService.getLiturgia("tempsQuaresmaRams", id, (result) => {
      queryRows.tempsQuaresmaRams = result; dataReceived(params);
    });
  }

  //taula 10 (#17): Ofici(10), Laudes(8), Vespres(7), HoraMenor(7)
  if (GlobalData.LT === GLOBAL.Q_SET_SANTA) {
    c += 1;
    id = GlobalData.date.getDay(); //dilluns = 1, dimarts = 2, dimecres = 3 i dijous = 4
    DatabaseDataService.getLiturgia("tempsQuaresmaSetSanta", id, (result) => {
      queryRows.tempsQuaresmaSetSanta = result;
      dataReceived(params);
    });
  }

  //taula 11 (#18): Ofici(11), Laudes(9), Vespres(8), HoraMenor(8)
  if (tomorrowCal === 'T' || GlobalData.LT === GLOBAL.Q_TRIDU) {
    c += 1;
    id = GlobalData.date.getDay() - 3; //dijous = 1, divendres = 2 i dissabte = 3
    DatabaseDataService.getLiturgia("tempsQuaresmaTridu", id, (result) => {
      queryRows.tempsQuaresmaTridu = result;
      dataReceived(params);
    });
  }

  //taula 12 (#20): Ofici(12), Laudes(10), Vespres(9), HoraMenor(9)
  if (GlobalData.LT === GLOBAL.P_OCTAVA || GlobalData.LT === GLOBAL.P_SETMANES) {
    c += 1;
    id = 1;
    DatabaseDataService.getLiturgia("tempsPasquaAA", id, (result) => {
      queryRows.tempsPasquaAA = result;
      dataReceived(params);
    });
  }

  //taula 13 (#21): Ofici(13), Laudes(11), Vespres(10), HoraMenor(10)
  if (GlobalData.LT === GLOBAL.P_OCTAVA) {
    c += 1;
    { GlobalData.date.getDay() === 0 ? weekDayNormal = 7 : weekDayNormal = GlobalData.date.getDay() }
    id = weekDayNormal;
    DatabaseDataService.getLiturgia("tempsPasquaOct", id, (result) => {
      queryRows.tempsPasquaOct = result;
      dataReceived(params);
    });
  }

  //taula 14 (#22): Ofici(14), Laudes(12), Vespres(11), HoraMenor(11)
  if (GlobalData.LT === GLOBAL.P_SETMANES) {
    c += 1;
    id = 1;
    DatabaseDataService.getLiturgia("tempsPasquaDA", id, (result) => {
      queryRows.tempsPasquaDA = result;
      dataReceived(params);
    });
  }

  //taula 15 (#23): Ofici(15), Laudes(13), Vespres(12), HoraMenor(12)
  if (GlobalData.LT === GLOBAL.P_SETMANES) {
    c += 1;
    id = (parseInt(GlobalData.setmana) - 2) * 7 + (GlobalData.date.getDay() + 1);
    if (id === 43) //diumenge de pentacosta (no està dins tempsPasquaSetmanes). Apaño perquè no peti
      id = 1;

    DatabaseDataService.getLiturgia("tempsPasquaSetmanes", id, (result) => {
      queryRows.tempsPasquaSetmanes = result;
      dataReceived(params);
    });
  }

  //taula 16 (#25): Ofici(16), Laudes(14), Vespres(13), HoraMenor(13)
  if (GlobalData.LT === GLOBAL.A_SETMANES || GlobalData.LT === GLOBAL.A_FERIES ||
    GlobalData.LT === GLOBAL.N_OCTAVA || GlobalData.LT === GLOBAL.N_ABANS ||
    tomorrowCal === 'A') {
    c += 1;
    switch (GlobalData.LT) {
      case GLOBAL.A_SETMANES:
        id = 1;
        break;
      case GLOBAL.A_FERIES:
        id = 2;
        break;
      case GLOBAL.N_OCTAVA:
        id = 3;
        break;
      case GLOBAL.N_ABANS:
        if (GlobalData.date.getDate() < 6) { id = 3; }
        else { id = 4; }
        break;
      default: id = 1;
    }
    DatabaseDataService.getLiturgia("tempsAdventNadalComu", id, (result) => {
      queryRows.tempsAdventNadalComu = result;
      dataReceived(params);
    });
  }

  //taula 17 (#26): Ofici(17), Laudes(15), Vespres(14), HoraMenor(14)
  if (GlobalData.LT === GLOBAL.A_SETMANES || tomorrowCal === 'A') {
    c += 1;
    //Week begins with saturday
    auxCicle = GlobalData.cicle;
    if (tomorrowCal === 'A') {
      auxCicle = 1;
      auxDay = 1;
    }
    if (GlobalData.LT === GLOBAL.O_ORDINARI && GlobalData.dataTomorrow.LT === GLOBAL.A_SETMANES) id = 1;
    else id = (parseInt(auxCicle) - 1) * 7 + GlobalData.date.getDay() + 2;
    DatabaseDataService.getLiturgia("tempsAdventSetmanes", id, (result) => {
      queryRows.tempsAdventSetmanes = result;
      dataReceived(params);
    });
  }

  //taula 18.1 (#27): Ofici(18), Laudes(16), Vespres(15), HoraMenor(15)
  if (GlobalData.LT === GLOBAL.A_SETMANES || GlobalData.LT === GLOBAL.A_FERIES) {
    c += 1;
    id = parseInt(GlobalData.cicle);
    DatabaseDataService.getLiturgia("tempsAdventSetmanesDium", id, (result) => {
      queryRows.tempsAdventSetmanesDium = result;
      dataReceived(params);
    });
  }

  //taula 18.2 (#27): Ofici(18), Laudes(16), Vespres(15), HoraMenor(15)
  if (GlobalData.LT === GLOBAL.A_SETMANES || GlobalData.LT === GLOBAL.A_FERIES || tomorrowCal === 'A') {
    c += 1;
    id = parseInt(GlobalData.cicle) + 1;
    if (tomorrowCal === 'A') id = 1;
    DatabaseDataService.getLiturgia("tempsAdventSetmanesDium", id, (result) => {
      queryRows.tempsAdventSetmanesDiumVespres1 = result;
      dataReceived(params);
    });
  }

  //taula 19 (#28): Ofici(19), Laudes(17), Vespres(16), HoraMenor(16)
  if (GlobalData.LT === GLOBAL.A_FERIES) {
    c += 1;
    id = GlobalData.date.getDate() - 16;
    DatabaseDataService.getLiturgia("tempsAdventFeries", id, (result) => {
      queryRows.tempsAdventFeries = result;
      dataReceived(params);
    });

    if (auxDay !== 0) {
      //special antifonas
      c += 1;
      DatabaseDataService.getLiturgia("tempsAdventFeriesAnt", GlobalData.date.getDay(), (result) => {
        queryRows.tempsAdventFeriesAnt = result;
        dataReceived(params);
      });
    }
  }

  //taula 20 (#29): Ofici(20), Laudes(18), Vespres(17), HoraMenor(17)
  if (GlobalData.LT === GLOBAL.N_OCTAVA && GlobalData.date.getDate() !== 25) {
    c += 1;
    id = GlobalData.date.getDate() - 25;
    if (GlobalData.date.getDate() === 1) id = 1; //poso 1 per posar algo, no importa. No llegirà res
    DatabaseDataService.getLiturgia("tempsNadalOctava", id, (result) => {
      queryRows.tempsNadalOctava = result;
      dataReceived(params);
    });
  }

  //taula 21 (#30): Ofici(21), Laudes(19), Vespres(18), HoraMenor(18)
  if (GlobalData.LT === GLOBAL.N_ABANS) {
    c += 1;
    { GlobalData.date.getDate() < 6 ? id = GlobalData.date.getDate() - 1 : id = GlobalData.date.getDate() - 2 }
    DatabaseDataService.getLiturgia("tempsNadalAbansEpifania", id, (result) => {
      queryRows.tempsNadalAbansEpifania = result;
      dataReceived(params);
    });
  }

  //taula 22 (#7): Ofici(22)
  if (GlobalData.LT === GLOBAL.P_SETMANES) {
    c += 1;
    id = 1;
    DatabaseDataService.getLiturgia("salteriComuEspPasquaDium", id, (result) => {
      queryRows.salteriComuEspPasquaDium = result;
      dataReceived(params);
    });
  }

  //taula 23 (#?): Ofici(23), Laudes(20), Vespres(19), HoraMenor(19), Completes(1)
  if (true) {
    c += 1;
    id = -1;
    DatabaseDataService.getLiturgia("diversos", id, (result) => {
      queryRows.diversos = result;
      dataReceived(params);
    });
  }

  //taula 24 (#3): Laudes(21)
  if (GlobalData.LT !== GLOBAL.Q_TRIDU && GlobalData.LT !== GLOBAL.P_OCTAVA) {
    c += 1;
    cicleAux = parseInt(GlobalData.cicle);
    auxDay = GlobalData.date.getDay();
    if (params.idTSF !== -1 || GlobalData.celType === 'S' || GlobalData.celType === 'F' ||
      (GlobalData.date.getMonth() === 11 && (GlobalData.date.getDate() === 29 || GlobalData.date.getDate() === 30 || GlobalData.date.getDate() === 31)) ||
      (GlobalData.date.getMonth() === 0 && GlobalData.date.getDate() === 6)) {
      cicleAux = 1;
      auxDay = 0;
    }
    else if (params.idTSF === 2) cicleAux = 2;
    idLaudes = (cicleAux - 1) * 7 + (auxDay + 1);
    DatabaseDataService.getLiturgia("salteriComuLaudes", idLaudes, (result) => {
      queryRows.salteriComuLaudes = result;
      dataReceived(params);
    });
  }

  //taula 25 (#8): Laudes(22), Vespres(20)
  if (GlobalData.LT === GLOBAL.P_SETMANES) {
    c += 1;
    idLaudes = (parseInt(GlobalData.cicle) - 1) * 6 + (GlobalData.date.getDay());
    DatabaseDataService.getLiturgia("salteriComuEspPasqua", idLaudes, (result) => {
      queryRows.salteriComuEspPasqua = result;
      dataReceived(params);
    });
  }

  //taula 26.1 (#24): Laudes(23), Vespres(21)
  if (GlobalData.LT === GLOBAL.P_SETMANES) {
    c += 1;
    id = parseInt(GlobalData.setmana) - 1;
    if (id === 7) //diumenge de pentacosta. Apaño perquè no peti
      id = 6;
    DatabaseDataService.getLiturgia("tempsPasquaSetmanesDium", id, (result) => {
      queryRows.tempsPasquaSetmanesDium = result;
      dataReceived(params);
    });
  }

  //taula 26.2 (#24): Laudes(23), Vespres(21)
  if (GlobalData.LT === GLOBAL.P_SETMANES) {
    c += 1;
    id = parseInt(GlobalData.setmana);
    if (id === 7 || id === 8) //diumenge de pentacosta. Apaño perquè no peti
      id = 6;
    DatabaseDataService.getLiturgia("tempsPasquaSetmanesDium", id, (result) => {
      queryRows.tempsPasquaSetmanesDiumVespres1 = result;
      dataReceived(params);
    });
  }

  //taula 27 (#19): Laudes(24), Vespres(22)
  if (GlobalData.LT === GLOBAL.P_OCTAVA || GlobalData.LT === GLOBAL.Q_DIUM_PASQUA) {
    c += 1;
    id = 1;
    DatabaseDataService.getLiturgia("tempsQuaresmaDiumPasq", id, (result) => {
      queryRows.tempsQuaresmaDiumPasq = result;
      dataReceived(params);
    });
  }

  //taula 28.1 (#13): Laudes(26), Vespres(23)
  if (GlobalData.LT === GLOBAL.Q_SETMANES) {
    c += 1;
    id = parseInt(GlobalData.setmana);
    DatabaseDataService.getLiturgia("tempsQuaresmaVSetmanesDium", id, (result) => {
      queryRows.tempsQuaresmaVSetmanesDium = result;
      dataReceived(params);
    });
  }

  //taula 28.2 (#13): Laudes(26), Vespres(23)
  if (GlobalData.LT === GLOBAL.Q_SETMANES || GlobalData.LT === GLOBAL.Q_CENDRA) {
    c += 1;
    if (GlobalData.LT === GLOBAL.Q_CENDRA) id = 1;
    else id = parseInt(GlobalData.setmana) + 1;
    DatabaseDataService.getLiturgia("tempsQuaresmaVSetmanesDium", id, (result) => {
      queryRows.tempsQuaresmaVSetmanesDiumVespres1 = result;
      dataReceived(params);
    });
  }

  //taula 29 (#5): Vespres(24)
  if (GlobalData.LT !== GLOBAL.Q_TRIDU && GlobalData.LT !== GLOBAL.P_OCTAVA) {
    c += 1;
    { GlobalData.date.getDay() === 6 ? weekDayNormalVESPRES = 1 : weekDayNormalVESPRES = GlobalData.date.getDay() + 2 }
    let cicle = parseInt(GlobalData.cicle);
    if (GlobalData.date.getDay() === 6) {
      { cicle === 4 ? cicle = 1 : cicle += 1 }
    }
    if (tomorrowCal === 'A') cicle = 1;
    id = (cicle - 1) * 7 + weekDayNormalVESPRES;
    DatabaseDataService.getLiturgia("salteriComuVespres", id, (result) => {
      queryRows.salteriComuVespres = result;
      dataReceived(params);
    });
  }

  //taula 30.1 (#31): -
  if (params.idTSF !== -1 || GlobalData.LT === GLOBAL.Q_TRIDU || GlobalData.LT === GLOBAL.N_OCTAVA) {
    c += 1;
    if (params.idTSF === -1 && GlobalData.LT === GLOBAL.N_OCTAVA) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal; //Només necessito Nadal (1) per N_OCTAVA
    }
    else {
      id = params.idTSF;
    }
    DatabaseDataService.getLiturgia("tempsSolemnitatsFestes", id, (result) => {
      queryRows.tempsSolemnitatsFestes = result;
      dataReceived(params);
    });
  }

  //taula 30.2 (#31): -
  if (tomorrowCal === 'TSF' || params.idTSF !== -1 || GlobalData.LT === GLOBAL.Q_TRIDU || GlobalData.LT === GLOBAL.N_OCTAVA) {
    c += 1;
    if (params.idTSF === -1 && GlobalData.LT === GLOBAL.N_OCTAVA) {
      id = SoulKeys.tempsSolemnitatsFestes_Nadal; //Només necessito Nadal (1) per N_OCTAVA
    }
    else {
      id = params.idTSF;
    }
    if (tomorrowCal === 'TSF') {
      id = idTSFTomorrow;
    }
    DatabaseDataService.getLiturgia("tempsSolemnitatsFestes", id, (result) => {
      queryRows.tempsSolemnitatsFestesVespres1 = result;
      dataReceived(params);
    });
  }

  //taula 31 (#4): HoraMenor(20)
  if (GlobalData.LT !== GLOBAL.Q_TRIDU && GlobalData.LT !== GLOBAL.P_OCTAVA) {
    c += 1;
    id = (parseInt(GlobalData.cicle) - 1) * 7 + (GlobalData.date.getDay() + 1);
    DatabaseDataService.getLiturgia("salteriComuHora", id, (result) => {
      queryRows.salteriComuHora = result;
      dataReceived(params);
    });
  }

  //taula 32 (#6): Completes(2)
  if (true) {
    c += 1;
    { GlobalData.date.getDay() === 6 ? id = 1 : id = GlobalData.date.getDay() + 2 }
    if ((GlobalData.dataTomorrow.LT === GLOBAL.Q_DIUM_PASQUA || tomorrowCal === 'TSF' || tomorrowCal === 'S') && !(GlobalData.date.getDay() === 6 || GlobalData.date.getDay() === 0)) id = 8;
    if ((GlobalData.celType === 'S' || idTSF !== -1) && !(GlobalData.date.getDay() === 6 || GlobalData.date.getDay() === 0)) id = 9;
    if (GlobalData.LT === GLOBAL.P_OCTAVA) id = 2;
    if (GlobalData.LT === GLOBAL.N_OCTAVA) id = 9;
    if (GlobalData.LT === GLOBAL.Q_SET_SANTA && (GlobalData.date.getDay() === 4 || GlobalData.date.getDay() === 5 || GlobalData.date.getDay() === 6)) id = 9;
    if (GlobalData.LT === GLOBAL.Q_TRIDU) id = 9;
    DatabaseDataService.getLiturgia("salteriComuCompletes", id, (result) => {
      queryRows.salteriComuCompletes = result;
      dataReceived(params);
    });
  }

  //taula 33 (#??): Ofici(24)
  if (idTF !== -1) {
    c += 1;
    id = idTF;
    DatabaseDataService.getLiturgia("salteriComuOficiTF", id, (result) => {
      queryRows.salteriComuOficiTF = result;
      queryRows.salteriComuOficiTF.com2 = '-';
      queryRows.salteriComuOficiTF.com3 = '-';
      dataReceived(params);
    });
  }
  else {
    queryRows.salteriComuOficiTF = '';
  }

  //taula 34.1 (#32): - i //taula 36 (today)
  if (GlobalData.LT !== GLOBAL.Q_DIUM_PASQUA && (((params.idTSF === -1 && params.idDE === -1) && (GlobalData.celType === 'S' || GlobalData.celType === 'F')))) {

    c += 1;

    idDM = diesMov(GlobalData.date, GlobalData.LT, GlobalData.setmana, GlobalData.pentacosta, GlobalData.celType);
    if (idDM === -1) {
      let day = GF.calculeDia(GlobalData.date, GlobalData.diocesi, GlobalData.diaMogut, GlobalData.diocesiMogut);
      DatabaseDataService.getSolMem("santsSolemnitats", day, GlobalData.diocesi, GlobalData.lloc, GlobalData.diocesiName, GlobalData.tempsespecific, (result) => {
        queryRows.santsSolemnitats = result;
        getOficisComuns(params, result, false);
      });
    }
    else {
      DatabaseDataService.getSolMemDiesMov("santsSolemnitats", idDM, (result) => {
        queryRows.santsSolemnitats = result;
        getOficisComuns(params, result, false);
      });
    }
  }

  //taula 34.2 (#32): - i //taula 36 (tomorrow!)
  if (tomorrowCal === 'S') {
    c += 1;
    idDM = diesMov(GlobalData.dataTomorrow.date, GlobalData.dataTomorrow.LT, GlobalData.dataTomorrow.setmana, GlobalData.pentacosta, GlobalData.dataTomorrow.celType);
    if (idDM !== -1) {
      params.vespres1 = true;
      DatabaseDataService.getSolMemDiesMov("santsSolemnitats", idDM, (result) => {
        queryRows.santsSolemnitatsFVespres1 = result;
        getOficisComuns(params, result, true);
      });
    }
    else {
      let day = '-';
      if (GlobalData.dataTomorrow.diaMogut !== '-' && GF.isDiocesiMogut(GlobalData.diocesi, GlobalData.dataTomorrow.diocesiMogut)) {
        day = GlobalData.dataTomorrow.diaMogut;
      }

      if (day === '-') {
        let tomorrowDay = new Date(GlobalData.date.getFullYear(), GlobalData.date.getMonth(), (GlobalData.date.getDate() + 1));
        day = GF.calculeDia(tomorrowDay, GlobalData.diocesi, '-', '-');
      }
      params.vespres1 = true;
      DatabaseDataService.getSolMem("santsSolemnitats", day, GlobalData.diocesi, GlobalData.lloc, GlobalData.diocesiName, GlobalData.tempsespecific, (result) => {
        queryRows.santsSolemnitatsFVespres1 = result;
        getOficisComuns(params, result, true);
      });
    }
  }

  //taula 35 (#31): -  i //taula 36
  if (params.idTSF === -1 && (GlobalData.celType === 'M' || GlobalData.celType === 'L' || GlobalData.celType === 'V')) {
    c += 1;

    idDM = diesMov(GlobalData.date, GlobalData.LT, GlobalData.setmana, GlobalData.pentacosta, GlobalData.celType);

    if (GlobalData.celType === 'V' && idDM === -1) {
      DatabaseDataService.getV((result) => {
        queryRows.santsMemories = result;
        getOficisComuns(params, result, false);
      });
    }
    else {
      if (idDM === -1) {
        const day = GF.calculeDia(GlobalData.date, GlobalData.diocesi, GlobalData.diaMogut, GlobalData.diocesiMogut);
        DatabaseDataService.getSolMem("santsMemories", day, GlobalData.diocesi, GlobalData.lloc, GlobalData.diocesiName, GlobalData.tempsespecific, (result) => {
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

  //taula 37 (#?): -
  if (tomorrowCal === 'DE' || params.idDE !== -1) {
    c += 1;
    id = params.idDE;
    if (tomorrowCal === 'DE') id = idDETomorrow;
    DatabaseDataService.getLiturgia("diesespecials", id, (result) => {
      queryRows.diesespecials = result;
      dataReceived(params);
    });
  }

  count = c; //number of queryies
 */
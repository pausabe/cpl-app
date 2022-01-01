import { Platform } from 'react-native';

import GLOBAL from '../../../Globals/Globals';
import GF from '../../../Globals/GlobalFunctions';

export default class VespresSoul {
  constructor(TABLES, CEL, Set_Soul_CB, SOUL) {
    this.makePrayer(TABLES, CEL, Set_Soul_CB, SOUL)
  }

  makePrayer(TABLES, CEL, Set_Soul_CB, SOUL){
    var llati = G_VALUES.llati;
    var date = G_VALUES.date;
    var diocesiName = G_VALUES.diocesiName;
      this.state = {
        salteriComuVespres: TABLES.salteriComuVespres,
        tempsOrdinariOracions: TABLES.tempsOrdinariOracions,
        tempsOrdinariOracionsVespres1: TABLES.tempsOrdinariOracionsVespres1,
        tempsQuaresmaComuFV: TABLES.tempsQuaresmaComuFV,
        tempsQuaresmaCendra: TABLES.tempsQuaresmaCendra,
        tempsQuaresmaVSetmanes: TABLES.tempsQuaresmaVSetmanes,
        tempsQuaresmaVSetmanesDium: TABLES.tempsQuaresmaVSetmanesDium,
        tempsQuaresmaVSetmanesDiumVespres1: TABLES.tempsQuaresmaVSetmanesDiumVespres1,
        tempsQuaresmaComuSS: TABLES.tempsQuaresmaComuSS,
        tempsQuaresmaRams: TABLES.tempsQuaresmaRams,
        tempsQuaresmaSetSanta: TABLES.tempsQuaresmaSetSanta,
        tempsQuaresmaTridu: TABLES.tempsQuaresmaTridu,
        tempsQuaresmaDiumPasq: TABLES.tempsQuaresmaDiumPasq,
        tempsPasquaAA: TABLES.tempsPasquaAA,
        tempsPasquaOct: TABLES.tempsPasquaOct,
        tempsPasquaDA: TABLES.tempsPasquaDA,
        tempsPasquaSetmanes: TABLES.tempsPasquaSetmanes,
        tempsPasquaSetmanesDium: TABLES.tempsPasquaSetmanesDium,
        tempsAdventNadalComu: TABLES.tempsAdventNadalComu,
        tempsAdventSetmanes: TABLES.tempsAdventSetmanes,
        tempsAdventSetmanesDium: TABLES.tempsAdventSetmanesDium,
        tempsAdventSetmanesDiumVespres1: TABLES.tempsAdventSetmanesDiumVespres1,
        tempsPasquaSetmanesDiumVespres1: TABLES.tempsPasquaSetmanesDiumVespres1,
        tempsAdventFeries: TABLES.tempsAdventFeries,
        tempsAdventFeriesAnt: TABLES.tempsAdventFeriesAnt,
        tempsNadalOctava: TABLES.tempsNadalOctava,
        tempsNadalAbansEpifania: TABLES.tempsNadalAbansEpifania,
        tempsSolemnitatsFestes: TABLES.tempsSolemnitatsFestes,
        salteriComuEspPasqua: TABLES.salteriComuEspPasqua,
        diversos: TABLES.diversos,
        magnificat: TABLES.diversos.item(5).oracio,
        diversos: TABLES.diversos,
        canticPere: TABLES.diversos.item(33).oracio,
      };

      this.VESPRES = { //27
        himne: '',
        ant1: '',
        titol1: '',
        com1: '',
        salm1: '',
        gloria1: '',
        ant2: '',
        titol2: '',
        com2: '',
        salm2: '',
        gloria2: '',
        ant3: '',
        titol3: '',
        com3: '',
        salm3: '',
        gloria3: '',
        vers: '',
        lecturaBreu: '',
        calAntEspecial: '',
        antEspecialVespres: '',
        respBreu1: '',
        respBreu2: '',
        respBreu3: '',
        cantic: '',
        antCantic: '',
        pregaries: '',
        oracio: '',
        papa: TABLES.diversos.item(38).oracio,
        bisbe: TABLES.diversos.item(GF.bisbeId(diocesiName)).oracio,
      }

    if(CEL.diumPasqua) {
      this.VESPRES = CEL;
      this.VESPRES.cantic = this.state.magnificat;
    }
    else{
      this.himne(G_VALUES.LT, date.getDay(), G_VALUES.setmana, CEL, llati, date);
      this.salmodia(G_VALUES.LT, G_VALUES.setmana, date.getDay(), CEL, date);
      this.lecturaBreu(G_VALUES.LT, CEL, date);
      this.responsori(G_VALUES.LT, CEL, date);
      this.cantic(G_VALUES.LT, date.getDay(), G_VALUES.ABC, CEL, date);
      this.pregaries(G_VALUES.LT, CEL, date);
      this.oracio(G_VALUES.LT, date.getDay(), CEL, date);
    }

    SOUL.setSoul(Set_Soul_CB, "vespres", this.VESPRES);
  }

  himne(LT, weekDay, setmana, CEL, llati, date){
    switch(LT){
      case GLOBAL.O_ORDINARI:
        if(llati === 'true'){
          himne = this.state.salteriComuVespres.himneLlati;
        }
        else{
          himne = this.state.salteriComuVespres.himneCat;
        }
        break;
      case GLOBAL.Q_CENDRA:
      case GLOBAL.Q_SETMANES:
        if(weekDay===0 || weekDay===6){ //vespres de diumenge
          if(llati === 'true'){
            himne = this.state.tempsQuaresmaComuFV.himneVespresLlatiDom;
          }
          else{
            himne = this.state.tempsQuaresmaComuFV.himneVespresCatDom;
          }
        }
        else{//ferial
          if(llati === 'true'){
            himne = this.state.tempsQuaresmaComuFV.himneVespresLlatiFer;
          }
          else{
            himne = this.state.tempsQuaresmaComuFV.himneVespresCatFer;
          }
        }
        break;
      case GLOBAL.Q_DIUM_RAMS:
      case GLOBAL.Q_SET_SANTA:
        if(llati === 'true'){
          himne = this.state.tempsQuaresmaComuSS.himneVespresLlati;
        }
        else{
          himne = this.state.tempsQuaresmaComuSS.himneVespresCat;
        }
        break;
      case GLOBAL.Q_TRIDU:
        if(llati === 'true'){
          himne = this.state.tempsQuaresmaTridu.himneDSOVespresllati;
        }
        else{
          himne = this.state.tempsQuaresmaTridu.himneDSOVespresCat;
        }
        break;
      case GLOBAL.P_OCTAVA:
        if(llati === 'true'){
          himne = this.state.tempsPasquaAA.himneVespresLlati1;
        }
        else{
          himne = this.state.tempsPasquaAA.himneVespresCat1;
        }
        break;
      case GLOBAL.P_SETMANES:
        if(setmana === '7'){
          if(llati === 'true'){
            himne = this.state.tempsPasquaDA.himneVespresLlati;
          }
          else{
            himne = this.state.tempsPasquaDA.himneVespresCat;
          }
        }
        else{
          if(weekDay === 6 || weekDay === 0){
            if(llati === 'true'){
              himne = this.state.tempsPasquaAA.himneVespresLlati1;
            }
            else{
              himne = this.state.tempsPasquaAA.himneVespresCat1;
            }
          }
          else{
            if(llati === 'true'){
              himne = this.state.tempsPasquaAA.himneVespresLlati2;
            }
            else{
              himne = this.state.tempsPasquaAA.himneVespresCat2;
            }
          }
        }
        break;
      case GLOBAL.A_SETMANES:
      case GLOBAL.A_FERIES:
      case GLOBAL.N_ABANS:
        if(LT != GLOBAL.N_ABANS || (LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13)){
          if(llati === 'true'){
            himne = this.state.tempsAdventNadalComu.himneVespresLlati;
          }
          else{
            himne = this.state.tempsAdventNadalComu.himneVespresCat;
          }
        }
        break;
      case GLOBAL.N_OCTAVA:
        if(llati === 'true'){
          himne = this.state.tempsSolemnitatsFestes.himneVespres2Llati;
        }
        else{
          himne = this.state.tempsSolemnitatsFestes.himneVespres2Cat;
        }
        break;
    }
    if(CEL.himne === '-')
      this.VESPRES.himne = himne;
    else this.VESPRES.himne = CEL.himne;
  }

  salmodia(LT, setmana, weekDay, CEL, date){
    switch(LT){
      case GLOBAL.O_ORDINARI:
      case GLOBAL.N_ABANS:
        if(LT != GLOBAL.N_ABANS || (LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13)){
          ant1 = this.state.salteriComuVespres.ant1;
          titol1 = this.state.salteriComuVespres.titol1;
          com1 = this.state.salteriComuVespres.com1;
          salm1 = this.state.salteriComuVespres.salm1;
          gloria1 = this.state.salteriComuVespres.gloria1;
          ant2 = this.state.salteriComuVespres.ant2;
          titol2 = this.state.salteriComuVespres.titol2;
          com2 = this.state.salteriComuVespres.com2;
          salm2 = this.state.salteriComuVespres.salm2;
          gloria2 = this.state.salteriComuVespres.gloria2;
          ant3 = this.state.salteriComuVespres.ant3;
          titol3 = this.state.salteriComuVespres.titol3;
          //com3 = this.state.salteriComuVespres.com3;
          salm3 = this.state.salteriComuVespres.salm3;
          gloria3 = this.state.salteriComuVespres.gloria3;
        }
        break;
      case GLOBAL.A_FERIES:
        ant1 = this.state.salteriComuVespres.ant1;
        titol1 = this.state.salteriComuVespres.titol1;
        com1 = this.state.salteriComuVespres.com1;
        salm1 = this.state.salteriComuVespres.salm1;
        gloria1 = this.state.salteriComuVespres.gloria1;
        ant2 = this.state.salteriComuVespres.ant2;
        titol2 = this.state.salteriComuVespres.titol2;
        com2 = this.state.salteriComuVespres.com2;
        salm2 = this.state.salteriComuVespres.salm2;
        gloria2 = this.state.salteriComuVespres.gloria2;
        ant3 = this.state.salteriComuVespres.ant3;
        titol3 = this.state.salteriComuVespres.titol3;
        com3 = this.state.salteriComuVespres.com3;
        salm3 = this.state.salteriComuVespres.salm3;
        gloria3 = this.state.salteriComuVespres.gloria3;

        if(weekDay !== 0){
          ant1 = this.state.tempsAdventFeriesAnt.ant1;
          ant2 = this.state.tempsAdventFeriesAnt.ant2;
          ant3 = this.state.tempsAdventFeriesAnt.ant3;
        }
        break;
        case GLOBAL.Q_SETMANES:
        case GLOBAL.Q_CENDRA:
          ant1 = this.state.salteriComuVespres.ant1;
          titol1 = this.state.salteriComuVespres.titol1;
          com1 = this.state.salteriComuVespres.com1;
          salm1 = this.state.salteriComuVespres.salm1;
          gloria1 = this.state.salteriComuVespres.gloria1;
          ant2 = this.state.salteriComuVespres.ant2;
          titol2 = this.state.salteriComuVespres.titol2;
          com2 = this.state.salteriComuVespres.com2;
          salm2 = this.state.salteriComuVespres.salm2;
          gloria2 = this.state.salteriComuVespres.gloria2;
          ant3 = this.state.salteriComuVespres.ant3;
          titol3 = this.state.salteriComuVespres.titol3;
          com3 = this.state.salteriComuVespres.com3;
          salm3 = this.state.salteriComuVespres.salm3;
          gloria3 = this.state.salteriComuVespres.gloria3;
          if(weekDay === 6 && this.state.tempsQuaresmaVSetmanesDiumVespres1){ //primeres vespres de diumenge
            ant1 = this.state.tempsQuaresmaVSetmanesDiumVespres1.ant1Vespres1;
            ant2 = this.state.tempsQuaresmaVSetmanesDiumVespres1.ant2Vespres1;
            ant3 = this.state.tempsQuaresmaVSetmanesDiumVespres1.ant3Vespres1;
          }
          else if(weekDay === 0){ //segones vespres de diumenge
            ant1 = this.state.tempsQuaresmaVSetmanesDium.ant1Vespres2;
            ant2 = this.state.tempsQuaresmaVSetmanesDium.ant2Vespres2;
            ant3 = this.state.tempsQuaresmaVSetmanesDium.ant3Vespres2;
          }
          break;
      case GLOBAL.Q_DIUM_RAMS:
        ant1 = this.state.salteriComuVespres.ant1;
        titol1 = this.state.salteriComuVespres.titol1;
        com1 = this.state.salteriComuVespres.com1;
        salm1 = this.state.salteriComuVespres.salm1;
        gloria1 = this.state.salteriComuVespres.gloria1;
        ant2 = this.state.salteriComuVespres.ant2;
        titol2 = this.state.salteriComuVespres.titol2;
        com2 = this.state.salteriComuVespres.com2;
        salm2 = this.state.salteriComuVespres.salm2;
        gloria2 = this.state.salteriComuVespres.gloria2;
        ant3 = this.state.salteriComuVespres.ant3;
        titol3 = this.state.salteriComuVespres.titol3;
        com3 = this.state.salteriComuVespres.com3;
        salm3 = this.state.salteriComuVespres.salm3;
        gloria3 = this.state.salteriComuVespres.gloria3;
        /*if(weekDay === 6){ //primeres vespres de diumenge
          ant1 = this.state.tempsQuaresmaRams.ant1Vespres1;
          ant2 = this.state.tempsQuaresmaRams.ant2Vespres1;
          ant3 = this.state.tempsQuaresmaRams.ant3Vespres1;
        }
        else */if(weekDay === 0){ //segones vespres de diumenge
          ant1 = this.state.tempsQuaresmaRams.ant1Vespres2;
          ant2 = this.state.tempsQuaresmaRams.ant2Vespres2;
          ant3 = this.state.tempsQuaresmaRams.ant3Vespres2;
        }
        break;
      case GLOBAL.Q_SET_SANTA:
        ant1 = this.state.salteriComuVespres.ant1;
        titol1 = this.state.salteriComuVespres.titol1;
        com1 = this.state.salteriComuVespres.com1;
        salm1 = this.state.salteriComuVespres.salm1;
        gloria1 = this.state.salteriComuVespres.gloria1;
        ant2 = this.state.salteriComuVespres.ant2;
        titol2 = this.state.salteriComuVespres.titol2;
        com2 = this.state.salteriComuVespres.com2;
        salm2 = this.state.salteriComuVespres.salm2;
        gloria2 = this.state.salteriComuVespres.gloria2;
        ant3 = this.state.salteriComuVespres.ant3;
        titol3 = this.state.salteriComuVespres.titol3;
        com3 = this.state.salteriComuVespres.com3;
        salm3 = this.state.salteriComuVespres.salm3;
        gloria3 = this.state.salteriComuVespres.gloria3;

        ant1 = this.state.tempsQuaresmaSetSanta.ant1Vespres;
        ant2 = this.state.tempsQuaresmaSetSanta.ant2Vespres;
        ant3 = this.state.tempsQuaresmaSetSanta.ant3Vespres;

      break;
      case GLOBAL.Q_TRIDU:
        ant1 = this.state.tempsQuaresmaTridu.ant1Vespres;
        titol1 = this.state.tempsQuaresmaTridu.titol1Vespres;
        com1 = "-";
        salm1 = this.state.tempsQuaresmaTridu.salm1Vespres;
        gloria1 = this.state.tempsQuaresmaTridu.gloriaVespres1;
        ant2 = this.state.tempsQuaresmaTridu.ant2Vespres;
        titol2 = this.state.tempsQuaresmaTridu.titol2Vespres;
        com2 = "-";
        salm2 = this.state.tempsQuaresmaTridu.salm2Vespres;
        gloria2 = this.state.tempsQuaresmaTridu.gloriaVespres2;
        ant3 = this.state.tempsQuaresmaTridu.ant3Vespres;
        titol3 = this.state.tempsQuaresmaTridu.titol3Vespres;
        com3 = "-";
        salm3 = this.state.tempsQuaresmaTridu.salm3Vespres;
        gloria3 = this.state.tempsQuaresmaTridu.gloriaVespres3;
        break;
      case GLOBAL.P_OCTAVA:
        ant1 = this.state.tempsQuaresmaDiumPasq.ant1Vespres;
        titol1 = this.state.tempsQuaresmaDiumPasq.titol1Vespres;
        com1 = "-";
        salm1 = this.state.tempsQuaresmaDiumPasq.text1Vespres;
        gloria1 = this.state.tempsQuaresmaDiumPasq.gloria1Vespres;
        ant2 = this.state.tempsQuaresmaDiumPasq.ant2Vespres;
        titol2 = this.state.tempsQuaresmaDiumPasq.titol2Vespres;
        com2 = "-";
        salm2 = this.state.tempsQuaresmaDiumPasq.text2Vespres;
        gloria2 = this.state.tempsQuaresmaDiumPasq.gloria2Vespres;
        ant3 = this.state.tempsQuaresmaDiumPasq.ant3Vespres;
        titol3 = this.state.tempsQuaresmaDiumPasq.titol3Vespres;
        com3 = "-";
        salm3 = this.state.tempsQuaresmaDiumPasq.text3Vespres;
        gloria3 = this.state.tempsQuaresmaDiumPasq.gloria3Vespres;
        break;
      case GLOBAL.P_SETMANES:
        titol1 = this.state.salteriComuVespres.titol1;
        com1 = this.state.salteriComuVespres.com1;
        salm1 = this.state.salteriComuVespres.salm1;
        gloria1 = this.state.salteriComuVespres.gloria1;
        titol2 = this.state.salteriComuVespres.titol2;
        com2 = this.state.salteriComuVespres.com2;
        salm2 = this.state.salteriComuVespres.salm2;
        gloria2 = this.state.salteriComuVespres.gloria2;
        titol3 = this.state.salteriComuVespres.titol3;
        com3 = this.state.salteriComuVespres.com3;
        salm3 = this.state.salteriComuVespres.salm3;
        gloria3 = this.state.salteriComuVespres.gloria3;

        if(weekDay === 6 && this.state.tempsPasquaSetmanesDiumVespres1){ //primeres vespres de diumenge
          ant1 = this.state.tempsPasquaSetmanesDiumVespres1.ant1Vespres1;
          ant2 = this.state.tempsPasquaSetmanesDiumVespres1.ant2Vespres1;
          ant3 = this.state.tempsPasquaSetmanesDiumVespres1.ant3Vespres1;
        }
        else if(weekDay === 0){ //segones vespres de diumenge
          ant1 = this.state.tempsPasquaSetmanesDium.ant1Vespres2;
          ant2 = this.state.tempsPasquaSetmanesDium.ant2Vespres2;
          ant3 = this.state.tempsPasquaSetmanesDium.ant3Vespres2;
        }
        else{ //feria, normal
          ant1 = this.state.salteriComuEspPasqua.ant1Vespres;
          ant2 = this.state.salteriComuEspPasqua.ant2Vespres;
          ant3 = this.state.salteriComuEspPasqua.ant3Vespres;
        }
        break;
      case GLOBAL.A_SETMANES:
        ant1 = this.state.salteriComuVespres.ant1;
        titol1 = this.state.salteriComuVespres.titol1;
        com1 = this.state.salteriComuVespres.com1;
        salm1 = this.state.salteriComuVespres.salm1;
        gloria1 = this.state.salteriComuVespres.gloria1;
        ant2 = this.state.salteriComuVespres.ant2;
        titol2 = this.state.salteriComuVespres.titol2;
        com2 = this.state.salteriComuVespres.com2;
        salm2 = this.state.salteriComuVespres.salm2;
        gloria2 = this.state.salteriComuVespres.gloria2;
        ant3 = this.state.salteriComuVespres.ant3;
        titol3 = this.state.salteriComuVespres.titol3;
        com3 = this.state.salteriComuVespres.com3;
        salm3 = this.state.salteriComuVespres.salm3;
        gloria3 = this.state.salteriComuVespres.gloria3;
        if(weekDay === 6 && this.state.tempsAdventSetmanesDiumVespres1){ //primeres vespres de diumenge
          ant1 = this.state.tempsAdventSetmanesDiumVespres1.ant1Vespres;
          ant2 = this.state.tempsAdventSetmanesDiumVespres1.ant2Vespres;
          ant3 = this.state.tempsAdventSetmanesDiumVespres1.ant3Vespres;
        }
        else if(weekDay === 0){ //segones vespres de diumenge
          ant1 = this.state.tempsAdventSetmanesDium.ant1Vespres2;
          ant2 = this.state.tempsAdventSetmanesDium.ant2Vespres2;
          ant3 = this.state.tempsAdventSetmanesDium.ant3Vespres2;
        }
        break;
      case GLOBAL.N_OCTAVA:
        ant1 = this.state.tempsSolemnitatsFestes.ant1Vespres2;
        titol1 = this.state.tempsSolemnitatsFestes.titol1Vespres2;
        com1 = "-";
        salm1 = this.state.tempsSolemnitatsFestes.text1Vespres2;
        gloria1 = "1";
        ant2 = this.state.tempsSolemnitatsFestes.ant2Vespres2;
        titol2 = this.state.tempsSolemnitatsFestes.titol2Vespres2;
        com2 = "-";
        salm2 = this.state.tempsSolemnitatsFestes.text2Vespres2;
        gloria2 = "1";
        ant3 = this.state.tempsSolemnitatsFestes.ant3Vespres2;
        titol3 = this.state.tempsSolemnitatsFestes.titol3Vespres2;
        com3 = "-";
        salm3 = this.state.tempsSolemnitatsFestes.text3Vespres2;
        gloria3 = "1";
        break;
    }

    if(weekDay === 0 && (LT === GLOBAL.Q_SET_SANTA || LT === GLOBAL.Q_SETMANES ||
        LT === GLOBAL.Q_DIUM_RAMS)){
          titol3 = "Càntic 1Pe 2, 21-24\nLa passió voluntària del Crist, el servent de Déu";
          com3 = '-';
          salm3 = this.state.canticPere;
          gloria3 = "1";
    }

    if(CEL.ant1 === '-')
      this.VESPRES.ant1 = ant1;
    else this.VESPRES.ant1 = CEL.ant1;
    if(CEL.ant2 === '-')
      this.VESPRES.ant2 = ant2;
    else this.VESPRES.ant2 = CEL.ant2;
    if(CEL.ant3 === '-')
      this.VESPRES.ant3 = ant3;
    else this.VESPRES.ant3 = CEL.ant3;

    if(CEL.titol1 === '-'){
      this.VESPRES.titol1 = titol1;
      this.VESPRES.com1 = com1;
      this.VESPRES.salm1 = salm1;
      this.VESPRES.gloria1 = gloria1;
      this.VESPRES.titol2 = titol2;
      this.VESPRES.com2 = com2;
      this.VESPRES.salm2 = salm2;
      this.VESPRES.gloria2 = gloria2;
      this.VESPRES.titol3 = titol3;
      this.VESPRES.com3 = com3;
      this.VESPRES.salm3 = salm3;
      this.VESPRES.gloria3 = gloria3;
    }
    else{
      this.VESPRES.titol1 = CEL.titol1;
      this.VESPRES.com1 = '-';
      this.VESPRES.salm1 = CEL.salm1;
      this.VESPRES.gloria1 = CEL.gloria1;
      this.VESPRES.titol2 = CEL.titol2;
      this.VESPRES.com2 = '-';
      this.VESPRES.salm2 = CEL.salm2;
      this.VESPRES.gloria2 = CEL.gloria2;
      this.VESPRES.titol3 = CEL.titol3;
      this.VESPRES.com3 = '-';
      this.VESPRES.salm3 = CEL.salm3;
      this.VESPRES.gloria3 = CEL.gloria3;
    }
  }

  lecturaBreu(LT, CEL, date){
    switch(LT){
      case GLOBAL.O_ORDINARI:
        vers = this.state.salteriComuVespres.versetLB;
        lecturaBreu = this.state.salteriComuVespres.lecturaBreu;
        break;
      case GLOBAL.Q_CENDRA:
        vers = this.state.tempsQuaresmaCendra.citaLBVespres;
        lecturaBreu = this.state.tempsQuaresmaCendra.lecturaBreuVespres;
        break;
      case GLOBAL.Q_SETMANES:
        vers = this.state.tempsQuaresmaVSetmanes.citaLBVespres;
        lecturaBreu = this.state.tempsQuaresmaVSetmanes.lecturaBreuVespres;
        break;
      case GLOBAL.Q_DIUM_RAMS:
        /*if(weekDay === 6){ //Primeres vespres
          vers = this.state.tempsQuaresmaRams.citaLBVespres;
          lecturaBreu = this.state.tempsQuaresmaRams.lecturaBreuVespres;
        }
        else{ //Segones vespres*/
          vers = this.state.tempsQuaresmaRams.citaLBVespres2;
          lecturaBreu = this.state.tempsQuaresmaRams.lecturaBreuVespres2;
        //}
        break;
      case GLOBAL.Q_SET_SANTA:
        vers = this.state.tempsQuaresmaSetSanta.citaLBVespres;
        lecturaBreu = this.state.tempsQuaresmaSetSanta.lecturaBreuVespres;
        break;
      case GLOBAL.Q_TRIDU:
        vers = this.state.tempsQuaresmaTridu.citaLBVespres;
        lecturaBreu = this.state.tempsQuaresmaTridu.lecturaBreuVespres;
        break;
      case GLOBAL.P_OCTAVA:
        vers = this.state.tempsPasquaOct.citaLBVespres;
        lecturaBreu = this.state.tempsPasquaOct.lecturaBreuVespres;
        break;
      case GLOBAL.P_SETMANES:
        vers = this.state.tempsPasquaSetmanes.citaLBVespres;
        lecturaBreu = this.state.tempsPasquaSetmanes.lecturaBreuVespres;
        break;
      case GLOBAL.A_SETMANES:
        vers = this.state.tempsAdventSetmanes.citaLBVespres;
        lecturaBreu = this.state.tempsAdventSetmanes.lecturaBreuVespres;
        break;
      case GLOBAL.A_FERIES:
        vers = this.state.tempsAdventFeries.citaLBVespres;
        lecturaBreu = this.state.tempsAdventFeries.lecturaBreuVespres;
        break;
      case GLOBAL.N_OCTAVA:
        vers = this.state.tempsNadalOctava.citaLBVespres;
        lecturaBreu = this.state.tempsNadalOctava.lecturaBreuVespres;
        break;
      case GLOBAL.N_ABANS:
        if(LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13){
          vers = this.state.tempsNadalAbansEpifania.citaLBVespres;
          lecturaBreu = this.state.tempsNadalAbansEpifania.lecturaBreuVespres;
        }
        break;
    }
    if(CEL.vers === '-')
      this.VESPRES.vers = vers;
    else this.VESPRES.vers = CEL.vers;
    if(CEL.lecturaBreu === '-')
      this.VESPRES.lecturaBreu = lecturaBreu;
    else this.VESPRES.lecturaBreu = CEL.lecturaBreu;
  }

  responsori(LT, CEL, date){
    switch(LT){
      case GLOBAL.O_ORDINARI:
        respBreu1 = this.state.salteriComuVespres.respBreu1
        respBreu2 = this.state.salteriComuVespres.respBreu2
        respBreu3 = this.state.salteriComuVespres.respBreu3
        break;
      case GLOBAL.Q_CENDRA:
        respBreu1 = this.state.tempsQuaresmaCendra.respBreuVespres1
        respBreu2 = this.state.tempsQuaresmaCendra.respBreuVespres2
        respBreu3 = this.state.tempsQuaresmaCendra.respBreuVespres3
        break;
      case GLOBAL.Q_SETMANES:
        respBreu1 = this.state.tempsQuaresmaVSetmanes.respBreuVespres1
        respBreu2 = this.state.tempsQuaresmaVSetmanes.respBreuVespres2
        respBreu3 = this.state.tempsQuaresmaVSetmanes.respBreuVespres3
        break;
      case GLOBAL.Q_DIUM_RAMS:
        /*if(weekDay === 6){ //Primeres vespres
          respBreu1 = this.state.tempsQuaresmaRams.respBreuVespres1
          respBreu2 = this.state.tempsQuaresmaRams.respBreuVespres2
          respBreu3 = this.state.tempsQuaresmaRams.respBreuVespres3
        }
        else{ //Segones vespres*/
          respBreu1 = this.state.tempsQuaresmaRams.respBreuVespres12
          respBreu2 = this.state.tempsQuaresmaRams.respBreuVespres22
          respBreu3 = this.state.tempsQuaresmaRams.respBreuVespres32
        //}
        break;
      case GLOBAL.Q_SET_SANTA:
        respBreu1 = this.state.tempsQuaresmaSetSanta.respBreuVespres1
        respBreu2 = this.state.tempsQuaresmaSetSanta.respBreuVespres2
        respBreu3 = this.state.tempsQuaresmaSetSanta.respBreuVespres3
        break;
      case GLOBAL.P_SETMANES:
        respBreu1 = this.state.tempsPasquaSetmanes.respBreuVespres1
        respBreu2 = this.state.tempsPasquaSetmanes.respBreuVespres2
        respBreu3 = this.state.tempsPasquaSetmanes.respBreuVespres3
        break;
      case GLOBAL.A_SETMANES:
        respBreu1 = this.state.tempsAdventSetmanes.respBreuVespres1
        respBreu2 = this.state.tempsAdventSetmanes.respBreuVespres2
        respBreu3 = this.state.tempsAdventSetmanes.respBreuVespres3
        break;
      case GLOBAL.A_FERIES:
        respBreu1 = this.state.tempsAdventFeries.respBreuVespres1
        respBreu2 = this.state.tempsAdventFeries.respBreuVespres2
        respBreu3 = this.state.tempsAdventFeries.respBreuVespres3
        break;
      case GLOBAL.N_OCTAVA:
        respBreu1 = this.state.tempsNadalOctava.respBreuVespres1Part1
        respBreu2 = this.state.tempsNadalOctava.respBreuVespres1Part2
        respBreu3 = this.state.tempsNadalOctava.respBreuVespres1Part3
        break;
      case GLOBAL.N_ABANS:
        if(LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13){
          respBreu1 = this.state.tempsNadalAbansEpifania.respBreuVespres1
          respBreu2 = this.state.tempsNadalAbansEpifania.respBreuVespres2
          respBreu3 = this.state.tempsNadalAbansEpifania.respBreuVespres3
        }
        break;
    }
    if(CEL.diumPasqua){
      this.VESPRES.calAntEspecial = true;
      this.VESPRES.antEspecialLaudes = CEL.antEspecialLaudes;
    }
    else{
      if(CEL.respBreu1 === '-'){
        if(CEL.calAntEspecial === true){
          this.VESPRES.calAntEspecial = CEL.calAntEspecial;
          this.VESPRES.antEspecialVespres = CEL.antEspecialVespres;
        }
        else{
          if(LT === GLOBAL.Q_TRIDU){
            this.VESPRES.calAntEspecial = true;
            this.VESPRES.antEspecialVespres = this.state.tempsQuaresmaTridu.antifonaEspecialVespres;
          }
          else if(LT === GLOBAL.P_OCTAVA){
            this.VESPRES.calAntEspecial = true;
            this.VESPRES.antEspecialVespres = this.state.tempsPasquaOct.antEspecialVespres;
          }
          else{
            this.VESPRES.calAntEspecial = false;
            this.VESPRES.respBreu1 = respBreu1;
            this.VESPRES.respBreu2 = respBreu2;
            this.VESPRES.respBreu3 = respBreu3;
          }
        }
      }
      else{
        this.VESPRES.calAntEspecial = false;
        this.VESPRES.respBreu1 = CEL.respBreu1;
        this.VESPRES.respBreu2 = CEL.respBreu2;
        this.VESPRES.respBreu3 = CEL.respBreu3;
      }
    }
  }

  cantic(LT, weekDay, litYear, CEL, date){
    switch(LT){
      case GLOBAL.O_ORDINARI:
        if(weekDay !== 0 && weekDay !== 6){ ///no vespres de diumenge
          antCantic = this.state.salteriComuVespres.antEvangelic;
        }
        else{ //1res i 2nes de diumenge
          if(weekDay === 6 && this.state.tempsOrdinariOracionsVespres1){ //dissabte, 1res Vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsOrdinariOracionsVespres1.antMaria1A;
                break;
              case 'B':
                antCantic = this.state.tempsOrdinariOracionsVespres1.antMaria1B;
                break;
              case 'C':
                antCantic = this.state.tempsOrdinariOracionsVespres1.antMaria1C;
                break;
            }
          }
          else{ //diumnge, 2nes Vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsOrdinariOracions.antMaria2A;
                break;
              case 'B':
                antCantic = this.state.tempsOrdinariOracions.antMaria2B;
                break;
              case 'C':
                antCantic = this.state.tempsOrdinariOracions.antMaria2C;
                break;
            }
          }
        }
        break;
      case GLOBAL.Q_CENDRA:
        switch (litYear) {
          case 'A':
            antCantic = this.state.tempsQuaresmaCendra.antMariaA;
            break;
          case 'B':
            antCantic = this.state.tempsQuaresmaCendra.antMariaB;
            break;
          case 'C':
            antCantic = this.state.tempsQuaresmaCendra.antMariaC;
            break;
        }
        if(antCantic === '-') antCantic = this.state.tempsQuaresmaCendra.antMaria;
        break;
      case GLOBAL.Q_SETMANES:
        if(weekDay !== 0 && weekDay !== 6){ ///no vespres de diumenge
          antCantic = this.state.tempsQuaresmaVSetmanes.antMaria;
        }
        else{ //1res i 2nes de diumenge
          if(weekDay === 6 && this.state.tempsQuaresmaVSetmanesDiumVespres1){ //dissabte, 1res Vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsQuaresmaVSetmanesDiumVespres1.antMaria1A;
                break;
              case 'B':
                antCantic = this.state.tempsQuaresmaVSetmanesDiumVespres1.antMaria1B;
                break;
              case 'C':
                antCantic = this.state.tempsQuaresmaVSetmanesDiumVespres1.antMaria1C;
                break;
            }
          }
          else{ //diumnge, 2nes Vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsQuaresmaVSetmanesDium.antMaria2A;
                break;
              case 'B':
                antCantic = this.state.tempsQuaresmaVSetmanesDium.antMaria2B;
                break;
              case 'C':
                antCantic = this.state.tempsQuaresmaVSetmanesDium.antMaria2C;
                break;
            }
          }
        }
        break;
      case GLOBAL.Q_DIUM_RAMS:
        /*if(weekDay === 6){ //dissabte, 1res Vespres
          switch (litYear) {
            case 'A':
              antCantic = this.state.tempsQuaresmaRams.antMaria1A;
              break;
            case 'B':
              antCantic = this.state.tempsQuaresmaRams.antMaria1B;
              break;
            case 'C':
              antCantic = this.state.tempsQuaresmaRams.antMaria1C;
              break;
          }
        }
        else{ //diumnge, 2nes Vespres*/
          switch (litYear) {
            case 'A':
              antCantic = this.state.tempsQuaresmaRams.antMaria1A2;
              break;
            case 'B':
              antCantic = this.state.tempsQuaresmaRams.antMaria1B2;
              break;
            case 'C':
              antCantic = this.state.tempsQuaresmaRams.antMaria1C2;
              break;
          //}
        }
        break;
      case GLOBAL.Q_SET_SANTA:
          antCantic = this.state.tempsQuaresmaSetSanta.antMaria;
        break;
      case GLOBAL.Q_TRIDU:
          antCantic = this.state.tempsQuaresmaTridu.antMaria;
        break;
      case GLOBAL.P_OCTAVA:
          antCantic = this.state.tempsPasquaOct.antMaria;
        break;
      case GLOBAL.P_SETMANES:
        if(weekDay !== 6 && weekDay !== 0){ ///no vespres de diumenge
          antCantic = this.state.tempsPasquaSetmanes.antMaria;
        }
        else{ //vespres de diumenge
          if(weekDay === 6 && this.state.tempsPasquaSetmanesDiumVespres1){ //primeres vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsPasquaSetmanesDiumVespres1.antMaria1A;
                break;
              case 'B':
                antCantic = this.state.tempsPasquaSetmanesDiumVespres1.antMaria1B;
                break;
              case 'C':
                antCantic = this.state.tempsPasquaSetmanesDiumVespres1.antMaria1C;
                break;
            }
          }
          else{ //segones vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsPasquaSetmanesDium.antMaria2A;
                break;
              case 'B':
                antCantic = this.state.tempsPasquaSetmanesDium.antMaria2B;
                break;
              case 'C':
                antCantic = this.state.tempsPasquaSetmanesDium.antMaria2C;
                break;
            }
          }
        }
        break;
      case GLOBAL.A_SETMANES:
        if(weekDay !== 6 && weekDay !==0){ ///no vespres de diumenge
          antCantic = this.state.tempsAdventSetmanes.antMaria;
        }
        else{ //vespres de diumenge
          if(weekDay === 6 && this.state.tempsAdventSetmanesDiumVespres1){ //primeres vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsAdventSetmanesDiumVespres1.antMaria1A;
                break;
              case 'B':
                antCantic = this.state.tempsAdventSetmanesDiumVespres1.antMaria1B;
                break;
              case 'C':
                antCantic = this.state.tempsAdventSetmanesDiumVespres1.antMaria1C;
                break;
            }
          }
          else{ //segones vespres
            switch (litYear) {
              case 'A':
                antCantic = this.state.tempsAdventSetmanesDium.antMaria2A;
                break;
              case 'B':
                antCantic = this.state.tempsAdventSetmanesDium.antMaria2B;
                break;
              case 'C':
                antCantic = this.state.tempsAdventSetmanesDium.antMaria2C;
                break;
            }
          }
        }
        break;
      case GLOBAL.A_FERIES:
        antCantic = this.state.tempsAdventFeries.antMaria;
        break;
      case GLOBAL.N_OCTAVA:
        antCantic = this.state.tempsNadalOctava.antMaria;
        break;
      case GLOBAL.N_ABANS:
        if(LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13){
          antCantic = this.state.tempsNadalAbansEpifania.antMaria;
        }
        break;
    }
    this.VESPRES.cantic = this.state.magnificat;

    if(CEL.antCantic === '-')
      this.VESPRES.antCantic = antCantic;
    else this.VESPRES.antCantic = CEL.antCantic;
  }

  pregaries(LT, CEL, date){
    switch(LT){
      case GLOBAL.O_ORDINARI:
        pregaries = this.state.salteriComuVespres.pregaries;
        break;
      case GLOBAL.Q_CENDRA:
        pregaries = this.state.tempsQuaresmaCendra.pregariesVespres;
        break;
      case GLOBAL.Q_SETMANES:
        pregaries = this.state.tempsQuaresmaVSetmanes.pregariesVespres;
        break;
      case GLOBAL.Q_DIUM_RAMS:
          /*if(weekDay === 6){ //Primeres vespres
            pregaries = this.state.tempsQuaresmaRams.pregariesVespres1;
          }
          else{ //Segones vespres*/
            pregaries = this.state.tempsQuaresmaRams.pregariesVespres12;
          //}
        break;
      case GLOBAL.Q_SET_SANTA:
          pregaries = this.state.tempsQuaresmaSetSanta.pregariesVespres;
        break;
      case GLOBAL.Q_TRIDU:
          pregaries = this.state.tempsQuaresmaTridu.pregariesVespres;
        break;
      case GLOBAL.P_OCTAVA:
          pregaries = this.state.tempsPasquaOct.pregariesVespres;
        break;
      case GLOBAL.P_SETMANES:
          pregaries = this.state.tempsPasquaSetmanes.pregariesVespres;
        break;
      case GLOBAL.A_SETMANES:
          pregaries = this.state.tempsAdventSetmanes.pregariesVespres;
        break;
      case GLOBAL.A_FERIES:
          pregaries = this.state.tempsAdventFeries.pregariesVespres;
        break;
      case GLOBAL.N_OCTAVA:
          pregaries = this.state.tempsNadalOctava.pregariesVespres;
        break;
      case GLOBAL.N_ABANS:
        if(LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13){
          pregaries = this.state.tempsNadalAbansEpifania.pregariesVespres;
        }
        break;
    }
    if(CEL.pregaries === '-')
      this.VESPRES.pregaries = pregaries;
    else this.VESPRES.pregaries = CEL.pregaries;
  }

  oracio(LT, weekDay, CEL, date){
    switch(LT){
      case GLOBAL.O_ORDINARI:
        if(weekDay !== 0 && weekDay !== 6){ ///no vespres de diumenge
          oracio = this.state.salteriComuVespres.oraFi;
        }
        else if(weekDay === 0){ // vespres de 1res o 2nes diumenge
          oracio = this.state.tempsOrdinariOracions.oracio;
        }
        else if(this.state.tempsOrdinariOracionsVespres1){
          oracio = this.state.tempsOrdinariOracionsVespres1.oracio;
        }
        break;
      case GLOBAL.Q_CENDRA:
        oracio = this.state.tempsQuaresmaCendra.oraFiVespres;
        break;
      case GLOBAL.Q_SETMANES:
        oracio = this.state.tempsQuaresmaVSetmanes.oraFiVespres;
        break;
      case GLOBAL.Q_DIUM_RAMS:
        /*if(weekDay === 6){ //Primeres vespres
          oracio = this.state.tempsQuaresmaRams.oraFiVespres1;
        }
        else{ //Segones vespres*/
          oracio = this.state.tempsQuaresmaRams.oraFiVespres12;
        //}
        break;
      case GLOBAL.Q_SET_SANTA:
        oracio = this.state.tempsQuaresmaSetSanta.oraFiVespres;
        break;
      case GLOBAL.Q_TRIDU:
        oracio = this.state.tempsQuaresmaTridu.oraFiVespres;
        break;
      case GLOBAL.P_OCTAVA:
        oracio = this.state.tempsPasquaOct.oraFiVespres;
        break;
      case GLOBAL.P_SETMANES:
        oracio = this.state.tempsPasquaSetmanes.oraFiVespres;
        break;
      case GLOBAL.A_SETMANES:
        oracio = this.state.tempsAdventSetmanes.oraFiVespres;
        break;
      case GLOBAL.A_FERIES:
        oracio = this.state.tempsAdventFeries.oraFiVespres;
        break;
      case GLOBAL.N_OCTAVA:
        oracio = this.state.tempsNadalOctava.oraFiVespres;
        break;
      case GLOBAL.N_ABANS:
        if(LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13){
          oracio = this.state.tempsNadalAbansEpifania.oraFiVespres;
        }
        break;
    }
    if(CEL.oracio === '-')
      this.VESPRES.oracio = oracio;
    else this.VESPRES.oracio = CEL.oracio;
  }
}

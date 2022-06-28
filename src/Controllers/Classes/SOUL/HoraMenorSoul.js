import GLOBAL from '../../../Utils/GlobalKeys';

let GlobalData;

export default class HoraMenorSoul {
  constructor(TABLES, CEL, Set_Soul_CB, SOUL, globalData) {
    GlobalData = globalData;
    this.makePrayer(TABLES, CEL, Set_Soul_CB, SOUL);
  }

  makePrayer(TABLES, CEL, Set_Soul_CB, SOUL){
    var llati = GlobalData.llati;
    var date = GlobalData.date;

    this.state = {
      salteriComuHora: TABLES.salteriComuHora,
      tempsOrdinariOracions: TABLES.tempsOrdinariOracions,
      tempsQuaresmaComuFV: TABLES.tempsQuaresmaComuFV,
      tempsQuaresmaCendra: TABLES.tempsQuaresmaCendra,
      tempsQuaresmaVSetmanes: TABLES.tempsQuaresmaVSetmanes,
      tempsQuaresmaComuSS: TABLES.tempsQuaresmaComuSS,
      tempsQuaresmaRams: TABLES.tempsQuaresmaRams,
      tempsQuaresmaSetSanta: TABLES.tempsQuaresmaSetSanta,
      tempsQuaresmaTridu: TABLES.tempsQuaresmaTridu,
      tempsPasquaAA: TABLES.tempsPasquaAA,
      tempsPasquaOct: TABLES.tempsPasquaOct,
      tempsPasquaDA: TABLES.tempsPasquaDA,
      tempsPasquaSetmanes: TABLES.tempsPasquaSetmanes,
      tempsAdventNadalComu: TABLES.tempsAdventNadalComu,
      tempsAdventSetmanes: TABLES.tempsAdventSetmanes,
      tempsAdventFeries: TABLES.tempsAdventFeries,
      tempsNadalOctava: TABLES.tempsNadalOctava,
      tempsNadalAbansEpifania: TABLES.tempsNadalAbansEpifania,
      salteriComuEspPasquaDium: TABLES.salteriComuEspPasquaDium,
      diversos: TABLES.diversos,
      himneTerciaOrdinariLlati: TABLES.diversos.item(6).oracio,
      himneTerciaOrdinariCat: TABLES.diversos.item(7).oracio,
      himneSextaOrdinariLlati: TABLES.diversos.item(10).oracio,
      himneSextaOrdinariCat: TABLES.diversos.item(11).oracio,
      himneNonaOrdinariLlati: TABLES.diversos.item(14).oracio,
      himneNonaOrdinariCat: TABLES.diversos.item(15).oracio,
    }

    this.TERCIA = { //23
      himne: '',
      antifones: '',
      ant: '',
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
      respV: '',
      respR: '',
      oracio: '',
    }

    this.SEXTA = { //23
      himne: '',
      antifones: '',
      ant: '',
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
      respV: '',
      respR: '',
      oracio: '',
    }

    this.NONA = { //23
      himne: '',
      antifones: '',
      ant: '',
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
      respV: '',
      respR: '',
      oracio: '',
    }

    if(CEL.diumPasqua){
      SOUL.setSoul(Set_Soul_CB, "tercia", CEL.TERCIA);
      SOUL.setSoul(Set_Soul_CB, "sexta", CEL.SEXTA);
      SOUL.setSoul(Set_Soul_CB, "nona", CEL.NONA);
    }
    else{
      this.himne(GlobalData.LT, date.getDay(), GlobalData.setmana, "Tèrcia", CEL.TERCIA, llati, date);
      this.salmodia(GlobalData.LT, GlobalData.setmana, date.getDay(), "Tèrcia", CEL.TERCIA, date);
      this.lecturaBreuResp(GlobalData.LT, "Tèrcia", CEL.TERCIA, date);
      this.oracio(GlobalData.LT, date.getDay(), "Tèrcia", CEL.TERCIA, date);

      SOUL.setSoul(Set_Soul_CB, "tercia", this.TERCIA);

      this.himne(GlobalData.LT, date.getDay(), GlobalData.setmana, "Sexta", CEL.SEXTA, llati, date);
      this.salmodia(GlobalData.LT, GlobalData.setmana, date.getDay(), "Sexta", CEL.SEXTA, date);
      this.lecturaBreuResp(GlobalData.LT, "Sexta", CEL.SEXTA, date);
      this.oracio(GlobalData.LT, date.getDay(), "Sexta", CEL.SEXTA, date);

      SOUL.setSoul(Set_Soul_CB, "sexta", this.SEXTA);

      this.himne(GlobalData.LT, date.getDay(), GlobalData.setmana, "Nona", CEL.NONA, llati, date);
      this.salmodia(GlobalData.LT, GlobalData.setmana, date.getDay(), "Nona", CEL.NONA, date);
      this.lecturaBreuResp(GlobalData.LT, "Nona", CEL.NONA, date);
      this.oracio(GlobalData.LT, date.getDay(), "Nona", CEL.NONA, date);

      SOUL.setSoul(Set_Soul_CB, "nona", this.NONA);
    }
  }

  himne(LT, weekDay, setmana, HM, CEL, llati, date){
    if(CEL.himne === '-'){
      switch(LT){
        case GLOBAL.O_ORDINARI:
          if(llati === 'true'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = this.state.himneTerciaOrdinariLlati;
                break;
              case 'Sexta':
                this.SEXTA.himne = this.state.himneSextaOrdinariLlati;
                break;
              case 'Nona':
                this.NONA.himne = this.state.himneNonaOrdinariLlati;
                break;
            }
          }
          else{
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = this.state.himneTerciaOrdinariCat;
                break;
              case 'Sexta':
                this.SEXTA.himne = this.state.himneSextaOrdinariCat;
                break;
              case 'Nona':
                this.NONA.himne = this.state.himneNonaOrdinariCat;
                break;
            }
          }
          break;
        case GLOBAL.Q_CENDRA:
        case GLOBAL.Q_SETMANES:
          if(llati === 'true'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.himneTerciaLlati;
                break;
              case 'Sexta':
                this.SEXTA.himne = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.himneSextaLlati;
                break;
              case 'Nona':
                this.NONA.himne = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.himneNonaLlati;
                break;
            }
          }
          else{
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.himneTerciaCat;
                break;
              case 'Sexta':
                this.SEXTA.himne = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.himneSextaCat;
                break;
              case 'Nona':
                this.NONA.himne = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.himneNonaCat;
                break;
            }
          }
          break;
        case GLOBAL.Q_DIUM_RAMS:
        case GLOBAL.Q_SET_SANTA:
          if(llati === 'true'){
            this.TERCIA.himne = liturgyMasters.CommonPartsOfHolyWeek.himneHoraLlati;
            this.SEXTA.himne = liturgyMasters.CommonPartsOfHolyWeek.himneHoraLlati;
            this.NONA.himne = liturgyMasters.CommonPartsOfHolyWeek.himneHoraLlati;
          }
          else{
            this.TERCIA.himne = liturgyMasters.CommonPartsOfHolyWeek.himneHoraCat;
            this.SEXTA.himne = liturgyMasters.CommonPartsOfHolyWeek.himneHoraCat;
            this.NONA.himne = liturgyMasters.CommonPartsOfHolyWeek.himneHoraCat;
          }
          break;
        case GLOBAL.Q_TRIDU:
          if(llati === 'true'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = liturgyMasters.PartsOfEasterTriduum.himneLlatiTercia;
                break;
              case 'Sexta':
                this.SEXTA.himne = liturgyMasters.PartsOfEasterTriduum.himneLlatiSexta;
                break;
              case 'Nona':
                this.NONA.himne = liturgyMasters.PartsOfEasterTriduum.himneLlatiNona;
                break;
            }
          }
          else{
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = liturgyMasters.PartsOfEasterTriduum.himneCatTercia;
                break;
              case 'Sexta':
                this.SEXTA.himne = liturgyMasters.PartsOfEasterTriduum.himneCatSexta;
                break;
              case 'Nona':
                this.NONA.himne = liturgyMasters.PartsOfEasterTriduum.himneCatNona;
                break;
            }
          }
          break;
        case GLOBAL.P_OCTAVA:
          if(llati === 'true'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneTerciaLlati;
                break;
              case 'Sexta':
                this.SEXTA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneSextaLlati;
                break;
              case 'Nona':
                this.NONA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneNonaLlati;
                break;
            }
          }
          else{
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneTerciaCat;
                break;
              case 'Sexta':
                this.SEXTA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneSextaCat;
                break;
              case 'Nona':
                this.NONA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneNonaCat;
                break;
            }
          }
          break;
        case GLOBAL.P_SETMANES:
        if(setmana === '7'){
            if(llati === 'true'){
              switch (HM) {
                case 'Tèrcia':
                  this.TERCIA.himne = liturgyMasters.PartsOfEasterAfterAscension.himneTerciaLlati;
                  break;
                case 'Sexta':
                  this.SEXTA.himne = liturgyMasters.PartsOfEasterAfterAscension.himneSextaLlati;
                  break;
                case 'Nona':
                  this.NONA.himne = liturgyMasters.PartsOfEasterAfterAscension.himneNonaLlati;
                  break;
              }
            }
            else{
              switch (HM) {
                case 'Tèrcia':
                  this.TERCIA.himne = liturgyMasters.PartsOfEasterAfterAscension.himneTerciaCat;
                  break;
                case 'Sexta':
                  this.SEXTA.himne = liturgyMasters.PartsOfEasterAfterAscension.himneSextaCat;
                  break;
                case 'Nona':
                  this.NONA.himne = liturgyMasters.PartsOfEasterAfterAscension.himneNonaCat;
                  break;
              }
            }
          }
          else{
            if(llati === 'true'){
              switch (HM) {
                case 'Tèrcia':
                  this.TERCIA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneTerciaLlati;
                  break;
                case 'Sexta':
                  this.SEXTA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneSextaLlati;
                  break;
                case 'Nona':
                  this.NONA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneNonaLlati;
                  break;
              }
            }
            else{
              switch (HM) {
                case 'Tèrcia':
                  this.TERCIA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneTerciaCat;
                  break;
                case 'Sexta':
                  this.SEXTA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneSextaCat;
                  break;
                case 'Nona':
                  this.NONA.himne = liturgyMasters.PartsOfEasterBeforeAscension.himneNonaCat;
                  break;
              }
            }
          }
          break;
        case GLOBAL.A_SETMANES:
        case GLOBAL.A_FERIES:
        case GLOBAL.N_OCTAVA:
        case GLOBAL.N_ABANS:
          if(LT != GLOBAL.N_ABANS || (LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13)){
            if(llati === 'true'){
              switch (HM) {
                case 'Tèrcia':
                  this.TERCIA.himne = liturgyMasters.CommonAdventAndChristmasParts.himneTerciaLlati;
                  break;
                case 'Sexta':
                  this.SEXTA.himne = liturgyMasters.CommonAdventAndChristmasParts.himneSextaLlati;
                  break;
                case 'Nona':
                  this.NONA.himne = liturgyMasters.CommonAdventAndChristmasParts.himneNonaLlati;
                  break;
              }
            }
            else{
              switch (HM) {
                case 'Tèrcia':
                  this.TERCIA.himne = liturgyMasters.CommonAdventAndChristmasParts.himneTerciaCat;
                  break;
                case 'Sexta':
                  this.SEXTA.himne = liturgyMasters.CommonAdventAndChristmasParts.himneSextaCat;
                  break;
                case 'Nona':
                  this.NONA.himne = liturgyMasters.CommonAdventAndChristmasParts.himneNonaCat;
                  break;
              }
            }
          }
          break;
      }
    }
    else{
      switch (HM) {
        case 'Tèrcia':
          this.TERCIA.himne = CEL.himne;
          break;
        case 'Sexta':
          this.SEXTA.himne = CEL.himne;
          break;
        case 'Nona':
          this.NONA.himne = CEL.himne;
          break;
      }
    }
  }

  salmodia(LT, setmana, weekDay, HM, CEL, date){
    if(CEL.titol1 === '-'){
      if(CEL.ant !== '-'){
        switch (HM) {
          case 'Tèrcia':
            this.TERCIA.antifones = CEL.antifones;
            this.TERCIA.ant = CEL.ant;
            break;
          case 'Sexta':
            this.SEXTA.antifones = CEL.antifones;
            this.SEXTA.ant = CEL.ant;
            break;
          case 'Nona':
            this.NONA.antifones = CEL.antifones;
            this.NONA.ant = CEL.ant;
            break;
        }
      }
      else{
        this.TERCIA.antifones = true;
        this.SEXTA.antifones = true;
        this.NONA.antifones = true;
      }
      switch(LT){
        case GLOBAL.O_ORDINARI:
          this.TERCIA.ant1 = this.state.salteriComuHora.ant1;
          this.TERCIA.titol1 = this.state.salteriComuHora.titol1;
          this.TERCIA.com1 = this.state.salteriComuHora.com1;
          this.TERCIA.salm1 = this.state.salteriComuHora.salm1;
          this.TERCIA.gloria1 = this.state.salteriComuHora.gloria1;
          this.TERCIA.ant2 = this.state.salteriComuHora.ant2;
          this.TERCIA.titol2 = this.state.salteriComuHora.titol2;
          this.TERCIA.com2 = this.state.salteriComuHora.com2;
          this.TERCIA.salm2 = this.state.salteriComuHora.salm2;
          this.TERCIA.gloria2 = this.state.salteriComuHora.gloria2;
          this.TERCIA.ant3 = this.state.salteriComuHora.ant3;
          this.TERCIA.titol3 = this.state.salteriComuHora.titol3;
          this.TERCIA.com3 = this.state.salteriComuHora.com3;
          this.TERCIA.salm3 = this.state.salteriComuHora.salm3;
          this.TERCIA.gloria3 = this.state.salteriComuHora.gloria3;

          this.SEXTA.ant1 = this.state.salteriComuHora.ant1;
          this.SEXTA.titol1 = this.state.salteriComuHora.titol1;
          this.SEXTA.com1 = this.state.salteriComuHora.com1;
          this.SEXTA.salm1 = this.state.salteriComuHora.salm1;
          this.SEXTA.gloria1 = this.state.salteriComuHora.gloria1;
          this.SEXTA.ant2 = this.state.salteriComuHora.ant2;
          this.SEXTA.titol2 = this.state.salteriComuHora.titol2;
          this.SEXTA.com2 = this.state.salteriComuHora.com2;
          this.SEXTA.salm2 = this.state.salteriComuHora.salm2;
          this.SEXTA.gloria2 = this.state.salteriComuHora.gloria2;
          this.SEXTA.ant3 = this.state.salteriComuHora.ant3;
          this.SEXTA.titol3 = this.state.salteriComuHora.titol3;
          this.SEXTA.com3 = this.state.salteriComuHora.com3;
          this.SEXTA.salm3 = this.state.salteriComuHora.salm3;
          this.SEXTA.gloria3 = this.state.salteriComuHora.gloria3;

          this.NONA.ant1 = this.state.salteriComuHora.ant1;
          this.NONA.titol1 = this.state.salteriComuHora.titol1;
          this.NONA.com1 = this.state.salteriComuHora.com1;
          this.NONA.salm1 = this.state.salteriComuHora.salm1;
          this.NONA.gloria1 = this.state.salteriComuHora.gloria1;
          this.NONA.ant2 = this.state.salteriComuHora.ant2;
          this.NONA.titol2 = this.state.salteriComuHora.titol2;
          this.NONA.com2 = this.state.salteriComuHora.com2;
          this.NONA.salm2 = this.state.salteriComuHora.salm2;
          this.NONA.gloria2 = this.state.salteriComuHora.gloria2;
          this.NONA.ant3 = this.state.salteriComuHora.ant3;
          this.NONA.titol3 = this.state.salteriComuHora.titol3;
          this.NONA.com3 = this.state.salteriComuHora.com3;
          this.NONA.salm3 = this.state.salteriComuHora.salm3;
          this.NONA.gloria3 = this.state.salteriComuHora.gloria3;
          break;
        case GLOBAL.Q_CENDRA:
        case GLOBAL.Q_SETMANES:
          this.TERCIA.antifones = false;

          this.TERCIA.titol1 = this.state.salteriComuHora.titol1;
          this.TERCIA.com1 = this.state.salteriComuHora.com1;
          this.TERCIA.salm1 = this.state.salteriComuHora.salm1;
          this.TERCIA.gloria1 = this.state.salteriComuHora.gloria1;
          this.TERCIA.titol2 = this.state.salteriComuHora.titol2;
          this.TERCIA.com2 = this.state.salteriComuHora.com2;
          this.TERCIA.salm2 = this.state.salteriComuHora.salm2;
          this.TERCIA.gloria2 = this.state.salteriComuHora.gloria2;
          this.TERCIA.titol3 = this.state.salteriComuHora.titol3;
          this.TERCIA.com3 = this.state.salteriComuHora.com3;
          this.TERCIA.salm3 = this.state.salteriComuHora.salm3;
          this.TERCIA.gloria3 = this.state.salteriComuHora.gloria3;

          this.SEXTA.antifones = false;

          this.SEXTA.titol1 = this.state.salteriComuHora.titol1;
          this.SEXTA.com1 = this.state.salteriComuHora.com1;
          this.SEXTA.salm1 = this.state.salteriComuHora.salm1;
          this.SEXTA.gloria1 = this.state.salteriComuHora.gloria1;
          this.SEXTA.titol2 = this.state.salteriComuHora.titol2;
          this.SEXTA.com2 = this.state.salteriComuHora.com2;
          this.SEXTA.salm2 = this.state.salteriComuHora.salm2;
          this.SEXTA.gloria2 = this.state.salteriComuHora.gloria2;
          this.SEXTA.titol3 = this.state.salteriComuHora.titol3;
          this.SEXTA.com3 = this.state.salteriComuHora.com3;
          this.SEXTA.salm3 = this.state.salteriComuHora.salm3;
          this.SEXTA.gloria3 = this.state.salteriComuHora.gloria3;

          this.NONA.antifones = false;

          this.NONA.titol1 = this.state.salteriComuHora.titol1;
          this.NONA.com1 = this.state.salteriComuHora.com1;
          this.NONA.salm1 = this.state.salteriComuHora.salm1;
          this.NONA.gloria1 = this.state.salteriComuHora.gloria1;
          this.NONA.titol2 = this.state.salteriComuHora.titol2;
          this.NONA.com2 = this.state.salteriComuHora.com2;
          this.NONA.salm2 = this.state.salteriComuHora.salm2;
          this.NONA.gloria2 = this.state.salteriComuHora.gloria2;
          this.NONA.titol3 = this.state.salteriComuHora.titol3;
          this.NONA.com3 = this.state.salteriComuHora.com3;
          this.NONA.salm3 = this.state.salteriComuHora.salm3;
          this.NONA.gloria3 = this.state.salteriComuHora.gloria3;

          if(CEL.ant === '-'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.ant = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.antTercia;
                break;
              case 'Sexta':
                this.SEXTA.ant = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.antSexta;
                break;
              case 'Nona':
                this.NONA.ant = liturgyMasters.CommonPartsUntilFifthWeekOfLentTime.antNona;
                break;
            }
          }
          break;
        case GLOBAL.Q_DIUM_RAMS:
        case GLOBAL.Q_SET_SANTA:
          this.TERCIA.antifones = false;

          this.TERCIA.titol1 = this.state.salteriComuHora.titol1;
          this.TERCIA.com1 = this.state.salteriComuHora.com1;
          this.TERCIA.salm1 = this.state.salteriComuHora.salm1;
          this.TERCIA.gloria1 = this.state.salteriComuHora.gloria1;
          this.TERCIA.titol2 = this.state.salteriComuHora.titol2;
          this.TERCIA.com2 = this.state.salteriComuHora.com2;
          this.TERCIA.salm2 = this.state.salteriComuHora.salm2;
          this.TERCIA.gloria2 = this.state.salteriComuHora.gloria2;
          this.TERCIA.titol3 = this.state.salteriComuHora.titol3;
          this.TERCIA.com3 = this.state.salteriComuHora.com3;
          this.TERCIA.salm3 = this.state.salteriComuHora.salm3;
          this.TERCIA.gloria3 = this.state.salteriComuHora.gloria3;

          this.SEXTA.antifones = false;

          this.SEXTA.titol1 = this.state.salteriComuHora.titol1;
          this.SEXTA.com1 = this.state.salteriComuHora.com1;
          this.SEXTA.salm1 = this.state.salteriComuHora.salm1;
          this.SEXTA.gloria1 = this.state.salteriComuHora.gloria1;
          this.SEXTA.titol2 = this.state.salteriComuHora.titol2;
          this.SEXTA.com2 = this.state.salteriComuHora.com2;
          this.SEXTA.salm2 = this.state.salteriComuHora.salm2;
          this.SEXTA.gloria2 = this.state.salteriComuHora.gloria2;
          this.SEXTA.titol3 = this.state.salteriComuHora.titol3;
          this.SEXTA.com3 = this.state.salteriComuHora.com3;
          this.SEXTA.salm3 = this.state.salteriComuHora.salm3;
          this.SEXTA.gloria3 = this.state.salteriComuHora.gloria3;

          this.NONA.antifones = false;

          this.NONA.titol1 = this.state.salteriComuHora.titol1;
          this.NONA.com1 = this.state.salteriComuHora.com1;
          this.NONA.salm1 = this.state.salteriComuHora.salm1;
          this.NONA.gloria1 = this.state.salteriComuHora.gloria1;
          this.NONA.titol2 = this.state.salteriComuHora.titol2;
          this.NONA.com2 = this.state.salteriComuHora.com2;
          this.NONA.salm2 = this.state.salteriComuHora.salm2;
          this.NONA.gloria2 = this.state.salteriComuHora.gloria2;
          this.NONA.titol3 = this.state.salteriComuHora.titol3;
          this.NONA.com3 = this.state.salteriComuHora.com3;
          this.NONA.salm3 = this.state.salteriComuHora.salm3;
          this.NONA.gloria3 = this.state.salteriComuHora.gloria3;

          if(CEL.ant === '-'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.ant = liturgyMasters.CommonPartsOfHolyWeek.antTercia;
                break;
              case 'Sexta':
                this.SEXTA.ant = liturgyMasters.CommonPartsOfHolyWeek.antSexta;
                break;
              case 'Nona':
                this.NONA.ant = liturgyMasters.CommonPartsOfHolyWeek.antNona;
                break;
            }
          }
          break;
        case GLOBAL.Q_TRIDU:
          this.TERCIA.antifones = false;

          this.TERCIA.titol1 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor1;
          this.TERCIA.com1 = "-";
          this.TERCIA.salm1 = liturgyMasters.PartsOfEasterTriduum.salmMenor1;
          this.TERCIA.gloria1 = "1";
          this.TERCIA.titol2 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor2;
          this.TERCIA.com2 = "-";
          this.TERCIA.salm2 = liturgyMasters.PartsOfEasterTriduum.salmMenor2;
          this.TERCIA.gloria2 = "1";
          this.TERCIA.titol3 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor3;
          this.TERCIA.com3 = "-";
          this.TERCIA.salm3 = liturgyMasters.PartsOfEasterTriduum.salmMenor3;
          this.TERCIA.gloria3 = "1";

          this.SEXTA.antifones = false;

          this.SEXTA.titol1 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor1;
          this.SEXTA.com1 = "-";
          this.SEXTA.salm1 = liturgyMasters.PartsOfEasterTriduum.salmMenor1;
          this.SEXTA.gloria1 = "1";
          this.SEXTA.titol2 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor2;
          this.SEXTA.com2 = "-";
          this.SEXTA.salm2 = liturgyMasters.PartsOfEasterTriduum.salmMenor2;
          this.SEXTA.gloria2 = "1";
          this.SEXTA.titol3 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor3;
          this.SEXTA.com3 = "-";
          this.SEXTA.salm3 = liturgyMasters.PartsOfEasterTriduum.salmMenor3;
          this.SEXTA.gloria3 = "1";

          this.NONA.antifones = false;

          this.NONA.titol1 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor1;
          this.NONA.com1 = "-";
          this.NONA.salm1 = liturgyMasters.PartsOfEasterTriduum.salmMenor1;
          this.NONA.gloria1 = "1";
          this.NONA.titol2 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor2;
          this.NONA.com2 = "-";
          this.NONA.salm2 = liturgyMasters.PartsOfEasterTriduum.salmMenor2;
          this.NONA.gloria2 = "1";
          this.NONA.titol3 = liturgyMasters.PartsOfEasterTriduum.titolSalmMenor3;
          this.NONA.com3 = "-";
          this.NONA.salm3 = liturgyMasters.PartsOfEasterTriduum.salmMenor3;
          this.NONA.gloria3 = "1";

          if(CEL.ant === '-'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.ant = liturgyMasters.PartsOfEasterTriduum.antTercia;
                break;
              case 'Sexta':
                this.SEXTA.ant = liturgyMasters.PartsOfEasterTriduum.antSexta;
                break;
              case 'Nona':
                this.NONA.ant = liturgyMasters.PartsOfEasterTriduum.antNona;
                break;
            }
          }
          break;
        case GLOBAL.P_OCTAVA:
          this.TERCIA.antifones = false;

          this.TERCIA.titol1 = this.state.tempsPasquaOct.titol1salm117;
          this.TERCIA.com1 = "-";
          this.TERCIA.salm1 = this.state.tempsPasquaOct.part1Salm117;
          this.TERCIA.gloria1 = this.state.tempsPasquaOct.gloria1salm117;
          this.TERCIA.titol2 = this.state.tempsPasquaOct.titol2salm117;
          this.TERCIA.com2 = "-";
          this.TERCIA.salm2 = this.state.tempsPasquaOct.part2Salm117;
          this.TERCIA.gloria2 = this.state.tempsPasquaOct.gloria2salm117;
          this.TERCIA.titol3 = this.state.tempsPasquaOct.titol3salm117;
          this.TERCIA.com3 = "-";
          this.TERCIA.salm3 = this.state.tempsPasquaOct.part3Salm117;
          this.TERCIA.gloria3 = this.state.tempsPasquaOct.gloria3salm117;

          this.SEXTA.antifones = false;

          this.SEXTA.titol1 = this.state.tempsPasquaOct.titol1salm117;
          this.SEXTA.com1 = "-";
          this.SEXTA.salm1 = this.state.tempsPasquaOct.part1Salm117;
          this.SEXTA.gloria1 = this.state.tempsPasquaOct.gloria1salm117;
          this.SEXTA.titol2 = this.state.tempsPasquaOct.titol2salm117;
          this.SEXTA.com2 = "-";
          this.SEXTA.salm2 = this.state.tempsPasquaOct.part2Salm117;
          this.SEXTA.gloria2 = this.state.tempsPasquaOct.gloria2salm117;
          this.SEXTA.titol3 = this.state.tempsPasquaOct.titol3salm117;
          this.SEXTA.com3 = "-";
          this.SEXTA.salm3 = this.state.tempsPasquaOct.part3Salm117;
          this.SEXTA.gloria3 = this.state.tempsPasquaOct.gloria3salm117;

          this.NONA.antifones = false;

          this.NONA.titol1 = this.state.tempsPasquaOct.titol1salm117;
          this.NONA.com1 = "-";
          this.NONA.salm1 = this.state.tempsPasquaOct.part1Salm117;
          this.NONA.gloria1 = this.state.tempsPasquaOct.gloria1salm117;
          this.NONA.titol2 = this.state.tempsPasquaOct.titol2salm117;
          this.NONA.com2 = "-";
          this.NONA.salm2 = this.state.tempsPasquaOct.part2Salm117;
          this.NONA.gloria2 = this.state.tempsPasquaOct.gloria2salm117;
          this.NONA.titol3 = this.state.tempsPasquaOct.titol3salm117;
          this.NONA.com3 = "-";
          this.NONA.salm3 = this.state.tempsPasquaOct.part3Salm117;
          this.NONA.gloria3 = this.state.tempsPasquaOct.gloria3salm117;

          if(CEL.ant === '-'){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.ant = this.state.tempsPasquaOct.antMenorTercia;
                break;
              case 'Sexta':
                this.SEXTA.ant = this.state.tempsPasquaOct.antMenorSexta;
                break;
              case 'Nona':
                this.NONA.ant = this.state.tempsPasquaOct.antMenorNona;
                break;
            }
          }
          break;
        case GLOBAL.P_SETMANES:
          this.TERCIA.antifones = false;

          this.TERCIA.titol1 = this.state.salteriComuHora.titol1;
          this.TERCIA.com1 = this.state.salteriComuHora.com1;
          this.TERCIA.salm1 = this.state.salteriComuHora.salm1;
          this.TERCIA.gloria1 = this.state.salteriComuHora.gloria1;
          this.TERCIA.titol2 = this.state.salteriComuHora.titol2;
          this.TERCIA.com2 = this.state.salteriComuHora.com2;
          this.TERCIA.salm2 = this.state.salteriComuHora.salm2;
          this.TERCIA.gloria2 = this.state.salteriComuHora.gloria2;
          this.TERCIA.titol3 = this.state.salteriComuHora.titol3;
          this.TERCIA.com3 = this.state.salteriComuHora.com3;
          this.TERCIA.salm3 = this.state.salteriComuHora.salm3;
          this.TERCIA.gloria3 = this.state.salteriComuHora.gloria3;

          this.SEXTA.antifones = false;

          this.SEXTA.titol1 = this.state.salteriComuHora.titol1;
          this.SEXTA.com1 = this.state.salteriComuHora.com1;
          this.SEXTA.salm1 = this.state.salteriComuHora.salm1;
          this.SEXTA.gloria1 = this.state.salteriComuHora.gloria1;
          this.SEXTA.titol2 = this.state.salteriComuHora.titol2;
          this.SEXTA.com2 = this.state.salteriComuHora.com2;
          this.SEXTA.salm2 = this.state.salteriComuHora.salm2;
          this.SEXTA.gloria2 = this.state.salteriComuHora.gloria2;
          this.SEXTA.titol3 = this.state.salteriComuHora.titol3;
          this.SEXTA.com3 = this.state.salteriComuHora.com3;
          this.SEXTA.salm3 = this.state.salteriComuHora.salm3;
          this.SEXTA.gloria3 = this.state.salteriComuHora.gloria3;

          this.NONA.antifones = false;

          this.NONA.titol1 = this.state.salteriComuHora.titol1;
          this.NONA.com1 = this.state.salteriComuHora.com1;
          this.NONA.salm1 = this.state.salteriComuHora.salm1;
          this.NONA.gloria1 = this.state.salteriComuHora.gloria1;
          this.NONA.titol2 = this.state.salteriComuHora.titol2;
          this.NONA.com2 = this.state.salteriComuHora.com2;
          this.NONA.salm2 = this.state.salteriComuHora.salm2;
          this.NONA.gloria2 = this.state.salteriComuHora.gloria2;
          this.NONA.titol3 = this.state.salteriComuHora.titol3;
          this.NONA.com3 = this.state.salteriComuHora.com3;
          this.NONA.salm3 = this.state.salteriComuHora.salm3;
          this.NONA.gloria3 = this.state.salteriComuHora.gloria3;

          if(CEL.ant === '-'){
            this.TERCIA.ant = "Al·leluia, al·leluia, al·leluia."
            this.SEXTA.ant = "Al·leluia, al·leluia, al·leluia."
            this.NONA.ant = "Al·leluia, al·leluia, al·leluia."
          }
          break;
        case GLOBAL.A_SETMANES:
        case GLOBAL.N_OCTAVA:
        case GLOBAL.A_FERIES:
        case GLOBAL.N_ABANS:
          if(LT != GLOBAL.N_ABANS || (LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13)){
            this.TERCIA.antifones = false;

            this.TERCIA.titol1 = this.state.salteriComuHora.titol1;
            this.TERCIA.com1 = this.state.salteriComuHora.com1;
            this.TERCIA.salm1 = this.state.salteriComuHora.salm1;
            this.TERCIA.gloria1 = this.state.salteriComuHora.gloria1;
            this.TERCIA.titol2 = this.state.salteriComuHora.titol2;
            this.TERCIA.com2 = this.state.salteriComuHora.com2;
            this.TERCIA.salm2 = this.state.salteriComuHora.salm2;
            this.TERCIA.gloria2 = this.state.salteriComuHora.gloria2;
            this.TERCIA.titol3 = this.state.salteriComuHora.titol3;
            this.TERCIA.com3 = this.state.salteriComuHora.com3;
            this.TERCIA.salm3 = this.state.salteriComuHora.salm3;
            this.TERCIA.gloria3 = this.state.salteriComuHora.gloria3;

            this.SEXTA.antifones = false;

            this.SEXTA.titol1 = this.state.salteriComuHora.titol1;
            this.SEXTA.com1 = this.state.salteriComuHora.com1;
            this.SEXTA.salm1 = this.state.salteriComuHora.salm1;
            this.SEXTA.gloria1 = this.state.salteriComuHora.gloria1;
            this.SEXTA.titol2 = this.state.salteriComuHora.titol2;
            this.SEXTA.com2 = this.state.salteriComuHora.com2;
            this.SEXTA.salm2 = this.state.salteriComuHora.salm2;
            this.SEXTA.gloria2 = this.state.salteriComuHora.gloria2;
            this.SEXTA.titol3 = this.state.salteriComuHora.titol3;
            this.SEXTA.com3 = this.state.salteriComuHora.com3;
            this.SEXTA.salm3 = this.state.salteriComuHora.salm3;
            this.SEXTA.gloria3 = this.state.salteriComuHora.gloria3;

            this.NONA.antifones = false;

            this.NONA.titol1 = this.state.salteriComuHora.titol1;
            this.NONA.com1 = this.state.salteriComuHora.com1;
            this.NONA.salm1 = this.state.salteriComuHora.salm1;
            this.NONA.gloria1 = this.state.salteriComuHora.gloria1;
            this.NONA.titol2 = this.state.salteriComuHora.titol2;
            this.NONA.com2 = this.state.salteriComuHora.com2;
            this.NONA.salm2 = this.state.salteriComuHora.salm2;
            this.NONA.gloria2 = this.state.salteriComuHora.gloria2;
            this.NONA.titol3 = this.state.salteriComuHora.titol3;
            this.NONA.com3 = this.state.salteriComuHora.com3;
            this.NONA.salm3 = this.state.salteriComuHora.salm3;
            this.NONA.gloria3 = this.state.salteriComuHora.gloria3;

            if(CEL.ant === '-'){
              switch (HM) {
                case 'Tèrcia':
                  this.TERCIA.ant = liturgyMasters.CommonAdventAndChristmasParts.antTercia;
                  break;
                case 'Sexta':
                  this.SEXTA.ant = liturgyMasters.CommonAdventAndChristmasParts.antSexta;
                  break;
                case 'Nona':
                  this.NONA.ant = liturgyMasters.CommonAdventAndChristmasParts.antNona;
                  break;
              }
            }
          }
          break;
      }
    }
    else{
      switch (HM) {
        case 'Tèrcia':
          this.TERCIA.antifones = CEL.antifones;
          this.TERCIA.ant = CEL.ant;

          this.TERCIA.titol1 = CEL.titol1;
          this.TERCIA.com1 = '-';
          this.TERCIA.salm1 = CEL.salm1;
          this.TERCIA.gloria1 = CEL.gloria1;
          this.TERCIA.titol2 = CEL.titol2;
          this.TERCIA.com2 = '-';
          this.TERCIA.salm2 = CEL.salm2;
          this.TERCIA.gloria2 = CEL.gloria2;
          this.TERCIA.titol3 = CEL.titol3;
          this.TERCIA.com3 = '-';
          this.TERCIA.salm3 = CEL.salm3;
          this.TERCIA.gloria3 = CEL.gloria3;
          break;
        case 'Sexta':
          this.SEXTA.antifones = CEL.antifones;
          this.SEXTA.ant = CEL.ant;

          this.SEXTA.titol1 = CEL.titol1;
          this.SEXTA.com1 = '-';
          this.SEXTA.salm1 = CEL.salm1;
          this.SEXTA.gloria1 = CEL.gloria1;
          this.SEXTA.titol2 = CEL.titol2;
          this.SEXTA.com2 = '-';
          this.SEXTA.salm2 = CEL.salm2;
          this.SEXTA.gloria2 = CEL.gloria2;
          this.SEXTA.titol3 = CEL.titol3;
          this.SEXTA.com3 = '-';
          this.SEXTA.salm3 = CEL.salm3;
          this.SEXTA.gloria3 = CEL.gloria3;
          break;
        case 'Nona':
          this.NONA.antifones = CEL.antifones;
          this.NONA.ant = CEL.ant;

          this.NONA.titol1 = CEL.titol1;
          this.NONA.com1 = '-';
          this.NONA.salm1 = CEL.salm1;
          this.NONA.gloria1 = CEL.gloria1;
          this.NONA.titol2 = CEL.titol2;
          this.NONA.com2 = '-';
          this.NONA.salm2 = CEL.salm2;
          this.NONA.gloria2 = CEL.gloria2;
          this.NONA.titol3 = CEL.titol3;
          this.NONA.com3 = '-';
          this.NONA.salm3 = CEL.salm3;
          this.NONA.gloria3 = CEL.gloria3;
          break;
      }
    }
  }

  lecturaBreuResp(LT, HM, CEL, date){
    if(CEL.vers === '-'){
      switch(LT){
        case GLOBAL.O_ORDINARI:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.salteriComuHora.versetLBTercia;
              this.TERCIA.lecturaBreu = this.state.salteriComuHora.lecturaBreuTercia;
              this.TERCIA.respV = this.state.salteriComuHora.respTercia1;
              this.TERCIA.respR = this.state.salteriComuHora.respTercia2;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.salteriComuHora.versetLBSexta;
              this.SEXTA.lecturaBreu = this.state.salteriComuHora.lecturaBreuSexta;
              this.SEXTA.respV = this.state.salteriComuHora.respSexta1;
              this.SEXTA.respR = this.state.salteriComuHora.respSexta2;
              break;
            case 'Nona':
              this.NONA.vers = this.state.salteriComuHora.versetLBNona;
              this.NONA.lecturaBreu = this.state.salteriComuHora.lecturaBreuNona;
              this.NONA.respV = this.state.salteriComuHora.respNona1;
              this.NONA.respR = this.state.salteriComuHora.respNona2;
              break;
          }
          break;
        case GLOBAL.Q_CENDRA:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.tempsQuaresmaCendra.citaLBTercia;
              this.TERCIA.lecturaBreu = this.state.tempsQuaresmaCendra.lecturaBreuTercia;
              this.TERCIA.respV = this.state.tempsQuaresmaCendra.respVTercia;
              this.TERCIA.respR = this.state.tempsQuaresmaCendra.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.tempsQuaresmaCendra.citaLBSexta;
              this.SEXTA.lecturaBreu = this.state.tempsQuaresmaCendra.lecturaBreuSexta;
              this.SEXTA.respV = this.state.tempsQuaresmaCendra.respVSexta;
              this.SEXTA.respR = this.state.tempsQuaresmaCendra.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = this.state.tempsQuaresmaCendra.citaLBNona;
              this.NONA.lecturaBreu = this.state.tempsQuaresmaCendra.lecturaBreuNona;
              this.NONA.respV = this.state.tempsQuaresmaCendra.respVNona;
              this.NONA.respR = this.state.tempsQuaresmaCendra.respRNona;
              break;
          }
          break;
        case GLOBAL.Q_SETMANES:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.tempsQuaresmaVSetmanes.citaLBTercia;
              this.TERCIA.lecturaBreu = this.state.tempsQuaresmaVSetmanes.lecturaBreuTercia;
              this.TERCIA.respV = this.state.tempsQuaresmaVSetmanes.respVTercia;
              this.TERCIA.respR = this.state.tempsQuaresmaVSetmanes.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.tempsQuaresmaVSetmanes.citaLBSexta;
              this.SEXTA.lecturaBreu = this.state.tempsQuaresmaVSetmanes.lecturaBreuSexta;
              this.SEXTA.respV = this.state.tempsQuaresmaVSetmanes.respVSexta;
              this.SEXTA.respR = this.state.tempsQuaresmaVSetmanes.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = this.state.tempsQuaresmaVSetmanes.citaLBNona;
              this.NONA.lecturaBreu = this.state.tempsQuaresmaVSetmanes.lecturaBreuNona;
              this.NONA.respV = this.state.tempsQuaresmaVSetmanes.respVNona;
              this.NONA.respR = this.state.tempsQuaresmaVSetmanes.respRNona;
              break;
          }
          break;
        case GLOBAL.Q_DIUM_RAMS:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.tempsQuaresmaRams.citaLBTercia;
              this.TERCIA.lecturaBreu = this.state.tempsQuaresmaRams.lecturaBreuTercia;
              this.TERCIA.respV = this.state.tempsQuaresmaRams.respVTercia;
              this.TERCIA.respR = this.state.tempsQuaresmaRams.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.tempsQuaresmaRams.citaLBSexta;
              this.SEXTA.lecturaBreu = this.state.tempsQuaresmaRams.lecturaBreuSexta;
              this.SEXTA.respV = this.state.tempsQuaresmaRams.respVSexta;
              this.SEXTA.respR = this.state.tempsQuaresmaRams.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = this.state.tempsQuaresmaRams.citaLBNona;
              this.NONA.lecturaBreu = this.state.tempsQuaresmaRams.lecturaBreuNona;
              this.NONA.respV = this.state.tempsQuaresmaRams.respVNona;
              this.NONA.respR = this.state.tempsQuaresmaRams.respRNona;
              break;
          }
          break;
        case GLOBAL.Q_SET_SANTA:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.tempsQuaresmaSetSanta.citaLBTercia;
              this.TERCIA.lecturaBreu = this.state.tempsQuaresmaSetSanta.lecturaBreuTercia;
              this.TERCIA.respV = this.state.tempsQuaresmaSetSanta.respVTercia;
              this.TERCIA.respR = this.state.tempsQuaresmaSetSanta.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.tempsQuaresmaSetSanta.citaLBSexta;
              this.SEXTA.lecturaBreu = this.state.tempsQuaresmaSetSanta.lecturaBreuSexta;
              this.SEXTA.respV = this.state.tempsQuaresmaSetSanta.respVSexta;
              this.SEXTA.respR = this.state.tempsQuaresmaSetSanta.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = this.state.tempsQuaresmaSetSanta.citaLBNona;
              this.NONA.lecturaBreu = this.state.tempsQuaresmaSetSanta.lecturaBreuNona;
              this.NONA.respV = this.state.tempsQuaresmaSetSanta.respVNona;
              this.NONA.respR = this.state.tempsQuaresmaSetSanta.respRNona;
              break;
          }
          break;
        case GLOBAL.Q_TRIDU:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = liturgyMasters.PartsOfEasterTriduum.citaLectBreuTercia;
              this.TERCIA.lecturaBreu = liturgyMasters.PartsOfEasterTriduum.lecturaBreuTercia;
              this.TERCIA.respV = liturgyMasters.PartsOfEasterTriduum.respVTercia;
              this.TERCIA.respR = liturgyMasters.PartsOfEasterTriduum.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = liturgyMasters.PartsOfEasterTriduum.citaLectBreuSexta;
              this.SEXTA.lecturaBreu = liturgyMasters.PartsOfEasterTriduum.lecturaBreuSexta;
              this.SEXTA.respV = liturgyMasters.PartsOfEasterTriduum.respVSexta;
              this.SEXTA.respR = liturgyMasters.PartsOfEasterTriduum.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = liturgyMasters.PartsOfEasterTriduum.citaLectBreuNona;
              this.NONA.lecturaBreu = liturgyMasters.PartsOfEasterTriduum.lecturaBreuNona;
              this.NONA.respV = liturgyMasters.PartsOfEasterTriduum.respVNona;
              this.NONA.respR = liturgyMasters.PartsOfEasterTriduum.respRNona;
              break;
          }
          break;
        case GLOBAL.P_OCTAVA:
          this.TERCIA.respV = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
          this.TERCIA.respR = "Alegrem-nos i celebrem-lo, al·leluia.";

          this.SEXTA.respV = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
          this.SEXTA.respR = "Alegrem-nos i celebrem-lo, al·leluia.";

          this.NONA.respV = "Avui és el dia en què ha obrat el Senyor, al·leluia.";
          this.NONA.respR = "Alegrem-nos i celebrem-lo, al·leluia.";
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.tempsPasquaOct.citaLBTercia;
              this.TERCIA.lecturaBreu = this.state.tempsPasquaOct.lecturaBreuTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.tempsPasquaOct.citaLBSexta;
              this.SEXTA.lecturaBreu = this.state.tempsPasquaOct.lecturaBreuSexta;
              break;
            case 'Nona':
              this.NONA.vers = this.state.tempsPasquaOct.citaLBNona;
              this.NONA.lecturaBreu = this.state.tempsPasquaOct.lecturaBreuNona;
              break;
          }
          break;
        case GLOBAL.P_SETMANES:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.tempsPasquaSetmanes.citaLBTercia;
              this.TERCIA.lecturaBreu = this.state.tempsPasquaSetmanes.lecturaBreuTercia;
              this.TERCIA.respV = this.state.tempsPasquaSetmanes.respVTercia;
              this.TERCIA.respR = this.state.tempsPasquaSetmanes.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.tempsPasquaSetmanes.citaLBSexta;
              this.SEXTA.lecturaBreu = this.state.tempsPasquaSetmanes.lecturaBreuSexta;
              this.SEXTA.respV = this.state.tempsPasquaSetmanes.respVSexta;
              this.SEXTA.respR = this.state.tempsPasquaSetmanes.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = this.state.tempsPasquaSetmanes.citaLBNona;
              this.NONA.lecturaBreu = this.state.tempsPasquaSetmanes.lecturaBreuNona;
              this.NONA.respV = this.state.tempsPasquaSetmanes.respVNona;
              this.NONA.respR = this.state.tempsPasquaSetmanes.respRNona;
              break;
          }
          break;
        case GLOBAL.A_SETMANES:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = this.state.tempsAdventSetmanes.citaLBTercia;
              this.TERCIA.lecturaBreu = this.state.tempsAdventSetmanes.lecturaBreuTercia;
              this.TERCIA.respV = this.state.tempsAdventSetmanes.respVTercia;
              this.TERCIA.respR = this.state.tempsAdventSetmanes.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = this.state.tempsAdventSetmanes.citaLBSexta;
              this.SEXTA.lecturaBreu = this.state.tempsAdventSetmanes.lecturaBreuSexta;
              this.SEXTA.respV = this.state.tempsAdventSetmanes.respVSexta;
              this.SEXTA.respR = this.state.tempsAdventSetmanes.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = this.state.tempsAdventSetmanes.citaLBNona;
              this.NONA.lecturaBreu = this.state.tempsAdventSetmanes.lecturaBreuNona;
              this.NONA.respV = this.state.tempsAdventSetmanes.respVNona;
              this.NONA.respR = this.state.tempsAdventSetmanes.respRNona;
              break;
          }
          break;
        case GLOBAL.A_FERIES:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = liturgyMasters.AdventFairDaysParts.citaLBTercia;
              this.TERCIA.lecturaBreu = liturgyMasters.AdventFairDaysParts.lecturaBreuTercia;
              this.TERCIA.respV = liturgyMasters.AdventFairDaysParts.respVTercia;
              this.TERCIA.respR = liturgyMasters.AdventFairDaysParts.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = liturgyMasters.AdventFairDaysParts.citaLBSexta;
              this.SEXTA.lecturaBreu = liturgyMasters.AdventFairDaysParts.lecturaBreuSexta;
              this.SEXTA.respV = liturgyMasters.AdventFairDaysParts.respVSexta;
              this.SEXTA.respR = liturgyMasters.AdventFairDaysParts.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = liturgyMasters.AdventFairDaysParts.citaLBNona;
              this.NONA.lecturaBreu = liturgyMasters.AdventFairDaysParts.lecturaBreuNona;
              this.NONA.respV = liturgyMasters.AdventFairDaysParts.respVNona;
              this.NONA.respR = liturgyMasters.AdventFairDaysParts.respRNona;
              break;
          }
          break;
        case GLOBAL.N_OCTAVA:
          switch (HM) {
            case 'Tèrcia':
              this.TERCIA.vers = liturgyMasters.ChristmasWhenOctaveParts.citaLectBreuTercia;
              this.TERCIA.lecturaBreu = liturgyMasters.ChristmasWhenOctaveParts.lecturaBreuTercia;
              this.TERCIA.respV = liturgyMasters.ChristmasWhenOctaveParts.respVTercia;
              this.TERCIA.respR = liturgyMasters.ChristmasWhenOctaveParts.respRTercia;
              break;
            case 'Sexta':
              this.SEXTA.vers = liturgyMasters.ChristmasWhenOctaveParts.citaLectBreuSexta;
              this.SEXTA.lecturaBreu = liturgyMasters.ChristmasWhenOctaveParts.lecturaBreuSexta;
              this.SEXTA.respV = liturgyMasters.ChristmasWhenOctaveParts.respVSexta;
              this.SEXTA.respR = liturgyMasters.ChristmasWhenOctaveParts.respRSexta;
              break;
            case 'Nona':
              this.NONA.vers = liturgyMasters.ChristmasWhenOctaveParts.citaLectBreuNona;
              this.NONA.lecturaBreu = liturgyMasters.ChristmasWhenOctaveParts.lecturaBreuNona;
              this.NONA.respV = liturgyMasters.ChristmasWhenOctaveParts.respVNona;
              this.NONA.respR = liturgyMasters.ChristmasWhenOctaveParts.respRNona;
              break;
          }
          break;
        case GLOBAL.N_ABANS:
          if(LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13){
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.vers = liturgyMasters.ChristmasBeforeEpiphanyParts.citaLBTercia;
                this.TERCIA.lecturaBreu = liturgyMasters.ChristmasBeforeEpiphanyParts.lecturaBreuTercia;
                this.TERCIA.respV = liturgyMasters.ChristmasBeforeEpiphanyParts.respVTercia;
                this.TERCIA.respR = liturgyMasters.ChristmasBeforeEpiphanyParts.respRTercia;
                break;
              case 'Sexta':
                this.SEXTA.vers = liturgyMasters.ChristmasBeforeEpiphanyParts.citaLBSexta;
                this.SEXTA.lecturaBreu = liturgyMasters.ChristmasBeforeEpiphanyParts.lecturaBreuSexta;
                this.SEXTA.respV = liturgyMasters.ChristmasBeforeEpiphanyParts.respVSexta;
                this.SEXTA.respR = liturgyMasters.ChristmasBeforeEpiphanyParts.respRSexta;
                break;
              case 'Nona':
                this.NONA.vers = liturgyMasters.ChristmasBeforeEpiphanyParts.citaLBNona;
                this.NONA.lecturaBreu = liturgyMasters.ChristmasBeforeEpiphanyParts.lecturaBreuNona;
                this.NONA.respV = liturgyMasters.ChristmasBeforeEpiphanyParts.respVNona;
                this.NONA.respR = liturgyMasters.ChristmasBeforeEpiphanyParts.respRNona;
                break;
            }
          }
          break;
      }
    }
    else{
      switch (HM) {
        case 'Tèrcia':
          this.TERCIA.vers = CEL.vers;
          this.TERCIA.lecturaBreu = CEL.lecturaBreu;
          this.TERCIA.respV = CEL.respV;
          this.TERCIA.respR = CEL.respR;
          break;
        case 'Sexta':
          this.SEXTA.vers = CEL.vers;
          this.SEXTA.lecturaBreu = CEL.lecturaBreu;
          this.SEXTA.respV = CEL.respV;
          this.SEXTA.respR = CEL.respR;
          break;
        case 'Nona':
          this.NONA.vers = CEL.vers;
          this.NONA.lecturaBreu = CEL.lecturaBreu;
          this.NONA.respV = CEL.respV;
          this.NONA.respR = CEL.respR;
          break;
      }
    }
  }

  oracio(LT, weekDay, HM, CEL, date){
    if(CEL.oracio === '-'){
      switch(LT){
        case GLOBAL.O_ORDINARI:
          if(weekDay === 0){ //diumenge
            this.TERCIA.oracio = this.state.liturgyMasters.PrayersOfOrdinaryTime.oracio;
            this.SEXTA.oracio = this.state.liturgyMasters.PrayersOfOrdinaryTime.oracio;
            this.NONA.oracio = this.state.liturgyMasters.PrayersOfOrdinaryTime.oracio;
          }
          else{ //no diumenge
            switch (HM) {
              case 'Tèrcia':
                this.TERCIA.oracio = this.state.salteriComuHora.oraTercia;
                break;
              case 'Sexta':
                this.SEXTA.oracio = this.state.salteriComuHora.oraSexta;
                break;
              case 'Nona':
                this.NONA.oracio = this.state.salteriComuHora.oraNona;
                break;
            }
          }
          break;
        case GLOBAL.Q_CENDRA:
          this.TERCIA.oracio = this.state.tempsQuaresmaCendra.oraFiLaudes;
          this.SEXTA.oracio = this.state.tempsQuaresmaCendra.oraFiLaudes;
          this.NONA.oracio = this.state.tempsQuaresmaCendra.oraFiLaudes;
          break;
        case GLOBAL.Q_SETMANES:
          this.TERCIA.oracio = this.state.tempsQuaresmaVSetmanes.oraFiLaudes;
          this.SEXTA.oracio = this.state.tempsQuaresmaVSetmanes.oraFiLaudes;
          this.NONA.oracio = this.state.tempsQuaresmaVSetmanes.oraFiLaudes;
          break;
        case GLOBAL.Q_DIUM_RAMS:
          this.TERCIA.oracio = this.state.tempsQuaresmaRams.oraFiLaudes;
          this.SEXTA.oracio = this.state.tempsQuaresmaRams.oraFiLaudes;
          this.NONA.oracio = this.state.tempsQuaresmaRams.oraFiLaudes;
          break;
        case GLOBAL.Q_SET_SANTA:
          this.TERCIA.oracio = this.state.tempsQuaresmaSetSanta.oraFiLaudes;
          this.SEXTA.oracio = this.state.tempsQuaresmaSetSanta.oraFiLaudes;
          this.NONA.oracio = this.state.tempsQuaresmaSetSanta.oraFiLaudes;
          break;
        case GLOBAL.Q_TRIDU:
          this.TERCIA.oracio = liturgyMasters.PartsOfEasterTriduum.oraFiMenor;
          this.SEXTA.oracio = liturgyMasters.PartsOfEasterTriduum.oraFiMenor;
          this.NONA.oracio = liturgyMasters.PartsOfEasterTriduum.oraFiMenor;
          break;
        case GLOBAL.P_OCTAVA:
          this.TERCIA.oracio = this.state.tempsPasquaOct.oraFiMenor;
          this.SEXTA.oracio = this.state.tempsPasquaOct.oraFiMenor;
          this.NONA.oracio = this.state.tempsPasquaOct.oraFiMenor;
          break;
        case GLOBAL.P_SETMANES:
          this.TERCIA.oracio = this.state.tempsPasquaSetmanes.oraFiLaudes;
          this.SEXTA.oracio = this.state.tempsPasquaSetmanes.oraFiLaudes;
          this.NONA.oracio = this.state.tempsPasquaSetmanes.oraFiLaudes;
          break;
        case GLOBAL.A_SETMANES:
          this.TERCIA.oracio = this.state.tempsAdventSetmanes.oraFiLaudes;
          this.SEXTA.oracio = this.state.tempsAdventSetmanes.oraFiLaudes;
          this.NONA.oracio = this.state.tempsAdventSetmanes.oraFiLaudes;
          break;
        case GLOBAL.A_FERIES:
          this.TERCIA.oracio = liturgyMasters.AdventFairDaysParts.oraFiLaudes;
          this.SEXTA.oracio = liturgyMasters.AdventFairDaysParts.oraFiLaudes;
          this.NONA.oracio = liturgyMasters.AdventFairDaysParts.oraFiLaudes;
          break;
        case GLOBAL.N_OCTAVA:
          this.TERCIA.oracio = liturgyMasters.ChristmasWhenOctaveParts.oraFiLaudes;
          this.SEXTA.oracio = liturgyMasters.ChristmasWhenOctaveParts.oraFiLaudes;
          this.NONA.oracio = liturgyMasters.ChristmasWhenOctaveParts.oraFiLaudes;
          break;
        case GLOBAL.N_ABANS:
          if(LT == GLOBAL.N_ABANS && date.getMonth() == 0 && date.getDate() != 13){
            this.TERCIA.oracio = liturgyMasters.ChristmasBeforeEpiphanyParts.oraFiLaudes;
            this.SEXTA.oracio = liturgyMasters.ChristmasBeforeEpiphanyParts.oraFiLaudes;
            this.NONA.oracio = liturgyMasters.ChristmasBeforeEpiphanyParts.oraFiLaudes;
          }
          break;
      }
    }
    else{
      switch (HM) {
        case 'Tèrcia':
          this.TERCIA.oracio = CEL.oracio;
          break;
        case 'Sexta':
          this.SEXTA.oracio = CEL.oracio;
          break;
        case 'Nona':
          this.NONA.oracio = CEL.oracio;
          break;
      }
    }
  }
}

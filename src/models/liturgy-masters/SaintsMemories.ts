import { HourCommonParts, Psalm, ReadingOfTheOffice, Responsory, ShortReading, ShortResponsory } from './CommonParts';
import CommonOffice from './CommonOffices';
import CelebrationInformation from '../hours-liturgy/CelebrationInformation';
import { CelebrationSpecificClassification } from '../../services/databaseEnums';

export default class SaintsMemories {
  static masterName: string = 'santsMemories';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

      this.celebration.diocese = databaseRow.Diocesis;
      this.celebration.category = databaseRow.Categoria;
      this.celebration.title = databaseRow.nomMemoria;
      this.celebration.description = databaseRow.infoMemoria;
      this.celebration.specificClassification =
        databaseRow.Diocesis === '-'
          ? CelebrationSpecificClassification.Generic
          : CelebrationSpecificClassification.Own;

      this.invitationAntiphon = databaseRow.Invitatori;

      this.officeLatinAnthem = databaseRow.himneOficiLlati;
      this.officeCatalanAnthem = databaseRow.himneOficiCat;

      this.officeFirstPsalm.antiphon = databaseRow.ant1Ofici;
      this.officeFirstPsalm.title = databaseRow.titol1Ofici;
      this.officeFirstPsalm.psalm = databaseRow.Salm1Ofici;
      this.officeFirstPsalm.hasGloryPrayer = databaseRow.gloriaOfici1 === '1';

      this.officeSecondPsalm.antiphon = databaseRow.ant2Ofici;
      this.officeSecondPsalm.title = databaseRow.titol2Ofici;
      this.officeSecondPsalm.psalm = databaseRow.Salm2Ofici;
      this.officeSecondPsalm.hasGloryPrayer = databaseRow.gloriaOfici2 === '1';

      this.officeThirdPsalm.antiphon = databaseRow.ant3Ofici;
      this.officeThirdPsalm.title = databaseRow.titol3Ofici;
      this.officeThirdPsalm.psalm = databaseRow.Salm3Ofici;
      this.officeThirdPsalm.hasGloryPrayer = databaseRow.gloriaOfici3 === '1';

      this.officeResponsory.versicle = databaseRow.respVOfici;
      this.officeResponsory.response = databaseRow.respROfici;

      this.officeFirstReading.reference = databaseRow.referencia1;
      this.officeFirstReading.quote = databaseRow.citaLect1Ofici;
      this.officeFirstReading.title = databaseRow.titolLect1Ofici;
      this.officeFirstReading.reading = databaseRow.lectura1;
      this.officeFirstReading.responsory.quote = databaseRow.citaResp1Ofici;
      this.officeFirstReading.responsory.firstPart = databaseRow.resp1Part1Ofici;
      this.officeFirstReading.responsory.secondPart = databaseRow.resp1Part2Ofici;
      this.officeFirstReading.responsory.thirdPart = databaseRow.resp1Part3Ofici;

      this.officeSecondReading.reference = databaseRow.referencia2Ofici;
      this.officeSecondReading.quote = databaseRow.citaLec2Ofici;
      this.officeSecondReading.title = databaseRow.titolLect2Ofici;
      this.officeSecondReading.reading = databaseRow.lectura2;
      this.officeSecondReading.responsory.quote = databaseRow.citaResp2Ofici;
      this.officeSecondReading.responsory.firstPart = databaseRow.resp2Part1Ofici;
      this.officeSecondReading.responsory.secondPart = databaseRow.resp2Part2Ofici;
      this.officeSecondReading.responsory.thirdPart = databaseRow.resp2Part3Ofici;

      this.officeFinalPrayer = databaseRow.oraFi;

      this.laudesLatinAnthem = databaseRow.himneLaudesLlati;
      this.laudesCatalanAnthem = databaseRow.himneLaudesCat;

      this.laudesFirstPsalm.antiphon = databaseRow.ant1Laudes;
      this.laudesFirstPsalm.title = databaseRow.titol1Laudes;
      this.laudesFirstPsalm.psalm = databaseRow.Salm1Laudes;
      this.laudesFirstPsalm.hasGloryPrayer = databaseRow.gloria1Laudes === '1';

      this.laudesSecondPsalm.antiphon = databaseRow.ant2Laudes;
      this.laudesSecondPsalm.title = databaseRow.titol2Laudes;
      this.laudesSecondPsalm.psalm = databaseRow.Salm2Laudes;
      this.laudesSecondPsalm.hasGloryPrayer = databaseRow.gloria2Laudes === '1';

      this.laudesThirdPsalm.antiphon = databaseRow.ant3Laudes;
      this.laudesThirdPsalm.title = databaseRow.titol3Laudes;
      this.laudesThirdPsalm.psalm = databaseRow.Salm3Laudes;
      this.laudesThirdPsalm.hasGloryPrayer = databaseRow.gloria3Laudes === '1';

      this.laudesShortReading.quote = databaseRow.citaLBLaudes;
      this.laudesShortReading.shortReading = databaseRow.lecturaBreuLaudes;

      this.laudesShortResponsory.firstPart = databaseRow.respBreuLaudes1;
      this.laudesShortResponsory.secondPart = databaseRow.respBreuLaudes2;
      this.laudesShortResponsory.thirdPart = databaseRow.respBreuLaudes3;

      this.laudesEvangelicalAntiphon = databaseRow.antZacaries;
      this.laudesPrayers = databaseRow.pregariesLaudes;
      this.laudesFinalPrayer = databaseRow.oraFi;

      this.hoursLatinAnthem = databaseRow.HimneMenorLlat;
      this.hoursCatalanAnthem = databaseRow.HimneMenorCat;

      this.hoursFirstPsalm.title = databaseRow.titol1Menor;
      this.hoursFirstPsalm.psalm = databaseRow.salm1Menor;
      this.hoursFirstPsalm.hasGloryPrayer = databaseRow.gloria1Menor === '1';

      this.hoursSecondPsalm.title = databaseRow.titol2Menor;
      this.hoursSecondPsalm.psalm = databaseRow.salm2Menor;
      this.hoursSecondPsalm.hasGloryPrayer = databaseRow.gloria2Menor === '1';

      this.hoursThirdPsalm.title = databaseRow.titol3Menor;
      this.hoursThirdPsalm.psalm = databaseRow.salm3Menor;
      this.hoursThirdPsalm.hasGloryPrayer = databaseRow.gloria3Menor === '1';

      this.thirdHourParts.antiphon = databaseRow.antMenorTer;
      this.thirdHourParts.shortReading.quote = databaseRow.citaLBTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.responsory.versicle = databaseRow.respVTercia;
      this.thirdHourParts.responsory.response = databaseRow.respRTercia;
      this.thirdHourParts.finalPrayer = databaseRow.OracioTercia;

      this.sixthHourParts.antiphon = databaseRow.antMenorSextA;
      this.sixthHourParts.shortReading.quote = databaseRow.citaLBSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.responsory.versicle = databaseRow.respVSexta;
      this.sixthHourParts.responsory.response = databaseRow.respRSexta;
      this.sixthHourParts.finalPrayer = databaseRow.OracioSexta;

      this.ninthHourParts.antiphon = databaseRow.antMenorNona;
      this.ninthHourParts.shortReading.quote = databaseRow.citaLBNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.responsory.versicle = databaseRow.respVNona;
      this.ninthHourParts.responsory.response = databaseRow.respRNona;
      this.ninthHourParts.finalPrayer = databaseRow.OracioNona;

      this.vespersLatinAnthem = databaseRow.himneVespresLlati;
      this.vespersCatalanAnthem = databaseRow.himneVespresCat;

      this.vespersFirstPsalm.antiphon = databaseRow.ant1Vespres;
      this.vespersFirstPsalm.title = databaseRow.titol1Vespres;
      this.vespersFirstPsalm.psalm = databaseRow.Salm1Vespres;
      this.vespersFirstPsalm.hasGloryPrayer = databaseRow.gloria1Vespres === '1';

      this.vespersSecondPsalm.antiphon = databaseRow.ant2Vespres;
      this.vespersSecondPsalm.title = databaseRow.titol2Vespres;
      this.vespersSecondPsalm.psalm = databaseRow.Salm2Vespres;
      this.vespersSecondPsalm.hasGloryPrayer = databaseRow.gloria2Vespres === '1';

      this.vespersThirdPsalm.antiphon = databaseRow.ant3Vespres;
      this.vespersThirdPsalm.title = databaseRow.titol3Vespres;
      this.vespersThirdPsalm.psalm = databaseRow.Salm3Vespres;
      this.vespersThirdPsalm.hasGloryPrayer = databaseRow.gloria3Vespres === '1';

      this.vespersShortReading.quote = databaseRow.citaLBVespres;
      this.vespersShortReading.shortReading = databaseRow.lecturaBreuVespres;

      this.vespersShortResponsory.firstPart = databaseRow.respBreuVespres1;
      this.vespersShortResponsory.secondPart = databaseRow.respBreuVespres2;
      this.vespersShortResponsory.thirdPart = databaseRow.respBreuVespres3;

      this.vespersPrayers = databaseRow.pregariesVespres;
      this.vespersEvangelicalAntiphon = databaseRow.antMaria;
      this.vespersFinalPrayer = databaseRow.oraFi;
    }
  }

  id: number;
  celebration: CelebrationInformation = new CelebrationInformation();
  invitationAntiphon: string;
  officeLatinAnthem: string;
  officeCatalanAnthem: string;
  officeFirstPsalm: Psalm = new Psalm();
  officeSecondPsalm: Psalm = new Psalm();
  officeThirdPsalm: Psalm = new Psalm();
  officeResponsory: Responsory = new Responsory();
  officeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeFinalPrayer: string;
  laudesLatinAnthem: string;
  laudesCatalanAnthem: string;
  laudesFirstPsalm: Psalm = new Psalm();
  laudesSecondPsalm: Psalm = new Psalm();
  laudesThirdPsalm: Psalm = new Psalm();
  laudesShortReading: ShortReading = new ShortReading();
  laudesShortResponsory: ShortResponsory = new ShortResponsory();
  laudesEvangelicalAntiphon: string;
  laudesPrayers: string;
  laudesFinalPrayer: string;
  hoursLatinAnthem: string;
  hoursCatalanAnthem: string;
  hoursFirstPsalm: Psalm = new Psalm();
  hoursSecondPsalm: Psalm = new Psalm();
  hoursThirdPsalm: Psalm = new Psalm();
  thirdHourParts: HourCommonParts = new HourCommonParts();
  sixthHourParts: HourCommonParts = new HourCommonParts();
  ninthHourParts: HourCommonParts = new HourCommonParts();
  vespersLatinAnthem: string;
  vespersCatalanAnthem: string;
  vespersShortReading: ShortReading = new ShortReading();
  vespersFirstPsalm: Psalm = new Psalm();
  vespersSecondPsalm: Psalm = new Psalm();
  vespersThirdPsalm: Psalm = new Psalm();
  vespersShortResponsory: ShortResponsory = new ShortResponsory();
  vespersEvangelicalAntiphon: string;
  vespersPrayers: string;
  vespersFinalPrayer: string;
  commonOffices: CommonOffice;
  commonOfficesForFirstVespers: CommonOffice;
}

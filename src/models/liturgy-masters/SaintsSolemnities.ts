import { HourCommonParts, Psalm, ReadingOfTheOffice, Responsory, ShortReading, ShortResponsory } from './CommonParts';
import CommonOffice from './CommonOffices';
import CelebrationInformation from '../hours-liturgy/CelebrationInformation';
import { CelebrationSpecificClassification, CelebrationType } from '../../services/databaseEnums';
import Solemnity from './Solemnity';

export default class SaintsSolemnities extends Solemnity {
  static masterName: string = 'santsSolemnitats';

  constructor(databaseRow: any = undefined) {
    super();

    if (databaseRow) {
      this.id = databaseRow.id;

      this.celebration.specificClassification = this.getSpecificClassificationByCelebrationType(
        databaseRow.Precedencia,
        databaseRow.Cat,
        databaseRow.Diocesis,
      );
      this.celebration.diocese = databaseRow.Diocesis;
      this.celebration.category = databaseRow.Categoria;
      this.celebration.title = databaseRow.nomMemoria;
      this.celebration.description = databaseRow.infoMemoria;

      this.firstVespersLatinAnthem = databaseRow.himneVespres1Llati;
      this.firstVespersCatalanAnthem = databaseRow.himneVespres1Cat;

      this.firstVespersFirstPsalm.antiphon = databaseRow.ant1Vespres1;
      this.firstVespersFirstPsalm.title = databaseRow.titol1Vespres1;
      this.firstVespersFirstPsalm.psalm = databaseRow.text1Vespres1;
      this.firstVespersFirstPsalm.hasGloryPrayer = databaseRow.gloria1Vespres1 === '1';

      this.firstVespersSecondPsalm.antiphon = databaseRow.ant2Vespres1;
      this.firstVespersSecondPsalm.title = databaseRow.titol2Vespres1;
      this.firstVespersSecondPsalm.psalm = databaseRow.text2Vespres1;
      this.firstVespersSecondPsalm.hasGloryPrayer = databaseRow.gloria2Vespres1 === '1';

      this.firstVespersThirdPsalm.antiphon = databaseRow.ant3Vespres1;
      this.firstVespersThirdPsalm.title = databaseRow.titol3Vespres1;
      this.firstVespersThirdPsalm.comment = databaseRow.cita3Vespres1;
      this.firstVespersThirdPsalm.psalm = databaseRow.text3Vespres1;
      this.firstVespersThirdPsalm.hasGloryPrayer = databaseRow.gloria3Vespres1 === '1';

      this.firstVespersShortReading.quote = databaseRow.citaLBVespres1;
      this.firstVespersShortReading.shortReading = databaseRow.lecturaBreuVespres1;

      this.firstVespersShortResponsory.firstPart = databaseRow.respBreuVespres1Part1;
      this.firstVespersShortResponsory.secondPart = databaseRow.respBreuVespres1Part2;
      this.firstVespersShortResponsory.thirdPart = databaseRow.respBreuVespres1Part3;

      this.firstVespersEvangelicalAntiphon = databaseRow.antMaria1;
      this.firstVespersPrayers = databaseRow.pregariesVespres1;
      this.firstVespersFinalPrayer = databaseRow.oraFiVespres1;

      this.invitationAntiphon = databaseRow.antInvitatori;

      this.officeLatinAnthem = databaseRow.himneOficiLlati;
      this.officeCatalanAnthem = databaseRow.himneOficiCat;

      this.officeFirstPsalm.antiphon = databaseRow.ant1Ofici;
      this.officeFirstPsalm.title = databaseRow.titolSalm1Ofici;
      this.officeFirstPsalm.psalm = databaseRow.salm1Ofici;
      this.officeFirstPsalm.hasGloryPrayer = databaseRow.gloriaOfici1 === '1';

      this.officeSecondPsalm.antiphon = databaseRow.ant2Ofici;
      this.officeSecondPsalm.title = databaseRow.titolSalm2Ofici;
      this.officeSecondPsalm.psalm = databaseRow.salm2Ofici;
      this.officeSecondPsalm.hasGloryPrayer = databaseRow.gloriaOfici2 === '1';

      this.officeThirdPsalm.antiphon = databaseRow.ant3Ofici;
      this.officeThirdPsalm.title = databaseRow.titolSalm3Ofici;
      this.officeThirdPsalm.psalm = databaseRow.salm3Ofici;
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

      this.officeFinalPrayer = databaseRow.oraFiOfici;

      this.laudesLatinAnthem = databaseRow.himneLaudesLlati;
      this.laudesCatalanAnthem = databaseRow.himneLaudesCat;

      this.laudesFirstAntiphon = databaseRow.ant1Laudes;
      this.laudesSecondAntiphon = databaseRow.ant2Laudes;
      this.laudesThirdAntiphon = databaseRow.ant3Laudes;

      this.laudesShortReading.quote = databaseRow.citaLBLaudes;
      this.laudesShortReading.shortReading = databaseRow.lecturaBreuLaudes;

      this.laudesShortResponsory.firstPart = databaseRow.resp2Part1Laudes;
      this.laudesShortResponsory.secondPart = databaseRow.resp2Part2Laudes;
      this.laudesShortResponsory.thirdPart = databaseRow.resp2Part3Laudes;

      this.laudesEvangelicalAntiphon = databaseRow.antZacaries;
      this.laudesPrayers = databaseRow.pregariesLaudes;
      this.laudesFinalPrayer = databaseRow.oraFiLaudes;

      this.hoursFirstPsalm.title = databaseRow.titolSalm1;
      this.hoursFirstPsalm.psalm = databaseRow.salm1Menor;
      this.hoursFirstPsalm.hasGloryPrayer = databaseRow.gloriaSalm1 === '1';

      this.hoursSecondPsalm.title = databaseRow.titolSalm2;
      this.hoursSecondPsalm.psalm = databaseRow.salm2Menor;
      this.hoursSecondPsalm.hasGloryPrayer = databaseRow.gloriaSalm2 === '1';

      this.hoursThirdPsalm.title = databaseRow.titolSalm3;
      this.hoursThirdPsalm.psalm = databaseRow.salm3Menor;
      this.hoursThirdPsalm.hasGloryPrayer = databaseRow.gloriaSaml3 === '1';

      this.thirdHourParts.antiphon = databaseRow.antMenorTercia;
      this.thirdHourParts.shortReading.quote = databaseRow.citaLBTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.responsory.versicle = databaseRow.responsoriVTercia;
      this.thirdHourParts.responsory.response = databaseRow.responsoriRTercia;
      this.thirdHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.sixthHourParts.antiphon = databaseRow.antMenorSexta;
      this.sixthHourParts.shortReading.quote = databaseRow.citaLBSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.responsory.versicle = databaseRow.responsoriVSexta;
      this.sixthHourParts.responsory.response = databaseRow.responsoriRSexta;
      this.sixthHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.ninthHourParts.antiphon = databaseRow.antMenorNona;
      this.ninthHourParts.shortReading.quote = databaseRow.citaLBNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.responsory.versicle = databaseRow.responsoriVNona;
      this.ninthHourParts.responsory.response = databaseRow.responsoriRNona;
      this.ninthHourParts.finalPrayer = databaseRow.oraFiMenor;

      this.secondVespersLatinAnthem = databaseRow.himneVespres2Llati;
      this.secondVespersCatalanAnthem = databaseRow.himneVespres2Cat;

      this.secondVespersFirstPsalm.antiphon = databaseRow.ant1Vespres2;
      this.secondVespersFirstPsalm.title = databaseRow.titol1Vespres2;
      this.secondVespersFirstPsalm.psalm = databaseRow.text1Vespres2;
      this.secondVespersFirstPsalm.hasGloryPrayer = databaseRow.gloria1Vespres2 === '1';

      this.secondVespersSecondPsalm.antiphon = databaseRow.ant2Vespres2;
      this.secondVespersSecondPsalm.title = databaseRow.titol2Vespres2;
      this.secondVespersSecondPsalm.psalm = databaseRow.text2Vespres2;
      this.secondVespersSecondPsalm.hasGloryPrayer = databaseRow.gloria2Vespres2 === '1';

      this.secondVespersThirdPsalm.antiphon = databaseRow.ant3Vespres2;
      this.secondVespersThirdPsalm.title = databaseRow.titol3Vespres2;
      this.secondVespersThirdPsalm.psalm = databaseRow.text3Vespres2;
      this.secondVespersThirdPsalm.hasGloryPrayer = databaseRow.gloria3Vespres2 === '1';

      this.secondVespersShortReading.quote = databaseRow.citaLBVespres2;
      this.secondVespersShortReading.shortReading = databaseRow.lecturaBreuVespres2;

      this.secondVespersShortResponsory.firstPart = databaseRow.respBreuVespres2Part1;
      this.secondVespersShortResponsory.secondPart = databaseRow.respBreuVespres2Part2;
      this.secondVespersShortResponsory.thirdPart = databaseRow.respBreuVespres2Part3;

      this.secondVespersEvangelicalAntiphon = databaseRow.antMaria2;
      this.secondVespersPrayers = databaseRow.pregariesVespres2;
      this.secondVespersFinalPrayer = databaseRow.oraFiVespres2;
    }
  }

  private getSpecificClassificationByCelebrationType(precedence: string, celebrationType: string, diocese: string) {
    let specificClassification: CelebrationSpecificClassification;
    if (celebrationType === CelebrationType.Solemnity || celebrationType === CelebrationType.Festivity) {
      specificClassification = this.getSpecificClassification(precedence);
    } else {
      specificClassification =
        diocese === '-' ? CelebrationSpecificClassification.Generic : CelebrationSpecificClassification.Own;
    }
    return specificClassification;
  }

  id: number;
  celebration: CelebrationInformation = new CelebrationInformation();
  firstVespersLatinAnthem: string;
  firstVespersCatalanAnthem: string;
  firstVespersFirstPsalm: Psalm = new Psalm();
  firstVespersSecondPsalm: Psalm = new Psalm();
  firstVespersThirdPsalm: Psalm = new Psalm();
  firstVespersShortReading: ShortReading = new ShortReading();
  firstVespersShortResponsory: ShortResponsory = new ShortResponsory();
  firstVespersEvangelicalAntiphon: string;
  firstVespersPrayers: string;
  firstVespersFinalPrayer: string;
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
  laudesFirstAntiphon: string;
  laudesSecondAntiphon: string;
  laudesThirdAntiphon: string;
  laudesShortReading: ShortReading = new ShortReading();
  laudesShortResponsory: ShortResponsory = new ShortResponsory();
  laudesEvangelicalAntiphon: string;
  laudesPrayers: string;
  laudesFinalPrayer: string;
  hoursFirstPsalm: Psalm = new Psalm();
  hoursSecondPsalm: Psalm = new Psalm();
  hoursThirdPsalm: Psalm = new Psalm();
  thirdHourParts: HourCommonParts = new HourCommonParts();
  sixthHourParts: HourCommonParts = new HourCommonParts();
  ninthHourParts: HourCommonParts = new HourCommonParts();
  secondVespersLatinAnthem: string;
  secondVespersCatalanAnthem: string;
  secondVespersFirstPsalm: Psalm = new Psalm();
  secondVespersSecondPsalm: Psalm = new Psalm();
  secondVespersThirdPsalm: Psalm = new Psalm();
  secondVespersShortReading: ShortReading = new ShortReading();
  secondVespersShortResponsory: ShortResponsory = new ShortResponsory();
  secondVespersEvangelicalAntiphon: string;
  secondVespersPrayers: string;
  secondVespersFinalPrayer: string;
  commonOffices: CommonOffice;
  commonOfficesForFirstVespers: CommonOffice;
}

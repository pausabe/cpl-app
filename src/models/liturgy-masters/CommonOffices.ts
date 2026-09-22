import { HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory } from './CommonParts';
import CelebrationInformation from '../hours-liturgy/CelebrationInformation';

export default class CommonOffice {
  static masterName: string = 'OficisComuns';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

      this.celebration.category = databaseRow.Categoria;
      this.celebration.description = databaseRow.nomMemoria;

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
      this.firstVespersThirdPsalm.psalm = databaseRow.text3Vespres1;
      this.firstVespersThirdPsalm.hasGloryPrayer = databaseRow.gloria3Vespres1 === '1';

      this.firstVespersShortReading.quote = databaseRow.citaLBVespres1;
      this.firstVespersShortReading.shortReading = databaseRow.lecturaBreuVespres1;

      this.firstVespersShortResponsory.firstPart = databaseRow.respBreuVespres1Part1;
      this.firstVespersShortResponsory.secondPart = databaseRow.respBreuVespres1Part2;
      this.firstVespersShortResponsory.thirdPart = databaseRow.respBreuVespres1Part3;

      this.firstVespersEvangelicalAntiphon = databaseRow.antMaria1A;
      this.firstVespersPrayers = databaseRow.pregariesVespres1;

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

      this.thirdHourParts.antiphon = databaseRow.antMenorTer;
      this.thirdHourParts.shortReading.quote = databaseRow.citaLBTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.responsory.versicle = databaseRow.respVTercia;
      this.thirdHourParts.responsory.response = databaseRow.respRTercia;

      this.sixthHourParts.antiphon = databaseRow.antMenorSextA;
      this.sixthHourParts.shortReading.quote = databaseRow.citaLBSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.responsory.versicle = databaseRow.respVSexta;
      this.sixthHourParts.responsory.response = databaseRow.respRSexta;

      this.ninthHourParts.antiphon = databaseRow.antMenorNona;
      this.ninthHourParts.shortReading.quote = databaseRow.citaLBNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.responsory.versicle = databaseRow.respVNona;
      this.ninthHourParts.responsory.response = databaseRow.respRNona;

      this.secondVespersLatinAnthem = databaseRow.himneVespresLlati;
      this.secondVespersCatalanAnthem = databaseRow.himneVespresCat;

      this.secondVespersFirstPsalm.antiphon = databaseRow.ant1Vespres;
      this.secondVespersFirstPsalm.title = databaseRow.titol1Vespres;
      this.secondVespersFirstPsalm.psalm = databaseRow.Salm1Vespres;
      this.secondVespersFirstPsalm.hasGloryPrayer = databaseRow.gloria1Vespres === '1';

      this.secondVespersSecondPsalm.antiphon = databaseRow.ant2Vespres;
      this.secondVespersSecondPsalm.title = databaseRow.titol2Vespres;
      this.secondVespersSecondPsalm.psalm = databaseRow.Salm2Vespres;
      this.secondVespersSecondPsalm.hasGloryPrayer = databaseRow.gloria2Vespres === '1';

      this.secondVespersThirdPsalm.antiphon = databaseRow.ant3Vespres;
      this.secondVespersThirdPsalm.title = databaseRow.titol3Vespres;
      this.secondVespersThirdPsalm.psalm = databaseRow.Salm3Vespres;
      this.secondVespersThirdPsalm.hasGloryPrayer = databaseRow.gloria3Vespres === '1';

      this.secondVespersShortReading.quote = databaseRow.citaLBVespres;
      this.secondVespersShortReading.shortReading = databaseRow.lecturaBreuVespres;

      this.secondVespersShortResponsory.firstPart = databaseRow.respBreuVespres1;
      this.secondVespersShortResponsory.secondPart = databaseRow.respBreuVespres2;
      this.secondVespersShortResponsory.thirdPart = databaseRow.respBreuVespres3;

      this.secondVespersEvangelicalAntiphon = databaseRow.antMaria;
      this.secondVespersPrayers = databaseRow.pregariesVespres;
    }
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
  laudesLatinAnthem: string;
  laudesCatalanAnthem: string;
  laudesFirstPsalm: Psalm = new Psalm();
  laudesSecondPsalm: Psalm = new Psalm();
  laudesThirdPsalm: Psalm = new Psalm();
  laudesShortReading: ShortReading = new ShortReading();
  laudesShortResponsory: ShortResponsory = new ShortResponsory();
  laudesEvangelicalAntiphon: string;
  laudesPrayers: string;
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
}

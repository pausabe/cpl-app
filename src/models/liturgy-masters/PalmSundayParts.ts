import { HourCommonParts, ReadingOfTheOffice, Responsory, ShortReading, ShortResponsory } from './CommonParts';

export default class PalmSundayParts {
  static masterName: string = 'tempsQuaresmaRams';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

      this.firstVespersFirstAntiphon = databaseRow.ant1Vespres1;
      this.firstVespersSecondAntiphon = databaseRow.ant2Vespres1;
      this.firstVespersThirdAntiphon = databaseRow.ant3Vespres1;
      this.firstVespersShortReading.quote = databaseRow.citaLBVespres;
      this.firstVespersShortReading.shortReading = databaseRow.lecturaBreuVespres;
      this.firstVespersShortResponsory.firstPart = databaseRow.respBreuVespres1;
      this.firstVespersShortResponsory.secondPart = databaseRow.respBreuVespres2;
      this.firstVespersShortResponsory.thirdPart = databaseRow.respBreuVespres3;
      this.firstVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A;
      this.firstVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B;
      this.firstVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C;
      this.firstVespersPrayers = databaseRow.pregariesVespres1;
      this.firstVespersFinalPrayer = databaseRow.oraFiVespres1;

      this.officeResponsory.versicle = databaseRow.respVOfici;
      this.officeResponsory.response = databaseRow.respROfici;

      this.officeFirstReading.reference = databaseRow.referencia1;
      this.officeFirstReading.quote = databaseRow.cita1;
      this.officeFirstReading.title = databaseRow.titol1;
      this.officeFirstReading.reading = databaseRow.lectura1;
      this.officeFirstReading.responsory.quote = databaseRow.citaResp1;
      this.officeFirstReading.responsory.firstPart = databaseRow.resp1Part1;
      this.officeFirstReading.responsory.secondPart = databaseRow.resp1Part2;
      this.officeFirstReading.responsory.thirdPart = databaseRow.resp1Part3;

      this.officeSecondReading.reference = databaseRow.referencia2;
      this.officeSecondReading.quote = databaseRow.cita2;
      this.officeSecondReading.title = databaseRow.titol2;
      this.officeSecondReading.reading = databaseRow.lectura2;
      this.officeSecondReading.responsory.quote = databaseRow.versResp2;
      this.officeSecondReading.responsory.firstPart = databaseRow.resp2Part1;
      this.officeSecondReading.responsory.secondPart = databaseRow.resp2Part2;
      this.officeSecondReading.responsory.thirdPart = databaseRow.resp2Part3;

      this.laudesFirstAntiphon = databaseRow.ant1Laudes;
      this.laudesSecondAntiphon = databaseRow.ant2Laudes;
      this.laudesThirdAntiphon = databaseRow.ant3Laudes;

      this.laudesShortReading.quote = databaseRow.citaLBLaudes;
      this.laudesShortReading.shortReading = databaseRow.lecturaBreuLaudes;

      this.laudesShortResponsory.firstPart = databaseRow.respBreu1Laudes;
      this.laudesShortResponsory.secondPart = databaseRow.respBreu2Laudes;
      this.laudesShortResponsory.thirdPart = databaseRow.respBreu3Laudes;

      this.laudesEvangelicalAntiphonYearA = databaseRow.antZacariesA;
      this.laudesEvangelicalAntiphonYearB = databaseRow.antZacariesB;
      this.laudesEvangelicalAntiphonYearC = databaseRow.antZacariesC;
      this.laudesPrayers = databaseRow.pregariesLaudes;
      this.laudesFinalPrayer = databaseRow.oraFiLaudes;

      this.thirdHourParts.shortReading.quote = databaseRow.citaLBTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.responsory.versicle = databaseRow.respVTercia;
      this.thirdHourParts.responsory.response = databaseRow.respRTercia;

      this.sixthHourParts.shortReading.quote = databaseRow.citaLBSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.responsory.versicle = databaseRow.respVSexta;
      this.sixthHourParts.responsory.response = databaseRow.respRSexta;

      this.ninthHourParts.shortReading.quote = databaseRow.citaLBNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.responsory.versicle = databaseRow.respVNona;
      this.ninthHourParts.responsory.response = databaseRow.respRNona;

      this.secondVespersFirstAntiphon = databaseRow.ant1Vespres2;
      this.secondVespersSecondAntiphon = databaseRow.ant2Vespres2;
      this.secondVespersThirdAntiphon = databaseRow.ant3Vespres2;
      this.secondVespersShortReading.quote = databaseRow.citaLBVespres2;
      this.secondVespersShortReading.shortReading = databaseRow.lecturaBreuVespres2;
      this.secondVespresShortResponsory.firstPart = databaseRow.respBreuVespres12;
      this.secondVespresShortResponsory.secondPart = databaseRow.respBreuVespres22;
      this.secondVespresShortResponsory.thirdPart = databaseRow.respBreuVespres32;
      this.secondVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A2;
      this.secondVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B2;
      this.secondVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C2;
      this.secondVespersPrayers = databaseRow.pregariesVespres12;
      this.secondVespersFinalPrayer = databaseRow.oraFiVespres12;
    }
  }

  id: number;
  firstVespersFirstAntiphon: string;
  firstVespersSecondAntiphon: string;
  firstVespersThirdAntiphon: string;
  firstVespersShortReading: ShortReading = new ShortReading();
  firstVespersShortResponsory: ShortResponsory = new ShortResponsory();
  firstVespersEvangelicalAntiphonYearA: string;
  firstVespersEvangelicalAntiphonYearB: string;
  firstVespersEvangelicalAntiphonYearC: string;
  firstVespersPrayers: string;
  firstVespersFinalPrayer: string;
  officeResponsory: Responsory = new Responsory();
  officeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  laudesFirstAntiphon: string;
  laudesSecondAntiphon: string;
  laudesThirdAntiphon: string;
  laudesShortReading: ShortReading = new ShortReading();
  laudesShortResponsory: ShortResponsory = new ShortResponsory();
  laudesEvangelicalAntiphonYearA: string;
  laudesEvangelicalAntiphonYearB: string;
  laudesEvangelicalAntiphonYearC: string;
  laudesPrayers: string;
  laudesFinalPrayer: string;
  thirdHourParts: HourCommonParts = new HourCommonParts();
  sixthHourParts: HourCommonParts = new HourCommonParts();
  ninthHourParts: HourCommonParts = new HourCommonParts();
  secondVespersFirstAntiphon: string;
  secondVespersSecondAntiphon: string;
  secondVespersThirdAntiphon: string;
  secondVespersShortReading: ShortReading = new ShortReading();
  secondVespresShortResponsory: ShortResponsory = new ShortResponsory();
  secondVespersEvangelicalAntiphonYearA: string;
  secondVespersEvangelicalAntiphonYearB: string;
  secondVespersEvangelicalAntiphonYearC: string;
  secondVespersPrayers: string;
  secondVespersFinalPrayer: string;
}

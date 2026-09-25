import { HourCommonParts, ReadingOfTheOffice, Responsory, ShortReading, ShortResponsory } from './CommonParts';

export default class CommonStructure {
  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

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

      this.laudesShortReading.quote = databaseRow.citaLBLaudes;
      this.laudesShortReading.shortReading = databaseRow.lecturaBreuLaudes;

      this.laudesShortResponsory.firstPart = databaseRow.respBreuLaudes1;
      this.laudesShortResponsory.secondPart = databaseRow.respBreuLaudes2;
      this.laudesShortResponsory.thirdPart = databaseRow.respBreuLaudes3;

      this.laudesEvangelicalAntiphon = databaseRow.antZacaries;
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

      this.vespersShortReading.quote = databaseRow.citaLBVespres;
      this.vespersShortReading.shortReading = databaseRow.lecturaBreuVespres;

      this.vespersShortResponsory.firstPart = databaseRow.respBreuVespres1;
      this.vespersShortResponsory.secondPart = databaseRow.respBreuVespres2;
      this.vespersShortResponsory.thirdPart = databaseRow.respBreuVespres3;

      this.vespersEvangelicalAntiphon = databaseRow.antMaria;
      this.vespersPrayers = databaseRow.pregariesVespres;
      this.vespersFinalPrayer = databaseRow.oraFiVespres;
    }
  }

  id: number;
  officeResponsory: Responsory = new Responsory();
  officeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  laudesShortReading: ShortReading = new ShortReading();
  laudesShortResponsory: ShortResponsory = new ShortResponsory();
  laudesEvangelicalAntiphon: string;
  laudesPrayers: string;
  laudesFinalPrayer: string;
  thirdHourParts: HourCommonParts = new HourCommonParts();
  sixthHourParts: HourCommonParts = new HourCommonParts();
  ninthHourParts: HourCommonParts = new HourCommonParts();
  vespersShortReading: ShortReading = new ShortReading();
  vespersShortResponsory: ShortResponsory = new ShortResponsory();
  vespersEvangelicalAntiphon: string;
  vespersPrayers: string;
  vespersFinalPrayer: string;
}

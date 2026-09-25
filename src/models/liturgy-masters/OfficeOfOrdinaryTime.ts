import { ReadingOfTheOffice } from './CommonParts';

export default class OfficeOfOrdinaryTime {
  static masterName: string = 'tempsOrdinariOfici';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

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
    }
  }

  id: number;
  officeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  officeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
}

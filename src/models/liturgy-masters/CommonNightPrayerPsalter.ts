import { Psalm, ShortReading } from './CommonParts';

export default class CommonNightPrayerPsalter {
  static masterName: string = 'salteriComuCompletes';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

      this.firstPsalm.antiphon = databaseRow.ant1;
      this.firstPsalm.title = databaseRow.titol1;
      this.firstPsalm.comment = databaseRow.com1;
      this.firstPsalm.psalm = databaseRow.salm1;
      this.firstPsalm.hasGloryPrayer = databaseRow.gloria1 === '1';

      this.hasTwoPsalms = databaseRow.dosSalms === '1';

      this.secondPsalm.antiphon = databaseRow.ant2;
      this.secondPsalm.title = databaseRow.titol2;
      this.secondPsalm.comment = databaseRow.com2;
      this.secondPsalm.psalm = databaseRow.salm2;
      this.secondPsalm.hasGloryPrayer = databaseRow.gloria2 === '1';

      this.shortReading.quote = databaseRow.versetLB;
      this.shortReading.shortReading = databaseRow.lecturaBreu;

      this.finalPrayer = databaseRow.oraFi;
    }
  }

  id: number;
  firstPsalm: Psalm = new Psalm();
  hasTwoPsalms: boolean;
  secondPsalm: Psalm = new Psalm();
  shortReading: ShortReading = new ShortReading();
  finalPrayer: string;
}

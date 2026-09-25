import { Psalm, ShortReading, ShortResponsory } from './CommonParts';

export default class LaudesCommonPsalter {
  static masterName: string = 'salteriComuLaudes';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.latinAnthem = databaseRow.himneLlati;
      this.catalanAnthem = databaseRow.himneCat;

      this.firstPsalm.antiphon = databaseRow.ant1;
      this.firstPsalm.title = databaseRow.titol1;
      this.firstPsalm.comment = databaseRow.com1;
      this.firstPsalm.psalm = databaseRow.salm1;
      this.firstPsalm.hasGloryPrayer = databaseRow.gloria1 === '1';

      this.secondPsalm.antiphon = databaseRow.ant2;
      this.secondPsalm.title = databaseRow.titol2;
      this.secondPsalm.comment = databaseRow.com2;
      this.secondPsalm.psalm = databaseRow.salm2;
      this.secondPsalm.hasGloryPrayer = databaseRow.gloria2 === '1';

      this.thirdPsalm.antiphon = databaseRow.ant3;
      this.thirdPsalm.title = databaseRow.titol3;
      this.thirdPsalm.comment = databaseRow.com3;
      this.thirdPsalm.psalm = databaseRow.salm3;
      this.thirdPsalm.hasGloryPrayer = databaseRow.gloria3 === '1';

      this.shortReading.quote = databaseRow.versetLB;
      this.shortReading.shortReading = databaseRow.lecturaBreu;
      this.shortResponsory.firstPart = databaseRow.respBreu1;
      this.shortResponsory.secondPart = databaseRow.respBreu2;
      this.shortResponsory.thirdPart = databaseRow.respBreu3;

      this.evangelicalAntiphon = databaseRow.antEvangelic;
      this.prayers = databaseRow.pregaries;
      this.finalPrayer = databaseRow.oraFi;
    }
  }

  id: number;
  latinAnthem: string;
  catalanAnthem: string;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  shortReading: ShortReading = new ShortReading();
  shortResponsory: ShortResponsory = new ShortResponsory();
  evangelicalAntiphon: string;
  prayers: string;
  finalPrayer: string;
}

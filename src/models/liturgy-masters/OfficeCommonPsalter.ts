import { Psalm, Responsory } from './CommonParts';
import CommonOfficeWhenStrongTimesPsalter from './CommonOfficeWhenStrongTimesPsalter';

export default class OfficeCommonPsalter {
  static masterName: string = 'salteriComuOfici';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.nightLatinAnthem = databaseRow.himneNitLlati;
      this.nightCatalanAnthem = databaseRow.himneNitCat;
      this.dayLatinAnthem = databaseRow.himneDiaLlati;
      this.dayCatalanAnthem = databaseRow.himneDiaCat;

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

      this.responsory.versicle = databaseRow.respV;
      this.responsory.response = databaseRow.respR;
    }
  }

  adaptWithStrongTimes(commonOfficeWhenStrongTimesPsalter: CommonOfficeWhenStrongTimesPsalter) {
    this.id = commonOfficeWhenStrongTimesPsalter.id;
    this.nightLatinAnthem = commonOfficeWhenStrongTimesPsalter.latinAnthem;
    this.nightCatalanAnthem = commonOfficeWhenStrongTimesPsalter.catalanAnthem;
    this.dayLatinAnthem = commonOfficeWhenStrongTimesPsalter.latinAnthem;
    this.dayCatalanAnthem = commonOfficeWhenStrongTimesPsalter.catalanAnthem;

    this.firstPsalm.antiphon = commonOfficeWhenStrongTimesPsalter.firstPsalm.antiphon;
    this.firstPsalm.title = commonOfficeWhenStrongTimesPsalter.firstPsalm.title;
    this.firstPsalm.comment = commonOfficeWhenStrongTimesPsalter.firstPsalm.comment;
    this.firstPsalm.psalm = commonOfficeWhenStrongTimesPsalter.firstPsalm.psalm;
    this.firstPsalm.hasGloryPrayer = commonOfficeWhenStrongTimesPsalter.firstPsalm.hasGloryPrayer;

    this.secondPsalm.antiphon = commonOfficeWhenStrongTimesPsalter.secondPsalm.antiphon;
    this.secondPsalm.title = commonOfficeWhenStrongTimesPsalter.secondPsalm.title;
    this.secondPsalm.comment = commonOfficeWhenStrongTimesPsalter.secondPsalm.comment;
    this.secondPsalm.psalm = commonOfficeWhenStrongTimesPsalter.secondPsalm.psalm;
    this.secondPsalm.hasGloryPrayer = commonOfficeWhenStrongTimesPsalter.secondPsalm.hasGloryPrayer;

    this.thirdPsalm.antiphon = commonOfficeWhenStrongTimesPsalter.thirdPsalm.antiphon;
    this.thirdPsalm.title = commonOfficeWhenStrongTimesPsalter.thirdPsalm.title;
    this.thirdPsalm.comment = commonOfficeWhenStrongTimesPsalter.thirdPsalm.comment;
    this.thirdPsalm.psalm = commonOfficeWhenStrongTimesPsalter.thirdPsalm.psalm;
    this.thirdPsalm.hasGloryPrayer = commonOfficeWhenStrongTimesPsalter.thirdPsalm.hasGloryPrayer;

    this.responsory.versicle = commonOfficeWhenStrongTimesPsalter.responsory.versicle;
    this.responsory.response = commonOfficeWhenStrongTimesPsalter.responsory.response;
  }

  id: number;
  nightLatinAnthem: string;
  nightCatalanAnthem: string;
  dayLatinAnthem: string;
  dayCatalanAnthem: string;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  responsory: Responsory = new Responsory();
}

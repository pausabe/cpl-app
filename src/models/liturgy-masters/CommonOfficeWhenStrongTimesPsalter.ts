import { Psalm, Responsory } from './CommonParts';

export default class CommonOfficeWhenStrongTimesPsalter {
  static masterName: string = 'salteriComuOficiTF';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.latinAnthem = databaseRow.himneNitLlati;
      this.catalanAnthem = databaseRow.himneNitCat;

      this.firstPsalm.antiphon = databaseRow.ant1;
      this.firstPsalm.title = databaseRow.titol1;
      this.firstPsalm.comment = databaseRow.com1;
      this.firstPsalm.psalm = databaseRow.salm1;
      this.firstPsalm.hasGloryPrayer = databaseRow.gloria1 === '1';

      this.secondPsalm.antiphon = databaseRow.ant2;
      this.secondPsalm.title = databaseRow.titol2;
      this.secondPsalm.comment = ''; // Missing com2 in the database
      this.secondPsalm.psalm = databaseRow.salm2;
      this.secondPsalm.hasGloryPrayer = databaseRow.gloria2 === '1';

      this.thirdPsalm.antiphon = databaseRow.ant3;
      this.thirdPsalm.title = databaseRow.titol3;
      this.thirdPsalm.psalm = databaseRow.salm3;
      this.thirdPsalm.comment = ''; // Missing com3 in the database
      this.thirdPsalm.hasGloryPrayer = databaseRow.gloria3 === '1';

      this.responsory.versicle = databaseRow.respV;
      this.responsory.response = databaseRow.respR;
    }
  }

  id: number;
  latinAnthem: string;
  catalanAnthem: string;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  responsory: Responsory = new Responsory();
}

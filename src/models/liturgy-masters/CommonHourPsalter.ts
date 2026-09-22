import { HourCommonParts, Psalm } from './CommonParts';

export default class CommonHourPsalter {
  static masterName: string = 'salteriComuHora';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;

      this.firstPsalm.antiphon = databaseRow.ant1;
      this.firstPsalm.title = databaseRow.titol1;
      this.firstPsalm.comment = databaseRow.com1;
      this.firstPsalm.psalm = databaseRow.salm1;
      this.firstPsalm.hasGloryPrayer = databaseRow.gloria1 === '1';

      this.secondPsalm.antiphon = databaseRow.ant2;
      this.secondPsalm.title = databaseRow.titol2;
      this.secondPsalm.comment = databaseRow.com2;
      this.secondPsalm.psalm = databaseRow.salm2;
      this.secondPsalm.hasGloryPrayer = databaseRow.gloria2;

      this.thirdPsalm.antiphon = databaseRow.ant3;
      this.thirdPsalm.title = databaseRow.titol3;
      this.thirdPsalm.comment = databaseRow.com3;
      this.thirdPsalm.psalm = databaseRow.salm3;
      this.thirdPsalm.hasGloryPrayer = databaseRow.gloria3;

      this.thirdHourParts.shortReading.quote = databaseRow.versetLBTercia;
      this.thirdHourParts.shortReading.shortReading = databaseRow.lecturaBreuTercia;
      this.thirdHourParts.responsory.versicle = databaseRow.respTercia1;
      this.thirdHourParts.responsory.response = databaseRow.respTercia2;
      this.thirdHourParts.finalPrayer = databaseRow.oraTercia;

      this.sixthHourParts.shortReading.quote = databaseRow.versetLBSexta;
      this.sixthHourParts.shortReading.shortReading = databaseRow.lecturaBreuSexta;
      this.sixthHourParts.responsory.versicle = databaseRow.respSexta1;
      this.sixthHourParts.responsory.response = databaseRow.respSexta2;
      this.sixthHourParts.finalPrayer = databaseRow.oraSexta;

      this.ninthHourParts.shortReading.quote = databaseRow.versetLBNona;
      this.ninthHourParts.shortReading.shortReading = databaseRow.lecturaBreuNona;
      this.ninthHourParts.responsory.versicle = databaseRow.respNona1;
      this.ninthHourParts.responsory.response = databaseRow.respNona2;
      this.ninthHourParts.finalPrayer = databaseRow.oraNona;
    }
  }

  id: number;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  thirdHourParts: HourCommonParts = new HourCommonParts();
  sixthHourParts: HourCommonParts = new HourCommonParts();
  ninthHourParts: HourCommonParts = new HourCommonParts();
}

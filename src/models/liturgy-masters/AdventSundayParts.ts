export default class AdventSundayParts {
  static masterName: string = 'tempsAdventSetmanesDium';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.firstVespersFirstAntiphon = databaseRow.ant1Vespres;
      this.firstVespersSecondAntiphon = databaseRow.ant2Vespres;
      this.firstVespersThirdAntiphon = databaseRow.ant3Vespres;
      this.firstVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A;
      this.firstVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B;
      this.firstVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C;
      this.officeFirstAntiphon = databaseRow.Ant1Ofici;
      this.officeSecondAntiphon = databaseRow.Ant2Ofici;
      this.officeThirdAntiphon = databaseRow.Ant3Ofici;
      this.laudesFirstAntiphon = databaseRow.ant1Laudes;
      this.laudesSecondAntiphon = databaseRow.ant2Laudes;
      this.laudesThirdAntiphon = databaseRow.ant3Laudes;
      this.laudesEvangelicalAntiphonYearA = databaseRow.antZacariesA;
      this.laudesEvangelicalAntiphonYearB = databaseRow.antZacariesB;
      this.laudesEvangelicalAntiphonYearC = databaseRow.antZacariesC;
      this.secondVespersFirstAntiphon = databaseRow.ant1Vespres2;
      this.secondVespersSecondAntiphon = databaseRow.ant2Vespres2;
      this.secondVespersThirdAntiphon = databaseRow.ant3Vespres2;
      this.secondVespersEvangelicalAntiphonYearA = databaseRow.antMaria2A;
      this.secondVespersEvangelicalAntiphonYearB = databaseRow.antMaria2B;
      this.secondVespersEvangelicalAntiphonYearC = databaseRow.antMaria2C;
    }
  }

  id: number;
  firstVespersFirstAntiphon: string;
  firstVespersSecondAntiphon: string;
  firstVespersThirdAntiphon: string;
  firstVespersEvangelicalAntiphonYearA: string;
  firstVespersEvangelicalAntiphonYearB: string;
  firstVespersEvangelicalAntiphonYearC: string;
  officeFirstAntiphon: string;
  officeSecondAntiphon: string;
  officeThirdAntiphon: string;
  laudesFirstAntiphon: string;
  laudesSecondAntiphon: string;
  laudesThirdAntiphon: string;
  laudesEvangelicalAntiphonYearA: string;
  laudesEvangelicalAntiphonYearB: string;
  laudesEvangelicalAntiphonYearC: string;
  secondVespersFirstAntiphon: string;
  secondVespersSecondAntiphon: string;
  secondVespersThirdAntiphon: string;
  secondVespersEvangelicalAntiphonYearA: string;
  secondVespersEvangelicalAntiphonYearB: string;
  secondVespersEvangelicalAntiphonYearC: string;
}

export default class PrayersOfOrdinaryTime {
  static masterName: string = 'tempsOrdinariOracions';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.finalPrayer = databaseRow.oracio;
      this.firstVespersEvangelicalAntiphonYearA = databaseRow.antMaria1A;
      this.firstVespersEvangelicalAntiphonYearB = databaseRow.antMaria1B;
      this.firstVespersEvangelicalAntiphonYearC = databaseRow.antMaria1C;
      this.laudesEvangelicalAntiphonYearA = databaseRow.antZacariesA;
      this.laudesEvangelicalAntiphonYearB = databaseRow.antZacariesB;
      this.laudesEvangelicalAntiphonYearC = databaseRow.antZacariesC;
      this.secondVespersEvangelicalAntiphonYearA = databaseRow.antMaria2A;
      this.secondVespersEvangelicalAntiphonYearB = databaseRow.antMaria2B;
      this.secondVespersEvangelicalAntiphonYearC = databaseRow.antMaria2C;
    }
  }

  id: number;
  finalPrayer: string;
  firstVespersEvangelicalAntiphonYearA: string;
  firstVespersEvangelicalAntiphonYearB: string;
  firstVespersEvangelicalAntiphonYearC: string;
  laudesEvangelicalAntiphonYearA: string;
  laudesEvangelicalAntiphonYearB: string;
  laudesEvangelicalAntiphonYearC: string;
  secondVespersEvangelicalAntiphonYearA: string;
  secondVespersEvangelicalAntiphonYearB: string;
  secondVespersEvangelicalAntiphonYearC: string;
}

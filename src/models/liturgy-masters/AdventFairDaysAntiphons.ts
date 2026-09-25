export default class AdventFairDaysAntiphons {
  static masterName: string = 'tempsAdventFeriesAnt';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.weekDay = databaseRow.diaSetmana;
      this.firstAntiphon = databaseRow.ant1;
      this.secondAntiphon = databaseRow.ant2;
      this.thirdAntiphon = databaseRow.ant3;
    }
  }

  id: number;
  weekDay: string;
  firstAntiphon: string;
  secondAntiphon: string;
  thirdAntiphon: string;
}

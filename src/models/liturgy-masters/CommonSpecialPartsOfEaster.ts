export default class CommonSpecialPartsOfEaster {
  static masterName: string = 'salteriComuEspPasqua';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      this.laudesFirstAntiphon = databaseRow.ant1Laudes;
      this.laudesSecondAntiphon = databaseRow.ant2Laudes;
      this.laudesThirdAntiphon = databaseRow.ant3Laudes;
      this.vespersFirstAntiphon = databaseRow.ant1Vespres;
      this.vespersSecondAntiphon = databaseRow.ant2Vespres;
      this.vespersThirdAntiphon = databaseRow.ant3Vespres;
    }
  }

  id: number;
  laudesFirstAntiphon: string;
  laudesSecondAntiphon: string;
  laudesThirdAntiphon: string;
  vespersFirstAntiphon: string;
  vespersSecondAntiphon: string;
  vespersThirdAntiphon: string;
}

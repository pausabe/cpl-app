export default class SpecialCommonPartsOfEasterSundays {
  static masterName: string = 'salteriComuEspPasquaDium';

  constructor(databaseRow: any = undefined) {
    if (databaseRow) {
      this.id = databaseRow.id;
      // In the database there is some incoherence.
      // The weeks III, IV, V and VI have the same Antiphons and the VII is the only different
      // In the database, the week V have incorrect data
      this.officeFirstAntiphonSundayNotWeekVII = databaseRow.ant1OficiDiumIII;
      this.officeSecondAntiphonSundayNotWeekVII = databaseRow.ant2OficiDiumIII;
      this.officeThirdAntiphonSundayNotWeekVII = databaseRow.ant3OficiDiumIII;
      this.officeFirstAntiphonSundayWeekVII = databaseRow.ant3OficiDiumVII;
      this.officeSecondAntiphonSundayWeekVII = databaseRow.ant3OficiDiumVII;
      this.officeThirdAntiphonSundayWeekVII = databaseRow.ant3OficiDiumVII;
    }
  }

  id: number;
  officeFirstAntiphonSundayNotWeekVII: string;
  officeSecondAntiphonSundayNotWeekVII: string;
  officeThirdAntiphonSundayNotWeekVII: string;
  officeFirstAntiphonSundayWeekVII: string;
  officeSecondAntiphonSundayWeekVII: string;
  officeThirdAntiphonSundayWeekVII: string;
}

export default class SpecialCommonPartsOfEasterSundays {
    static MasterName: string = "salteriComuEspPasquaDium";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;
            // In the database there is some incoherence.
            // The weeks III, IV, V and VI have the same Antiphons and the VII is the only different
            // In the database, the week V have incorrect data
            this.OfficeFirstAntiphonSundayNotWeekVII = databaseRow.ant1OficiDiumIII;
            this.OfficeSecondAntiphonSundayNotWeekVII = databaseRow.ant2OficiDiumIII;
            this.OfficeThirdAntiphonSundayNotWeekVII = databaseRow.ant3OficiDiumIII;
            this.OfficeFirstAntiphonSundayWeekVII = databaseRow.ant3OficiDiumVII;
            this.OfficeSecondAntiphonSundayWeekVII = databaseRow.ant3OficiDiumVII;
            this.OfficeThirdAntiphonSundayWeekVII = databaseRow.ant3OficiDiumVII;
        }
    }

    Id: number;
    OfficeFirstAntiphonSundayNotWeekVII: string;
    OfficeSecondAntiphonSundayNotWeekVII: string;
    OfficeThirdAntiphonSundayNotWeekVII: string;
    OfficeFirstAntiphonSundayWeekVII: string;
    OfficeSecondAntiphonSundayWeekVII: string;
    OfficeThirdAntiphonSundayWeekVII: string;
}
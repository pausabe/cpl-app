export default class SpecialCommonPartsOfEasterSundays {
    static MasterName: string = "salteriComuEspPasquaDium";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.OfficeFirstAntiphonSundayIII = databaseRow.ant1OficiDiumIII;
        this.OfficeSecondAntiphonSundayIII = databaseRow.ant2OficiDiumIII;
        this.OfficeThirdAntiphonSundayIII = databaseRow.ant3OficiDiumIII;
        this.OfficeFirstAntiphonSundayIV = databaseRow.ant1OficiDiumIV;
        this.OfficeSecondAntiphonSundayIV = databaseRow.ant2OficiDiumIV;
        this.OfficeThirdAntiphonSundayIV = databaseRow.ant3OficiDiumIV;
        this.OfficeFirstAntiphonSundayV = databaseRow.ant1OficiDiumV;
        this.OfficeSecondAntiphonSundayV = databaseRow.ant2OficiDiumV;
        this.OfficeThirdAntiphonSundayV = databaseRow.ant3OficiDiumV;
        this.OfficeFirstAntiphonSundayVI = databaseRow.ant1OficiDiumVI;
        this.OfficeSecondAntiphonSundayVI = databaseRow.ant2OficiDiumVI;
        this.OfficeThirdAntiphonSundayVI = databaseRow.ant3OficiDiumVI;
        this.OfficeFirstAntiphonSundayVII = databaseRow.ant1OficiDiumVII;
        this.OfficeSecondAntiphonSundayVII = databaseRow.ant2OficiDiumVII;
        this.OfficeThirdAntiphonSundayVII = databaseRow.ant3OficiDiumVII;
    }

    Id: number;
    OfficeFirstAntiphonSundayIII: string;
    OfficeSecondAntiphonSundayIII: string;
    OfficeThirdAntiphonSundayIII: string;
    OfficeFirstAntiphonSundayIV: string;
    OfficeSecondAntiphonSundayIV: string;
    OfficeThirdAntiphonSundayIV: string;
    OfficeFirstAntiphonSundayV: string;
    OfficeSecondAntiphonSundayV: string;
    OfficeThirdAntiphonSundayV: string;
    OfficeFirstAntiphonSundayVI: string;
    OfficeSecondAntiphonSundayVI: string;
    OfficeThirdAntiphonSundayVI: string;
    OfficeFirstAntiphonSundayVII: string;
    OfficeSecondAntiphonSundayVII: string;
    OfficeThirdAntiphonSundayVII: string;
}
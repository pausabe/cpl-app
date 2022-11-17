export default class CommonSpecialPartsOfEaster {
    static MasterName: string = "salteriComuEspPasqua";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;
            this.LaudesFirstAntiphon = databaseRow.ant1Laudes;
            this.LaudesSecondAntiphon = databaseRow.ant2Laudes;
            this.LaudesThirdAntiphon = databaseRow.ant3Laudes;
            this.VespersFirstAntiphon = databaseRow.ant1Vespres;
            this.VespersSecondAntiphon = databaseRow.ant2Vespres;
            this.VespersThirdAntiphon = databaseRow.ant3Vespres;
        }
    }

    Id: number;
    LaudesFirstAntiphon: string;
    LaudesSecondAntiphon: string;
    LaudesThirdAntiphon: string;
    VespersFirstAntiphon: string;
    VespersSecondAntiphon: string;
    VespersThirdAntiphon: string;
}
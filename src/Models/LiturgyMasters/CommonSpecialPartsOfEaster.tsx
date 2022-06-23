export default class CommonSpecialPartsOfEaster {
    static MasterName: string = "salteriComuEspPasqua";

    constructor(databaseRow) {
        this. = databaseRow.id;
        this. = databaseRow.ant1Laudes;
        this. = databaseRow.ant2Laudes;
        this. = databaseRow.ant3Laudes;
        this. = databaseRow.ant1Vespres;
        this. = databaseRow.ant2Vespres;
        this. = databaseRow.ant3Vespres;
    }

    Id: number;
    Antiphon: string;
}
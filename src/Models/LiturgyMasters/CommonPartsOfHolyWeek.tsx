export default class CommonPartsOfHolyWeek {
    static MasterName: string = "tempsQuaresmaComuSS";

    constructor(databaseRow) {
        this. = databaseRow.id;
        this. = databaseRow.himneVespresLlati;
        this. = databaseRow.himneVespresCat;
        this. = databaseRow.antInvitatori;
        this. = databaseRow.himneOficiLlati;
        this. = databaseRow.himneOficiCat;
        this. = databaseRow.himneLaudesLlati;
        this. = databaseRow.himneLaudesCat;
        this. = databaseRow.himneHoraLlati;
        this. = databaseRow.himneHoraCat;
        this. = databaseRow.antTercia;
        this. = databaseRow.antSexta;
        this. = databaseRow.antNona;
    }

    Id: number;
    Antiphon: string;
}
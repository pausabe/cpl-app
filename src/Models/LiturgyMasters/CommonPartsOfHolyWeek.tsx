export default class CommonPartsOfHolyWeek {
    static MasterName: string = "tempsQuaresmaComuSS";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.VespersLatinAnthem = databaseRow.himneVespresLlati;
        this.VespersCatalanAnthem = databaseRow.himneVespresCat;
        this.InvitationAntiphon = databaseRow.antInvitatori;
        this.OfficeLatinAnthem = databaseRow.himneOficiLlati;
        this.OfficeCatalanAnthem = databaseRow.himneOficiCat;
        this.LaudesLatinAnthem = databaseRow.himneLaudesLlati;
        this.LaudesCatalanAnthem = databaseRow.himneLaudesCat;
        this.ThirdHourLatinAnthem = databaseRow.himneHoraLlati;
        this.ThirdHourCatalanAnthem = databaseRow.himneHoraCat;
        this.ThirdHourAntiphon = databaseRow.antTercia;
        this.SixthHourAntiphon = databaseRow.antSexta;
        this.NinthHourAntiphon = databaseRow.antNona;
    }

    Id: number;
    VespersLatinAnthem: string;
    VespersCatalanAnthem: string;
    InvitationAntiphon: string;
    OfficeLatinAnthem: string;
    OfficeCatalanAnthem: string;
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    ThirdHourLatinAnthem: string;
    ThirdHourCatalanAnthem: string;
    ThirdHourAntiphon: string
    SixthHourAntiphon: string
    NinthHourAntiphon: string
}
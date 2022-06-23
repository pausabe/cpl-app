export default class CommonAdventAndChristmasParts {
    static MasterName: string = "tempsAdventNadalComu";

    constructor(databaseRow) {
        this.Id = databaseRow.id;
        this.VespersLatinAnthem = databaseRow.himneVespresLlati;
        this.VespersCatalanAnthem = databaseRow.himneVespresCat;
        this.NightPrayerLatinAnthem = databaseRow.himneCompletesLlati;
        this.NightPrayerCatalanAnthem = databaseRow.himneCompletesCat;
        this.InvitationAntiphon = databaseRow.antInvitatori;
        this.OfficeLatinAnthem = databaseRow.himneOficiLlati;
        this.OfficeCatalanAnthem = databaseRow.himneOficiCat;
        this.LaudesLatinAnthem = databaseRow.himneLaudesLlati;
        this.LaudesCatalanAnthem = databaseRow.himneLaudesCat;
        this.ThirdHourLatinAnthem = databaseRow.himneTerciaLlati;
        this.ThirdHourCatalanAnthem = databaseRow.himneTerciaCat;
        this.ThirdHourAntiphon = databaseRow.antTercia;
        this.SixthHourLatinAnthem = databaseRow.himneSextaLlati;
        this.SixthHourCatalanAnthem = databaseRow.himneSextaCat;
        this.SixthHourAntiphon = databaseRow.antSexta;
        this.NinthHourLatinAnthem = databaseRow.himneNonaLlati;
        this.NinthHourCatalanAnthem = databaseRow.himneNonaCat;
        this.NinthHourAntiphon = databaseRow.antNona;
    }

    Id: number;
    VespersLatinAnthem: string;
    VespersCatalanAnthem: string;
    NightPrayerLatinAnthem: string;
    NightPrayerCatalanAnthem: string;
    InvitationAntiphon: string;
    OfficeLatinAnthem: string;
    OfficeCatalanAnthem: string;
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    ThirdHourLatinAnthem: string;
    ThirdHourCatalanAnthem: string;
    ThirdHourAntiphon: string
    SixthHourLatinAnthem: string;
    SixthHourCatalanAnthem: string;
    SixthHourAntiphon: string
    NinthHourLatinAnthem: string;
    NinthHourCatalanAnthem: string;
    NinthHourAntiphon: string
}
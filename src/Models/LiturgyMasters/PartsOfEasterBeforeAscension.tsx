export default class PartsOfEasterBeforeAscension {
    static MasterName: string = "tempsPasquaAA";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;
            this.VespersWeekendLatinAnthem = databaseRow.himneVespresLlati1;
            this.VespersWeekendCatalanAnthem = databaseRow.himneVespresCat1;
            this.VespersWorkdaysLatinAnthem = databaseRow.himneVespresLlati2;
            this.VespersWorkdaysCatalanAnthem = databaseRow.himneVespresCat2;
            this.HourSpecialAntiphon = databaseRow.antEspecialMenor;
            this.InvitationAntiphon = databaseRow.antInvitatori;
            this.OfficeWeekendLatinAnthem = databaseRow.himneOficiLlati1;
            this.OfficeWeekendCatalanAnthem = databaseRow.himneOficiCat1;
            this.OfficeWorkdaysLatinAnthem = databaseRow.himneOficiLlati2;
            this.OfficeWorkdaysCatalanAnthem = databaseRow.himneOficiCat2;
            this.LaudesWeekendLatinAnthem = databaseRow.himneLaudesLlati1;
            this.LaudesWeekendCatalanAnthem = databaseRow.himneLaudesCat1;
            this.LaudesWorkdaysLatinAnthem = databaseRow.himneLaudesLlati2;
            this.LaudesWorkdaysCatalanAnthem = databaseRow.himneLaudesCat2;
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
    }

    Id: number;
    VespersWeekendLatinAnthem: string;
    VespersWeekendCatalanAnthem: string;
    VespersWorkdaysLatinAnthem: string;
    VespersWorkdaysCatalanAnthem: string;
    HourSpecialAntiphon: string;
    InvitationAntiphon: string;
    OfficeWeekendLatinAnthem: string;
    OfficeWeekendCatalanAnthem: string;
    OfficeWorkdaysLatinAnthem: string;
    OfficeWorkdaysCatalanAnthem: string;
    LaudesWeekendLatinAnthem: string;
    LaudesWeekendCatalanAnthem: string;
    LaudesWorkdaysLatinAnthem: string;
    LaudesWorkdaysCatalanAnthem: string;
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
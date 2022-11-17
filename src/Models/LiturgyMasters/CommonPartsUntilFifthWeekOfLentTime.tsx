export default class CommonPartsUntilFifthWeekOfLentTime {
    static MasterName: string = "tempsQuaresmaComuFV";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;
            this.VespersSundaysLatinAnthem = databaseRow.himneVespresLlatiDom;
            this.VespersSundaysCatalanAnthem = databaseRow.himneVespresCatDom;
            this.VespersFairsLatinAnthem = databaseRow.himneVespresLlatiFer;
            this.VespersFairsCatalanAnthem = databaseRow.himneVespresCatFer;
            this.InvitationAntiphonFirstOption = databaseRow.antInvitatori1;
            this.InvitationAntiphonSecondOption = databaseRow.antInvitatori2;
            this.OfficeSundaysLatinAnthem = databaseRow.himneOficiLlatiDom;
            this.OfficeSundaysCatalanAnthem = databaseRow.himneOficiCatDom;
            this.OfficeFairsLatinAnthem = databaseRow.himneOficiLlatiFer;
            this.OfficeFairsCatalanAnthem = databaseRow.himneOficiCatFer;
            this.LaudesSundaysLatinAnthem = databaseRow.himneLaudesLlatiDom;
            this.LaudesSundaysCatalanAnthem = databaseRow.himneLaudesCatDom;
            this.LaudesFairsLatinAnthem = databaseRow.himneLaudesLlatiFer;
            this.LaudesFairsCatalanAnthem = databaseRow.himneLaudesCatFer;
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
    VespersSundaysLatinAnthem: string;
    VespersSundaysCatalanAnthem: string;
    VespersFairsLatinAnthem: string;
    VespersFairsCatalanAnthem: string;
    InvitationAntiphonFirstOption: string;
    InvitationAntiphonSecondOption: string;
    OfficeSundaysLatinAnthem: string;
    OfficeSundaysCatalanAnthem: string;
    OfficeFairsLatinAnthem: string;
    OfficeFairsCatalanAnthem: string;
    LaudesSundaysLatinAnthem: string;
    LaudesSundaysCatalanAnthem: string;
    LaudesFairsLatinAnthem: string;
    LaudesFairsCatalanAnthem: string;
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
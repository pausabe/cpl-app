export default class SaintsMemories {
    static MasterName: string = "santsMemories";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

        this.Celebration.Diocese = databaseRow.Diocesis;
        this.Celebration.Category = databaseRow.Categoria;
        this.Celebration.Day = databaseRow.dia;
        this.Celebration.LiturgicalTime = databaseRow.Temps;
        this.Celebration.Title = databaseRow.nomMemoria;
        this.Celebration.Description = databaseRow.infoMemoria;

        this.InvitationAntiphon = databaseRow.Invitatori;

        this.OfficeLatinAnthem = databaseRow.himneOficiLlati;
        this.OfficeCatalanAnthem = databaseRow.himneOficiCat;

        this.OfficeFirstPsalm.Antiphon = databaseRow.ant1Ofici;
        this.OfficeFirstPsalm.Title = databaseRow.titol1Ofici;
        this.OfficeFirstPsalm.Psalm = databaseRow.Salm1Ofici;
        this.OfficeFirstPsalm.HasGloryPrayer = databaseRow.gloriaOfici1 === "1";

        this.OfficeSecondPsalm.Antiphon = databaseRow.ant2Ofici;
        this.OfficeSecondPsalm.Title = databaseRow.titol2Ofici;
        this.OfficeSecondPsalm.Psalm = databaseRow.Salm2Ofici;
        this.OfficeSecondPsalm.HasGloryPrayer = databaseRow.gloriaOfici2 === "1";

        this.OfficeThirdPsalm.Antiphon = databaseRow.ant3Ofici;
        this.OfficeThirdPsalm.Title = databaseRow.titol3Ofici;
        this.OfficeThirdPsalm.Psalm = databaseRow.Salm3Ofici;
        this.OfficeThirdPsalm.HasGloryPrayer = databaseRow.gloriaOfici3 === "1";

        this.OfficeResponsory.Versicle = databaseRow.respVOfici;
        this.OfficeResponsory.Response = databaseRow.respROfici;

        this.OfficeFirstReading.Reference = databaseRow.referencia1;
        this.OfficeFirstReading.Quote = databaseRow.citaLect1Ofici;
        this.OfficeFirstReading.Title = databaseRow.titolLect1Ofici;
        this.OfficeFirstReading.Lecture = databaseRow.lectura1;
        this.OfficeFirstReading.Responsory.Quote = databaseRow.citaResp1Ofici;
        this.OfficeFirstReading.Responsory.FirstPart = databaseRow.resp1Part1Ofici;
        this.OfficeFirstReading.Responsory.SecondPart = databaseRow.resp1Part2Ofici;
        this.OfficeFirstReading.Responsory.ThirdPart = databaseRow.resp1Part3Ofici;

        this.OfficeSecondReading.Reference = databaseRow.referencia2Ofici;
        this.OfficeSecondReading.Quote = databaseRow.citaLec2Ofici;
        this.OfficeSecondReading.Title = databaseRow.titolLect2Ofici;
        this.OfficeSecondReading.Lecture = databaseRow.lectura2;
        this.OfficeSecondReading.Responsory.Quote = databaseRow.citaResp2Ofici;
        this.OfficeSecondReading.Responsory.FirstPart = databaseRow.resp2Part1Ofici;
        this.OfficeSecondReading.Responsory.SecondPart = databaseRow.resp2Part2Ofici;
        this.OfficeSecondReading.Responsory.ThirdPart = databaseRow.resp2Part3Ofici;

        this.LaudesLatinAnthem = databaseRow.himneLaudesLlati;
        this.LaudesCatalanAnthem = databaseRow.himneLaudesCat;

        this.LaudesFirstPsalm.Antiphon = databaseRow.ant1Laudes;
        this.LaudesFirstPsalm.Title = databaseRow.titol1Laudes;
        this.LaudesFirstPsalm.Psalm = databaseRow.Salm1Laudes;
        this.LaudesFirstPsalm.HasGloryPrayer = databaseRow.gloria1Laudes === "1";

        this.LaudesSecondPsalm.Antiphon = databaseRow.ant2Laudes;
        this.LaudesSecondPsalm.Title = databaseRow.titol2Laudes;
        this.LaudesSecondPsalm.Psalm = databaseRow.Salm2Laudes;
        this.LaudesSecondPsalm.HasGloryPrayer = databaseRow.gloria2Laudes === "1";

        this.LaudesThirdPsalm.Antiphon = databaseRow.ant3Laudes;
        this.LaudesThirdPsalm.Title = databaseRow.titol3Laudes;
        this.LaudesThirdPsalm.Psalm = databaseRow.Salm3Laudes;
        this.LaudesThirdPsalm.HasGloryPrayer = databaseRow.gloria3Laudes === "1";

        this.LaudesShortReading.Quote = databaseRow.citaLBLaudes;
        this.LaudesShortReading.ShortReading = databaseRow.lecturaBreuLaudes;

        this.LaudesShortResponsory.FirstPart = databaseRow.respBreuLaudes1;
        this.LaudesShortResponsory.SecondPart = databaseRow.respBreuLaudes2;
        this.LaudesShortResponsory.ThirdPart = databaseRow.respBreuLaudes3;

        this.LaudesEvangelicalAntiphon = databaseRow.antZacaries;
        this.LaudesPrayers = databaseRow.pregariesLaudes;

        this.HoursLatinAnthem = databaseRow.HimneMenorLlat;
        this.HoursCatalanAnthem = databaseRow.HimneMenorCat;

        this.HoursFirstPsalm.Title = databaseRow.titol1Menor;
        this.HoursFirstPsalm.Psalm = databaseRow.salm1Menor;
        this.HoursFirstPsalm.HasGloryPrayer = databaseRow.gloria1Menor === "1";

        this.HoursSecondPsalm.Title = databaseRow.titol2Menor;
        this.HoursSecondPsalm.Psalm = databaseRow.salm2Menor;
        this.HoursSecondPsalm.HasGloryPrayer = databaseRow.gloria2Menor === "1";

        this.HoursThirdPsalm.Title = databaseRow.titol3Menor;
        this.HoursThirdPsalm.Psalm = databaseRow.salm3Menor;
        this.HoursThirdPsalm.HasGloryPrayer = databaseRow.gloria3Menor === "1";

        this.ThirdHourParts.Antiphon = databaseRow.antMenorTer;
        this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLBTercia;
        this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
        this.ThirdHourParts.Responsory.Versicle = databaseRow.respVTercia;
        this.ThirdHourParts.Responsory.Response = databaseRow.respRTercia;
        this.ThirdHourParts.FinalPrayer = databaseRow.OracioTercia;

        this.SixthHourParts.Antiphon = databaseRow.antMenorSextA;
        this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
        this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
        this.SixthHourParts.Responsory.Versicle = databaseRow.respVSexta;
        this.SixthHourParts.Responsory.Response = databaseRow.respRSexta;
        this.SixthHourParts.FinalPrayer = databaseRow.OracioSexta;

        this.NinthHourParts.Antiphon = databaseRow.antMenorNona;
        this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
        this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
        this.NinthHourParts.Responsory.Versicle = databaseRow.respVNona;
        this.NinthHourParts.Responsory.Response = databaseRow.respRNona;
        this.NinthHourParts.FinalPrayer = databaseRow.OracioNona;

        this.VespersLatinAnthem = databaseRow.himneVespresLlati;
        this.VespersCatalanAnthem = databaseRow.himneVespresCat;

        this.VespersFirstPsalm.Antiphon = databaseRow.ant1Vespres;
        this.VespersFirstPsalm.Title = databaseRow.titol1Vespres;
        this.VespersFirstPsalm.Psalm = databaseRow.Salm1Vespres;
        this.VespersFirstPsalm.HasGloryPrayer = databaseRow.gloria1Vespres === "1";

        this.VespersSecondPsalm.Antiphon = databaseRow.ant2Vespres;
        this.VespersSecondPsalm.Title = databaseRow.titol2Vespres;
        this.VespersSecondPsalm.Psalm = databaseRow.Salm2Vespres;
        this.VespersSecondPsalm.HasGloryPrayer = databaseRow.gloria2Vespres === "1";

        this.VespersThirdPsalm.Antiphon = databaseRow.ant3Vespres;
        this.VespersThirdPsalm.Title = databaseRow.titol3Vespres;
        this.VespersThirdPsalm.Psalm = databaseRow.Salm3Vespres;
        this.VespersThirdPsalm.HasGloryPrayer = databaseRow.gloria3Vespres === "1";

        this.VespersShortReading.Quote = databaseRow.citaLBVespres;
        this.VespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;

        this.VespersShorResponsory.FirstPart = databaseRow.respBreuVespres1;
        this.VespersShorResponsory.SecondPart = databaseRow.respBreuVespres2;
        this.VespersShorResponsory.ThirdPart = databaseRow.respBreuVespres3;

        this.VespersPrayers = databaseRow.pregariesVespres;
        this.VespersEvangelicalAntiphon = databaseRow.antMaria;
        this.VespersFinalPrayer = databaseRow.oraFi;
    }

    Id: number;
    Celebration: Celebration;
    InvitationAntiphon: string;
    OfficeLatinAnthem: string;
    OfficeCatalanAnthem: string;
    OfficeFirstPsalm: Psalm;
    OfficeSecondPsalm: Psalm;
    OfficeThirdPsalm: Psalm;
    OfficeResponsory: Responsory;
    OfficeFirstReading: LectureOfTheOffice;
    OfficeSecondReading: LectureOfTheOffice;
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    LaudesFirstPsalm: Psalm;
    LaudesSecondPsalm: Psalm;
    LaudesThirdPsalm: Psalm;
    LaudesShortReading: ShortReading;
    LaudesShortResponsory: ShortResponsory;
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    HoursLatinAnthem: string;
    HoursCatalanAnthem: string;
    HoursFirstPsalm: Psalm;
    HoursSecondPsalm: Psalm;
    HoursThirdPsalm: Psalm;
    ThirdHourParts: HourCommonParts;
    SixthHourParts: HourCommonParts;
    NinthHourParts: HourCommonParts;
    VespersLatinAnthem: string;
    VespersCatalanAnthem: string;
    VespersShortReading: ShortReading;
    VespersFirstPsalm: Psalm;
    VespersSecondPsalm: Psalm;
    VespersThirdPsalm: Psalm;
    VespersShorResponsory: ShortResponsory;
    VespersEvangelicalAntiphon: string;
    VespersPrayers: string;
    VespersFinalPrayer: string;
}
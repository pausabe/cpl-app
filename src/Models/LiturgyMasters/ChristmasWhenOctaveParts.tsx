import {HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory} from "./CommonParts";

export default class ChristmasWhenOctaveParts {
    static MasterName: string = "tempsNadalOctava";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

        this.InvitationAntiphon = databaseRow.antInvitatori;

        this.OfficeFirstPsalm.Antiphon = databaseRow.ant1Ofici;
        this.OfficeFirstPsalm.Title = databaseRow.titolSalm1Ofici;
        this.OfficeFirstPsalm.Psalm = databaseRow.salm1Ofici;
        this.OfficeFirstPsalm.HasGloryPrayer = databaseRow.gloriaOfici1 === "1";

        this.OfficeSecondPsalm.Antiphon = databaseRow.ant2Ofici;
        this.OfficeSecondPsalm.Title = databaseRow.titolSalm2Ofici;
        this.OfficeSecondPsalm.Psalm = databaseRow.salm2Ofici;
        this.OfficeSecondPsalm.HasGloryPrayer = databaseRow.gloriaOfici2 === "1";

        this.OfficeThirdPsalm.Antiphon = databaseRow.ant3Ofici;
        this.OfficeThirdPsalm.Title = databaseRow.titolSalm3Ofici;
        this.OfficeThirdPsalm.Psalm = databaseRow.salm3Ofici;
        this.OfficeThirdPsalm.HasGloryPrayer = databaseRow.gloriaOfici3 === "1";

        this.OfficeResponsory.Versicle = databaseRow.respVOfici;
        this.OfficeResponsory.Response = databaseRow.respROfici;

        this.OfficeFirstReading.Reference = databaseRow.referencia1;
        this.OfficeFirstReading.Quote = databaseRow.citaLect1Ofici;
        this.OfficeFirstReading.Title = databaseRow.titolLect1Ofici;
        this.OfficeFirstReading.Reading = databaseRow.lectura1;
        this.OfficeFirstReading.Responsory.Quote = databaseRow.citaResp1Ofici;
        this.OfficeFirstReading.Responsory.FirstPart = databaseRow.resp1Part1Ofici;
        this.OfficeFirstReading.Responsory.SecondPart = databaseRow.resp1Part2Ofici;
        this.OfficeFirstReading.Responsory.ThirdPart = databaseRow.resp1Part3Ofici;

        this.OfficeSecondReading.Reference = databaseRow.referencia2Ofici;
        this.OfficeSecondReading.Quote = databaseRow.citaLec2Ofici;
        this.OfficeSecondReading.Title = databaseRow.titolLect2Ofici;
        this.OfficeSecondReading.Reading = databaseRow.lectura2;
        this.OfficeSecondReading.Responsory.Quote = databaseRow.citaResp2Ofici;
        this.OfficeSecondReading.Responsory.FirstPart = databaseRow.resp2Part1Ofici;
        this.OfficeSecondReading.Responsory.SecondPart = databaseRow.resp2Part2Ofici;
        this.OfficeSecondReading.Responsory.ThirdPart = databaseRow.resp2Part3Ofici;

        this.LaudesShortReading.Quote = databaseRow.citaLBLaudes;
        this.LaudesShortReading.ShortReading = databaseRow.lecturaBreuLaudes;

        this.LaudesShortResponsory.FirstPart = databaseRow.resp2Breu1Laudes;
        this.LaudesShortResponsory.SecondPart = databaseRow.resp2Breu2Laudes;
        this.LaudesShortResponsory.ThirdPart = databaseRow.resp2Breu3Laudes;

        this.LaudesEvangelicalAntiphon = databaseRow.antZacaries;
        this.LaudesPrayers = databaseRow.pregariesLaudes;
        this.LaudesFinalPrayer = databaseRow.oraFiLaudes;

        this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLectBreuTercia;
        this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
        this.ThirdHourParts.Responsory.Versicle = databaseRow.respVTercia;
        this.ThirdHourParts.Responsory.Response = databaseRow.respRTercia;

        this.SixthHourParts.ShortReading.Quote = databaseRow.citaLectBreuSexta;
        this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
        this.SixthHourParts.Responsory.Versicle = databaseRow.respVSexta;
        this.SixthHourParts.Responsory.Response = databaseRow.respRSexta;

        this.NinthHourParts.ShortReading.Quote = databaseRow.citaLectBreuNona;
        this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
        this.NinthHourParts.Responsory.Versicle = databaseRow.respVNona;
        this.NinthHourParts.Responsory.Response = databaseRow.respRNona;

        this.VespersShortReading.Quote = databaseRow.citaLBVespres;
        this.VespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;

        this.VespersShortResponsory.FirstPart = databaseRow.respBreuVespres1Part1;
        this.VespersShortResponsory.SecondPart = databaseRow.respBreuVespres1Part2;
        this.VespersShortResponsory.ThirdPart = databaseRow.respBreuVespres1Part3;

        this.VespersEvangelicalAntiphon = databaseRow.antMaria;
        this.VespersPrayers = databaseRow.pregariesVespres;
        this.VespersFinalPrayer = databaseRow.oraFiVespres;
    }

    Id: number;
    InvitationAntiphon: string;
    OfficeResponsory: Responsory = new Responsory();
    OfficeFirstPsalm: Psalm = new Psalm();
    OfficeSecondPsalm: Psalm = new Psalm();
    OfficeThirdPsalm: Psalm = new Psalm();
    OfficeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    LaudesShortReading: ShortReading = new ShortReading();
    LaudesShortResponsory: ShortResponsory = new ShortResponsory();
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    LaudesFinalPrayer: string;
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    VespersShortReading: ShortReading = new ShortReading();
    VespersShortResponsory: ShortResponsory = new ShortResponsory();
    VespersEvangelicalAntiphon: string;
    VespersPrayers: string;
    VespersFinalPrayer: string;
}
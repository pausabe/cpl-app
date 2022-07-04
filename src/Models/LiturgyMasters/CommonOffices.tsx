import {HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory} from "./CommonParts";
import CelebrationInformation from "../HoursLiturgy/CelebrationInformation";

export default class CommonOffice {
    static MasterName: string = "OficisComuns";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

        this.Celebration.Category = databaseRow.Categoria;
        this.Celebration.Description = databaseRow.nomMemoria;

        this.FirstVespersLatinAnthem = databaseRow.himneVespres1Llati;
        this.FirstVespersCatalanAnthem = databaseRow.himneVespres1Cat;

        this.FirstVespersFirstPsalm.Antiphon = databaseRow.ant1Vespres1;
        this.FirstVespersFirstPsalm.Title = databaseRow.titol1Vespres1;
        this.FirstVespersFirstPsalm.Psalm = databaseRow.text1Vespres1;
        this.FirstVespersFirstPsalm.HasGloryPrayer = databaseRow.gloria1Vespres1 === "1";

        this.FirstVespersSecondPsalm.Antiphon = databaseRow.ant2Vespres1;
        this.FirstVespersSecondPsalm.Title = databaseRow.titol2Vespres1;
        this.FirstVespersSecondPsalm.Psalm = databaseRow.text2Vespres1;
        this.FirstVespersSecondPsalm.HasGloryPrayer = databaseRow.gloria2Vespres1 === "1";

        this.FirstVespersThirdPsalm.Antiphon = databaseRow.ant3Vespres1;
        this.FirstVespersThirdPsalm.Title = databaseRow.titol3Vespres1;
        this.FirstVespersThirdPsalm.Psalm = databaseRow.text3Vespres1;
        this.FirstVespersThirdPsalm.HasGloryPrayer = databaseRow.gloria3Vespres1 === "1";

        this.FirstVespersShortReading.Quote = databaseRow.citaLBVespres1;
        this.FirstVespersShortReading.ShortReading = databaseRow.lecturaBreuVespres1;

        this.FirstVespersShortResponsory.FirstPart = databaseRow.respBreuVespres1Part1;
        this.FirstVespersShortResponsory.SecondPart = databaseRow.respBreuVespres1Part2;
        this.FirstVespersShortResponsory.ThirdPart = databaseRow.respBreuVespres1Part3;

        this.FirstVespersEvangelicalAntiphon = databaseRow.antMaria1A;
        this.FirstVespersPrayers = databaseRow.pregariesVespres1;

        this.InvitationAntiphon = databaseRow.antInvitatori;

        this.OfficeLatinAnthem = databaseRow.himneOficiLlati;
        this.OfficeCatalanAnthem = databaseRow.himneOficiCat;

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

        this.ThirdHourParts.Antiphon = databaseRow.antMenorTer;
        this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLBTercia;
        this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
        this.ThirdHourParts.Responsory.Versicle = databaseRow.respVTercia;
        this.ThirdHourParts.Responsory.Response = databaseRow.respRTercia;

        this.SixthHourParts.Antiphon = databaseRow.antMenorSextA;
        this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
        this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
        this.SixthHourParts.Responsory.Versicle = databaseRow.respVSexta;
        this.SixthHourParts.Responsory.Response = databaseRow.respRSexta;

        this.NinthHourParts.Antiphon = databaseRow.antMenorNona;
        this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
        this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
        this.NinthHourParts.Responsory.Versicle = databaseRow.respVNona;
        this.NinthHourParts.Responsory.Response = databaseRow.respRNona;

        this.SecondVespersLatinAnthem = databaseRow = databaseRow.himneVespresLlati;
        this.SecondVespersCatalanAnthem = databaseRow = databaseRow.himneVespresCat;

        this.SecondVespersFirstPsalm.Antiphon = databaseRow.ant1Vespres;
        this.SecondVespersFirstPsalm.Title = databaseRow.titol1Vespres;
        this.SecondVespersFirstPsalm.Psalm = databaseRow.Salm1Vespres;
        this.SecondVespersFirstPsalm.HasGloryPrayer = databaseRow.gloria1Vespres === "1";

        this.SecondVespersSecondPsalm.Antiphon = databaseRow.ant2Vespres;
        this.SecondVespersSecondPsalm.Title = databaseRow.titol2Vespres;
        this.SecondVespersSecondPsalm.Psalm = databaseRow.Salm2Vespres;
        this.SecondVespersSecondPsalm.HasGloryPrayer = databaseRow.gloria2Vespres === "1";

        this.SecondVespersThirdPsalm.Antiphon = databaseRow.ant3Vespres;
        this.SecondVespersThirdPsalm.Title = databaseRow.titol3Vespres;
        this.SecondVespersThirdPsalm.Psalm = databaseRow.Salm3Vespres;
        this.SecondVespersThirdPsalm.HasGloryPrayer = databaseRow.gloria3Vespres === "1";

        this.SecondVespersShortReading.Quote = databaseRow.citaLBVespres;
        this.SecondVespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;

        this.SecondVespersShortResponsory.FirstPart = databaseRow.respBreuVespres1;
        this.SecondVespersShortResponsory.SecondPart = databaseRow.respBreuVespres2;
        this.SecondVespersShortResponsory.ThirdPart = databaseRow.respBreuVespres3;

        this.SecondVespersEvangelicalAntiphon = databaseRow.antMaria;
        this.SecondVespersPrayers = databaseRow.pregariesVespres;
    }

    Id: number;
    Celebration: CelebrationInformation = new CelebrationInformation();
    FirstVespersLatinAnthem: string;
    FirstVespersCatalanAnthem: string;
    FirstVespersFirstPsalm: Psalm = new Psalm();
    FirstVespersSecondPsalm: Psalm = new Psalm();
    FirstVespersThirdPsalm: Psalm = new Psalm();
    FirstVespersShortReading: ShortReading = new ShortReading();
    FirstVespersShortResponsory: ShortResponsory = new ShortResponsory();
    FirstVespersEvangelicalAntiphon: string;
    FirstVespersPrayers: string;
    FirstVespersFinalPrayer: string;
    InvitationAntiphon: string;
    OfficeLatinAnthem: string;
    OfficeCatalanAnthem: string;
    OfficeFirstPsalm: Psalm = new Psalm();
    OfficeSecondPsalm: Psalm = new Psalm();
    OfficeThirdPsalm: Psalm = new Psalm();
    OfficeResponsory: Responsory = new Responsory();
    OfficeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    LaudesFirstPsalm: Psalm = new Psalm();
    LaudesSecondPsalm: Psalm = new Psalm();
    LaudesThirdPsalm: Psalm = new Psalm();
    LaudesShortReading: ShortReading = new ShortReading();
    LaudesShortResponsory: ShortResponsory = new ShortResponsory();
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    SecondVespersLatinAnthem: string;
    SecondVespersCatalanAnthem: string;
    SecondVespersFirstPsalm: Psalm = new Psalm();
    SecondVespersSecondPsalm: Psalm = new Psalm();
    SecondVespersThirdPsalm: Psalm = new Psalm();
    SecondVespersShortReading: ShortReading = new ShortReading();
    SecondVespersShortResponsory: ShortResponsory = new ShortResponsory();
    SecondVespersEvangelicalAntiphon: string;
    SecondVespersPrayers: string;
    SecondVespersFinalPrayer: string;
}
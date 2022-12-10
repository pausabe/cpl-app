import {HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory} from "./CommonParts";

export default class EasterSunday {
    static MasterName: string = "tempsQuaresmaDiumPasq";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;

            this.OfficeFirstReading.Reference = databaseRow.referencia1;
            this.OfficeFirstReading.Quote = databaseRow.citaLect1Ofici;
            this.OfficeFirstReading.Title = databaseRow.titolLect1Ofici;
            this.OfficeFirstReading.Reading = databaseRow.lectura1;
            this.OfficeFirstPsalm.Antiphon = databaseRow.ant1Ofici;
            this.OfficeFirstPsalm.Title = databaseRow.citaSalm1Ofici;
            this.OfficeFirstPsalm.Psalm = databaseRow.salm1Ofici;
            this.OfficeFirstPsalm.Prayer = databaseRow.oracioSalm1Ofici;

            this.OfficeSecondReading.Reference = databaseRow.referencia2Ofici;
            this.OfficeSecondReading.Quote = databaseRow.citaLec2Ofici;
            this.OfficeSecondReading.Title = databaseRow.titolLect2Ofici;
            this.OfficeSecondReading.Reading = databaseRow.lectura2;
            this.OfficeSecondPsalm.Antiphon = databaseRow.ant2Ofici;
            this.OfficeSecondPsalm.Title = databaseRow.citaSalm2Ofici;
            this.OfficeSecondPsalm.Psalm = databaseRow.salm2Ofici;
            this.OfficeSecondPsalm.Prayer = databaseRow.oracioSalm2Ofici;

            this.OfficeThirdReading.Reference = databaseRow.referencia3Ofici;
            this.OfficeThirdReading.Quote = databaseRow.citaLec3Ofici;
            this.OfficeThirdReading.Title = databaseRow.titolLect3Ofici;
            this.OfficeThirdReading.Reading = databaseRow.lectura3;
            this.OfficeThirdPsalm.Antiphon = databaseRow.ant3Ofici;
            this.OfficeThirdPsalm.Title = databaseRow.citaSalm3Ofici;
            this.OfficeThirdPsalm.Psalm = databaseRow.salm3Ofici;
            this.OfficeThirdPsalm.Prayer = ""; // Missing column

            this.OfficeFourthReading.Reference = databaseRow.referencia4Ofici;
            this.OfficeFourthReading.Quote = databaseRow.citaLec4Ofici;
            this.OfficeFourthReading.Title = databaseRow.titolLect4Ofici;
            this.OfficeFourthReading.Reading = databaseRow.lectura4;
            this.OfficeFourthPsalm.Antiphon = ""; // Missing column
            this.OfficeFourthPsalm.Title = ""; // Missing column
            this.OfficeFourthPsalm.Psalm = ""; // Missing column
            this.OfficeFourthPsalm.Prayer = databaseRow.oracioSalm4Ofici;

            this.OfficeFinalPrayer = databaseRow.oraFiLaudes;

            this.InvitationAntiphon = databaseRow.antInvitatori;

            this.LaudesLatinAnthem = databaseRow.himneLlatiLaudes;
            this.LaudesCatalanAnthem = databaseRow.himneCatLaudes;

            this.LaudesFirstPsalm.Antiphon = databaseRow.ant1Laudes;
            this.LaudesFirstPsalm.Title = databaseRow.titol1Laudes;
            this.LaudesFirstPsalm.Psalm = databaseRow.text1Laudes;
            this.LaudesFirstPsalm.HasGloryPrayer = databaseRow.gloria1Laudes === "1";

            this.LaudesSecondPsalm.Antiphon = databaseRow.ant2Laudes;
            this.LaudesSecondPsalm.Title = databaseRow.titol2Laudes;
            this.LaudesSecondPsalm.Psalm = databaseRow.text2Laudes;
            this.LaudesSecondPsalm.HasGloryPrayer = databaseRow.gloria2Laudes === "1";

            this.LaudesThirdPsalm.Antiphon = databaseRow.ant3Laudes;
            this.LaudesThirdPsalm.Title = databaseRow.titol3Laudes;
            this.LaudesThirdPsalm.Psalm = databaseRow.text3Laudes;
            this.LaudesThirdPsalm.HasGloryPrayer = databaseRow.gloria3Laudes === "1";

            this.LaudesShortReading.Quote = databaseRow.citaLBLaudes;
            this.LaudesShortReading.ShortReading = databaseRow.lecturaBreuLaudes;

            this.LaudesShortResponsory.HasSpecialAntiphon = true;
            this.LaudesShortResponsory.SpecialAntiphon = databaseRow.antEspecialLaudes;
            this.LaudesEvangelicalAntiphon = databaseRow.antZacaries;
            this.LaudesPrayers = databaseRow.pregariesLaudes;
            this.LaudesFinalPrayer = databaseRow.oraFiLaudes;

            this.HourPrayerFirstPsalm.Title = databaseRow.titol1salm117;
            this.HourPrayerFirstPsalm.Psalm = databaseRow.part1Salm117;
            this.HourPrayerFirstPsalm.HasGloryPrayer = databaseRow.gloria1salm117 === "1";

            this.HourPrayerSecondPsalm.Title = databaseRow.titol2salm117;
            this.HourPrayerSecondPsalm.Psalm = databaseRow.part2Salm117;
            this.HourPrayerSecondPsalm.HasGloryPrayer = databaseRow.gloria2salm117 === "1";

            this.HourPrayerThirdPsalm.Title = databaseRow.titol3salm117;
            this.HourPrayerThirdPsalm.Psalm = databaseRow.part3Salm117;
            this.HourPrayerThirdPsalm.HasGloryPrayer = databaseRow.gloria3salm117 === "1";

            this.ThirdHourParts.LatinAnthem = databaseRow.himneTerciaLlati;
            this.ThirdHourParts.CatalanAnthem = databaseRow.himneTerciaCat;
            this.ThirdHourParts.Antiphon = databaseRow.antMenorTercia;
            this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLBTercia;
            this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
            this.ThirdHourParts.Responsory.Versicle = databaseRow.responsoriMenorV;
            this.ThirdHourParts.Responsory.Response = databaseRow.responsoriMenorR;
            this.ThirdHourParts.FinalPrayer = databaseRow.oraFiMenor;

            this.SixthHourParts.LatinAnthem = databaseRow.himneSextaLlati;
            this.SixthHourParts.CatalanAnthem = databaseRow.himneSextaCat;
            this.SixthHourParts.Antiphon = databaseRow.antMenorSexta;
            this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
            this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
            this.SixthHourParts.Responsory.Versicle = databaseRow.responsoriMenorV;
            this.SixthHourParts.Responsory.Response = databaseRow.responsoriMenorR;
            this.SixthHourParts.FinalPrayer = databaseRow.oraFiMenor;

            this.NinthHourParts.LatinAnthem = databaseRow.himneNonaLlati;
            this.NinthHourParts.CatalanAnthem = databaseRow.himneNonaCat;
            this.NinthHourParts.Antiphon = databaseRow.antMenorNona;
            this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
            this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
            this.NinthHourParts.Responsory.Versicle = databaseRow.responsoriMenorV;
            this.NinthHourParts.Responsory.Response = databaseRow.responsoriMenorR;
            this.NinthHourParts.FinalPrayer = databaseRow.oraFiMenor;

            this.VespersLatinAnthem = databaseRow.himneLlatiVespres;
            this.VespersCatalanAnthem = databaseRow.himneCatVespres;

            this.VespersFirstPsalm.Antiphon = databaseRow.ant1Vespres;
            this.VespersFirstPsalm.Title = databaseRow.titol1Vespres;
            this.VespersFirstPsalm.Psalm = databaseRow.text1Vespres;
            this.VespersFirstPsalm.HasGloryPrayer = databaseRow.gloria1Vespres === "1";

            this.VespersSecondPsalm.Antiphon = databaseRow.ant2Vespres;
            this.VespersSecondPsalm.Title = databaseRow.titol2Vespres;
            this.VespersSecondPsalm.Psalm = databaseRow.text2Vespres;
            this.VespersSecondPsalm.HasGloryPrayer = databaseRow.gloria2Vespres === "1";

            this.VespersThirdPsalm.Antiphon = databaseRow.ant3Vespres;
            this.VespersThirdPsalm.Title = databaseRow.titol3Vespres;
            this.VespersThirdPsalm.Psalm = databaseRow.text3Vespres;
            this.VespersThirdPsalm.HasGloryPrayer = databaseRow.gloria3Vespres === "1";

            this.VespersShortReading.Quote = databaseRow.citaLBVespres;
            this.VespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;

            this.VespersShortResponsory.HasSpecialAntiphon = true;
            this.VespersShortResponsory.SpecialAntiphon = databaseRow.antEspecialVespres;
            this.VespersEvangelicalAntiphon = databaseRow.antMaria;
            this.VespersPrayers = databaseRow.pregariesVespres;
            this.VespersFinalPrayer = databaseRow.oraFiVespres;

            this.NightPrayerAntiphon = databaseRow.antCompletes;
        }
    }

    Id: number;
    InvitationAntiphon: string;
    OfficeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeFirstPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    OfficeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeSecondPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    OfficeThirdReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeThirdPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    OfficeFourthReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeFourthPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    OfficeFinalPrayer; string;
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    LaudesFirstPsalm: Psalm = new Psalm();
    LaudesSecondPsalm: Psalm = new Psalm();
    LaudesThirdPsalm: Psalm = new Psalm();
    LaudesShortReading: ShortReading = new ShortReading();
    LaudesShortResponsory: ShortResponsory = new ShortResponsory();
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    LaudesFinalPrayer: string;
    HourPrayerFirstPsalm: Psalm = new Psalm();
    HourPrayerSecondPsalm: Psalm = new Psalm();
    HourPrayerThirdPsalm: Psalm = new Psalm();
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    VespersLatinAnthem: string;
    VespersCatalanAnthem: string;
    VespersFirstPsalm: Psalm = new Psalm();
    VespersSecondPsalm: Psalm = new Psalm();
    VespersThirdPsalm: Psalm = new Psalm();
    VespersShortReading: ShortReading = new ShortReading();
    VespersShortResponsory: ShortResponsory = new ShortResponsory();
    VespersEvangelicalAntiphon: string;
    VespersPrayers: string;
    VespersFinalPrayer: string;
    NightPrayerAntiphon: string;
}

class EasterOfficePsalm{
    Antiphon: string;
    Title: string;
    Psalm: string;
    Prayer: string;
}
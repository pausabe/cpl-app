import {HourCommonParts, LectureOfTheOffice, Psalm, Responsory, ShortReading} from "./CommonParts";

export default class EasterSunday {
    static MasterName: string = "tempsQuaresmaDiumPasq";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

        this.OfficeFirstReading.Reference = databaseRow.referencia1;
        this.OfficeFirstReading.Quote = databaseRow.citaLect1Ofici;
        this.OfficeFirstReading.Title = databaseRow.titolLect1Ofici;
        this.OfficeFirstReading.Lecture = databaseRow.lectura1;
        this.OfficeFirstPsalm.Antiphon = databaseRow.ant1Ofici;
        this.OfficeFirstPsalm.Quote = databaseRow.citaSalm1Ofici;
        this.OfficeFirstPsalm.Psalm = databaseRow.salm1Ofici;
        this.OfficeFirstPsalm.Prayer = databaseRow.oracioSalm1Ofici;

        this.OfficeSecondReading.Reference = databaseRow.referencia2Ofici;
        this.OfficeSecondReading.Quote = databaseRow.citaLec2Ofici;
        this.OfficeSecondReading.Title = databaseRow.titolLect2Ofici;
        this.OfficeSecondReading.Lecture = databaseRow.lectura2;
        this.OfficeSecondPsalm.Antiphon = databaseRow.ant2Ofici;
        this.OfficeSecondPsalm.Quote = databaseRow.citaSalm2Ofici;
        this.OfficeSecondPsalm.Psalm = databaseRow.salm2Ofici;
        this.OfficeSecondPsalm.Prayer = databaseRow.oracioSalm2Ofici;

        this.OfficeThirdReading.Reference = databaseRow.referencia3Ofici;
        this.OfficeThirdReading.Quote = databaseRow.citaLec3Ofici;
        this.OfficeThirdReading.Title = databaseRow.titolLect3Ofici;
        this.OfficeThirdReading.Lecture = databaseRow.lectura3;
        this.OfficeThirdPsalm.Antiphon = databaseRow.ant3Ofici;
        this.OfficeThirdPsalm.Quote = databaseRow.citaSalm3Ofici;
        this.OfficeThirdPsalm.Psalm = databaseRow.salm3Ofici;
        this.OfficeThirdPsalm.Prayer = ""; // Missing column

        this.OfficeThirdReading.Reference = databaseRow.referencia4Ofici;
        this.OfficeThirdReading.Quote = databaseRow.citaLec4Ofici;
        this.OfficeThirdReading.Title = databaseRow.titolLect4Ofici;
        this.OfficeThirdReading.Lecture = databaseRow.lectura4;
        this.OfficeThirdPsalm.Antiphon = ""; // Missing column
        this.OfficeThirdPsalm.Quote = ""; // Missing column
        this.OfficeThirdPsalm.Psalm = ""; // Missing column
        this.OfficeThirdPsalm.Prayer = databaseRow.oracioSalm4Ofici;

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

        this.LaudesSpecialAntiphon = databaseRow.antEspecialLaudes;
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

        this.SixthHourParts.LatinAnthem = databaseRow.himneSextaLlati;
        this.SixthHourParts.CatalanAnthem = databaseRow.himneSextaCat;
        this.SixthHourParts.Antiphon = databaseRow.antMenorSexta;
        this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
        this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;

        this.NinthHourParts.LatinAnthem = databaseRow.himneNonaLlati;
        this.NinthHourParts.CatalanAnthem = databaseRow.himneNonaCat;
        this.NinthHourParts.Antiphon = databaseRow.antMenorNona;
        this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
        this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;

        this.HoursResponsory.Versicle = databaseRow.responsoriMenorV;
        this.HoursResponsory.Response = databaseRow.responsoriMenorR;

        this.HoursFinalPrayer = databaseRow.oraFiMenor;

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

        this.VespersSpecialAntiphon = databaseRow.antEspecialVespres;
        this.VespersEvangelicalAntiphon = databaseRow.antMaria;
        this.VespersPrayers = databaseRow.pregariesVespres;
        this.VespersFinalPrayer = databaseRow.oraFiVespres;

        this.NightPrayerAntiphon = databaseRow.antCompletes;
    }

    Id: number;
    InvitationAntiphon: string;
    OfficeFirstReading: LectureOfTheOffice = new LectureOfTheOffice();
    OfficeFirstPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    OfficeSecondReading: LectureOfTheOffice = new LectureOfTheOffice();
    OfficeSecondPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    OfficeThirdReading: LectureOfTheOffice = new LectureOfTheOffice();
    OfficeThirdPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    OfficeFourthReading: LectureOfTheOffice = new LectureOfTheOffice();
    OfficeFourthPsalm: EasterOfficePsalm = new EasterOfficePsalm();
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    LaudesFirstPsalm: Psalm = new Psalm();
    LaudesSecondPsalm: Psalm = new Psalm();
    LaudesThirdPsalm: Psalm = new Psalm();
    LaudesShortReading: ShortReading = new ShortReading();
    LaudesSpecialAntiphon: string;
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    LaudesFinalPrayer: string;
    HourPrayerFirstPsalm: Psalm = new Psalm();
    HourPrayerSecondPsalm: Psalm = new Psalm();
    HourPrayerThirdPsalm: Psalm = new Psalm();
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    HoursResponsory: Responsory = new Responsory();
    HoursFinalPrayer: string;
    VespersLatinAnthem: string;
    VespersCatalanAnthem: string;
    VespersFirstPsalm: Psalm = new Psalm();
    VespersSecondPsalm: Psalm = new Psalm();
    VespersThirdPsalm: Psalm = new Psalm();
    VespersShortReading: ShortReading = new ShortReading();
    VespersSpecialAntiphon: string;
    VespersEvangelicalAntiphon: string;
    VespersPrayers: string;
    VespersFinalPrayer: string;
    NightPrayerAntiphon: string;
}

class EasterOfficePsalm{
    Antiphon: string;
    Quote: string;
    Psalm: string;
    Prayer: string;
}
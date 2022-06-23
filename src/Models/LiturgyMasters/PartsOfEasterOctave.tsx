export default class PartsOfEasterOctave {
    static MasterName: string = "tempsPasquaOct";

    constructor(databaseRow) {
        this.Id = databaseRow.id;

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
        this.OfficeFirstReading.Lecture = databaseRow.lectura1;
        this.OfficeFirstReading.Responsory.Quote = databaseRow.citaResp1Ofici;
        this.OfficeFirstReading.Responsory.FirstPart = databaseRow.resp1Part1Ofici;
        this.OfficeFirstReading.Responsory.SecondPart = databaseRow.resp1Part2Ofici;
        this.OfficeFirstReading.Responsory.ThirdPart = databaseRow.resp1Part3Ofici;

        this.OfficeFirstReading.Reference = databaseRow.referencia2Ofici;
        this.OfficeFirstReading.Quote = databaseRow.citaLect2Ofici;
        this.OfficeFirstReading.Title = databaseRow.titolLect2Ofici;
        this.OfficeFirstReading.Lecture = databaseRow.lectura2;
        this.OfficeFirstReading.Responsory.Quote = databaseRow.citaResp2Ofici;
        this.OfficeFirstReading.Responsory.FirstPart = databaseRow.resp2Part1Ofici;
        this.OfficeFirstReading.Responsory.SecondPart = databaseRow.resp2Part2Ofici;
        this.OfficeFirstReading.Responsory.ThirdPart = databaseRow.resp2Part3Ofici;

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

        this.ThirdHourParts.Antiphon = databaseRow.antMenorTercia;
        this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLBTercia;
        this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;

        this.SixthHourParts.Antiphon = databaseRow.antMenorSexta;
        this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
        this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;

        this.NinthHourParts.Antiphon = databaseRow.antMenorNona;
        this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
        this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;

        this.HoursFinalPrayer = databaseRow.oraFiMenor;

        this.VespersShortReading.Quote = databaseRow.citaLBVespres;
        this.VespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;

        this.VespersSpecialAntiphon = databaseRow.antEspecialVespres;
        this.VespersEvangelicalAntiphon = databaseRow.antMaria;
        this.VespersPrayers = databaseRow.pregariesVespres;
        this.VespersFinalPrayer = databaseRow.oraFiVespres;

        this.NightPrayerAntiphon = databaseRow.antCompletes;
    }

    Id: number;
    OfficeFirstPsalm: Psalm;
    OfficeSecondPsalm: Psalm;
    OfficeThirdPsalm: Psalm;
    OfficeResponsory: Responsory;
    OfficeFirstReading: LectureOfTheOffice;
    OfficeSecondReading: LectureOfTheOffice;
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    LaudesShortReading: ShortReading;
    LaudesSpecialAntiphon: string;
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    LaudesFinalPrayer: string;
    HourPrayerFirstPsalm: Psalm;
    HourPrayerSecondPsalm: Psalm;
    HourPrayerThirdPsalm: Psalm;
    ThirdHourParts: HourCommonParts;
    SixthHourParts: HourCommonParts;
    NinthHourParts: HourCommonParts;
    HoursResponsory: Responsory;
    HoursFinalPrayer: string;
    VespersShortReading: ShortReading;
    VespersSpecialAntiphon: string;
    VespersEvangelicalAntiphon: string;
    VespersPrayers: string;
    VespersFinalPrayer: string;
    NightPrayerAntiphon: string;
}
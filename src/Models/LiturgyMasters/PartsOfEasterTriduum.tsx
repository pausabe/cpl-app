import {HourCommonParts, ReadingOfTheOffice, Psalm, Responsory, ShortReading, ShortResponsory} from "./CommonParts";
import {shadow} from "react-native-paper";

export default class PartsOfEasterTriduum {
    static MasterName: string = "tempsQuaresmaTridu";

    constructor(databaseRow: any = undefined) {
        if(databaseRow) {
            this.Id = databaseRow.id;

            this.InvitationAntiphon = databaseRow.antInvitatori;

            this.OfficeLatinAnthem = databaseRow.himneDSOLLlati;
            this.OfficeCatalanAnthem = databaseRow.himneDSOLCat;

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

            this.OfficeFinalPrayer = databaseRow.oraFiOfici;

            this.LaudesLatinAnthem = databaseRow.himneDSOLaudesllati;
            this.LaudesCatalanAnthem = databaseRow.himneDSOLaudescat;

            this.LaudesFirstPsalm.Antiphon = databaseRow.ant1Laudes;
            this.LaudesFirstPsalm.Title = databaseRow.titol1Laudes;
            this.LaudesFirstPsalm.Psalm = databaseRow.salm1Laudes;
            this.LaudesFirstPsalm.HasGloryPrayer = databaseRow.gloriaLaudes1 === "1";

            this.LaudesSecondPsalm.Antiphon = databaseRow.ant2Laudes;
            this.LaudesSecondPsalm.Title = databaseRow.titol2Laudes;
            this.LaudesSecondPsalm.Psalm = databaseRow.salm2Laudes;
            this.LaudesSecondPsalm.HasGloryPrayer = databaseRow.gloriaLaudes2 === "1";

            this.LaudesThirdPsalm.Antiphon = databaseRow.ant3Laudes;
            this.LaudesThirdPsalm.Title = databaseRow.titol3Laudes;
            this.LaudesThirdPsalm.Psalm = databaseRow.salm3Laudes;
            this.LaudesThirdPsalm.HasGloryPrayer = databaseRow.gloriaLaudes3 === "1";

            this.LaudesShortReading.Quote = databaseRow.citaLBLaudes;
            this.LaudesShortReading.ShortReading = databaseRow.lecturaBreuLaudes;

            this.LaudesShortResponsory.HasSpecialAntiphon = true;
            this.LaudesShortResponsory.SpecialAntiphon = databaseRow.antEspecialLaudes;

            this.LaudesEvangelicalAntiphon = databaseRow.antZacaries;
            this.LaudesPrayers = databaseRow.pregariesLaudes;
            this.LaudesFinalPrayer = databaseRow.oraFiLaudes;

            this.ThirdHourParts.LatinAnthem = databaseRow.himneLlatiTercia;
            this.ThirdHourParts.CatalanAnthem = databaseRow.himneCatTercia;
            this.ThirdHourParts.Antiphon = databaseRow.antTercia;
            this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLectBreuTercia;
            this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
            this.ThirdHourParts.Responsory.Versicle = databaseRow.respVTercia;
            this.ThirdHourParts.Responsory.Response = databaseRow.respRTercia;
            this.ThirdHourParts.FinalPrayer = databaseRow.oraFiMenor;

            this.SixthHourParts.LatinAnthem = databaseRow.himneLlatiSexta;
            this.SixthHourParts.CatalanAnthem = databaseRow.himneCatSexta;
            this.SixthHourParts.Antiphon = databaseRow.antSexta;
            this.SixthHourParts.ShortReading.Quote = databaseRow.citaLectBreuSexta;
            this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
            this.SixthHourParts.Responsory.Versicle = databaseRow.respVSexta;
            this.SixthHourParts.Responsory.Response = databaseRow.respRSexta;
            this.SixthHourParts.FinalPrayer = databaseRow.oraFiMenor;

            this.NinthHourParts.LatinAnthem = databaseRow.himneLlatiNona;
            this.NinthHourParts.CatalanAnthem = databaseRow.himneCatNona;
            this.NinthHourParts.Antiphon = databaseRow.antNona;
            this.NinthHourParts.ShortReading.Quote = databaseRow.citaLectBreuNona;
            this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
            this.NinthHourParts.Responsory.Versicle = databaseRow.respVNona;
            this.NinthHourParts.Responsory.Response = databaseRow.respRNona;
            this.NinthHourParts.FinalPrayer = databaseRow.oraFiMenor;

            this.HourPrayerFirstPsalm.Title = databaseRow.titolSalmMenor1;
            this.HourPrayerFirstPsalm.Psalm = databaseRow.salmMenor1;
            this.HourPrayerFirstPsalm.HasGloryPrayer = databaseRow.gloriaMenor1 === "1";

            this.HourPrayerSecondPsalm.Title = databaseRow.titolSalmMenor2;
            this.HourPrayerSecondPsalm.Psalm = databaseRow.salmMenor2;
            this.HourPrayerSecondPsalm.HasGloryPrayer = databaseRow.gloriaMenor2 === "1";

            this.HourPrayerThirdPsalm.Title = databaseRow.titolSalmMenor3;
            this.HourPrayerThirdPsalm.Psalm = databaseRow.salmMenor3;
            this.HourPrayerThirdPsalm.HasGloryPrayer = databaseRow.gloriaMenor3 === "1";

            this.VespersLatinAnthem = databaseRow.himneDSOVespresllati;
            this.VespersCatalanAnthem = databaseRow.himneDSOVespresCat;

            this.VespersFirstPsalm.Antiphon = databaseRow.ant1Vespres;
            this.VespersFirstPsalm.Title = databaseRow.titol1Vespres;
            this.VespersFirstPsalm.Psalm = databaseRow.salm1Vespres;
            this.VespersFirstPsalm.HasGloryPrayer = databaseRow.gloriaVespres1 === "1";

            this.VespersSecondPsalm.Antiphon = databaseRow.ant2Vespres;
            this.VespersSecondPsalm.Title = databaseRow.titol2Vespres;
            this.VespersSecondPsalm.Psalm = databaseRow.salm2Vespres;
            this.VespersSecondPsalm.HasGloryPrayer = databaseRow.gloriaVespres2 === "1";

            this.VespersThirdPsalm.Antiphon = databaseRow.ant3Vespres;
            this.VespersThirdPsalm.Title = databaseRow.titol3Vespres;
            this.VespersThirdPsalm.Psalm = databaseRow.salm3Vespres;
            this.VespersThirdPsalm.HasGloryPrayer = databaseRow.gloriaVespres3 === "1";

            this.VespersShortReading.Quote = databaseRow.citaLBVespres;
            this.VespersShortReading.ShortReading = databaseRow.lecturaBreuVespres;

            this.VespersShortResponsory.HasSpecialAntiphon = true;
            this.VespersShortResponsory.SpecialAntiphon = databaseRow.antifonaEspecialVespres;
            this.VespersEvangelicalAntiphon = databaseRow.antMaria;
            this.VespersPrayers = databaseRow.pregariesVespres;
            this.VespersFinalPrayer = databaseRow.oraFiVespres;

            this.NightPrayerAntiphon = databaseRow.antCompletes;
        }
    }

    Id: number;
    InvitationAntiphon: string;
    OfficeLatinAnthem: string;
    OfficeCatalanAnthem: string;
    OfficeFirstPsalm: Psalm = new Psalm();
    OfficeSecondPsalm: Psalm = new Psalm();
    OfficeThirdPsalm: Psalm = new Psalm();
    OfficeResponsory: Responsory = new Responsory();
    OfficeFirstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeSecondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
    OfficeFinalPrayer: string;
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
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    HourPrayerFirstPsalm: Psalm = new Psalm();
    HourPrayerSecondPsalm: Psalm = new Psalm();
    HourPrayerThirdPsalm: Psalm = new Psalm();
    VespersLatinAnthem: string;
    VespersCatalanAnthem: string;
    VespersFirstPsalm: Psalm = new Psalm();
    VespersSecondPsalm: Psalm = new Psalm();
    VespersThirdPsalm: Psalm = new Psalm();
    VespersShortReading: ShortReading = new ShortReading();
    VespersEvangelicalAntiphon: string;
    VespersShortResponsory: ShortResponsory = new ShortResponsory();
    VespersPrayers: string;
    VespersFinalPrayer: string;
    NightPrayerAntiphon: string;
}
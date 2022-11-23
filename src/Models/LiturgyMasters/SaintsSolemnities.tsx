import {HourCommonParts, Psalm, ReadingOfTheOffice, Responsory, ShortReading, ShortResponsory} from "./CommonParts";
import CommonOffice from "./CommonOffices";
import CelebrationInformation from "../HoursLiturgy/CelebrationInformation";
import {CelebrationSpecificClassification, CelebrationType} from "../../Services/DatabaseEnums";
import Solemnity from "./Solemnity";

export default class SaintsSolemnities extends Solemnity{
    static MasterName: string = "santsSolemnitats";

    constructor(databaseRow: any = undefined) {
        super();

        if(databaseRow) {
            this.Id = databaseRow.id;

            this.Celebration.SpecificClassification = this.GetSpecificClassificationByCelebrationType(databaseRow.Precedencia, databaseRow.Cat, databaseRow.Diocesis);
            this.Celebration.Diocese = databaseRow.Diocesis;
            this.Celebration.Category = databaseRow.Categoria;
            this.Celebration.Title = databaseRow.nomMemoria;
            this.Celebration.Description = databaseRow.infoMemoria;

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
            this.FirstVespersThirdPsalm.Comment = databaseRow.cita3Vespres1;
            this.FirstVespersThirdPsalm.Psalm = databaseRow.text3Vespres1;
            this.FirstVespersThirdPsalm.HasGloryPrayer = databaseRow.gloria3Vespres1 === "1";

            this.FirstVespersShortReading.Quote = databaseRow.citaLBVespres1;
            this.FirstVespersShortReading.ShortReading = databaseRow.lecturaBreuVespres1;

            this.FirstVespersShortResponsory.FirstPart = databaseRow.respBreuVespres1Part1;
            this.FirstVespersShortResponsory.SecondPart = databaseRow.respBreuVespres1Part2;
            this.FirstVespersShortResponsory.ThirdPart = databaseRow.respBreuVespres1Part3;

            this.FirstVespersEvangelicalAntiphon = databaseRow.antMaria1;
            this.FirstVespersPrayers = databaseRow.pregariesVespres1;
            this.FirstVespersFinalPrayer = databaseRow.oraFiVespres1;

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

            this.OfficeFinalPrayer = databaseRow.oraFiOfici;

            this.LaudesLatinAnthem = databaseRow.himneLaudesLlati;
            this.LaudesCatalanAnthem = databaseRow.himneLaudesCat;

            this.LaudesFirstAntiphon = databaseRow.ant1Laudes;
            this.LaudesSecondAntiphon = databaseRow.ant2Laudes;
            this.LaudesThirdAntiphon = databaseRow.ant3Laudes;

            this.LaudesShortReading.Quote = databaseRow.citaLBLaudes;
            this.LaudesShortReading.ShortReading = databaseRow.lecturaBreuLaudes;

            this.LaudesShortResponsory.FirstPart = databaseRow.resp2Part1Laudes;
            this.LaudesShortResponsory.SecondPart = databaseRow.resp2Part2Laudes;
            this.LaudesShortResponsory.ThirdPart = databaseRow.resp2Part3Laudes;

            this.LaudesEvangelicalAntiphon = databaseRow.antZacaries;
            this.LaudesPrayers = databaseRow.pregariesLaudes;
            this.LaudesFinalPrayer = databaseRow.oraFiLaudes;

            this.HoursFirstPsalm.Title = databaseRow.titolSalm1;
            this.HoursFirstPsalm.Psalm = databaseRow.salm1Menor;
            this.HoursFirstPsalm.HasGloryPrayer = databaseRow.gloriaSalm1 === "1";

            this.HoursSecondPsalm.Title = databaseRow.titolSalm2;
            this.HoursSecondPsalm.Psalm = databaseRow.salm2Menor;
            this.HoursSecondPsalm.HasGloryPrayer = databaseRow.gloriaSalm2 === "1";

            this.HoursThirdPsalm.Title = databaseRow.titolSalm3;
            this.HoursThirdPsalm.Psalm = databaseRow.salm3Menor;
            this.HoursThirdPsalm.HasGloryPrayer = databaseRow.gloriaSaml3 === "1";

            this.ThirdHourParts.Antiphon = databaseRow.antMenorTercia;
            this.ThirdHourParts.ShortReading.Quote = databaseRow.citaLBTercia;
            this.ThirdHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuTercia;
            this.ThirdHourParts.Responsory.Versicle = databaseRow.responsoriVTercia;
            this.ThirdHourParts.Responsory.Response = databaseRow.responsoriRTercia;

            this.SixthHourParts.Antiphon = databaseRow.antMenorSexta;
            this.SixthHourParts.ShortReading.Quote = databaseRow.citaLBSexta;
            this.SixthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuSexta;
            this.SixthHourParts.Responsory.Versicle = databaseRow.responsoriVSexta;
            this.SixthHourParts.Responsory.Response = databaseRow.responsoriRSexta;

            this.NinthHourParts.Antiphon = databaseRow.antMenorNona;
            this.NinthHourParts.ShortReading.Quote = databaseRow.citaLBNona;
            this.NinthHourParts.ShortReading.ShortReading = databaseRow.lecturaBreuNona;
            this.NinthHourParts.Responsory.Versicle = databaseRow.responsoriVNona;
            this.NinthHourParts.Responsory.Response = databaseRow.responsoriRNona;

            this.HoursFinalPrayer = databaseRow.oraFiMenor;

            this.SecondVespersLatinAnthem = databaseRow.himneVespres2Llati;
            this.SecondVespersCatalanAnthem = databaseRow.himneVespres2Cat;

            this.SecondVespersFirstPsalm.Antiphon = databaseRow.ant1Vespres2;
            this.SecondVespersFirstPsalm.Title = databaseRow.titol1Vespres2;
            this.SecondVespersFirstPsalm.Psalm = databaseRow.text1Vespres2;
            this.SecondVespersFirstPsalm.HasGloryPrayer = databaseRow.gloria1Vespres2 === "1";

            this.SecondVespersSecondPsalm.Antiphon = databaseRow.ant2Vespres2;
            this.SecondVespersSecondPsalm.Title = databaseRow.titol2Vespres2;
            this.SecondVespersSecondPsalm.Psalm = databaseRow.text2Vespres2;
            this.SecondVespersSecondPsalm.HasGloryPrayer = databaseRow.gloria2Vespres2 === "1";

            this.SecondVespersThirdPsalm.Antiphon = databaseRow.ant3Vespres2;
            this.SecondVespersThirdPsalm.Title = databaseRow.titol3Vespres2;
            this.SecondVespersThirdPsalm.Psalm = databaseRow.text3Vespres2;
            this.SecondVespersThirdPsalm.HasGloryPrayer = databaseRow.gloria3Vespres2 === "1";

            this.SecondVespersShortReading.Quote = databaseRow.citaLBVespres2;
            this.SecondVespersShortReading.ShortReading = databaseRow.lecturaBreuVespres2;

            this.SecondVespersShortResponsory.FirstPart = databaseRow.respBreuVespres2Part1;
            this.SecondVespersShortResponsory.SecondPart = databaseRow.respBreuVespres2Part2;
            this.SecondVespersShortResponsory.ThirdPart = databaseRow.respBreuVespres2Part3;

            this.SecondVespersEvangelicalAntiphon = databaseRow.antMaria2;
            this.SecondVespersPrayers = databaseRow.pregariesVespres2;
            this.SecondVespersFinalPrayer = databaseRow.oraFiVespres2;
        }
    }

    private GetSpecificClassificationByCelebrationType(precedence: string, celebrationType: string, diocese: string) {
        let specificClassification: CelebrationSpecificClassification;
        if(celebrationType === CelebrationType.Solemnity || celebrationType === CelebrationType.Festivity){
            specificClassification = this.GetSpecificClassification(precedence);
        }
        else{
           specificClassification = diocese === '-'?
                CelebrationSpecificClassification.Generic : CelebrationSpecificClassification.Own;
        }
        return specificClassification;
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
    OfficeFinalPrayer: string;
    LaudesLatinAnthem: string;
    LaudesCatalanAnthem: string;
    LaudesFirstAntiphon: string;
    LaudesSecondAntiphon: string;
    LaudesThirdAntiphon: string;
    LaudesShortReading: ShortReading = new ShortReading();
    LaudesShortResponsory: ShortResponsory = new ShortResponsory();
    LaudesEvangelicalAntiphon: string;
    LaudesPrayers: string;
    LaudesFinalPrayer: string;
    HoursFirstPsalm: Psalm = new Psalm();
    HoursSecondPsalm: Psalm = new Psalm();
    HoursThirdPsalm: Psalm = new Psalm();
    ThirdHourParts: HourCommonParts = new HourCommonParts();
    SixthHourParts: HourCommonParts = new HourCommonParts();
    NinthHourParts: HourCommonParts = new HourCommonParts();
    HoursFinalPrayer: string;
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
    CommonOffices: CommonOffice;
    CommonOfficesForFirstVespers: CommonOffice;
}
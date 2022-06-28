import * as CelebrationHoursLiturgyService from "./CelebrationHoursLiturgyService";
import GLOBAL from '../../Utils/GlobalKeys';
import HoursLiturgy from "../../Models/HoursLiturgy/HoursLiturgy";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import Vespers from "../../Models/HoursLiturgy/Vespers";
import * as InvitationService from "./InvitationService";
import * as OfficeService from "./OfficeService";
import * as LaudesService from "./LaudesService";
import * as VespersService from "./VespersService";
import * as HoursService from "./HoursService";
import * as NightPrayerService from "./NightPrayerService";
import {Settings} from "../../Models/Settings";

export async function ObtainHoursLiturgy(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : Promise<HoursLiturgy> {
    let hoursLiturgy = new HoursLiturgy();
    const celebrationHoursLiturgy = CelebrationHoursLiturgyService.ObtainCelebrationHoursLiturgy();
    hoursLiturgy.Invitation = InvitationService.ObtainInvitation(liturgyMasters, celebrationHoursLiturgy.Office);
    hoursLiturgy.Office = OfficeService.ObtainOffice(liturgyMasters, celebrationHoursLiturgy.Office);
    hoursLiturgy.Laudes = LaudesService.ObtainLaudes(liturgyMasters, liturgyDayInformation, celebrationHoursLiturgy.Laudes, settings);
    hoursLiturgy.FirstVespers = ObtainFirstVespers();
    hoursLiturgy.SecondVespers = VespersService.ObtainVespers(liturgyMasters, celebrationHoursLiturgy.SecondVespers);
    hoursLiturgy.Hours = HoursService.ObtainHours(liturgyMasters, celebrationHoursLiturgy.Hours);
    hoursLiturgy.NightPrayer = NightPrayerService.ObtainNightPrayer(liturgyMasters, celebrationHoursLiturgy.NightPrayer);
    return hoursLiturgy;
}

function ObtainFirstVespers() : Vespers{
    let vespers = new Vespers();
    if (
        tomorrowCal === '-' || //demà no hi ha cap celebració
        tomorrowCal === 'F' || //demà hi ha Festa

        // TODO: HARDCODED These conditions below is there to fix Montserrat's Day. Fix properly (fa que les vespres siguin de Montserrat i no de St Jordi)
        (GlobalData.date.getFullYear() == 2019 && GlobalData.date.getMonth() == 3 && GlobalData.date.getDate() == 30) ||
        (GlobalData.date.getFullYear() == 2022 && GlobalData.date.getMonth() == 3 && GlobalData.date.getDate() == 27) ||

        (idTSF !== -1 && tomorrowCal !== 'TSF') || //quan dues TSF seguides es fa Vespres1 de la segona TSF. Basicamen evito el conflicte de les Vespres de Sagrada Familia quan cau en 31/12 i l'andemà és Mare de Déi 1/1 (únic conflicte possible entre TSF)
        (idDE !== -1 && tomorrowCal === '-') || //avui és DE i demà no hi ha celebració
        (GlobalData.date.getDay() === 0 && tomorrowCal === 'S' && GlobalData.LT !== GLOBAL.O_ORDINARI) //Amb això generalitzo que DiumengeOrdinari>S i potser no és així
    ) {
        LITURGIA.vespres1 = false;
        vespresCelDEF = CEL.VESPRES;
    }
    else if (tomorrowCal === 'T') { //demà és divendres Sant
        LITURGIA.vespres1 = false;
        vespresCelDEF = CEL.VESPRES1;
    }
    else {
        LITURGIA.vespres1 = true;
        vespresCelDEF = CEL.VESPRES1;
    }
    return vespers;
}

function creatingEmptyCEL() {
    OFICI = { //60
      diumPasqua: false,
      invitatori: '-',
      antInvitatori: '-',
      salm94: '-',
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      respV: '-',
      respR: '-',
      referencia1: '-',
      cita1: '-',
      titolLectura1: '-',
      lectura1: '-',
      citaResp1: '-',
      resp1Part1: '-',
      resp1Part2: '-',
      resp1Part3: '-',
      referencia2: '-',
      cita2: '-',
      titolLectura2: '-',
      lectura2: '-',
      versResp2: '-',
      resp2Part1: '-',
      resp2Part2: '-',
      resp2Part3: '-',
      referencia3: '-',
      cita3: '-',
      titolLectura3: '-',
      lectura3: '-',
      versResp3: '-',
      resp3Part1: '-',
      resp3Part2: '-',
      resp3Part3: '-',
      referencia4: '-',
      cita4: '-',
      titolLectura4: '-',
      lectura4: '-',
      versResp4: '-',
      resp4Part1: '-',
      resp4Part2: '-',
      resp4Part3: '-',
      himneOhDeu: '-',
      himneOhDeuBool: '-',
      oracio: '-',
      oracio1: '-',
      oracio2: '-',
      oracio3: '-',
    }

    LAUDES = { //31
      diumPasqua: false,
      invitatori: '-',
      antInvitatori: '-',
      salm94: '-',
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      calAntEspecial: '-',
      antEspecialLaudes: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      cantic: '-',
      antCantic: '-',
      pregaries: '-',
      oracio: '-',
    }

    TERCIA = { //24
      diumPasqua: false,
      himne: '-',
      antifones: '-',
      ant: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      respV: '-',
      respR: '-',
      oracio: '-',
    }

    SEXTA = { //24
      diumPasqua: false,
      himne: '-',
      antifones: '-',
      ant: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      respV: '-',
      respR: '-',
      oracio: '-',
    }

    NONA = { //24
      diumPasqua: false,
      himne: '-',
      antifones: '-',
      ant: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      respV: '-',
      respR: '-',
      oracio: '-',
    }

    VESPRES1 = { //28
      diumPasqua: false,
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      calAntEspecial: '-',
      antEspecialVespres: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      cantic: '-',
      antCantic: '-',
      pregaries: '-',
      oracio: '-',
    }

    VESPRES = { //28
      diumPasqua: false,
      himne: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      ant3: '-',
      titol3: '-',
      com3: '-',
      salm3: '-',
      gloria3: '-',
      vers: '-',
      lecturaBreu: '-',
      calAntEspecial: '-',
      antEspecialVespres: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      cantic: '-',
      antCantic: '-',
      pregaries: '-',
      oracio: '-',
    }

    COMPLETES = { //24
      himneLlati: '-',
      himneCat: '-',
      antifones: '-',
      ant1: '-',
      titol1: '-',
      com1: '-',
      salm1: '-',
      gloria1: '-',
      ant2: '-',
      titol2: '-',
      com2: '-',
      salm2: '-',
      gloria2: '-',
      vers: '-',
      lecturaBreu: '-',
      antRespEspecial: '-',
      respBreu1: '-',
      respBreu2: '-',
      respBreu3: '-',
      respV: '-',
      respR: '-',
      antCantic: '-',
      cantic: '-',
      oracio: '-',
      antMare: '-',
    }

    CEL = {
      INFO_CEL: INFO_CEL,
      OFICI: OFICI,
      LAUDES: LAUDES,
      HORA_MENOR: {
        TERCIA: TERCIA,
        SEXTA: SEXTA,
        NONA: NONA,
      },
      VESPRES: VESPRES,
      VESPRES1: VESPRES1,
      COMPLETES: COMPLETES,
    }
  }
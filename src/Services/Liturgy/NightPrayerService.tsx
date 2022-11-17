import NightPrayer from "../../Models/HoursLiturgy/NightPrayer";
import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import {LiturgySpecificDayInformation} from "../../Models/LiturgyDayInformation";
import {Settings} from "../../Models/Settings";
import {Psalm, ShortResponsory} from "../../Models/LiturgyMasters/CommonParts";
import {GenericLiturgyTimeType, SpecificLiturgyTimeType} from "../CelebrationTimeEnums";

export function ObtainNightPrayer(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : NightPrayer{
    let nightPrayer = new NightPrayer();
    nightPrayer.Anthem = GetAnthem(liturgyMasters, liturgyDayInformation, settings);
    const psalmody = GetPsalmody(liturgyMasters, liturgyDayInformation);
    nightPrayer.FirstPsalm = psalmody.FirstPsalm;
    nightPrayer.SecondPsalm = psalmody.SecondPsalm;
    nightPrayer.HasMultiplePsalms = liturgyMasters.CommonNightPrayerPsalter.HasTwoPsalms;
    nightPrayer.UseOnlyFirstPsalmAntiphon =
        liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.P_SETMANES &&
        liturgyDayInformation.GenericLiturgyTime === GenericLiturgyTimeType.Easter;
    nightPrayer.ShortReading = liturgyMasters.CommonNightPrayerPsalter.ShortReading;
    nightPrayer.ShortResponsory = GetShortResponsory(liturgyMasters, liturgyDayInformation);
    nightPrayer.EvangelicalAntiphon = GetEvangelicalAntiphon(liturgyMasters, liturgyDayInformation);
    nightPrayer.EvangelicalChant = liturgyMasters.Various.NightPrayerEvangelicalChant;
    nightPrayer.FinalPrayer = liturgyMasters.CommonNightPrayerPsalter.FinalPrayer;
    if(settings.UseLatin){
        nightPrayer.VirginMaryFinalAntiphonFirstOption = liturgyMasters.Various.NightPrayerFinalAntiphonLatinFirstOption;
        nightPrayer.VirginMaryFinalAntiphonSecondOption = liturgyMasters.Various.NightPrayerFinalAntiphonLatinSecondOption;
        nightPrayer.VirginMaryFinalAntiphonThirdOption = liturgyMasters.Various.NightPrayerFinalAntiphonLatinThirdOption;
        nightPrayer.VirginMaryFinalAntiphonFourthOption = liturgyMasters.Various.NightPrayerFinalAntiphonLatinFourthOption;
        nightPrayer.VirginMaryFinalAntiphonFifthOption = liturgyMasters.Various.NightPrayerFinalAntiphonLatinFifthOption;
    }
    else{
        nightPrayer.VirginMaryFinalAntiphonFirstOption = liturgyMasters.Various.NightPrayerFinalAntiphonCatalanFirstOption;
        nightPrayer.VirginMaryFinalAntiphonSecondOption = liturgyMasters.Various.NightPrayerFinalAntiphonCatalanSecondOption;
        nightPrayer.VirginMaryFinalAntiphonThirdOption = liturgyMasters.Various.NightPrayerFinalAntiphonCatalanThirdOption;
        nightPrayer.VirginMaryFinalAntiphonFourthOption = liturgyMasters.Various.NightPrayerFinalAntiphonCatalanFourthOption;
        nightPrayer.VirginMaryFinalAntiphonFifthOption = liturgyMasters.Various.NightPrayerFinalAntiphonCatalanFifthOption;
    }
    nightPrayer.PenitentialAct = liturgyMasters.Various.PenitentialAct;
    return nightPrayer;
}

function GetAnthem(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation, settings : Settings) : string{
    let anthem = settings.UseLatin? liturgyMasters.Various.NightPrayerLatinSecondOptionAnthem : liturgyMasters.Various.NightPrayerCatalanSecondOptionAnthem;
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.Q_SETMANES:
            if(liturgyDayInformation.Week == "1" || liturgyDayInformation.Week == "3" || liturgyDayInformation.Week == "5") {
                return settings.UseLatin? liturgyMasters.Various.NightPrayerLatinFirstOptionAnthem : liturgyMasters.Various.NightPrayerCatalanFirstOptionAnthem;
            }
            break;
        case SpecificLiturgyTimeType.A_SETMANES:
        case SpecificLiturgyTimeType.N_OCTAVA:
            return settings.UseLatin? liturgyMasters.Various.NightPrayerLatinFirstOptionAnthem : liturgyMasters.Various.NightPrayerCatalanFirstOptionAnthem;
        case SpecificLiturgyTimeType.A_FERIES:
            if(liturgyDayInformation.Date.getDate() == 24 && liturgyDayInformation.Date.getMonth() == 11){
                return settings.UseLatin? liturgyMasters.Various.NightPrayerLatinFirstOptionAnthem : liturgyMasters.Various.NightPrayerCatalanFirstOptionAnthem;
            }
            break;
        case SpecificLiturgyTimeType.N_ABANS:
            if(liturgyDayInformation.Date.getDate() < 5){
                return settings.UseLatin? liturgyMasters.Various.NightPrayerLatinFirstOptionAnthem : liturgyMasters.Various.NightPrayerCatalanFirstOptionAnthem;
            }
            break;
        default:
            if(liturgyDayInformation.GenericLiturgyTime === 'Pasqua'){
                const lentLatinAnthem = "Iesu, redémptor sǽculi,\nVerbum Patris altíssimi,\nlux lucis invisíbilis,\ncustos tuórum pérvigil:\n\nTu fabricátor ómnium\ndiscrétor atque témporum,\nfessa labóre córpora\nnoctis quiéte récrea.\n\nQui frangis ima tártara,\ntu nos ab hoste líbera,\nne váleat sedúcere\ntuo redémptos sánguine,\n\nUt, dum graváti córpore\nbrevi manémus témpore,\nsic caro nostra dórmiat\nut mens sopórem nésciat.\n\nIesu, tibi sit glória,\nqui morte victa prǽnites,\ncum Patre et almo Spíritu,\nin sempitérna sǽcula. \nAmen.";
                const lentCatalanAnthem = "Jesús, oh Verb del Déu excels,\nde tots els segles Redemptor,\nsou llum de llum que brilla al cel\ni sou dels homes bon Pastor.\n\nVós que heu creat tot l'univers,\nl'espai i el temps amb savi dit,\nel cos cansat reanimeu\namb el descans d'aquesta nit.\n\nAmb cor humil us supliquem,\noh Crist, que sou el germà gran,\nque no pertorbi l'enemic\nels redimits amb vostra Sang.\n\nQue en el temps breu que dura el son,\n-sots vostres ales descansant-\nrecobri forces nostre cos\ni l'esperit vetlli, estimant.\n\nA vós, Jesús, glorifiquem\nque resplendiu vencent la mort,\namb l'etern Pare i l'Esperit,\nara i per segles sense fi.\nAmén";
                return settings.UseLatin? lentLatinAnthem : lentCatalanAnthem;
            }
    }
    return anthem;
}

function GetPsalmody(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : {FirstPsalm : Psalm, SecondPsalm : Psalm}{
    let psalmody = {
        FirstPsalm: liturgyMasters.CommonNightPrayerPsalter.FirstPsalm,
        SecondPsalm: liturgyMasters.CommonNightPrayerPsalter.SecondPsalm
    }
    if(liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.P_SETMANES){
        psalmody.FirstPsalm.Antiphon = "Al·leluia, al·leluia, al·leluia.";
    }
    return psalmody;
}

function GetShortResponsory(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : ShortResponsory{
    let shortResponsory = new ShortResponsory();
    shortResponsory.HasSpecialAntiphon = false;
    shortResponsory.FirstPart = "A les vostres mans, Senyor,";
    shortResponsory.SecondPart = "Encomano el meu esperit.";
    shortResponsory.ThirdPart = "Vós, Déu fidel, ens heu redimit.";
    switch (liturgyDayInformation.SpecificLiturgyTime) {
        case SpecificLiturgyTimeType.P_SETMANES:
            shortResponsory.FirstPart = "A les vostres mans, Senyor, encomano el meu esperit,";
            shortResponsory.SecondPart = "Al·leluia, al·leluia.";
            shortResponsory.ThirdPart = "Vós, Déu fidel, ens heu redimit.";
            break;
        case SpecificLiturgyTimeType.Q_SET_SANTA:
            if(liturgyDayInformation.DayOfTheWeek === 4){
                shortResponsory.HasSpecialAntiphon = true;
                shortResponsory.SpecialAntiphon = "Crist es féu per nosaltres obedient fins a la mort.";
            }
            break;
        case SpecificLiturgyTimeType.Q_TRIDU:
            if(liturgyDayInformation.DayOfTheWeek === 5){
                shortResponsory.HasSpecialAntiphon = true;
                shortResponsory.SpecialAntiphon = "Crist es féu per nosaltres obedient fins a la mort i una mort de creu.";
            }
            else if(liturgyDayInformation.DayOfTheWeek === 6){
                shortResponsory.HasSpecialAntiphon = true;
                shortResponsory.SpecialAntiphon = "Crist es féu per nosaltres obedient fins a la mort i una mort de creu. Per això Déu l'ha exalçat i li ha concedit aquell nom que està per damunt de tot altre nom."
            }
            break;
    }
    if(liturgyDayInformation.GenericLiturgyTime === "Pasqua"){
        shortResponsory.HasSpecialAntiphon = true;
        shortResponsory.SpecialAntiphon = "Avui és el dia en què ha obrat el Senyor: alegrem-nos i celebrem-lo, al·leluia.";
    }
    return shortResponsory;
}

function GetEvangelicalAntiphon(liturgyMasters : LiturgyMasters, liturgyDayInformation : LiturgySpecificDayInformation) : string{
    let evangelicalAntiphon = "Salveu-nos, Senyor, durant el dia, guardeu-nos durant la nit, perquè sigui amb Crist la nostra vetlla i amb Crist el nostre descans.";
    if(liturgyDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.P_SETMANES){
        evangelicalAntiphon = evangelicalAntiphon + " Al·leluia.";
    }
    return evangelicalAntiphon;
}
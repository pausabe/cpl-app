import LiturgyMasters from "../../Models/LiturgyMasters/LiturgyMasters";
import ConcreteNamesInPrayers from "../../Models/HoursLiturgy/ConcreteNamesInPrayers";
import {Settings} from "../../Models/Settings";
import {DioceseName} from "../SettingsService";

export function ObtainConcreteNamesInPrayers(liturgyMasters: LiturgyMasters, settings: Settings) : ConcreteNamesInPrayers{
    let concreteNamesInPrayers = new ConcreteNamesInPrayers();

    concreteNamesInPrayers.Pope = liturgyMasters.Various.Pope;

    switch (settings.DioceseName) {
        case DioceseName.Barcelona:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.BarcelonaBishop;
            break;
        case DioceseName.Girona:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.GironaBishop;
            break;
        case DioceseName.Lleida:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.LleidaBishop;
            break;
        case DioceseName.SantFeliu:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.SantFeliuBishop;
            break;
        case DioceseName.Solsona:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.SolsonaBishop;
            break;
        case DioceseName.Tarragona:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.TarragonaBishop;
            break;
        case DioceseName.Terrassa:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.TerrassaBishop;
            break;
        case DioceseName.Tortosa:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.TortosaBishop;
            break;
        case DioceseName.Urgell:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.UrgellBishop;
            break;
        case DioceseName.Vic:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.VicBishop;
            break;
        case DioceseName.Andorra:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.AndorraBishop;
            break;
        case DioceseName.Mallorca:
            concreteNamesInPrayers.Bishop = liturgyMasters.Various.MallorcaBishop;
            break;
    }

    return concreteNamesInPrayers;
}
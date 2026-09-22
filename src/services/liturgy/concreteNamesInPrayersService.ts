import LiturgyMasters from '../../models/liturgy-masters/LiturgyMasters';
import ConcreteNamesInPrayers from '../../models/hours-liturgy/ConcreteNamesInPrayers';
import { Settings } from '../../models/Settings';
import { DioceseName } from '../SettingsService';

export function obtainConcreteNamesInPrayers(
  liturgyMasters: LiturgyMasters,
  settings: Settings,
): ConcreteNamesInPrayers {
  let concreteNamesInPrayers = new ConcreteNamesInPrayers();

  concreteNamesInPrayers.pope = liturgyMasters.various.pope;

  switch (settings.dioceseName) {
    case DioceseName.Barcelona:
      concreteNamesInPrayers.bishop = liturgyMasters.various.barcelonaBishop;
      break;
    case DioceseName.Girona:
      concreteNamesInPrayers.bishop = liturgyMasters.various.gironaBishop;
      break;
    case DioceseName.Lleida:
      concreteNamesInPrayers.bishop = liturgyMasters.various.lleidaBishop;
      break;
    case DioceseName.SantFeliu:
      concreteNamesInPrayers.bishop = liturgyMasters.various.santFeliuBishop;
      break;
    case DioceseName.Solsona:
      concreteNamesInPrayers.bishop = liturgyMasters.various.solsonaBishop;
      break;
    case DioceseName.Tarragona:
      concreteNamesInPrayers.bishop = liturgyMasters.various.tarragonaBishop;
      break;
    case DioceseName.Terrassa:
      concreteNamesInPrayers.bishop = liturgyMasters.various.terrassaBishop;
      break;
    case DioceseName.Tortosa:
      concreteNamesInPrayers.bishop = liturgyMasters.various.tortosaBishop;
      break;
    case DioceseName.Urgell:
      concreteNamesInPrayers.bishop = liturgyMasters.various.urgellBishop;
      break;
    case DioceseName.Vic:
      concreteNamesInPrayers.bishop = liturgyMasters.various.vicBishop;
      break;
    case DioceseName.Andorra:
      concreteNamesInPrayers.bishop = liturgyMasters.various.andorraBishop;
      break;
    case DioceseName.Mallorca:
      concreteNamesInPrayers.bishop = liturgyMasters.various.mallorcaBishop;
      break;
    case DioceseName.Menorca:
      concreteNamesInPrayers.bishop = liturgyMasters.various.menorcaBishop;
      break;
  }

  return concreteNamesInPrayers;
}

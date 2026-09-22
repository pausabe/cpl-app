import { Psalm, Responsory, ShortReading, ShortResponsory } from '../liturgy-masters/CommonParts';

export default class NightPrayer {
  anthem: string;
  hasMultiplePsalms: boolean;
  useOnlyFirstPsalmAntiphon: boolean;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  shortReading: ShortReading = new ShortReading();
  shortResponsory: ShortResponsory = new ShortResponsory();
  responsory: Responsory = new Responsory();
  evangelicalAntiphon: string;
  evangelicalChant: string;
  finalPrayer: string;
  virginMaryFinalAntiphonFirstOption: string;
  virginMaryFinalAntiphonSecondOption: string;
  virginMaryFinalAntiphonThirdOption: string;
  virginMaryFinalAntiphonFourthOption: string;
  virginMaryFinalAntiphonFifthOption: string;
  penitentialAct: string;
}

import { Psalm, Responsory, ShortReading, ShortResponsory } from '../liturgy-masters/CommonParts';

export default class NightPrayer {
  Anthem: string;
  HasMultiplePsalms: boolean;
  UseOnlyFirstPsalmAntiphon: boolean;
  FirstPsalm: Psalm = new Psalm();
  SecondPsalm: Psalm = new Psalm();
  ShortReading: ShortReading = new ShortReading();
  ShortResponsory: ShortResponsory = new ShortResponsory();
  Responsory: Responsory = new Responsory();
  EvangelicalAntiphon: string;
  EvangelicalChant: string;
  FinalPrayer: string;
  VirginMaryFinalAntiphonFirstOption: string;
  VirginMaryFinalAntiphonSecondOption: string;
  VirginMaryFinalAntiphonThirdOption: string;
  VirginMaryFinalAntiphonFourthOption: string;
  VirginMaryFinalAntiphonFifthOption: string;
  PenitentialAct: string;
}

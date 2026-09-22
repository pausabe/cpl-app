import { Psalm, ShortReading, ShortResponsory } from '../liturgy-masters/CommonParts';

export default class Laudes {
  anthem: string;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  shortReading: ShortReading = new ShortReading();
  shortResponsory: ShortResponsory = new ShortResponsory();
  evangelicalChant: string;
  evangelicalAntiphon: string;
  prayers: string;
  finalPrayer: string;
}

import { Psalm, ShortReading, ShortResponsory } from '../liturgy-masters/CommonParts';

export default class Vespers {
  anthem: string;
  // The Dies iræ that may be said instead of the hymn, only on the weekdays of the last week of
  // Ordinary Time (DiesIraeService); absent the rest of the year
  diesIraeAnthem?: string;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  shortReading: ShortReading = new ShortReading();
  shortResponsory: ShortResponsory = new ShortResponsory();
  evangelicalChant: string;
  evangelicalAntiphon: string;
  prayers: string;
  finalPrayer: string;
  title: string;
}

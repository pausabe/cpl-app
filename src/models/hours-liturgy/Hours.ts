import { Psalm, Responsory, ShortReading } from '../liturgy-masters/CommonParts';

export default class Hours {
  thirdHour: SpecificHour = new SpecificHour();
  sixthHour: SpecificHour = new SpecificHour();
  ninthHour: SpecificHour = new SpecificHour();
}

export class SpecificHour {
  anthem: string;
  hasMultipleAntiphons: boolean;
  uniqueAntiphon: string;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  shortReading: ShortReading = new ShortReading();
  responsory: Responsory = new Responsory();
  finalPrayer: string;
}

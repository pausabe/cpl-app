import { ReadingOfTheOffice, Psalm, Responsory } from '../liturgy-masters/CommonParts';

export default class Office {
  isDarkAnthem: boolean;
  anthem: string;
  firstPsalm: Psalm = new Psalm();
  secondPsalm: Psalm = new Psalm();
  thirdPsalm: Psalm = new Psalm();
  fourthPsalm: Psalm = new Psalm();
  responsory: Responsory = new Responsory();
  firstReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  secondReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  thirdReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  fourthReading: ReadingOfTheOffice = new ReadingOfTheOffice();
  teDeumInformation: TeDeumInformation = new TeDeumInformation();
  finalPrayer: string;
}

export class TeDeumInformation {
  enabled: boolean;
  anthem: string;
}

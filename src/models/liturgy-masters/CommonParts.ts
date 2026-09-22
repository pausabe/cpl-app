export class ReadingOfTheOffice {
  reference: string;
  quote: string;
  title: string;
  reading: string;
  responsory: ShortResponsory = new ShortResponsory();
}

export class HourCommonParts {
  latinAnthem: string;
  catalanAnthem: string;
  antiphon: string;
  shortReading: ShortReading = new ShortReading();
  responsory: Responsory = new Responsory();
  finalPrayer: string;
}

export class ShortReading {
  quote: string;
  shortReading: string;
}

export class Psalm {
  antiphon: string;
  title: string;
  comment: string;
  psalm: string;
  hasGloryPrayer: boolean;
  prayer: string;
}

export class Responsory {
  versicle: string;
  response: string;
}

export class ShortResponsory {
  quote: string;
  firstPart: string;
  secondPart: string;
  thirdPart: string;
  hasSpecialAntiphon: boolean;
  specialAntiphon: string;
}

export default class MassLiturgy {
  today: DayMassLiturgy = new DayMassLiturgy();
  hasVespers: boolean;
  vespers: DayMassLiturgy = new DayMassLiturgy();
}

export class DayMassLiturgy {
  title: string;
  hasGlory: boolean;
  firstReading: MassReading = new MassReading();
  psalm: MassPsalm = new MassPsalm();
  secondReading: MassReading = new MassReading();
  hallelujah: Hallelujah = new Hallelujah();
  gospel: MassGospel = new MassGospel();
  hasCreed: boolean;
  videoUrl: string = '';

  // Easter Eve
  secondPsalm: MassPsalm = new MassPsalm();
  thirdReading: MassReading = new MassReading();
  thirdPsalm: MassPsalm = new MassPsalm();
  fourthReading: MassReading = new MassReading();
  fourthPsalm: MassPsalm = new MassPsalm();
  fifthReading: MassReading = new MassReading();
  fifthPsalm: MassPsalm = new MassPsalm();
  sixthReading: MassReading = new MassReading();
  sixthPsalm: MassPsalm = new MassPsalm();
  seventhReading: MassReading = new MassReading();
  seventhPsalm: MassPsalm = new MassPsalm();
  apostleReading: MassReading = new MassReading();
}

export class MassReading {
  quote: string;
  comment: string;
  title: string;
  reading: string;
}

export class MassPsalm {
  quote: string;
  psalm: string;
}

export class Hallelujah {
  quote: string;
  hallelujah: string;
}

export class MassGospel {
  quote: string;
  comment: string;
  title: string;
  gospel: string;
}

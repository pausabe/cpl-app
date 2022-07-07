export default class MassLiturgy {
    Today: DayMassLiturgy = new DayMassLiturgy();
    HasVespers: boolean;
    Vespers: DayMassLiturgy = new DayMassLiturgy();
}

export class DayMassLiturgy{
    Title: string;
    FirstReading: MassReading = new MassReading();
    Psalm: MassPsalm = new MassPsalm();
    SecondReading: MassReading = new MassReading();
    Hallelujah: Hallelujah = new Hallelujah();
    Gospel: MassGospel = new MassGospel();

    // Easter Eve
    SecondPsalm: MassPsalm = new MassPsalm();
    ThirdReading: MassReading = new MassReading();
    ThirdPsalm: MassPsalm = new MassPsalm();
    FourthReading: MassReading = new MassReading();
    FourthPsalm: MassPsalm = new MassPsalm();
    FifthReading: MassReading = new MassReading();
    FifthPsalm: MassPsalm = new MassPsalm();
    SixthReading: MassReading = new MassReading();
    SixthPsalm: MassPsalm = new MassPsalm();
    SeventhReading: MassReading = new MassReading();
    SeventhPsalm: MassPsalm = new MassPsalm();
    ApostleReading: MassReading = new MassReading();
}

export class MassReading{
    Quote: string;
    Comment: string;
    Title: string;
    Reading: string;
}

export class MassPsalm{
    Quote: string;
    Psalm: string;
}

export class Hallelujah{
    Quote: string;
    Hallelujah: string;
}

export class MassGospel{
    Quote: string;
    Comment: string;
    Title: string;
    Gospel: string;
}
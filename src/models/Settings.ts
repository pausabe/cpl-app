export class Settings {
  prayingPlace: string;
  dioceseName: string;
  dioceseCode: string;
  useLatin: boolean;
  // From 1 to 10, stored as text
  textSize: string;
  darkModeEnabled: boolean;
  invitationPsalmOption: string;
  virginAntiphonOption: string;
  optionalFestivityEnabled: boolean;
  // On a day with more than one optional memorial, the one chosen (its row in santsMemories). Not
  // there when none was, or when the memorial was turned on before there was a choice: then it is
  // the one the app has always offered.
  optionalMemorialId?: number;
  dioceseCode2Letters: string;
}

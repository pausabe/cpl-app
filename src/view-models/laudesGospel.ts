import { SpecificLiturgyTimeType } from '../services/celebrationTimeEnums';
import { hasVisibleText } from './content';
import { palmSundayGospel } from './palmSundayGospel';

// «Evangeli del dia a Laudes» (Configuració): the Gospel that Lauds reads after the short
// responsory and before the Canticle of Zechariah, as ePrex and the Saints app do. The General
// Instruction leaves room at Lauds for a longer reading taken from the Mass (OGLH 46, 142); here it
// is added, and the short reading stays.
//
// It is the Gospel the home gives for the Mass of the day, never the one of the evening Mass:
//  - on Palm Sunday, the one of the blessing of the palms, as on the home: the Passion is left to
//    the Mass (a quarter of an hour read aloud);
//  - on Holy Saturday, none: there is no Mass that day, and the Gospel of the Vigil already
//    belongs to Easter;
//  - none either when the Mass of the day has no Gospel in the database.

// A Gospel as the Mass has it (MassGospel)
export interface GospelInput {
  // "Lc 11,15-26"
  quote: string;
  // The phrase that sums it up, or "-"
  comment: string;
  // "Lectura de l’evangeli segons sant Lluc"
  title: string;
  gospel: string;
}

export interface LaudesGospelInput {
  today: { specificLiturgyTime: string; yearType: string };
  tomorrow: { specificLiturgyTime: string };
  // The Gospel of the Mass of the day (massLiturgy.today.gospel)
  gospel: GospelInput;
}

export function laudesGospel({ today, tomorrow, gospel }: LaudesGospelInput): GospelInput | null {
  if (tomorrow.specificLiturgyTime === SpecificLiturgyTimeType.EasterSunday) return null;
  if (today.specificLiturgyTime === SpecificLiturgyTimeType.PalmSunday) {
    const blessing = palmSundayGospel(today.yearType);
    if (blessing) {
      return { quote: blessing.reference, comment: blessing.phrase, title: blessing.title, gospel: blessing.text };
    }
  }
  return hasVisibleText(gospel?.gospel) ? gospel : null;
}

import { DioceseName, PrayingPlace } from './SettingsService';
import { CelebrationType, DioceseCode } from './databaseEnums';
import { Settings } from '../models/Settings';

export function getDioceseCodeFromDioceseName(dioceseName: string, place: string): string {
  switch (dioceseName) {
    case DioceseName.Barcelona:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.BaD;
        case PrayingPlace.Cathedral:
          return DioceseCode.BaC;
        case PrayingPlace.City:
          return DioceseCode.BaV;
      }
      break;
    case DioceseName.Girona:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.GiD;
        case PrayingPlace.Cathedral:
          return DioceseCode.GiC;
        case PrayingPlace.City:
          return DioceseCode.GiV;
      }
      break;
    case DioceseName.Lleida:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.LlD;
        case PrayingPlace.Cathedral:
          return DioceseCode.LlC;
        case PrayingPlace.City:
          return DioceseCode.LlV;
      }
      break;
    case DioceseName.SantFeliu:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.SFD;
        case PrayingPlace.Cathedral:
          return DioceseCode.SFC;
        case PrayingPlace.City:
          return DioceseCode.SFV;
      }
      break;
    case DioceseName.Solsona:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.SoD;
        case PrayingPlace.Cathedral:
          return DioceseCode.SoC;
        case PrayingPlace.City:
          return DioceseCode.SoV;
      }
      break;
    case DioceseName.Tarragona:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.TaD;
        case PrayingPlace.Cathedral:
          return DioceseCode.TaC;
        case PrayingPlace.City:
          return DioceseCode.TaV;
      }
      break;
    case DioceseName.Terrassa:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.TeD;
        case PrayingPlace.Cathedral:
          return DioceseCode.TeC;
        case PrayingPlace.City:
          return DioceseCode.TeV;
      }
      break;
    case DioceseName.Tortosa:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.ToD;
        case PrayingPlace.Cathedral:
          return DioceseCode.ToC;
        case PrayingPlace.City:
          return DioceseCode.ToV;
      }
      break;
    case DioceseName.Urgell:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.UrD;
        case PrayingPlace.Cathedral:
          return DioceseCode.UrC;
        case PrayingPlace.City:
          return DioceseCode.UrV;
      }
      break;
    case DioceseName.Vic:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.ViD;
        case PrayingPlace.Cathedral:
          return DioceseCode.ViC;
        case PrayingPlace.City:
          return DioceseCode.ViV;
      }
      break;
    case DioceseName.Andorra:
      return DioceseCode.Andorra;
    case DioceseName.Mallorca:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.MaD;
        case PrayingPlace.Cathedral:
          return DioceseCode.MaC;
        case PrayingPlace.City:
          return DioceseCode.MaV;
      }
      break;
    case DioceseName.Menorca:
      switch (place) {
        case PrayingPlace.Diocese:
          return DioceseCode.MeD;
        case PrayingPlace.Cathedral:
          return DioceseCode.MeC;
        case PrayingPlace.City:
          return DioceseCode.MeV;
      }
      break;
  }
  return DioceseCode.BaD;
}

export function getCelebrationTypeFromTodayLiurgyRow(
  dioceseCode: string,
  liturgyYearDatabaseRow: any,
): CelebrationType {
  switch (dioceseCode) {
    case DioceseCode.BaD:
      return liturgyYearDatabaseRow.BaD;
    case DioceseCode.BaV:
      return liturgyYearDatabaseRow.BaV;
    case DioceseCode.BaC:
      return liturgyYearDatabaseRow.BaC;
    case DioceseCode.GiD:
      return liturgyYearDatabaseRow.GiD;
    case DioceseCode.GiV:
      return liturgyYearDatabaseRow.GiV;
    case DioceseCode.GiC:
      return liturgyYearDatabaseRow.GiC;
    case DioceseCode.LlD:
      return liturgyYearDatabaseRow.LlD;
    case DioceseCode.LlV:
      return liturgyYearDatabaseRow.LlV;
    case DioceseCode.LlC:
      return liturgyYearDatabaseRow.LlC;
    case DioceseCode.SFD:
      return liturgyYearDatabaseRow.SFD;
    case DioceseCode.SFV:
      return liturgyYearDatabaseRow.SFV;
    case DioceseCode.SFC:
      return liturgyYearDatabaseRow.SFC;
    case DioceseCode.SoD:
      return liturgyYearDatabaseRow.SoD;
    case DioceseCode.SoV:
      return liturgyYearDatabaseRow.SoV;
    case DioceseCode.SoC:
      return liturgyYearDatabaseRow.SoC;
    case DioceseCode.TaD:
      return liturgyYearDatabaseRow.TaD;
    case DioceseCode.TaV:
      return liturgyYearDatabaseRow.TaV;
    case DioceseCode.TaC:
      return liturgyYearDatabaseRow.TaC;
    case DioceseCode.TeD:
      return liturgyYearDatabaseRow.TeD;
    case DioceseCode.TeV:
      return liturgyYearDatabaseRow.TeV;
    case DioceseCode.TeC:
      return liturgyYearDatabaseRow.TeC;
    case DioceseCode.ToD:
      return liturgyYearDatabaseRow.ToD;
    case DioceseCode.ToV:
      return liturgyYearDatabaseRow.ToV;
    case DioceseCode.ToC:
      return liturgyYearDatabaseRow.ToC;
    case DioceseCode.UrD:
      return liturgyYearDatabaseRow.UrD;
    case DioceseCode.UrV:
      return liturgyYearDatabaseRow.UrV;
    case DioceseCode.UrC:
      return liturgyYearDatabaseRow.UrC;
    case DioceseCode.ViD:
      return liturgyYearDatabaseRow.ViD;
    case DioceseCode.ViV:
      return liturgyYearDatabaseRow.ViV;
    case DioceseCode.ViC:
      return liturgyYearDatabaseRow.ViC;
    case DioceseCode.MaD:
      return liturgyYearDatabaseRow.MaD;
    case DioceseCode.MaV:
      return liturgyYearDatabaseRow.MaV;
    case DioceseCode.MaC:
      return liturgyYearDatabaseRow.MaC;
    case DioceseCode.Andorra:
      return liturgyYearDatabaseRow.Andorra;
    case DioceseCode.MeD:
      return liturgyYearDatabaseRow.MeD;
    case DioceseCode.MeV:
      return liturgyYearDatabaseRow.MeV;
    case DioceseCode.MeC:
      return liturgyYearDatabaseRow.MeC;
  }

  return liturgyYearDatabaseRow.BaD;
}

// The places a transfer of anyliturgic is for. diocesiMogut says it with one code: «*» for more than
// one diocese, the two letters of a diocese for all of it, or the code of a place (BaC) for that place
// only. A table made from litcal also says it place by place in Mogut («Ba Gi … Vi Andorra», «MeV MeC»),
// because «*» is all it can write for St George moved in Catalonia and not in Mallorca. Mogut used to
// be a note («Terrasa 10-dic»): then diocesiMogut is the one that counts.
export function transferPlaces(diocesiMogut: string, mogut?: string): string[] {
  const places = (mogut ?? '').trim().split(/\s+/);
  if (places.every((place) => /^(\*|Andorra|[A-Z][A-Za-z][DVC]?)$/.test(place))) {
    return places;
  }
  return [diocesiMogut];
}

// Whether a transfer is for the place of the settings: the two letters of its diocese, its own code,
// or everyone
export function isTransferForPlace(places: string[], settings: Settings): boolean {
  return places.some(
    (place) => place === '*' || place === settings.dioceseCode2Letters || place === settings.dioceseCode,
  );
}

// «3-may» and «03-may» are the same day; the santoral writes it with the zero. Anything else is no day.
export function normalizeShortDatabaseCode(code: string): string {
  const match = /^(\d{1,2})-([a-z]{3})$/.exec((code ?? '').trim());
  return match ? `${match[1].padStart(2, '0')}-${match[2]}` : '-';
}

// The code of a day in the santoral tables (08-jun): the day's own or, when its celebration comes from
// another day, that one's
export function getDateShortDatabaseCode(date: Date, movedDay: string = '-'): string {
  if (movedDay && movedDay !== '-') {
    return normalizeShortDatabaseCode(movedDay);
  }

  let monthShort;
  switch (date.getMonth()) {
    case 0:
      monthShort = 'ene';
      break;
    case 1:
      monthShort = 'feb';
      break;
    case 2:
      monthShort = 'mar';
      break;
    case 3:
      monthShort = 'abr';
      break;
    case 4:
      monthShort = 'may';
      break;
    case 5:
      monthShort = 'jun';
      break;
    case 6:
      monthShort = 'jul';
      break;
    case 7:
      monthShort = 'ago';
      break;
    case 8:
      monthShort = 'sep';
      break;
    case 9:
      monthShort = 'oct';
      break;
    case 10:
      monthShort = 'nov';
      break;
    case 11:
      monthShort = 'dic';
      break;
  }

  let dayShort;
  if (date.getDate() < 10) {
    dayShort = `0${date.getDate()}`;
  } else {
    dayShort = date.getDate();
  }

  return dayShort + '-' + monthShort;
}

export function getDateFromShortDatabaseCode(dateString: string, year: number): Date | undefined {
  if (!dateString || !dateString.includes('-')) {
    return undefined;
  }

  // Date
  const date = parseInt(dateString.split('-')[0]);

  // Month
  const monthShort = dateString.split('-')[1];
  let month;
  switch (monthShort) {
    case 'ene':
      month = 0;
      break;
    case 'feb':
      month = 1;
      break;
    case 'mar':
      month = 2;
      break;
    case 'abr':
      month = 3;
      break;
    case 'may':
      month = 4;
      break;
    case 'jun':
      month = 5;
      break;
    case 'jul':
      month = 6;
      break;
    case 'ago':
      month = 7;
      break;
    case 'sep':
      month = 8;
      break;
    case 'oct':
      month = 9;
      break;
    case 'nov':
      month = 10;
      break;
    case 'dic':
      month = 11;
      break;
  }

  // January is month 0
  if (!date || month === undefined) {
    return undefined;
  }

  return new Date(year, month, date);
}

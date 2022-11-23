import {DioceseName, PrayingPlace} from "./SettingsService";
import {DioceseCode} from "./DatabaseEnums";

export function GetDioceseCodeFromDioceseName(dioceseName, place) {
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
    }
    return DioceseCode.BaD;
}

export function GetCelebrationTypeFromTodayLiurgyRow(dioceseCode: string, liturgyYearDatabaseRow: any): string{
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
    }

    return liturgyYearDatabaseRow.BaD;
}

export function IsMovedDiocese(dioceseCode: string, dioceseCodeMoved: string): boolean {
    if (!dioceseCode || dioceseCode === '' || dioceseCodeMoved === '-' || dioceseCode === undefined)
        return false;
    if (dioceseCodeMoved === '*') return true;
    if (dioceseCode === dioceseCodeMoved) return true;
    return dioceseCode.charAt(0) === dioceseCodeMoved.charAt(0) &&
        dioceseCode.charAt(1) === dioceseCodeMoved.charAt(1);
}

export function GetDateShortDatabaseCode(date: Date, dioceseCode: string, movedDay: string, dioceseCodeMoved: string): string {
    if (movedDay !== '-' && IsMovedDiocese(dioceseCode, dioceseCodeMoved))
        return movedDay;

    let monthShort;
    switch (date.getMonth()) {
        case 0:
            monthShort = "ene";
            break;
        case 1:
            monthShort = "feb";
            break;
        case 2:
            monthShort = "mar";
            break;
        case 3:
            monthShort = "abr";
            break;
        case 4:
            monthShort = "may";
            break;
        case 5:
            monthShort = "jun";
            break;
        case 6:
            monthShort = "jul";
            break;
        case 7:
            monthShort = "ago";
            break;
        case 8:
            monthShort = "sep";
            break;
        case 9:
            monthShort = "oct";
            break;
        case 10:
            monthShort = "nov";
            break;
        case 11:
            monthShort = "dic";
            break;
    }

    let dayShort;
    if (date.getDate() < 10){
        dayShort = `0${date.getDate()}`;
    }
    else {
        dayShort = date.getDate();
    }

    return dayShort + "-" + monthShort;
}
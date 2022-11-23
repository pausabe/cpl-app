import {DioceseName, PrayingPlace} from "./SettingsService";
import {DioceseCode} from "./DatabaseEnums";

export function getDioceseCodeFromDioceseName(dioceseName, place) {
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
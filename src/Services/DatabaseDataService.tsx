import * as Logger from '../Utils/Logger';
import GlobalViewFunctions from '../Utils/GlobalViewFunctions';
import {executeQueryAsync} from "./DatabaseManagerService";
import {Settings} from '../Models/Settings';
import {LiturgySpecificDayInformation} from "../Models/LiturgyDayInformation";
import {DayMassLiturgy} from "../Models/MassLiturgy";
import {SpecificLiturgyTimeType} from "./CelebrationTimeEnums";
import {DioceseName, PrayingPlace} from "./SettingsService";
import {DioceseCode} from "./DatabaseEnums";
import * as DatabaseHelper from "./DatabaseDataHelper";

export function getDatabaseVersion(): Promise<number> {
    return new Promise((resolve) => {
        executeQueryAsync(`SELECT IFNULL(MAX(id), 0) As databaseVersion FROM _tables_log`)
            .then(result => {
                const databaseVersion = parseInt(result.rows.item(0).databaseVersion);
                resolve(databaseVersion);
            })
            .catch(error => {
                Logger.Log(Logger.LogKeys.DatabaseDataService, "getDatabaseVersion", "Error trying to get the database version", error);
                resolve(0);
            });
    });
}

export async function ObtainMasterRowFromDatabase(master: string, rowId: number) {
    const result = await executeQueryAsync(`SELECT * FROM ${master} WHERE id = ${rowId}`);
    return result.rows.item(0);
}

export async function ObtainMasterTableFromDatabase(master: string) {
    const result = await executeQueryAsync(`SELECT * FROM ${master}`);
    return result.rows;
}

export async function ObtainLiturgySpecificDayInformation(date: Date, currentSettings: Settings): Promise<LiturgySpecificDayInformation> {
    const result = await executeQueryAsync(`SELECT * FROM anyliturgic WHERE any = '${date.getFullYear()}' AND mes = '${date.getMonth() + 1}' AND dia = '${date.getDate()}'`);
    const todayLiturgy = result.rows.item(0);
    let liturgyDayInformation = new LiturgySpecificDayInformation();
    liturgyDayInformation.Date = date;
    liturgyDayInformation.PentecostDay = await ObtainPentecostDay(liturgyDayInformation.Date);
    liturgyDayInformation.CelebrationType = DatabaseHelper.GetCelebrationTypeFromTodayLiurgyRow(currentSettings.DioceseName, todayLiturgy);
    liturgyDayInformation.MovedDay.Date = todayLiturgy.diaMogut;
    liturgyDayInformation.MovedDay.DioceseCode = todayLiturgy.diocesiMogut;
    liturgyDayInformation.LiturgyColor = todayLiturgy.Color;
    liturgyDayInformation.GenericLiturgyTime = todayLiturgy.tempsespecific;
    liturgyDayInformation.SpecificLiturgyTime = todayLiturgy.temps;
    liturgyDayInformation.WeekCycle = todayLiturgy.cicle;
    liturgyDayInformation.Week = todayLiturgy.NumSet;
    liturgyDayInformation.YearType = todayLiturgy.anyABC;
    liturgyDayInformation.YearIsEven = todayLiturgy.paroimpar === "II";
    liturgyDayInformation.DayOfTheWeek = todayLiturgy.DiadelaSetmana;
    return liturgyDayInformation;
}

export async function ObtainPentecostDay(date: Date) {
    const result = await executeQueryAsync(`SELECT * FROM anyliturgic WHERE any = '${date.getFullYear()}' AND temps = '${SpecificLiturgyTimeType.EasterWeeks}' AND NumSet = '8' AND DiadelaSetmana = 'Dg'`);
    return new Date(date.getFullYear(), (result.rows.item(0).mes - 1), result.rows.item(0).dia);
}

export async function ObtainMinimumAndMaximumSelectableDates(): Promise<{ MinimumSelectableDate: Date, MaximumSelectableDate: Date }> {
    const query = `SELECT MIN(CAST(any As INTEGER)) as minAny, (SELECT MIN(CAST(anyliturgic2.mes As INTEGER)) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) As TEXT)) as minMes, (SELECT MIN(CAST(anyliturgic3.dia As INTEGER)) FROM anyliturgic anyliturgic3 WHERE anyliturgic3.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) As TEXT) AND anyliturgic3.mes = (SELECT CAST(MIN(CAST(anyliturgic2.mes As INTEGER)) as TEXT) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) as TEXT))) as minDia, MAX(any) as maxAny, (SELECT MAX(CAST(anyliturgic2.mes As INTEGER)) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MAX(CAST(anyliturgic.any as INTEGER)) As TEXT)) as maxMes, (SELECT MAX(CAST(anyliturgic3.dia As INTEGER)) FROM anyliturgic anyliturgic3 WHERE anyliturgic3.any = CAST(MAX(CAST(anyliturgic.any As INTEGER)) As TEXT) AND anyliturgic3.mes = (SELECT CAST(MAX(CAST(anyliturgic2.mes as INTEGER)) As TEXT) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MAX(CAST(anyliturgic.any As INTEGER)) As TEXT))) as maxDia FROM anyliturgic`;
    const result = await executeQueryAsync(query);
    const marginDays = 2;
    const minDate = new Date(result.rows.item(0).minAny, (result.rows.item(0).minMes - 1), (result.rows.item(0).minDia + marginDays));
    const maxDate = new Date(result.rows.item(0).maxAny, (result.rows.item(0).maxMes - 1), (result.rows.item(0).maxDia - marginDays));
    return {
        MinimumSelectableDate: minDate,
        MaximumSelectableDate: maxDate
    }
}

export async function ObtainSolemnitiesAndMemoriesAsync(masterName: string, dateString: string, dioceseCode: string,
                                                        prayingPlace: string, dioceseName: string, genericLiturgyTime: string) {
    let auxDioceseName = dioceseName;
    let auxDiocese = dioceseCode;
    if (dioceseCode === DioceseCode.Andorra && dateString !== '08-sep') {
        auxDioceseName = DioceseName.Urgell;
        auxDiocese = DatabaseHelper.GetDioceseCodeFromDioceseName(DioceseName.Urgell, prayingPlace);
    }
    let auxDioceseQuery = `'${auxDiocese}'`;
    if (prayingPlace === PrayingPlace.City) {
        auxDioceseQuery = `'${auxDiocese}' OR Diocesis = '${DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese)}' OR Diocesis = '${DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Cathedral)}'`;
    } else if (prayingPlace === PrayingPlace.Cathedral) {
        auxDioceseQuery = `'${auxDiocese}' OR Diocesis = '${DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese)}' OR Diocesis = '${DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.City)}'`;
    } else if (prayingPlace === PrayingPlace.Diocese) {
        auxDioceseQuery = `'${auxDiocese}' OR Diocesis = '${DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Cathedral)}' OR Diocesis = '${DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.City)}'`;
    }
    const query = `SELECT * FROM ${masterName} WHERE (Diocesis = ${auxDioceseQuery} OR Diocesis = '-') AND dia = '${dateString}' AND Temps = '${genericLiturgyTime}'`;

    const result = await executeQueryAsync(query);
    const index = findCorrectIndexFromSettings(result.rows, result.rows.length, auxDiocese, auxDioceseName, prayingPlace);
    return result.rows.item(index);
}

export async function ObtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(masterCode: string, masterIdentifier: number) {
    let query = `SELECT * FROM ${masterCode} WHERE id = '${masterIdentifier}'`;
    const result = await executeQueryAsync(query);
    return result.rows.item(0);
}

export async function ObtainFreeVirginMemoryAsync() {
    let query = `SELECT * FROM santsMemories WHERE id = 457`;
    const result = await executeQueryAsync(query);
    return result.rows.item(0);
}

export async function ObtainCommonOfficesAsync(categoria) {
    let query = `SELECT * FROM OficisComuns WHERE Categoria = '${categoria}'`;
    const result = await executeQueryAsync(query);
    return result.rows.item(0);
}

export async function GetHolyDaysMass(holyDayMassIdentifier: number, liturgySpecificDayInformation: LiturgySpecificDayInformation, settings: Settings): Promise<DayMassLiturgy> {
    // Assuming that day with ID > day without it. I think it's correct, but maybe I should
    //   have some way to identify the precedences and decide later the most important. Like LDSantoral.Precedence
    return holyDayMassIdentifier === -1 ?
        GetHolyDaysMassWithoutIdentifier(liturgySpecificDayInformation, settings) :
        GetHolyDaysMassWithIdentifier(holyDayMassIdentifier);
}

function RowToMassLiturgy(row): DayMassLiturgy {
    let dayMassLiturgy = new DayMassLiturgy();
    if (row !== undefined) {
        dayMassLiturgy.HasGlory = row.Gloria === '1';
        dayMassLiturgy.FirstReading.Quote = row.Lectura1;
        dayMassLiturgy.FirstReading.Comment = row.Lectura1Cita;
        dayMassLiturgy.FirstReading.Title = row.Lectura1Titol;
        dayMassLiturgy.FirstReading.Reading = row.Lectura1Text;
        dayMassLiturgy.Psalm.Quote = row.Salm;
        dayMassLiturgy.Psalm.Psalm = row.SalmText;
        dayMassLiturgy.SecondReading.Quote = row.Lectura2;
        dayMassLiturgy.SecondReading.Comment = row.Lectura2Cita;
        dayMassLiturgy.SecondReading.Title = row.Lectura2Titol;
        dayMassLiturgy.SecondReading.Reading = row.Lectura2Text;
        dayMassLiturgy.Hallelujah.Quote = row.Alleluia;
        dayMassLiturgy.Hallelujah.Hallelujah = row.AlleluiaText;
        dayMassLiturgy.Gospel.Quote = row.Evangeli;
        dayMassLiturgy.Gospel.Comment = row.EvangeliCita;
        dayMassLiturgy.Gospel.Title = row.EvangeliTitol;
        dayMassLiturgy.Gospel.Gospel = row.EvangeliText;
        dayMassLiturgy.HasCreed = row.credo === '1';
    }
    return dayMassLiturgy;
}

async function GetHolyDaysMassWithoutIdentifier(liturgySpecificDayInformation: LiturgySpecificDayInformation, settings: Settings): Promise<DayMassLiturgy> {
    const dateString = DatabaseHelper.GetDateShortDatabaseCode(liturgySpecificDayInformation.Date, settings.DioceseCode, liturgySpecificDayInformation.MovedDay.Date, liturgySpecificDayInformation.MovedDay.DioceseCode);
    const query = `SELECT subquery_two.* FROM (SELECT CASE WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 1 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 2 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 3 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 4 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 5 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 6 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 7 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 8 END AS result_preference ,subquery_one.* FROM  (SELECT CASE WHEN LDSantoral.Cicle = '${liturgySpecificDayInformation.YearType}' THEN 1 WHEN LDSantoral.Cicle = '-' THEN 0 ELSE 2 END AS match_cicle ,CASE WHEN LDSantoral.DiadelaSetmana = '${liturgySpecificDayInformation.DayOfTheWeek}' THEN 1 WHEN LDSantoral.DiadelaSetmana = '-' THEN 0 ELSE 2 END AS match_diadelasetmana ,CASE WHEN LDSantoral.paroimpar = '${liturgySpecificDayInformation.YearIsEven? "II" : "I"}' THEN 1 WHEN LDSantoral.paroimpar = '-' THEN  0 ELSE 2 END AS match_paroimpar ,LDSantoral.* FROM LDSantoral WHERE LDSantoral.Categoria = '${liturgySpecificDayInformation.CelebrationType}'AND LDSantoral.tempsespecific = '${liturgySpecificDayInformation.SpecificLiturgyTime === SpecificLiturgyTimeType.AdventFairs? 'Especial' : liturgySpecificDayInformation.GenericLiturgyTime}'AND LDSantoral.dia = '${dateString}') AS subquery_one WHERE subquery_one.match_cicle <> 2 AND subquery_one.match_diadelasetmana <> 2 AND subquery_one.match_paroimpar <> 2 ) AS subquery_two WHERE subquery_two.Diocesis = '${settings.DioceseCode}' OR subquery_two.Diocesis = '-' ORDER BY subquery_two.result_preference ASC, subquery_two.Diocesis DESC LIMIT 1;`;
    const result = await executeQueryAsync(query);
    return RowToMassLiturgy(result.rows.item(0));
}

export async function GetHolyDaysMassWithIdentifier(holyDayMassIdentifier: number): Promise<DayMassLiturgy> {
    let query = `SELECT * FROM LDSantoral WHERE id = '${holyDayMassIdentifier}'`;
    const result = await executeQueryAsync(query);
    return RowToMassLiturgy(result.rows.item(0));
}

export async function GetNormalDaysMassLiturgy(liturgyDayInformation: LiturgySpecificDayInformation) {
    let query = `SELECT * FROM LDdiumenges WHERE tempsespecific = '${liturgyDayInformation.GenericLiturgyTime}' AND DiadelaSetmana = '${liturgyDayInformation.DayOfTheWeek}' AND NumSet = '${liturgyDayInformation.Week}'`;
    const result = await executeQueryAsync(query);
    let index = getNormalDaysMassLiturgyIndex(result, liturgyDayInformation.YearType, liturgyDayInformation.YearIsEven ? "II" : "I", liturgyDayInformation.DayOfTheWeek);
    return RowToMassLiturgy(result.rows.item(index));
}

function findCorrectIndexFromSettings(rows, length, diocese, dioceseName, place) {
    //Catedral < Ciutat < Diòcesi < -
    if (length === 1) return 0;
    let auxDioceseName = dioceseName;
    let auxDiocese = diocese;
    let i = 0;
    while (i < length) {
        if (rows.item(i).Diocesis === auxDiocese) return i;
        i += 1;
    }
    if (place === PrayingPlace.City) {
        auxDiocese = DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese);
        i = 0;
        while (i < length) {
            if (rows.item(i).Diocesis === auxDiocese) return i;
            i += 1;
        }
    }
    if (place === PrayingPlace.Cathedral) {
        auxDiocese = DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.City);
        i = 0;
        while (i < length) {
            if (rows.item(i).Diocesis === auxDiocese) return i;
            i += 1;
        }
        auxDiocese = DatabaseHelper.GetDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese);
        i = 0;
        while (i < length) {
            if (rows.item(i).Diocesis === auxDiocese) return i;
            i += 1;
        }
    }
    return 0;
}

function getNormalDaysMassLiturgyIndex(result, cicleABC, parImpar, diaSetmana) {
    let i;
    //For getLDSantoral is necessari let in result just the rows with diaSetmana (just in case any of them have diaSetmana != '-')
    let haveSomeDiaSetmana = false;
    let DiaIsTheSame = false;
    for (let i = 0; i < result.rows.length; i++) {
        if (result.rows.item(i).DiadelaSetmana !== '-') {
            haveSomeDiaSetmana = true;
            if (result.rows.item(i).DiadelaSetmana === diaSetmana)
                DiaIsTheSame = true;
            break;
        }
    }

    const rows = [];
    if (haveSomeDiaSetmana) {
        for (let i = 0; i < result.rows.length; i++) {
            if ((DiaIsTheSame && result.rows.item(i).DiadelaSetmana === diaSetmana) ||
                (!DiaIsTheSame && result.rows.item(i).DiadelaSetmana === '-')) {
                rows.push(result.rows.item(i));
            }
        }
    } else {
        for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
        }
    }

    let index;
    if (rows.length > 1) {
        if (rows[0].Cicle !== '-' && rows[0].paroimpar === '-') {
            //1) cicle != '-' and paroimpar != '-'
            for (i = 0; i < rows.length; i++) {
                if (rows[i].Cicle === cicleABC) {
                    index = i;
                    break;
                }
            }
        } else if (rows[0].paroimpar !== '-' && rows[0].Cicle === '-') {
            //2) cicle == '-' and paroimpar != '-'
            for (i = 0; i < rows.length; i++) {
                if (rows[i].paroimpar === parImpar) {
                    index = i;
                    break;
                }
            }
        } else if (rows[0].paroimpar !== '-' && rows[0].Cicle !== '-') {
            //3) cicle != '-' and paroimpar != '-'
            for (i = 0; i < rows.length; i++) {
                if (rows[i].Cicle === cicleABC && rows[i].paroimpar === parImpar) {
                    index = i;
                    break;
                }
            }
        }
    } else if (rows.length === 1) {
        //4) cicle == '-' and paroimpar == '-'
        index = 0;
    }

    if (index === undefined) {
        index = -1;
    } else {
        index += (result.rows.length - rows.length);
    }
    return index;
}
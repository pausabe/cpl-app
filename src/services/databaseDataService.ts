import * as Logger from '../utils/logger';
import { executeQueryAsync } from './databaseManagerService';
import { Settings } from '../models/Settings';
import { LiturgySpecificDayInformation } from '../models/LiturgyDayInformation';
import { DayMassLiturgy } from '../models/MassLiturgy';
import { SpecificLiturgyTimeType } from './celebrationTimeEnums';
import { DioceseName, PrayingPlace } from './SettingsService';
import { DioceseCode } from './databaseEnums';
import * as DatabaseHelper from './databaseDataHelper';

export function getDatabaseVersion(): Promise<number> {
  return new Promise((resolve) => {
    executeQueryAsync(`SELECT IFNULL(MAX(id), 0) As databaseVersion FROM _tables_log`)
      .then((result) => {
        const databaseVersion = parseInt(result[0]?.databaseVersion || 0);
        resolve(databaseVersion);
      })
      .catch((error) => {
        Logger.log(
          Logger.LogKeys.DatabaseDataService,
          'getDatabaseVersion',
          'Error trying to get the database version',
          error,
        );
        resolve(0);
      });
  });
}

export async function obtainMasterRowFromDatabase(master: string, rowId: number) {
  const result = await executeQueryAsync(`SELECT * FROM ${master} WHERE id = ${rowId}`);
  return result[0];
}

export async function obtainMasterTableFromDatabase(master: string) {
  return await executeQueryAsync(`SELECT * FROM ${master}`);
}

export async function obtainLiturgySpecificDayInformation(
  date: Date,
  currentSettings: Settings,
): Promise<LiturgySpecificDayInformation> {
  const result = await executeQueryAsync(
    `SELECT * FROM anyliturgic WHERE any = '${date.getFullYear()}' AND mes = '${date.getMonth() + 1}' AND dia = '${date.getDate()}'`,
  );
  const todayLiturgy = result[0];
  let liturgyDayInformation = new LiturgySpecificDayInformation();
  liturgyDayInformation.Date = date;
  liturgyDayInformation.PentecostDay = await obtainPentecostDay(liturgyDayInformation.Date);
  liturgyDayInformation.CelebrationType = DatabaseHelper.getCelebrationTypeFromTodayLiurgyRow(
    currentSettings.DioceseCode,
    todayLiturgy,
  );

  // Moved day is used to detect if today's celebrations is meant to be celebrated in another day
  liturgyDayInformation.MovedDay.OriginDateShortDatabaseCode = todayLiturgy.diaMogut;
  liturgyDayInformation.MovedDay.TodayIsMoved = await dateIsMoved(
    liturgyDayInformation.Date,
    currentSettings.DioceseCode2Letters,
  );
  liturgyDayInformation.MovedDay.OriginDate = DatabaseHelper.getDateFromShortDatabaseCode(
    todayLiturgy.diaMogut,
    date.getFullYear(),
  );
  liturgyDayInformation.MovedDay.DioceseCode2Letters = todayLiturgy.diocesiMogut;

  liturgyDayInformation.LiturgyColor = todayLiturgy.Color;
  liturgyDayInformation.GenericLiturgyTime = todayLiturgy.tempsespecific;
  liturgyDayInformation.SpecificLiturgyTime = todayLiturgy.temps;
  liturgyDayInformation.WeekCycle = todayLiturgy.cicle;
  liturgyDayInformation.Week = todayLiturgy.NumSet;
  liturgyDayInformation.YearType = todayLiturgy.anyABC;
  liturgyDayInformation.YearIsEven = todayLiturgy.paroimpar === 'II';
  liturgyDayInformation.DayOfTheWeek = date.getDay();
  liturgyDayInformation.DayOfTheWeekNameShort = todayLiturgy.DiadelaSetmana;
  return liturgyDayInformation;
}

export async function obtainPentecostDay(date: Date) {
  const result = await executeQueryAsync(
    `SELECT * FROM anyliturgic WHERE any = '${date.getFullYear()}' AND temps = '${SpecificLiturgyTimeType.EasterWeeks}' AND NumSet = '8' AND DiadelaSetmana = 'Dg'`,
  );
  return new Date(date.getFullYear(), result[0].mes - 1, result[0].dia);
}

export async function obtainMinimumAndMaximumSelectableDates(): Promise<{
  MinimumSelectableDate: Date;
  MaximumSelectableDate: Date;
}> {
  // The first and the last day in anyliturgic, which keeps the dates as text. One pass over
  // the table each: the query this replaced, with correlated subqueries, took most of the
  // time of every reload.
  const dayQuery = (order: string) =>
    `SELECT CAST(any AS INTEGER) AS year, CAST(mes AS INTEGER) AS month, CAST(dia AS INTEGER) AS day FROM anyliturgic ORDER BY year ${order}, month ${order}, day ${order} LIMIT 1`;
  const [first] = await executeQueryAsync(dayQuery('ASC'));
  const [last] = await executeQueryAsync(dayQuery('DESC'));
  const marginDays = 2;
  const minDate = new Date(first.year, first.month - 1, first.day + marginDays);
  const maxDate = new Date(last.year, last.month - 1, last.day - marginDays);
  return {
    MinimumSelectableDate: minDate,
    MaximumSelectableDate: maxDate,
  };
}

export async function obtainSolemnitiesAndMemoriesAsync(
  masterName: string,
  dateString: string,
  dioceseCode: string,
  prayingPlace: string,
  dioceseName: string,
  genericLiturgyTime: string,
) {
  let auxDioceseName = dioceseName;
  let auxDiocese = dioceseCode;
  if (dioceseCode === DioceseCode.Andorra && dateString !== '08-sep') {
    auxDioceseName = DioceseName.Urgell;
    auxDiocese = DatabaseHelper.getDioceseCodeFromDioceseName(DioceseName.Urgell, prayingPlace);
  }
  let auxDioceseQuery = `'${auxDiocese}'`;
  if (prayingPlace === PrayingPlace.City) {
    auxDioceseQuery = `'${auxDiocese}' OR Diocesis = '${DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese)}' OR Diocesis = '${DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Cathedral)}'`;
  } else if (prayingPlace === PrayingPlace.Cathedral) {
    auxDioceseQuery = `'${auxDiocese}' OR Diocesis = '${DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese)}' OR Diocesis = '${DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.City)}'`;
  } else if (prayingPlace === PrayingPlace.Diocese) {
    auxDioceseQuery = `'${auxDiocese}' OR Diocesis = '${DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Cathedral)}' OR Diocesis = '${DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.City)}'`;
  }
  const query = `SELECT * FROM ${masterName} WHERE (Diocesis = ${auxDioceseQuery} OR Diocesis = '-') AND dia = '${dateString}' AND Temps = '${genericLiturgyTime}'`;

  const result = await executeQueryAsync(query);
  const index = findCorrectIndexFromSettings(result, result.length, auxDiocese, auxDioceseName, prayingPlace);
  return result[index];
}

export async function obtainSolemnitiesAndMemoriesWhenThereIsSomeMemoryOrSolemnityKnownAsync(
  masterCode: string,
  masterIdentifier: number,
) {
  let query = `SELECT * FROM ${masterCode} WHERE id = '${masterIdentifier}'`;
  const result = await executeQueryAsync(query);
  return result[0];
}

export async function obtainFreeVirginMemoryAsync() {
  let query = `SELECT * FROM santsMemories WHERE id = 457`;
  const result = await executeQueryAsync(query);
  return result[0];
}

export async function obtainCommonOfficesAsync(categoria) {
  let query = `SELECT * FROM OficisComuns WHERE Categoria = '${categoria}'`;
  const result = await executeQueryAsync(query);
  return result[0];
}

export async function getHolyDaysMass(
  holyDayMassIdentifier: number,
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Promise<DayMassLiturgy> {
  // Assuming that day with ID > day without it. I think it's correct, but maybe I should
  //   have some way to identify the precedences and decide later the most important. Like LDSantoral.Precedence
  return holyDayMassIdentifier === -1
    ? getHolyDaysMassWithoutIdentifier(liturgySpecificDayInformation, settings)
    : getHolyDaysMassWithIdentifier(holyDayMassIdentifier);
}

export async function getHolyDaysMassWithIdentifier(holyDayMassIdentifier: number): Promise<DayMassLiturgy> {
  let query = `SELECT * FROM LDSantoral WHERE id = '${holyDayMassIdentifier}'`;
  const result = await executeQueryAsync(query);
  return rowToMassLiturgy(result[0]);
}

export async function getNormalDaysMassLiturgy(liturgyDayInformation: LiturgySpecificDayInformation) {
  let query = `SELECT * FROM LDdiumenges WHERE tempsespecific = '${liturgyDayInformation.GenericLiturgyTime}' AND DiadelaSetmana = '${liturgyDayInformation.DayOfTheWeekNameShort}' AND NumSet = '${liturgyDayInformation.Week}'`;
  const result = await executeQueryAsync(query);
  let index = getNormalDaysMassLiturgyIndex(
    result,
    liturgyDayInformation.YearType,
    liturgyDayInformation.YearIsEven ? 'II' : 'I',
    liturgyDayInformation.DayOfTheWeekNameShort,
  );
  return rowToMassLiturgy(result[index]);
}

function rowToMassLiturgy(row): DayMassLiturgy {
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
    dayMassLiturgy.videoUrl = row.videoUrl || '';
  }
  return dayMassLiturgy;
}

async function getHolyDaysMassWithoutIdentifier(
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Promise<DayMassLiturgy> {
  const dateString = DatabaseHelper.getDateShortDatabaseCode(
    liturgySpecificDayInformation.Date,
    settings.DioceseCode,
    liturgySpecificDayInformation.MovedDay.OriginDateShortDatabaseCode,
    liturgySpecificDayInformation.MovedDay.DioceseCode2Letters,
  );
  const customizedSpecificTime = liturgySpecificDayInformation.IsSpecialChristmas
    ? 'Especial'
    : liturgySpecificDayInformation.GenericLiturgyTime;
  const query = `SELECT subquery_two.* FROM (SELECT CASE WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 1 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 2 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 3 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 4 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 5 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 6 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 7 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 8 END AS result_preference ,subquery_one.* FROM  (SELECT CASE WHEN LDSantoral.Cicle = '${liturgySpecificDayInformation.YearType}' THEN 1 WHEN LDSantoral.Cicle = '-' THEN 0 ELSE 2 END AS match_cicle ,CASE WHEN LDSantoral.DiadelaSetmana = '${liturgySpecificDayInformation.DayOfTheWeekNameShort}' THEN 1 WHEN LDSantoral.DiadelaSetmana = '-' THEN 0 ELSE 2 END AS match_diadelasetmana ,CASE WHEN LDSantoral.paroimpar = '${liturgySpecificDayInformation.YearIsEven ? 'II' : 'I'}' THEN 1 WHEN LDSantoral.paroimpar = '-' THEN  0 ELSE 2 END AS match_paroimpar ,LDSantoral.* FROM LDSantoral WHERE (LDSantoral.Categoria = '-' OR LDSantoral.Categoria = '${liturgySpecificDayInformation.CelebrationType}') AND LDSantoral.tempsespecific = '${customizedSpecificTime}'AND LDSantoral.dia = '${dateString}') AS subquery_one WHERE subquery_one.match_cicle <> 2 AND subquery_one.match_diadelasetmana <> 2 AND subquery_one.match_paroimpar <> 2 ) AS subquery_two WHERE subquery_two.Diocesis = '${settings.DioceseCode}' OR subquery_two.Diocesis = '-' ORDER BY subquery_two.result_preference ASC, subquery_two.Diocesis DESC LIMIT 1;`;
  const result = await executeQueryAsync(query);
  return rowToMassLiturgy(result[0]);
}

async function dateIsMoved(date: Date, dioceseCode2Letters: string): Promise<boolean> {
  const movedDateShortDatabaseCode = DatabaseHelper.getDateShortDatabaseCode(date);
  const query = `SELECT any, mes, dia
                   FROM anyliturgic
                   WHERE any = '${date.getFullYear()}'
                     AND diaMogut = '${movedDateShortDatabaseCode}'
                     AND (diocesiMogut = '*' OR (diocesiMogut <> '-' AND diocesiMogut = '${dioceseCode2Letters}'))`;
  const result = await executeQueryAsync(query);
  return result.length > 0;
}

function findCorrectIndexFromSettings(result, length, diocese, dioceseName, place) {
  //Catedral < Ciutat < Diòcesi < -
  if (length === 1) return 0;
  let auxDioceseName = dioceseName;
  let auxDiocese = diocese;
  let i = 0;
  while (i < length) {
    if (result[i].Diocesis === auxDiocese) return i;
    i += 1;
  }
  if (place === PrayingPlace.City) {
    auxDiocese = DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese);
    i = 0;
    while (i < length) {
      if (result[i].Diocesis === auxDiocese) return i;
      i += 1;
    }
  }
  if (place === PrayingPlace.Cathedral) {
    auxDiocese = DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.City);
    i = 0;
    while (i < length) {
      if (result[i].Diocesis === auxDiocese) return i;
      i += 1;
    }
    auxDiocese = DatabaseHelper.getDioceseCodeFromDioceseName(auxDioceseName, PrayingPlace.Diocese);
    i = 0;
    while (i < length) {
      if (result[i].Diocesis === auxDiocese) return i;
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
  for (let i = 0; i < result.length; i++) {
    if (result[i].DiadelaSetmana !== '-') {
      haveSomeDiaSetmana = true;
      if (result[i].DiadelaSetmana === diaSetmana) DiaIsTheSame = true;
      break;
    }
  }

  const rows = [];
  if (haveSomeDiaSetmana) {
    for (let i = 0; i < result.length; i++) {
      if (
        (DiaIsTheSame && result[i].DiadelaSetmana === diaSetmana) ||
        (!DiaIsTheSame && result[i].DiadelaSetmana === '-')
      ) {
        rows.push(result[i]);
      }
    }
  } else {
    for (let i = 0; i < result.length; i++) {
      rows.push(result[i]);
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
    index += result.length - rows.length;
  }
  return index;
}

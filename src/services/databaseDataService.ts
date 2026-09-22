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
  liturgyDayInformation.date = date;
  liturgyDayInformation.pentecostDay = await obtainPentecostDay(liturgyDayInformation.date);
  liturgyDayInformation.celebrationType = DatabaseHelper.getCelebrationTypeFromTodayLiurgyRow(
    currentSettings.dioceseCode,
    todayLiturgy,
  );

  // Moved day is used to detect if today's celebrations is meant to be celebrated in another day
  liturgyDayInformation.movedDay.originDateShortDatabaseCode = todayLiturgy.diaMogut;
  liturgyDayInformation.movedDay.todayIsMoved = await dateIsMoved(
    liturgyDayInformation.date,
    currentSettings.dioceseCode2Letters,
  );
  liturgyDayInformation.movedDay.originDate = DatabaseHelper.getDateFromShortDatabaseCode(
    todayLiturgy.diaMogut,
    date.getFullYear(),
  );
  liturgyDayInformation.movedDay.dioceseCode2Letters = todayLiturgy.diocesiMogut;

  liturgyDayInformation.liturgyColor = todayLiturgy.Color;
  liturgyDayInformation.genericLiturgyTime = todayLiturgy.tempsespecific;
  liturgyDayInformation.specificLiturgyTime = todayLiturgy.temps;
  liturgyDayInformation.weekCycle = todayLiturgy.cicle;
  liturgyDayInformation.week = todayLiturgy.NumSet;
  liturgyDayInformation.yearType = todayLiturgy.anyABC;
  liturgyDayInformation.yearIsEven = todayLiturgy.paroimpar === 'II';
  liturgyDayInformation.dayOfTheWeek = date.getDay();
  liturgyDayInformation.dayOfTheWeekNameShort = todayLiturgy.DiadelaSetmana;
  return liturgyDayInformation;
}

export async function obtainPentecostDay(date: Date) {
  const result = await executeQueryAsync(
    `SELECT * FROM anyliturgic WHERE any = '${date.getFullYear()}' AND temps = '${SpecificLiturgyTimeType.EasterWeeks}' AND NumSet = '8' AND DiadelaSetmana = 'Dg'`,
  );
  return new Date(date.getFullYear(), result[0].mes - 1, result[0].dia);
}

export async function obtainMinimumAndMaximumSelectableDates(): Promise<{
  minimumSelectableDate: Date;
  maximumSelectableDate: Date;
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
    minimumSelectableDate: minDate,
    maximumSelectableDate: maxDate,
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

export async function obtainCommonOfficesAsync(category) {
  let query = `SELECT * FROM OficisComuns WHERE Categoria = '${category}'`;
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
  let query = `SELECT * FROM LDdiumenges WHERE tempsespecific = '${liturgyDayInformation.genericLiturgyTime}' AND DiadelaSetmana = '${liturgyDayInformation.dayOfTheWeekNameShort}' AND NumSet = '${liturgyDayInformation.week}'`;
  const result = await executeQueryAsync(query);
  let index = getNormalDaysMassLiturgyIndex(
    result,
    liturgyDayInformation.yearType,
    liturgyDayInformation.yearIsEven ? 'II' : 'I',
    liturgyDayInformation.dayOfTheWeekNameShort,
  );
  return rowToMassLiturgy(result[index]);
}

function rowToMassLiturgy(row): DayMassLiturgy {
  let dayMassLiturgy = new DayMassLiturgy();
  if (row !== undefined) {
    dayMassLiturgy.hasGlory = row.Gloria === '1';
    dayMassLiturgy.firstReading.quote = row.Lectura1;
    dayMassLiturgy.firstReading.comment = row.Lectura1Cita;
    dayMassLiturgy.firstReading.title = row.Lectura1Titol;
    dayMassLiturgy.firstReading.reading = row.Lectura1Text;
    dayMassLiturgy.psalm.quote = row.Salm;
    dayMassLiturgy.psalm.psalm = row.SalmText;
    dayMassLiturgy.secondReading.quote = row.Lectura2;
    dayMassLiturgy.secondReading.comment = row.Lectura2Cita;
    dayMassLiturgy.secondReading.title = row.Lectura2Titol;
    dayMassLiturgy.secondReading.reading = row.Lectura2Text;
    dayMassLiturgy.hallelujah.quote = row.Alleluia;
    dayMassLiturgy.hallelujah.hallelujah = row.AlleluiaText;
    dayMassLiturgy.gospel.quote = row.Evangeli;
    dayMassLiturgy.gospel.comment = row.EvangeliCita;
    dayMassLiturgy.gospel.title = row.EvangeliTitol;
    dayMassLiturgy.gospel.gospel = row.EvangeliText;
    dayMassLiturgy.hasCreed = row.credo === '1';
    dayMassLiturgy.videoUrl = row.videoUrl || '';
  }
  return dayMassLiturgy;
}

async function getHolyDaysMassWithoutIdentifier(
  liturgySpecificDayInformation: LiturgySpecificDayInformation,
  settings: Settings,
): Promise<DayMassLiturgy> {
  const dateString = DatabaseHelper.getDateShortDatabaseCode(
    liturgySpecificDayInformation.date,
    settings.dioceseCode,
    liturgySpecificDayInformation.movedDay.originDateShortDatabaseCode,
    liturgySpecificDayInformation.movedDay.dioceseCode2Letters,
  );
  const customizedSpecificTime = liturgySpecificDayInformation.isSpecialChristmas
    ? 'Especial'
    : liturgySpecificDayInformation.genericLiturgyTime;
  const query = `SELECT subquery_two.* FROM (SELECT CASE WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 1 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 2 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 3 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 4 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 5 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 6 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 7 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 8 END AS result_preference ,subquery_one.* FROM  (SELECT CASE WHEN LDSantoral.Cicle = '${liturgySpecificDayInformation.yearType}' THEN 1 WHEN LDSantoral.Cicle = '-' THEN 0 ELSE 2 END AS match_cicle ,CASE WHEN LDSantoral.DiadelaSetmana = '${liturgySpecificDayInformation.dayOfTheWeekNameShort}' THEN 1 WHEN LDSantoral.DiadelaSetmana = '-' THEN 0 ELSE 2 END AS match_diadelasetmana ,CASE WHEN LDSantoral.paroimpar = '${liturgySpecificDayInformation.yearIsEven ? 'II' : 'I'}' THEN 1 WHEN LDSantoral.paroimpar = '-' THEN  0 ELSE 2 END AS match_paroimpar ,LDSantoral.* FROM LDSantoral WHERE (LDSantoral.Categoria = '-' OR LDSantoral.Categoria = '${liturgySpecificDayInformation.celebrationType}') AND LDSantoral.tempsespecific = '${customizedSpecificTime}'AND LDSantoral.dia = '${dateString}') AS subquery_one WHERE subquery_one.match_cicle <> 2 AND subquery_one.match_diadelasetmana <> 2 AND subquery_one.match_paroimpar <> 2 ) AS subquery_two WHERE subquery_two.Diocesis = '${settings.dioceseCode}' OR subquery_two.Diocesis = '-' ORDER BY subquery_two.result_preference ASC, subquery_two.Diocesis DESC LIMIT 1;`;
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
  //Cathedral < City < Diocese < -
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

function getNormalDaysMassLiturgyIndex(result, cycleABC, evenOrOdd, dayOfTheWeek) {
  let i;
  //For getLDSantoral it is necessary to keep in result just the rows with dayOfTheWeek (just in case any of them have dayOfTheWeek != '-')
  let haveSomeDayOfTheWeek = false;
  let dayIsTheSame = false;
  for (let i = 0; i < result.length; i++) {
    if (result[i].DiadelaSetmana !== '-') {
      haveSomeDayOfTheWeek = true;
      if (result[i].DiadelaSetmana === dayOfTheWeek) dayIsTheSame = true;
      break;
    }
  }

  const rows = [];
  if (haveSomeDayOfTheWeek) {
    for (let i = 0; i < result.length; i++) {
      if (
        (dayIsTheSame && result[i].DiadelaSetmana === dayOfTheWeek) ||
        (!dayIsTheSame && result[i].DiadelaSetmana === '-')
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
        if (rows[i].Cicle === cycleABC) {
          index = i;
          break;
        }
      }
    } else if (rows[0].paroimpar !== '-' && rows[0].Cicle === '-') {
      //2) cicle == '-' and paroimpar != '-'
      for (i = 0; i < rows.length; i++) {
        if (rows[i].paroimpar === evenOrOdd) {
          index = i;
          break;
        }
      }
    } else if (rows[0].paroimpar !== '-' && rows[0].Cicle !== '-') {
      //3) cicle != '-' and paroimpar != '-'
      for (i = 0; i < rows.length; i++) {
        if (rows[i].Cicle === cycleABC && rows[i].paroimpar === evenOrOdd) {
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

import * as Logger from '../Utils/Logger';
import GF from '../Globals/GlobalFunctions';
import { CPLDataBase } from './DatabaseOpenerService';

export function executeQuery(query, callback, errorCallback) {
  if(CPLDataBase !== undefined){
    CPLDataBase.transaction((tx) => {
      tx.executeSql(query, [], (SQLTransaction, SQLResultSet) => {
        callback(SQLResultSet);
      }, (SQLTransaction, SQLError) => {
        Logger.LogError(Logger.LogKeys.DatabaseAdapter, "executeQuery", "error in query (" + query + "): ", SQLError);
        if(errorCallback !== undefined) {
          errorCallback(SQLError);
        }
      });
    });
  }
  else{
    if(errorCallback !== undefined) {
      errorCallback();
    }
  }
}

export function getDatabaseVersion(){
  return new Promise((resolve) => {
    executeQuery(`SELECT IFNULL(MAX(id), 0) As databaseVersion FROM _tables_log`,
        result => {
          const databaseVersion = result.rows.item(0).databaseVersion;
          resolve(databaseVersion);
        },
        () => resolve(0));
  });
}

export function getLiturgia(table, id, callback) {
  if (id !== -1) {
    executeQuery(`SELECT * FROM ${table} WHERE id = ${id}`,
      result => callback(result.rows.item(0)));
  }
  else {
    executeQuery(`SELECT * FROM ${table}`,
      result => callback(result.rows));
  }
}

export function getAnyLiturgic(year, month, day, callback, errorCallback) {
  const query = `SELECT * FROM anyliturgic WHERE any = '${year}' AND mes = '${month + 1}' AND dia = '${day}'`;
  executeQuery(query,
    result => {
      getTomorrow(result.rows.item(0), year, month, day, callback);
    }
    ,errorCallback);
}

export function getTomorrow(r1, year, month, day, callback) {
  const tomorrow = new Date(year, month, day);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year2 = tomorrow.getFullYear();
  const month2 = tomorrow.getMonth();
  const day2 = tomorrow.getDate();

  const query = `SELECT * FROM anyliturgic WHERE any = '${year2}' AND mes = '${month2 + 1}' AND dia = '${day2}'`;
  executeQuery(query,
    result => {
      getPentacosta(r1, result.rows.item(0), year, callback);
    });
}

export function getPentacosta(r1, r2, year, callback) {
  let query = `SELECT * FROM anyliturgic WHERE any = '${year}' AND temps = 'P_SETMANES' AND NumSet = '8' AND DiadelaSetmana = 'Dg'`;
  executeQuery(query,
    result => {
      let pentacosta = new Date(year, (result.rows.item(0).mes - 1), result.rows.item(0).dia);
      getMinMaxDates(r1, r2, pentacosta, callback);
    });
}

export function getMinMaxDates(r1, r2, r3, callback){
  const query = `SELECT MIN(CAST(any As INTEGER)) as minAny, (SELECT MIN(CAST(anyliturgic2.mes As INTEGER)) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) As TEXT)) as minMes, (SELECT MIN(CAST(anyliturgic3.dia As INTEGER)) FROM anyliturgic anyliturgic3 WHERE anyliturgic3.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) As TEXT) AND anyliturgic3.mes = (SELECT CAST(MIN(CAST(anyliturgic2.mes As INTEGER)) as TEXT) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) as TEXT))) as minDia, MAX(any) as maxAny, (SELECT MAX(CAST(anyliturgic2.mes As INTEGER)) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MAX(CAST(anyliturgic.any as INTEGER)) As TEXT)) as maxMes, (SELECT MAX(CAST(anyliturgic3.dia As INTEGER)) FROM anyliturgic anyliturgic3 WHERE anyliturgic3.any = CAST(MAX(CAST(anyliturgic.any As INTEGER)) As TEXT) AND anyliturgic3.mes = (SELECT CAST(MAX(CAST(anyliturgic2.mes as INTEGER)) As TEXT) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MAX(CAST(anyliturgic.any As INTEGER)) As TEXT))) as maxDia FROM anyliturgic`;
  executeQuery(query,
    result => {
      const marginDays = 2;
      const minDate = new Date(result.rows.item(0).minAny, (result.rows.item(0).minMes - 1), (result.rows.item(0).minDia + marginDays));
      const maxDate = new Date(result.rows.item(0).maxAny, (result.rows.item(0).maxMes - 1), (result.rows.item(0).maxDia - marginDays));
      callback(r1, r2, r3, minDate, maxDate);
    });
}

export function getSolMem(table, dia, diocesi, lloc, diocesiName, temps, callback) {
  let auxDiocesiName = diocesiName;
  let auxDiocesi = diocesi;
  if (diocesi === 'Andorra' && dia !== '08-sep') {
    auxDiocesiName = 'Urgell';
    auxDiocesi = transformDiocesiName('Urgell', lloc);
  }
  let auxDiocesiQuery = `'${auxDiocesi}'`;
  if (lloc === 'Ciutat') {
    auxDiocesiQuery = `'${auxDiocesi}' OR Diocesis = '${transformDiocesiName(auxDiocesiName, 'Diòcesi')}' OR Diocesis = '${transformDiocesiName(auxDiocesiName, 'Catedral')}'`;
  }
  else if (lloc === 'Catedral') {
    auxDiocesiQuery = `'${auxDiocesi}' OR Diocesis = '${transformDiocesiName(auxDiocesiName, 'Diòcesi')}' OR Diocesis = '${transformDiocesiName(auxDiocesiName, 'Ciutat')}'`;
  }
  else if (lloc === 'Diòcesi') {
    auxDiocesiQuery = `'${auxDiocesi}' OR Diocesis = '${transformDiocesiName(auxDiocesiName, 'Catedral')}' OR Diocesis = '${transformDiocesiName(auxDiocesiName, 'Ciutat')}'`;
  }
  const query = `SELECT * FROM ${table} WHERE (Diocesis = ${auxDiocesiQuery} OR Diocesis = '-') AND dia = '${dia}' AND Temps = '${temps}'`;

  executeQuery(query,
    result => {
      const index = findCorrect(result.rows, result.rows.length, auxDiocesi, auxDiocesiName, lloc);
      callback(result.rows.item(index));
    });
}

export function getSolMemDiesMov(table, id, callback) {
  let query = `SELECT * FROM ${table} WHERE id = '${id}'`;
  executeQuery(query,
    result => callback(result.rows.item(0)));
}

export function getV(callback) {
  let query = `SELECT * FROM santsMemories WHERE id = 457`;
  executeQuery(query,
    result => callback(result.rows.item(0)));
}

export function getOC(categoria, callback) {
  let query = `SELECT * FROM OficisComuns WHERE Categoria = '${categoria}'`;
  executeQuery(query,
    result => callback(result.rows.item(0), categoria));
}

export function getVispers(idSpecialVespers, callback){
    let query = `SELECT * FROM LDSantoral WHERE id = '${idSpecialVespers}'`;
    executeQuery(query,
      result => callback(result.rows.item(0))
    );
}

export function getLDSantoral(day, specialResultId, celType, tempsEspecific, cicleABC, diaSetmana, parImpar, setmana, diocesiName, callback) {
  getLDNormal(tempsEspecific, cicleABC, diaSetmana, setmana, parImpar, (normal_result) => {

    let query;
    if (specialResultId === '-1') {
      //Normal santoral day
      const diocesis = GF.transformDiocesiName(diocesiName, "Diòcesi");
      query = `SELECT subquery_two.* FROM (SELECT CASE WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 1 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 2 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 3 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 4 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 5 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 6 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 7 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 8 END AS result_preference ,subquery_one.* FROM  (SELECT CASE WHEN LDSantoral.Cicle = '${cicleABC}' THEN 1 WHEN LDSantoral.Cicle = '-' THEN 0 ELSE 2 END AS match_cicle ,CASE WHEN LDSantoral.DiadelaSetmana = '${diaSetmana}' THEN 1 WHEN LDSantoral.DiadelaSetmana = '-' THEN 0 ELSE 2 END AS match_diadelasetmana ,CASE WHEN LDSantoral.paroimpar = '${parImpar}' THEN 1 WHEN LDSantoral.paroimpar = '-' THEN  0 ELSE 2 END AS match_paroimpar ,LDSantoral.* FROM LDSantoral WHERE LDSantoral.Categoria = '${celType}'AND LDSantoral.tempsespecific = '${tempsEspecific}'AND LDSantoral.dia = '${day}') AS subquery_one WHERE subquery_one.match_cicle <> 2 AND subquery_one.match_diadelasetmana <> 2 AND subquery_one.match_paroimpar <> 2 ) AS subquery_two WHERE subquery_two.Diocesis = '${diocesis}' OR subquery_two.Diocesis = '-' ORDER BY subquery_two.result_preference ASC, subquery_two.Diocesis DESC LIMIT 1;`;
      executeQuery(query,
        result => {
          if (result.rows.length === 0) {
            //Not in Santoral
            callback(normal_result);
          }
          else {
            const data_return = result.rows.item(0);
            if(normal_result !== undefined){
              if (data_return.Lectura1Text === '-'){
                data_return.Lectura1 = normal_result.Lectura1;
                data_return.Lectura1Cita = normal_result.Lectura1Cita;
                data_return.Lectura1Titol = normal_result.Lectura1Titol;
                data_return.Lectura1Text = normal_result.Lectura1Text;
              }
              if (data_return.SalmText === '-'){
                data_return.Salm = normal_result.Salm;
                data_return.SalmText = normal_result.SalmText;
              }
              if (data_return.Lectura2Text === '-'){
                data_return.Lectura2 = normal_result.Lectura2;
                data_return.Lectura2Text = normal_result.Lectura2Cita;
                data_return.Lectura2Text = normal_result.Lectura2Titol;
                data_return.Lectura2Text = normal_result.Lectura2Text;
              }
              if (data_return.EvangeliText === '-'){
                data_return.Alleluia = normal_result.Alleluia;
                data_return.AlleluiaText = normal_result.AlleluiaText;
                data_return.Evangeli = normal_result.Evangeli;
                data_return.EvangeliCita = normal_result.EvangeliCita;
                data_return.EvangeliTitol = normal_result.EvangeliTitol;
                data_return.EvangeliText = normal_result.EvangeliText;
              }
            }
            callback(data_return);
          }
        });
    }
    else {
      //Special day
      query = `SELECT * FROM LDSantoral WHERE id = '${specialResultId}'`;
      executeQuery(query,
        result => {

          const special_result = result.rows.item(0);

          if(normal_result !== undefined){
              if (special_result.Lectura1Text === '-'){
                special_result.Lectura1 = normal_result.Lectura1;
                special_result.Lectura1Cita = normal_result.Lectura1Cita;
                special_result.Lectura1Titol = normal_result.Lectura1Titol;
                special_result.Lectura1Text = normal_result.Lectura1Text;
              }
              if (special_result.SalmText === '-'){
                special_result.Salm = normal_result.Salm;
                special_result.SalmText = normal_result.SalmText;
              }
              if (special_result.Lectura2Text === '-'){
                special_result.Lectura2 = normal_result.Lectura2;
                special_result.Lectura2Text = normal_result.Lectura2Cita;
                special_result.Lectura2Text = normal_result.Lectura2Titol;
                special_result.Lectura2Text = normal_result.Lectura2Text;
              }
              if (special_result.EvangeliText === '-'){
                special_result.Alleluia = normal_result.Alleluia;
                special_result.AlleluiaText = normal_result.AlleluiaText;
                special_result.Evangeli = normal_result.Evangeli;
                special_result.EvangeliCita = normal_result.EvangeliCita;
                special_result.EvangeliTitol = normal_result.EvangeliTitol;
                special_result.EvangeliText = normal_result.EvangeliText;
              }
            }
            callback(special_result)
        }
      );
    }
  });
}

export function getLDNormal(tempsEspecific, cicleABC, diaSetmana, setmana, parImpar, callback) {
  let query = `SELECT * FROM LDdiumenges WHERE tempsespecific = '${tempsEspecific}' AND DiadelaSetmana = '${diaSetmana}' AND NumSet = '${setmana}'`;
  executeQuery(query,
    result => {
      let i = LDGetIndexNormal(result, cicleABC, parImpar, diaSetmana);
      callback(result.rows.item(i));
    });
}

function findCorrect(rows, length, diocesi, diocesiName, lloc) {
  //Catedral < Ciutat < Diòcesi < -
  if (length === 1) return 0;
  let auxDiocesiName = diocesiName;
  let auxDiocesi = diocesi;
  let i = 0;
  while (i < length) {
    if (rows.item(i).Diocesis === auxDiocesi) return i;
    i += 1;
  }
  if (lloc === 'Ciutat') {
    auxDiocesi = transformDiocesiName(auxDiocesiName, 'Diòcesi');
    i = 0;
    while (i < length) {
      if (rows.item(i).Diocesis === auxDiocesi) return i;
      i += 1;
    }
  }
  if (lloc === 'Catedral') {
    auxDiocesi = transformDiocesiName(auxDiocesiName, 'Ciutat');
    i = 0;
    while (i < length) {
      if (rows.item(i).Diocesis === auxDiocesi) return i;
      i += 1;
    }
    auxDiocesi = transformDiocesiName(auxDiocesiName, 'Diòcesi');
    i = 0;
    while (i < length) {
      if (rows.item(i).Diocesis === auxDiocesi) return i;
      i += 1;
    }
  }
  return 0;
}

function transformDiocesiName(diocesi, lloc) {
  switch (diocesi) {
    case "Barcelona":
      switch (lloc) {
        case "Diòcesi":
          return 'BaD';
        case "Catedral":
          return 'BaC';
        case "Ciutat":
          return 'BaV';
      }
      break;
    case "Girona":
      switch (lloc) {
        case "Diòcesi":
          return 'GiD';
        case "Catedral":
          return 'GiC';
        case "Ciutat":
          return 'GiV';
      }
      break;
    case "Lleida":
      switch (lloc) {
        case "Diòcesi":
          return 'LlD';
        case "Catedral":
          return 'LlC';
        case "Ciutat":
          return 'LlV';
      }
      break;
    case "Sant Feliu de Llobregat":
      switch (lloc) {
        case "Diòcesi":
          return 'SFD';
        case "Catedral":
          return 'SFC';
        case "Ciutat":
          return 'SFV';
      }
      break;
    case "Solsona":
      switch (lloc) {
        case "Diòcesi":
          return 'SoD';
        case "Catedral":
          return 'SoC';
        case "Ciutat":
          return 'SoV';
      }
      break;
    case "Tarragona":
      switch (lloc) {
        case "Diòcesi":
          return 'TaD';
        case "Catedral":
          return 'TaC';
        case "Ciutat":
          return 'TaV';
      }
      break;
    case "Terrassa":
      switch (lloc) {
        case "Diòcesi":
          return 'TeD';
        case "Catedral":
          return 'TeC';
        case "Ciutat":
          return 'TeV';
      }
      break;
    case "Tortosa":
      switch (lloc) {
        case "Diòcesi":
          return 'ToD';
        case "Catedral":
          return 'ToC';
        case "Ciutat":
          return 'ToV';
      }
      break;
    case "Urgell":
      switch (lloc) {
        case "Diòcesi":
          return 'UrD';
        case "Catedral":
          return 'UrC';
        case "Ciutat":
          return 'UrV';
      }
      break;
    case "Vic":
      switch (lloc) {
        case "Diòcesi":
          return 'ViD';
        case "Catedral":
          return 'ViC';
        case "Ciutat":
          return 'ViV';
      }
      break;
    case "Andorra":
      return 'Andorra';
    case "Mallorca":
      switch (lloc) {
        case "Diòcesi":
          return 'MaD';
        case "Catedral":
          return 'MaC';
        case "Ciutat":
          return 'MaV';
      }
      break;
  }

  return ('BaD');
}

function LDGetIndexNormal(result, cicleABC, parImpar, diaSetmana) {
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
  }
  else {
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
    }
    else if (rows[0].paroimpar !== '-' && rows[0].Cicle === '-') {
      //2) cicle == '-' and paroimpar != '-'
      for (i = 0; i < rows.length; i++) {
        if (rows[i].paroimpar === parImpar) {
          index = i;
          break;
        }
      }
    }
    else if (rows[0].paroimpar !== '-' && rows[0].Cicle !== '-') {
      //3) cicle != '-' and paroimpar != '-'
      for (i = 0; i < rows.length; i++) {
        if (rows[i].Cicle === cicleABC && rows[i].paroimpar === parImpar) {
          index = i;
          break;
        }
      }
    }
  }
  else if (rows.length === 1) {
    //4) cicle == '-' and paroimpar == '-'
    index = 0;
  }

  if (index === undefined) {
    Logger.Log(Logger.LogKeys.DatabaseAdapter, "LDGetIndexNormal", "No index found");
    index = -1;
  }
  else {
    index += (result.rows.length - rows.length);
  }
  return index;
}
import { Platform } from 'react-native';
import GLOBAL from '../Globals/Globals';
import GF from '../Globals/GlobalFunctions';
import { log } from 'react-native-reanimated';
import { OpenDatabaseIfNotOpenedYet, CPLDataBase } from './OpenDatabaseHelper.js';

export default class DBAdapter {
  constructor() {
  }

  executeQuery(query, callback, errorCallback) {
    console.log("[DB-MANAGEMENT] executeQuery: ", query);
    OpenDatabaseIfNotOpenedYet().then(() => {
      console.log("[DB-MANAGEMENT] CPLDataBase", CPLDataBase);
      if(CPLDataBase != undefined){
        CPLDataBase.transaction((tx) => {
          tx.executeSql(query, [], (SQLTransaction, SQLResultSet) => {
            console.log("[DB-MANAGEMENT] OK - SQLResultSet: ", SQLResultSet);
            callback(SQLResultSet);
          }, (SQLTransaction, SQLError) => {
            console.log("[executeQuery] NOK - error in query (" + query + "): ", SQLError);
            console.log("errorCallback: " + errorCallback);
            if(errorCallback != undefined) {
              errorCallback(SQLError);
            }
          });
        });
      }
      else{
        if(errorCallback != undefined) {
          errorCallback(resultMsg);
        }
      }
    });
  }

  getDatabaseVersion(callback){
    var onlineVersionPromise = new Promise((resolve) => {
      this.executeQuery(`SELECT IFNULL(MAX(id), 0) As databaseVersion FROM _tables_log`,
        result => resolve(result.rows.item(0).databaseVersion),
        () => resolve(0) );
    });

    onlineVersionPromise.then(result => callback(result));

    return onlineVersionPromise;
  }

  getLiturgia(table, id, callback) {
    if (id !== -1) {
      // if(table === 'tempsNadalOctava') console.log(`tempsAdventSetmanesDium---> SELECT * FROM ${table} WHERE id = ${id}`);
      this.executeQuery(`SELECT * FROM ${table} WHERE id = ${id}`,
        result => callback(result.rows.item(0)));
    }
    else {
      this.executeQuery(`SELECT * FROM ${table}`,
        result => callback(result.rows));
    }
  }

  getAnyLiturgic(year, month, day, callback, errorCallback) {
    var query = `SELECT * FROM anyliturgic WHERE any = '${year}' AND mes = '${month + 1}' AND dia = '${day}'`;
    console.log("QueryLog. QUERY ANY: " + query);
    this.executeQuery(query,
      result => {
        this.getTomorrow(result.rows.item(0), year, month, day, callback);
      }
      ,errorCallback);
  }

  getTomorrow(r1, year, month, day, callback) {
    var tomorrow = new Date(year, month, day);
    tomorrow.setDate(tomorrow.getDate() + 1);
    year2 = tomorrow.getFullYear();
    month2 = tomorrow.getMonth();
    day2 = tomorrow.getDate();

    console.log("year2", year2);

    var query = `SELECT * FROM anyliturgic WHERE any = '${year2}' AND mes = '${month2 + 1}' AND dia = '${day2}'`;
    console.log("QUERY AnyTomorrow: " + query);
    this.executeQuery(query,
      result => {
        // console.log(">>Tomorrow: " + result.rows.item(0).dia + '/' + result.rows.item(0).mes);
        this.getPentacosta(r1, result.rows.item(0), year, callback);
      });
  }

  getPentacosta(r1, r2, year, callback) {
    console.log("paolo temps 1: ", GLOBAL);
    console.log("wtf: ", GLOBAL.DBAccess);
    console.log("wtf: ", GLOBAL.P_SETMANES);
    console.log("wtf: ", GLOBAL.afternoon_hour);
    var query = `SELECT * FROM anyliturgic WHERE any = '${year}' AND temps = 'P_SETMANES' AND NumSet = '8' AND DiadelaSetmana = 'Dg'`;
    console.log("QueryLog. getPentacosta: " + query);
    this.executeQuery(query,
      result => {
        var pentacosta = new Date(year, (result.rows.item(0).mes - 1), result.rows.item(0).dia);
        console.log(result.rows.item(0).dia + '/' + (result.rows.item(0).mes - 1) + '/' + year);        
        console.log("InfoLog. Pentacosta 1: " + pentacosta.getDate() + '/' + pentacosta.getMonth() + '/' + pentacosta.getFullYear());
        this.getMinMaxDates(r1, r2, pentacosta, callback);
      });
  }

  getMinMaxDates(r1, r2, r3, callback){
    var query = `SELECT MIN(CAST(any As INTEGER)) as minAny, (SELECT MIN(CAST(anyliturgic2.mes As INTEGER)) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) As TEXT)) as minMes, (SELECT MIN(CAST(anyliturgic3.dia As INTEGER)) FROM anyliturgic anyliturgic3 WHERE anyliturgic3.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) As TEXT) AND anyliturgic3.mes = (SELECT CAST(MIN(CAST(anyliturgic2.mes As INTEGER)) as TEXT) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MIN(CAST(anyliturgic.any As INTEGER)) as TEXT))) as minDia, MAX(any) as maxAny, (SELECT MAX(CAST(anyliturgic2.mes As INTEGER)) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MAX(CAST(anyliturgic.any as INTEGER)) As TEXT)) as maxMes, (SELECT MAX(CAST(anyliturgic3.dia As INTEGER)) FROM anyliturgic anyliturgic3 WHERE anyliturgic3.any = CAST(MAX(CAST(anyliturgic.any As INTEGER)) As TEXT) AND anyliturgic3.mes = (SELECT CAST(MAX(CAST(anyliturgic2.mes as INTEGER)) As TEXT) FROM anyliturgic anyliturgic2 WHERE anyliturgic2.any = CAST(MAX(CAST(anyliturgic.any As INTEGER)) As TEXT))) as maxDia FROM anyliturgic`;
    console.log("QueryLog. getMinMaxDates: " + query);
    this.executeQuery(query,
      result => {
        var marginDays = 2;
        minDate = new Date(result.rows.item(0).minAny, (result.rows.item(0).minMes - 1), (result.rows.item(0).minDia + marginDays));
        maxDate = new Date(result.rows.item(0).maxAny, (result.rows.item(0).maxMes - 1), (result.rows.item(0).maxDia - marginDays));
        console.log("minDate " + minDate.getDate() + "/" + minDate.getMonth() + "/" + minDate.getFullYear() + " || ", minDate);
        console.log("maxDate " + maxDate.getDate() + "/" + maxDate.getMonth() + "/" + maxDate.getFullYear() + " || ", maxDate);
        callback(r1, r2, r3, minDate, maxDate);
      });
  }

  getSolMem(table, dia, diocesi, lloc, diocesiName, temps, callback) {
    var auxDiocesiName = diocesiName;
    var auxDiocesi = diocesi;
    if (diocesi === 'Andorra' && dia !== '08-sep') {
      var auxDiocesiName = 'Urgell';
      var auxDiocesi = this.transformDiocesiName('Urgell', lloc);
    }
    var auxDiocesiQuery = `'${auxDiocesi}'`;
    if (lloc === 'Ciutat') {
      auxDiocesiQuery = `'${auxDiocesi}' OR Diocesis = '${this.transformDiocesiName(auxDiocesiName, 'Diòcesi')}' OR Diocesis = '${this.transformDiocesiName(auxDiocesiName, 'Catedral')}'`;
    }
    else if (lloc === 'Catedral') {
      auxDiocesiQuery = `'${auxDiocesi}' OR Diocesis = '${this.transformDiocesiName(auxDiocesiName, 'Diòcesi')}' OR Diocesis = '${this.transformDiocesiName(auxDiocesiName, 'Ciutat')}'`;
    }
    else if (lloc === 'Diòcesi') {
      auxDiocesiQuery = `'${auxDiocesi}' OR Diocesis = '${this.transformDiocesiName(auxDiocesiName, 'Catedral')}' OR Diocesis = '${this.transformDiocesiName(auxDiocesiName, 'Ciutat')}'`;
    }
    console.log("paolo temps 2: " + temps);
    var query = `SELECT * FROM ${table} WHERE (Diocesis = ${auxDiocesiQuery} OR Diocesis = '-') AND dia = '${dia}' AND Temps = '${temps}'`;

    console.log("QueryLog. QUERY SOL_MEM: " + query);

    this.executeQuery(query,
      result => {
        console.log("InfoLog. SolMem Result size: " + result.rows.length);
        var index = this.findCorrect(result.rows, result.rows.length, auxDiocesi, auxDiocesiName, lloc);
        console.log("InfoLog. Index definitive: " + index);
        callback(result.rows.item(index));
      });
  }

  findCorrect(rows, length, diocesi, diocesiName, lloc) {
    //Catedral < Ciutat < Diòcesi < -
    if (length === 1) return 0;
    auxDiocesiName = diocesiName;
    auxDiocesi = diocesi;
    var i = 0;
    while (i < length) {
      if (rows.item(i).Diocesis === auxDiocesi) return i;
      i += 1;
    }
    if (lloc === 'Ciutat') {
      auxDiocesi = this.transformDiocesiName(auxDiocesiName, 'Diòcesi');
      i = 0;
      while (i < length) {
        if (rows.item(i).Diocesis === auxDiocesi) return i;
        i += 1;
      }
    }
    if (lloc === 'Catedral') {
      auxDiocesi = this.transformDiocesiName(auxDiocesiName, 'Ciutat');
      i = 0;
      while (i < length) {
        if (rows.item(i).Diocesis === auxDiocesi) return i;
        i += 1;
      }
      auxDiocesi = this.transformDiocesiName(auxDiocesiName, 'Diòcesi');
      i = 0;
      while (i < length) {
        if (rows.item(i).Diocesis === auxDiocesi) return i;
        i += 1;
      }
    }
    return 0; //-
  }

  getSolMemDiesMov(table, id, callback) {
    var query = `SELECT * FROM ${table} WHERE id = '${id}'`;

    console.log("QueryLog. QUERY SOL_MEM-Dies_Mov: " + query);

    this.executeQuery(query,
      result => callback(result.rows.item(0)));
  }

  getV(callback) {
    var query = `SELECT * FROM santsMemories WHERE id = 457`;

    this.executeQuery(query,
      result => callback(result.rows.item(0)));
  }

  getOC(categoria, callback) {
    var query = `SELECT * FROM OficisComuns WHERE Categoria = '${categoria}'`;
    console.log("QueryLog. QUERY getOC: " + query);
    console.log("InfoLog. Oficis comuns log -1 - " + categoria);
    this.executeQuery(query,
      result => callback(result.rows.item(0), categoria));
  }

  getVispers(idSpecialVespers, callback){
      var query = `SELECT * FROM LDSantoral WHERE id = '${idSpecialVespers}'`;
      console.log("QueryLog. QUERY getLDSantoral: " + query);
      this.executeQuery(query,
        result => callback(result.rows.item(0))
      );
  }

  getLDSantoral(day, specialResultId, celType, tempsEspecific, cicleABC, diaSetmana, parImpar, setmana, callback) {
        
    this.getLDNormal(tempsEspecific, cicleABC, diaSetmana, setmana, parImpar, (normal_result) => {

      console.log("Normal result", normal_result);

      if (specialResultId == '-1') {
        //Normal santoral day
        var diocesis = GF.transformDiocesiName(G_VALUES.diocesiName, "Diòcesi")
        var query = `SELECT subquery_two.* FROM (SELECT CASE WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 1 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 2 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 1 THEN 3 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 1 AND subquery_one.match_paroimpar = 0 THEN 4 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 5 WHEN subquery_one.match_cicle = 1 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 6 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 1 THEN 7 WHEN subquery_one.match_cicle = 0 AND subquery_one.match_diadelasetmana = 0 AND subquery_one.match_paroimpar = 0 THEN 8 END AS result_preference ,subquery_one.* FROM  (SELECT CASE WHEN LDSantoral.Cicle = '${cicleABC}' THEN 1 WHEN LDSantoral.Cicle = '-' THEN 0 ELSE 2 END AS match_cicle ,CASE WHEN LDSantoral.DiadelaSetmana = '${diaSetmana}' THEN 1 WHEN LDSantoral.DiadelaSetmana = '-' THEN 0 ELSE 2 END AS match_diadelasetmana ,CASE WHEN LDSantoral.paroimpar = '${parImpar}' THEN 1 WHEN LDSantoral.paroimpar = '-' THEN  0 ELSE 2 END AS match_paroimpar ,LDSantoral.* FROM LDSantoral WHERE LDSantoral.Categoria = '${celType}'AND LDSantoral.tempsespecific = '${tempsEspecific}'AND LDSantoral.dia = '${day}') AS subquery_one WHERE subquery_one.match_cicle <> 2 AND subquery_one.match_diadelasetmana <> 2 AND subquery_one.match_paroimpar <> 2 ) AS subquery_two WHERE subquery_two.Diocesis = '${diocesis}' OR subquery_two.Diocesis = '-' ORDER BY subquery_two.result_preference ASC, subquery_two.Diocesis DESC LIMIT 1;`;
        console.log("QueryLog. QUERY getLDSantoral: " + query);
        this.executeQuery(query,
          result => {

            console.log("InfoLog. getLDSantoral Result size: " + result.rows.length);
            console.log("Santoral result", result);
            
            if (result.rows.length == 0) {
              //Not in Santoral
              callback(normal_result);
            }
            else {
              console.log("LDSantoral ID: ", result.rows.item(0).Id);
              
              var data_return = result.rows.item(0);

              if(normal_result != undefined){
                if (data_return.Lectura1Text == '-'){
                  data_return.Lectura1 = normal_result.Lectura1;
                  data_return.Lectura1Cita = normal_result.Lectura1Cita;
                  data_return.Lectura1Titol = normal_result.Lectura1Titol;
                  data_return.Lectura1Text = normal_result.Lectura1Text;
                }
                if (data_return.SalmText == '-'){
                  data_return.Salm = normal_result.Salm;
                  data_return.SalmText = normal_result.SalmText;
                }
                if (data_return.Lectura2Text == '-'){
                  data_return.Lectura2 = normal_result.Lectura2;
                  data_return.Lectura2Text = normal_result.Lectura2Cita;
                  data_return.Lectura2Text = normal_result.Lectura2Titol;
                  data_return.Lectura2Text = normal_result.Lectura2Text;
                }
                if (data_return.EvangeliText == '-'){
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
        var query = `SELECT * FROM LDSantoral WHERE id = '${specialResultId}'`;
        console.log("QueryLog. QUERY getLDSantoral: " + query);
        this.executeQuery(query,
          result => {

            var special_result = result.rows.item(0);

              if(normal_result != undefined){
                if (special_result.Lectura1Text == '-'){
                  special_result.Lectura1 = normal_result.Lectura1;
                  special_result.Lectura1Cita = normal_result.Lectura1Cita;
                  special_result.Lectura1Titol = normal_result.Lectura1Titol;
                  special_result.Lectura1Text = normal_result.Lectura1Text;
                }
                if (special_result.SalmText == '-'){
                  special_result.Salm = normal_result.Salm;
                  special_result.SalmText = normal_result.SalmText;
                }
                if (special_result.Lectura2Text == '-'){
                  special_result.Lectura2 = normal_result.Lectura2;
                  special_result.Lectura2Text = normal_result.Lectura2Cita;
                  special_result.Lectura2Text = normal_result.Lectura2Titol;
                  special_result.Lectura2Text = normal_result.Lectura2Text;
                }
                if (special_result.EvangeliText == '-'){
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

  getLDNormal(tempsEspecific, cicleABC, diaSetmana, setmana, parImpar, callback) {

    var query = `SELECT * FROM LDdiumenges WHERE tempsespecific = '${tempsEspecific}' AND DiadelaSetmana = '${diaSetmana}' AND NumSet = '${setmana}'`;
    console.log("QueryLog. QUERY getLDNormal: " + query);
    this.executeQuery(query,
      result => {
        console.log("InfoLog. getLDNormal Result size: " + result.rows.length);
        var i = this.LDGetIndexNormal(result, cicleABC, parImpar, diaSetmana);
        callback(result.rows.item(i));
      });
  }

  LDGetIndexNormal(result, cicleABC, parImpar, diaSetmana) {
    //For getLDSantoral is necessari let in result just the rows with diaSetmana (just in case any of them have diaSetmana != '-')
    var haveSomeDiaSetmana = false;
    var DiaIsTheSame = false;
    for (let i = 0; i < result.rows.length; i++) {
      if (result.rows.item(i).DiadelaSetmana != '-') {
        haveSomeDiaSetmana = true;
        if (result.rows.item(i).DiadelaSetmana == diaSetmana)
          DiaIsTheSame = true;
        break;
      }
    }


    console.log("[LDGetIndex] haveSomeDiaSetmana: " + haveSomeDiaSetmana); 
    console.log("[LDGetIndex] DiaIsTheSame: " + DiaIsTheSame); 
    console.log("[LDGetIndex] diaSetmana: " + diaSetmana); 
    

    var rows = [];

    if (haveSomeDiaSetmana) {
      for (let i = 0; i < result.rows.length; i++) {
        if ((DiaIsTheSame && result.rows.item(i).DiadelaSetmana == diaSetmana) ||
            (!DiaIsTheSame && result.rows.item(i).DiadelaSetmana == '-')) {
              rows.push(result.rows.item(i));
        }
      }
      console.log("[LDGetIndex] rows 1"); 
    }
    else {
      for (let i = 0; i < result.rows.length; i++) {
        rows.push(result.rows.item(i));
      }
      console.log("[LDGetIndex] rows 2"); 
    }
    
    var index;
    if (rows.length > 1) {
      if (rows[0].Cicle != '-' && rows[0].paroimpar == '-') {
        console.log("[LDGetIndex] here 1"); 
        //1) cicle != '-' and paroimpar != '-'
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].Cicle == cicleABC) {
            index = i;
            break;
          }
        }
      }
      else if (rows[0].paroimpar != '-' && rows[0].Cicle == '-') {
        console.log("[LDGetIndex] here 2"); 
        //2) cicle == '-' and paroimpar != '-'
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].paroimpar == parImpar) {
            index = i;
            break;
          }
        }
      }
      else if (rows[0].paroimpar != '-' && rows[0].Cicle != '-') {
        console.log("[LDGetIndex] here 3"); 
        //3) cicle != '-' and paroimpar != '-'
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].Cicle == cicleABC && rows[i].paroimpar == parImpar) {
            index = i;
            break;
          }
        }
      }
    }
    else if (rows.length == 1) {
      console.log("[LDGetIndex] here 4"); 
      //4) cicle == '-' and paroimpar == '-'
      index = 0;
    }

    console.log("[DEBUG] index: ", index);
    console.log("[DEBUG] result.rows.length: ", result.rows.length);
    console.log("[DEBUG] rows.length: ", rows.length);
    

    if (index == undefined) {
      console.log("Index not found");
      index = -1;
    }
    else {
      index += (result.rows.length - rows.length);
    }
    console.log("InfoLog. Index definitive: " + index);
    return index;
  }

  transformDiocesiName(diocesi, lloc) {
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

}

/*executeQuery_onlinechanges(query) {

    let promise = new Promise((resolve) => {

      try {
        OpenDatabaseIfNotOpenedYet().then((ok_status) => {
          console.log("[ONLINE_UPDATES executeQuery_onlinechanges] ok_status:", ok_status);
          if(ok_status == "OK"){
            this.database.transaction((tx) => {
              tx.executeSql(query, [], (SQLTransaction, SQLResultSet) => {
                resolve(true)
              }, (SQLTransaction, SQLError) => {
                console.log("[ONLINE_UPDATES executeQuery_onlinechanges] error in query (" + query + "): ", SQLError);
                resolve(false)
              });
            });
          }
          else{
            resolve(false);
          }
        });
      } catch (error) {
        console.log("[ONLINE_UPDATES executeQuery_onlinechanges] error: ", error);
      }
    });
  
    return promise

  }*/

  /*MakeChanges(json_updates){

    let promise = new Promise((resolve, reject) => {

      console.log("[ONLINE_UPDATES MakeChanges]", json_updates);

      let promises = [];
      let sql;

      console.log("[ONLINE_UPDATES MakeChanges] json_updates.length", json_updates.length);

      for (var i = 0; i < json_updates.length; i++) {

        var change = json_updates[i]
        console.log("[ONLINE_UPDATES MakeChanges] change", change);

        switch (change.action) {
          
          //UPDATE
          case "2":

              var set_statement = ""
              var j = 0
              for (const key in change.values) {
                console.log("[ONLINE_UPDATES MakeChanges] change.values", change.values);
                if (change.values.hasOwnProperty(key)) {
                  set_statement += key + " = '" + change.values[key] + "'"
                  if(j < (Object.keys(change.values).length - 1))
                    set_statement += ", "
                  j += 1
                }
              } 
              // UPDATE diversos SET 0 = '[object Object]' WHERE id = 1
              sql = "UPDATE " + change.table_name + " SET " + set_statement + " WHERE id = " + change.row_id;
              
              console.log("[ONLINE_UPDATES MakeChanges] SQL: ", sql);

              promises.push(this.executeQuery_onlinechanges(sql))

            break;

          //INSERT
          case "1":

            var aux = JSON.stringify(change.values)
            aux = aux.replace(/{/g, "")
            aux = aux.replace(/}/g, "")
            aux = aux.replace(/\"/g, "")
            var arr_aux = aux.split(",")

            var ref_statement = ""
            var val_statement = ""
            for (var j = 0; j < arr_aux.length; j++){
              ref_statement += arr_aux[j].split(":")[0] 
              val_statement += ("'" + arr_aux[j].split(":")[1] + "'")
              if(j < (arr_aux.length - 1)){
                ref_statement += ", "
                val_statement += ", "
              }
            }
          
            sql = "INSERT INTO " + change_name + "(" + ref_statement + ") VALUES (" + val_statement + ")";
              
            console.log("[ONLINE_UPDATES MakeChanges] SQL: ", sql);

            promises.push(this.executeQuery_onlinechanges(sql))

            break;
            
          //DELETE
          case "3":

            sql =  "DELETE FROM " + change.table_name + " WHERE id = " + change.row_id;
        
            console.log("[ONLINE_UPDATES MakeChanges] SQL: ", sql);

            promises.push(this.executeQuery_onlinechanges(sql))

            break;

        }

      }

      console.log("[ONLINE_UPDATES MakeChanges] promises.length: ", promises.length);

      // Check promises length
      if(promises.length == 0) {
        resolve(false)
      }
      else{
        console.log("[ONLINE_UPDATES PAOLOO1");
      
        Promise.all(promises).then(res => {
  
          console.log("[ONLINE_UPDATES PAOLOO2", res);

          if(res == undefined){
            reject(new Error("Something is not right"));
          }
          else{
            let total_res = true
            for (var i = 0; i < res.length; i++) {
              console.log("[ONLINE_UPDATES MakeChanges] promise " + i + " result:", res[i]);
              if (!res[i]){
                total_res = false;
              }
            }
    
            console.log("[ONLINE_UPDATES MakeChanges] total_res: ", total_res);
    
            resolve(total_res)
          }
  
        })
        .catch((error) => {
          console.log("[EXCEPTION ONLINE_UPDATES MakeChanges]", error);
          resolve(false)
        });
      }

    });

    return promise
    
  }*/

/*async function openDatabase(){
  if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
    await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
  }
  await FileSystem.downloadAsync(
    Asset.fromModule(require('../Assets/db/cpl-app.db')).uri,
    FileSystem.documentDirectory + 'SQLite/cpl-app.db'
  );
  return SQLite.openDatabase('cpl-app.db');
}*/
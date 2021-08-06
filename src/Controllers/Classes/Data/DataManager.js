import { AsyncStorage, Appearance } from 'react-native';

import DBAdapter from '../../../Adapters/DBAdapter';
import GF from "../../../Globals/GlobalFunctions";
import GLOBAL from '../../../Globals/Globals';
import SOUL from '../SOUL/SOUL';
import SettingsManager from '../SettingsManager';
//import { TEST_MODE_ON } from '../../../Tests/TestsManager';
const TEST_MODE_ON = false;

/************
 * Class in charge of having all the data that will be shown in views. 
 * Also, to refreshe when necessary.
 * DataManager will posses LitHoresManager and LitDiaManager. So, this class 
 * is the only way to get and refresh all the data. 
 * DataManager uses singleton pattern in order to be accessible to other classes being 
 * just one instance in the whole program.
 ***********/

//Generic values
G_VALUES = {}
//Liturgia de les Hores values
LH_VALUES = {}
//Liturgia diària values
LD_VALUES = {}
//Last refresh datetime
LAST_REFRESH = new Date()

export function Reload_All_Data(date, Reload_Finished_Callback, Reload_Finished_Callback_Error, online_updates) {
  // Set some variables
  this.Reload_Finished_Callback = Reload_Finished_Callback;
  this.Reload_Finished_Callback_Error = Reload_Finished_Callback_Error;
  LAST_REFRESH = new Date();

  console.log("[PAU DEBUG] here2 ", online_updates);

  //Get G_VALUES saved locally
  G_VALUES.date = date;
  Promise.all([
    SettingsManager.getSettingLloc((r) => {
      if (!TEST_MODE_ON)
      {
        G_VALUES.lloc = r;
      }
    }),
    SettingsManager.getSettingDiocesis((r) => {
      if (!TEST_MODE_ON)
      {
        G_VALUES.diocesi = GF.transformDiocesiName(r, G_VALUES.lloc);
        G_VALUES.diocesiName = r;
      }
    }),
    SettingsManager.getSettingUseLatin((r) => G_VALUES.llati = r),
    SettingsManager.getSettingTextSize((r) => G_VALUES.textSize = r),
    SettingsManager.getSettingDarkMode((r) => {
      var aux_darkMode = false;
      switch (r) {
        case "Activat":
          aux_darkMode = true;
          break;
        case "Desactivat":
          aux_darkMode = false;
          break;
        case "Automàtic":
          if (Appearance.getColorScheme() === 'dark') {
            aux_darkMode = true;
          } else {
            aux_darkMode = false;
          }
          break;
      }
      G_VALUES.darkModeEnabled = aux_darkMode;
      console.log("G_VALUES.darkModeEnabled: " + G_VALUES.darkModeEnabled);
    }),
    SettingsManager.getSettingNumSalmInv((r) => G_VALUES.numSalmInv = r),
    SettingsManager.getSettingNumAntMare((r) => G_VALUES.numAntMare = r),
    GLOBAL.DBAccess.getDatabaseVersion((r) => G_VALUES.databaseVersion = r),
  ])
  .then(() => {

    console.log("[ONLINE_UPDATES Reload_All_Data] G_VALUES.databaseVersion: ", G_VALUES.databaseVersion);
    console.log("[ONLINE_UPDATES Reload_All_Data] online_updates: ", online_updates);

    //Check for global parameter
    if(online_updates){

      //Check and apply online changes. Finally will call Refresh_Data
      Check_For_Updates().then((result) => {

        console.log("[ONLINE_UPDATES Reload_All_Data] result: ", result);
  
        //Get the other G_VALUES, the LH_VALUES and the LD_VALUES
        Refresh_Data();
  
      });

    }
    else{

      console.log("[PAU DEBUG] here3 ");

      Refresh_Data();

    }

  });
}

//Resolves true if online_updates = false or it its true and all updates went ok
function Check_For_Updates(){

  let promise = new Promise((resolve) => {

    if(G_VALUES.databaseVersion == undefined){
      resolve(false);
    }
    else{

      //Get json with changes
      GetOnlineChanges(G_VALUES.databaseVersion).then((json_updates) => {

        console.log("[ONLINE_UPDATES Check_For_Updates] json_updates:", json_updates);

        //Check json
        if (json_updates == undefined || json_updates == "") throw "Internet error"

        //Ask DB_Access to make the changes (if there where any)
        GLOBAL.DBAccess.MakeChanges(json_updates).then((someChangedDoneCorrectly) => {

          console.log("[ONLINE_UPDATES Check_For_Updates] someChangedDoneCorrectly:", someChangedDoneCorrectly);

          //Check result
          if(someChangedDoneCorrectly){

            resolve(true);

            /*GLOBAL.DBAccess.SaveChangesInCacheDatabase().then(() => {
              console.log("[ONLINE_UPDATES Check_For_Updates] after SaveChangesInCacheDatabase");
              resolve(true);
            })
            .catch((error) => {
              console.log("[EXCEPTION Check_For_Updates] 0", error);
              resolve(true);
            });*/

          }
          else{
            resolve(false)
          }

        })
        .catch((error) => {
          console.log("[EXCEPTION Check_For_Updates] 1", error);
          resolve(false)
        });

      })
      .catch((error) => {
        console.log("[EXCEPTION Check_For_Updates] 2", error);
        resolve(false)
      });

    }

  });

  return promise
  
}

function GetOnlineChanges(version) {
  
  console.log("[ONLINE_UPDATES GetOnlineChanges] version: ", version);

  var url = GLOBAL.server_url + version;
  console.log("[ONLINE_UPDATES GetOnlineChanges] url: ", url);

  return timeout(
    2000,
    /*timeoutTest(url, 3000)
      .then((test) => { return test; })
      .catch((error) => { console.log("[EXCEPTION GetOnlineChanges] TEST Fetch error:", error); })*/
    fetch(url, { headers: { 'Cache-Control': 'no-cache' } } )
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("[EXCEPTION GetOnlineChanges] Correct fetch");
        return responseJson;
      })
      .catch((error) => {
        console.log("[EXCEPTION GetOnlineChanges] Fetch error:", error);
      })
  );
}

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'))
    }, ms)

    promise
      .then(value => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch(reason => {
        clearTimeout(timer)
        reject(reason)
      })
  })
}

/*function timeoutTest(url, ms){
  return new Promise((resolve, reject) => {
    setTimeout(() => { 
      fetch(url, { headers: { 'Cache-Control': 'no-cache' } } )
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("[EXCEPTION GetOnlineChanges] Correct fetch");
          resolve(responseJson);
        })
        .catch((error) => {
          console.log("[EXCEPTION GetOnlineChanges] Fetch error:", error);
        })
    }
    ,ms);
  })
}*/

function Refresh_Data() {

  console.log("[Refresh_Data]");

  return GLOBAL.DBAccess.getAnyLiturgic(
    G_VALUES.date.getFullYear(),
    G_VALUES.date.getMonth(),
    G_VALUES.date.getDate(),
    (current, tomorrow, pentacosta, minDate, maxDate) => {

      console.log("[PAU DEBUG] here4 ");

      G_VALUES.minDatePicker = minDate;
      G_VALUES.maxDatePicker = maxDate;

      var celType = GF.getCelType(G_VALUES.diocesi, current);
      var tomorrowCelType = GF.getCelType(G_VALUES.diocesi, tomorrow);

      G_VALUES.celType = celType;
      G_VALUES.diaMogut = current.diaMogut;
      G_VALUES.diocesiMogut = current.diocesiMogut;
      G_VALUES.litColor = current.Color;
      G_VALUES.pentacosta = pentacosta;
      G_VALUES.tempsespecific = current.tempsespecific; //Ordinari, Quaresma, ... 
      G_VALUES.LT = current.temps; //O_ORDINAR, A_SETMANES, ...
      G_VALUES.cicle = current.cicle; //1-4
      G_VALUES.setmana = current.NumSet; //Ordinari: 1-34, pasqua: 2-7 i quaresma: 1-5 o 2-7
      G_VALUES.ABC = current.anyABC; //A, B o C
      G_VALUES.parImpar = current.paroimpar; //I o II
      G_VALUES.diaDeLaSetmana = current.DiadelaSetmana;

      var tomorrow_date = new Date(G_VALUES.date.getFullYear(), G_VALUES.date.getMonth(), G_VALUES.date.getDate());
      tomorrow_date.setDate(tomorrow_date.getDate() + 1);

      var dataTomorrow = {
        date: tomorrow_date,
        celType: tomorrowCelType,
        diaMogut: tomorrow.diaMogut,
        diocesiMogut: tomorrow.diocesiMogut,
        litColor: tomorrow.Color,
        tempsespecific: tomorrow.tempsespecific,
        LT: tomorrow.temps,
        cicle: tomorrow.cicle,
        setmana: tomorrow.NumSet,
        ABC: tomorrow.anyABC,
        parImpar: tomorrow.paroimpar,
        diaDeLaSetmana: tomorrow.DiadelaSetmana
      }
      G_VALUES.dataTomorrow = dataTomorrow;

      if (!TEST_MODE_ON)
        Check_Lliure_Date();

      //Get all liturgia data
      console.log("[PAU DEBUG] here5");
      new SOUL(Set_Soul_CB);
    }
    ,this.Reload_Finished_Callback_Error
  );
}

function Check_Lliure_Date() {

  AsyncStorage.getItem("lliureDate").then((value) => {
    if (!value) AsyncStorage.setItem('lliureDate', 'none');

    if (value && value !== 'none') {
      dataArr = value.split(':');
      if (parseInt(dataArr[0]) === G_VALUES.date.getDate() &&
        parseInt(dataArr[1]) === G_VALUES.date.getMonth() &&
        parseInt(dataArr[2]) === G_VALUES.date.getFullYear()) {
        G_VALUES.lliures = true;
      }
      else {
        G_VALUES.lliures = false;
      }
    }
    else {
      G_VALUES.lliures = false;
    }
  }).done();
}

function Set_Soul_CB(liturgia_hores, info_cel, liturgia_diaria) {
  LH_VALUES = liturgia_hores;
  G_VALUES.info_cel = info_cel;
  G_VALUES.primVespres = primVespres();
  LD_VALUES = liturgia_diaria;

  this.Reload_Finished_Callback();
}

function primVespres() {
  if ((G_VALUES.date.getDay() === 6 && G_VALUES.celType !== 'S') || LH_VALUES.vespres1) return true;
  return false;
}

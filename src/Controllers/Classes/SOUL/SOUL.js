import LH_SOUL from './LH_SOUL';
import LD_SOUL from './LD_SOUL';

export function SetSoul(globalData){
  return new Promise((resolve, reject) => {
    let LH = new LH_SOUL(globalData);
    LH.makeQueryies((liturgia_hores, info_cel) => {
      if(liturgia_hores === null){
        reject("Something went wrong preparing the liturgy. Liturgy of the hours could not be established");
      }
      else if(info_cel === null){
        reject("Something went wrong preparing the liturgy. Celebration information could not be established");
      }
      else{
        let LD = new LD_SOUL(globalData);
        LD.makeQueryies((liturgia_diaria) => {
          if(liturgia_diaria === undefined){
            reject("Something went wrong preparing the liturgy. Daily Liturgy could not be established");
          }
          else{
            resolve({liturgia_hores, info_cel, liturgia_diaria})
          }
        });
      }
    });
  });
}
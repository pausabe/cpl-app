import LH_SOUL from './HoursLiturgyService';
import LD_SOUL from './MassLiturgyService';

class Liturgy {
  CelebrationInformation: object;
  HoursLiturgy: object;
  MassLiturgy: object;
}

export function SetupLiturgy(globalData) : Promise<Liturgy>{
  return new Promise((resolve, reject) => {
    let LH = new LH_SOUL(globalData);
    LH.makeQueryies((hoursLiturgy, celebrationInformation) => {
      if(hoursLiturgy === null){
        reject("Something went wrong preparing the liturgy. Liturgy of the hours could not be established");
      }
      else if(celebrationInformation === null){
        reject("Something went wrong preparing the liturgy. Celebration information could not be established");
      }
      else{
        let LD = new LD_SOUL(globalData);
        LD.makeQueryies((massLiturgy) => {
          if(massLiturgy === undefined){
            reject("Something went wrong preparing the liturgy. Daily Liturgy could not be established");
          }
          else{
            const liturgy = new Liturgy();
            liturgy.CelebrationInformation = celebrationInformation;
            liturgy.HoursLiturgy = hoursLiturgy;
            liturgy.MassLiturgy = massLiturgy;
            resolve(liturgy);
          }
        });
      }
    });
  });
}
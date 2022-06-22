import {ObtainHoursLiturgy} from './HoursLiturgyService';
import MassLiturgyService from './MassLiturgyService';
import Liturgy from "../../Models/LiturgyModel";
import {ObtainLiturgyMasters} from "./LiturgyMastersService";

export async function SetupLiturgy(globalData): Promise<Liturgy> {

  let liturgyMasters = await ObtainLiturgyMasters(globalData);

  // TODO: let variousLiturgyParts = await ObtainVariousLiturgyParts();
  /*id = -1;
    DatabaseDataService.getLiturgia("diversos", id, (result) => {
      queryRows.diversos = result;
      dataReceived(params);
    });*/
  let hoursLiturgy = await ObtainHoursLiturgy(liturgyMasters, globalData);
  //let massLiturgy = await ObtainMassLiturgy(globalData);

  const liturgy = new Liturgy();
  //liturgy.CelebrationInformation = celebrationInformation;
  liturgy.HoursLiturgy = hoursLiturgy;
  //liturgy.MassLiturgy = massLiturgy;
  return liturgy;
}


/*if(hoursLiturgy === null){
    reject("Something went wrong preparing the liturgy. Liturgy of the hours could not be established");
  }

  else if(celebrationInformation === null){
    reject("Something went wrong preparing the liturgy. Celebration information could not be established");
  }

  if(massLiturgy === undefined){
            reject("Something went wrong preparing the liturgy. Daily Liturgy could not be established");
 }*/
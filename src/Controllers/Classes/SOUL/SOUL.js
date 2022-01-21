import LH_SOUL from './LH_SOUL';
import LD_SOUL from './LD_SOUL';
import * as Logger from "../../../Utils/Logger";

export function SetSoul(globalData){
  return new Promise((resolve) => {
    let LH = new LH_SOUL(globalData);
    LH.makeQueryies((liturgia_hores, info_cel) => {
      let LD = new LD_SOUL(globalData);
      LD.makeQueryies((liturgia_diaria) => resolve({liturgia_hores, info_cel, liturgia_diaria}));
    });
  });
}
import React from 'react';

import SettingsService, {DarkModeOption, DioceseName, PrayingPlace} from '../../Services/Settings/SettingsService';
import SettingsComponent from '../../Components/SettingsComponent';

export default class SettingsComponentAdapter{

    static async getSettingsOptions(callback){

        let options = [];
        options.push(await SettingsComponentAdapter.getSettingsComponentUseLatin(callback));
        options.push(await SettingsComponentAdapter.getSettingsComponentTextSize(callback));
        options.push(await SettingsComponentAdapter.getSettingsComponentDarkMode(callback));
        options.push(await SettingsComponentAdapter.getSettingsComponentDiocesis(callback));
        options.push(await SettingsComponentAdapter.getSettingsComponentLloc(callback));
        return options;
    }

    static async getSettingsComponentUseLatin(RH){
        let value = await SettingsService.getSettingUseLatin() === "true";
        return (<SettingsComponent selectorComponent="switch" name="Himnes en llatí" id="useLatin" key="useLatin"
                                   value={value} callback={(id, value) => {
            SettingsService.setSettingUseLatin(value ? "true" : "false", this.refreshHome.bind(this, RH));
        }}/>);
    }

    static async getSettingsComponentPrayLliures(RH){
        let value = await SettingsService.getSettingPrayLliures();
        return (<SettingsComponent selectorComponent="switch" name="Memòries lliures" id="prayLliures" key="prayLliures"
                                   value={value} callback={(id, value) => {
            SettingsService.setSettingPrayLliures(value, this.refreshHome.bind(this, RH));
        }}/>);
    }

    static async getSettingsComponentTextSize(RH){
        let value = parseInt(await SettingsService.getSettingTextSize());
        return (<SettingsComponent selectorComponent="slider" name="Mida del text" id="textSize" key="textSize"
                                   value={value} selectorProps={{minimumValue: 1, maximumValue: 10}}
                                   callback={(id, value) => {
                                       SettingsService.setSettingTextSize(Math.trunc(value) + "", this.refreshHome.bind(this, RH));
                                   }}/>);
    }

    static async getSettingsComponentDarkMode(RH){
        let value = await SettingsService.getSettingDarkMode();
        value = _getKeyFromValue(DarkModeOption, value);
        return (<SettingsComponent selectorComponent="picker" name="Mode obscur" id="darkMode" key="darkMode"
                                   value={value} options={DarkModeOption} selectorProps={{mode: "dropdown"}}
                                   callback={(id, value) => {
                                       SettingsService.setSettingDarkMode(DarkModeOption[value], this.refreshHome.bind(this, RH));
                                   }}/>);
    }

    static async getSettingsComponentDiocesis(RH){
        let value = await SettingsService.getSettingDiocesis();
        value = _getKeyFromValue(DioceseName, value);
        return (<SettingsComponent selectorComponent="picker" name="Diòcesi" id="diocesis" key="diocesis"
                                   value={value} options={DioceseName} selectorProps={{mode: "dropdown"}}
                                   callback={(id, value) => {
                                       SettingsService.setSettingDiocesis(DioceseName[value], this.refreshHome.bind(this, RH));
                                   }}/>);
    }

    static async getSettingsComponentLloc(RH){
        let value = await SettingsService.getSettingLloc();
        value = _getKeyFromValue(PrayingPlace, value);
        return (<SettingsComponent selectorComponent="picker" name="Lloc" id="lloc" key="lloc"
                                   value={value} options={PrayingPlace} selectorProps={{mode: "dropdown"}}
                                   callback={(id, value) => {
                                       SettingsService.setSettingLloc(PrayingPlace[value], this.refreshHome.bind(this, RH));
                                   }}/>);
    }


    static async getSettingsComponentDayStart(RH){
        let value = await SettingsService.getSettingDayStart();
        return (<SettingsComponent selectorComponent="picker" name="El dia comença a les" id="dayStart"
                                   key={"dayStart"/*+id*/} //Addes key+id for testing
                                   value={value} options={{0: "00:00 AM", 1: "01:00 AM", 2: "02:00 AM", 3: "03:00 AM"}}
                                   selectorProps={{mode: "dropdown"}} callback={(id, value) => {
            SettingsService.setSettingDayStart(value, this.refreshHome.bind(this, RH));
        }}/>);
    }

    static refreshHome(RH){
      RH();
    }

}

function _getKeyFromValue(object, value){
    for(let key in object){
        if(object[key] === value){
            return key;
        }
    }
}

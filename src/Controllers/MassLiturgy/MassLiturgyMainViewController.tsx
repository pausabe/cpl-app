import {useState} from 'react';
import * as Logger from '../../Utils/Logger';
import GlobalKeys from '../../Utils/GlobalKeys';
import {SpecificLiturgyTimeType} from "../../Services/Data/CelebrationTimeEnums";
import {StringManagement} from "../../Utils/StringManagement";
import {DateManagement} from "../../Utils/DateManagement";
import * as StorageService from "../../Services/Storage/StorageService";
import StorageKeys from "../../Services/Storage/StorageKeys";
import MassLiturgyMainState from "../../States/MassLiturgyMainState";
import MassLiturgy from '../../Models/MassLiturgy';
import LiturgyDayInformation from '../../Models/LiturgyDayInformation';
import MassLiturgyMainView from '../../Views/MassLiturgy/MassLiturgyMainView';
import * as DataService from '../../Services/Data/DataService';

export enum VespersSelectorType {
    None = 'none',
    Normal = 'normal',
    Vespers = 'vespers'
};
let CurrentState: MassLiturgyMainState;

export enum MassPrayer{
    VetllaPasquaLecturesSalms = "VetllaPasquaLecturesSalms",
    VetllaPasquaEvangeli = "VetllaPasquaEvangeli",
    PalmSunday = "Rams",
    FirstReading = "1Lect",
    Psalm = "Salm",
    SecondReading = "2Lect",
    Gospel = "Evangeli"
}

export default function MassLiturgyMainViewController() {
    try {
        const [state, setState] = useState(new MassLiturgyMainState());
        CurrentState = state;

        SetInitialState(setState);
        return MassLiturgyMainView({
            ViewState: CurrentState, 
            MassLiturgy: DataService.CurrentMassLiturgy,
            LiturgyDayInformation: DataService.CurrentLiturgyDayInformation,
            VesperSelectorChanged: VesperSelectorChangedHandler,
            PrayerSelected: PrayerSelectedHandler
        });
    } catch (error) {
        Logger.LogError(Logger.LogKeys.MassLiturgyMainViewController, "MassLiturgyMainViewController", error);
    }
}

async function SetInitialState(setState){
    let currentVespersSelectorType = await GetCurrentVespersSelectorType(DataService.CurrentMassLiturgy, DataService.CurrentLiturgyDayInformation);
    SetStateWithVespersSelectionInformation(setState, currentVespersSelectorType);
}

function SetStateWithVespersSelectionInformation(setState, currentVespersSelectorType: VespersSelectorType){
    CurrentState = CurrentState.UpdateVespersSelectorType(currentVespersSelectorType);
    CurrentState = CurrentState.UpdateIsNecessarySecondReading(GetNeedForSecondLecture(currentVespersSelectorType, DataService.CurrentMassLiturgy));
    setState(CurrentState);
}

async function GetCurrentVespersSelectorType(currentMassLiturgy: MassLiturgy, currentLiturgyDayInformation: LiturgyDayInformation): Promise<VespersSelectorType>{
    let currentVesperSelectorType = await GetCurrentVesperSelectorTypeFromStorage(currentLiturgyDayInformation.Today.Date);

    if (currentVesperSelectorType === VespersSelectorType.None) {
        if (currentLiturgyDayInformation.Tomorrow.SpecificLiturgyTime !== SpecificLiturgyTimeType.EasterSunday &&
            currentMassLiturgy.HasVespers &&
            currentLiturgyDayInformation.Today.Date.getHours() >= GlobalKeys.afternoon_hour) {
            currentVesperSelectorType = VespersSelectorType.Vespers;
            SaveVesperSelection(VespersSelectorType.Vespers, currentLiturgyDayInformation.Today.Date);
        }
        else{
            currentVesperSelectorType = VespersSelectorType.Normal;
            SaveVesperSelection(VespersSelectorType.Normal, currentLiturgyDayInformation.Today.Date);
        }
    }
    return currentVesperSelectorType;
}

function SaveVesperSelection(vesperSelectorType: string, date: Date) {
    const stringDate = DateManagement.GetDateKeyToBeStored(date);
    StorageService.StoreData(StorageKeys.CurrentMassVespersSelector, stringDate + '_' + vesperSelectorType);
}

async function GetCurrentVesperSelectorTypeFromStorage(date: Date): Promise<VespersSelectorType> {
    let currentMassVesperSelector = await StorageService.GetData(StorageKeys.CurrentMassVespersSelector);
    if (currentMassVesperSelector &&
        currentMassVesperSelector.includes("_") &&
        currentMassVesperSelector.split("_")[0] === DateManagement.GetDateKeyToBeStored(date) &&
        currentMassVesperSelector.split("_")[1] !== 'undefined') {
        return currentMassVesperSelector.split("_")[1];
    }
    else{
        return VespersSelectorType.None;
    }
}

function GetNeedForSecondLecture(currentVesperSelectorType: VespersSelectorType, currentMassLiturgy: MassLiturgy): Boolean{
    if (currentVesperSelectorType === VespersSelectorType.Normal) {
        return StringManagement.HasLiturgyContent(currentMassLiturgy.Today.SecondReading.Reading);
    } else if (currentVesperSelectorType === VespersSelectorType.Vespers && currentMassLiturgy.Vespers) {
        return StringManagement.HasLiturgyContent(currentMassLiturgy.Vespers.SecondReading.Reading);
    }
}

function VesperSelectorChangedHandler(desiredVesperSelectorType: VespersSelectorType){
    // TODO: date...
    SaveVesperSelection(desiredVesperSelectorType);
    // TODO: setState...
    SetStateWithVespersSelectionInformation(desiredVesperSelectorType);
}

function PrayerSelectedHandler(desiredMassPrayer: MassPrayer){

}
   
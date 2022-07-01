export default class HomeScreenState {
    constructor(
        globalDataToShow?: GlobalDataToShowClass,
        latePopupIsVisible?: boolean,
        celebrationIsVisible?: boolean,
        dateTimePickerIsVisible?: boolean,
        obtainDataErrorMessage?: string) {
        this.Initialized = true;
        this.GlobalDataToShow = globalDataToShow;
        this.LatePopupIsVisible = latePopupIsVisible;
        this.CelebrationIsVisible = celebrationIsVisible;
        this.DateTimePickerIsVisible = dateTimePickerIsVisible;
        this.ObtainDataErrorMessage = obtainDataErrorMessage;
    }

    private GetClone() : HomeScreenState{
        // It's necessary to return a clone, otherwise won't refresh the view
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }

    UpdateCelebrationVisibility(celebrationIsVisible) : HomeScreenState{
        this.CelebrationIsVisible = celebrationIsVisible;
        return this.GetClone();
    }

    UpdateLatePopupVisibility(latePopupIsVisible) : HomeScreenState{
        this.LatePopupIsVisible = latePopupIsVisible;
        return this.GetClone();
    }

    UpdateDateTimePickerVisibility(dateTimePickerIsVisible) : HomeScreenState{
        this.DateTimePickerIsVisible = dateTimePickerIsVisible;
        return this.GetClone();
    }

    UpdateObtainDataErrorMessage(obtainDataErrorMessage) : HomeScreenState{
        this.ObtainDataErrorMessage = obtainDataErrorMessage;
        return this.GetClone();
    }

    private Initialized: boolean = false;
    private GlobalDataToShow: GlobalDataToShowClass;
    private LatePopupIsVisible: boolean;
    private CelebrationIsVisible: boolean;
    private DateTimePickerIsVisible: boolean;
    private ObtainDataErrorMessage: string;
}

export class GlobalDataToShowClass {
    constructor(
        ready: boolean,
        placeData: PlaceData,
        date: Date,
        week: string,
        time: string,
        weekCycle: string,
        yearABC: string,
        colour: string,
        celebrationData: CelebrationData) {
        this.ready = ready;
        this.lloc = placeData;
        this.data = date;
        this.liturgyDayInformation.Week = week;
        this.temps = time;
        this.setCicle = weekCycle;
        this.anyABC = yearABC;
        this.color = colour;
        this.celebracio = celebrationData;
    }

    ready: boolean;
    lloc: PlaceData;
    data: Date;
    setmana: string;
    temps: string;
    setCicle: string;
    anyABC: string;
    color: string;
    celebracio: CelebrationData;
}

export class PlaceData {
    constructor(
        dioceseName: string,
        placeName: string) {
        this.diocesiName = dioceseName;
        this.lloc = placeName;
    }

    diocesiName: string;
    lloc: string;
}

export class CelebrationData {
    constructor(
        type: string,
        title: string,
        text: string) {
        this.type = type;
        this.titol = title;
        this.text = text;
    }

    type: string;
    titol: string;
    text: string;
}
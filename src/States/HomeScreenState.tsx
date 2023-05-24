import StateBase from './StateBase';

export default class HomeScreenState extends StateBase{
    constructor(
        latePopupIsVisible?: boolean,
        celebrationIsVisible?: boolean,
        dateTimePickerIsVisible?: boolean,
        obtainDataErrorMessage?: string){
        super();
        this.Initialized = true;
        this.LatePopupIsVisible = latePopupIsVisible;
        this.CelebrationIsVisible = celebrationIsVisible;
        this.DateTimePickerIsVisible = dateTimePickerIsVisible;
        this.ObtainDataErrorMessage = obtainDataErrorMessage;
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
    private LatePopupIsVisible: boolean;
    private CelebrationIsVisible: boolean;
    private DateTimePickerIsVisible: boolean;
    private ObtainDataErrorMessage: string;
}
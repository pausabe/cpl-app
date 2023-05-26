import { VespersSelectorType } from '../Controllers/MassLiturgy/MassLiturgyMainViewController';
import StateBase from './StateBase';

export default class MassLiturgyMainState extends StateBase{ 
    constructor() {
        super();
    }

    UpdateVespersSelectorType(vespersSelectorType: VespersSelectorType): MassLiturgyMainState{
        this.VespersSelectorType = vespersSelectorType;
        return this.GetClone();
    }

    UpdateIsNecessarySecondReading(isNecessarySecondReading: Boolean): MassLiturgyMainState{
        this.IsNecessarySecondReading = isNecessarySecondReading;
        return this.GetClone();
    }

    VespersSelectorType: VespersSelectorType;
    IsNecessarySecondReading: Boolean;
}
import {CelebrationSpecificClassification} from "../../Services/Database/DatabaseEnums";

export default class Solemnity{
    protected GetSpecificClassification(precedence: string) {
        let specificClassification = CelebrationSpecificClassification.NoClassification;
        switch (precedence) {
            case "2":
                // This cases actually doesn't matter because they are cases contemplated by the specific day
                specificClassification = CelebrationSpecificClassification.Lord;
                break;
            case "3":
                // It actually could be also 'MatherOfGod' or 'Generic' but for the Solemnities it doesn't actually make any difference
                specificClassification = CelebrationSpecificClassification.Lord;
                break;
            case "4":
            case "4a":
            case "4b":
            case "4c":
            case "4d":
                specificClassification = CelebrationSpecificClassification.Own;
                break;
            case "5":
                specificClassification = CelebrationSpecificClassification.Lord;
                break;
            case "7":
                // It actually could be also 'Generic' but for the Solemnities it doesn't actually make any difference
                specificClassification = CelebrationSpecificClassification.MotherOfGod;
                break;
            case "8":
            case "8a":
            case "8b":
            case "8c":
            case "8d":
            case "8e":
            case "8f":
                specificClassification = CelebrationSpecificClassification.Own;
                break;
        }
        return specificClassification;
    }
}
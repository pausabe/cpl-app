import CommonStructure from "./CommonStructure";

export default class AdventWeekParts extends CommonStructure {
    static MasterName: string = "tempsAdventSetmanes";

    constructor(databaseRow: any = undefined) {
        super(databaseRow)
    }
}
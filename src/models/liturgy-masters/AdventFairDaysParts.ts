import CommonStructure from './CommonStructure';

export default class AdventFairDaysParts extends CommonStructure {
  static masterName: string = 'tempsAdventFeries';

  constructor(databaseRow: any = undefined) {
    super(databaseRow);
  }
}

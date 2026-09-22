import CommonStructure from './CommonStructure';

export default class AdventWeekParts extends CommonStructure {
  static masterName: string = 'tempsAdventSetmanes';

  constructor(databaseRow: any = undefined) {
    super(databaseRow);
  }
}

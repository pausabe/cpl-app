export class DateManagement {
  static datesAreTheEqual(firstDate: Date, secondDate: Date): boolean {
    return (
      firstDate.getDate() === secondDate.getDate() &&
      firstDate.getMonth() === secondDate.getMonth() &&
      firstDate.getFullYear() === secondDate.getFullYear()
    );
  }

  static firstDateIsBeforeOrEqualToSecondDate(firstDate: Date, secondDate: Date): boolean {
    if (this.datesAreTheEqual(firstDate, secondDate)) {
      return true;
    }
    if (firstDate.getFullYear() < secondDate.getFullYear()) {
      return true;
    }
    if (firstDate.getMonth() < secondDate.getMonth()) {
      return true;
    }
    return firstDate.getDate() < secondDate.getDate();
  }

  static firstDateIsAfterOrEqualToSecondDate(firstDate: Date, secondDate: Date): boolean {
    if (this.datesAreTheEqual(firstDate, secondDate)) {
      return true;
    }
    if (firstDate.getFullYear() > secondDate.getFullYear()) {
      return true;
    }
    if (firstDate.getMonth() > secondDate.getMonth()) {
      return true;
    }
    return firstDate.getDate() > secondDate.getDate();
  }

  static firstDateIsInBetweenSecondAndThirdDatesInclusively(
    firstDate: Date,
    secondDate: Date,
    thirdDate: Date,
  ): boolean {
    return (
      this.firstDateIsAfterOrEqualToSecondDate(firstDate, secondDate) &&
      this.firstDateIsBeforeOrEqualToSecondDate(firstDate, thirdDate)
    );
  }

  static weekDayName(num) {
    switch (num) {
      case 0:
        return 'Diumenge';
      case 1:
        return 'Dilluns';
      case 2:
        return 'Dimarts';
      case 3:
        return 'Dimecres';
      case 4:
        return 'Dijous';
      case 5:
        return 'Divendres';
      case 6:
        return 'Dissabte';
    }
    return '';
  }

  static getDateKeyToBeStored(date: Date): string {
    return date.getDate() + ':' + date.getMonth() + ':' + date.getFullYear();
  }

  static getYesterday(date: Date): Date {
    let yesterday = new Date(date.getFullYear(), date.getMonth());
    yesterday.setDate(date.getDate() - 1);
    return yesterday;
  }

  static differenceBetweenDatesInSeconds(smallestDate: Date, biggestDate: Date): number {
    // @ts-ignore
    return (biggestDate - smallestDate) / 1000;
  }
}

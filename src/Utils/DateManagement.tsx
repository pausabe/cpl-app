export class DateManagement {
    static DatesAreTheEqual(firstDate: Date, secondDate: Date): boolean{
        return firstDate.getDate() === secondDate.getDate() &&
            firstDate.getMonth() === secondDate.getMonth() &&
            firstDate.getFullYear() === secondDate.getFullYear();
    }

    static FirstDateIsBeforeOrEqualToSecondDate(firstDate: Date, secondDate: Date): boolean{
        if(this.DatesAreTheEqual(firstDate, secondDate)){
            return true;
        }
        if(firstDate.getFullYear() < secondDate.getFullYear()){
            return true;
        }
        if(firstDate.getMonth() < secondDate.getMonth()){
            return true;
        }
        return firstDate.getDate() < secondDate.getDate();
    }

    static FirstDateIsAfterOrEqualToSecondDate(firstDate: Date, secondDate: Date): boolean{
        if(this.DatesAreTheEqual(firstDate, secondDate)){
            return true;
        }
        if(firstDate.getFullYear() > secondDate.getFullYear()){
            return true;
        }
        if(firstDate.getMonth() > secondDate.getMonth()){
            return true;
        }
        return firstDate.getDate() > secondDate.getDate();
    }

    static FirstDateIsInBetweenSecondAndThirdDatesInclusively(firstDate: Date, secondDate: Date, thirdDate: Date): boolean{
        return this.FirstDateIsAfterOrEqualToSecondDate(firstDate, secondDate) &&
            this.FirstDateIsBeforeOrEqualToSecondDate(firstDate, thirdDate);
    }

    static WeekDayName(num) {
        switch (num) {
            case 0:
                return ("Diumenge");
            case 1:
                return ("Dilluns");
            case 2:
                return ("Dimarts");
            case 3:
                return ("Dimecres");
            case 4:
                return ("Dijous");
            case 5:
                return ("Divendres");
            case 6:
                return ("Dissabte");
        }
        return "";
    }

    static GetDateKeyToBeStored(date: Date): string {
        return date.getDate() + ':' +
            date.getMonth() + ':' +
            date.getFullYear();
    }

    static GetYesterday(date: Date): Date {
        let yesterday = new Date(date.getFullYear(), date.getMonth());
        yesterday.setDate(date.getDate() - 1);
        return yesterday;
    }

    static DifferenceBetweenDatesInSeconds(smallestDate: Date, biggestDate: Date): number {
        return (biggestDate - smallestDate) / 1000;
    }
}
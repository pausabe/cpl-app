export class StringManagement {
    static SafeSubstring(value: string, desiredLimit: number, endOfTheValue: boolean = true) : string {
        if(!value){
            return "";
        }
        const limit = Math.min(value.length, desiredLimit);
        return value.substring(endOfTheValue? value.length - limit : 0, endOfTheValue? value.length : limit);
    }
}
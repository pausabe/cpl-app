// Dates and numbers in words, in Catalan, as the screens write them.
const WEEKDAYS = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
const MONTHS = ['gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre'];
const APOSTROPHE = '’';

export function weekdayName(day: number): string {
    return WEEKDAYS[day] ?? '';
}

export function monthName(month: number): string {
    return MONTHS[month] ?? '';
}

// "de Quaresma", "d’Advent": the preposition elides before a vowel
export function ofName(name: string): string {
    return /^[aeiouàèéíòóú]/i.test(name) ? `d${APOSTROPHE}${name}` : `de ${name}`;
}

// "de setembre", "d’octubre"
export function ofMonth(month: number): string {
    return ofName(monthName(month));
}

// "21 de setembre", "4 d’abril"
export function dayAndMonth(date: Date): string {
    return `${date.getDate()} ${ofMonth(date.getMonth())}`;
}

// "Dilluns, 21 de setembre"
export function longDate(date: Date): string {
    return `${weekdayName(date.getDay())}, ${dayAndMonth(date)}`;
}

export function lowerFirst(text: string): string {
    return text.charAt(0).toLowerCase() + text.slice(1);
}

// Roman numerals for weeks (I to XXXIV). What HomeScreen.romanize did.
export function romanize(value: unknown): string {
    const num = parseInt(String(value), 10);
    if (!num || num < 0) return '';
    const digits = String(num).split('');
    const key = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM',
        '', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC',
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    let roman = '';
    let i = 3;
    while (i--) roman = (key[+digits.pop()! + (i * 10)] || '') + roman;
    return Array(+digits.join('') + 1).join('M') + roman;
}

// Liturgical texts for the home: one line, the way it is read aloud, without the line breaks
// that some quotes bring from the book.
export function singleLine(text: string): string {
    return text.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
}

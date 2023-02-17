/*
    Used to get the 3 letter abbreviation for a month.

    CURRENT THIS IS NOT BEING USED (ANYMORE)
*/

const monthStrings = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEV'];
export function getMonthString(index) {
    let result = 'NONE';
    result = monthStrings[index];
    return result;    
}

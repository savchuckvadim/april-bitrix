/** Мелкие иммутабельные операции над массивами кодов */

export const addUnique = (list: string[], code: string): string[] =>
    list.includes(code) ? list : [...list, code];

export const remove = (list: string[], code: string): string[] =>
    list.filter(item => item !== code);

export const union = (...lists: string[][]): string[] => [
    ...new Set(lists.flat()),
];

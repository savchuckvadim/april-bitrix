/**
 * Склонение по числу: 1 позиция, 2–4 позиции, 5–20 позиций, 21 позиция.
 * Формы идут в порядке «один / несколько / много».
 */
export const pluralRu = (
    count: number,
    forms: readonly [one: string, few: string, many: string],
): string => {
    const abs = Math.abs(Math.trunc(count));
    const lastTwo = abs % 100;
    if (lastTwo >= 11 && lastTwo <= 14) return forms[2];
    const last = abs % 10;
    if (last === 1) return forms[0];
    if (last >= 2 && last <= 4) return forms[1];
    return forms[2];
};

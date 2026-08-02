/**
 * Русские числительные. Без этого вердикт выдаёт «на 1 стадиях» и
 * «5 стадии» — мелочь, которая мгновенно обесценивает текст, объявленный
 * каноном.
 */

/**
 * Выбирает форму по числу: (1) стадия, (2–4) стадии, (5–20) стадий.
 * Исключения на 11–14 учтены.
 */
export const plural = (
    count: number,
    one: string,
    few: string,
    many: string,
): string => {
    const mod100 = Math.abs(count) % 100;
    const mod10 = mod100 % 10;

    if (mod100 >= 11 && mod100 <= 14) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
};

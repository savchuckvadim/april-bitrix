/** Сравнения формы настроек с сохранёнными настройками портала. */

/** Одинаковые наборы строк: порядок и повторы не важны. */
export const sameSet = (a: readonly string[], b: readonly string[]): boolean => {
    const left = new Set(a);
    const right = new Set(b);
    return left.size === right.size && [...left].every(item => right.has(item));
};

/** Одинаковые словари «ключ → строка»: порядок ключей не важен. */
export const sameRecord = (
    a: Readonly<Record<string, string>>,
    b: Readonly<Record<string, string>>,
): boolean => {
    const keys = Object.keys(a);
    return (
        keys.length === Object.keys(b).length &&
        keys.every(key => Object.hasOwn(b, key) && b[key] === a[key])
    );
};

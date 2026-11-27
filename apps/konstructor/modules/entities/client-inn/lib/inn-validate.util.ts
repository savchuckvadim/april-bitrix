/**
 * Проверка ИНН контрольной суммой: бэк (`isValidInn`) отклоняет всё, что не
 * сходится, поэтому не валидное значение не отправляем. Алгоритм общий с
 * back/libs/portal-lib/pbx/duplicate/src/lib/normalize.util.ts.
 */

const checksum = (digits: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i]! * Number(digits[i]);
    }
    return (sum % 11) % 10;
};

/** Контрольная сумма ИНН: 10 знаков — юрлицо, 12 — ИП и физлицо. */
export const isValidInn = (digits: string): boolean => {
    if (!/^\d+$/.test(digits)) return false;
    if (digits.length === 10) {
        return checksum(digits, [2, 4, 10, 3, 5, 9, 4, 6, 8]) === Number(digits[9]);
    }
    if (digits.length === 12) {
        const n11 = checksum(digits, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        const n12 = checksum(digits, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        return n11 === Number(digits[10]) && n12 === Number(digits[11]);
    }
    return false;
};

/** Только цифры значения; пусто и не строка — пустая строка. */
export const digitsOf = (raw: unknown): string =>
    typeof raw === 'string' || typeof raw === 'number'
        ? String(raw).replace(/\D/g, '')
        : '';

/** ИНН → цифры, если сходится контрольная сумма; иначе null. */
export const normalizeInn = (raw: unknown): string | null => {
    const digits = digitsOf(raw);
    return digits && isValidInn(digits) ? digits : null;
};

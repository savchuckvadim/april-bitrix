/**
 * Валидация ИНН на фронте — порт back/libs/portal-lib/pbx/duplicate/src/lib/
 * normalize.util.ts (isValidInn/normalizeInn). Без неё невалидный ИНН уходил
 * в Битрикс и в поиск дублей молча: форма показывала «дублей нет» вместо
 * «ИНН некорректен».
 */

/** Контрольная сумма ИНН: 10 знаков — юрлицо, 12 — физлицо/ИП. */
export const isValidInn = (digits: string): boolean => {
    if (!/^\d+$/.test(digits)) return false;
    if (digits.length === 10) {
        return checksum(digits, [2, 4, 10, 3, 5, 9, 4, 6, 8]) === +digits[9]!;
    }
    if (digits.length === 12) {
        const n11 = checksum(digits, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        const n12 = checksum(digits, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        return n11 === +digits[10]! && n12 === +digits[11]!;
    }
    return false;
};

const checksum = (digits: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
        sum += weights[i]! * +digits[i]!;
    }
    return (sum % 11) % 10;
};

/** ИНН → строка цифр, если валидна по контрольной сумме; иначе null. */
export const normalizeInn = (raw: string | null | undefined): string | null => {
    if (!raw) return null;
    const digits = String(raw).replace(/\D/g, '');
    return isValidInn(digits) ? digits : null;
};

/**
 * Точная причина, почему ИНН не принят (null — принят). Раньше на любую
 * ошибку писали «неправильное количество цифр», хотя чаще всего количество
 * верное, а не сходится контрольная сумма — пользователь не понимал, что
 * исправлять.
 */
export const innValidationError = (raw: string): string | null => {
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return 'Введите ИНН';
    if (digits.length !== 10 && digits.length !== 12) {
        return `Сейчас ${digits.length} цифр — у ИНН их 10 (юрлицо) или 12 (ИП)`;
    }
    if (!isValidInn(digits)) {
        return 'Количество цифр верное, но контрольная сумма не сходится — проверьте опечатку';
    }
    return null;
};

/**
 * Склад кандидатов ИНН: слияние существующих значений multiple-поля с новыми,
 * уникально и только валидные. Порядок сохраняется, новые — в конец.
 */
export const mergeInnPool = (
    existing: unknown,
    ...values: Array<string | null | undefined>
): string[] => {
    const pool: string[] = [];
    const push = (raw: unknown) => {
        const digits = normalizeInn(typeof raw === 'string' ? raw : null);
        if (digits && !pool.includes(digits)) pool.push(digits);
    };
    if (Array.isArray(existing)) existing.forEach(push);
    else push(existing);
    values.forEach(push);
    return pool;
};

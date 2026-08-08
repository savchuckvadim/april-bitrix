/**
 * Валидация точек связи перед записью в Битрикс. Мягче, чем у ИНН: телефону
 * достаточно ≥10 цифр (формат хранится как ввели, нормализует бэк дублей),
 * email — базовая форма адреса.
 */

export type SignalKind = 'phone' | 'email';

export const phoneValidationError = (raw: string): string | null => {
    const digits = String(raw).replace(/\D/g, '');
    if (!digits) return 'Введите номер телефона';
    if (digits.length < 10) {
        return `Сейчас ${digits.length} цифр — городской или мобильный номер несёт минимум 10`;
    }
    return null;
};

export const emailValidationError = (raw: string): string | null => {
    const value = String(raw).trim();
    if (!value) return 'Введите email';
    if (!/^\S+@\S+\.\S{2,}$/.test(value)) {
        return 'Похоже, это не email — нужен адрес вида name@domain.ru';
    }
    return null;
};

export const signalValidationError = (
    kind: SignalKind,
    raw: string,
): string | null =>
    kind === 'phone' ? phoneValidationError(raw) : emailValidationError(raw);

/** Строка мультифилда Bitrix (PHONE/EMAIL). */
export interface MultifieldRow {
    ID?: string | number;
    VALUE?: string | null;
    VALUE_TYPE?: string | null;
}

/** Значения мультифилда списком строк (для показа и сравнения). */
export const multifieldValues = (raw: unknown): string[] => {
    if (!Array.isArray(raw)) return [];
    return raw
        .map(row =>
            typeof (row as MultifieldRow)?.VALUE === 'string'
                ? String((row as MultifieldRow).VALUE).trim()
                : '',
        )
        .filter(Boolean);
};

/** Схлопнутые цифры для сравнения телефонов (последние 10 — как бэк дублей). */
const phoneKey = (value: string): string =>
    value.replace(/\D/g, '').slice(-10);

/**
 * Массив мультифилда для crm.*.update: существующие строки (с ID —
 * Битрикс сохранит их) + новое значение, если такого ещё нет.
 * Возвращает null, когда значение уже есть — писать нечего.
 */
export const appendMultifield = (
    existing: unknown,
    kind: SignalKind,
    value: string,
): MultifieldRow[] | null => {
    const rows: MultifieldRow[] = Array.isArray(existing)
        ? (existing as MultifieldRow[])
        : [];
    const trimmed = value.trim();

    const exists = multifieldValues(rows).some(item =>
        kind === 'phone'
            ? phoneKey(item) === phoneKey(trimmed)
            : item.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) return null;

    return [...rows, { VALUE: trimmed, VALUE_TYPE: 'WORK' }];
};

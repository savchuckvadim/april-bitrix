/**
 * Чистая логика выбора нескольких значений: подпись на кнопке и
 * переключение значения в наборе.
 */

export interface MultiComboboxOption {
    value: string;
    label: string;
    /** Второстепенная подпись справа: число записей, отдел. */
    hint?: string;
}

/**
 * Подпись на кнопке: ничего не выбрано — «все»; одно — его название;
 * несколько — «выбрано: N» (или своя подпись).
 */
export function multiComboboxLabel(
    options: readonly MultiComboboxOption[],
    value: readonly string[],
    allLabel: string,
    manyLabel: (count: number) => string,
): string {
    if (value.length === 0) return allLabel;
    if (value.length === 1) {
        const only = options.find(option => option.value === value[0]);
        if (only) return only.label;
    }
    return manyLabel(value.length);
}

/** Значение выбрано — убрать, не выбрано — добавить; порядок сохраняется. */
export function toggleMultiValue(
    value: readonly string[],
    item: string,
): string[] {
    return value.includes(item)
        ? value.filter(current => current !== item)
        : [...value, item];
}

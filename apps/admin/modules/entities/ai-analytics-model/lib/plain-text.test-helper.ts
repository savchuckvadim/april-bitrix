/** Неразрывные пробелы Intl (U+00A0, U+202F) → обычные, чтобы ожидания тестов читались. */
const NON_BREAKING = new RegExp(`[${String.fromCharCode(0xa0)}${String.fromCharCode(0x202f)}]`, 'g');

export const plain = (value: string): string => value.replace(NON_BREAKING, ' ');

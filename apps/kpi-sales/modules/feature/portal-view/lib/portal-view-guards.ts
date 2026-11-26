/** Проверки сырого ответа бэка (unknown) для нормализации настроек вида отчёта. */

export type UnknownRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/** Строка с непробельным содержимым — как есть; иначе null. */
export const nonEmptyString = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value : null;

/** Только непустые строки массива; не массив — пусто. */
export const stringList = (value: unknown): string[] =>
    Array.isArray(value)
        ? value.filter(
              (item): item is string => typeof item === 'string' && item !== '',
          )
        : [];

/** Только объекты массива; не массив — пусто. */
export const recordList = (value: unknown): UnknownRecord[] =>
    Array.isArray(value) ? value.filter(isRecord) : [];

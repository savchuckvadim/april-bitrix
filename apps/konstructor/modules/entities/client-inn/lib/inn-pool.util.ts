import { digitsOf } from './inn-validate.util';

/**
 * Пул ИНН (`op_inn_pool`): множественное строковое поле. Битрикс отдаёт его
 * массивом, а пустое поле бывает `null`, пустой строкой или `false`; строку
 * через разделитель тоже принимаем. В пуле остаются только цифры, дубли
 * схлопываются.
 */
export const readInnPool = (raw: unknown): string[] => {
    const parts = Array.isArray(raw)
        ? raw
        : typeof raw === 'string'
          ? raw.split(/[\s,;]+/)
          : typeof raw === 'number'
            ? [raw]
            : [];
    const unique = new Set<string>();
    for (const part of parts) {
        const digits = digitsOf(part);
        if (digits) unique.add(digits);
    }
    return [...unique];
};

export const isInnInPool = (pool: readonly string[], inn: string): boolean =>
    pool.includes(inn);

/** Пул с новым ИНН: пул только пополняется, порядок и прежние значения целы. */
export const addInnToPool = (pool: readonly string[], inn: string): string[] =>
    isInnInPool(pool, inn) ? [...pool] : [...pool, inn];

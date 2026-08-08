/**
 * Единственное место разбора ответа `callBatch()`/`callBatchByChunk()`.
 *
 * Форма зависит от транспорта:
 *  - во фрейме `getData()` отдаёт объект, ключованный cmd (значения уже
 *    развёрнуты) либо стандартный конверт `{ result: {cmd: value}, ... }`;
 *  - в dev-режиме через бэк приходит массив чанков `[{ result: {cmd: value} }]`.
 *
 * Наружу — всегда плоская мапа `cmd → value`.
 */
export const flattenBatchResults = (raw: unknown): Record<string, unknown> => {
    const flat: Record<string, unknown> = {};

    const absorbEnvelope = (chunk: unknown): boolean => {
        if (!chunk || typeof chunk !== 'object') return false;
        const result = (chunk as { result?: unknown }).result;
        if (!result || typeof result !== 'object' || Array.isArray(result)) {
            return false;
        }
        for (const [cmd, value] of Object.entries(
            result as Record<string, unknown>,
        )) {
            flat[cmd] = value;
        }
        return true;
    };

    if (Array.isArray(raw)) {
        for (const chunk of raw) absorbEnvelope(chunk);
        return flat;
    }
    if (absorbEnvelope(raw)) return flat;

    if (raw && typeof raw === 'object') {
        for (const [cmd, value] of Object.entries(
            raw as Record<string, unknown>,
        )) {
            flat[cmd] = value;
        }
    }
    return flat;
};

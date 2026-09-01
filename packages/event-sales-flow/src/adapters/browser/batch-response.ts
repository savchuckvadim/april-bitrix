/**
 * Разбор и планирование batch-ответа Битрикса — ЧИСТАЯ половина браузерного
 * транспорта (без @workspace/bitrix и вообще без I/O).
 *
 * Живёт отдельным модулем по двум причинам:
 *  - это контракт ФОРМЫ ответа, а не работа с SDK: его должны видеть и
 *    спеки ядра (use-case судит исход по тем самым чанкам), не таща за
 *    собой браузерный SDK;
 *  - фрейм и dev-прокси отдают РАЗНЫЕ формы, и приведение их к одной —
 *    самостоятельная логика с собственными тестами.
 */
import type {
    IBitrixBatchError,
    IBitrixBatchResponseResult,
} from '../../shared/batch/batch-group-buffer';
import { FLOW_NO_RESPONSE_ERROR } from '../../ports/flow-transport.port';

/**
 * Ответ callBatch() → бэковая форма IBitrixBatchResponseResult[].
 * Формы транспорта (см. flattenBatchResults из @workspace/bitrix — тот же
 * разбор, но здесь сохраняется покомандный конверт, а не плоская мапа):
 *  - dev-режим через бэк: уже массив чанков `[{ result: {cmd: value} }]`;
 *  - фрейм: getData() отдаёт объект, ключованный cmd (значения развёрнуты),
 *    либо стандартный конверт `{ result: {cmd: value}, ... }`.
 * Эвристика конверта та же, что во flattenBatchResults: значение `result` —
 * объект; команды флоу так не называются.
 */
export const normalizeCallBatchResponse = (
    raw: unknown,
): IBitrixBatchResponseResult[] => {
    const coerceChunk = (chunk: unknown): IBitrixBatchResponseResult => {
        const source = (chunk ?? {}) as Partial<IBitrixBatchResponseResult>;
        return {
            result: (source.result ??
                {}) as IBitrixBatchResponseResult['result'],
            result_error: source.result_error ?? [],
            result_total: source.result_total ?? [],
            result_next: source.result_next ?? [],
        };
    };
    const isEnvelope = (value: unknown): boolean => {
        if (!value || typeof value !== 'object') return false;
        const result = (value as { result?: unknown }).result;
        return !!result && typeof result === 'object' && !Array.isArray(result);
    };

    if (Array.isArray(raw)) return raw.map(coerceChunk);
    if (isEnvelope(raw)) return [coerceChunk(raw)];
    if (raw && typeof raw === 'object') {
        return [
            coerceChunk({
                result: raw as IBitrixBatchResponseResult['result'],
            }),
        ];
    }
    return [];
};

/** Потолок команд одного HTTP-batch у Битрикса. */
export const CALL_BATCH_COMMAND_LIMIT = 50;

/** Ссылка на результат соседней команды: `$result[cmd]`, `$result[cmd][a][b]`. */
const RESULT_REF_RE = /\$result\[([^\][]+)\]/g;

/** Cmd-ключи, на которые ссылается тело команды (пустой список — не ссылается). */
const readResultRefs = (command: unknown): string[] => {
    let serialized: string;
    try {
        serialized = JSON.stringify(command) ?? '';
    } catch {
        // Циклическая ссылка в теле команды — не наш формат; считаем, что
        // связей нет: хуже склеить лишнего, чем разорвать связку.
        return [];
    }
    const refs: string[] = [];
    for (const match of serialized.matchAll(RESULT_REF_RE)) {
        const key = match[1];
        if (key) refs.push(key);
    }

    return refs;
};

/**
 * План чанкования пишущего батча БЕЗ разрыва связок и БЕЗ перестановок.
 *
 * Правила, из которых он собран:
 *  1. `$result[cmd]` работает только внутри ОДНОГО HTTP-batch — команда и
 *     её адресат обязаны уехать вместе;
 *  2. порядок команд в батче значим и помимо ссылок (правки полей задачи
 *     идут ДО её закрытия, маркер — первой командой), поэтому чанк — это
 *     непрерывный отрезок исходной последовательности, а не выборка;
 *  3. чанк ≤ 50 команд: всё сверх Битрикс молча отбрасывает.
 *
 * Механика: связанные ссылками команды дают интервал [min..max] позиций,
 * пересекающиеся интервалы сливаются в неделимые блоки, блоки жадно
 * набираются в чанки по порядку. Блок длиннее лимита отправить атомарно
 * нельзя ни при каком раскладе — честная ошибка сразу (как `endGroup`
 * группового буфера), а не тихая потеря хвоста.
 */
export const planBatchChunks = (
    entries: ReadonlyArray<readonly [string, unknown]>,
    limit: number = CALL_BATCH_COMMAND_LIMIT,
): string[][] => {
    const position = new Map<string, number>();
    entries.forEach(([key], index) => position.set(key, index));

    // bound[i] — самая дальняя позиция, до которой обязан дотянуться блок,
    // начатый в i (сама команда + всё, с чем она связана ссылками).
    const bound = entries.map((_, index) => index);
    entries.forEach(([, command], index) => {
        for (const ref of readResultRefs(command)) {
            const target = position.get(ref);
            if (target === undefined) continue;
            const from = Math.min(index, target);
            const to = Math.max(index, target);
            bound[from] = Math.max(bound[from] ?? from, to);
        }
    });

    const chunks: string[][] = [];
    let current: string[] = [];
    let index = 0;

    while (index < entries.length) {
        let end = bound[index] ?? index;
        for (let scan = index; scan <= end; scan += 1) {
            end = Math.max(end, bound[scan] ?? scan);
        }
        const block = entries.slice(index, end + 1).map(([key]) => key);

        if (block.length > limit) {
            throw new Error(
                `[event-sales-flow] связка команд ${block[0]}…${block[block.length - 1]} — ` +
                    `${block.length} команд при лимите батча ${limit}: ` +
                    'ссылки $result[...] работают только внутри одного HTTP-вызова, ' +
                    'атомарная отправка невозможна',
            );
        }
        if (current.length + block.length > limit) {
            chunks.push(current);
            current = [];
        }
        current.push(...block);
        index = end + 1;
    }
    if (current.length > 0) {
        chunks.push(current);
    }

    return chunks;
};

/** Cmd-ключи, по которым в ответе есть хоть что-то: результат либо ошибка. */
const collectAnsweredKeys = (
    chunks: readonly IBitrixBatchResponseResult[],
): Set<string> => {
    const answered = new Set<string>();
    for (const chunk of chunks) {
        for (const key of Object.keys(chunk.result ?? {})) {
            answered.add(key);
        }
        const errors = chunk.result_error;
        if (!errors || Array.isArray(errors)) continue;
        for (const key of Object.keys(errors)) {
            answered.add(key);
        }
    }

    return answered;
};

/**
 * Неотвеченные cmd-ключи → синтетический чанк с `result_error`
 * {@link FLOW_NO_RESPONSE_ERROR}.
 *
 * Во фрейме это ЕДИНСТВЕННЫЙ след падения команды: b24jssdk отдаёт плоскую
 * мапу только успешных команд, упавшая просто отсутствует. Без этой
 * подстановки `collectBatchErrors` use-case всегда видел пустой список, и
 * провал обязательной группы (ACCESS_DENIED на lead.update, отказ
 * task.complete) читался как успех.
 *
 * Отдельным чанком, а не правкой существующих: `result` у него пуст, поэтому
 * счётчик команд, `findBatchResult`/`flattenResults` и разбор буфера
 * работают ровно как раньше, а ошибки доезжают до разбора исхода.
 */
export const appendMissingCommandErrors = (
    chunks: IBitrixBatchResponseResult[],
    sentKeys: readonly string[],
): {
    chunks: IBitrixBatchResponseResult[];
    /** Ключи, оставшиеся без ответа, — в порядке отправки. */
    missing: string[];
} => {
    const answered = collectAnsweredKeys(chunks);
    const missing = sentKeys.filter(key => !answered.has(key));

    if (missing.length === 0) {
        return { chunks, missing };
    }
    const result_error: Record<string, IBitrixBatchError> = {};
    for (const key of missing) {
        result_error[key] = {
            error: FLOW_NO_RESPONSE_ERROR,
            error_description:
                'команда осталась без ответа батча — во фрейме b24jssdk ' +
                'выбрасывает упавшие команды из ответа; исполнение не подтверждено',
        };
    }

    return {
        chunks: [
            ...chunks,
            { result: {}, result_error, result_total: [], result_next: [] },
        ],
        missing,
    };
};

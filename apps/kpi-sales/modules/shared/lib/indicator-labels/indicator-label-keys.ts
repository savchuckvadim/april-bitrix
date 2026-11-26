/**
 * Ключи своих названий показателей (настройки вида отчёта портала,
 * `view.labels`): событие — `ev:<innerCode>`, бакет звонков — `call:<id>`,
 * колонка плана — `plan:<код планового показателя>`. Связи только по кодам:
 * название показателя в данных не меняется.
 */
export const INDICATOR_LABEL_PREFIX = {
    event: 'ev:',
    calling: 'call:',
    plan: 'plan:',
} as const;

/**
 * Бакеты звонков: id длительности (`KPICall.id` в entities/calling-statistics)
 * строкой. Сверка с типом бакетов — в `calling-type.ts`: расхождение —
 * ошибка компиляции.
 */
export const CALLING_BUCKET_IDS = ['all', '30', '60', '180', '300', '600'] as const;

export type CallingBucketId = (typeof CALLING_BUCKET_IDS)[number];

const CALLING_BUCKET_ID_SET: ReadonlySet<string> = new Set(CALLING_BUCKET_IDS);

/** Код — id бакета звонков (`'all'`, `'30'`, …). */
export const isCallingBucketId = (code: string): code is CallingBucketId =>
    CALLING_BUCKET_ID_SET.has(code);

/** Ключ события отчёта по его innerCode (включая синтетические result_communication_*). */
export const eventLabelKey = (innerCode: string): string =>
    `${INDICATOR_LABEL_PREFIX.event}${innerCode}`;

/** Ключ бакета звонков по id длительности (`'all'`, `30`, …). */
export const callingLabelKey = (id: string | number): string =>
    `${INDICATOR_LABEL_PREFIX.calling}${String(id)}`;

/** Ключ колонки плана по коду планового показателя. */
export const planLabelKey = (code: string): string =>
    `${INDICATOR_LABEL_PREFIX.plan}${code}`;

/**
 * Ключ колонки, у которой код бывает и innerCode события, и id бакета
 * звонков (объединённый отчёт, строки Excel): id бакета — `call:`, иначе `ev:`.
 */
export const columnLabelKey = (code: string | number): string => {
    const value = String(code);
    return isCallingBucketId(value) ? callingLabelKey(value) : eventLabelKey(value);
};

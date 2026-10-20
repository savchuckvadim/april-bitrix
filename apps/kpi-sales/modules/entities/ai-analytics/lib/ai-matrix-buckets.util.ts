import type {
    AiBucket,
    AiBucketScore,
    AiCallType,
    AiCallTypeCode,
    AiManagerTypeCell,
} from '../model';
import { isAiCallTypeCode } from './ai-call-types.data';
import { AI_BUCKETS, AI_BUCKET_LABELS } from './ai-overview.data';
import type { AiMatrixScoreSource } from './ai-matrix-cell.util';
import { aiWeightedScore } from './ai-matrix-norm.util';
import { isAiMetricHidden } from './ai-metric.util';

/*
 * Корзины типов звонков для матрицы «AI: типы звонков» (решение владельца
 * 20.10.2026): «Контакт» (холодный, заявка с сайта, звонок), «Презентация»,
 * «Закрытие» (доработка, решение, оплата). Разборы типов корзины
 * суммируются, оценка — взвешенное среднее; точные оценки корзин есть в
 * строке менеджера обзора (buckets) — они в приоритете. Типы вне корзин
 * (приглашение на мероприятие, прочее) в корзины не входят.
 */

/** Префикс кода колонки-корзины: не пересекается с кодами типов (presentation). */
export const AI_MATRIX_BUCKET_PREFIX = 'bucket:';

export const aiBucketColumnCode = (bucket: AiBucket): string =>
    `${AI_MATRIX_BUCKET_PREFIX}${bucket}`;

/** Корзина из кода колонки; не колонка-корзина — null. */
export const aiBucketOfColumnCode = (code: string): AiBucket | null => {
    if (!code.startsWith(AI_MATRIX_BUCKET_PREFIX)) return null;
    const bucket = code.slice(AI_MATRIX_BUCKET_PREFIX.length);
    return (AI_BUCKETS as string[]).includes(bucket) ? (bucket as AiBucket) : null;
};

/**
 * Фолбэк без карты портала — зеркало бэка (ai-analytics-event-map.const):
 * контакт — cold, site_lead, call; презентация — presentation; закрытие —
 * refine, decision, payment; event_invite / other / irrelevant — без корзины.
 */
const AI_BUCKET_FALLBACK: Record<AiCallTypeCode, AiBucket | null> = {
    cold: 'contact',
    site_lead: 'contact',
    call: 'contact',
    presentation: 'presentation',
    refine: 'closing',
    decision: 'closing',
    payment: 'closing',
    event_invite: null,
    other: null,
    irrelevant: null,
};

/** Корзина типа: по карте портала (settings.callTypes), иначе фолбэк по коду. */
export const aiBucketOfType = (
    code: string,
    callTypes: AiCallType[] = [],
): AiBucket | null => {
    const fromPortal = callTypes.find(item => item.code === code);
    if (fromPortal) return fromPortal.bucket ?? null;
    return isAiCallTypeCode(code) ? AI_BUCKET_FALLBACK[code] : null;
};

export const aiBucketLabel = (bucket: AiBucket): string =>
    AI_BUCKET_LABELS[bucket];

/** Корзины, у которых среди переданных типов есть хотя бы один (порядок AI_BUCKETS). */
export const aiPresentBuckets = (
    typeCodes: readonly string[],
    callTypes: AiCallType[],
): AiBucket[] => {
    const present = new Set(
        typeCodes.flatMap(code => {
            const bucket = aiBucketOfType(code, callTypes);
            return bucket ? [bucket] : [];
        }),
    );
    return AI_BUCKETS.filter(bucket => present.has(bucket));
};

/** Ячейки типов, входящих в корзину (с учётом карты портала). */
export const aiCellsOfBucket = (
    cells: readonly AiManagerTypeCell[],
    bucket: AiBucket,
    callTypes: AiCallType[],
): AiManagerTypeCell[] =>
    cells.filter(cell => aiBucketOfType(cell.callType, callTypes) === bucket);

/**
 * Оценка корзины у менеджера: точная из обзора (buckets строки менеджера),
 * если она есть; иначе сложена из ячеек типов корзины — Σn и взвешенное
 * среднее оценок типов, у которых они есть (partial — не все вошли).
 */
export const aiBucketScoreSource = (
    cells: readonly AiManagerTypeCell[],
    bucket: AiBucket,
    callTypes: AiCallType[],
    exact?: readonly AiBucketScore[] | null,
): AiMatrixScoreSource => {
    const known = exact?.find(item => item.bucket === bucket);
    if (known) {
        return {
            n: known.n,
            score: isAiMetricHidden(known.score) ? null : known.score.value,
        };
    }
    const weighted = aiWeightedScore(
        aiCellsOfBucket(cells, bucket, callTypes).map(cell => ({
            n: cell.n,
            score: isAiMetricHidden(cell.score) ? null : cell.score.value,
        })),
    );
    return {
        n: weighted.n,
        score: weighted.score,
        partial: weighted.score !== null && weighted.scoredN < weighted.n,
        composed: true,
    };
};

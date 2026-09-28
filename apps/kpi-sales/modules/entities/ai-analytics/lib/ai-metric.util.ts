import type { AiMetric } from '../model';
import { pluralRu } from './ai-readiness.data';

/*
 * Честные подписи метрик: объём («по 24 звонкам», «7 звонков», «18 зв.»),
 * разброс («31–55 %», «вероятно от 31 до 55 %»), «мало данных» и причины
 * пониженного доверия — по-русски, без «n = …» и служебных кодов.
 */

/** Значение не показывается: доверие none (n < 8) или value = null. */
export const isAiMetricHidden = (
    metric: AiMetric | null | undefined,
): boolean =>
    !metric || metric.confidence.level === 'none' || metric.value === null;

/** Мало данных для выводов (8 ≤ n < 20): значение есть, но пунктиром. */
export const isAiMetricLow = (metric: AiMetric | null | undefined): boolean =>
    !!metric && metric.confidence.level === 'low' && metric.value !== null;

/** Подсказка к значению пунктиром (доверие low). */
export const AI_METRIC_LOW_HINT =
    'Мало данных для выводов — меньше 20 звонков';

const CALL_FORMS = ['звонок', 'звонка', 'звонков'] as const;
/** Дательный падеж: по 1 звонку, по 2 звонкам, по 21 звонку. */
const CALL_DATIVE_FORMS = ['звонку', 'звонкам', 'звонкам'] as const;

/** «24 звонка» — сколько звонков за числом. */
export const formatAiCallsCount = (n: number): string =>
    `${n.toLocaleString('ru-RU')} ${pluralRu(n, CALL_FORMS)}`;

/** «по 24 звонкам» — по скольким звонкам посчитано значение. */
export const aiByCallsLabel = (n: number): string =>
    `по ${n.toLocaleString('ru-RU')} ${pluralRu(n, CALL_DATIVE_FORMS)}`;

/** Короткая подпись объёма в тесной ячейке: «18 зв.». */
export const formatAiCallsShort = (n: number): string =>
    `${n.toLocaleString('ru-RU')} зв.`;

/** Доля 0.42 → «42 %»; null → «—». */
export const formatAiRate = (value: number | null | undefined): string =>
    value === null || value === undefined
        ? '—'
        : `${Math.round(value * 100).toLocaleString('ru-RU')} %`;

/** Границы 90 %-го интервала в процентах; нет двух границ — null. */
const aiCi90Bounds = (
    ci90: number[] | undefined,
): [low: number, high: number] | null => {
    if (!ci90 || ci90.length < 2) return null;
    const [low, high] = ci90;
    if (low === undefined || high === undefined) return null;
    return [Math.round(low * 100), Math.round(high * 100)];
};

/** 90 %-й интервал [0.31, 0.55] → «31–55 %»; нет — пусто. */
export const formatAiCi90 = (ci90: number[] | undefined): string => {
    const bounds = aiCi90Bounds(ci90);
    return bounds ? `${bounds[0]}–${bounds[1]} %` : '';
};

/** Тот же интервал словами: «вероятно от 31 до 55 %»; нет — пусто. */
export const formatAiCi90Words = (ci90: number[] | undefined): string => {
    const bounds = aiCi90Bounds(ci90);
    return bounds ? `вероятно от ${bounds[0]} до ${bounds[1]} %` : '';
};

/** Подпись бэйджа «мало данных: 7 звонков»; без звонков — «мало данных». */
export const aiFewDataLabel = (n: number): string =>
    n > 0 ? `мало данных: ${formatAiCallsCount(n)}` : 'мало данных';

/** Причина пониженного доверия человеческим языком; незнакомая — нейтрально. */
export const aiConfidenceReasonLabel = (
    reason: string | undefined,
): string | null => {
    switch (reason) {
        case undefined:
        case '':
            return null;
        case 'not-enough-data':
        case 'few-data':
            return 'недостаточно наблюдений';
        case 'version-changed':
            return 'сменилась версия разбора';
        case 'mixed-sources':
            return 'смешаны источники данных';
        default:
            return 'данных недостаточно';
    }
};

/** Дата YYYY-MM-DD → «07.09»; пустая — «—». */
export const formatAiDay = (value: string | null | undefined): string => {
    if (!value) return '—';
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}.${month}` : value;
};

/** ISO-момент → «07.09 14:35» в локали браузера; пусто — «—». */
export const formatAiMoment = (value: string | null | undefined): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

import type { AiMetric } from '../model';
import { pluralRu } from './ai-readiness.data';

/*
 * Честные подписи метрик: объём («по 24 звонкам», «7 звонков», «18 зв.»),
 * разброс («31–55 %», «вероятно от 31 до 55 %»), «мало данных» с порогом и
 * причины пониженного доверия — по-русски, без «n = …» и служебных кодов.
 */

/** Вид метрики для порогов: оценка 1–10 либо доля/процент/счётчик. */
export type AiMetricThresholdKind = 'score' | 'rate';

/**
 * Пороги объёма по умолчанию — зеркало реестра бэка
 * (libs/sales-ai-analytics/src/params/registry.thresholds.const.ts):
 * n_min_none = 8 (меньше — значение скрыто), n_min_ok_score = 20 и
 * n_min_ok_rate = 30 (меньше — пунктир). Если ответ бэка несёт действующие
 * пороги портала, передавайте их через AiMetricThresholds.
 */
export const AI_METRIC_THRESHOLDS = {
    none: 8,
    lowScore: 20,
    lowRate: 30,
} as const;

/** Действующие пороги портала (все поля необязательны — иначе дефолты). */
export interface AiMetricThresholds {
    none?: number;
    lowScore?: number;
    lowRate?: number;
}

/** Порог, с которого значение показывается (ниже — «мало данных»). */
export const aiMetricMinN = (thresholds?: AiMetricThresholds): number =>
    thresholds?.none ?? AI_METRIC_THRESHOLDS.none;

/** Порог, с которого цифра перестаёт быть пунктирной: оценки — 20, доли — 30. */
export const aiMetricLowMax = (
    kind: AiMetricThresholdKind,
    thresholds?: AiMetricThresholds,
): number =>
    kind === 'rate'
        ? (thresholds?.lowRate ?? AI_METRIC_THRESHOLDS.lowRate)
        : (thresholds?.lowScore ?? AI_METRIC_THRESHOLDS.lowScore);

/** Значение не показывается: доверие none (n < 8) или value = null. */
export const isAiMetricHidden = (
    metric: AiMetric | null | undefined,
): boolean =>
    !metric || metric.confidence.level === 'none' || metric.value === null;

/** Мало данных для выводов (8 ≤ n < 20): значение есть, но пунктиром. */
export const isAiMetricLow = (metric: AiMetric | null | undefined): boolean =>
    !!metric && metric.confidence.level === 'low' && metric.value !== null;

/** Причина «оценка не сохранялась в старом расчёте» (месяцы до 30.09.2026). */
export const AI_METRIC_LEGACY_REASON = 'legacy-snapshot';

/** Значение скрыто не из-за объёма, а потому что старый расчёт его не сохранил. */
export const isAiMetricLegacy = (
    metric: AiMetric | null | undefined,
): boolean => metric?.confidence.reason === AI_METRIC_LEGACY_REASON;

/** Подсказка к значению пунктиром: оценки — меньше 20 звонков, доли — меньше 30. */
export const aiMetricLowHint = (
    kind: AiMetricThresholdKind = 'score',
    thresholds?: AiMetricThresholds,
): string =>
    `Мало данных для выводов — меньше ${aiMetricLowMax(kind, thresholds)} звонков`;

/** Подсказка к пунктиру для оценок (прежнее имя — для совместимости). */
export const AI_METRIC_LOW_HINT = aiMetricLowHint('score');

/** Строки подсказки к пунктирной цифре: что это и как читать. */
export const aiMetricLowHintLines = (
    kind: AiMetricThresholdKind = 'score',
    thresholds?: AiMetricThresholds,
): string[] => [
    `Цифра показана пунктиром: звонков меньше ${aiMetricLowMax(kind, thresholds)}. Это ориентир, а не повод для выводов.`,
    'Станет обычной, когда разобранных звонков наберётся больше — делать ничего не нужно.',
];

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

/** Бэйдж скрытого значения из старого расчёта (оценка не сохранялась). */
export const AI_METRIC_LEGACY_LABEL = 'оценки нет в расчёте';

/** Подсказка к бэйджу «оценки нет в расчёте». */
export const AI_METRIC_LEGACY_HINT = {
    title: 'Оценки нет в расчёте',
    lines: [
        'Месяц закрыт и посчитан до того, как в расчёт стали сохранять среднюю оценку. Число разборов показано, а оценки за этот месяц нет.',
        'Оценка появится после пересчёта — попросите разработчика.',
    ],
} as const;

/** Подпись бэйджа скрытого значения: старый расчёт — своя, иначе «мало данных: N звонков». */
export const aiMetricHiddenLabel = (
    metric: AiMetric | null | undefined,
): string =>
    isAiMetricLegacy(metric)
        ? AI_METRIC_LEGACY_LABEL
        : aiFewDataLabel(metric?.n ?? 0);

/** Подсказка с заголовком и строками (форма HintTooltip). */
export interface AiHint {
    title: string;
    lines: readonly string[];
}

/**
 * Подсказка к бэйджу «мало данных»: порог показа, как читать пунктир и
 * что сделать (ничего — объём копится сам). Старый расчёт — своя подсказка.
 */
export const aiFewDataHint = (
    metric: AiMetric | null | undefined,
    kind: AiMetricThresholdKind = 'score',
    thresholds?: AiMetricThresholds,
): AiHint => {
    if (isAiMetricLegacy(metric)) return AI_METRIC_LEGACY_HINT;
    const minN = aiMetricMinN(thresholds);
    const lowMax = aiMetricLowMax(kind, thresholds);
    const what = kind === 'rate' ? 'Долю' : 'Среднюю оценку';
    const n = metric?.n ?? 0;
    return {
        title: 'Мало данных',
        lines: [
            `${what} показываем, когда разобранных звонков не меньше ${minN}: по меньшему числу она слишком случайна.${n > 0 ? ` Сейчас: ${formatAiCallsCount(n)}.` : ''}`,
            `От ${minN} до ${lowMax - 1} звонков цифра показывается пунктиром — ориентир, но не повод для выводов.`,
            'Делать ничего не нужно: разборы копятся сами.',
        ],
    };
};

/** Причина пониженного доверия человеческим языком; незнакомая — нейтрально. */
export const aiConfidenceReasonLabel = (
    reason: string | undefined,
    thresholds?: AiMetricThresholds,
): string | null => {
    switch (reason) {
        case undefined:
        case '':
            return null;
        case 'not-enough-data':
        case 'few-data':
            return `меньше ${aiMetricMinN(thresholds)} оценённых звонков`;
        case AI_METRIC_LEGACY_REASON:
            return 'оценка не сохранялась в старом расчёте';
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

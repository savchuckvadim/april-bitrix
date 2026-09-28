import type { Tone } from '@workspace/april-ui';
import type {
    AiAboutDataQuality,
    AiAboutEndpoint,
    AiAboutEstimandKind,
    AiAboutEstimate,
    AiAboutEstimateSource,
    AiAboutModel,
    AiAboutParamKind,
    AiAboutParamLayer,
    AiAboutParamReason,
    AiAboutParamValue,
    AiAboutReliability,
    AiReadinessSigmaSource,
} from '@/modules/entities/ai-analytics';
import {
    formatAiFullDate,
    formatAiMonthKey,
    formatAiMonthRange,
    pluralRu,
} from '@/modules/entities/ai-analytics';

/*
 * Блок «Как считаем» (раздел about): подписи кодов DTO по-русски и
 * форматирование значений. Слова про смысл раздела приходят с бэка
 * (title/purpose/sources/…), здесь — только словари enum'ов и числа.
 */

/** Раздел витрины → заголовок диалога, пока данных ещё нет. */
export const AI_ABOUT_ENDPOINT_LABELS: Record<AiAboutEndpoint, string> = {
    overview: 'Обзор по менеджерам и типам звонков',
    'plan/daily': 'План дня',
    brief: 'Итоги периода',
    'manager/style': 'Карточка стиля менеджера',
    'plan-fact': 'План — факт месяца',
    dossier: 'Досье менеджера',
};

/** Откуда взято значение параметра (менеджер → группа стажа → портал → по умолчанию). */
export const AI_ABOUT_LAYER_LABELS: Record<AiAboutParamLayer, string> = {
    default: 'по умолчанию',
    portal: 'настройка портала',
    tenure: 'группа стажа',
    manager: 'настройка менеджера',
    hybrid: 'настройка + данные',
};

/** Тип параметра: решение человека, оценка из данных, настройка до накопления данных. */
export const AI_ABOUT_KIND: Record<
    AiAboutParamKind,
    { label: string; tone: Tone }
> = {
    configured: { label: 'настроен', tone: 'info' },
    estimated: { label: 'оценён по данным', tone: 'success' },
    hybrid: { label: 'сначала по умолчанию, потом по данным', tone: 'accent' },
};

/** Почему значение портала не применено и взято значение по умолчанию. */
export const AI_ABOUT_REASON_LABELS: Record<AiAboutParamReason, string> = {
    'out-of-range':
        'значение портала вне допустимого диапазона — взято значение по умолчанию',
    'type-mismatch':
        'у значения портала другой тип — взято значение по умолчанию',
    'invalid-value':
        'значение портала не из словаря — взято значение по умолчанию',
    'unknown-code': 'такой параметр не известен — взято значение по умолчанию',
};

/** Источник оценки модели. */
export const AI_ABOUT_ESTIMATE_SOURCE_LABELS: Record<
    AiAboutEstimateSource,
    string
> = {
    estimated: 'оценено по данным портала',
    configured: 'настройка портала или значение по умолчанию',
    hybrid: 'значение по умолчанию, пока данных мало',
};

/** Как считаются переходы воронки портала. */
export const AI_ABOUT_ESTIMAND_KIND_LABELS: Record<
    AiAboutEstimandKind,
    string
> = {
    rate: 'по сводным данным',
    prob: 'по вероятности события после связки звонков со сделками',
};

/** Качество данных по недельной проверке. */
export const AI_ABOUT_DATA_QUALITY: Record<
    AiAboutDataQuality,
    { label: string; tone: Tone }
> = {
    ok: { label: 'даты событий в порядке', tone: 'success' },
    flagged: { label: 'даты событий расходятся сильнее нормы', tone: 'warning' },
    unknown: { label: 'проверка качества данных не проводилась', tone: 'muted' },
};

/** Бэйдж параметра, смена которого рвёт сравнимость рядов. */
export const AI_ABOUT_BREAKS_SERIES_LABEL = 'рвёт ряд';

/** Число по-русски: до трёх знаков после запятой, без хвостовых нулей. */
export const formatAiAboutNumber = (value: number): string =>
    value.toLocaleString('ru-RU', { maximumFractionDigits: 3 });

/** Действующее значение параметра с единицей: 8 шт., 0,35, да / нет. */
export const formatAiAboutParamValue = (
    value: AiAboutParamValue,
    unit: string,
): string => {
    if (typeof value === 'boolean') return value ? 'да' : 'нет';
    const text =
        typeof value === 'number' ? formatAiAboutNumber(value) : value.trim();
    const suffix = unit.trim();
    return suffix ? `${text} ${suffix}` : text;
};

/** Значение оценки модели; null — модель его не несёт. */
export const formatAiAboutEstimateValue = (value: number | null): string =>
    value === null ? '—' : formatAiAboutNumber(value);

/** Оценки модели в порядке расчёта: усадка, разброс, забывание. */
export const aiAboutEstimates = (model: AiAboutModel): AiAboutEstimate[] => [
    model.kappa,
    model.phi,
    model.lambda,
];

/** Дата YYYY-MM-DD → «07.09.2026»; пусто или не дата — «—». */
export const formatAiAboutDate = formatAiFullDate;

/** Окно норм: «июнь – август 2026 (3 мес.)»; один месяц — он сам; пусто — «—». */
export const formatAiAboutWindow = (window: readonly string[]): string => {
    if (!window.length) return '—';
    const range = formatAiMonthRange(window);
    return window.length === 1 ? range : `${range} (${window.length} мес.)`;
};

/** Месяц модели «2026-09» → «сентябрь 2026». */
export const formatAiAboutMonth = formatAiMonthKey;

/** Начало сравнимой истории; пусто/null — ряд не рвался. */
export const formatAiAboutComparableFrom = (
    value: string | null | undefined,
): string =>
    value
        ? `сравнимая история с ${formatAiAboutDate(value)}`
        : 'ряд параметров не рвался';

/** Доля связки звонков со сделками, %. */
export const formatAiAboutChainShare = (pct: number): string =>
    `${formatAiAboutNumber(Math.round(pct * 10) / 10)} %`;

/** Текст, когда модели портала нет, а причина не пришла словами. */
export const AI_ABOUT_NO_MODEL_TEXT =
    'Модели портала пока нет — нормы появятся после первого ночного расчёта.';

/** Причина отсутствия модели: текст бэка по-русски — как есть; служебный код или пусто — нейтральный текст. */
export const aiAboutModelReasonText = (reason: string | null): string =>
    reason && /[а-яё]/i.test(reason) ? reason : AI_ABOUT_NO_MODEL_TEXT;

/** «24 наблюдения (менеджер за месяц)». */
export const formatAiAboutObservations = (count: number): string =>
    `${count} ${pluralRu(count, ['наблюдение', 'наблюдения', 'наблюдений'])} (менеджер за месяц)`;

/* ---------- Надёжность оценок AI ---------- */

/** Источник разброса оценок: измерен повторными разборами или взят по умолчанию. */
export const AI_ABOUT_SIGMA_SOURCE_LABELS: Record<AiReadinessSigmaSource, string> = {
    measured: 'по повторным разборам',
    configured: 'по умолчанию',
};

/** Поля разбора, по которым меряется согласие повторного разбора; незнакомое — нейтрально. */
export const AI_ABOUT_RELIABILITY_CATEGORY_LABELS: Record<string, string> = {
    callType: 'тип звонка',
    productive: 'звонок продуктивный',
    refusalCategory: 'категория отказа',
    coachingPriority: 'приоритет коучинга',
    nextStepSet: 'следующий шаг назначен',
};

export const AI_ABOUT_RELIABILITY_CATEGORY_FALLBACK = 'другое поле разбора';

export const aiAboutReliabilityCategoryLabel = (code: string): string =>
    AI_ABOUT_RELIABILITY_CATEGORY_LABELS[code] ??
    AI_ABOUT_RELIABILITY_CATEGORY_FALLBACK;

/** Согласие или разброс двумя знаками; null — «не измерено». */
export const formatAiAboutKappa = (value: number | null): string =>
    value === null ? 'не измерено' : value.toFixed(2).replace('.', ',');

/** Совпадение двух разборов (0..1) → «82 %»; null — «не измерено». */
export const formatAiAboutAgreementPct = (value: number | null): string =>
    value === null ? 'не измерено' : `${Math.round(value * 100)} %`;

const PAIR_FORMS = ['паре', 'парам', 'парам'] as const;

/**
 * Строка надёжности: «Разброс оценок AI: 0,35 (по 20 парам из нужных 30) ·
 * совпадение по возражениям 82 %»; значение по умолчанию — с пометкой.
 */
export const formatAiAboutReliabilityLine = (
    reliability: AiAboutReliability,
): string => {
    const { sigmaLlm } = reliability;
    const pairs = `по ${sigmaLlm.n} ${pluralRu(sigmaLlm.n, PAIR_FORMS)} из нужных ${sigmaLlm.minPairs}`;
    const source =
        sigmaLlm.source === 'measured'
            ? pairs
            : `${AI_ABOUT_SIGMA_SOURCE_LABELS.configured}: пока ${pairs}`;
    return (
        `Разброс оценок AI: ${formatAiAboutKappa(sigmaLlm.value)} (${source}) · ` +
        `совпадение по возражениям ${formatAiAboutAgreementPct(reliability.objectionsF1)}`
    );
};

/** Заголовок колонки надёжности: «Надёжно (согласие не ниже 0,6)». */
export const formatAiAboutReliableHeader = (kappaMin: number): string =>
    `Надёжно (согласие не ниже ${formatAiAboutNumber(kappaMin)})`;

import type { Tone } from '@workspace/april-ui';
import type { AiReadinessBetaCountdown, AiReadinessMode } from '../model';

/** Подпись режима готовности витрины (ReadinessDto.mode) для баннера. */
export const AI_READINESS_LABELS: Record<AiReadinessMode, string> = {
    'kpi-only': 'Только KPI: разборов звонков пока нет',
    calibration: 'Калибровка: данных мало, оценки предварительные',
    descriptive: 'Описательный режим: показываем факты без норм',
    norms: 'Нормы из данных',
    hypothesis: 'Проверка гипотез',
    forecast: 'Прогноз',
    recommendations: 'Рекомендации',
};

/** Пояснение режима человеческим языком (вторая строка баннера). */
export const AI_READINESS_HINTS: Record<AiReadinessMode, string> = {
    'kpi-only':
        'AI-аналитика включена, но за последние 30 дней разборов звонков нет — оценки качества не показываем, доступны только KPI-данные.',
    calibration:
        'Накоплено меньше 3 месяцев истории или меньше 60 разобранных презентаций. Числа несут n и интервал; выводы делать рано.',
    descriptive:
        'Истории достаточно для описания фактов, но нормы ещё не рассчитаны — сравнений «выше/ниже нормы» пока нет.',
    norms: 'Нормы рассчитаны из данных портала: доступны сравнения с нормой.',
    hypothesis: 'Проверяем связь качества и исхода на данных портала.',
    forecast: 'Прогноз строится на накопленной истории.',
    recommendations: 'Рекомендации подтверждены данными.',
};

/** Тон баннера: kpi-only — предупреждение, калибровка — инфо, дальше — норма. */
export const AI_READINESS_TONES: Record<AiReadinessMode, Tone> = {
    'kpi-only': 'warning',
    calibration: 'info',
    descriptive: 'info',
    norms: 'success',
    hypothesis: 'success',
    forecast: 'success',
    recommendations: 'success',
};

/** В kpi-only оценок нет: пульс и повестка не запрашиваются и не рисуются. */
export const isAiKpiOnly = (mode: AiReadinessMode | undefined): boolean =>
    mode === 'kpi-only';

/* ---------- Причины режима (ReadinessDto.reasons) ---------- */

/**
 * Коды причин без значения гейта (бэк: AI_READINESS_REASON_CODES и
 * AI_READINESS_QUALITY_REASON_CODES) → подпись баннера.
 */
export const AI_READINESS_REASON_LABELS: Record<string, string> = {
    'no-analysis-in-pipeline-window': 'Разборов звонков в окне конвейера нет',
    'calendar-not-imported': 'Производственный календарь не импортирован',
    'roster-not-confirmed': 'Состав и уровни менеджеров не подтверждены',
    'hypothesis-not-set': 'Гипотеза «качество → объём» не задана',
    'no-portal-model': 'Модели портала ещё нет — норм без неё не бывает',
    'data-quality-timestamp-leak':
        'Качество данных: продажи закрываются раньше объясняющих их активностей',
};

/**
 * Коды с гейтом в хвосте (`history-months-below-3`,
 * `presentations-below-60`, `norms-presentations-below-100`): подпись
 * строится по числу гейта.
 */
export const AI_READINESS_GATED_REASON_LABELS: Record<
    string,
    (gate: number) => string
> = {
    'history-months-below': gate =>
        `Истории меньше ${gate} ${pluralRu(gate, MONTH_GENITIVE_FORMS)}`,
    'presentations-below': gate => `Разобранных презентаций меньше ${gate}`,
    'norms-presentations-below': gate =>
        `Для норм нужно не меньше ${gate} презентаций`,
};

const GATED_REASON = /^(.+)-(\d+)$/;

/** Запасная подпись неизвестного кода — код показываем, чтобы не терять смысл. */
export const formatUnknownAiReadinessReason = (code: string): string =>
    `Причина: ${code}`;

/** Подпись причины режима по коду; неизвестный код — запасная подпись. */
export const formatAiReadinessReason = (code: string): string => {
    const exact = AI_READINESS_REASON_LABELS[code];
    if (exact) return exact;
    const match = GATED_REASON.exec(code);
    if (match) {
        const gated = AI_READINESS_GATED_REASON_LABELS[match[1] ?? ''];
        if (gated) return gated(Number(match[2]));
    }
    return formatUnknownAiReadinessReason(code);
};

/** Подписи всех причин баннера в порядке бэка (дубли кодов схлопнуты). */
export const formatAiReadinessReasons = (
    reasons: readonly string[] | undefined,
): string[] =>
    [...new Set(reasons ?? [])].map(code => formatAiReadinessReason(code));

/* ---------- Счётчик «до оценки β» ---------- */

type PluralForms = readonly [one: string, few: string, many: string];

const PRESENTATION_FORMS: PluralForms = [
    'презентация',
    'презентации',
    'презентаций',
];
const MONTH_FORMS: PluralForms = ['месяц', 'месяца', 'месяцев'];
/** После «меньше N» — родительный: меньше 1 месяца, 3 месяцев, 21 месяца. */
const MONTH_GENITIVE_FORMS: PluralForms = ['месяца', 'месяцев', 'месяцев'];

/** Русское склонение по числу: 1 месяц, 2 месяца, 5 месяцев, 21 месяц. */
export const pluralRu = (count: number, forms: PluralForms): string => {
    const abs = Math.abs(Math.round(count));
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        return forms[1];
    }
    return forms[2];
};

/** Гейт β уже набран объёмом, но пересчёт ещё не прошёл. */
export const AI_BETA_COUNTDOWN_REACHED = 'Объём для оценки β накоплен';

/**
 * Подпись счётчика «до оценки β»: «до оценки β осталось ≈ N презентаций /
 * M месяцев». Месяцы — при известном темпе (`monthsLeft`), иначе только
 * презентации; null — счётчика нет (гейт пройден, kpi-only, нечего считать).
 */
export const formatBetaCountdown = (
    countdown: AiReadinessBetaCountdown | null | undefined,
): string | null => {
    if (!countdown) return null;
    const presentations = Math.max(0, Math.ceil(countdown.presentationsLeft));
    if (presentations === 0) return AI_BETA_COUNTDOWN_REACHED;

    const parts = [
        `${presentations} ${pluralRu(presentations, PRESENTATION_FORMS)}`,
    ];
    if (countdown.monthsLeft !== null && countdown.monthsLeft > 0) {
        const months = Math.max(1, Math.round(countdown.monthsLeft));
        parts.push(`${months} ${pluralRu(months, MONTH_FORMS)}`);
    }
    return `до оценки β осталось ≈ ${parts.join(' / ')}`;
};

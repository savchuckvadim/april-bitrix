import {
    QUALITY_LINK_REASON_LABEL,
    QUALITY_LINK_STATUS_LABEL,
    type ModelStatusLabel,
} from '../consts/ai-analytics-model.labels.const';
import type { ModelEstimate, ModelQualityLink } from '../model';
import {
    reasonViewsOf,
    statusViewOf,
    type ModelCodeView,
} from './model-code-label.util';
import {
    formatCount,
    formatDateTime,
    formatDecimal,
    formatMonthKey,
    formatOutOf,
    formatShare,
    formatWithRange,
    pluralRu,
} from './model-format.util';
import { YES_NO_UNKNOWN, triStateOf } from './model-tri-state.util';
import type { ModelMetricView } from './model-view.types';

export interface QualityLinkView {
    status: ModelStatusLabel;
    month: string;
    generatedAt: string;
    sample: ModelMetricView[];
    estimates: ModelMetricView[];
    checks: ModelMetricView[];
    gate: ModelMetricView[];
    reasons: ModelCodeView[];
}

const two = (value: number): string => formatDecimal(value, 2);

const estimateOf = (estimate: ModelEstimate | null): string =>
    estimate === null
        ? 'нет оценки'
        : formatWithRange(estimate.value, estimate.ci90, two);

/**
 * Сколько пересчётов подряд с пройденным гейтом осталось до публикации.
 * Опубликована — ноль; серия длиннее нужной — тоже ноль.
 */
export const remainingGateRuns = (
    link: Pick<ModelQualityLink, 'published' | 'gateStreak' | 'gateMonths'>,
): number =>
    link.published ? 0 : Math.max(0, link.gateMonths - link.gateStreak);

const countdownText = (link: ModelQualityLink): string => {
    if (link.published) return 'не нужно, уже опубликована';
    const left = remainingGateRuns(link);
    return `ещё ${formatCount(left)} ${pluralRu(left, ['пересчёт', 'пересчёта', 'пересчётов'])} подряд`;
};

/** Отчёт о связи качества разговора с ближним исходом → карточка. */
export const toQualityLinkView = (link: ModelQualityLink): QualityLinkView => {
    const eventShare = link.sampleN > 0 ? link.sampleEvents / link.sampleN : null;
    const passedNow = triStateOf(link.gatePassedNow, YES_NO_UNKNOWN);
    const published = triStateOf(link.published, YES_NO_UNKNOWN);
    const calibration = triStateOf(link.calibrationCoversOne, {
        yes: 'в норме',
        no: 'смещена',
        unknown: 'не считалась',
    });
    const placebo = triStateOf(link.placeboPassed, {
        yes: 'пройдена',
        no: 'не пройдена',
        unknown: 'не считалась',
    });
    const leak = triStateOf(link.timestampLeakOk, {
        yes: 'в норме',
        no: 'много дат из будущего',
        unknown: 'не считалась',
    });

    return {
        status: statusViewOf(QUALITY_LINK_STATUS_LABEL, link.status),
        month: formatMonthKey(link.monthKey),
        generatedAt: formatDateTime(link.generatedAt),
        sample: [
            { label: 'Звонков в выборке', value: formatCount(link.sampleN) },
            {
                label: 'С исходом (КП или счёт)',
                value:
                    eventShare === null
                        ? formatCount(link.sampleEvents)
                        : `${formatCount(link.sampleEvents)} (${formatShare(eventShare)})`,
            },
            { label: 'Менеджеров', value: formatCount(link.sampleManagers) },
            {
                label: 'Окно исхода',
                value: `${formatCount(link.windowDays)} ${pluralRu(link.windowDays, ['день', 'дня', 'дней'])}`,
            },
            {
                label: 'Событий на параметр',
                value: link.epv === null ? 'не считалось' : formatDecimal(link.epv, 1),
                hint: 'Сколько исходов приходится на один параметр модели. Мало — оценка неустойчива.',
            },
        ],
        estimates: [
            {
                label: 'Внутри менеджера',
                value: estimateOf(link.within),
                hint: 'Как исход меняется у одного и того же менеджера при лучшем разговоре. Оценка и интервал 90 %.',
            },
            {
                label: 'Между менеджерами',
                value: estimateOf(link.between),
                hint: 'Разница между менеджерами с разным средним качеством.',
            },
            { label: 'Общая', value: estimateOf(link.pooled) },
            {
                label: 'Наклон калибровки',
                value: estimateOf(link.calibrationSlope),
                hint: 'Близко к единице — предсказанные вероятности совпадают с фактом.',
            },
        ],
        checks: [
            {
                label: 'Надёжность оценки качества',
                value:
                    link.reliabilityR === null
                        ? 'не измерена'
                        : formatDecimal(link.reliabilityR, 2),
                hint: 'Согласие повторных разборов одного звонка: от 0 до 1.',
            },
            { label: 'Калибровка', ...calibration },
            {
                label: 'Проверка на подставных данных',
                ...placebo,
                hint: 'Та же модель на заведомо не связанных данных не должна находить связь.',
            },
            { label: 'Проверка дат', ...leak },
        ],
        gate: [
            { label: 'Гейт пройден в этом пересчёте', ...passedNow },
            {
                label: 'Серия пересчётов подряд',
                value: formatOutOf(link.gateStreak, link.gateMonths),
            },
            { label: 'Опубликована', ...published },
            { label: 'До публикации', value: countdownText(link) },
        ],
        reasons: reasonViewsOf(QUALITY_LINK_REASON_LABEL, link.reasons),
    };
};

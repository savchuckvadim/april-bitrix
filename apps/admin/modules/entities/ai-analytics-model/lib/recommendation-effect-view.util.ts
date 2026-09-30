import type { StatusTone } from '@workspace/april-ui/tones';
import {
    EDGE_LABEL,
    EFFECT_GATE_REASON_LABEL,
    EFFECT_GATE_STATUS_LABEL,
    LEVER_LABEL,
    type ModelStatusLabel,
} from '../consts/ai-analytics-model.labels.const';
import type {
    ModelEdgeBeforeAfter,
    ModelLeverEffect,
    ModelRecommendationEffect,
    ModelShare,
} from '../model';
import {
    codeViewOf,
    reasonViewsOf,
    statusViewOf,
    type ModelCodeView,
} from './model-code-label.util';
import {
    formatCount,
    formatDateTime,
    formatMonthKey,
    formatShare,
    formatSigned,
    formatWithRange,
    pluralRu,
} from './model-format.util';
import type { ModelMetricView } from './model-view.types';

export interface EffectLeverRow {
    lever: ModelCodeView;
    issued: string;
    completed: string;
    done: string;
    disagree: string;
    doneShare: string;
}

export interface EffectEdgeRow {
    edge: ModelCodeView;
    before: string;
    after: string;
    diff: string;
    /** Интервал разности целиком выше нуля — рост, ниже — падение. */
    tone: StatusTone;
    windows: string;
}

export interface EffectView {
    gate: ModelStatusLabel;
    month: string;
    generatedAt: string;
    issuedMonths: string;
    metrics: ModelMetricView[];
    reasons: ModelCodeView[];
    levers: EffectLeverRow[];
    edges: EffectEdgeRow[];
}

const pct = (value: number): string => formatShare(value, 0);

/** Доля с интервалом; мало наблюдений — честно «мало данных». */
export const formatModelShare = (share: ModelShare): string =>
    share.value === null
        ? `мало данных (из ${formatCount(share.n)})`
        : `${formatWithRange(share.value, share.ci90, pct)} из ${formatCount(share.n)}`;

/** «12 из 40 (30 %)»; пустой знаменатель — без доли. */
export const formatTransitions = (success: number, total: number): string =>
    total > 0
        ? `${formatCount(success)} из ${formatCount(total)} (${pct(success / total)})`
        : `${formatCount(success)} из ${formatCount(total)}`;

/** Разность долей в процентных пунктах: 0.05 → «+5,0 п. п.». */
const points = (value: number): string => `${formatSigned(value * 100, 1)} п. п.`;

/** Цвет разности по интервалу: уверенный рост, уверенное падение или ничего. */
export const diffToneOf = (ci90: readonly number[] | null): StatusTone => {
    if (!ci90 || ci90.length !== 2) return 'neutral';
    const [low, high] = ci90;
    if (low !== undefined && low > 0) return 'success';
    if (high !== undefined && high < 0) return 'destructive';
    return 'neutral';
};

const leverRowOf = (item: ModelLeverEffect): EffectLeverRow => ({
    lever: codeViewOf(LEVER_LABEL, item.lever),
    issued: formatCount(item.issued),
    completed: formatCount(item.completedWindows),
    done: formatCount(item.done),
    disagree: formatCount(item.disagree),
    doneShare: formatModelShare(item.doneShare),
});

/**
 * Разности нет: переходы есть, но их меньше минимума выборки (разность
 * тогда не считается) — «мало данных»; переходов нет вовсе — «нет данных».
 */
const missingDiffText = (item: ModelEdgeBeforeAfter): string =>
    item.beforeN > 0 && item.afterN > 0 ? 'мало данных' : 'нет данных';

const edgeRowOf = (item: ModelEdgeBeforeAfter): EffectEdgeRow => ({
    edge: codeViewOf(EDGE_LABEL, item.edge),
    before: formatTransitions(item.beforeS, item.beforeN),
    after: formatTransitions(item.afterS, item.afterN),
    diff:
        item.diff === null
            ? missingDiffText(item)
            : formatWithRange(item.diff, item.ci90, points),
    tone: diffToneOf(item.ci90),
    windows: formatCount(item.windows),
});

/** Последний расчёт эффекта советов → карточка. */
export const toEffectView = (effect: ModelRecommendationEffect): EffectView => ({
    gate: statusViewOf(EFFECT_GATE_STATUS_LABEL, effect.gateStatus),
    month: formatMonthKey(effect.monthKey),
    generatedAt: formatDateTime(effect.generatedAt),
    issuedMonths:
        effect.issuedMonths.length === 0
            ? 'нет'
            : effect.issuedMonths.map(formatMonthKey).join(', '),
    metrics: [
        { label: 'Выдано советов', value: formatCount(effect.issued) },
        {
            label: 'С закрытым окном «после»',
            value: formatCount(effect.completedWindows),
            hint: 'Советы, после выдачи которых прошло достаточно времени, чтобы сравнить «до» и «после».',
        },
        {
            label: 'Выполнено',
            value: `${formatCount(effect.done)}: ${formatModelShare(effect.doneShare)}`,
        },
        {
            label: 'Несогласий',
            value: `${formatCount(effect.disagree)}: ${formatModelShare(effect.disagreeShare)}`,
        },
        {
            label: 'Признаки подгонки показателей',
            value:
                effect.goodhartFlags === 0
                    ? 'нет'
                    : `${formatCount(effect.goodhartFlags)} ${pluralRu(effect.goodhartFlags, ['признак', 'признака', 'признаков'])} у ${formatCount(effect.goodhartManagers)} ${pluralRu(effect.goodhartManagers, ['менеджера', 'менеджеров', 'менеджеров'])}`,
            tone: effect.goodhartFlags === 0 ? undefined : 'warning',
            hint: 'Показатель растёт, а результат нет: возможно, менеджер «рисует» цифру под совет.',
        },
    ],
    reasons: reasonViewsOf(EFFECT_GATE_REASON_LABEL, effect.gateReasons),
    levers: effect.byLever.map(leverRowOf),
    edges: effect.beforeAfter.map(edgeRowOf),
});

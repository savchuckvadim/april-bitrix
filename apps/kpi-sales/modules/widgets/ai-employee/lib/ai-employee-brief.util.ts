import type { Tone } from '@workspace/april-ui';
import type {
    AiBucketScore,
    AiDossier,
    AiManagerRow,
    AiManagerTrends,
    AiPlanFact,
    AiPlanFactRow,
    AiStyleCard,
    AiYoy,
} from '@/modules/entities/ai-analytics/model';
import {
    AI_BUCKET_LABELS,
    AI_LEVEL,
    aiSignalView,
} from '@/modules/entities/ai-analytics/lib/ai-overview.data';
import { formatAiScore } from '@/modules/entities/ai-analytics/lib/ai-score.util';
import { isAiManagerLevel } from '@/modules/entities/ai-analytics/lib/ai-levels.util';
import type { AiHint } from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import {
    aiPlanFactRowStatusView,
    aiPlanFactRowHasPlan,
} from '@/modules/entities/ai-analytics/lib/ai-plan-fact.util';
import {
    aiTrendsHintLines,
    aiTrendsSummaryLabel,
    aiTrendsTone,
} from '@/modules/entities/ai-analytics/lib/ai-trend.util';
import { aiYoyBadgeLabel, aiYoyHintLines, aiYoyTone } from '@/modules/entities/ai-analytics/lib/ai-yoy.util';
import { AI_EMPLOYEE_TEXT } from './ai-employee.texts';

/*
 * Подвкладка «Коротко»: резюме-строка из фактов (главный сигнал, сильная
 * сторона, слабое место — без оценочных эпитетов) и плитки. Источники:
 * строка обзора (оценка, уровень, корзины, тренды, год назад), досье
 * (паспорт, ряды, план-факт, стиль), план-факт месяца, карточка стиля.
 * Старый кэш без полей и пустые секции — запасные тексты словаря.
 */

const T = AI_EMPLOYEE_TEXT.brief;

export interface AiEmployeeTile {
    key: string;
    label: string;
    value: string;
    /** Подстрока под значением; null — нет. */
    note: string | null;
    hint: AiHint;
    tone: Tone;
}

/** Строки план-факта сотрудника: из ручки за месяц, иначе из досье. */
export const aiEmployeePlanFactRows = (
    planFact: AiPlanFact | null,
    dossier: AiDossier | null,
    managerId: string,
): AiPlanFactRow[] => {
    const fromPlanFact = planFact?.rows.find(row => row.managerId === managerId);
    if (fromPlanFact) return fromPlanFact.rows;
    return (
        dossier?.planFact?.rows.find(row => row.managerId === managerId)?.rows ??
        []
    );
};

/** Строка показателя «продажи» план-факта; null — нет. */
export const aiEmployeeSalesRow = (rows: readonly AiPlanFactRow[]): AiPlanFactRow | null =>
    rows.find(row => row.indicator === 'sales') ?? null;

/** Тренды и «год назад»: из строки обзора, иначе из досье. */
export const aiEmployeeTrends = (
    row: AiManagerRow | null,
    dossier: AiDossier | null,
): AiManagerTrends | null => row?.trends ?? dossier?.trends ?? null;

export const aiEmployeeYoy = (
    row: AiManagerRow | null,
    dossier: AiDossier | null,
): AiYoy | null => row?.yoy ?? dossier?.yoy ?? null;

/** Корзины с оценкой: самая высокая и самая низкая; одна корзина — только сильная. */
export const aiEmployeeBucketExtremes = (
    buckets: readonly AiBucketScore[],
): { strong: AiBucketScore | null; weak: AiBucketScore | null } => {
    const scored = buckets.filter(bucket => bucket.score.value !== null);
    if (!scored.length) return { strong: null, weak: null };
    const sorted = [...scored].sort(
        (a, b) => (b.score.value ?? 0) - (a.score.value ?? 0),
    );
    const strong = sorted[0] ?? null;
    const weak = sorted.length > 1 ? (sorted[sorted.length - 1] ?? null) : null;
    return { strong, weak };
};

const capitalize = (text: string): string =>
    text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Резюме-строка: «Главный сигнал — …; сильная сторона — …; слабое место —
 * …». Без строки обзора или без оценок — честная причина пустоты.
 */
export const aiEmployeeSlogan = (row: AiManagerRow | null): string => {
    if (!row) return T.noData(0);
    const parts: string[] = [];
    if (row.signal) parts.push(T.signal(aiSignalView(row.signal.signal).label.toLowerCase()));
    const { strong, weak } = aiEmployeeBucketExtremes(row.buckets);
    if (strong?.score.value !== null && strong?.score.value !== undefined) {
        parts.push(T.strong(AI_BUCKET_LABELS[strong.bucket].toLowerCase(), strong.score.value));
    }
    if (weak?.score.value !== null && weak?.score.value !== undefined) {
        parts.push(T.weak(AI_BUCKET_LABELS[weak.bucket].toLowerCase(), weak.score.value));
    }
    if (!parts.length) return T.noData(row.analyzedCalls);
    if (!row.signal) parts.unshift(T.calm);
    return `${capitalize(parts.join('; '))}.`;
};

/* ---------- Плитки ---------- */

const scoreTile = (row: AiManagerRow | null, dossier: AiDossier | null): AiEmployeeTile => {
    const text = T.tiles.score;
    if (row && row.keyMetric.value !== null) {
        return {
            key: 'score',
            label: text.label,
            value: formatAiScore(row.keyMetric.value),
            note: text.analyzed(row.analyzedCalls, row.callsTotal),
            hint: text.hint,
            tone: 'info',
        };
    }
    const months = dossier?.series?.months ?? [];
    const lastMonth = months[months.length - 1];
    if (lastMonth && lastMonth.score.value !== null) {
        return {
            key: 'score',
            label: text.label,
            value: formatAiScore(lastMonth.score.value),
            note: text.fromMonths,
            hint: text.hint,
            tone: 'muted',
        };
    }
    return {
        key: 'score',
        label: text.label,
        value: '—',
        note: row ? text.analyzed(row.analyzedCalls, row.callsTotal) : text.empty,
        hint: text.hint,
        tone: 'muted',
    };
};

const levelTile = (
    row: AiManagerRow | null,
    dossier: AiDossier | null,
    sales: AiPlanFactRow | null,
): AiEmployeeTile => {
    const text = T.tiles.level;
    const level = row?.level ?? dossier?.passport?.level ?? null;
    const levelLabel = isAiManagerLevel(level) ? AI_LEVEL[level].label : null;
    const plan = sales !== null && aiPlanFactRowHasPlan(sales) ? sales.plan : null;
    return {
        key: 'level',
        label: text.label,
        value: levelLabel ?? text.noLevel,
        note: plan !== null ? text.target(plan) : text.noTarget,
        hint: text.hint,
        tone: levelLabel ? 'neutral' : 'muted',
    };
};

const progressTile = (sales: AiPlanFactRow | null): AiEmployeeTile => {
    const text = T.tiles.progress;
    if (!sales) {
        return { key: 'progress', label: text.label, value: '—', note: text.empty, hint: text.hint, tone: 'muted' };
    }
    const status = aiPlanFactRowStatusView(sales);
    if (sales.plan !== null && sales.plan > 0 && sales.fact !== null) {
        const forecast = sales.forecastP50 !== null ? text.forecast(sales.forecastP50) : null;
        return {
            key: 'progress',
            label: text.label,
            value: text.factPlan(sales.fact, sales.plan),
            note: [status.label, forecast].filter(Boolean).join(' · '),
            hint: text.hint,
            tone: status.tone,
        };
    }
    return {
        key: 'progress',
        label: text.label,
        value: sales.fact !== null ? text.factOnly(sales.fact) : '—',
        note: text.noPlan,
        hint: text.hint,
        tone: 'muted',
    };
};

const styleTile = (style: AiStyleCard | null, row: AiManagerRow | null): AiEmployeeTile => {
    const text = T.tiles.style;
    const phrase =
        style?.notable[0] ??
        style?.profile?.tags[0]?.title ??
        row?.style?.tags[0]?.title ??
        null;
    return {
        key: 'style',
        label: text.label,
        value: phrase ?? text.empty,
        note: null,
        hint: text.hint,
        tone: phrase ? 'accent' : 'muted',
    };
};

const trendsTile = (trends: AiManagerTrends | null): AiEmployeeTile => {
    const text = T.tiles.trends;
    if (!trends) {
        return { key: 'trends', label: text.label, value: text.empty, note: null, hint: text.hint, tone: 'muted' };
    }
    return {
        key: 'trends',
        label: text.label,
        value: aiTrendsSummaryLabel(trends),
        note: null,
        hint: { title: text.hint.title, lines: aiTrendsHintLines(trends) },
        tone: aiTrendsTone(trends),
    };
};

const yoyTile = (yoy: AiYoy | null): AiEmployeeTile => {
    const text = T.tiles.yoy;
    if (!yoy) {
        return { key: 'yoy', label: text.label, value: text.empty, note: null, hint: text.hint, tone: 'muted' };
    }
    return {
        key: 'yoy',
        label: text.label,
        value: aiYoyBadgeLabel(yoy),
        note: null,
        hint: { title: text.hint.title, lines: aiYoyHintLines(yoy) },
        tone: aiYoyTone(yoy),
    };
};

export interface AiEmployeeBriefInput {
    managerId: string;
    row: AiManagerRow | null;
    dossier: AiDossier | null;
    planFact: AiPlanFact | null;
    style: AiStyleCard | null;
}

export interface AiEmployeeBrief {
    slogan: string;
    tiles: AiEmployeeTile[];
}

/** Резюме-строка и шесть плиток подвкладки «Коротко». */
export const buildAiEmployeeBrief = (input: AiEmployeeBriefInput): AiEmployeeBrief => {
    const sales = aiEmployeeSalesRow(
        aiEmployeePlanFactRows(input.planFact, input.dossier, input.managerId),
    );
    return {
        slogan: aiEmployeeSlogan(input.row),
        tiles: [
            scoreTile(input.row, input.dossier),
            levelTile(input.row, input.dossier, sales),
            progressTile(sales),
            styleTile(input.style, input.row),
            trendsTile(aiEmployeeTrends(input.row, input.dossier)),
            yoyTile(aiEmployeeYoy(input.row, input.dossier)),
        ],
    };
};

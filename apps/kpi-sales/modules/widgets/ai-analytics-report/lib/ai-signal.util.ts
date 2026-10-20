import type {
    AiCallReportStatus,
    AiFinanceSource,
    AiManagerRow,
    AiManagerSinceSource,
    AiRiskCall,
} from '@/modules/entities/ai-analytics/model';
import {
    AI_BUCKETS,
    AI_SINCE_SOURCE_LABELS,
    aiObjectionCategoryLabel,
} from '@/modules/entities/ai-analytics/lib/ai-overview.data';
import type { AiHint } from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { aiEvidenceWords, aiLeverView } from './ai-lever-view.util';
import { aiLeverSectionLabel } from './ai-lever-target.util';
import {
    AI_NOT_ANALYZED_REASON,
    aiNotAnalyzedReason,
    isAiPeriodBeforeAnalysis,
    type AiAnalysisPeriodContext,
} from './ai-not-analyzed.util';
import { AI_ANALYZED_TEXT, aiNotAnalyzedHint } from './ai-signal.texts';
import { aiSignalHasPlanHead } from './ai-plan-head.util';

/*
 * Чистая логика строки таблицы сигналов: советы (recommendations), стаж с
 * источником даты, «разобрано N из M» с подсказкой, видимые колонки,
 * риск-звонки и причина «Не согласен» из списка + комментарий.
 * Импорты сущности точечные (model / lib). Коды правил и уровней
 * доказательности на экран не выводим.
 */

/** Совет из дневного снапшота прогноза (строка обзора). */
export type AiRecommendation = AiManagerRow['recommendations'][number];

/** Сколько советов показывать в строке (бэк отдаёт топ-3). */
export const AI_LEVERS_MAX = 3;

export const pickAiLevers = (
    recommendations: AiRecommendation[],
    max = AI_LEVERS_MAX,
): AiRecommendation[] => recommendations.slice(0, max);

/**
 * Адресат совета: тип звонка · раздел/пункт · категория возражения;
 * ничего не задано — подпись вида совета.
 */
export const aiLeverTitle = (
    recommendation: AiRecommendation,
    callTypeLabel: (code: string) => string = code => code,
): string => {
    const parts = [
        recommendation.callType ? callTypeLabel(recommendation.callType) : null,
        recommendation.section
            ? aiLeverSectionLabel(recommendation.section)
            : null,
        recommendation.category
            ? aiObjectionCategoryLabel(recommendation.category)
            : null,
    ].filter((part): part is string => !!part);
    return parts.length
        ? parts.join(' · ')
        : aiLeverView(recommendation.lever).label;
};

export const AI_LEVER_NO_EFFECT = 'без оценки эффекта';

/** Ожидаемый эффект: «+1,5 продаж»; без deltaSales (уровень E0) — честно без числа. */
export const formatAiLeverEffect = (
    recommendation: Pick<AiRecommendation, 'deltaSales'>,
): string =>
    recommendation.deltaSales === undefined
        ? AI_LEVER_NO_EFFECT
        : `+${recommendation.deltaSales.toLocaleString('ru-RU', {
              maximumFractionDigits: 1,
          })} продаж`;

/** Стоимость совета в его единицах: «30 мин активности», «1,5 ч коучинга». */
export const formatAiLeverCost = (
    recommendation: Pick<AiRecommendation, 'cost' | 'lever'>,
): string =>
    `${recommendation.cost.toLocaleString('ru-RU', {
        maximumFractionDigits: 1,
    })} ${aiLeverView(recommendation.lever).costUnit}`;

/** Строки подсказки совета: адресат, эффект, стоимость, доказательность, опоры. */
export const aiLeverHintLines = (
    recommendation: AiRecommendation,
    callTypeLabel?: (code: string) => string,
): string[] => [
    `Совет: ${aiLeverView(recommendation.lever).label} — ${aiLeverTitle(
        recommendation,
        callTypeLabel,
    )}`,
    `Ожидаемый эффект: ${formatAiLeverEffect(recommendation)}`,
    `Стоимость: ${formatAiLeverCost(recommendation)}`,
    `Доказательность: ${aiEvidenceWords(recommendation.evidence)}`,
    ...recommendation.basis,
];

/** YYYY-MM-DD → «01.03.2025»; иное — как есть. */
export const formatAiDateRu = (value: string): string => {
    const [year, month, day] = value.slice(0, 10).split('-');
    return year && month && day ? `${day}.${month}.${year}` : value;
};

/* ---------- Строка: стаж, «разобрано N из M», видимые колонки ---------- */

export const AI_TENURE_UNKNOWN = 'стаж не задан';
export const AI_TENURE_UNKNOWN_HINT = 'задайте дату в «Настройки»';

/** Подпись с подсказкой «что сделать»; hint null — подсказки нет. */
export interface AiHintedLabel {
    text: string;
    hint: string | null;
}

/**
 * Стаж с датой и источником: «стаж 9 мес. (с 01.03.2025, по дате приёма)»;
 * чего нет — то опускаем: «стаж 9 мес. (по дате приёма)», «стаж 9 мес.
 * (с 01.03.2025)», «стаж 9 мес.»; только дата — «с 01.03.2025»; ничего —
 * «стаж не задан».
 */
export const formatAiSince = (
    since: string | undefined,
    tenureMonths: number | null,
    sinceSource?: AiManagerSinceSource,
): string => {
    if (tenureMonths === null) {
        return since ? `с ${formatAiDateRu(since)}` : AI_TENURE_UNKNOWN;
    }
    const details = [
        since ? `с ${formatAiDateRu(since)}` : null,
        sinceSource ? AI_SINCE_SOURCE_LABELS[sinceSource] : null,
    ].filter((part): part is string => part !== null);
    const tenure = `стаж ${tenureMonths} мес.`;
    return details.length ? `${tenure} (${details.join(', ')})` : tenure;
};

/** Стаж не посчитать: ни стажа, ни даты («стаж не задан»). */
export const isAiTenureUnknown = (
    row: Pick<AiManagerRow, 'since' | 'tenureMonths'>,
): boolean => row.tenureMonths === null && !row.since;

/** Стаж строки + подсказка «задайте дату», когда стаж не задан. */
export const aiTenureLabel = (
    row: Pick<AiManagerRow, 'since' | 'sinceSource' | 'tenureMonths'>,
): AiHintedLabel => ({
    text: formatAiSince(row.since, row.tenureMonths, row.sinceSource),
    hint: isAiTenureUnknown(row) ? AI_TENURE_UNKNOWN_HINT : null,
});

/**
 * Звонки в CRM есть, а телефония за период пуста — звонки менеджера не
 * видны разбору (вне пилота, вне отдела продаж, короче порога).
 */
export const isAiRowOutOfAnalysis = (
    row: Pick<AiManagerRow, 'callsTotal' | 'discipline'>,
): boolean => row.callsTotal === 0 && row.discipline.callDone > 0;

/** Что знает строка о разборе на портале: статус конвейера, период, дата сравнимости. */
export interface AiAnalyzedContext extends AiAnalysisPeriodContext {
    callReport?: AiCallReportStatus;
    /** Дата, с которой разборы сравнимы (обзор); пусто — null. */
    comparableFrom: string | null;
}

/** «Разобрано N из M» или «AI-разборов нет» с подсказкой: что это и почему пусто. */
export interface AiAnalyzedView {
    text: string;
    /** Подсказка (всегда у ненулевых; у нулевых — причина); null — сказать нечего. */
    hint: AiHint | null;
    /** Нулевая строка с причиной — подпись подсвечивается как предупреждение. */
    warning: boolean;
}

/**
 * Подпись «разобрано N из M» с подсказкой, что такое оба числа. При
 * callsTotal = 0 — «AI-разборов нет · в CRM N звонков» и причина: период
 * раньше старта разбора, вне пилота, вне отдела продаж, короче порога,
 * иначе — «см. «Готовность витрины»». Без звонков в CRM и не до старта
 * разбора подсказки нет: сравнивать нечего.
 */
export const aiAnalyzedView = (
    row: Pick<
        AiManagerRow,
        'managerId' | 'departmentId' | 'analyzedCalls' | 'callsTotal' | 'discipline'
    >,
    ctx: AiAnalyzedContext,
): AiAnalyzedView => {
    if (row.callsTotal > 0) {
        return {
            text: AI_ANALYZED_TEXT.label(row.analyzedCalls, row.callsTotal),
            hint: AI_ANALYZED_TEXT.hint(ctx.comparableFrom),
            warning: false,
        };
    }
    const crmCalls = row.discipline.callDone;
    const text =
        crmCalls > 0 ? AI_ANALYZED_TEXT.noneWithCrm(crmCalls) : AI_ANALYZED_TEXT.none;
    const beforeStart = isAiPeriodBeforeAnalysis(ctx);
    if (crmCalls === 0 && !beforeStart) return { text, hint: null, warning: false };
    const reason = aiNotAnalyzedReason(row, ctx.callReport, ctx);
    return {
        text,
        hint: aiNotAnalyzedHint(reason, {
            analysisSince: ctx.analysisSince ?? null,
            minDurationSec: ctx.callReport?.minDurationSec ?? null,
        }),
        // «Разбор ещё не шёл» — к сведению, не предупреждение.
        warning: reason !== AI_NOT_ANALYZED_REASON.BEFORE_PIPELINE,
    };
};

/** Колонки, которые показываем только при данных хотя бы у одной строки. */
export interface AiSignalColumns {
    trends: boolean;
    yoy: boolean;
    /** «План руководителя» — когда хоть у одной строки задан план. */
    planHead: boolean;
}

/** Постоянные колонки: сотрудник, сигнал, цифра, корзины, сделки, аванс, месячная сумма, 2 колонки CRM, советы, «Не согласен». */
export const AI_SIGNAL_FIXED_COLUMNS = 10 + AI_BUCKETS.length;

/** «Тренды», «Год назад» и «План руководителя» — только если хоть у одной строки они есть. */
export const aiSignalColumns = (
    rows: readonly Pick<AiManagerRow, 'trends' | 'yoy' | 'planTargets'>[],
): AiSignalColumns => ({
    trends: rows.some(row => !!row.trends),
    yoy: rows.some(row => !!row.yoy),
    planHead: aiSignalHasPlanHead(rows),
});

/** Число видимых колонок — для colSpan строки-заголовка секции. */
export const aiSignalColumnCount = (columns: AiSignalColumns): number =>
    AI_SIGNAL_FIXED_COLUMNS +
    Number(columns.trends) +
    Number(columns.yoy) +
    Number(columns.planHead);

/** Колонок до финансовых («Сделок»): сотрудник, сигнал, цифра, корзины, тренды, год назад. */
export const aiSignalColumnsBeforeFinance = (columns: AiSignalColumns): number =>
    3 + AI_BUCKETS.length + Number(columns.trends) + Number(columns.yoy);

/** Финансовых колонок: сделок, аванс, месячная сумма. */
export const AI_SIGNAL_FINANCE_COLUMNS = 3;

/** Период закрытых продаж строк (у всех строк один); старый кэш без source — null. */
export const aiFinanceSourceOf = (
    rows: readonly Pick<AiManagerRow, 'finance'>[],
): AiFinanceSource | null =>
    rows.find(row => row.finance.source)?.finance.source ?? null;

/** Сколько риск-звонков показывать в строке. */
export const AI_RISK_CALLS_MAX = 3;

/** Свежие риск-звонки первыми, не больше max. */
export const pickAiRiskCalls = (
    calls: AiRiskCall[],
    max = AI_RISK_CALLS_MAX,
): AiRiskCall[] =>
    [...calls]
        .sort((a, b) => b.callStartedAt.localeCompare(a.callStartedAt))
        .slice(0, max);

/* «Не согласен»: причина из списка + комментарий — ai-disagree.util.ts. */
export * from './ai-disagree.util';

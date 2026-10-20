import type {
    AiCallReportStatus,
    AiManagerRow,
} from '@/modules/entities/ai-analytics/model';
import { aiPilotIds } from '@/modules/entities/ai-analytics/lib/ai-pilot.util';

/*
 * Почему звонков сотрудника нет в разборе — одна цепочка причин для
 * строки таблицы сигналов и пункта чек-листа «Готовность витрины»:
 * период раньше старта разбора → не в пилоте → вне отдела продаж →
 * короче порога → иное.
 */

/** Вероятная причина, почему звонки менеджера не видны разбору. */
export const AI_NOT_ANALYZED_REASON = {
    /** Период целиком раньше дня, с которого на портале идёт разбор. */
    BEFORE_PIPELINE: 'before-pipeline',
    OUT_OF_PILOT: 'out-of-pilot',
    OUT_OF_SALES: 'out-of-sales',
    SHORT: 'short',
    OTHER: 'other',
} as const;
export type AiNotAnalyzedReason =
    (typeof AI_NOT_ANALYZED_REASON)[keyof typeof AI_NOT_ANALYZED_REASON];

/** Период обзора и день старта разбора (settings/get.analysisSince). */
export interface AiAnalysisPeriodContext {
    /** Конец периода обзора YYYY-MM-DD. */
    periodTo: string;
    /** День первого готового разбора на портале; null или нет — не известен. */
    analysisSince?: string | null;
}

/** Период целиком раньше старта разбора: сравнение дат YYYY-MM-DD строками. */
export const isAiPeriodBeforeAnalysis = (
    ctx: AiAnalysisPeriodContext | undefined,
): boolean =>
    !!ctx?.analysisSince && ctx.periodTo.slice(0, 10) < ctx.analysisSince.slice(0, 10);

/**
 * Причина по периоду и статусу конвейера: раньше старта → не в пилоте →
 * вне отдела продаж (разбор «только ОП» по умолчанию, salesOnly = null) →
 * порог длительности → иное.
 */
export const aiNotAnalyzedReason = (
    row: Pick<AiManagerRow, 'managerId' | 'departmentId'>,
    report: AiCallReportStatus | undefined,
    period?: AiAnalysisPeriodContext,
): AiNotAnalyzedReason => {
    if (isAiPeriodBeforeAnalysis(period)) {
        return AI_NOT_ANALYZED_REASON.BEFORE_PIPELINE;
    }
    const pilot = aiPilotIds(report);
    if (pilot.length && !pilot.includes(row.managerId)) {
        return AI_NOT_ANALYZED_REASON.OUT_OF_PILOT;
    }
    if (report?.salesOnly !== false && row.departmentId === null) {
        return AI_NOT_ANALYZED_REASON.OUT_OF_SALES;
    }
    if (report?.minDurationSec) return AI_NOT_ANALYZED_REASON.SHORT;
    return AI_NOT_ANALYZED_REASON.OTHER;
};

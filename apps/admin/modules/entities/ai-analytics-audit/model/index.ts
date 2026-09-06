import type {
    AiAnalyticsAuditAboutDto,
    AiAnalyticsAuditAboutItemDto,
    AiAnalyticsAuditAboutResponseDto,
    AiAnalyticsAuditAboutSectionDto,
    AiAnalyticsAuditPortalStatusDto,
    AiAnalyticsAuditResultDto,
    AiAnalyticsAuditResultDtoSource,
    AiAnalyticsAuditRunDto,
} from '@workspace/nest-admin-api';

/**
 * Доменные алиасы generated-типов аудита данных AI-аналитики ОП
 * (`Sales AI Analytics Admin`, `/api/admin/ai-analytics/audit*`).
 *
 * Единственное, что описано руками, — форма структурированного отчёта
 * `report`: в Swagger он объявлен как `Object`, и orval отдаёт
 * `{ [key: string]: unknown }`. Форма повторяет `AuditReport` бэка
 * (`libs/sales-ai-analytics/src/audit/ai-analytics-audit.report.ts`);
 * ответ ручки сужается до неё guard-ом в `lib/audit-report.guard.ts`.
 */
export type AiAnalyticsAuditRun = AiAnalyticsAuditRunDto;
export type AiAnalyticsAuditAbout = AiAnalyticsAuditAboutDto;
export type AiAnalyticsAuditAboutItem = AiAnalyticsAuditAboutItemDto;
export type AiAnalyticsAuditAboutSection = AiAnalyticsAuditAboutSectionDto;
export type AiAnalyticsAuditAboutResponse = AiAnalyticsAuditAboutResponseDto;
/** Состояние портала: общий рубильник AI-аналитики, признак аудита, последний снапшот. */
export type AiAnalyticsAuditPortalStatus = AiAnalyticsAuditPortalStatusDto;

/** Источник отчёта: admin — ручка, cron — месячный снапшот. */
export type AiAnalyticsAuditSource = AiAnalyticsAuditResultDtoSource;

/** Границы и умолчания запуска — зеркало AI_ANALYTICS_AUDIT_RUN_DEFAULTS бэка. */
export const AI_ANALYTICS_AUDIT_RUN_DEFAULTS = {
    months: 6,
    minMonths: 1,
    maxMonths: 24,
    timeZone: 'Europe/Moscow',
    save: true,
} as const;

/* ---------- Структурированный отчёт (AuditReport бэка) ---------- */

export interface AiAnalyticsAuditReportMeta {
    domain: string;
    timeZone: string;
    /** Ключи месяцев окна YYYY-MM по возрастанию. */
    months: string[];
    /** Дата формирования YYYY-MM-DD. */
    generatedAt: string;
}

/** Пороги, по которым формируется рекомендация. */
export interface AiAnalyticsAuditRules {
    /** Минимальное n разборов в ячейке менеджер × тип × месяц. */
    cellMinN: number;
    /** Если меньше этой доли разборов окна лежит в «достаточных» ячейках — пороги ниже. */
    cellShareMinPct: number;
    /** Короткий звонок, с. */
    shortCallSec: number;
    /** Если доля коротких звонков выше — нужен дешёвый контур для коротких. */
    shortShareMaxPct: number;
}

export interface AiAnalyticsAuditReportTotals {
    fetchedTranscriptions: number;
    outsideWindow: number;
    calls: number;
    withManager: number;
    analyzed: number;
}

export interface AiAnalyticsAuditCoverageRow {
    month: string;
    total: number;
    withManager: number;
    withManagerPct: number | null;
    analyzed: number;
    analyzedWithManager: number;
}

export interface AiAnalyticsAuditPivotManager {
    managerId: string;
    byType: Record<string, number>;
    total: number;
}

export interface AiAnalyticsAuditMonthPivot {
    month: string;
    typeOrder: string[];
    managers: AiAnalyticsAuditPivotManager[];
    inCellsWithMinNPct: number | null;
}

export interface AiAnalyticsAuditNoiseShare {
    n: number;
    pct: number | null;
}

export interface AiAnalyticsAuditNoiseRow {
    month: string;
    total: number;
    typed: number;
    byType: Record<string, AiAnalyticsAuditNoiseShare>;
}

export interface AiAnalyticsAuditDurationStats {
    n: number;
    missing: number;
    p10: number | null;
    p50: number | null;
    p90: number | null;
    shortCount: number;
    shortPct: number | null;
}

export interface AiAnalyticsAuditVersionRow {
    month: string;
    versionKey: string;
    n: number;
}

export interface AiAnalyticsAuditFieldPresence {
    analyzed: number;
    nextStep: {
        set: number;
        withDate: number;
        withDatePctOfAnalyzed: number | null;
        withDatePctOfSet: number | null;
    };
    sections: {
        callsWithAny: number;
        callsWithAnyPct: number | null;
        total: number;
        withAlternatives: number;
        withAlternativesPct: number | null;
    };
    objections: {
        callsWithObjections: number;
        total: number;
        withQuote: number;
        withQuotePct: number | null;
    };
}

export interface AiAnalyticsAuditDepthRow {
    type: string;
    /** ISO-дата первой записи, null — записей нет. */
    firstCreatedAt: string | null;
    count: number;
}

/** Автоматическая рекомендация по порогам и minDurationSec. */
export interface AiAnalyticsAuditRecommendation {
    lowerThresholds: boolean;
    cheapShortContour: boolean;
    lines: string[];
}

/** Структурированный отчёт аудита (поле `report` результата). */
export interface AiAnalyticsAuditReport {
    meta: AiAnalyticsAuditReportMeta;
    rules: AiAnalyticsAuditRules;
    totals: AiAnalyticsAuditReportTotals;
    coverage: AiAnalyticsAuditCoverageRow[];
    pivots: AiAnalyticsAuditMonthPivot[];
    analyzedInCellsPct: number | null;
    analyzedByManagerMonthPct: number | null;
    noise: AiAnalyticsAuditNoiseRow[];
    duration: AiAnalyticsAuditDurationStats;
    durationByMonth: (AiAnalyticsAuditDurationStats & { month: string })[];
    versions: AiAnalyticsAuditVersionRow[];
    fields: AiAnalyticsAuditFieldPresence;
    depth: AiAnalyticsAuditDepthRow[];
    recommendation: AiAnalyticsAuditRecommendation;
}

/**
 * Результат аудита — свежий расчёт (`fromSnapshot = false`) или последний
 * снапшот из ais (`fromSnapshot = true`): generated-конверт с `report`,
 * суженным до формы отчёта.
 */
export type AiAnalyticsAuditResult = Omit<AiAnalyticsAuditResultDto, 'report'> & {
    report: AiAnalyticsAuditReport;
};

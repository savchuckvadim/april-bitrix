import {
    isAiKpiOnly,
    pluralRu,
    type AiCallReportStatus,
    type AiManagerRow,
} from '@/modules/entities/ai-analytics';
import { AI_READINESS_REASON_CODE } from './ai-readiness-banner.util';
import { isAiRowOutOfAnalysis } from './ai-signal.util';
import {
    AI_EMPLOYEE_GENITIVE,
    AI_MANAGER_GENITIVE,
} from './ai-setup-checklist.data';
import { AI_CHECKLIST_TEXT } from './ai-setup-checklist.texts';
import {
    aiDoneItem,
    aiOverviewUnknownItem,
    aiTextAction,
    aiTodoItem,
    aiUnknownItem,
    formatAiNameList,
    type AiChecklistContext,
} from './ai-setup-checklist.context';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_OVERVIEW,
    type AiChecklistItem,
} from './ai-setup-checklist.types';

/*
 * «Сначала данные»: доступ к обзору, разбор звонков на портале, пилот,
 * менеджеры вне разбора, пустое окно конвейера и качество данных. Пока
 * эти пункты открыты, ждать бесполезно — чисел не прибавится.
 */

const T = AI_CHECKLIST_TEXT;
const DATA = AI_CHECKLIST_GROUP.DATA;

/** Обзор отдела закрыт для роли (403) — видна только своя строка. */
export const aiAccessItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    if (ctx.overviewState === AI_CHECKLIST_OVERVIEW.FORBIDDEN) {
        return aiTodoItem(AI_CHECKLIST_ITEM.ACCESS, DATA, {
            title: T.access.title,
            detail: T.access.detail,
            unlocks: T.access.unlocks,
            actions: [
                aiTextAction(T.access.head),
                aiTextAction(T.access.vendor),
            ],
        });
    }
    if (ctx.overviewState === AI_CHECKLIST_OVERVIEW.READY) {
        return aiDoneItem(AI_CHECKLIST_ITEM.ACCESS, DATA, {
            title: T.access.doneTitle,
            detail: T.access.doneDetail,
        });
    }
    return null;
};

/** Пилот: разбор включён и ограничен непустым списком сотрудников. */
export const aiPilotIds = (report: AiCallReportStatus | undefined): string[] =>
    report?.enabled && report.pilotUserIds?.length ? report.pilotUserIds : [];

/** Разбор звонков на портале: выключен / включён / статус не прочитан. */
export const aiCallCoverageItem = (
    ctx: AiChecklistContext,
): AiChecklistItem => {
    const report = ctx.settings.callReport;
    const code = AI_CHECKLIST_ITEM.CALL_COVERAGE;
    if (!report) {
        return aiUnknownItem(code, DATA, {
            title: T.coverage.unknownTitle,
            detail: T.coverage.unknownDetail,
        });
    }
    if (!report.enabled) {
        return aiTodoItem(code, DATA, {
            title: T.coverage.offTitle,
            detail: T.coverage.offDetail,
            unlocks: T.coverage.unlocks,
            actions: [aiTextAction(T.coverage.enable)],
        });
    }
    return aiDoneItem(code, DATA, {
        title: T.coverage.doneTitle,
        detail: aiPilotIds(report).length
            ? T.coverage.donePilot
            : T.coverage.doneAll,
    });
};

/**
 * Пилот — осознанное решение по стоимости, поэтому рекомендация, а не
 * блокер: менеджеров вне пилота с CRM-звонками покажет «вне разбора».
 */
export const aiPilotItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const ids = aiPilotIds(ctx.settings.callReport);
    if (!ids.length) return null;
    return aiTodoItem(AI_CHECKLIST_ITEM.PILOT, DATA, {
        optional: true,
        title: T.pilot.title(
            ids.length,
            pluralRu(ids.length, AI_EMPLOYEE_GENITIVE),
        ),
        detail: T.pilot.detail(formatAiNameList(ids.map(ctx.managerName))),
        unlocks: T.pilot.unlocks,
        actions: [aiTextAction(T.pilot.widen)],
    });
};

/** Вероятная причина, почему звонки менеджера не видны разбору. */
export const AI_NOT_ANALYZED_REASON = {
    OUT_OF_PILOT: 'out-of-pilot',
    OUT_OF_SALES: 'out-of-sales',
    SHORT: 'short',
    OTHER: 'other',
} as const;
export type AiNotAnalyzedReason =
    (typeof AI_NOT_ANALYZED_REASON)[keyof typeof AI_NOT_ANALYZED_REASON];

/**
 * Причина по статусу конвейера: не в пилоте → вне отдела продаж (разбор
 * «только ОП» по умолчанию, salesOnly = null) → порог длительности → иное.
 */
export const aiNotAnalyzedReason = (
    row: Pick<AiManagerRow, 'managerId' | 'departmentId'>,
    report: AiCallReportStatus | undefined,
): AiNotAnalyzedReason => {
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

/** Подпись причины в скобках после имени. */
export const aiNotAnalyzedReasonLabel = (
    reason: AiNotAnalyzedReason,
    report: AiCallReportStatus | undefined,
): string => {
    switch (reason) {
        case AI_NOT_ANALYZED_REASON.OUT_OF_PILOT:
            return T.notAnalyzed.outOfPilot;
        case AI_NOT_ANALYZED_REASON.OUT_OF_SALES:
            return T.notAnalyzed.outOfSales;
        case AI_NOT_ANALYZED_REASON.SHORT:
            return T.notAnalyzed.short(report?.minDurationSec ?? 0);
        default:
            return T.notAnalyzed.other;
    }
};

const NOT_ANALYZED_FIX: Record<AiNotAnalyzedReason, string> = {
    [AI_NOT_ANALYZED_REASON.OUT_OF_PILOT]: T.pilot.widen,
    [AI_NOT_ANALYZED_REASON.OUT_OF_SALES]: T.notAnalyzed.fixSales,
    [AI_NOT_ANALYZED_REASON.SHORT]: T.notAnalyzed.fixShort,
    [AI_NOT_ANALYZED_REASON.OTHER]: T.notAnalyzed.fixOther,
};

/** Менеджеры с CRM-звонками и пустой телефонией за период — поимённо с причиной. */
export const aiNotAnalyzedItem = (ctx: AiChecklistContext): AiChecklistItem => {
    const code = AI_CHECKLIST_ITEM.NOT_ANALYZED;
    if (!ctx.overview) {
        return aiOverviewUnknownItem(ctx, code, DATA, T.notAnalyzed.checkTitle);
    }
    const report = ctx.settings.callReport;
    const rows = ctx.overview.managers.filter(isAiRowOutOfAnalysis);
    if (!rows.length) {
        return aiDoneItem(code, DATA, {
            title: T.notAnalyzed.doneTitle,
            detail: T.notAnalyzed.doneDetail,
        });
    }
    const reasons = rows.map(row => aiNotAnalyzedReason(row, report));
    const names = rows.map(
        (row, index) =>
            `${ctx.managerName(row.managerId)} (${aiNotAnalyzedReasonLabel(reasons[index] ?? AI_NOT_ANALYZED_REASON.OTHER, report)})`,
    );
    return aiTodoItem(code, DATA, {
        // Все вне разбора только из-за пилота — это решение по стоимости
        // (DTO: «у остальных пустые строки — это не поломка»), не блокер.
        optional: reasons.every(
            reason => reason === AI_NOT_ANALYZED_REASON.OUT_OF_PILOT,
        ),
        title: T.notAnalyzed.title(
            rows.length,
            pluralRu(rows.length, AI_MANAGER_GENITIVE),
        ),
        detail: T.notAnalyzed.detail(formatAiNameList(names)),
        unlocks: T.notAnalyzed.unlocks,
        actions: [...new Set(reasons)].map(reason =>
            aiTextAction(NOT_ANALYZED_FIX[reason]),
        ),
    });
};

/**
 * kpi-only: разбор включён, но за 30 дней разборов нет. Разбор выключен —
 * пункт не нужен: это уже сказал «Разбор звонков выключен».
 */
export const aiPipelineItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const empty =
        isAiKpiOnly(ctx.readiness.mode) ||
        ctx.reasons.has(AI_READINESS_REASON_CODE.NO_ANALYSIS);
    if (!empty || ctx.settings.callReport?.enabled === false) return null;
    return aiTodoItem(AI_CHECKLIST_ITEM.PIPELINE, DATA, {
        title: T.pipeline.title,
        detail: T.pipeline.detail,
        unlocks: T.pipeline.unlocks,
        actions: [aiTextAction(T.pipeline.fix)],
    });
};

/** Санити-панель модели: продажи закрываются раньше объясняющих их активностей. */
export const aiDataQualityItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    ctx.reasons.has(AI_READINESS_REASON_CODE.DATA_QUALITY_TIMESTAMP_LEAK)
        ? aiTodoItem(AI_CHECKLIST_ITEM.DATA_QUALITY, DATA, {
              title: T.dataQuality.title,
              detail: T.dataQuality.detail,
              unlocks: T.dataQuality.unlocks,
              actions: [aiTextAction(T.dataQuality.fix)],
          })
        : null;

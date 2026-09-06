import type { AiAnalyticsAuditResultDto } from '@workspace/nest-admin-api';
import type { AiAnalyticsAuditReport, AiAnalyticsAuditResult } from '../model';

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Структурная проверка отчёта — та же, что у бэка при чтении снапшота
 * (`isAuditReportLike`): meta с доменом и окном, totals, rules и
 * recommendation. Глубже не смотрим: отчёт пишет один код lib, а UI
 * читает ровно эти ветки плюс markdown.
 */
export const isAuditReportLike = (
    value: unknown,
): value is AiAnalyticsAuditReport => {
    if (!isRecord(value)) return false;
    const { meta, totals, rules, recommendation } = value;
    return (
        isRecord(meta) &&
        typeof meta.domain === 'string' &&
        typeof meta.timeZone === 'string' &&
        typeof meta.generatedAt === 'string' &&
        Array.isArray(meta.months) &&
        isRecord(totals) &&
        typeof totals.calls === 'number' &&
        isRecord(rules) &&
        typeof rules.cellMinN === 'number' &&
        isRecord(recommendation) &&
        Array.isArray(recommendation.lines)
    );
};

/**
 * Generated-конверт → доменный результат. Swagger описывает `report`
 * как `Object`, поэтому сужение делается здесь, а не приведением типа:
 * чужая форма (сломанный снапшот, другой релиз бэка) — понятная ошибка,
 * а не падение UI на `report.totals.calls`.
 */
export const toAuditResult = (
    dto: AiAnalyticsAuditResultDto,
): AiAnalyticsAuditResult => {
    const { report, ...rest } = dto;
    if (!isAuditReportLike(report)) {
        throw new Error(
            `Отчёт аудита по домену ${dto.domain} пришёл в неожиданной форме`,
        );
    }
    return { ...rest, report };
};

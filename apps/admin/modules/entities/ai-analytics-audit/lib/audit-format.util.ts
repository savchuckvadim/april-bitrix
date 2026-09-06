import type { AiAnalyticsAuditReport } from '../model';

/** Дата-время в русской локали (локальный пояс браузера), «—» если пусто. */
export const formatAuditDateTime = (value?: string | null): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/** Окно отчёта по ключам месяцев: «2026-04 … 2026-09 (6 мес.)». */
export const formatAuditWindow = (months: readonly string[]): string => {
    if (months.length === 0) return '—';
    const first = months[0];
    const last = months[months.length - 1];
    return `${first} … ${last} (${months.length} мес.)`;
};

/** Процент с «—» вместо null (в отчёте null = нечего делить). */
export const formatAuditPct = (value: number | null): string =>
    value === null ? '—' : `${value} %`;

/** Структурированный отчёт → читаемый JSON для свёрнутого блока. */
export const formatReportJson = (report: AiAnalyticsAuditReport): string =>
    JSON.stringify(report, null, 2);

/**
 * Типы раздела «Журналы» — зеркало DTO бэка admin (`LogsAdminController`
 * из @lib/logger/query). Клиент не перегенерирован — типы ручные.
 */

export const LOG_LEVELS = ['error', 'warn', 'info', 'debug', 'verbose'] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LogsFilter {
    hours: number;
    app?: string;
    env?: string;
    level?: LogLevel;
    domain?: string;
    search?: string;
}

export interface LogRow {
    at: string;
    app: string;
    env: string;
    level: string;
    context: string;
    message: string;
    meta: string;
    trace: string;
    domain: string;
}

export interface LogAppStat {
    app: string;
    errors: number;
    warnings: number;
    total: number;
    prevErrors: number;
    prevTotal: number;
    lastAt: string | null;
}

export interface LogErrorPattern {
    app: string;
    sample: string;
    count: number;
    firstAt: string;
    lastAt: string;
    domains: string[];
}

export interface LogDomainStat {
    domain: string;
    errors: number;
    warnings: number;
    total: number;
}

export interface LogsSummary {
    hours: number;
    from: string;
    to: string;
    apps: LogAppStat[];
    topErrors: LogErrorPattern[];
    domains: LogDomainStat[];
    conclusions: string[];
}

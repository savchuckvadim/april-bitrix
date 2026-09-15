import type {
    AiAttention,
    AiAttentionItem,
    AiByType,
    AiByTypeLongRow,
    AiByTypeWideRow,
    AiEnvelope,
    AiManagerRow,
    AiManagerTypeCell,
    AiMetric,
    AiOverview,
    AiTypeTotals,
} from '../model';

/** Метрика с заданным value/n (доверие ok при n ≥ 20, low при 8–19, иначе none). */
export const metric = (value: number | null, n = 30): AiMetric => ({
    value: n < 8 ? null : value,
    n,
    confidence: { level: n < 8 ? 'none' : n < 20 ? 'low' : 'ok' },
});

export const cell = (
    overrides: Partial<AiManagerTypeCell> = {},
): AiManagerTypeCell => ({
    callType: 'presentation',
    title: 'Презентация',
    bucket: 'presentation',
    n: 12,
    nBeforeComparable: 0,
    versionsMixed: false,
    score: metric(6.4, 12),
    sections: [],
    checklists: { nextStepDateRatePct: metric(42, 12) },
    kpi: [],
    primaryKpi: null,
    kpiReason: null,
    explanation: {
        source: 'template',
        text: 'Оценка 6,4/10 (n = 12).',
        basis: [],
        evidenceCallIds: { best: 'b', worst: 'w', median: null },
    },
    ...overrides,
});

export const attentionItem = (
    overrides: Partial<AiAttentionItem> = {},
): AiAttentionItem => ({
    managerId: '7',
    rank: 1,
    signal: 'risk',
    availableFrom: 1,
    headline: '2 риск-звонка',
    basis: [{ code: 'risk_calls', value: 2, n: 2 }],
    link: { managerId: '7', transcriptionIds: ['t1', 't2'] },
    ...overrides,
});

export const managerRow = (
    overrides: Partial<AiManagerRow> = {},
): AiManagerRow => ({
    managerId: '7',
    departmentId: 10,
    groupId: null,
    level: 'middle',
    levelSource: 'default',
    tenureMonths: 9,
    workdays: 20,
    signal: null,
    keyMetric: metric(6.1, 25),
    funnelShape: 'balanced',
    buckets: [
        { bucket: 'contact', n: 10, score: metric(5.5, 10) },
        { bucket: 'presentation', n: 12, score: metric(6.4, 12) },
        { bucket: 'closing', n: 3, score: metric(null, 3) },
    ],
    byType: [cell()],
    funnel: [],
    finance: {
        salesCount: 3,
        advanceAmount: 150000,
        monthlyAmount: 42000,
        pipelineFromStage: { count: 2, monthlyAmount: 30000 },
        hotEvents: 1,
    },
    discipline: {
        callPlan: 40,
        callDone: 25,
        presentationPlan: 10,
        presentationDone: 12,
    },
    callsTotal: 60,
    analyzedCalls: 25,
    nextStepRate: {
        windowDays: 14,
        current: metric(0.4, 20),
        previous: metric(0.5, 20),
    },
    riskCalls: [],
    recommendations: [],
    ...overrides,
});

export const overview = (
    managers: AiManagerRow[] = [managerRow()],
): AiOverview => ({
    period: {
        from: '2026-08-01',
        to: '2026-08-31',
        timeZone: 'Europe/Moscow',
        days: 31,
        workdays: 21,
    },
    readiness: {
        mode: 'calibration',
        historyMonths: 1,
        presentations: 12,
        sales: 3,
        comparableFrom: '',
        reasons: [],
    },
    calcVersion: '1.0.0',
    versions: {} as AiOverview['versions'],
    comparableFrom: '',
    managers,
    totals: [],
    departmentTotals: [],
    objections: { byManager: [], totals: [], n: 0 },
    meta: {
        totalCalls: 100,
        analyzedCalls: 40,
        skippedNoManager: 0,
        otherSharePct: 10,
        disagreementsCount: 0,
        fromCache: false,
        generatedAt: '2026-09-07T10:00:00Z',
        confirmedOnly: false,
    },
});

export const attention = (
    items: AiAttentionItem[] = [attentionItem()],
): AiAttention => ({
    from: '2026-08-01',
    to: '2026-08-31',
    items,
    managersConsidered: 5,
});

export const byType = (overrides: Partial<AiByType> = {}): AiByType => ({
    callType: 'presentation',
    title: 'Презентация',
    layout: 'wide',
    period: {
        from: '2026-08-01',
        to: '2026-08-31',
        timeZone: 'Europe/Moscow',
        days: 31,
        workdays: 21,
    },
    wide: [],
    long: null,
    totals: null,
    totalsByType: null,
    objections: null,
    ...overrides,
});

export const ready = <T>(
    data: T,
    requestKey = 'server-key',
): AiEnvelope<T> => ({
    status: 'ready',
    requestKey,
    data,
});

export const queued = <T>(requestKey = 'server-key'): AiEnvelope<T> => ({
    status: 'queued',
    requestKey,
    jobId: requestKey,
});

export const processing = <T>(requestKey = 'server-key'): AiEnvelope<T> => ({
    status: 'processing',
    requestKey,
    jobId: requestKey,
});

/** Итог по типу по домену: ячейка типа + число менеджеров с этим типом. */
export const typeTotals = (
    overrides: Partial<AiTypeTotals> = {},
): AiTypeTotals => ({
    ...cell(),
    managers: 1,
    ...overrides,
});

/** Строка «широкой» раскладки среза по типу (менеджер × ячейка типа). */
export const wideRow = (
    overrides: Partial<AiByTypeWideRow> = {},
): AiByTypeWideRow => ({
    managerId: '7',
    level: 'middle',
    departmentId: 10,
    cell: cell(),
    primaryKpi: null,
    finance: managerRow().finance,
    ...overrides,
});

/** Строка «длинной» раскладки: сотрудник | тип | показатель | оценка | объяснение. */
export const longRow = (
    overrides: Partial<AiByTypeLongRow> = {},
): AiByTypeLongRow => ({
    managerId: '7',
    callType: 'presentation',
    kind: 'score',
    indicator: 'score',
    title: 'Оценка: Презентация',
    metric: metric(6.4, 12),
    explanation: 'Оценка 6,4/10 (n = 12).',
    ...overrides,
});

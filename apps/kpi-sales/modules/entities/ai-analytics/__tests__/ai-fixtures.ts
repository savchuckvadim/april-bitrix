import type {
    AiAbout,
    AiAttention,
    AiAttentionItem,
    AiBrief,
    AiByType,
    AiByTypeLongRow,
    AiByTypeWideRow,
    AiDailyPlan,
    AiDailyPlanItem,
    AiDossier,
    AiEnvelope,
    AiManagerRow,
    AiManagerTrends,
    AiManagerTypeCell,
    AiMetric,
    AiOverview,
    AiPlanFact,
    AiPlanFactRow,
    AiRopMark,
    AiRopMarkCall,
    AiRopMarkWeek,
    AiStyleCard,
    AiTypeTotals,
    AiYoy,
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
        hotByColor: { green: 0, yellow: 1, red: 0, none: 0 },
        withOfferCount: 1,
        pipelineByContractType: [],
        pipelineByTerm: [],
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
        betaSource: 'none',
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

/* ---------- Фаза 2 ---------- */

/**
 * Ошибка в форме AxiosError: не-2xx ответ с телом глобального фильтра бэка
 * `{ resultCode: 1, message }` — так приходят 403/400 ручек Фазы 2.
 */
export const httpError = (status: number, message: string): Error =>
    Object.assign(new Error(`Request failed with status code ${status}`), {
        response: { status, data: { resultCode: 1, message } },
    });

/** Строка плана дня по ребру воронки. */
export const dailyPlanItem = (
    overrides: Partial<AiDailyPlanItem> = {},
): AiDailyPlanItem => ({
    callType: 'call_to_presentation',
    title: 'Звонки',
    requiredToday: 12,
    doneToday: 3,
    monthPlan: 180,
    monthDone: 96,
    cap: 20,
    priority: 1,
    ...overrides,
});

/** План дня менеджера от цели месяца (полные данные, reason = null). */
export const dailyPlan = (
    overrides: Partial<AiDailyPlan> = {},
): AiDailyPlan => ({
    managerId: '7',
    date: '2026-09-22',
    target: { sales: 10, source: 'plan', warnings: [] },
    doneSales: 4,
    pipelineExpected: 1.5,
    requiredVolume: 120,
    daysLeft: 7,
    items: [dailyPlanItem()],
    explanation: {
        steps: [
            { code: 'target', value: 10, text: 'Цель месяца G = 10' },
            { code: 'done_sales', value: 4, text: 'Закрыто Y₀ = 4' },
        ],
        text: 'До цели 4,5 продажи за 7 рабочих дней.',
    },
    reason: null,
    ...overrides,
});

/** AI-резюме периода от модели (source = llm). */
export const brief = (overrides: Partial<AiBrief> = {}): AiBrief => ({
    headline: 'Неделя спокойная: дисциплина держится',
    bullets: [
        {
            text: 'Шаг с датой ставится в 42 % звонков.',
            factRefs: ['discipline_next_step'],
        },
    ],
    tone: 'calm',
    source: 'llm',
    packHash: 'hash-1',
    generatedAt: '2026-09-22T06:00:00Z',
    promptVersion: 'brief-v1',
    reason: null,
    usage: { tokens: 800, price: 1.2, estimated: false },
    ...overrides,
});

/** Метка руководителя по звонку подбора. */
export const ropMark = (overrides: Partial<AiRopMark> = {}): AiRopMark => ({
    agree: true,
    ropScore: 8,
    sections: ['NEEDS'],
    why: 'Потребность выявлена',
    howTo: 'Закрывать раньше',
    blind: true,
    markedAt: '2026-09-22T09:00:00Z',
    ...overrides,
});

/** Звонок подбора недели без метки (слепой режим: оценки AI нет). */
export const ropMarkCall = (
    overrides: Partial<AiRopMarkCall> = {},
): AiRopMarkCall => ({
    transcriptionId: 't-1',
    managerId: '7',
    reason: 'uncertain_type',
    reasonTitle: 'Тип определён неуверенно',
    marked: false,
    aiCallType: null,
    aiScore: null,
    ...overrides,
});

/** Неделя слепой проверки с подбором; calls: [] + generatedAt: '' — подбора нет. */
export const ropMarkWeek = (
    overrides: Partial<AiRopMarkWeek> = {},
): AiRopMarkWeek => ({
    weekKey: '2026-W38',
    from: '2026-09-14',
    to: '2026-09-20',
    calls: [ropMarkCall()],
    generatedAt: '2026-09-21T01:00:00Z',
    blindNote: 'До сохранения метки оценка AI не отдаётся.',
    ...overrides,
});

/** Неделя без подбора (ответ rop-mark/list до pick). */
export const ropMarkWeekEmpty = (): AiRopMarkWeek =>
    ropMarkWeek({ calls: [], generatedAt: '' });

/** Карточка стиля с профилем (status = ready). */
export const styleCard = (
    overrides: Partial<AiStyleCard> = {},
): AiStyleCard => ({
    status: 'ready',
    managerId: '7',
    monthKey: '2026-08',
    window: ['2026-06', '2026-07', '2026-08'],
    profile: {
        tags: [
            {
                code: 'long_calls',
                title: 'Долгие разговоры',
                basis: 'Медиана 9 мин против 6 у коллег',
                n: 40,
            },
        ],
        vector: { talk_time: 1.2 },
        confidence: 'ok',
        calls: 40,
    },
    notable: ['Долгие разговоры'],
    axes: [
        {
            code: 'talk_time',
            title: 'Длина разговора',
            minus: 'коротко',
            plus: 'подробно',
            value: 1.2,
            ci80: [0.6, 1.8],
            n: 40,
            confidence: 'ok',
            reason: null,
        },
    ],
    funnelShape: 'balanced',
    stale: false,
    note: null,
    howWeCount: ['Отклонение от нормы коллег в σ.'],
    generatedAt: '2026-09-01T02:00:00Z',
    ...overrides,
});

/** Блок «Как считаем» без модели портала (model = null). */
export const about = (overrides: Partial<AiAbout> = {}): AiAbout => ({
    endpoint: 'overview',
    title: 'Обзор менеджер × тип',
    purpose: 'Оценки разборов по типам звонков.',
    sources: ['Разборы звонков'],
    howToRead: ['Оценка 1–10 с n.'],
    notDoing: ['Не считает премии.'],
    params: [
        {
            code: 'min_calls',
            title: 'Минимум звонков',
            unit: 'шт.',
            value: 8,
            layer: 'default',
            kind: 'configured',
            description: 'Порог «мало данных».',
            breaksSeries: false,
        },
    ],
    paramsVersion: 'v1',
    comparableFrom: '',
    model: null,
    modelReason: 'Модели портала ещё нет',
    reliability: null,
    selfView: false,
    ...overrides,
});

/* ---------- Фаза 3: тренды, год назад, план-факт, досье ---------- */

/** Тренды менеджера за закрытую неделю: сдвиг оценки вниз и флаг Гудхарта. */
export const managerTrends = (
    overrides: Partial<AiManagerTrends> = {},
): AiManagerTrends => ({
    weekKey: '2026-W38',
    calls: 42,
    weeks: 9,
    confidence: 'ok',
    signals: [
        {
            metric: 'quality',
            grain: 'week',
            kind: 'shift',
            direction: 'down',
            sinceWeek: '2026-W36',
            magnitude: -0.8,
            confidence: 'ok',
        },
    ],
    goodhart: [
        {
            pair: 'volume_vs_quality',
            pressure: 'volume',
            counter: 'quality',
            fromKey: '2026-06',
            toKey: '2026-08',
            pressureChange: 0.3,
            counterChange: -0.12,
            points: 3,
        },
    ],
    ...overrides,
});

/** Пара «тот же месяц год назад»: сопоставимая, оценка выросла. */
export const yoy = (overrides: Partial<AiYoy> = {}): AiYoy => ({
    periodKey: '2026-08',
    basePeriodKey: '2025-08',
    comparable: true,
    reasons: [],
    metrics: [
        {
            metric: 'quality',
            current: metric(6.4, 30),
            base: metric(5.9, 28),
            delta: 0.5,
        },
        {
            metric: 'sales_count',
            current: metric(4, 30),
            base: metric(3, 28),
            delta: 1,
        },
    ],
    ...overrides,
});

/** Строка план-факта по показателю: продажи отстают от темпа. */
export const planFactRow = (
    overrides: Partial<AiPlanFactRow> = {},
): AiPlanFactRow => ({
    indicator: 'sales',
    plan: 10,
    fact: 3,
    pace: 0.5,
    forecastP50: 6,
    gap: -4,
    perDayNeeded: 0.7,
    status: 'behind',
    reasons: [],
    ...overrides,
});

/** План-факт месяца: один менеджер, свод отдела, причин нет. */
export const planFact = (overrides: Partial<AiPlanFact> = {}): AiPlanFact => ({
    period: {
        monthKey: '2026-08',
        workdaysInMonth: 21,
        workdaysElapsed: 10,
        today: '2026-08-14',
        closed: false,
    },
    rows: [{ managerId: '7', rows: [planFactRow()] }],
    team: [planFactRow({ plan: 40, fact: 12, forecastP50: 25, gap: -15 })],
    reasons: [],
    reasonTexts: [],
    ...overrides,
});

/** Досье менеджера за 3 месяца: паспорт и ряды есть, тренды и yoy пустые с причинами. */
export const dossier = (overrides: Partial<AiDossier> = {}): AiDossier => ({
    managerId: '7',
    passport: {
        managerId: '7',
        since: '2025-11-03',
        sinceSource: 'employment',
        status: 'active',
        leftAt: null,
        level: 'middle',
        tenureMonths: 10,
        tenureBand: '6-12',
    },
    series: {
        weeks: [{ periodKey: '2026-W37', n: 12, score: metric(6.2, 12) }],
        months: [{ periodKey: '2026-08', n: 40, score: metric(6.4, 40) }],
    },
    trends: null,
    planFact: null,
    yoy: null,
    style: null,
    objections: null,
    feedbackSummary: { total: 3, byKind: { useful: 2, disagree: 1 } },
    ropMarks: null,
    readiness: null,
    reasons: [
        { section: 'trends', reason: 'too-few-data', text: 'разборов меньше порога' },
        { section: 'yoy', reason: 'no-history', text: 'снапшота год назад нет' },
    ],
    meta: {
        calcVersion: 'v1',
        snapshotIds: ['ais-1'],
        generatedAt: '2026-09-25T02:00:00Z',
        months: ['2026-07', '2026-08', '2026-09'],
    },
    ...overrides,
});

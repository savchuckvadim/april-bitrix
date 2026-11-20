import type {
    AI_DEAL_MOVEMENT_ALARM_STATUSES,
    AI_DEAL_MOVEMENT_BUY_ANYWAY,
    AI_DEAL_MOVEMENT_LIMIT_SOURCES,
    AI_DEAL_MOVEMENT_SCORE_BANDS,
    AI_DEAL_MOVEMENT_STATUSES,
} from '../lib/ai-deal-movement.data';

/*
 * Ответы витрины «Движение сделок» (POST ai-analytics/deal-movement/overview
 * и …/deals). Клиент API ещё не перегенерирован — типы повторяют DTO бэка
 * (apps/kpi-report-sales/src/ai-analytics/deal-movement/dto) вручную.
 * Реэкспортируются из `model/index.ts`.
 */

export type AiDealMovementStatus = (typeof AI_DEAL_MOVEMENT_STATUSES)[number];
export type AiDealMovementAlarmStatus =
    (typeof AI_DEAL_MOVEMENT_ALARM_STATUSES)[number];
export type AiDealMovementLimitSource =
    (typeof AI_DEAL_MOVEMENT_LIMIT_SOURCES)[number];
export type AiDealMovementScoreBand =
    (typeof AI_DEAL_MOVEMENT_SCORE_BANDS)[number];
export type AiDealMovementCellFlag = typeof AI_DEAL_MOVEMENT_BUY_ANYWAY;

/* ---------- Статусы ---------- */

/** Статус: сколько сделок и на какую сумму (null — ночь без сумм). */
export interface AiDealMovementStatusCell {
    status: AiDealMovementStatus;
    title: string;
    count: number;
    amountSum: number | null;
}

/** Менеджер на последнюю ночь: все пять статусов и проблемные сделки. */
export interface AiDealMovementManagerStatuses {
    managerId: string;
    managerName: string | null;
    cells: AiDealMovementStatusCell[];
    total: number;
    problemCount: number;
    problemAmountSum: number;
}

export interface AiDealMovementNightManager {
    managerId: string;
    cells: AiDealMovementStatusCell[];
}

/** Ночь динамики; department null — итога по отделу за ночь посчитать нельзя. */
export interface AiDealMovementNight {
    day: string;
    form: number;
    department: AiDealMovementStatusCell[] | null;
    managers: AiDealMovementNightManager[];
}

export interface AiDealMovementStatuses {
    /** Последняя ночь периода со счётом; null — счёта нет (см. notes). */
    day: string | null;
    generatedAt: string | null;
    department: AiDealMovementStatusCell[];
    managers: AiDealMovementManagerStatuses[];
    nights: AiDealMovementNight[];
    notes: string[];
}

/* ---------- Матрица «оценка звонка × продвижение» ---------- */

export interface AiDealMovementScoreBandInfo {
    code: AiDealMovementScoreBand;
    title: string;
    min: number;
    max: number;
}

export interface AiDealMovementMatrixCell {
    scoreBand: AiDealMovementScoreBand;
    progress: number;
    count: number;
    flag: AiDealMovementCellFlag | null;
    flagTitle: string | null;
}

export interface AiDealMovementMatrix {
    n: number;
    cells: AiDealMovementMatrixCell[];
    buyAnyway: number;
    fewCalls: boolean;
    note: string | null;
}

export interface AiDealMovementManagerMatrix extends AiDealMovementMatrix {
    managerId: string;
    managerName: string | null;
}

export interface AiDealMovementMatrixBlock {
    bands: AiDealMovementScoreBandInfo[];
    progressLevels: number[];
    noScore: number;
    department: AiDealMovementMatrix;
    managers: AiDealMovementManagerMatrix[];
}

/* ---------- Честность оценок ---------- */

export interface AiDealMovementHonesty {
    highProgress: number;
    checked: number;
    still: number;
    moved: number;
    pending: number;
    unchecked: number;
    /** Доля «стадия не сдвинулась» среди проверенных, %; null — проверенных нет. */
    stillPct: number | null;
    fewCalls: boolean;
    note: string | null;
}

export interface AiDealMovementManagerHonesty extends AiDealMovementHonesty {
    managerId: string;
    managerName: string | null;
}

export interface AiDealMovementHonestyBlock {
    checkDays: number;
    progressMin: number;
    department: AiDealMovementHonesty;
    managers: AiDealMovementManagerHonesty[];
}

/* ---------- Обзор ---------- */

export interface AiDealMovementOverview {
    from: string;
    to: string;
    statuses: AiDealMovementStatuses;
    matrix: AiDealMovementMatrixBlock;
    honesty: AiDealMovementHonestyBlock;
}

export interface AiDealMovementOverviewQuery {
    from: string;
    to: string;
    /** Пусто — все менеджеры, которых пользователь вправе видеть. */
    managerIds?: string[];
}

/* ---------- Проблемные сделки ---------- */

export interface AiDealMovementDeal {
    dealId: string;
    url: string;
    title: string;
    managerId: string | null;
    managerName: string | null;
    status: AiDealMovementAlarmStatus;
    statusTitle: string;
    amount: number | null;
    stageTitle: string | null;
    stageCode: string | null;
    daysInStage: number;
    stageLimitDays: number;
    stageLimitSource: AiDealMovementLimitSource;
    reasons: string;
    /** С какой ночи в статусе (ISO); null — с начала наблюдений. */
    since: string | null;
}

/** Ответственный × статус: сколько всего и сколько попало в список. */
export interface AiDealMovementDealsGroup {
    managerId: string | null;
    status: AiDealMovementAlarmStatus;
    total: number;
    shown: number;
}

export interface AiDealMovementDealsPage {
    /** Ночь списка; null — списка ещё нет (см. note). */
    day: string | null;
    generatedAt: string | null;
    items: AiDealMovementDeal[];
    total: number;
    page: number;
    pageSize: number;
    perGroup: number;
    groups: AiDealMovementDealsGroup[];
    limited: boolean;
    note: string | null;
}

export interface AiDealMovementDealsQuery {
    managerIds?: string[];
    statuses?: AiDealMovementAlarmStatus[];
    page: number;
    pageSize: number;
}

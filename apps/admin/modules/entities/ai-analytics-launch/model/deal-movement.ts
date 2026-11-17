import type {
    DEAL_MOVEMENT_RUN_MODES,
    DEAL_MOVEMENT_RUN_PHASES,
    DEAL_MOVEMENT_STATUSES,
} from '../consts/deal-movement.const';

/**
 * Ответы ручек движения сделок (`POST admin/ai-analytics/deal-movement`,
 * `GET admin/ai-analytics/deal-movement-status`). Описаны руками строго по
 * DTO бэка (`libs/sales-ai-analytics/src/admin/dto/ai-analytics-deal-movement*.dto.ts`),
 * пока ручки не попали в `@workspace/nest-admin-api`: после генерации
 * меняются только эти типы и helper.
 */

export type DealMovementStatus = (typeof DEAL_MOVEMENT_STATUSES)[number];
export type DealMovementRunMode = (typeof DEAL_MOVEMENT_RUN_MODES)[number];
export type DealMovementRunPhase = (typeof DEAL_MOVEMENT_RUN_PHASES)[number];

/** Сколько сделок в каждом статусе. */
export type DealMovementCounts = Record<DealMovementStatus, number>;

/** Ход и итог последнего прогона портала (Redis, 14 суток). */
export interface DealMovementRunStatus {
    domain: string;
    mode: DealMovementRunMode;
    /** nightly — ночью по расписанию, admin — из админки. */
    requestedBy: string;
    phase: DealMovementRunPhase;
    startedAt: string;
    updatedAt: string;
    finished: boolean;
    openTotal: number;
    evaluated: number;
    capped: boolean;
    baseline: boolean;
    firstSeen: number;
    byStatus: DealMovementCounts;
    changed: number;
    /** День сохранённого снимка; null — снимок не писался (подсчёт). */
    snapshotDay: string | null;
    warnings: string[];
    error: string | null;
}

/** Смена статуса сделки за ночь. */
export interface DealMovementChange {
    dealId: string;
    title: string;
    assignedById: number | null;
    amount: number | null;
    from: DealMovementStatus;
    to: DealMovementStatus;
    /** Причины нового статуса словами. */
    reasons: string[];
}

/** Дневной снимок ночного счёта (ais). */
export interface DealMovementSnapshot {
    /** День портала YYYY-MM-DD. */
    day: string;
    mode: DealMovementRunMode;
    calcVersion: string;
    generatedAt: string;
    openTotal: number;
    evaluated: number;
    baseline: boolean;
    firstSeen: number;
    byStatus: DealMovementCounts;
    /** Не больше тысячи смен; всего — `changesTotal`. */
    changes: DealMovementChange[];
    changesTotal: number;
    warnings: string[];
}

/** Ответ `GET admin/ai-analytics/deal-movement-status`. */
export interface DealMovementState {
    domain: string;
    enabled: boolean;
    run: DealMovementRunStatus | null;
    lastSnapshot: DealMovementSnapshot | null;
    runAvailable: boolean;
    hint: string;
}

/** Ответ `POST admin/ai-analytics/deal-movement`. */
export interface DealMovementRunResult {
    domain: string;
    dryRun: boolean;
    dispatched: boolean;
    jobId: string | null;
    reason: string | null;
}

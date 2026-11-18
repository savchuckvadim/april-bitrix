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

/**
 * Записи в ленту сделок за прогон (`AiAnalyticsDealMovementNotesDto`).
 * Нет у прогонов и снимков до 17.11.2026.
 */
export interface DealMovementNotesSummary {
    enabled: boolean;
    /** comment | log_message; null — запись выключена. */
    kind: string | null;
    /** Ручной счёт: в ленты не пишет, отложенное (`deferredLimit`) ждёт ночи. */
    heldForNight: boolean;
    planned: number;
    written: number;
    failed: number;
    /** Отложено лимитом ночи (у ручного счёта — до ночи). */
    deferredLimit: number;
    /** Отложено защитой от метаний: писали меньше трёх суток назад. */
    deferredQuiet: number;
    /** Подсказок «что сделать» в записях. */
    texts: number;
    /** Вызовов модели без годной подсказки. */
    textsFailed: number;
}

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
    /** Записи в ленту; у подсчёта — сколько записали бы. */
    notes?: DealMovementNotesSummary;
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
    /** Записана ли смена в ленту сделки этим прогоном. */
    notified?: boolean;
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
    notes?: DealMovementNotesSummary;
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

/** Чем закончилась проверка записи в ленту — как в контракте бэка. */
export type DealMovementProbePhase = 'running' | 'done' | 'refused' | 'failed';

/** «Последняя активность» сделки до и после каждой записи, ISO. */
export interface DealMovementProbeMoments {
    before: string | null;
    afterLogMessage: string | null;
    afterComment: string | null;
    logMessageAt: string | null;
    commentAt: string | null;
}

/** Итог проверки записи в ленту на одной сделке. */
export interface DealMovementProbeResult {
    domain: string;
    dealId: number;
    phase: DealMovementProbePhase;
    startedAt: string;
    finishedAt: string | null;
    moments: DealMovementProbeMoments;
    /** Сдвигает ли служебная запись последнюю активность; null — не дошли. */
    logMessageShifts: boolean | null;
    /** Сдвигает ли комментарий последнюю активность; null — не дошли. */
    commentShifts: boolean | null;
    /** Выводы словами, по-русски. */
    conclusions: string[];
    /** Отказ или сбой словами; null — проверка прошла. */
    error: string | null;
}

/** Ответ `POST admin/ai-analytics/deal-movement-probe`. */
export interface DealMovementProbeRunResult {
    domain: string;
    dealId: number;
    dispatched: boolean;
    jobId: string | null;
    reason: string | null;
}

/** Ответ `GET admin/ai-analytics/deal-movement-probe`. */
export interface DealMovementProbeStatus {
    domain: string;
    /** Проверка ждёт очереди или идёт. */
    pending: boolean;
    /** Итог последней проверки; null — не было (или истёк, 14 суток). */
    result: DealMovementProbeResult | null;
}

import type { RowSet } from '../../row-set';

/**
 * Слепок сделки. v1 — легаси-формат (читаем через parse-v1 + map-v1),
 * v2 — новый формат на code-джойнах (пишем только его).
 */

/** Результат восстановления слепка (любой версии) в доменное состояние */
export interface RestoredState {
    /** Версия исходного слепка */
    schemaVersion: 1 | 2;
    regionCode: string | null;
    contractCode: string | null;
    supplyCode: string | null;
    general: RowSet;
    alternative: RowSet[];
    templateId: number | null;
    /** Что не удалось смапить (для лога/телеметрии) */
    warnings: string[];
}

/** Новый формат слепка (schemaVersion 2) */
export interface SnapshotV2 {
    schemaVersion: 2;
    dealId: number | null;
    domain: string;
    userId: number | null;
    serviceSmartId: number | null;
    regionCode: string | null;
    contractCode: string | null;
    supplyCode: string | null;
    general: RowSet;
    alternative: RowSet[];
    templateId: number | null;
    savedAt: string;
}

export const isSnapshotV2 = (value: unknown): value is SnapshotV2 =>
    typeof value === 'object' &&
    value !== null &&
    (value as { schemaVersion?: unknown }).schemaVersion === 2;

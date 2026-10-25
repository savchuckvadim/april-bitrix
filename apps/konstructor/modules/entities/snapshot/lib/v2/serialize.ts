import { normalizeComposition } from '../../../composition';
import type { RowSet } from '../../../row-set';
import type { RestoredState, SnapshotV2 } from '../../model/types';
import { isSnapshotV2 } from '../../model/types';

/** Составы строк из записи до появления новых полей — с дефолтами */
const normalizeSet = (set: RowSet): RowSet => ({
    ...set,
    rows: set.rows.map(row =>
        row.composition ? { ...row, composition: normalizeComposition(row.composition) } : row,
    ),
});

export interface SerializeV2Input {
    state: Pick<
        RestoredState,
        | 'regionCode'
        | 'contractCode'
        | 'supplyCode'
        | 'general'
        | 'alternative'
        | 'templateId'
    >;
    dealId: number | null;
    domain: string;
    userId: number | null;
    serviceSmartId?: number | null;
    savedAt: string;
}

/** Сериализация текущего состояния в слепок v2 (только его и пишем) */
export const serializeV2 = (input: SerializeV2Input): SnapshotV2 => ({
    schemaVersion: 2,
    dealId: input.dealId,
    domain: input.domain,
    userId: input.userId,
    serviceSmartId: input.serviceSmartId ?? null,
    regionCode: input.state.regionCode,
    contractCode: input.state.contractCode,
    supplyCode: input.state.supplyCode,
    general: input.state.general,
    alternative: input.state.alternative,
    templateId: input.state.templateId,
    savedAt: input.savedAt,
});

/** Восстановление из слепка v2 */
export const restoreV2 = (snapshot: SnapshotV2): RestoredState => ({
    schemaVersion: 2,
    regionCode: snapshot.regionCode,
    contractCode: snapshot.contractCode,
    supplyCode: snapshot.supplyCode,
    general: normalizeSet(snapshot.general),
    alternative: snapshot.alternative.map(normalizeSet),
    templateId: snapshot.templateId,
    warnings: [],
});

/**
 * Слепок v2 из колонки rows записи bx_document_deals; легаси-v1 или битый
 * JSON — null (v1 разбирает parse-v1).
 */
export const parseSnapshotV2 = (rows: string | null | undefined): SnapshotV2 | null => {
    if (!rows) return null;
    try {
        const parsed = JSON.parse(rows) as unknown;
        return isSnapshotV2(parsed) ? parsed : null;
    } catch {
        return null;
    }
};

export { isSnapshotV2 };

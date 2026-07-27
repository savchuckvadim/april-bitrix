import type { RestoredState, SnapshotV2 } from '../../model/types';
import { isSnapshotV2 } from '../../model/types';

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
    general: snapshot.general,
    alternative: snapshot.alternative,
    templateId: snapshot.templateId,
    warnings: [],
});

export { isSnapshotV2 };

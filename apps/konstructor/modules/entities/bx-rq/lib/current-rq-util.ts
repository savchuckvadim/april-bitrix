import { RQ_TYPE, type RqBundle, type RqRecord } from '../model/types';

const TYPED_GROUPS = [RQ_TYPE.ORGANIZATION, RQ_TYPE.IP, RQ_TYPE.FIZ] as const;

/** Реквизит по bx_id среди всех типов. */
export const getCurrentRq = (
    bxrq: RqBundle,
    currentRqId: number,
): RqRecord | null => {
    for (const key of TYPED_GROUPS) {
        const found = getCurrentRqByType(bxrq[key]?.items ?? [], currentRqId);
        if (found) return found;
    }
    return null;
};

export const getCurrentRqByType = (
    items: RqRecord[],
    currentRqId: number,
): RqRecord | null =>
    items.find(item => Number(item.bx_id) === currentRqId) ?? null;

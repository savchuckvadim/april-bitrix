import { EVSBXRQ, EvsRq, EvsRqItem } from '../type/evs-rq-type';
import { RQ_TYPE } from '../type/input-type';

export const getCurrentRq = (
    bxrq: EVSBXRQ,
    currentRqId: number,
): EvsRqItem | null => {
    for (const key in bxrq) {
        if (
            key === RQ_TYPE.ORGANIZATION ||
            key === RQ_TYPE.IP ||
            key === RQ_TYPE.FIZ
        ) {
            const rq = bxrq[key];
            const currentRq = rq.items.find(
                item => Number(item.bx_id) === currentRqId,
            );
            if (currentRq) {
                return currentRq;
            }
        }
    }

    return null;
};

export const getCurrentRqByType = (
    bxrq: EvsRqItem[],
    currentRqId: number,
): EvsRqItem | null => {
    const currentRq = bxrq.find(item => Number(item.bx_id) === currentRqId);
    if (currentRq) {
        return currentRq;
    }

    return null;
};

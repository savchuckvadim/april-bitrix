import { getResolvedType } from '../lib/rq-util';
import { BX_ADDRESS_TYPE } from './evs-address-type';
import { RQ_TYPE, RqItem } from './input-type';

export type ResolvedRQType = Exclude<RQ_TYPE, RQ_TYPE.BUDGET | 'current'>;

export interface EvsResponse {
    rqs: EVSBXRQ;
}

export interface RQStore {
    resultCode?: number;
    message?: string;
    data?: {
        bx_id?: number;
    };
}
export interface EVSBXRQ {
    [RQ_TYPE.ORGANIZATION]: EvsRq;
    [RQ_TYPE.IP]: EvsRq;
    [RQ_TYPE.FIZ]: EvsRq;
    current: EvsRqItem;
}

export interface EvsRq {
    items: EvsRqItem[];
    default: EvsRqItem;
}

export interface EvsRqItem {
    bx_id: number | -1;
    preset_id: number;
    fields: RqItem[];
    address: AddressRq;
    bank: BankRq;
    type: RQ_TYPE;
}

export interface AddressRq {
    items: AddressRqItem[];
    current: AddressRqItem;
}

export interface AddressRqItem {
    id?: number;
    anchor_id: number;
    type_id: BX_ADDRESS_TYPE;
    name_type: 'Юридический адрес' | 'Фактический адрес' | string;
    fields: RqItem[];
}

export interface BankRq {
    items: BankRqItem[];
    current: BankRqItem;
    // bx_id: number;
    fields: RqItem[];
}

export interface BankRqItem {
    id: number;
    fields: RqItem[];
}

export const BXRQ_ENTITY_TYPE: Record<RQ_TYPE, number | undefined> = {
    [RQ_TYPE.ORGANIZATION]: 1, //id иогут отличаться в разных порталах
    [RQ_TYPE.IP]: 3,
    [RQ_TYPE.FIZ]: 6,
    [RQ_TYPE.BUDGET]: undefined, // Это значение исключается
};

// Функция для получения ID по типу
export const getEntityTypeId = (type: RQ_TYPE): number | undefined => {
    const resolvedType = getResolvedType(type); // Преобразуем, если нужно
    return BXRQ_ENTITY_TYPE[resolvedType];
};

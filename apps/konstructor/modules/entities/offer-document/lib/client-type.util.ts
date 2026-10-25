// файл констант, не баррель: баррель bx-rq тянет UI (а с ним react-pdf в тестах)
import { RQ_TYPE } from '../../bx-rq/model/types';
import type { OfferClientType } from '../../document-payload';

/** Тип клиента сделки (pbx `op_client_type` → RQ_TYPE) в значении payload документов. */
const CLIENT_TYPE_OF: Record<RQ_TYPE, OfferClientType> = {
    [RQ_TYPE.ORGANIZATION]: 'org',
    [RQ_TYPE.BUDGET]: 'org_state',
    [RQ_TYPE.IP]: 'ip',
    [RQ_TYPE.FIZ]: 'fiz',
};

export const toOfferClientType = (type: RQ_TYPE | null | undefined): OfferClientType =>
    CLIENT_TYPE_OF[type ?? RQ_TYPE.ORGANIZATION];

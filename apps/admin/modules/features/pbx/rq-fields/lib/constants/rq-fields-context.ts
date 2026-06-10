import type { PbxFieldEntityType } from '@/modules/entities/portal-bitrix/bitrix-fields';
import type { EntityFieldsContext } from '../../model/types';

export const RQ_ENTITY_TYPE = 'rq' as PbxFieldEntityType;

export const createRqFieldsContext = (
    portalId: number,
    rqId: number,
): EntityFieldsContext => ({
    portalId,
    entityId: rqId,
    entityType: RQ_ENTITY_TYPE,
    parentType: 'rq',
});

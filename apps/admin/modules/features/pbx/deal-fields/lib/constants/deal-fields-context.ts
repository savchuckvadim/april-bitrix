import type { PbxFieldEntityType } from '@/modules/entities/portal-bitrix/bitrix-fields';
import type { EntityFieldsContext } from '../../model/types';

export const DEAL_ENTITY_TYPE = 'deal' as PbxFieldEntityType;

export const createDealFieldsContext = (
    portalId: number,
    dealId: number
): EntityFieldsContext => ({
    portalId,
    entityId: dealId,
    entityType: DEAL_ENTITY_TYPE,
    parentType: 'deal',
});


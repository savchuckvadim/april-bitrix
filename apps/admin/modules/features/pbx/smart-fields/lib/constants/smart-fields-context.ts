import type { PbxFieldEntityType } from '@/modules/entities/portal-bitrix/bitrix-fields';
import type { EntityFieldsContext } from '../../model/types';

export const SMART_ENTITY_TYPE = 'smart' as PbxFieldEntityType;

export const createSmartFieldsContext = (
    portalId: number,
    smartId: number
): EntityFieldsContext => ({
    portalId,
    entityId: smartId,
    entityType: SMART_ENTITY_TYPE,
    parentType: 'smart',
});

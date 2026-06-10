import type { PbxFieldEntityType } from '@/modules/entities/portal-bitrix/bitrix-fields';

export type EntityFieldsContext = {
    portalId: number;
    entityId: number;
    entityType: PbxFieldEntityType;
    parentType: string;
};

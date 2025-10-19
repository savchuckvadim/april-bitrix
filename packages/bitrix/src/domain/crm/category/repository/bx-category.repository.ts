import { BitrixBaseApi } from '../../../../core';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../../core/domain/consts/bitrix-entities.enum';
import { BitrixOwnerTypeId } from '../../../../domain/enums/bitrix-constants.enum';

export class BxCategoryRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async get(id: number | string, entityTypeId: BitrixOwnerTypeId | string) {
        return this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.CATEGORY,
            EBxMethod.GET,
            { id, entityTypeId },
        );
    }

    async getList(entityTypeId: BitrixOwnerTypeId | string) {
        return this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.CATEGORY,
            EBxMethod.LIST,
            { entityTypeId },
        );
    }
}

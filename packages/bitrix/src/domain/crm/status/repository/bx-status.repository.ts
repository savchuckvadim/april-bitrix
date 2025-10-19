import { BitrixBaseApi } from '../../../../core';
import { EBXEntity } from '../../../../core/domain/consts/bitrix-entities.enum';

import {
    EBxMethod,
    EBxNamespace,
} from '../../../../core/domain/consts/bitrix-api.enum';
import { IBXStatus } from '../interface/bx-status.interface';

export class BxStatusRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async getList(filter: Partial<IBXStatus>) {
        return this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.STATUS,
            EBxMethod.LIST,
            { filter },
        );
    }
}

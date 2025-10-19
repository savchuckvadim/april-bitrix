import { BitrixBaseApi } from '../../../core';
import { IBXProduct } from '../interface/bx-product.interface';
import { EBXEntity } from '../../../core/domain/consts/bitrix-entities.enum';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../core/domain/consts/bitrix-api.enum';

export class BxProductRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}
    async get(id: number | string, select?: string[]) {
        return await this.bxApi.callType(
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.GET,
            { id, select },
        );
    }
    getBatch(cmdCode: string, id: number | string, select?: string[]) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.GET,
            { id, select },
        );
    }

    async getList(filter: Partial<IBXProduct>, select?: string[]) {
        return await this.bxApi.callType(
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.LIST,
            { filter, select, start: -1 },
        );
    }

    getListBatch(
        cmdCode: string,
        filter: Partial<IBXProduct>,
        select?: string[],
    ) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CATALOG,
            EBXEntity.PRODUCT,
            EBxMethod.LIST,
            { filter, select, start: -1 },
        );
    }
}

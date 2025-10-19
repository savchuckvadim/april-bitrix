
import { BitrixBaseApi } from '../../../../core';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../../core/domain/consts/bitrix-entities.enum';
import { IBXItem } from '../interface/item.interface';
import { BitrixOwnerTypeId } from '../../../enums/bitrix-constants.enum';
import { IBitrixResponse } from '../../../../core/interface/bitrix-api.intterface';

export class BxItemRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async update(
        id: number | string,
        entityTypeId: BitrixOwnerTypeId | string,
        data: Partial<IBXItem>,
    ) {
        return await this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.UPDATE,
            { id: id, entityTypeId, fields: data },
        );
    }

    async updateBtch(
        cmdCode: string,
        id: number | string,
        entityTypeId: BitrixOwnerTypeId | string,
        data: { [key: string]: any },
    ) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.UPDATE,
            { id: id, entityTypeId, fields: data },
        );
    }

    async list(
        entityTypeId: string,
        filter?: Partial<IBXItem>,
        select?: string[],
    ) {
        return await this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.LIST,
            { entityTypeId, filter, select },
        );
    }
    listBtch(
        cmdCode: string,
        entityTypeId: string,
        filter?: Partial<IBXItem>,
        select?: string[],
    ) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.LIST,
            { entityTypeId, filter, select },
        );
    }
    async get(id: number | string, entityTypeId: string, select?: string[]) {
        return await this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.GET,
            { id, entityTypeId, select },
        );
    }
    getBtch(
        cmdCode: string,
        id: number | string,
        entityTypeId: string,
        select?: string[],
    ) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.GET,
            { id, entityTypeId, select },
        );
    }

    async add(entityTypeId: string, data: Partial<IBXItem>) {
        return await this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.ADD,
            { entityTypeId, fields: data },
        );
    }
    addBtch(cmdCode: string, entityTypeId: string, data: Partial<IBXItem>) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.ADD,
            { entityTypeId, fields: data },
        );
    }
    async delete(
        id: number | string,
        entityTypeId: string,
    ): Promise<IBitrixResponse<boolean>> {
        return await this.bxApi.callType(
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.DELETE,
            { id, entityTypeId },
        );
    }
    deleteBtch(
        cmdCode: string,
        id: number | string,
        entityTypeId: string,
    ): void {
        this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.CRM,
            EBXEntity.ITEM,
            EBxMethod.DELETE,
            { id, entityTypeId },
        );
    }
}

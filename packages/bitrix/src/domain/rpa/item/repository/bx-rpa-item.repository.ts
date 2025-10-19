import { BitrixBaseApi } from '../../../../core/base/bitrix-base-api';
import {
    AddRpaItemDto,
    GetRpaItemDto,
    ListRpaItemDto,
    UpdateRpaItemDto,
} from '../dto/rpa-item.dto';
import { EBXEntity } from '../../../../core/domain/consts/bitrix-entities.enum';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../../core/domain/consts/bitrix-api.enum';

export class BxRpaItemRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}
    async getRpaItem(dto: GetRpaItemDto) {
        return this.bxApi.callType(
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.GET,
            dto,
        );
    }
    getRpaItemBtch(cmdCode: string, dto: GetRpaItemDto) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.GET,
            dto,
        );
    }

    async addRpaItem(dto: AddRpaItemDto) {
        return this.bxApi.callType(
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.ADD,
            dto,
        );
    }

    addRpaItemBtch(cmdCode: string, dto: AddRpaItemDto) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.ADD,
            dto,
        );
    }

    async updateRpaItem(dto: UpdateRpaItemDto) {
        return this.bxApi.callType(
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.UPDATE,
            dto,
        );
    }

    updateRpaItemBtch(cmdCode: string, dto: UpdateRpaItemDto) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.UPDATE,
            dto,
        );
    }
    async listRpaItem(dto: ListRpaItemDto) {
        return this.bxApi.callType(
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.LIST,
            dto,
        );
    }
    listRpaItemBtch(cmdCode: string, dto: ListRpaItemDto) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.RPA,
            EBXEntity.ITEM,
            EBxMethod.LIST,
            dto,
        );
    }
}

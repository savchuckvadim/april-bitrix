import { BitrixBaseApi } from '../../../../core/base/bitrix-base-api';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../../core/domain/consts/bitrix-entities.enum';
import {
    IBXChecklistItemAddRequest,
    IBXChecklistItemGetListRequest,
} from '../interface/bx-checklist-item.interface';

/**
 * `task.checklistitem.*` — REST-неймспейс `task` (единственное число),
 * порт back/libs/bitrix/src/domain/tasks/checklist-item.
 */
export class BxChecklistItemRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async add(data: IBXChecklistItemAddRequest) {
        return await this.bxApi.callType(
            EBxNamespace.TASK,
            EBXEntity.CHECKLIST_ITEM,
            EBxMethod.ADD,
            data,
        );
    }

    addBtch(cmdCode: string, data: IBXChecklistItemAddRequest) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.TASK,
            EBXEntity.CHECKLIST_ITEM,
            EBxMethod.ADD,
            data,
        );
    }

    /** `task.checklistitem.getlist` — пункты чек-листов задачи. */
    async getList(data: IBXChecklistItemGetListRequest) {
        return await this.bxApi.callType(
            EBxNamespace.TASK,
            EBXEntity.CHECKLIST_ITEM,
            EBxMethod.GET_LIST,
            data,
        );
    }

    getListBtch(cmdCode: string, data: IBXChecklistItemGetListRequest) {
        return this.bxApi.addCmdBatchType(
            cmdCode,
            EBxNamespace.TASK,
            EBXEntity.CHECKLIST_ITEM,
            EBxMethod.GET_LIST,
            data,
        );
    }
}

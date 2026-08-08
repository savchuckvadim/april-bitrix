import { BitrixBaseApi } from '../../../core/base/bitrix-base-api';
import { EBxNamespace } from '../../../core';
import { EBxMethod } from '../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../core/domain/consts/bitrix-entities.enum';
import {
    BxListItemAddRequestType,
    BxListItemGetRequestType,
} from '../schema/bx-list-item.schema';

/**
 * `lists.element.*` — элементы универсальных списков. Репозиторий сам
 * подставляет `IBLOCK_TYPE_ID: 'lists'` (порт back-эталона
 * libs/bitrix/src/domain/list-item).
 */
export class BxListItemRepository {
    constructor(private readonly bitrixService: BitrixBaseApi) {}

    async get(dto: Omit<BxListItemGetRequestType, 'IBLOCK_TYPE_ID'>) {
        return await this.bitrixService.callType(
            EBxNamespace.LISTS,
            EBXEntity.ELEMENT,
            EBxMethod.GET,
            { IBLOCK_TYPE_ID: 'lists', ...dto },
        );
    }

    getBtch(
        cmdCode: string,
        dto: Omit<BxListItemGetRequestType, 'IBLOCK_TYPE_ID'>,
    ) {
        return this.bitrixService.addCmdBatchType(
            cmdCode,
            EBxNamespace.LISTS,
            EBXEntity.ELEMENT,
            EBxMethod.GET,
            { IBLOCK_TYPE_ID: 'lists', ...dto },
        );
    }

    async add(dto: Omit<BxListItemAddRequestType, 'IBLOCK_TYPE_ID'>) {
        return await this.bitrixService.callType(
            EBxNamespace.LISTS,
            EBXEntity.ELEMENT,
            EBxMethod.ADD,
            { IBLOCK_TYPE_ID: 'lists', ...dto },
        );
    }

    addBtch(
        cmdCode: string,
        dto: Omit<BxListItemAddRequestType, 'IBLOCK_TYPE_ID'>,
    ) {
        return this.bitrixService.addCmdBatchType(
            cmdCode,
            EBxNamespace.LISTS,
            EBXEntity.ELEMENT,
            EBxMethod.ADD,
            { IBLOCK_TYPE_ID: 'lists', ...dto },
        );
    }
}

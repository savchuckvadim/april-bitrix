import { BitrixBaseApi } from '../../../core/base/bitrix-base-api';
import { BxListItemRepository } from '../repository/bx-list-item.repository';
import {
    BxListItemAddRequestType,
    BxListItemGetRequestType,
} from '../schema/bx-list-item.schema';

export class BxListItemBatchService {
    private repo!: BxListItemRepository;

    clone(api: BitrixBaseApi): BxListItemBatchService {
        const instance = new BxListItemBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxListItemRepository(api);
    }

    get(
        cmdCode: string,
        dto: Omit<BxListItemGetRequestType, 'IBLOCK_TYPE_ID'>,
    ) {
        return this.repo.getBtch(cmdCode, dto);
    }

    add(
        cmdCode: string,
        dto: Omit<BxListItemAddRequestType, 'IBLOCK_TYPE_ID'>,
    ) {
        return this.repo.addBtch(cmdCode, dto);
    }
}

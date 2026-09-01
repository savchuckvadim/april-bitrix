import { BitrixBaseApi } from '../../../../core/base/bitrix-base-api';
import {
    IBXChecklistItemAddRequest,
    IBXChecklistItemGetListRequest,
} from '../interface/bx-checklist-item.interface';
import { BxChecklistItemRepository } from '../repository/bx-checklist-item.repository';

export class BxChecklistItemBatchService {
    private repo!: BxChecklistItemRepository;

    clone(api: BitrixBaseApi): BxChecklistItemBatchService {
        const instance = new BxChecklistItemBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxChecklistItemRepository(api);
    }

    add(cmdCode: string, data: IBXChecklistItemAddRequest) {
        return this.repo.addBtch(cmdCode, data);
    }

    getList(cmdCode: string, data: IBXChecklistItemGetListRequest) {
        return this.repo.getListBtch(cmdCode, data);
    }
}

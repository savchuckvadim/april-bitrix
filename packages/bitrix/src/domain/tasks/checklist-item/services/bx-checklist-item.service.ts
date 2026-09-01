import { BitrixBaseApi } from '../../../../core/base/bitrix-base-api';
import {
    IBXChecklistItemAddRequest,
    IBXChecklistItemGetListRequest,
} from '../interface/bx-checklist-item.interface';
import { BxChecklistItemRepository } from '../repository/bx-checklist-item.repository';

export class BxChecklistItemService {
    private repo!: BxChecklistItemRepository;

    clone(api: BitrixBaseApi): BxChecklistItemService {
        const instance = new BxChecklistItemService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxChecklistItemRepository(api);
    }

    add(data: IBXChecklistItemAddRequest) {
        return this.repo.add(data);
    }

    /** Пункты чек-листов задачи (`task.checklistitem.getlist`). */
    getList(data: IBXChecklistItemGetListRequest) {
        return this.repo.getList(data);
    }
}

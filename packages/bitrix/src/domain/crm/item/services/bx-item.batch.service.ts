import { BitrixBaseApi } from '../../../../core';
import { BxItemRepository } from '../repository/bx-item.repository';
import { IBXItem } from '../interface/item.interface';
import { BitrixOwnerTypeId } from '../../../enums/bitrix-constants.enum';

export class BxItemBatchService {
    private repo!: BxItemRepository;

    clone(api: BitrixBaseApi): BxItemBatchService {
        const instance = new BxItemBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxItemRepository(api);
    }

    update(
        cmdCode: string,
        id: number | string,
        entityTypeId: BitrixOwnerTypeId.DEAL,
        data: Partial<IBXItem>,
    ) {
        return this.repo.updateBtch(cmdCode, id, entityTypeId, data);
    }

    list(
        cmdCode: string,
        entityTypeId: string,
        filter?: Partial<IBXItem>,
        select?: string[],
    ) {
        return this.repo.listBtch(cmdCode, entityTypeId, filter, select);
    }

    get(
        cmdCode: string,
        id: number | string,
        entityTypeId: string,
        select?: string[],
    ) {
        return this.repo.getBtch(cmdCode, id, entityTypeId, select);
    }

    add(cmdCode: string, entityTypeId: string, data: Partial<IBXItem>) {
        return this.repo.addBtch(cmdCode, entityTypeId, data);
    }
}

import { BxDealRepository } from '../repository/bx-deal.repository';
import { BitrixBaseApi } from '../../../../core';
import { IBXDeal } from '../interface/bx-deal.interface';

export class BxDealBatchService {
    private repo!: BxDealRepository;

    clone(api: BitrixBaseApi): BxDealBatchService {
        const instance = new BxDealBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxDealRepository(api);
    }
    get(cmdCode: string, dealId: number | string) {
        return this.repo.getBtch(cmdCode, dealId);
    }

    getList(
        cmdCode: string,
        filter: Partial<IBXDeal>,
        select?: string[],
        order?: { [key in keyof IBXDeal]?: 'asc' | 'desc' | 'ASC' | 'DESC' },
    ) {
        return this.repo.getListBtch(cmdCode, filter, select, order);
    }

    set(cmdCode: string, data: Partial<IBXDeal>) {
        return this.repo.setBtch(cmdCode, data);
    }
    update(cmdCode: string, dealId: number | string, data: Partial<IBXDeal>) {
        return this.repo.updateBtch(cmdCode, dealId, data);
    }
    getField(cmdCode: string, id: number | string) {
        return this.repo.getFieldBtch(cmdCode, id);
    }
    contactItemsSet(
        cmdCode: string,
        dealId: number | string,
        contactIds: number[] | string[],
    ) {
        return this.repo.contactItemsSetBtch(cmdCode, dealId, contactIds);
    }
}

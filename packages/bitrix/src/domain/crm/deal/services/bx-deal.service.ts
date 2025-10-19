import { BxDealRepository } from '../repository/bx-deal.repository';
import { BitrixBaseApi } from '../../../../core';
import { IBXDeal } from '../interface/bx-deal.interface';
import { IBXField } from '../../fields/bx-field.interface';

export class BxDealService {
    private repo!: BxDealRepository;

    clone(api: BitrixBaseApi): BxDealService {
        const instance = new BxDealService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxDealRepository(api);
    }

    async get(dealId: number, select?: string[]): Promise<IBXDeal | null> {
        return (await this.repo.get(dealId, select))?.result as IBXDeal | null;
    }
    getList(
        filter: Partial<IBXDeal>,
        select?: string[],
        order?: { [key in keyof IBXDeal]?: 'asc' | 'desc' | 'ASC' | 'DESC' },
    ) {
        return this.repo.getList(filter, select, order);
    }
    async set(data: Partial<IBXDeal>) {
        return (await this.repo.set(data))?.result as number | null;
    }
    async update(dealId: number | string, data: Partial<IBXDeal>) {
        return (await this.repo.update(dealId, data))?.result as number | null;
    }
    async getFieldsList(filter: { [key: string]: any }, select?: string[]) {
        return (await this.repo.getFieldList(filter, select))?.result as
            | IBXField[]
            | null;
    }
    async getField(id: number | string) {
        return (await this.repo.getField(id))?.result as IBXField | null;
    }
    async contactItemsSet(
        dealId: number | string,
        contactIds: number[] | string[],
    ) {
        return (await this.repo.contactItemsSet(dealId, contactIds))?.result as
            | number
            | null;
    }
}

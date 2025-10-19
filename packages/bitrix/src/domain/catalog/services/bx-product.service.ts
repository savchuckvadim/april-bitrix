import { BitrixBaseApi } from '../../../core';
import { BxProductRepository } from '../repository/bx-product.repository';
import { IBXProduct } from '../interface/bx-product.interface';

export class BxProductService {
    private repo!: BxProductRepository;

    clone(api: BitrixBaseApi): BxProductService {
        const instance = new BxProductService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxProductRepository(api);
    }
    async get(
        id: number | string,
        select?: string[],
    ): Promise<IBXProduct | null> {
        return (await this.repo.get(id, select as string[])).result.product;
    }

    async getList(
        filter: Partial<IBXProduct>,
        select: string[],
    ): Promise<IBXProduct[] | null> {
        return (await this.repo.getList(filter, select as string[])).result
            .products;
    }
}

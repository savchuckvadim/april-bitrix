import { BitrixBaseApi } from '../../../core';
import { BxProductRepository } from '../repository/bx-product.repository';
import { IBXProduct } from '../interface/bx-product.interface';

export class BxProductBatchService {
    private repo!: BxProductRepository;

    clone(api: BitrixBaseApi): BxProductBatchService {
        const instance = new BxProductBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxProductRepository(api);
    }

    get(cmdCode: string, id: number | string, select?: string[]) {
        return this.repo.getBatch(cmdCode, id, select);
    }
    getList(cmdCode: string, filter: Partial<IBXProduct>, select?: string[]) {
        return this.repo.getListBatch(cmdCode, filter, select);
    }
}

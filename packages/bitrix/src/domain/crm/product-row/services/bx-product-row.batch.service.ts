import { BxProductRowRepository } from '../repository/bx-product-row.repository';
import { BitrixBaseApi } from '../../../../core';
import {
    IBXProductRow,
    IBXProductRowRow,
} from '../interface/bx-product-row.interface';

export class BxProductRowBatchService {
    private repo!: BxProductRowRepository;

    clone(api: BitrixBaseApi): BxProductRowBatchService {
        const instance = new BxProductRowBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxProductRowRepository(api);
    }

    set(cmdCode: string, data: IBXProductRow) {
        return this.repo.setBtch(cmdCode, data);
    }
    add(cmdCode: string, data: IBXProductRowRow) {
        return this.repo.addBtch(cmdCode, data);
    }
}

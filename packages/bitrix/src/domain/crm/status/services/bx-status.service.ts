import { BxStatusRepository } from '../repository/bx-status.repository';
import { BitrixBaseApi } from '../../../../core';
import { IBXStatus } from '../interface/bx-status.interface';

export class BxStatusService {
    private repo!: BxStatusRepository;

    clone(api: BitrixBaseApi): BxStatusService {
        const instance = new BxStatusService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxStatusRepository(api);
    }

    getList(filter: Partial<IBXStatus>) {
        return this.repo.getList(filter);
    }
}

import { BitrixBaseApi } from '../../../core';
import { BxActivityConfigurableRepository } from '../repositories/bx-activity-configurable.repository';
import { BXActivityConfigurableAddRequestDto } from '../dto/bx-activity-configurable.dto';


export class BxActivityConfigurableBatchService {
    private repo!: BxActivityConfigurableRepository;

    clone(api: BitrixBaseApi): BxActivityConfigurableBatchService {
        const instance = new BxActivityConfigurableBatchService();
        instance.init(api);
        return instance;
    }
    init(api: BitrixBaseApi) {
        this.repo = new BxActivityConfigurableRepository(api);
    }


    async create(cmdCode: string, dto: BXActivityConfigurableAddRequestDto) {
        return this.repo.createBtch(cmdCode, dto);
    }

}

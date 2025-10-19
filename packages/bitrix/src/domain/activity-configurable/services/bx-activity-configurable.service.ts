import { BxActivityConfigurableRepository } from '../repositories/bx-activity-configurable.repository';
import { BitrixBaseApi } from '../../../core';
import { BXActivityConfigurableAddRequestDto } from '../dto/bx-activity-configurable.dto';

export class BxActivityConfigurableService {
    private repo!: BxActivityConfigurableRepository;

    clone(api: BitrixBaseApi): BxActivityConfigurableService {
        const instance = new BxActivityConfigurableService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxActivityConfigurableRepository(api);
    }

    async createActivity(dto: BXActivityConfigurableAddRequestDto) {
        return await this.repo.create(dto);
    }


}

import { BitrixBaseApi } from '../../../../core/base/bitrix-base-api';
import { IBxRpaStage } from '../interface/bx-rpa-stage.interface';
import { BxRpaStageRepository } from '../repository/bx-rpa-stage.repository';

export class BxRpaStageService {
    private repo!: BxRpaStageRepository;

    public clone(api: BitrixBaseApi): BxRpaStageService {
        const instance = new BxRpaStageService();
        instance.init(api);
        return instance;
    }

    public init(api: BitrixBaseApi) {
        this.repo = new BxRpaStageRepository(api);
    }

    /** Стадии процесса; ответ Битрикса — { stages: [...] }, отдаём список. */
    public async listForType(typeId: number | string): Promise<IBxRpaStage[]> {
        const response = await this.repo.listForType(typeId);
        return response?.stages ?? [];
    }
}

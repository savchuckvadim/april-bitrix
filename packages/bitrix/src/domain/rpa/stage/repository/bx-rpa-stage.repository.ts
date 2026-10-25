import { BitrixBaseApi } from '../../../../core/base/bitrix-base-api';
import { IBxRpaStageListResponse } from '../interface/bx-rpa-stage.interface';

/** Зеркало back/libs/bitrix rpa/stage: только чтение стадий. */
export class BxRpaStageRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async listForType(typeId: number | string): Promise<IBxRpaStageListResponse | null> {
        return this.bxApi.call<IBxRpaStageListResponse>('rpa.stage.listForType', { typeId });
    }
}

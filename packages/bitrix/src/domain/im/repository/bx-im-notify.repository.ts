import { BitrixBaseApi } from '../../../core/base/bitrix-base-api';
import {
    EBxMethod,
    EBxNamespace,
} from '../../../core/domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../../core/domain/consts/bitrix-entities.enum';
import { IBXImNotifySystemAdd } from '../interface/bx-im-notify.interface';

/**
 * im.notify.system.* — системные уведомления пользователям портала
 * (колокольчик). Batch-варианта нет сознательно (как в back-эталоне):
 * уведомления шлются штучно, батчить нечего.
 */
export class BxImNotifyRepository {
    constructor(private readonly bxApi: BitrixBaseApi) {}

    async systemAdd(data: IBXImNotifySystemAdd) {
        return await this.bxApi.callType(
            EBxNamespace.IM,
            EBXEntity.NOTIFY_SYSTEM,
            EBxMethod.ADD,
            data,
        );
    }
}

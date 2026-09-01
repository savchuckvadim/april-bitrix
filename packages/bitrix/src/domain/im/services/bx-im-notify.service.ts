import { BitrixBaseApi } from '../../../core/base/bitrix-base-api';
import { IBXImNotifySystemAdd } from '../interface/bx-im-notify.interface';
import { BxImNotifyRepository } from '../repository/bx-im-notify.repository';

/**
 * Системные уведомления портала (im.notify.system.add): алерты о переносе
 * задач, служебные сообщения пользователям.
 */
export class BxImNotifyService {
    private repo!: BxImNotifyRepository;

    clone(api: BitrixBaseApi): BxImNotifyService {
        const instance = new BxImNotifyService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxImNotifyRepository(api);
    }

    systemAdd(data: IBXImNotifySystemAdd) {
        return this.repo.systemAdd(data);
    }
}

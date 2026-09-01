/**
 * Домен im (заход А4): im.notify.system.add — одиночный call, batch-варианта
 * нет сознательно (уведомления шлются штучно).
 */
import { describe, expect, it } from 'vitest';
import { BxImNotifyService } from '../services/bx-im-notify.service';
import { createFakeBxApi } from '../../__tests__/fake-bx-api';

describe('BxImNotifyService', () => {
    it('systemAdd шлёт im.notify.system.add с payload как есть', async () => {
        const fake = createFakeBxApi({ result: 12345 });
        const service = new BxImNotifyService();
        service.init(fake.api);

        const data = {
            USER_ID: 5,
            MESSAGE: 'Звонок перенесён',
            TAG: 'EVFLOW_TRANSFER_11',
        };
        const response = await service.systemAdd(data);

        expect(fake.calls).toEqual([
            {
                kind: 'call',
                namespace: 'im',
                entity: 'notify.system',
                method: 'add',
                data,
            },
        ]);
        // ответ метода — id уведомления либо false, в конверте callType
        expect(response).toEqual({ result: 12345 });
    });
});

/**
 * crm.deal.contact.add — добавить один контакт к сделке, не перезаписывая
 * остальных (в отличие от contact.items.set). Повторная привязка — false.
 */
import { describe, expect, it } from 'vitest';
import { BxDealService } from '../services/bx-deal.service';
import { createFakeBxApi } from '../../../__tests__/fake-bx-api';

describe('BxDealService.contactAdd', () => {
    it('шлёт crm.deal.contact.add с CONTACT_ID в fields', async () => {
        const fake = createFakeBxApi({ result: true });
        const service = new BxDealService();
        service.init(fake.api);

        await expect(service.contactAdd(28073, 267563)).resolves.toBe(true);
        expect(fake.calls).toEqual([
            {
                kind: 'call',
                namespace: 'crm',
                entity: 'deal',
                method: 'contact.add',
                data: { id: 28073, fields: { CONTACT_ID: 267563 } },
            },
        ]);
    });

    it('контакт уже был в сделке — false', async () => {
        const fake = createFakeBxApi({ result: false });
        const service = new BxDealService();
        service.init(fake.api);

        await expect(service.contactAdd(1, 2)).resolves.toBe(false);
    });
});

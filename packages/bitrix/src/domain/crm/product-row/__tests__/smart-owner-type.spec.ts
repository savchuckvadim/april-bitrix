/**
 * Код владельца товарных строк для элемента смарт-процесса: `T` и
 * шестнадцатеричный id типа. Коды сделки, лида, компании и контакта лежат в
 * BitrixOwnerType; набор строк в смарт пишется тем же методом `set`.
 */
import { describe, expect, it } from 'vitest';
import { createFakeBxApi } from '../../../__tests__/fake-bx-api';
import { BitrixOwnerType } from '../../../enums/bitrix-constants.enum';
import type { IBXProductRow } from '../interface/bx-product-row.interface';
import { buildSmartOwnerType } from '../lib/smart-owner-type.util';
import { BxProductRowService } from '../services/bx-product-row.service';

describe('buildSmartOwnerType', () => {
    it.each([
        { entityTypeId: 128, expected: 'T80' },
        { entityTypeId: 140, expected: 'T8c' },
        { entityTypeId: 1038, expected: 'T40e' },
        { entityTypeId: 1048, expected: 'T418' },
        { entityTypeId: 5, expected: 'T5' },
    ])('тип $entityTypeId даёт код $expected, шестнадцатеричная запись строчными', ({ entityTypeId, expected }) => {
        expect(buildSmartOwnerType(entityTypeId)).toBe(expected);
    });

    it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
        'id типа %s не годится: код не строится',
        entityTypeId => {
            expect(() => buildSmartOwnerType(entityTypeId)).toThrow(RangeError);
        },
    );
});

describe('BxProductRowService.set для элемента смарта', () => {
    it('шлёт crm.item.productrow.set с кодом владельца смарта и id элемента', async () => {
        const fake = createFakeBxApi({ result: { productRows: [] } });
        const service = new BxProductRowService();
        service.init(fake.api);
        const request: IBXProductRow = {
            ownerType: buildSmartOwnerType(1038),
            ownerId: 77,
            productRows: [{ productName: 'Комплект', price: 100, quantity: 2, sort: 0 }],
        };

        await service.set(request);

        expect(fake.calls).toEqual([
            {
                kind: 'call',
                namespace: 'crm.item',
                entity: 'productrow',
                method: 'set',
                data: request,
            },
        ]);
    });

    it('коды сделки по-прежнему берутся из BitrixOwnerType', async () => {
        const fake = createFakeBxApi({ result: { productRows: [] } });
        const service = new BxProductRowService();
        service.init(fake.api);

        await service.set({ ownerType: BitrixOwnerType.DEAL, ownerId: 5, productRows: [] });

        expect(fake.calls[0]?.data).toEqual({ ownerType: 'D', ownerId: 5, productRows: [] });
    });
});

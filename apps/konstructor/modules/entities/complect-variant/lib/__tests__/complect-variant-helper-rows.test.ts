import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IBXProductRow } from '@bitrix/domain/crm/product-row/interface/bx-product-row.interface';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { buildGarantRow, buildProductRows, createSet, upsertRow } from '../../../row-set';
import { ComplectVariantHelper } from '../api/complect-variant-helper';

/**
 * Запись товарных строк в элемент смарта варианта: точная форма запроса
 * `crm.item.productrow.set`. Сеть и Битрикс подменены, проверяется запрос.
 */
const mocks = vi.hoisted(() => ({
    set: vi.fn<(request: IBXProductRow) => Promise<{ result: { productRows: IBXProductRow[] } } | null>>(),
}));

vi.mock('@bitrix/bitrix', () => ({
    Bitrix: { getService: () => ({ productRow: { set: mocks.set } }) },
}));
vi.mock('@workspace/nest-konstructor-api', async importOriginal => ({
    ...(await importOriginal<typeof import('@workspace/nest-konstructor-api')>()),
    getKonstructorDeal: () => ({}),
}));
vi.mock('../../../snapshot/lib/api/inner-deal-find-helper', () => ({ findInnerDeal: vi.fn() }));

const catalog = catalogFromOldInit(oldInit);
const rowOf = (key: string, role: 'main' | 'additional', complectCode: string) =>
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key,
        setId: 'general',
        role,
        complectCode,
        supplyCode: 'internet_5',
        contractCode: 'abonYear',
    })!;
const general = upsertRow(
    upsertRow(createSet('general', 'general'), rowOf('r1', 'main', 'buh')),
    rowOf('r2', 'additional', 'expert'),
);

const ENTITY_TYPE_ID = 1038;
const VARIANT_ID = 77;

describe('ComplectVariantHelper.writeProductRows', () => {
    beforeEach(() => {
        mocks.set.mockReset();
        mocks.set.mockResolvedValue({ result: { productRows: [] } });
    });

    it('шлёт productRow.set: владелец T40e, id элемента варианта, строки набора с константами', async () => {
        const rows = buildProductRows(general, catalog);

        await new ComplectVariantHelper().writeProductRows(ENTITY_TYPE_ID, VARIANT_ID, rows);

        expect(mocks.set).toHaveBeenCalledTimes(1);
        const request = mocks.set.mock.calls[0]?.[0];
        expect(request?.ownerType).toBe('T40e');
        expect(request?.ownerId).toBe(VARIANT_ID);
        expect(request?.productRows).toHaveLength(2);
        expect(request?.productRows).toEqual(
            rows.map((row, index) => ({
                productName: row.productName,
                price: row.price,
                quantity: row.quantity,
                priceNetto: row.priceNetto,
                discountSum: row.discountSum,
                discountTypeId: 1,
                customized: 'Y',
                supply: row.supply,
                measureCode: String(row.measureCode),
                measureId: row.measureId,
                sort: index,
            })),
        );
        // у строк набора есть и код, и внутренний id единицы: оба доходят до Битрикса
        expect(rows.every(row => row.measureCode !== undefined && row.measureId !== undefined)).toBe(true);
    });

    it('цены строк те же, что считает buildProductRows: цена и цена до скидки переходят без пересчёта', async () => {
        const rows = buildProductRows(general, catalog);

        await new ComplectVariantHelper().writeProductRows(ENTITY_TYPE_ID, VARIANT_ID, rows);

        const written = mocks.set.mock.calls[0]?.[0].productRows ?? [];
        expect(written.map(row => row.price)).toEqual(rows.map(row => row.price));
        expect(written.map(row => row.priceNetto)).toEqual(rows.map(row => row.priceNetto));
        expect(written.every(row => (row.price ?? 0) > 0)).toBe(true);
    });

    it('Битрикс не вернул результат: запись считается отказом', async () => {
        mocks.set.mockResolvedValue(null);

        await expect(
            new ComplectVariantHelper().writeProductRows(ENTITY_TYPE_ID, VARIANT_ID, buildProductRows(general, catalog)),
        ).rejects.toThrow('Битрикс не подтвердил запись товарных строк');
    });

    it('отказ Битрикса уходит вызывающему как есть', async () => {
        mocks.set.mockRejectedValue(new Error('Нет прав на изменение элемента'));

        await expect(
            new ComplectVariantHelper().writeProductRows(ENTITY_TYPE_ID, VARIANT_ID, []),
        ).rejects.toThrow('Нет прав на изменение элемента');
    });
});

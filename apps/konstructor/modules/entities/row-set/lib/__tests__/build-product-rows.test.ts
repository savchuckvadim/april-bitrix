import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { buildGarantRow } from '../row';
import { applyCommercialEdit } from '../price';
import { createSet, upsertRow } from '../set';
import { buildProductRows, toBitrixProductRow } from '../bitrix/build-product-rows.util';

/**
 * productRows для сделки Bitrix (этап 7 deal-send): форма — легаси
 * build-deal-send-request + решение владельца 4 (productId = bitrixItemId
 * договора); только general; свёрнутый сет — одна total-строка.
 */
const catalog = catalogFromOldInit(oldInit);
const garant = (key: string, over: Partial<Parameters<typeof buildGarantRow>[0]> = {}) =>
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key,
        setId: 'general',
        role: key === 'r1' ? 'main' : 'additional',
        complectCode: 'buh',
        supplyCode: 'internet_1',
        contractCode: 'abonYear',
        ...over,
    })!;

describe('toBitrixProductRow', () => {
    it('имя + вид поставки, priceNetto/price/discountSum, мера Bitrix, productId договора', () => {
        const row = applyCommercialEdit(garant('r1').price, { kind: 'discountPercent', value: 0.5 });
        const bitrixRow = toBitrixProductRow({ ...garant('r1'), price: row }, catalog, 3);
        const contract = catalog.contracts.byCode['abonYear']!;
        expect(bitrixRow.productId).toBe(contract.bitrixItemId);
        expect(bitrixRow.productName).toBe(`${garant('r1').names.name} Интернет 1 ОД`);
        expect(bitrixRow.priceNetto).toBe(row.base);
        expect(bitrixRow.price).toBe(row.current);
        expect(bitrixRow.discountSum).toBe(Number((row.base - row.current).toFixed(2)));
        expect(bitrixRow.quantity).toBe(row.quantity);
        expect(bitrixRow.measureCode).toBe(contract.measure.code);
        expect(bitrixRow.supply).toBe('Интернет 1 ОД');
        expect(bitrixRow.sort).toBe(3);
    });
});

describe('buildProductRows', () => {
    const general = upsertRow(
        upsertRow(createSet('general', 'general'), garant('r1')),
        garant('r2', { complectCode: 'expert', supplyCode: 'internet_5' }),
    );

    it('развёрнутый сет — строка на каждую строку, sort по порядку', () => {
        const rows = buildProductRows(general, catalog);
        expect(rows).toHaveLength(2);
        expect(rows.map(row => row.sort)).toEqual([0, 1]);
        expect(rows[1]!.supply).toBe('Интернет 5 ОД');
    });

    it('свёрнутый сет — одна total-строка с суммой цен и общим количеством', () => {
        const rows = buildProductRows({ ...general, collapsed: true }, catalog);
        expect(rows).toHaveLength(1);
        const total = rows[0]!;
        expect(total.productName).toContain(' + ');
        expect(total.priceNetto).toBe(
            Number((garant('r1').price.base + general.rows[1]!.price.base).toFixed(2)),
        );
        expect(total.quantity).toBe(garant('r1').price.quantity);
    });

    it('пустой сет — пустой список', () => {
        expect(buildProductRows(createSet('general', 'general'), catalog)).toEqual([]);
    });
});

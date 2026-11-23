import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { defaultComposition } from '../../../composition';
import {
    buildGarantRow,
    buildServiceRow,
    createSet,
    upsertRow,
    type KRow,
    type RowSet,
} from '../../../row-set';
import { buildDocBody } from '../build-doc-body';
import { toDocRow } from '../build-doc-rows';
import { docTotalRow } from '../doc-total-row';
import { complectNumberOf, contractNumberOf } from '../legacy-numbers.util';

/**
 * «Итого» документа собирается по всему общему набору: развёрнутому и
 * свёрнутому. Цены всех строк суммируются, имена идут через « + », роль и
 * ссылки несёт главная строка.
 */
const catalog = catalogFromOldInit(oldInit);
const buh = catalog.complects.byCode['buh']!;

const garantRow = (over: Partial<Parameters<typeof buildGarantRow>[0]> = {}): KRow => {
    const row = buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: 'main',
        setId: 'general',
        role: 'main',
        complectCode: 'buh',
        supplyCode: 'internet_5',
        contractCode: 'abonYear',
        ...over,
    });
    if (!row) throw new Error('нет цены для тестовой garant-строки');
    return row;
};

const mainRow = (over: Partial<Parameters<typeof buildGarantRow>[0]> = {}): KRow => ({
    ...garantRow(over),
    composition: defaultComposition(buh),
});

const ltRow = (): KRow => {
    const service = catalog.services.ltPackages.find(item => item.code === 'ltpackSmall');
    const row =
        service &&
        buildServiceRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'lt',
            setId: 'general',
            role: 'additional',
            productType: 'lt',
            service,
            supplyCode: 'internet_5',
            contractCode: 'abonYear',
        });
    if (!row) throw new Error('нет цены для тестовой LT-строки');
    return row;
};

const consaltingRow = (): KRow => {
    const service = catalog.services.consalting.find(item => item.code === 'sovex');
    const row =
        service &&
        buildServiceRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'cons',
            setId: 'general',
            role: 'additional',
            productType: 'consalting',
            service,
            supplyCode: 'internet_5',
            contractCode: 'abonYear',
        });
    if (!row) throw new Error('нет цены для тестовой строки консалтинга');
    return row;
};

const setOf = (rows: KRow[], over: Partial<RowSet> = {}): RowSet => ({
    ...rows.reduce((set, row) => upsertRow(set, row), createSet('general', 'general')),
    ...over,
});

const sumOf = (rows: KRow[], pick: (row: KRow) => number): number =>
    rows.reduce((acc, row) => acc + pick(row), 0);

const bodyOf = (general: RowSet) => {
    const body = buildDocBody({ catalog, general, alternative: [] });
    if (!body) throw new Error('документ не собран');
    return body;
};

describe('итог документа: развёрнутый общий набор', () => {
    it('Гарант, платный LT и консалтинг: итог — сумма строк, id 0', () => {
        const rows = [mainRow(), ltRow(), consaltingRow()];
        const general = setOf(rows);
        expect(general.collapsed).toBe(false);

        const { total } = bodyOf(general);

        expect(total.id).toBe(0);
        expect(total.price.sum).toBeCloseTo(sumOf(rows, row => row.price.sum), 2);
        expect(total.price.default).toBeCloseTo(sumOf(rows, row => row.price.base), 2);
        expect(total.price.month).toBeCloseTo(sumOf(rows, row => row.price.month), 2);
        // сумма больше главной строки: LT и консалтинг в итоге учтены
        expect(total.price.sum).toBeGreaterThan(rows[0]!.price.sum);
        expect(total.name).toBe(rows.map(row => row.names.name).join(' + '));
        expect(total.shortName).toBe(rows.map(row => row.names.shortName).join(' + '));
    });

    it('дополнительный комплект Гаранта (role additional): его цена входит в итог', () => {
        const additional = garantRow({
            key: 'additional',
            role: 'additional',
            complectCode: 'ur',
            supplyCode: 'x_internet_7',
            contractCode: 'internet',
        });
        const rows = [mainRow(), additional];

        const { total } = bodyOf(setOf(rows));

        expect(additional.price.sum).toBeGreaterThan(0);
        expect(total.price.sum).toBeCloseTo(sumOf(rows, row => row.price.sum), 2);
        expect(total.price.sum).toBeGreaterThan(rows[0]!.price.sum);
        expect(total.name).toContain(additional.names.name);
    });

    it('итог адресован главному комплекту: договор, поставка и комплект главной строки', () => {
        const main = mainRow();
        const { total } = bodyOf(setOf([main, ltRow()]));

        expect(total.contract.number).toBe(contractNumberOf('abonYear'));
        expect(total.product.productId).toBe(catalog.contracts.byCode['abonYear']!.bitrixItemId);
        expect(total.product.complectNumber).toBe(complectNumberOf('buh'));
        expect(total.supply?.number).toBe(4);
        expect(total.currentSupply.code).toBe('internet_5');
    });
});

describe('итог документа: свёрнутый общий набор', () => {
    it('ручная цена итога побеждает сумму строк', () => {
        const rows = [mainRow(), ltRow()];
        const manual = {
            ...rows[0]!.price,
            base: 100000,
            current: 90000,
            sum: 90000,
            month: 7500,
        };

        const { total } = bodyOf(setOf(rows, { collapsed: true, totalPrice: manual }));

        expect(total.id).toBe(0);
        expect(total.price.default).toBe(100000);
        expect(total.price.current).toBe(90000);
        expect(total.price.sum).toBe(90000);
        expect(total.price.month).toBe(7500);
    });

    it('без ручной цены итог свёрнутого набора равен итогу развёрнутого', () => {
        const rows = [mainRow(), ltRow(), consaltingRow()];

        const collapsed = bodyOf(setOf(rows, { collapsed: true })).total;
        const expanded = bodyOf(setOf(rows)).total;

        expect(collapsed.price).toEqual(expanded.price);
        expect(collapsed.name).toBe(expanded.name);
    });
});

describe('итог документа: набор из одной строки', () => {
    it('цены итога совпадают с ценами главной строки', () => {
        const main = mainRow();
        const { total } = bodyOf(setOf([main]));

        expect(total.id).toBe(0);
        expect(total.name).toBe(main.names.name);
        expect(total.price).toEqual(toDocRow(catalog, main, 'general', 0, 0).price);
    });

    it('при количестве больше единицы итог сохраняет цену за единицу и сумму', () => {
        const main = mainRow({ quantity: 3 });
        const { total } = bodyOf(setOf([main]));

        expect(total.price.quantity).toBe(3);
        expect(total.price.current).toBeCloseTo(main.price.current, 2);
        expect(total.price.sum).toBeCloseTo(main.price.sum, 2);
    });
});

describe('итог документа: главная строка стоит в наборе второй', () => {
    it('id равен 0, ссылки (комплект, договор, поставка) берутся у главной строки', () => {
        const first = garantRow({
            key: 'additional',
            role: 'additional',
            complectCode: 'ur',
            supplyCode: 'x_internet_7',
            contractCode: 'internet',
        });
        const main = mainRow();
        const rows = [first, main];

        const { total } = bodyOf(setOf(rows));

        expect(total.id).toBe(0);
        expect(total.product.complectNumber).toBe(complectNumberOf('buh'));
        expect(total.product.productId).toBe(catalog.contracts.byCode['abonYear']!.bitrixItemId);
        expect(total.product.supplyNumber).toBe(4);
        expect(total.contract.number).toBe(contractNumberOf('abonYear'));
        expect(total.contract.name).toBe(catalog.contracts.byCode['abonYear']!.name);
        expect(total.supply?.number).toBe(4);
        expect(total.currentSupply.code).toBe('internet_5');
        expect(total.price.sum).toBeCloseTo(sumOf(rows, row => row.price.sum), 2);
    });
});

describe('docTotalRow', () => {
    it('роль и ссылки главной строки, остальное — свёрнутая строка набора', () => {
        const first = garantRow({
            key: 'additional',
            role: 'additional',
            complectCode: 'ur',
            supplyCode: 'x_internet_7',
            contractCode: 'internet',
        });
        const main = mainRow();
        const total = docTotalRow(setOf([first, main]), main);

        expect(total.role).toBe('main');
        expect(total.refs).toBe(main.refs);
        expect(total.productType).toBe('garant');
        expect(total.key).toBe('general_total');
        expect(total.price.sum).toBeCloseTo(first.price.sum + main.price.sum, 2);
    });

    it('пустой набор даёт главную строку без изменений', () => {
        const main = mainRow();
        expect(docTotalRow(createSet('general', 'general'), main)).toBe(main);
    });
});

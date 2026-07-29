import { describe, expect, it } from 'vitest';
import oldInit from '../../../../../docs/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { buildGarantRow } from '../row';
import {
    applySetQuantity,
    applySetTaxChange,
    buildTotalRow,
    createSet,
    detectDroppedAcademy,
    leadGarantRow,
    normalizeCollapsed,
    removeRowCascade,
    syncSetWithComposition,
    upsertRow,
} from '../set';
import { defaultComposition } from '../../../composition';
import type { KRow, RowSet } from '../../model/types';

const catalog = catalogFromOldInit(oldInit);

const garant = (key: string, over: Record<string, unknown> = {}): KRow =>
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key,
        setId: 'general',
        role: 'main',
        complectCode: 'buh',
        supplyCode: 'internet_1',
        contractCode: 'internet',
        ...over,
    })!;

const makeSet = (...rows: KRow[]): RowSet =>
    rows.reduce((set, row) => upsertRow(set, row), createSet('general', 'general'));

describe('единое количество сета', () => {
    it('quantity распространяется на все строки', () => {
        const set = makeSet(
            garant('a'),
            garant('b', { role: 'additional' }),
        );
        const next = applySetQuantity(set, 3);
        expect(next.rows.every(row => row.price.quantity === 3)).toBe(true);
        expect(next.rows[0]!.price.sum).toBe(next.rows[0]!.price.current * 3);
    });

    it('quantityLocked строка сохраняет своё количество', () => {
        const locked: KRow = { ...garant('c'), quantityLocked: true };
        const set = makeSet(garant('a'), locked);
        const next = applySetQuantity(set, 5);
        expect(next.rows.find(row => row.key === 'c')!.price.quantity).toBe(1);
        expect(next.rows.find(row => row.key === 'a')!.price.quantity).toBe(5);
    });

    it('сбрасывает ручную правку total-строки', () => {
        const set = { ...makeSet(garant('a')), totalPrice: garant('a').price };
        expect(applySetQuantity(set, 2).totalPrice).toBeNull();
    });
});

describe('удаление строк с каскадом', () => {
    it('последний garant убивает сет', () => {
        const set = makeSet(garant('a'));
        expect(removeRowCascade(set, 'a')).toBeNull();
    });

    it('не-последний garant остаётся, сет живёт', () => {
        const set = makeSet(
            garant('a'),
            garant('b', { role: 'additional' }),
        );
        const next = removeRowCascade(set, 'b');
        expect(next).not.toBeNull();
        expect(next!.rows).toHaveLength(1);
    });

    it('≤1 строки → авторазворот (normalizeCollapsed)', () => {
        const collapsed = {
            ...makeSet(garant('a'), garant('b', { role: 'additional' })),
            collapsed: true,
        };
        const next = removeRowCascade(collapsed, 'b');
        expect(next!.collapsed).toBe(false);
        expect(normalizeCollapsed(next!)).toBe(next);
    });
});

describe('total-строка', () => {
    it('единое количество и сумма из строк', () => {
        const set = applySetQuantity(
            makeSet(garant('a'), garant('b', { role: 'additional' })),
            2,
        );
        const total = buildTotalRow(set)!;
        expect(total.price.quantity).toBe(2);
        expect(total.price.sum).toBe(
            set.rows.reduce((acc, row) => acc + row.price.sum, 0),
        );
        expect(total.price.current).toBe(total.price.sum / 2);
    });

    it('ручной totalPrice побеждает производный', () => {
        const set = makeSet(garant('a'));
        const manual = { ...garant('a').price, current: 111, sum: 111 };
        const total = buildTotalRow({ ...set, totalPrice: manual })!;
        expect(total.price.current).toBe(111);
    });
});

describe('sync и ведущая строка', () => {
    it('comparison-сет получает сервисные строки от ведущей garant-строки', () => {
        const complect = catalog.complects.byCode['buh']!;
        const composition = {
            ...defaultComposition(complect),
            consalting: 'sovex',
        };
        const row = buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'cmp_g',
            setId: 'cmp',
            role: 'comparison',
            complectCode: 'buh',
            supplyCode: 'internet_1',
            contractCode: 'internet',
            composition,
        })!;
        const set: RowSet = {
            id: 'cmp',
            kind: 'alternative',
            rows: [row],
            collapsed: false,
        };
        const synced = syncSetWithComposition(set, catalog, {
            regionCode: 'stv',
            withTax: false,
        });
        expect(leadGarantRow(set)!.key).toBe('cmp_g');
        expect(
            synced.rows.some(item => item.productType === 'consalting'),
        ).toBe(true);
    });

    it('sync сохраняет пользовательское имя и количество', () => {
        const named: KRow = {
            ...garant('a'),
            names: { ...garant('a').names, alternativeName: 'Моё имя' },
            price: { ...garant('a').price, quantity: 4 },
        };
        const synced = syncSetWithComposition(makeSet(named), catalog, {
            regionCode: 'stv',
            withTax: false,
        });
        const row = synced.rows.find(item => item.key === 'a')!;
        expect(row.names.alternativeName).toBe('Моё имя');
        expect(row.price.quantity).toBe(4);
    });
});

describe('массовая смена налога', () => {
    it('×1.05 для обычных, LIC и бесплатные не трогаются', () => {
        const normal = garant('a');
        const lic = garant('b', { contractCode: 'licYear' });
        const free: KRow = { ...garant('c'), isFree: true };
        const set = makeSet(normal, lic, free);
        const taxed = applySetTaxChange(set, catalog, false, true);
        expect(taxed.rows.find(row => row.key === 'a')!.price.base).toBe(
            Math.round(normal.price.base * 1.05 * 100) / 100,
        );
        expect(taxed.rows.find(row => row.key === 'b')!.price.base).toBe(
            lic.price.base,
        );
        expect(taxed.rows.find(row => row.key === 'c')!.price.base).toBe(
            free.price.base,
        );
    });
});

describe('детект выпавшей академии', () => {
    it('академия исчезла после sync → true', () => {
        const academyRow: KRow = {
            ...garant('ac'),
            productType: 'academy',
        };
        const prev = makeSet(garant('a'), academyRow);
        const next = makeSet(garant('a'));
        expect(detectDroppedAcademy(prev, next)).toBe(true);
        expect(detectDroppedAcademy(next, next)).toBe(false);
    });
});

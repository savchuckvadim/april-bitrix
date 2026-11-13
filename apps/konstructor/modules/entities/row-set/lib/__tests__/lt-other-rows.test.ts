import { describe, expect, it } from 'vitest';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import { defaultComposition, type LtOtherPacket } from '../../../composition';
import { buildGarantRow } from '../row';
import { createSet, syncSetWithComposition, upsertRow } from '../set';

/**
 * Строки lt_other выводятся из пакетов LT-other наполнения: по строке на
 * собранный пакет, ключ — id пакета, имя — своё или пакета каталога.
 */
const catalog = catalogFromOldInit(oldInit);
const buh = catalog.complects.byCode['buh']!;

const setWith = (ltOther: LtOtherPacket[]) =>
    upsertRow(
        createSet('general', 'general'),
        buildGarantRow({
            catalog,
            regionCode: 'stv',
            withTax: false,
            key: 'main',
            setId: 'general',
            role: 'main',
            complectCode: 'buh',
            supplyCode: 'internet_1',
            contractCode: 'internet',
            composition: { ...defaultComposition(buh), ltOther },
        })!,
    );

describe('строки lt_other из наполнения', () => {
    it('по строке на собранный пакет; несобранный строки не даёт', () => {
        const synced = syncSetWithComposition(
            setWith([
                { id: 'p1', services: ['ltsut', 'ltdisk'], alternativeName: 'Свой пакет' },
                { id: 'p2', services: ['ltsut'], alternativeName: null },
                { id: 'p3', services: ['ltsut', 'ltdisk', 'ltconnect', 'ltbusiness', 'ltpatent'], alternativeName: null },
            ]),
            catalog,
            { regionCode: 'stv', withTax: false },
        );
        const rows = synced.rows.filter(row => row.productType === 'lt_other');
        expect(rows.map(row => row.key)).toEqual(['general_lt_other_p1', 'general_lt_other_p3']);
        expect(rows[0]!.refs).toMatchObject({ packetId: 'p1', serviceCode: 'ltpackSmall', contractCode: 'internet' });
        expect(rows[0]!.names.alternativeName).toBe('Свой пакет');
        expect(rows[0]!.price.base).toBeGreaterThan(0);
        expect(rows[1]!.refs.serviceCode).toBe('ltpackMedium');
        expect(rows[1]!.names.alternativeName).toBeNull();
        expect(rows[1]!.names.name).toContain('Средний пакет');
    });

    it('средний пакет (вес 4) — только в контексте сервисного отдела', () => {
        const medium = setWith([
            { id: 'm', services: ['ltsut', 'ltdisk', 'ltconnect', 'ltbusiness'], alternativeName: null },
        ]);
        const sales = syncSetWithComposition(medium, catalog, { regionCode: 'stv', withTax: false });
        expect(sales.rows.some(row => row.productType === 'lt_other')).toBe(false);

        const service = syncSetWithComposition(medium, catalog, {
            regionCode: 'stv',
            withTax: false,
            serviceDepartment: true,
        });
        const row = service.rows.find(item => item.productType === 'lt_other');
        expect(row?.refs.serviceCode).toBe('ltpack_1020');
        expect(row?.price.base).toBeGreaterThan(0);
    });
});

describe('строки LT: основной и альтернативный наборы', () => {
    const composed = (kind: 'general' | 'alternative', ltInPacket: string[]) =>
        upsertRow(
            createSet(kind === 'general' ? 'general' : 'alt_1', kind),
            buildGarantRow({
                catalog,
                regionCode: 'stv',
                withTax: false,
                key: 'main',
                setId: kind === 'general' ? 'general' : 'alt_1',
                role: kind === 'general' ? 'main' : 'comparison',
                complectCode: 'buh',
                supplyCode: 'internet_1',
                contractCode: 'internet',
                composition: {
                    ...defaultComposition(buh),
                    ltInPacket,
                    ltOther: [{ id: 'p1', services: ['ltsut', 'ltdisk'], alternativeName: null }],
                },
            })!,
        );
    const types = (kind: 'general' | 'alternative', ltInPacket: string[]) =>
        syncSetWithComposition(composed(kind, ltInPacket), catalog, { regionCode: 'stv', withTax: false })
            .rows.map(row => row.productType)
            .filter(type => type !== 'garant');

    it('бесплатная часть товаром не идёт, платный и доп. пакет — идут', () => {
        expect(types('general', ['ltconnect', 'ltbusiness'])).toEqual(['lt', 'lt_other']);
        expect(types('general', [])).toEqual(['lt_other']);
    });

    it('несобранный платный пакет строки не даёт', () => {
        expect(types('general', ['ltconnect'])).toEqual(['lt_other']);
    });

    it('у набора для сравнения — и платный пакет, и доп. пакеты со своим составом', () => {
        expect(types('alternative', ['ltconnect', 'ltbusiness'])).toEqual(['lt', 'lt_other']);
        expect(types('alternative', [])).toEqual(['lt_other']);
    });

    it('строка доп. пакета набора для сравнения — в его наборе, с договором его Гаранта', () => {
        const synced = syncSetWithComposition(composed('alternative', []), catalog, {
            regionCode: 'stv',
            withTax: false,
        });
        const row = synced.rows.find(item => item.productType === 'lt_other');
        expect(row).toMatchObject({
            key: 'alt_1_lt_other_p1',
            setId: 'alt_1',
            role: 'comparison',
            refs: { packetId: 'p1', serviceCode: 'ltpackSmall', contractCode: 'internet' },
        });
    });
});

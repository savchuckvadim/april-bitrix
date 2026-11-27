import { describe, expect, it } from 'vitest';
import { resolveSupply } from '../../../catalog';
import { findMainRow, type KRow } from '../../../row-set';
import type { DocComplectGroup, DocComplectSection } from '../../model/dto';
import { buildComplectGroups } from '../build-complect-groups';
import { buildComplectSections, hasComplectSections } from '../build-complect-sections';
import { buildDocBody, buildDocVariant } from '../build-doc-body';
import { mainDocComposition, rowDocComposition } from '../doc-composition';
import { bareGeneral, catalog, compositionOf, garantRowOf, syncedGeneral } from '../__fixtures__/two-garant-set';

/**
 * Наполнение по комплектам: у каждой garant-строки общего набора свой раздел
 * со своим названием, поставкой и группами инфоблоков.
 */

const codesOf = (groups: DocComplectGroup[], type: DocComplectGroup['type']): string[] =>
    groups.find(group => group.type === type)?.value.map(item => item.code ?? item.name) ?? [];

const mainComposition = compositionOf('buh', { infoblocks: ['rus', 'reg', 'bbu'], lt: ['ltsut'], regions: ['stv'] });
const additionalComposition = compositionOf('ur', {
    infoblocks: ['rus', 'la', 'ntss'],
    lt: ['ltsut', 'ltconstructor'],
    regions: ['spb'],
});

const mainOf = (composition = mainComposition) => garantRowOf('general_main', 'main', 'buh', composition);
const additionalOf = (composition = additionalComposition) =>
    garantRowOf('general_additional', 'additional', 'ur', composition);

const requireSections = (rows: KRow[]): DocComplectSection[] => {
    const sections = buildDocBody({ catalog, general: syncedGeneral(rows), alternative: [] })?.complects;
    if (!sections) throw new Error('разделы по комплектам не собрались');
    return sections;
};

describe('buildDocBody: наполнение по комплектам', () => {
    it('две строки Гаранта дают два раздела, у каждого свои группы инфоблоков', () => {
        const sections = requireSections([mainOf(), additionalOf()]);
        expect(sections).toHaveLength(2);

        const [first, second] = sections as [DocComplectSection, DocComplectSection];
        expect(codesOf(first.complect, 'npa')).toEqual(['rus', 'reg']);
        expect(codesOf(first.complect, 'cons')).toEqual(['bbu']);
        expect(codesOf(first.complect, 'lt')).toEqual(['ltsut']);
        expect(codesOf(first.complect, 'sp')).toEqual([]);

        expect(codesOf(second.complect, 'npa')).toEqual(['rus', 'spb']);
        expect(codesOf(second.complect, 'la')).toEqual(['la']);
        expect(codesOf(second.complect, 'sp')).toEqual(['ntss']);
        expect(codesOf(second.complect, 'lt')).toEqual(['ltsut', 'ltconstructor']);
        expect(codesOf(second.complect, 'cons')).toEqual([]);
    });

    it('главный комплект идёт первым, даже если в наборе он стоит после дополнительного', () => {
        const sections = requireSections([additionalOf(), mainOf()]);
        expect(sections.map(section => section.title)).toEqual([
            catalog.complects.byCode['buh']!.fullTitle,
            catalog.complects.byCode['ur']!.fullTitle,
        ]);
    });

    it('остальные комплекты идут в порядке набора', () => {
        const third = garantRowOf('general_third', 'additional', 'classic', compositionOf('classic', { infoblocks: ['rus'] }));
        const sections = requireSections([mainOf(), additionalOf(), third]);
        expect(sections.map(section => section.title)).toEqual([
            catalog.complects.byCode['buh']!.fullTitle,
            catalog.complects.byCode['ur']!.fullTitle,
            catalog.complects.byCode['classic']!.fullTitle,
        ]);
    });

    it('название раздела — название строки, пользовательское название побеждает', () => {
        const base = additionalOf();
        const renamed: KRow = { ...base, names: { ...base.names, alternativeName: '  Комплект для юристов  ' } };
        const sections = requireSections([mainOf(), renamed]);
        expect(sections[0]!.title).toBe(catalog.complects.byCode['buh']!.fullTitle);
        expect(sections[1]!.title).toBe('Комплект для юристов');
    });

    it('поставка раздела — название поставки его строки', () => {
        const supplyName = resolveSupply(catalog, 'internet_5')?.name;
        expect(supplyName).toBeTruthy();
        const sections = requireSections([mainOf(), additionalOf()]);
        expect(sections.map(section => section.supplyName)).toEqual([supplyName, supplyName]);
    });

    it('группы раздела строятся от наполнения строки тем же сборщиком групп', () => {
        const general = syncedGeneral([mainOf(), additionalOf()]);
        const sections = buildComplectSections(catalog, general, findMainRow(general)!);
        const own = rowDocComposition(additionalOf(), general);
        expect(own).not.toBeNull();
        expect(sections?.[1]?.complect).toEqual(buildComplectGroups(catalog, own!));
    });

    it('одна строка Гаранта — поля complects нет', () => {
        const body = buildDocBody({ catalog, general: syncedGeneral([mainOf()]), alternative: [] });
        expect(body).not.toBeNull();
        expect(body).not.toHaveProperty('complects');
    });

    it('вторая строка Гаранта без наполнения комплектом не считается: поля нет', () => {
        const bare = garantRowOf('general_additional', 'additional', 'ur', undefined);
        const general = bareGeneral([mainOf(), bare]);
        expect(hasComplectSections(general)).toBe(false);
        const body = buildDocBody({ catalog, general, alternative: [] });
        expect(body).not.toBeNull();
        expect(body).not.toHaveProperty('complects');
    });

    it('объединённое наполнение остаётся прежним и идёт рядом с разделами', () => {
        const body = buildDocBody({ catalog, general: syncedGeneral([mainOf(), additionalOf()]), alternative: [] });
        expect(codesOf(body?.complect ?? [], 'npa')).toEqual(['rus', 'reg', 'spb']);
        expect(body?.complects).toHaveLength(2);
    });

    it('участник-вариант несёт разделы своего общего набора', () => {
        const variant = buildDocVariant({
            catalog,
            general: syncedGeneral([mainOf(), additionalOf()]),
            alternative: [],
            variantSmartId: 7,
            title: 'Вариант',
        });
        expect(variant?.complects).toHaveLength(2);
        const single = buildDocVariant({
            catalog,
            general: syncedGeneral([mainOf()]),
            alternative: [],
            variantSmartId: 8,
            title: 'Один комплект',
        });
        expect(single).not.toBeNull();
        expect(single).not.toHaveProperty('complects');
    });
});

describe('buildDocBody: отсевы в разделах по комплектам', () => {
    const packetComposition = () =>
        compositionOf('ur', {
            lt: ['ltsut'],
            ltInPacket: ['ltdisk', 'ltconnect'],
            ltOther: [{ id: 'extra', services: ['iscra_special'], alternativeName: null }],
        });

    it('пакет ltOther со своей строкой в наборе попадает в группу Legal Tech раздела', () => {
        const general = syncedGeneral([mainOf(), additionalOf(packetComposition())]);
        expect(general.rows.some(row => row.productType === 'lt_other' && row.refs.packetId === 'extra')).toBe(true);
        const sections = buildComplectSections(catalog, general, findMainRow(general)!);
        expect(codesOf(sections?.[1]?.complect ?? [], 'lt')).toEqual(
            expect.arrayContaining(['ltsut', 'ltdisk', 'ltconnect', 'iscra_special']),
        );
    });

    it('пакет ltOther без своей строки в наборе в раздел не попадает', () => {
        const synced = syncedGeneral([mainOf(), additionalOf(packetComposition())]);
        const withoutRow = { ...synced, rows: synced.rows.filter(row => row.productType !== 'lt_other') };
        const sections = buildComplectSections(catalog, withoutRow, findMainRow(withoutRow)!);
        const lt = codesOf(sections?.[1]?.complect ?? [], 'lt');
        expect(lt).not.toContain('iscra_special');
        expect(lt).toEqual(expect.arrayContaining(['ltsut', 'ltdisk', 'ltconnect']));
    });

    it('академия без строки в наборе в раздел не попадает, со строкой идёт в группу академии', () => {
        const additional = additionalOf(compositionOf('ur', { star: true, academy: 'academy_3' }));
        const synced = syncedGeneral([mainOf(), additional]);
        const academyRow: KRow = { ...additional, key: 'general_academy', productType: 'academy' };
        const withAcademy = { ...synced, rows: [...synced.rows, academyRow] };

        const noAcademy = buildComplectSections(catalog, synced, findMainRow(synced)!);
        expect(codesOf(noAcademy?.[1]?.complect ?? [], 'academy')).toEqual([]);
        const withRow = buildComplectSections(catalog, withAcademy, findMainRow(withAcademy)!);
        expect(codesOf(withRow?.[1]?.complect ?? [], 'academy')).toEqual(['academy_3']);
        // наполнение главного комплекта академии не получает
        expect(codesOf(withRow?.[0]?.complect ?? [], 'academy')).toEqual([]);
    });

    it('состав главной строки для раздела совпадает с составом для описания комплекта', () => {
        const general = syncedGeneral([mainOf(), additionalOf()]);
        const main = findMainRow(general)!;
        expect(rowDocComposition(main, general)).toEqual(mainDocComposition(main, general));
    });
});

import { describe, expect, it } from 'vitest';
import type { DocComplectGroup } from '../../model/dto';
import { buildDocBody } from '../build-doc-body';
import { docComposition, mainDocComposition } from '../doc-composition';
import { setComposition } from '../set-composition';
import { findMainRow, type KRow } from '../../../row-set';
import { bareGeneral, catalog, compositionOf, garantRowOf, syncedGeneral } from '../__fixtures__/two-garant-set';

/**
 * Наполнение общего набора в документах: у главной и дополнительных
 * garant-строк своё наполнение, в документ идёт объединённое без повторов.
 */

const codesOf = (groups: DocComplectGroup[], type: DocComplectGroup['type']): string[] =>
    groups.find(group => group.type === type)?.value.map(item => item.code ?? item.name) ?? [];

const allCodes = (groups: DocComplectGroup[]): string[] =>
    groups.flatMap(group => group.value.map(item => item.code ?? item.name));

const mainComposition = compositionOf('buh', { infoblocks: ['rus', 'reg', 'bbu'], lt: ['ltsut'], regions: ['stv'] });
const additionalComposition = compositionOf('ur', {
    infoblocks: ['rus', 'la', 'ntss'],
    lt: ['ltsut', 'ltconstructor'],
    regions: ['spb'],
});

const mainOf = (composition = mainComposition) => garantRowOf('general_main', 'main', 'buh', composition);
const additionalOf = (composition = additionalComposition) =>
    garantRowOf('general_additional', 'additional', 'ur', composition);

const bodyOf = (rows: KRow[]) => {
    const body = buildDocBody({ catalog, general: syncedGeneral(rows), alternative: [] });
    if (!body) throw new Error('документ не собрался');
    return body;
};

describe('setComposition: объединённое наполнение набора', () => {
    it('составы главной и дополнительной строк объединены без повторов, главная идёт первой', () => {
        const merged = setComposition(bareGeneral([mainOf(), additionalOf()]));
        expect(merged?.infoblocks).toEqual(['rus', 'reg', 'bbu', 'la', 'ntss']);
        expect(merged?.lt).toEqual(['ltsut', 'ltconstructor']);
        expect(merged?.regions).toEqual(['stv', 'spb']);
        expect(merged?.complectCode).toBe('buh');
    });

    it('главная строка идёт первой, даже если в наборе она стоит после дополнительной', () => {
        const merged = setComposition(bareGeneral([additionalOf(), mainOf()]));
        expect(merged?.infoblocks).toEqual(['rus', 'reg', 'bbu', 'la', 'ntss']);
        expect(merged?.complectCode).toBe('buh');
    });

    it('строки без наполнения пропускаются', () => {
        const withoutComposition = garantRowOf('general_additional', 'additional', 'ur', undefined);
        expect(setComposition(bareGeneral([mainOf(), withoutComposition]))).toEqual(mainComposition);
        expect(setComposition(bareGeneral([withoutComposition, mainOf()]))).toEqual(mainComposition);
    });

    it('ни одного наполнения нет — null', () => {
        const bare = garantRowOf('general_main', 'main', 'buh', undefined);
        expect(setComposition(bareGeneral([bare]))).toBeNull();
        expect(setComposition(bareGeneral([]))).toBeNull();
    });

    it('передаваемая главная строка важнее копии в наборе: её наполнение идёт первым', () => {
        const edited = mainOf(compositionOf('buh', { infoblocks: ['bbb'] }));
        const merged = setComposition(bareGeneral([mainOf(), additionalOf()]), edited);
        expect(merged?.infoblocks).toEqual(['bbb', 'rus', 'la', 'ntss']);
    });

    it('консалтинг: побеждает старший, СТАР включён, если он есть у любой строки', () => {
        const merged = setComposition(
            bareGeneral([
                mainOf(compositionOf('buh', { consalting: 'sovex' })),
                additionalOf(compositionOf('ur', { consalting: 'pkpremium', star: true })),
            ]),
        );
        expect(merged?.consalting).toBe('pkpremium');
        expect(merged?.star).toBe(true);
    });
});

describe('docComposition: набор с одной строкой Гаранта', () => {
    const okPacket = { id: 'ok', services: ['ltdisk', 'ltconnect'], alternativeName: null };
    const brokenPacket = { id: 'broken', services: ['ltpatent'], alternativeName: null };
    const single = compositionOf('buh', {
        infoblocks: ['rus', 'reg'],
        lt: ['ltsut'],
        regions: ['stv'],
        ltOther: [okPacket, brokenPacket],
        academy: 'academy_3',
        consalting: 'sovex',
        star: true,
    });
    const main = mainOf(single);
    const set = syncedGeneral([main]);

    it('результат равен наполнению строки с прежними двумя отсевами, поле в поле', () => {
        // пакет «broken» не собран и строки не имеет, академия без строки отсеивается
        expect(set.rows.some(row => row.productType === 'lt_other' && row.refs.packetId === 'ok')).toBe(true);
        expect(set.rows.some(row => row.refs.packetId === 'broken')).toBe(false);
        expect(set.rows.some(row => row.productType === 'academy')).toBe(false);
        expect(docComposition(main, set)).toEqual({ ...single, ltOther: [okPacket], academy: null });
    });

    it('совпадает с составом одной главной строки', () => {
        expect(docComposition(main, set)).toEqual(mainDocComposition(main, set));
    });

    it('академия остаётся, когда в наборе есть её строка', () => {
        const academyRow: KRow = { ...main, key: 'general_academy', productType: 'academy' };
        const withAcademy = { ...set, rows: [...set.rows, academyRow] };
        expect(docComposition(main, withAcademy)?.academy).toBe('academy_3');
    });

    it('у главной строки нет наполнения — null', () => {
        const bare = garantRowOf('general_main', 'main', 'buh', undefined);
        expect(docComposition(bare, syncedGeneral([bare]))).toBeNull();
        expect(mainDocComposition(bare, syncedGeneral([bare]))).toBeNull();
    });
});

describe('документ по общему набору с дополнительным комплектом', () => {
    it('в complect инфоблоки обеих строк без повторов', () => {
        const { complect } = bodyOf([mainOf(), additionalOf()]);
        const codes = allCodes(complect);
        for (const code of ['rus', 'reg', 'bbu', 'la', 'ntss']) expect(codes).toContain(code);
        expect(new Set(codes).size).toBe(codes.length);
        // группы: НПА — общий «rus» один раз, регион первой строки в рутовом блоке, второй — рядом
        expect(codesOf(complect, 'npa')).toEqual(['rus', 'reg', 'spb']);
        expect(codesOf(complect, 'cons')).toEqual(['bbu']);
        expect(codesOf(complect, 'sp')).toEqual(['ntss']);
        expect(codesOf(complect, 'la')).toEqual(['la']);
    });

    it('платный пакет LT только у дополнительной строки есть в группе Legal Tech', () => {
        const additional = additionalOf(
            compositionOf('ur', {
                lt: ['ltsut'],
                ltInPacket: ['ltdisk', 'ltconnect'],
                ltOther: [{ id: 'extra', services: ['iscra_special'], alternativeName: null }],
            }),
        );
        const set = syncedGeneral([mainOf(), additional]);
        expect(set.rows.some(row => row.productType === 'lt_other' && row.refs.packetId === 'extra')).toBe(true);
        const body = buildDocBody({ catalog, general: set, alternative: [] });
        const lt = codesOf(body?.complect ?? [], 'lt');
        expect(lt).toEqual(expect.arrayContaining(['ltsut', 'ltdisk', 'ltconnect', 'iscra_special']));
        expect(new Set(lt).size).toBe(lt.length);
    });

    it('пакет LT-other дополнительной строки без своей строки в наборе в документ не идёт', () => {
        const additional = additionalOf(
            compositionOf('ur', {
                lt: [],
                ltOther: [{ id: 'extra', services: ['ltdisk', 'ltconnect'], alternativeName: null }],
            }),
        );
        const synced = syncedGeneral([mainOf(), additional]);
        const withoutRow = { ...synced, rows: synced.rows.filter(row => row.productType !== 'lt_other') };
        const composition = docComposition(findMainRow(withoutRow)!, withoutRow);
        expect(composition?.ltOther).toEqual([]);
        expect(docComposition(findMainRow(synced)!, synced)?.ltOther).toHaveLength(1);
    });

    it('консалтинг только у дополнительной строки попадает в группу консалтинга', () => {
        const body = bodyOf([mainOf(), additionalOf(compositionOf('ur', { consalting: 'sovex' }))]);
        expect(codesOf(body.complect, 'consulting')).toEqual(['sovex']);
    });

    it('СТАР и академия дополнительной строки идут в документ, если у них есть строки набора', () => {
        const additional = additionalOf(compositionOf('ur', { star: true, academy: 'academy_3' }));
        const synced = syncedGeneral([mainOf(), additional]);
        const academyRow: KRow = { ...additional, key: 'general_academy', productType: 'academy' };
        const withAcademy = { ...synced, rows: [...synced.rows, academyRow] };
        const body = buildDocBody({ catalog, general: withAcademy, alternative: [] });
        expect(codesOf(body?.complect ?? [], 'star')).toContain('stcalc');
        expect(codesOf(body?.complect ?? [], 'academy')).toEqual(['academy_3']);
        // без строки академии набор её в документ не пускает
        const noAcademy = buildDocBody({ catalog, general: synced, alternative: [] });
        expect(codesOf(noAcademy?.complect ?? [], 'academy')).toEqual([]);
    });

    it('у набора с одной строкой Гаранта группы документа остаются прежними', () => {
        const only = mainOf();
        const set = syncedGeneral([only]);
        const body = buildDocBody({ catalog, general: set, alternative: [] });
        expect(codesOf(body?.complect ?? [], 'npa')).toEqual(['rus', 'reg']);
        expect(codesOf(body?.complect ?? [], 'cons')).toEqual(['bbu']);
        expect(codesOf(body?.complect ?? [], 'lt')).toEqual(['ltsut']);
    });
});

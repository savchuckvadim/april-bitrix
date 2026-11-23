import { describe, expect, it } from 'vitest';
import { resolveSupply } from '../../../catalog';
import type { RowSet } from '../../../row-set';
import type { DocAlternativeSetComplects, DocComplectGroup } from '../../model/dto';
import { buildAlternativeComplects, hasAlternativeComplects } from '../build-alternative-complects';
import { buildComplectGroups } from '../build-complect-groups';
import { buildSetComplectSections } from '../build-complect-sections';
import { buildDocBody } from '../build-doc-body';
import { rowDocComposition } from '../doc-composition';
import { alternativeSetNumber, alternativeSetTitle } from '../doc-set-numbers';
import {
    catalog,
    comparisonRowOf,
    compositionOf,
    garantRowOf,
    syncedAlternative,
    syncedGeneral,
} from '../__fixtures__/two-garant-set';

/**
 * Наполнение наборов для сравнения: по записи на набор с наполнением, внутри —
 * разделы комплектов набора. Номер и заголовок набора совпадают с таблицей цен.
 */

const codesOf = (groups: DocComplectGroup[], type: DocComplectGroup['type']): string[] =>
    groups.find(group => group.type === type)?.value.map(item => item.code ?? item.name) ?? [];

const buhComposition = compositionOf('buh', { infoblocks: ['rus', 'reg', 'bbu'], lt: ['ltsut'], regions: ['stv'] });
const urComposition = compositionOf('ur', {
    infoblocks: ['rus', 'la', 'ntss'],
    lt: ['ltsut', 'ltconstructor'],
    regions: ['spb'],
});

const general = (): RowSet => syncedGeneral([garantRowOf('general_main', 'main', 'buh', buhComposition)]);

/** Набор для сравнения из одного комплекта */
const singleSet = (setId: string, complectCode: string, composition = urComposition): RowSet =>
    syncedAlternative(setId, [comparisonRowOf(`${setId}_row`, setId, complectCode, composition)]);

/** Набор для сравнения, у которого комплект без наполнения */
const bareSet = (setId: string): RowSet =>
    syncedAlternative(setId, [comparisonRowOf(`${setId}_row`, setId, 'ur', undefined)]);

const requireItem = (items: DocAlternativeSetComplects[], index: number): DocAlternativeSetComplects => {
    const item = items[index];
    if (!item) throw new Error(`нет набора с индексом ${index}`);
    return item;
};

describe('buildAlternativeComplects', () => {
    it('наборов для сравнения нет — пустой массив', () => {
        expect(buildAlternativeComplects(catalog, [])).toEqual([]);
        expect(hasAlternativeComplects([])).toBe(false);
    });

    it('набор без комплекта с наполнением в массив не попадает', () => {
        const alternative = [bareSet('alt_1')];
        expect(buildAlternativeComplects(catalog, alternative)).toEqual([]);
        expect(hasAlternativeComplects(alternative)).toBe(false);
    });

    it('пустой набор без строк в массив не попадает', () => {
        const empty: RowSet = { id: 'alt_1', kind: 'alternative', rows: [], collapsed: false };
        expect(buildAlternativeComplects(catalog, [empty])).toEqual([]);
        expect(hasAlternativeComplects([empty])).toBe(false);
    });

    it('набор из одного комплекта получает раздел: порога «два комплекта» у наборов для сравнения нет', () => {
        const [item] = buildAlternativeComplects(catalog, [singleSet('alt_1', 'ur')]);
        expect(item?.complects).toHaveLength(1);
        expect(item?.complects[0]?.title).toBe(catalog.complects.byCode['ur']!.fullTitle);
    });

    it('два набора с разным составом: у каждого свои номер, заголовок и группы инфоблоков', () => {
        const first = singleSet('alt_1', 'buh', buhComposition);
        const second = singleSet('alt_2', 'ur', urComposition);
        const items = buildAlternativeComplects(catalog, [first, second]);

        expect(items.map(item => [item.setNumber, item.title])).toEqual([
            [1, 'Набор 1'],
            [2, 'Набор 2'],
        ]);
        const firstGroups = requireItem(items, 0).complects[0]!.complect;
        const secondGroups = requireItem(items, 1).complects[0]!.complect;
        expect(codesOf(firstGroups, 'npa')).toEqual(['rus', 'reg', 'stv']);
        expect(codesOf(firstGroups, 'lt')).toEqual(['ltsut']);
        expect(codesOf(secondGroups, 'npa')).toEqual(['rus', 'spb']);
        expect(codesOf(secondGroups, 'la')).toEqual(['la']);
        expect(codesOf(secondGroups, 'lt')).toEqual(['ltsut', 'ltconstructor']);
        expect(hasAlternativeComplects([first, second])).toBe(true);
    });

    it('у набора с несколькими комплектами разделы идут в порядке набора, у каждого своя поставка', () => {
        const set = syncedAlternative('alt_1', [
            comparisonRowOf('alt_1_a', 'alt_1', 'ur', urComposition),
            comparisonRowOf('alt_1_b', 'alt_1', 'buh', buhComposition),
        ]);
        const [item] = buildAlternativeComplects(catalog, [set]);
        const supplyName = resolveSupply(catalog, 'internet_5')?.name;
        expect(supplyName).toBeTruthy();
        expect(item?.complects.map(section => section.title)).toEqual([
            catalog.complects.byCode['ur']!.fullTitle,
            catalog.complects.byCode['buh']!.fullTitle,
        ]);
        expect(item?.complects.map(section => section.supplyName)).toEqual([supplyName, supplyName]);
    });

    it('разделы набора строит та же функция, что и у общего набора, группы — тем же сборщиком', () => {
        const set = singleSet('alt_1', 'ur');
        const [item] = buildAlternativeComplects(catalog, [set]);
        expect(item?.complects).toEqual(buildSetComplectSections(catalog, set));
        const own = rowDocComposition(set.rows.find(row => row.productType === 'garant')!, set);
        expect(own).not.toBeNull();
        expect(item?.complects[0]?.complect).toEqual(buildComplectGroups(catalog, own!));
    });

    it('пользовательское название строки становится названием раздела', () => {
        const row = comparisonRowOf('alt_1_row', 'alt_1', 'ur', urComposition);
        const renamed = { ...row, names: { ...row.names, alternativeName: '  Комплект для юристов  ' } };
        const set = syncedAlternative('alt_1', [renamed]);
        const [item] = buildAlternativeComplects(catalog, [set]);
        expect(item?.complects[0]?.title).toBe('Комплект для юристов');
    });

    it('набор без наполнения не сдвигает номера остальных: второй набор остаётся «Набор 2»', () => {
        const items = buildAlternativeComplects(catalog, [bareSet('alt_1'), singleSet('alt_2', 'ur')]);
        expect(items.map(item => [item.setNumber, item.title])).toEqual([[2, 'Набор 2']]);
    });

    it('видимость настройки: есть набор с наполнением среди прочих — настройка нужна', () => {
        expect(hasAlternativeComplects([bareSet('alt_1'), singleSet('alt_2', 'ur')])).toBe(true);
        expect(hasAlternativeComplects([bareSet('alt_1'), bareSet('alt_2')])).toBe(false);
    });

    it('признак видимости и сборка согласованы: настройка видна ровно тогда, когда есть что отправлять', () => {
        const cases: RowSet[][] = [
            [],
            [bareSet('alt_1')],
            [singleSet('alt_1', 'ur')],
            [bareSet('alt_1'), singleSet('alt_2', 'buh', buhComposition)],
        ];
        for (const alternative of cases) {
            expect(hasAlternativeComplects(alternative)).toBe(buildAlternativeComplects(catalog, alternative).length > 0);
        }
    });
});

describe('номер и заголовок набора совпадают с таблицей цен', () => {
    /** Заголовок набора, который бэк печатает над строками таблицы цен: «Набор N» по `setId` строки */
    const backTableTitle = (setId: number): string => `Набор ${setId}`;

    const alternative = (): RowSet[] => [bareSet('alt_1'), singleSet('alt_2', 'ur'), singleSet('alt_3', 'buh', buhComposition)];

    it('каждый setNumber есть среди setId строк наборов для сравнения, заголовок равен заголовку таблицы', () => {
        const sets = alternative();
        const body = buildDocBody({ catalog, general: general(), alternative: sets });
        const items = buildAlternativeComplects(catalog, sets);
        expect(items.length).toBeGreaterThan(0);

        const rowSetIds = new Set(body!.rows.filter(row => row.type === 'alternative').map(row => row.setId));
        for (const item of items) {
            expect(rowSetIds.has(item.setNumber)).toBe(true);
            expect(item.title).toBe(backTableTitle(item.setNumber));
        }
    });

    it('наборы в sets.alternative нумеруются так же: id набора равен setNumber', () => {
        const sets = alternative();
        const body = buildDocBody({ catalog, general: general(), alternative: sets });
        const items = buildAlternativeComplects(catalog, sets);
        const setIds = body!.sets.alternative.map(set => set.id);
        expect(setIds).toEqual([1, 2, 3]);
        expect(items.map(item => item.setNumber)).toEqual([2, 3]);
        for (const item of items) expect(setIds).toContain(item.setNumber);
    });

    it('у свёрнутого набора строка-итог несёт тот же номер, что и наполнение', () => {
        const [first, second, third] = alternative() as [RowSet, RowSet, RowSet];
        const collapsed: RowSet = { ...second, collapsed: true };
        const sets = [first, collapsed, third];
        const body = buildDocBody({ catalog, general: general(), alternative: sets });
        const items = buildAlternativeComplects(catalog, sets);
        const rowSetIds = new Set(body!.rows.filter(row => row.type === 'alternative').map(row => row.setId));
        expect(items.map(item => item.setNumber)).toEqual([2, 3]);
        for (const item of items) expect(rowSetIds.has(item.setNumber)).toBe(true);
    });

    it('номер набора — позиция в наборах сделки плюс один, одна формула для строк и для наполнения', () => {
        expect([0, 1, 6].map(alternativeSetNumber)).toEqual([1, 2, 7]);
        expect(alternativeSetTitle(3)).toBe('Набор 3');
        const body = buildDocBody({ catalog, general: general(), alternative: alternative() });
        const rowNumbers = [...new Set(body!.rows.filter(row => row.type === 'alternative').map(row => row.setId))];
        expect(rowNumbers).toEqual([1, 2, 3]);
    });

    it('целые числа от 1: бэк отвергает нулевой и дробный номер всем запросом', () => {
        const items = buildAlternativeComplects(catalog, alternative());
        for (const item of items) {
            expect(Number.isInteger(item.setNumber)).toBe(true);
            expect(item.setNumber).toBeGreaterThanOrEqual(1);
        }
    });

    it('тело документа само поле не несёт: его добавляет только запрос КП по настройке', () => {
        const body = buildDocBody({ catalog, general: general(), alternative: alternative() });
        expect(body).not.toBeNull();
        expect(body).not.toHaveProperty('alternativeComplects');
    });
});

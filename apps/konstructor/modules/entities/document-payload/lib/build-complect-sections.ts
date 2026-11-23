import { resolveSupply, type Catalog } from '../../catalog';
import { garantRows, type KRow, type RowSet } from '../../row-set';
import type { DocComplectSection } from '../model/dto';
import { buildComplectGroups } from './build-complect-groups';
import { rowDocComposition } from './doc-composition';
import { orderedGarantRows } from './set-composition';

/** Раздел «по комплектам» появляется, когда в общем наборе комплектов с наполнением два и больше. */
export const MIN_COMPLECT_SECTIONS = 2;

const hasComposition = (row: KRow): boolean => row.composition !== undefined;

/**
 * Есть ли в наборе хотя бы один комплект с наполнением, то есть что печатать
 * разделом. По этому признаку экран показывает настройку наполнения наборов
 * для сравнения, а сборка решает, попадёт ли набор в запрос.
 */
export const hasSetComposition = (set: RowSet): boolean => garantRows(set).some(hasComposition);

/**
 * Есть ли в общем наборе несколько комплектов с наполнением, то есть что
 * печатать по комплектам. По этому же признаку экран показывает выбор способа
 * печати и запрос решает, нужны ли разделы.
 */
export const hasComplectSections = (general: RowSet): boolean =>
    garantRows(general).filter(hasComposition).length >= MIN_COMPLECT_SECTIONS;

/** Название комплекта в разделе: пользовательское название строки, иначе полное название комплекта. */
const sectionTitleOf = (row: KRow): string => row.names.alternativeName?.trim() || row.names.name;

/**
 * Разделы наполнения по комплектам одного набора: по элементу на garant-строку
 * с наполнением, ведущая строка (`lead`, по умолчанию главная) первой, остальные
 * в порядке набора. У раздела название строки (как в таблице цен), поставка
 * строки и группы инфоблоков её наполнения с теми же двумя отсевами, что у
 * объединённого наполнения документа. Строки без наполнения пропускаются; нет
 * ни одной — пустой массив. Порога на число комплектов здесь нет: его ставит
 * вызывающий (общему набору разделы нужны от двух комплектов, набору для
 * сравнения от одного).
 */
export const buildSetComplectSections = (
    catalog: Catalog,
    set: RowSet,
    lead?: KRow | null,
): DocComplectSection[] =>
    orderedGarantRows(set, lead).flatMap(row => {
        const composition = rowDocComposition(row, set);
        if (!composition) return [];
        const supplyName = resolveSupply(catalog, row.refs.supplyCode)?.name;
        return [
            {
                title: sectionTitleOf(row),
                ...(supplyName ? { supplyName } : {}),
                complect: buildComplectGroups(catalog, composition),
            },
        ];
    });

/**
 * Разделы наполнения по комплектам общего набора: главная строка первой,
 * остальные в порядке набора. Комплект один — разделов нет (undefined).
 */
export const buildComplectSections = (
    catalog: Catalog,
    general: RowSet,
    main: KRow,
): DocComplectSection[] | undefined =>
    hasComplectSections(general) ? buildSetComplectSections(catalog, general, main) : undefined;

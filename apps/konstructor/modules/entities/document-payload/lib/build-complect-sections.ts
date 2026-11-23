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
 * Есть ли в общем наборе несколько комплектов с наполнением, то есть что
 * печатать по комплектам. По этому же признаку экран показывает выбор способа
 * печати и запрос решает, нужны ли разделы.
 */
export const hasComplectSections = (general: RowSet): boolean =>
    garantRows(general).filter(hasComposition).length >= MIN_COMPLECT_SECTIONS;

/** Название комплекта в разделе: пользовательское название строки, иначе полное название комплекта. */
const sectionTitleOf = (row: KRow): string => row.names.alternativeName?.trim() || row.names.name;

/**
 * Разделы наполнения по комплектам общего набора: по элементу на garant-строку
 * с наполнением, главная первой, остальные в порядке набора. У раздела
 * название строки (как в таблице цен), поставка строки и группы инфоблоков
 * её наполнения с теми же двумя отсевами, что у объединённого наполнения
 * документа. Комплект один — разделов нет (undefined).
 */
export const buildComplectSections = (
    catalog: Catalog,
    general: RowSet,
    main: KRow,
): DocComplectSection[] | undefined => {
    if (!hasComplectSections(general)) return undefined;
    return orderedGarantRows(general, main).flatMap(row => {
        const composition = rowDocComposition(row, general);
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
};

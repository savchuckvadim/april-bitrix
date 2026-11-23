import type { Catalog } from '../../catalog';
import type { RowSet } from '../../row-set';
import type { DocAlternativeSetComplects } from '../model/dto';
import { buildSetComplectSections, hasSetComposition } from './build-complect-sections';
import { alternativeSetNumber, alternativeSetTitle } from './doc-set-numbers';

/**
 * Есть ли среди наборов для сравнения хотя бы один с наполнением, то есть что
 * печатать блоком «Наполнение наборов для сравнения». По этому признаку экран
 * показывает настройку.
 */
export const hasAlternativeComplects = (alternative: RowSet[]): boolean => alternative.some(hasSetComposition);

/**
 * Наполнение наборов для сравнения (`alternativeComplects` запроса КП): по
 * записи на набор с наполнением. Разделы комплектов набора строит та же
 * функция, что и разделы общего набора (buildSetComplectSections), поэтому
 * название, поставка и группы инфоблоков у них одинаковые; у набора с одним
 * комплектом раздел тоже есть. Номер и заголовок набора — из doc-set-numbers,
 * они совпадают с `setId` строк набора в таблице цен и с заголовком «Набор N»,
 * который бэк печатает над ними. Набор без комплекта с наполнением в массив
 * не попадает, а номера других наборов не сдвигаются.
 */
export const buildAlternativeComplects = (catalog: Catalog, alternative: RowSet[]): DocAlternativeSetComplects[] =>
    alternative.flatMap((set, index) => {
        const complects = buildSetComplectSections(catalog, set);
        if (complects.length === 0) return [];
        const setNumber = alternativeSetNumber(index);
        return [{ setNumber, title: alternativeSetTitle(setNumber), complects }];
    });

export interface IBXItem {
    id?: number | string;
    categoryId?: number | string;
    stageId?: `C${number | string}:${string}` | string;
    [key: string]: any;
}

/**
 * Фильтр crm.item.list: у известных полей допускается массив значений —
 * Битрикс трактует его как IN (`{ id: [501, 502] }`, `{ stageId: [...] }`).
 * Для update/add остаётся строгий IBXItem: туда массив id не пишут.
 */
export interface IBXItemFilter {
    id?: number | string | Array<number | string>;
    categoryId?: number | string | Array<number | string>;
    stageId?: string | string[];
    [key: string]: any;
}

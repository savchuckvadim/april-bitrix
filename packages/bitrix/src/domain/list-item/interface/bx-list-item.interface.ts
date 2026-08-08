export type BxYesNo = 'Y' | 'N';

export type BxListItemPropertyValue =
    | string
    | number
    | string[]
    | number[]
    | Record<string, string | number>
    | null;

/**
 * Элемент универсального списка как его отдаёт `lists.element.get`.
 * Значения свойств лежат под ключами `PROPERTY_<id>` и приходят мапами
 * (`{ '123': 'значение' }`) даже для одиночных свойств.
 */
export interface IBXListItem {
    ID: string | number;
    CODE?: string;
    NAME?: string;
    IBLOCK_ID?: string | number;
    IBLOCK_SECTION_ID?: string | number | null;
    CREATED_BY?: string | number;
    DATE_CREATE?: string;
    SORT?: string | number;
    ACTIVE?: BxYesNo;
    ACTIVE_FROM?: string | null;
    ACTIVE_TO?: string | null;
    BP_PUBLISHED?: BxYesNo;
    PREVIEW_TEXT?: string;
    PREVIEW_TEXT_TYPE?: 'text' | 'html';
    DETAIL_TEXT?: string;
    DETAIL_TEXT_TYPE?: 'text' | 'html';
    CREATED_USER_NAME?: string;
    [propertyKey: `PROPERTY_${string}`]: BxListItemPropertyValue | undefined;
}

export type IBXListItemFields = Partial<Omit<IBXListItem, 'ID'>> & {
    NAME: string;
    [propertyKey: `PROPERTY_${string}`]: BxListItemPropertyValue | undefined;
};

/** Нормализованная страница `lists.element.get` (см. BxListItemService.getPage). */
export interface IBXListItemPage {
    elements: IBXListItem[];
    /** Смещение следующей страницы; `null` — дальше пусто. */
    next: number | null;
    total: number | null;
}

import { Bitrix } from '@workspace/bitrix';
import {
    HISTORY_IBLOCK_TYPE_ID,
    HistoryListElement,
    HistoryListRef,
} from '../history-list';

/** Сколько элементов отдаёт Битрикс за один вызов `lists.element.get`. */
export const HISTORY_PAGE_SIZE = 50;

export interface HistoryPageRequest {
    ref: HistoryListRef;
    companyId: number;
    /** Смещение стандартной постраничности Битрикса. */
    start: number;
}

export interface HistoryPageResult {
    elements: HistoryListElement[];
    /** Смещение следующей страницы; `null` — дальше пусто. */
    next: number | null;
    total: number | null;
}

/**
 * Чтение истории напрямую из портального списка.
 *
 * Бэкенд тут не нужен: список живёт в самом Битриксе, а его id и id полей уже
 * лежат в Portal. Единственное, что требуется, — знать коды (см. history-list).
 * Эндпоинт `event-support/history` на бэке пока заглушка, и ждать его незачем.
 */
export class HistoryListHelper {
    async getPage({
        ref,
        companyId,
        start,
    }: HistoryPageRequest): Promise<HistoryPageResult> {
        const select = [
            'ID',
            'NAME',
            'DATE_CREATE',
            ...Object.values(ref.properties),
        ];

        // Фильтруем по CRM-привязке. У элемента есть отдельное поле компании и
        // общее поле связей — портал может заполнять любое, поэтому берём то,
        // которое на нём есть.
        const filterKey = ref.properties.crmCompany ?? ref.properties.crm;
        const filter = filterKey ? { [filterKey]: `CO_${companyId}` } : {};

        const response = (await Bitrix.getService().api.call(
            'lists.element.get',
            {
                IBLOCK_TYPE_ID: HISTORY_IBLOCK_TYPE_ID,
                IBLOCK_ID: ref.iblockId,
                SELECT: select,
                FILTER: filter,
                start,
            },
        )) as
            | HistoryListElement[]
            | { result?: HistoryListElement[]; next?: number; total?: number }
            | null;

        // Обёртка ответа зависит от версии SDK: где-то приходит массив, где-то
        // объект с постраничностью. Разбираем оба, чтобы не гадать.
        if (Array.isArray(response)) {
            return {
                elements: response,
                next:
                    response.length === HISTORY_PAGE_SIZE
                        ? start + HISTORY_PAGE_SIZE
                        : null,
                total: null,
            };
        }

        const elements = response?.result ?? [];
        return {
            elements,
            next: response?.next ?? null,
            total: response?.total ?? null,
        };
    }
}

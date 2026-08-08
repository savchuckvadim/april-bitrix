import {
    BX_LIST_PAGE_SIZE,
    Bitrix,
    IBXListItemPage,
    flattenBatchResults,
    toListItemPage,
} from '@workspace/bitrix';
import {
    HistoryListRef,
    getHistorySelect,
} from '../history-list';

export { BX_LIST_PAGE_SIZE as HISTORY_PAGE_SIZE };

/**
 * Чтение истории напрямую из портального списка через типизированный домен
 * `listItem` (`lists.element.get`).
 *
 * Бэкенд тут не нужен: список живёт в самом Битриксе, а его id и id полей уже
 * лежат в Portal. Стартовая загрузка — ОДИН batch: по команде на привязку
 * (первые 50 записей каждой ленты); догрузка — точечный запрос той ленты,
 * которую скроллят.
 */
export class HistoryListHelper {
    private params(ref: HistoryListRef, binding: string, start: number) {
        const crmKey = ref.properties.crm?.key;
        return {
            IBLOCK_ID: String(ref.iblockId),
            select: getHistorySelect(ref),
            // Фильтр по множественному полю: элемент матчится, если ЛЮБОЕ
            // из его значений равно привязке.
            filter: crmKey ? { [crmKey]: binding } : {},
            start,
        };
    }

    /** Первые страницы всех привязок одним batch-вызовом. */
    async getFirstPages(
        ref: HistoryListRef,
        bindings: string[],
    ): Promise<Map<string, IBXListItemPage>> {
        const bitrix = Bitrix.getService();
        bindings.forEach((binding, index) => {
            bitrix.batch.listItem.get(
                `history_${index}`,
                this.params(ref, binding, 0),
            );
        });

        const raw = await bitrix.api.callBatch();
        const flat = flattenBatchResults(raw);

        const pages = new Map<string, IBXListItemPage>();
        bindings.forEach((binding, index) => {
            pages.set(binding, toListItemPage(flat[`history_${index}`], 0));
        });
        return pages;
    }

    /** Догрузка одной ленты со смещения `start`. */
    async getPage(
        ref: HistoryListRef,
        binding: string,
        start: number,
    ): Promise<IBXListItemPage> {
        return Bitrix.getService().listItem.getPage(
            this.params(ref, binding, start),
        );
    }
}

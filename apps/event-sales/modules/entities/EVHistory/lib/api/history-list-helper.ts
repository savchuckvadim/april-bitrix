import {
    BX_LIST_PAGE_SIZE,
    Bitrix,
    IBXListItemPage,
    flattenBatchResults,
    toListItemPage,
} from '@workspace/bitrix';
import { HistoryListRef, getHistorySelect } from '../history-list';
import { runExclusiveBatch } from '@/modules/app/lib/utills/bitrix-batch-queue';

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
        // Через общую очередь батчей: история может стартовать, пока ещё
        // идёт контактный батч, — наполнять общий cmdBatch параллельно нельзя.
        const raw = await runExclusiveBatch(bitrix => {
            bindings.forEach((binding, index) => {
                bitrix.batch.listItem.get(
                    `history_${index}`,
                    this.params(ref, binding, 0),
                );
            });
            return bindings.length;
        });
        const flat = flattenBatchResults(raw as never);

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

import {
    getEventSalesBadges,
    type BadgeCatalogDto,
    type BadgeCatalogVersionDto,
} from '@workspace/nest-event-sales-api';

/**
 * Единственное место слайса, знающее транспорт: каталог бейджиков с бэка
 * event-sales через сгенерированный клиент.
 *
 * `customAxios` разворачивает конверт `{ resultCode, data }` и бросает при
 * ошибке; HTTP≠2xx бросает сам axios. Любой провал ведёт к «бейджиков нет»
 * — отправку отчёта это не трогает.
 */
export class BadgeCatalogHelper {
    private api: ReturnType<typeof getEventSalesBadges>;

    constructor() {
        this.api = getEventSalesBadges();
    }

    /** Действующий набор домена: общий из кода либо свой портала. */
    getCatalog(domain: string): Promise<BadgeCatalogDto> {
        return this.api.badgesResolve({ domain });
    }

    /** Версия и хэш без состава — проверка «менялся ли набор». */
    getVersion(domain: string): Promise<BadgeCatalogVersionDto> {
        return this.api.badgesVersion({ domain });
    }
}

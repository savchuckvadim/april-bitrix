import type {
    AppSettingsResolve200AllOf,
    AppSettingsResolvedDto,
} from '@workspace/nest-event-sales-api';
import { getEventSalesAppSettings } from '@workspace/nest-event-sales-api';

/**
 * Ответ `/app-settings/event-sales`: значения ключей реестра ПЛОСКО
 * (camelCase, типы — из реестра бэка) плюс поле-сосед `storedKeys` —
 * какие ключи владелец РЕАЛЬНО сохранил на портале.
 *
 * Обе половины берутся из спеки: `AppSettingsResolvedDto` — это признак,
 * `AppSettingsResolve200AllOf` — словарь значений; вместе они и есть
 * сгенерированный `AppSettingsResolve200`. Руками здесь не описано ни одно
 * поле и ни один тип значения.
 *
 * От сгенерированного ответа форма отличается ровно двумя послаблениями, и
 * оба — про данные, а не про вкусы:
 * 1. `storedKeys` НЕОБЯЗАТЕЛЕН. Спека обещает его всегда, но стенды на
 *    старом бэке признака не отдают (ради них жив запасной путь в
 *    `buildAppConfigPatch`), а до правил отбора значение доезжает ещё и из
 *    браузерного кэша прошлого запуска. Отличить «портал не задавал ничего»
 *    (`[]`) от «признака нет» (`undefined`) — и есть развилка отбора,
 *    поэтому «поля нет» обязано быть выразимо типом.
 * 2. В словарь значений добавлен `string[]` — иначе сам `storedKeys` в него
 *    не помещается: в спеке словарь описан скалярами, а признак-сосед лежит
 *    с ними в одном объекте.
 */
export type PortalAppSettings = Partial<AppSettingsResolvedDto> &
    Record<string, AppSettingsResolve200AllOf[string] | string[] | undefined>;

/**
 * Единственное место импорта `@workspace/nest-event-sales-api` для
 * портальных настроек приложения (GET /app-settings/event-sales).
 */
export class AppConfigHelper {
    private api: ReturnType<typeof getEventSalesAppSettings>;

    constructor() {
        this.api = getEventSalesAppSettings();
    }

    /** Действующие настройки приложения «Звонки» на домене (ключ→значение). */
    async getEventSalesSettings(domain: string): Promise<PortalAppSettings> {
        return this.api.appSettingsResolve('event-sales', { domain });
    }
}

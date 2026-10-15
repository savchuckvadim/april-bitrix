import { customAxios } from '@workspace/nest-admin-api';
import type {
    HookCatalogEntry,
    HookCatalogItem,
    HookOperationsQuery,
    PortalHookOperationsResponse,
    PortalHookReadiness,
    PortalHooksReadinessResponse,
} from '../../model';

const HOOKS_API = '/api/admin/hooks';
const portalHooksApi = (portalId: number): string =>
    `/api/admin/portal/${portalId}/hooks`;

/**
 * Единственное место транспорта раздела «Хуки и автоматика»
 * (`HooksAdminController` бэка admin). Вызовы ручные, через `customAxios`
 * — тот же mutator, что у сгенерированного клиента: снимает конверт
 * `{ resultCode, data }`. Клиент `@workspace/nest-admin-api` ещё не
 * перегенерирован (нужен запущенный бэк); после `pnpm generate` тела
 * методов меняются на `getAdminHooks()`, подписи остаются.
 */
export class HooksHelper {
    /** Каталог без тяжёлых текстов, отсортирован по семействам. */
    listCatalog(): Promise<HookCatalogItem[]> {
        return customAxios<HookCatalogItem[]>({ url: HOOKS_API, method: 'GET' });
    }

    /** Полная карточка хука; 404 — кода нет в каталоге. */
    getEntry(code: string): Promise<HookCatalogEntry> {
        return customAxios<HookCatalogEntry>({
            url: `${HOOKS_API}/${encodeURIComponent(code)}`,
            method: 'GET',
        });
    }

    /** Готовность всех хуков на портале (слепок PortalDB + настройки). */
    portalReadiness(portalId: number): Promise<PortalHooksReadinessResponse> {
        return customAxios<PortalHooksReadinessResponse>({
            url: portalHooksApi(portalId),
            method: 'GET',
        });
    }

    /** Готовность одного хука на портале. */
    portalHookReadiness(
        portalId: number,
        code: string,
    ): Promise<PortalHookReadiness> {
        return customAxios<PortalHookReadiness>({
            url: `${portalHooksApi(portalId)}/${encodeURIComponent(code)}`,
            method: 'GET',
        });
    }

    /** Операции sales-хуков портала за окно app-cache (час-два). */
    portalOperations(
        portalId: number,
        query: HookOperationsQuery = {},
    ): Promise<PortalHookOperationsResponse> {
        return customAxios<PortalHookOperationsResponse>({
            url: `${portalHooksApi(portalId)}/operations`,
            method: 'GET',
            params: {
                hook: query.hook || undefined,
                limit: query.limit,
            },
        });
    }
}

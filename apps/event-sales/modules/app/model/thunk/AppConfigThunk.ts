import { resolveSwrCache } from '@workspace/api';
import type {
    AppDispatch,
    AppGetState,
    AppThunk,
} from '@/modules/app/model/store';
import { appActions } from '../slice/AppSlice';
import type { PortalAppSettings } from '../../lib/api/app-config-helper';
import { AppConfigHelper } from '../../lib/api/app-config-helper';
import {
    APP_CONFIG_STALE_AFTER_MS,
    getAppConfigCacheKey,
    isAppSettingsPayload,
} from '../../lib/cache/app-config-cache';
import {
    buildAppConfigPatch,
    hasNewConfigValues,
} from '../../lib/config/app-config-patch';
import { markBootPhase } from '../../lib/diagnostics/boot-phases';

const helper = new AppConfigHelper();

/**
 * Настройки → стор. Зовётся дважды: на значении из кэша (сразу) и на том,
 * что привезло фоновое обновление (позже, если оно вообще отличается).
 *
 * Что из ответа применить, решает `buildAppConfigPatch` — он же читает
 * признак `storedKeys`: сырое значение доезжает сюда целиком и из сети, и
 * из кэша, поэтому признак работает на обоих путях.
 */
const applyPortalSettings = (
    settings: PortalAppSettings,
    dispatch: AppDispatch,
    getState: AppGetState,
): void => {
    const { config, configPortalKeys, domain } = getState().app;
    const patch = buildAppConfigPatch(settings, config, domain);

    if (!hasNewConfigValues(patch, config, configPortalKeys)) return;

    // Видно в консоли фрейма, что именно приехало с портала: без этого
    // «настройки не применились» неотличимо от «настройки такие же, как в
    // хардкоде».
    console.info('app-settings', domain, patch);
    dispatch(appActions.mergeConfig(patch));
};

/**
 * Портальные настройки приложения «Звонки» с бэка → поверх legacy
 * domain-config.
 *
 * Кэш-первым (`swr-cache`): значение прошлого старта применяется сразу, а
 * свежее едет фоном и ложится поверх, только если реально отличается.
 * Что это даёт первому экрану: `isConfigFetched` поднимается по кэшу за
 * миллисекунды, поэтому `waitForAppConfig` (до 1.5 с) перестаёт держать
 * первый запрос списка дел — раньше он ждал сеть на КАЖДОМ старте фрейма.
 *
 * Контур «группа задач приехала позже» не тронут и остаётся страховкой:
 * если фоновое обновление принесло другой `taskGroupId`, `mergeConfig`
 * будит листенер, и список дел перезапрашивается (инцидент 27.08).
 *
 * Провал в любой точке (сеть, битый ответ, пустой кэш) — тихий no-op:
 * действует то, что уже в руках, вплоть до хардкода по домену.
 */
export const fetchAppConfig =
    (domain: string): AppThunk =>
    async (dispatch, getState) => {
        if (!domain) {
            // Ждать нечего: потребители isConfigFetched (initialEventTasks)
            // не должны съедать таймаут ради заведомо пустого запроса.
            dispatch(appActions.setConfigFetched());
            return;
        }
        try {
            const resolved = await resolveSwrCache<PortalAppSettings>({
                key: getAppConfigCacheKey(domain),
                staleAfterMs: APP_CONFIG_STALE_AFTER_MS,
                fetcher: () => helper.getEventSalesSettings(domain),
                validate: isAppSettingsPayload,
                onUpdate: settings =>
                    applyPortalSettings(settings, dispatch, getState),
            });

            applyPortalSettings(resolved.value, dispatch, getState);
        } catch (error) {
            // Настроек нет ни в кэше, ни в сети — работаем по legacy
            // domain-config.
            console.warn('app-settings недоступны, действует хардкод', error);
        } finally {
            markBootPhase('app-config-done');
            dispatch(appActions.setConfigFetched());
        }
    };

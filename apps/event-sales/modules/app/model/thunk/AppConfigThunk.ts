import type { AppThunk } from '@/modules/app/model/store';
import { appActions } from '../slice/AppSlice';
import { AppConfigHelper } from '../../lib/api/app-config-helper';
import {
    ARE_CALLS_ENABLED,
    CALL_FEATURE_KEYS,
    DomainFeatureConfig,
    getDomainConfig,
} from '../../consts/domain-config';

const helper = new AppConfigHelper();

/** Ключи конфига, которые приезжают из портальных настроек (реестр бэка). */
const CONFIG_KEYS = Object.keys(
    getDomainConfig(''),
) as (keyof DomainFeatureConfig)[];

/**
 * Портальные настройки приложения «Звонки» с бэка → поверх legacy
 * domain-config. Берутся только известные ключи с совпадающим типом
 * (SLA-ключи и будущие серверные настройки фронту не мешают).
 * Ошибка сети — тихий no-op: действует прежний хардкод по домену.
 */
export const fetchAppConfig =
    (domain: string): AppThunk =>
    async (dispatch, getState) => {
        if (!domain) return;
        try {
            const settings = await helper.getEventSalesSettings(domain);
            const defaults = getState().app.config;
            const patch: Partial<DomainFeatureConfig> = {};
            for (const key of CONFIG_KEYS) {
                // Общий выключатель звонков сильнее портальных настроек:
                // иначе включённые на портале записи вернулись бы обратно.
                if (
                    !ARE_CALLS_ENABLED &&
                    (CALL_FEATURE_KEYS as readonly string[]).includes(key)
                ) {
                    continue;
                }
                const value = settings[key];
                if (
                    value !== undefined &&
                    typeof value === typeof defaults[key]
                ) {
                    Object.assign(patch, { [key]: value });
                }
            }
            // Видно в консоли фрейма, что именно приехало с портала:
            // без этого «настройки не применились» неотличимо от «настройки
            // такие же, как в хардкоде».
            console.info('app-settings', domain, patch);
            if (Object.keys(patch).length) {
                dispatch(appActions.mergeConfig(patch));
            }
        } catch (error) {
            // Настройки недоступны — работаем по legacy domain-config.
            console.warn('app-settings недоступны, действует хардкод', error);
        }
    };

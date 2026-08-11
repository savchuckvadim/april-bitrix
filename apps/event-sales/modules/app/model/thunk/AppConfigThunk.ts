import type { AppThunk } from '@/modules/app/model/store';
import { appActions } from '../slice/AppSlice';
import { AppConfigHelper } from '../../lib/api/app-config-helper';
import {
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
                const value = settings[key];
                if (
                    value !== undefined &&
                    typeof value === typeof defaults[key]
                ) {
                    Object.assign(patch, { [key]: value });
                }
            }
            if (Object.keys(patch).length) {
                dispatch(appActions.mergeConfig(patch));
            }
        } catch {
            // Настройки недоступны — работаем по legacy domain-config.
        }
    };

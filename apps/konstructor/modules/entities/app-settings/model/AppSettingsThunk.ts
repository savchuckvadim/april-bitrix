import { resolveSwrCache } from '@workspace/api';
import type { AppThunk } from '@/modules/app/model/store';
import { AppSettingsHelper } from '../lib/api/app-settings-helper';
import { toAppConfig } from '../lib/app-config.util';
import { appSettingsActions } from './AppSettingsSlice';
import type { KonstructorAppSettings } from './dto';

const helper = new AppSettingsHelper();
const CACHE_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Настройки приложения с бэка через swrCache: старое — сразу, свежее —
 * в фоне (как слепок портала). Ошибка без кэша — дефолты реестра.
 */
export const fetchAppSettings =
    (domain: string): AppThunk<Promise<void>> =>
    async dispatch => {
        dispatch(appSettingsActions.loading());
        try {
            const { value } = await resolveSwrCache<KonstructorAppSettings>({
                key: { name: 'app-settings', domain, version: CACHE_VERSION },
                staleAfterMs: DAY_MS,
                fetcher: () => helper.fetch(domain),
                onUpdate: fresh => dispatch(appSettingsActions.loaded(toAppConfig(fresh))),
            });
            dispatch(appSettingsActions.loaded(toAppConfig(value)));
        } catch (error) {
            dispatch(
                appSettingsActions.failed(
                    error instanceof Error ? error.message : 'настройки приложения не загружены',
                ),
            );
        }
    };

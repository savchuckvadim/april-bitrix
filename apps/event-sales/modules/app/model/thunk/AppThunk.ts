import { Bitrix } from '@workspace/bitrix';
import { expirePortalCache } from '@workspace/pbx';
import type { BXCompany } from '@workspace/bx';
import { appActions } from '../slice/AppSlice';
import type { AppDispatch, AppGetState } from '../store';
import { appInit } from '../../lib/initialize/app-init.util';
import { expireAppConfigCache } from '../../lib/cache/app-config-cache';

/**
 * Тонкий оркестратор boot'а (Alfacentr-паттерн): guard + loading-флаги,
 * вся работа — в lib/initialize/app-init.util.ts.
 */
export const initial =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.app.isLoading || state.app.initialized) return;

        dispatch(appActions.isLoading({ status: true }));

        try {
            await appInit(dispatch, getState);
        } catch (error) {
            console.error('app init error', error);
            dispatch(
                appActions.setInitializedError({
                    errorMessage: 'Ошибка инициализации приложения',
                }),
            );
        } finally {
            dispatch(appActions.isLoading({ status: false }));
        }
    };

/**
 * Кнопка ⟳ — единственное место, где приложение узнаёт «на портале что-то
 * переустановили/переключили»: явная инвалидация браузерного кэша живёт здесь.
 *
 * Кэш именно ПОМЕЧАЕТСЯ протухшим, а не сносится: прежний слепок и прежние
 * настройки продолжают работать, пока не приедут новые. Раньше здесь стоял
 * `clearPortalCache()`, который удалял запись ДО запроса — нажатие ⟳ при
 * лежащем бэке превращало рабочий фрейм во фрейм вообще без конфигурации
 * портала.
 *
 * Пометки ждём: `appActions.reload()` тут же запускает init заново, и
 * `fetchPortal` должен увидеть уже помеченную запись, иначе отдаст её как
 * свежую и в сеть не пойдёт.
 */
export const reloadApp =
    () => async (dispatch: AppDispatch, getState: AppGetState) => {
        const domain = getState().app.domain;
        if (domain) {
            await Promise.all([
                expirePortalCache(domain),
                expireAppConfigCache(domain),
            ]);
        }
        // Reset the app shell; `useApp` re-runs `initial()` once `initialized` is false.
        dispatch(appActions.reload());
    };

/**
 * Подтянуть компанию в состояние ПОСЛЕ инициализации — без полного reload.
 *
 * Главный потребитель — сценарий «привязали компанию к сделке посреди
 * сессии» (виджет «нет компании» / фича ИНН): раньше setAppBitrixData нигде
 * не диспатчился, и приложение до перезагрузки жило в no-company режиме.
 * Реакции (поля компании, контакты) — листенером на setAppBitrixData.
 */
export const refreshBitrixCompany =
    (companyId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        try {
            const company = (await Bitrix.getService().company.get(
                companyId,
            )) as unknown as BXCompany | null;
            if (!company) return;
            dispatch(
                appActions.setAppBitrixData({
                    company,
                    deal: getState().app.bitrix.deal,
                }),
            );
        } catch (error) {
            console.error('refreshBitrixCompany error', error);
        }
    };

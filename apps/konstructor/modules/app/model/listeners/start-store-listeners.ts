import { ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import {
    setupAcademyDurationListener,
    setupProviderTaxListener,
    setupRowSetSyncListener,
} from '@/modules/entities/row-set';
import { appActions, InitApp } from '../AppSlice';
import {
    catalogActions,
    catalogFromOldInit,
    initCatalog,
} from '@/modules/entities/catalog';
import { fetchBaseTemplate } from '@/modules/entities/base-template';
import { fetchOfferTemplates } from '@/modules/entities/offer-template/model/OfferTemplateThunk';
import { initProviders } from '@/modules/entities/provider';
import { initPortal } from '@/modules/entities/portal';
import { restoreSnapshot, type V1Record } from '@/modules/entities/snapshot';
import legacyRecord from '@/modules/entities/snapshot/lib/__fixtures__/legacy-deal.v1.json';
import oldInit from '../../../../docs/oldinit.json';
import {
    IS_PROD,
    IS_REMEMBER_DEV,
    TESTING_DEAL_ID,
} from '../../consts/app-global';

/**
 * Единая точка регистрации реакций «X случилось → сделать Y»
 * (правило монорепы: listeners вместо вложенных thunk'ов).
 * Порядок: данные приложения → каталог/шаблоны → restore слепка → row-set.
 */
export function startStoreListeners(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    setupAppDataListener(listenerMiddleware);
    setupCatalogFallbackListener(listenerMiddleware);
    setupSnapshotRestoreListener(listenerMiddleware);
    setupRowSetSyncListener(listenerMiddleware);
    setupProviderTaxListener(listenerMiddleware);
    setupAcademyDurationListener(listenerMiddleware);
}

/**
 * setAppData (boot завершён: domain/user/dealId известны) →
 * параллельные загрузки: каталог init v2, базовый шаблон, word-шаблоны,
 * поставщики. Бывшее содержимое AppThunk.initial (правило 5 april-front).
 */
function setupAppDataListener(listenerMiddleware: ListenerMiddlewareInstance) {
    const startListening = listenerMiddleware.startListening as unknown as (
        options: unknown,
    ) => void;

    startListening({
        actionCreator: appActions.setAppData,
        effect: (
            action: { payload: InitApp },
            listenerApi: { dispatch: AppDispatch },
        ) => {
            const { domain, user, company, deal } = action.payload;
            listenerApi.dispatch(initCatalog({ domain }));
            listenerApi.dispatch(fetchBaseTemplate({ domain }));
            listenerApi.dispatch(fetchOfferTemplates());
            // Поставщики (налог) — легаси online-API с localStorage-кэшем
            listenerApi.dispatch(initProviders(domain, Number(user.ID)));
            // Портал (pbx): bitrixfields по code — источник UF-id для
            // deal-send (B4, решение владельца: fields/stages только из pbx)
            listenerApi.dispatch(
                initPortal({
                    domain,
                    company,
                    deal,
                    currentUserId: Number(user.ID),
                }),
            );
        },
    });
}

/**
 * Каталог не загрузился (init v2 недоступен) → в dev подстраховываемся
 * фикстурой oldinit.json, чтобы витрина и restore работали offline.
 */
function setupCatalogFallbackListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    const startListening = listenerMiddleware.startListening as unknown as (
        options: unknown,
    ) => void;

    startListening({
        matcher: (action: { type: string }) =>
            action.type === initCatalog.rejected.type,
        effect: (
            _action: unknown,
            listenerApi: { dispatch: AppDispatch },
        ) => {
            if (IS_PROD) return;
            console.warn(
                'catalog: init v2 недоступен — dev-фикстура oldinit.json',
            );
            listenerApi.dispatch(
                catalogActions.setCatalog(catalogFromOldInit(oldInit)),
            );
        },
    });
}

/**
 * Условие-джойн «placement дал dealId» × «каталог готов» → восстановление
 * слепка сделки (restoreSnapshot). Однократно (гард по snapshot.status).
 * Dev вне фрейма: пока snapshot-API не сгенерирован, для TESTING_DEAL_ID
 * подставляется фикстура реальной прод-записи (IS_REMEMBER_DEV).
 */
function setupSnapshotRestoreListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    const startListening = listenerMiddleware.startListening as unknown as (
        options: unknown,
    ) => void;

    startListening({
        matcher: (action: { type: string }) =>
            action.type === appActions.setAppData.type ||
            action.type === initCatalog.fulfilled.type ||
            action.type === catalogActions.setCatalog.type,
        effect: (
            _action: unknown,
            listenerApi: {
                dispatch: AppDispatch;
                getState: () => RootState;
            },
        ) => {
            const state = listenerApi.getState();
            const { dealId, domain } = state.app;
            const catalogReady = state.catalog.loading === 'succeeded';
            if (!dealId || !domain || !catalogReady) return; // сойдётся на втором событии
            if (state.snapshot.status !== 'idle') return; // однократность

            const fallbackRecord =
                IS_REMEMBER_DEV && !IS_PROD && dealId === TESTING_DEAL_ID
                    ? (legacyRecord as unknown as V1Record)
                    : null;
            listenerApi.dispatch(
                restoreSnapshot({ domain, dealId, fallbackRecord }),
            );
        },
    });
}

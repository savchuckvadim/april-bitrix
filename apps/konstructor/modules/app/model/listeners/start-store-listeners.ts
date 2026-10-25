import { isAnyOf, type ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import {
    setupAcademyDurationListener,
    setupProviderTaxListener,
    setupRowSetSyncListener,
} from '@/modules/entities/row-set';
import { APP_DEP, appActions } from '../AppSlice';
import { initCatalog } from '@/modules/entities/catalog';
import {
    applyDealProvider,
    documentProvidertAC,
    initProviders,
} from '@/modules/entities/provider';
import {
    getComplectVariantPbxSmartEntityId,
    initPortal,
} from '@/modules/entities/portal';
import { restoreSnapshot, snapshotActions } from '@/modules/entities/snapshot';
import { bxrqActions, fetchBXRQ, RQ_TYPE } from '@/modules/entities/bx-rq';
import { getDealClientType } from '@/modules/entities/deal';
import { fetchLibraryRights } from '@/modules/entities/library';
import { wordTemplateAC, wordTemplatePdfPreviewAC } from '@/modules/entities/offer-template-word';
import { offerDocumentActions } from '@/modules/entities/offer-document';
import { contractDocumentActions } from '@/modules/entities/contract-document';
import { supplyReportActions } from '@/modules/entities/supply-report-document';
import { fetchAppSettings } from '@/modules/entities/app-settings';
import { zakupkiActions } from '@/modules/entities/zakupki';
import { initServiceOffer, serviceOfferActions } from '@/modules/entities/service-offer';
import { complectDescriptionActions } from '@/modules/entities/complect-description';
import { rowSetActions } from '@/modules/entities/row-set';
import {
    fetchComplectVariants,
    syncOpenComplectVariant,
} from '@/modules/entities/complect-variant';

/** Типизированная регистрация: без `as unknown as` на каждом слушателе. */
const typed = (listenerMiddleware: ListenerMiddlewareInstance) =>
    listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

/**
 * Единая точка регистрации реакций «X случилось → сделать Y»
 * (правило монорепы: listeners вместо вложенных thunk'ов).
 * Порядок: данные приложения → restore слепка → варианты → поставщик → row-set.
 * Все данные — только с нашего бэка: фикстур в рантайме нет.
 */
export function startStoreListeners(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    setupAppDataListener(listenerMiddleware);
    setupSnapshotRestoreListener(listenerMiddleware);
    setupComplectVariantsListener(listenerMiddleware);
    setupServiceOfferListener(listenerMiddleware);
    setupDepartmentContextListener(listenerMiddleware);
    setupDealProviderListener(listenerMiddleware);
    setupRqListener(listenerMiddleware);
    setupTemplateIdListener(listenerMiddleware);
    setupOpenVariantSyncListener(listenerMiddleware);
    setupOfferPreviewStaleListener(listenerMiddleware);
    setupRowSetSyncListener(listenerMiddleware);
    setupProviderTaxListener(listenerMiddleware);
    setupAcademyDurationListener(listenerMiddleware);
}

/**
 * setAppData (boot завершён: domain/user/dealId известны) →
 * параллельные загрузки: каталог init v2, поставщики, портал.
 * Легаси HTML-КП (базовый шаблон, HTML-шаблоны) со старта не грузится —
 * стек заморожен (решение владельца 24.10), его страницы грузят своё сами.
 */
function setupAppDataListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: appActions.setAppData,
        effect: (action, listenerApi) => {
            const { domain, deal, user } = action.payload;
            listenerApi.dispatch(initCatalog({ domain }));
            // Поставщики портала (налог, реквизиты документов)
            void listenerApi.dispatch(initProviders(domain, Number(user.ID)));
            // Портал (pbx): bitrixfields по code — источник UF-id для
            // deal-send (B4, решение владельца: fields/stages только из pbx)
            listenerApi.dispatch(initPortal({ domain, deal }));
            // права в библиотеке заготовок (видимости по роли) — к моменту «В избранное»
            void listenerApi.dispatch(fetchLibraryRights());
            // шапка КП (получатель, счёт) считается от сделки заново
            listenerApi.dispatch(offerDocumentActions.reset());
            listenerApi.dispatch(contractDocumentActions.reset());
            listenerApi.dispatch(supplyReportActions.reset());
            listenerApi.dispatch(zakupkiActions.reset());
            listenerApi.dispatch(serviceOfferActions.reset());
            listenerApi.dispatch(complectDescriptionActions.reset());
            // портальные настройки приложения (swrCache): флаги экранов
            void listenerApi.dispatch(fetchAppSettings(domain));
        },
    });
}

/**
 * Условие-джойн «placement дал dealId» × «каталог готов» → восстановление
 * слепка сделки (restoreSnapshot). Однократно (гард по snapshot.status).
 */
function setupSnapshotRestoreListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    typed(listenerMiddleware)({
        matcher: isAnyOf(appActions.setAppData, initCatalog.fulfilled),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const { dealId, domain } = state.app;
            const catalogReady = state.catalog.loading === 'succeeded';
            if (!dealId || !domain || !catalogReady) return; // сойдётся на втором событии
            if (state.snapshot.status !== 'idle') return; // однократность
            void listenerApi.dispatch(restoreSnapshot({ domain, dealId }));
        },
    });
}

/**
 * Портал загружен (известно, есть ли смарт вариантов) × сделка есть →
 * варианты КП сделки. Нужны уже на входе: при вариантах менеджер сначала
 * выбирает, с каким работать (docs/routing.md §1). Однократно.
 */
function setupComplectVariantsListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    typed(listenerMiddleware)({
        actionCreator: initPortal.fulfilled,
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const hasSmart = Boolean(
                getComplectVariantPbxSmartEntityId(state.portal.current),
            );
            if (!state.app.dealId || !hasSmart) return;
            if (state.complectVariant.status !== 'idle') return;
            void listenerApi.dispatch(fetchComplectVariants());
        },
    });
}

/**
 * Портал загружен (известен ключ поля `document_provider`) или список
 * поставщиков пришёл → поставщик из сделки сильнее настройки пользователя.
 */
function setupDealProviderListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    typed(listenerMiddleware)({
        matcher: isAnyOf(initPortal.fulfilled, documentProvidertAC.setFetched),
        effect: (_action, listenerApi) => {
            listenerApi.dispatch(applyDealProvider());
        },
    });
}

/**
 * Слепок сделки сохранён → при открытом варианте комплекта то же состояние
 * уходит и в вариант. В оба места намеренно: вариант получает правки без
 * отдельной кнопки, а слепок сделки остаётся актуальным для перезагрузки —
 * даже если смарт вариантов с портала снимут.
 */
function setupOpenVariantSyncListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    typed(listenerMiddleware)({
        actionCreator: snapshotActions.saveDone,
        effect: (_action, listenerApi) => {
            void listenerApi.dispatch(syncOpenComplectVariant());
        },
    });
}

/**
 * Реквизиты компании: грузятся с нашего бэка, как только известна компания
 * (setAppData); когда реквизиты и портал на месте — выбирается набор по типу
 * клиента из pbx-поля сделки (op_client_type), без него — организация.
 */
function setupRqListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: appActions.setAppData,
        effect: (action, listenerApi) => {
            const { domain, company } = action.payload;
            if (!company?.ID) return;
            void listenerApi.dispatch(fetchBXRQ(domain, Number(company.ID)));
        },
    });
    typed(listenerMiddleware)({
        matcher: isAnyOf(bxrqActions.setFetched, initPortal.fulfilled),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            if (!state.bxrq.rqs) return;
            const clientType =
                getDealClientType(
                    state.portal.current?.bitrixDeal ?? undefined,
                    state.app.bitrix.deal ?? undefined,
                ) ?? RQ_TYPE.ORGANIZATION;
            listenerApi.dispatch(bxrqActions.setCurrentRqItems({ clientType }));
        },
    });
}

/**
 * Выбор текущего Word-шаблона → templateId слепка: слепок сделки и заготовки
 * библиотеки запоминают, каким шаблоном печатать КП (6.6).
 */
function setupTemplateIdListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: wordTemplateAC.setCurrentTemplate,
        effect: (action, listenerApi) => {
            const id = action.payload ? Number(action.payload.id) : null;
            listenerApi.dispatch(
                snapshotActions.setTemplateId(Number.isFinite(id) && id ? id : null),
            );
        },
    });
}

/**
 * Шапка КП, поставщик или сборка изменились после готового PDF-превью →
 * пометить превью устаревшим. Само превью не перезапрашиваем: генерация
 * дорогая, менеджер обновляет кнопкой, когда закончил правки.
 */
function setupOfferPreviewStaleListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        matcher: isAnyOf(
            offerDocumentActions.setRecipientField,
            offerDocumentActions.setRecipientCase,
            offerDocumentActions.setInvoiceAnswer,
            offerDocumentActions.setInvoiceDate,
            offerDocumentActions.setInvoiceNumber,
            documentProvidertAC.setCurrent,
            rowSetActions.upsertRow,
            rowSetActions.editRowCommercial,
            rowSetActions.editTotalCommercial,
            rowSetActions.setRowComposition,
        ),
        effect: (_action, listenerApi) => {
            const preview = listenerApi.getState().wordTemplatePdfPreview;
            if (preview.previewPhase !== 'ready' || preview.needUpdate) return;
            listenerApi.dispatch(wordTemplatePdfPreviewAC.setNeedUpdate(true));
        },
    });
}

/**
 * Отдел известен → контекст сборки: сервисному отделу доступен средний пакет
 * LT-other (вес 4), строки сетов пересобираются по этому признаку.
 */
function setupDepartmentContextListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: appActions.setDepartment,
        effect: (action, listenerApi) => {
            listenerApi.dispatch(
                rowSetActions.setContext({ serviceDepartment: action.payload === APP_DEP.SERVICE }),
            );
        },
    });
}

/**
 * Портал загружен (известен отдел и смарт service_offer) × сделка есть →
 * слепки периодов сервисного отдела. Не сервисный отдел — thunk сам выходит.
 */
function setupServiceOfferListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: initPortal.fulfilled,
        effect: (_action, listenerApi) => {
            void listenerApi.dispatch(initServiceOffer());
        },
    });
}

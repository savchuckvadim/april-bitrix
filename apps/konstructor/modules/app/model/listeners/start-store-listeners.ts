import { isAnyOf, type ListenerMiddlewareInstance } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store';
import {
    setupAcademyTermListener,
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
import { bxrqActions, fetchBXRQ } from '@/modules/entities/bx-rq';
import { selectClientTypeOrDefault } from '@/modules/entities/deal';
import { fetchLibraryRights, libraryActions } from '@/modules/entities/library';
import {
    applyRememberedWordTemplate,
    wordTemplateAC,
    wordTemplatePdfPreviewAC,
} from '@/modules/entities/offer-template-word';
import { offerDocumentActions } from '@/modules/entities/offer-document';
// прямыми путями, мимо барреля с UI: слушатели попадают в бандл оболочки
import { setupOfferPdfManagerPrefsListener } from '@/modules/entities/offer-pdf/model/listeners';
import { loadOfferPdfManagerPrefs } from '@/modules/entities/offer-pdf/model/OfferPdfPrefsThunk';
import { offerPdfActions } from '@/modules/entities/offer-pdf/model/OfferPdfSlice';
import { contractDocumentActions } from '@/modules/entities/contract-document';
import { supplyReportActions } from '@/modules/entities/supply-report-document';
import { fetchAppSettings } from '@/modules/entities/app-settings';
import { zakupkiActions } from '@/modules/entities/zakupki';
import { initServiceOffer, serviceOfferActions } from '@/modules/entities/service-offer';
import {
    ComplectDescriptionHelper,
    complectDescriptionActions,
} from '@/modules/entities/complect-description';
import { rowSetActions } from '@/modules/entities/row-set';
import { compositionViewActions } from '@/modules/features/composition-editor/model/CompositionViewSlice';
import { fetchCompositionView } from '@/modules/features/composition-editor/model/CompositionViewThunk';
import {
    fetchComplectVariants,
    syncOpenComplectVariant,
} from '@/modules/entities/complect-variant';
import { isContractSpecStaleAction, isOfferPreviewStaleAction } from '../../lib/stale-actions';
import { setupProviderTaxListener } from './provider-tax.listener';

const complectDescriptionHelper = new ComplectDescriptionHelper();

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
    setupRememberedDocumentListener(listenerMiddleware);
    setupOfferPdfManagerPrefsListener(listenerMiddleware);
    setupOpenVariantSyncListener(listenerMiddleware);
    setupOfferPreviewStaleListener(listenerMiddleware);
    setupContractStaleListener(listenerMiddleware);
    setupComplectDescriptionListener(listenerMiddleware);
    setupRowSetSyncListener(listenerMiddleware);
    setupProviderTaxListener(listenerMiddleware);
    setupAcademyTermListener(listenerMiddleware);
}

/**
 * setAppData (boot завершён: domain/user/dealId известны) →
 * параллельные загрузки: каталог init v2, поставщики, портал.
 * Легаси HTML-КП (базовый шаблон, HTML-шаблоны) со старта не грузится —
 * стек заморожен (решение владельца 24.10), его страницы грузят своё сами.
 */
function setupAppDataListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: libraryActions.setRights,
        // признак суперпользователя приходит с правами библиотеки
        effect: (action, listenerApi) => {
            listenerApi.dispatch(appActions.setSuperUser(action.payload.isSuperUser));
        },
    });

    // Сессия портала открыта → каталог стартует сразу: ему нужны только домен и
    // токен. Пользователь, сделка и компания в это время ещё в пути
    // (docs/first-load.tasks.md, шаг 4).
    typed(listenerMiddleware)({
        actionCreator: appActions.portalSessionReady,
        effect: (action, listenerApi) => {
            listenerApi.dispatch(initCatalog({ domain: action.payload.domain }));
        },
    });

    typed(listenerMiddleware)({
        actionCreator: appActions.setAppData,
        effect: (action, listenerApi) => {
            const { domain, deal, user } = action.payload;
            // каталог обычно уже запущен по готовности сессии; здесь — если нет или упал
            const catalogLoading = listenerApi.getState().catalog.loading;
            if (catalogLoading === 'idle' || catalogLoading === 'failed') {
                listenerApi.dispatch(initCatalog({ domain }));
            }
            // Поставщики портала (налог, реквизиты документов)
            void listenerApi.dispatch(initProviders(domain, Number(user.ID)));
            // Портал (pbx): bitrixfields по code — источник UF-id для
            // deal-send (B4, решение владельца: fields/stages только из pbx)
            listenerApi.dispatch(initPortal({ domain, deal }));
            // права в библиотеке заготовок (видимости по роли) — к моменту «В избранное»
            void listenerApi.dispatch(fetchLibraryRights());
            // шапка КП (получатель, счёт) считается от сделки заново
            listenerApi.dispatch(offerDocumentActions.reset());
            // КП: письмо и номер — от сделки, стиль — последний выбор менеджера
            listenerApi.dispatch(offerPdfActions.resetDocument());
            void listenerApi.dispatch(loadOfferPdfManagerPrefs());
            listenerApi.dispatch(contractDocumentActions.reset());
            listenerApi.dispatch(supplyReportActions.reset());
            listenerApi.dispatch(zakupkiActions.reset());
            listenerApi.dispatch(serviceOfferActions.reset());
            listenerApi.dispatch(complectDescriptionActions.reset());
            // портальные настройки приложения (swrCache): флаги экранов
            void listenerApi.dispatch(fetchAppSettings(domain));
            // личная настройка: вид наполнения и видимость весов
            const bxUserId = Number(user.ID);
            listenerApi.dispatch(
                compositionViewActions.setOwner(
                    domain && bxUserId > 0 ? { domain, bxUserId } : null,
                ),
            );
            void listenerApi.dispatch(fetchCompositionView());
        },
    });
}

const isCatalogSettled = (state: RootState): boolean =>
    state.catalog.loading === 'succeeded' || state.catalog.loading === 'failed';

/**
 * Placement дал dealId → восстановление слепка сделки (restoreSnapshot).
 * Запрос слепка уходит сразу, рядом с каталогом: ему нужны только домен и
 * сделка. Раскладка по стейту ждёт каталог (docs/first-load.tasks.md, шаг 1).
 * Однократно (гард по snapshot.status).
 */
function setupSnapshotRestoreListener(
    listenerMiddleware: ListenerMiddlewareInstance,
) {
    typed(listenerMiddleware)({
        actionCreator: appActions.setAppData,
        // эффект ждёт thunk: с его завершением слушатель снимает ожидание каталога
        effect: async (_action, listenerApi) => {
            const state = listenerApi.getState();
            const { dealId, domain } = state.app;
            if (!dealId || !domain) return;
            if (state.snapshot.status !== 'idle') return; // однократность

            // подписка на каталог — до запроса слепка: ответ каталога не проскочит мимо
            const catalogReady = (
                isCatalogSettled(state)
                    ? Promise.resolve(true)
                    : listenerApi.condition((_next, current) =>
                          isCatalogSettled(current),
                      )
            )
                .then(() => listenerApi.getState().catalog.loading === 'succeeded')
                .catch(() => false);

            await listenerApi.dispatch(
                restoreSnapshot({ domain, dealId, catalogReady }),
            );
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
 *
 * Цикла нет: syncOpenComplectVariant записывает вариант и завершается, saveSnapshot
 * он не вызывает, поэтому за ним saveDone не следует. Открытие и создание
 * варианта зовут saveSnapshot сами — слушатель в ответ делает одну запись
 * варианта тем же состоянием.
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
 * (setAppData). Набор по типу клиента (op_client_type компании из шапки,
 * затем сделки, без него — организация) пересчитывается, когда пришли
 * реквизиты или портал, сменился тип в шапке или восстановился слепок с
 * выбранным реквизитом. Выбор реквизита уходит в слепок (rqId).
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
        matcher: isAnyOf(
            bxrqActions.setFetched,
            initPortal.fulfilled,
            appActions.patchCompany,
            snapshotActions.restored,
        ),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            if (!state.bxrq.rqs) return;
            listenerApi.dispatch(
                bxrqActions.setCurrentRqItems({
                    clientType: selectClientTypeOrDefault(state),
                    currentRqId: state.snapshot.rqId ?? undefined,
                }),
            );
        },
    });
    typed(listenerMiddleware)({
        matcher: isAnyOf(
            bxrqActions.setCurrentRqItems,
            bxrqActions.setCurrentItem,
            bxrqActions.saveBaseCreating,
        ),
        effect: (_action, listenerApi) => {
            const state = listenerApi.getState();
            const id = state.bxrq.current.item?.bx_id ?? 0;
            const next = id > 0 ? id : null;
            if (next !== state.snapshot.rqId) {
                listenerApi.dispatch(snapshotActions.setRqId(next));
            }
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
 * Слепок восстановлен (сделка, вариант, заготовка из избранного) → документ
 * печатается так же, как в нём: формат и стиль КП, Word-шаблон. Word-шаблон
 * при первом входе применяет init, здесь — когда список уже загружен.
 */
function setupRememberedDocumentListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: snapshotActions.restored,
        effect: (action, listenerApi) => {
            const { pdf } = action.payload;
            if (pdf) listenerApi.dispatch(offerPdfActions.applySnapshot(pdf));
            void listenerApi.dispatch(applyRememberedWordTemplate());
        },
    });
}

/**
 * Шапка КП, поставщик, сборка или Word-шаблон изменились после готового
 * PDF-превью → пометить превью устаревшим. Список действий — в
 * isOfferPreviewStaleAction. Само превью не перезапрашиваем: генерация
 * дорогая, менеджер обновляет кнопкой, когда закончил правки.
 */
function setupOfferPreviewStaleListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        matcher: isOfferPreviewStaleAction,
        effect: (_action, listenerApi) => {
            const preview = listenerApi.getState().wordTemplatePdfPreview;
            if (preview.previewPhase !== 'ready' || preview.needUpdate) return;
            listenerApi.dispatch(wordTemplatePdfPreviewAC.setNeedUpdate(true));
        },
    });
}

/**
 * Сборка изменилась после загруженной спецификации договора → пометить её
 * устаревшей (список действий — в isContractSpecStaleAction, там же раскладка
 * слепка). Отчёт о поставке берёт состав и суммы оттуда; перезапрашивать на
 * каждый вход нельзя — сотрёт ручные правки менеджера в спецификации.
 */
function setupContractStaleListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        matcher: isContractSpecStaleAction,
        effect: (_action, listenerApi) => {
            listenerApi.dispatch(contractDocumentActions.formStale());
        },
    });
}

/**
 * Запрошено описание комплекта → файл собирается на бэке и кладётся в хранилище
 * портала, под кнопкой появляется ссылка на него.
 */
function setupComplectDescriptionListener(listenerMiddleware: ListenerMiddlewareInstance) {
    typed(listenerMiddleware)({
        actionCreator: complectDescriptionActions.requested,
        effect: async (action, listenerApi) => {
            const { domain, bitrix } = listenerApi.getState().app;
            try {
                const result = await complectDescriptionHelper.generate({
                    ...action.payload,
                    domain,
                    userId: Number(bitrix.user?.ID) || 0,
                });
                listenerApi.dispatch(complectDescriptionActions.done(result));
            } catch (error) {
                listenerApi.dispatch(
                    complectDescriptionActions.failed(
                        error instanceof Error
                            ? error.message
                            : 'описание комплекта не сформировано',
                    ),
                );
            }
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

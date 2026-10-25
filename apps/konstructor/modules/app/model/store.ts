import {
    Action,
    combineReducers,
    configureStore,
    createListenerMiddleware,
    Middleware,
    ThunkAction,
} from '@reduxjs/toolkit';
import { appReducer } from './AppSlice';
import { catalogReducer } from '@/modules/entities/catalog';
import { rowSetReducer } from '@/modules/entities/row-set';
import { offerTemplateBlockReducer } from '@/modules/entities/offer-template-block';
import { offerTemplateReducer } from '@/modules/entities/offer-template';
import { offerTemplateKonstructorReducer } from '@/modules/entities/offer-template-konstructor';
import { offerReducer } from '@/modules/entities/offer';
import { errorHandler } from '../lib/error-handler';
import { wordTemplate, wordTemplatePdfPreviewReducer } from '@/modules/entities/offer-template-word/';
import { portalReducer } from '@/modules/entities/portal';
import { documentProviderReducer } from '@/modules/entities/provider';
import { dealReducer } from '@/modules/entities/deal';
import { bxrqReducer } from '@/modules/entities/bx-rq';
import { snapshotReducer } from '@/modules/entities/snapshot';
import { complectVariantReducer } from '@/modules/entities/complect-variant';
import { libraryReducer } from '@/modules/entities/library';
import { offerDocumentReducer } from '@/modules/entities/offer-document';
import { contractDocumentReducer } from '@/modules/entities/contract-document';
import { supplyReportReducer } from '@/modules/entities/supply-report-document';
import { appSettingsReducer } from '@/modules/entities/app-settings';
import { zakupkiReducer } from '@/modules/entities/zakupki';
import { serviceOfferReducer } from '@/modules/entities/service-offer';
import { complectDescriptionReducer } from '@/modules/entities/complect-description';
import { dealSendReducer } from '@/modules/features/deal-send';
import { startStoreListeners } from './listeners/start-store-listeners';

export const listenerMiddleware = createListenerMiddleware();

const rootReducer = combineReducers({
    app: appReducer,
    bxrq: bxrqReducer,

    deal: dealReducer,
    // ядро конструктора (code-джойны)
    catalog: catalogReducer,
    rowSet: rowSetReducer,
    snapshot: snapshotReducer,
    // варианты комплекта: несколько предложений внутри одной сделки
    complectVariant: complectVariantReducer,
    // избранное и акции (библиотека заготовок)
    library: libraryReducer,
    // отправка сделки в Bitrix (статус/skipped) — фича deal-send
    dealSend: dealSendReducer,
    // шапка КП (получатель, счёт) и статус генерации — экран документа
    offerDocument: offerDocumentReducer,
    // договор: поля сделки, спецификация с бэка, статус генерации
    contractDocument: contractDocumentReducer,
    // отчёт о поставке: форма для отдела сервиса, файлы, заявка RPA
    supplyReport: supplyReportReducer,
    // портальные настройки приложения (флаги вроде «3 КП для торгов»)
    appSettings: appSettingsReducer,
    // «3 КП для торгов»: поставщики 1/2 и генерация
    zakupki: zakupkiReducer,
    // сервисный отдел: период «текущий / следующий» (смарт service_offer)
    serviceOffer: serviceOfferReducer,
    complectDescription: complectDescriptionReducer,
    portal: portalReducer,

    documentProvider: documentProviderReducer,
    // Легаси HTML-КП (/offer/**): заморожен, со старта не грузится
    offer: offerReducer,
    offerTemplate: offerTemplateReducer,
    offerTemplateBlock: offerTemplateBlockReducer,
    offerTemplateKonstructor: offerTemplateKonstructorReducer,
    offerTemplateWord: wordTemplate,
    wordTemplatePdfPreview: wordTemplatePdfPreviewReducer,
});

// Middleware для обработки ошибок
const errorMiddleware: Middleware = () => next => action => {
    try {
        return next(action);
    } catch (error) {
        console.error('Redux Error:', error);
        errorHandler.handleAsyncError(error);
        return next(action);
    }
};

export const setupStore = () => {
    return configureStore({
        reducer: rootReducer,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware()
                .concat(errorMiddleware)
                .concat(listenerMiddleware.middleware),
    });
};

/** Доп. аргумента у thunk'ов нет (extraArgument не задан): DAL — helper-классы слайсов. */
export type ThunkExtraArgument = undefined;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    ThunkExtraArgument,
    Action<string>
>;

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];

export const store = setupStore();

// Регистрация сразу после setupStore (kpi-sales-паттерн): слушатели живут
// на уровне стора, thunks о них не знают.
startStoreListeners(listenerMiddleware);

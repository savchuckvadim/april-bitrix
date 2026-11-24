import {
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import {
    appActions,
    appReducer,
    type InitApp,
} from '@/modules/app/model/AppSlice';
import type { AppStore } from '@/modules/app/model/store';
import {
    bxrqActions,
    bxrqReducer,
} from '@/modules/entities/bx-rq/model/BxRqSlice';
import {
    RQ_TYPE,
    type RqBundle,
    type RqRecord,
} from '@/modules/entities/bx-rq/model/types';
import type { Portal } from '@/modules/entities/portal';
import { portalReducer } from '@/modules/entities/portal/model/PortalSlice';
import { initPortal } from '@/modules/entities/portal/model/PortalThunk';
import { clientTypePromptReducer } from '../../model/ClientTypePromptSlice';

/**
 * Малый стор из слайсов, которые читают окно «Укажите тип клиента» и
 * автоопределение: приложение, портал, реквизиты, состояние окна. Полный тип
 * стора нужен только для dispatch thunk'ов и селекторов, поэтому приведение
 * здесь одно.
 */

/** Ключ поля «Тип клиента» компании на тестовом портале. */
export const COMPANY_FIELD_KEY = 'UF_CRM_OP_CLIENT_TYPE';
/** Ключ того же поля в сделке (на портале у сущностей разные bitrixId). */
export const DEAL_FIELD_KEY = 'UF_CRM_OP_CLIENT_TYPE_D';

/** bitrixId пунктов поля на тестовом портале: коды стабильны, id у каждого портала свои. */
export const ITEM_BITRIX_ID = {
    commerc: 31,
    ip: 32,
    state: 33,
    fiz: 34,
    layer: 35,
} as const;

const allItems = () =>
    Object.entries(ITEM_BITRIX_ID).map(([code, bitrixId]) => ({
        code,
        name: code,
        bitrixId,
    }));

interface PortalOptions {
    /** Коды пунктов поля; по умолчанию все пять. */
    itemCodes?: Array<keyof typeof ITEM_BITRIX_ID>;
    /** Поля «Тип клиента» на портале нет. */
    withoutField?: boolean;
}

/** Слепок портала с полем «Тип клиента» у компании и сделки (или без него). */
export const makePortal = ({
    itemCodes,
    withoutField,
}: PortalOptions = {}): Portal => {
    const items = allItems().filter(
        item =>
            !itemCodes ||
            itemCodes.includes(item.code as keyof typeof ITEM_BITRIX_ID),
    );
    const field = (bitrixId: string) =>
        withoutField ? [] : [{ code: 'op_client_type', bitrixId, items }];
    return {
        company: { bitrixfields: field('OP_CLIENT_TYPE') },
        bitrixDeal: { bitrixfields: field('OP_CLIENT_TYPE_D') },
    } as unknown as Portal;
};

const record = (bxId: number, type: RQ_TYPE): RqRecord =>
    ({ bx_id: bxId, type }) as unknown as RqRecord;

const GROUP_OF: Record<
    RQ_TYPE,
    RQ_TYPE.ORGANIZATION | RQ_TYPE.IP | RQ_TYPE.FIZ
> = {
    [RQ_TYPE.ORGANIZATION]: RQ_TYPE.ORGANIZATION,
    [RQ_TYPE.BUDGET]: RQ_TYPE.ORGANIZATION,
    [RQ_TYPE.IP]: RQ_TYPE.IP,
    [RQ_TYPE.FIZ]: RQ_TYPE.FIZ,
};

/** Пакет реквизитов компании: по реквизиту каждого типа из списка; в пустых группах — заготовка. */
export const makeBundle = (types: RQ_TYPE[]): RqBundle => {
    const group = (target: RQ_TYPE.ORGANIZATION | RQ_TYPE.IP | RQ_TYPE.FIZ) => {
        const items = types
            .map((type, index) => ({ type, id: index + 1 }))
            .filter(entry => GROUP_OF[entry.type] === target)
            .map(entry => record(entry.id, entry.type));
        const template = record(-1, target);
        return {
            items: items.length > 0 ? items : [template],
            default: template,
        };
    };
    return {
        [RQ_TYPE.ORGANIZATION]: group(RQ_TYPE.ORGANIZATION),
        [RQ_TYPE.IP]: group(RQ_TYPE.IP),
        [RQ_TYPE.FIZ]: group(RQ_TYPE.FIZ),
        current: null,
    };
};

export const COMPANY_ID = 7;

interface DealOptions {
    /** Поля компании Битрикса (например, значение типа клиента). */
    company?: Record<string, unknown>;
    /** Поля сделки Битрикса. */
    deal?: Record<string, unknown>;
    /** Сделка без компании. */
    noCompany?: boolean;
}

/** Данные сделки, как их кладёт загрузка приложения. */
export const dealData = ({
    company = {},
    deal = {},
    noCompany,
}: DealOptions = {}): InitApp =>
    ({
        domain: 'gsr.bitrix24.ru',
        dealId: 129487,
        user: { ID: 447 },
        deal: { ID: 129487, ...deal },
        company: noCompany
            ? null
            : { ID: COMPANY_ID, TITLE: 'ООО Ромашка', ...company },
    }) as unknown as InitApp;

export interface PromptStore {
    store: AppStore;
    listenerMiddleware: ListenerMiddlewareInstance;
}

/** Пустой малый стор; слушатели подключает тест, которому они нужны. */
export const makePromptStore = (): PromptStore => {
    const listenerMiddleware = createListenerMiddleware();
    const store = configureStore({
        reducer: {
            app: appReducer,
            portal: portalReducer,
            bxrq: bxrqReducer,
            clientTypePrompt: clientTypePromptReducer,
        },
        middleware: getDefault =>
            getDefault().concat(listenerMiddleware.middleware),
    });
    return {
        store: store as unknown as AppStore,
        listenerMiddleware: listenerMiddleware as ListenerMiddlewareInstance,
    };
};

/** Сделка загружена. */
export const loadDeal = (store: AppStore, options?: DealOptions) =>
    store.dispatch(appActions.setAppData(dealData(options)));

/** Слепок портала загружен: тем же действием, что и настоящий initPortal. */
export const loadPortal = (store: AppStore, portal: Portal) =>
    store.dispatch(
        initPortal.fulfilled(portal, 'test', {
            domain: 'gsr.bitrix24.ru',
            deal: null,
        }),
    );

/** Реквизиты компании загружены. */
export const loadRequisites = (store: AppStore, types: RQ_TYPE[]) =>
    store.dispatch(bxrqActions.setFetched({ bxrq: makeBundle(types) }));

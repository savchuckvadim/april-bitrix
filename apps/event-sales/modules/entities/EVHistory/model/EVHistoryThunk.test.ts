import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';

/**
 * История без дубля `/duplicates/details` (todo Б5).
 *
 * Что здесь защищается:
 * 1. на старт уходит ОДИН details-запрос — листенера RelatedCrm, с
 *    includeClosed:true (полный граф); история берёт ответ из стора;
 * 2. раскрытие во время полёта запроса листенера — история ЖДЁТ его
 *    (будильник related-crm-wait), а не шлёт второй такой же;
 * 3. история грузится один раз: повторные вызовы при loading/ready — no-op,
 *    кнопка «повторить» перечитывает ленты, но details не перезапрашивает;
 * 4. самопочинка: листенер упал или в сторе только открытый граф — история
 *    дозапрашивает полный сама, как раньше;
 * 5. ⟳ (reset слайсов) — новый цикл честно перезапрашивает всё по разу.
 *
 * Стор настоящий: редьюсеры relatedCrm/eventHistory и оба листенера
 * (RelatedCrmAppListener + settle-будильник) работают как в приложении,
 * подменена только сеть (RelatedCrmHelper, HistoryListHelper).
 */

const h = vi.hoisted(() => {
    const state = {
        /** Ответчик details; тест подменяет под сценарий. */
        respond: (async () => ({
            deals: [],
            leads: [],
            contacts: [],
        })) as (dto: Record<string, unknown>) => Promise<unknown>,
    };
    const getDetails = vi.fn((dto: Record<string, unknown>) =>
        state.respond(dto),
    );
    const getFirstPages = vi.fn(async (_ref: unknown, bindings: string[]) => {
        return new Map(
            bindings.map(binding => [
                binding,
                { elements: [], next: null, total: 0 },
            ]),
        );
    });
    return { state, getDetails, getFirstPages };
});

vi.mock('@/modules/entities/RelatedCrm/lib/api/related-crm-helper', () => ({
    RelatedCrmHelper: class {
        getDetails = h.getDetails;
    },
}));

vi.mock('@/modules/entities/EVHistory/lib/api/history-list-helper', () => ({
    HISTORY_PAGE_SIZE: 50,
    HistoryListHelper: class {
        getFirstPages = h.getFirstPages;
        getPage = vi.fn();
    },
}));

import type { AppDispatch, AppStartListening } from '@/modules/app/model/store';
import { appActions } from '@/modules/app/model/slice/AppSlice';
import {
    relatedCrmActions,
    relatedCrmReducer,
} from '@/modules/entities/RelatedCrm/model/RelatedCrmSlice';
import { startRelatedCrmAppListener } from '@/modules/entities/RelatedCrm/model/RelatedCrmAppListener';
import {
    notifyRelatedDetailsSettled,
    startRelatedCrmSettleListener,
} from '@/modules/entities/RelatedCrm/lib/related-crm-wait';
import { eventHistoryActions, eventHistoryReducer } from './EVHistorySlice';
import { loadEventSalesHistory } from './EVHistoryThunk';

/** Портал со списком «ОП История» (sales_history) — минимум для ref. */
const portalWithHistory = {
    bitrixLists: [
        {
            group: 'sales',
            type: 'history',
            bitrixId: '77',
            bitrixfields: [
                {
                    code: 'sales_history_crm',
                    bitrixCamelId: 'PROPERTY_900',
                    items: [],
                },
                {
                    code: 'sales_history_event_date',
                    bitrixCamelId: 'PROPERTY_901',
                    items: [],
                },
            ],
        },
    ],
};

/** Полный граф клиента: одна ЗАКРЫТАЯ сделка — открытый граф её не отдал бы. */
const detailsOf = () => ({
    entityType: 'COMPANY',
    entityId: 1,
    deals: [
        {
            id: 5,
            title: 'Прошлогодняя продажа',
            stage: { id: 'WON', title: 'Успех' },
            closed: true,
        },
    ],
    leads: [],
    contacts: [],
    batchRequests: 1,
    warnings: [],
});

const setAppDataAction = () =>
    appActions.setAppData({
        domain: 'test.bitrix24.ru',
        user: null,
        placement: null,
        deal: null,
        company: null,
        lead: null,
    } as never);

const makeHarness = (options: { withPortalList?: boolean } = {}) => {
    const appState = {
        domain: 'test.bitrix24.ru',
        bitrix: {
            from: 'COMPANY',
            company: { ID: '1', TITLE: 'Ромашка' },
            deal: null,
            lead: null,
            user: { ID: '7' },
        },
    };
    const portalState = {
        portal: options.withPortalList === false ? null : portalWithHistory,
    };
    const taskState = { current: null, tasks: [] };

    const listener = createListenerMiddleware();
    startRelatedCrmAppListener(
        listener.startListening as unknown as AppStartListening,
    );
    startRelatedCrmSettleListener(
        listener.startListening as unknown as AppStartListening,
    );

    const store = configureStore({
        reducer: {
            app: (state = appState) => state,
            portal: (state = portalState) => state,
            eventTask: (state = taskState) => state,
            relatedCrm: relatedCrmReducer,
            eventHistory: eventHistoryReducer,
        },
        middleware: getDefault =>
            getDefault({ serializableCheck: false }).prepend(
                listener.middleware,
            ),
    });

    return {
        store,
        /** Диспатч thunk'ов под типом приложения (возвращает их промис). */
        dispatchThunk: store.dispatch as unknown as AppDispatch,
    };
};

/** Дать листенер-эффектам и микрозадачам thunk'ов доработать. */
const flush = () => new Promise(resolve => setTimeout(resolve, 0));

beforeEach(() => {
    h.getDetails.mockClear();
    h.getFirstPages.mockClear();
    h.state.respond = async () => detailsOf();
    // Ошибочные сценарии шумят console.error намеренно — глушим в тестах.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
    // Отпустить возможных застрявших ожидающих related-crm-wait.
    notifyRelatedDetailsSettled();
    vi.restoreAllMocks();
});

describe('история без дубля details-запроса', () => {
    it('старт: листенер грузит полный граф один раз, история берёт его из стора', async () => {
        const { store, dispatchThunk } = makeHarness();

        store.dispatch(setAppDataAction());
        await flush();

        // Один запрос листенера, полный граф.
        expect(h.getDetails).toHaveBeenCalledTimes(1);
        expect(h.getDetails).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                entityType: 'COMPANY',
                entityId: 1,
                includeClosed: true,
            }),
        );
        expect(store.getState().relatedCrm.key).toBe('COMPANY:1:all');
        expect(store.getState().relatedCrm.status).toBe('ready');

        // Показ секции: история собирает ленты БЕЗ второго details-запроса,
        // закрытая сделка из полного графа получает свою ленту.
        await dispatchThunk(loadEventSalesHistory());
        expect(h.getDetails).toHaveBeenCalledTimes(1);
        expect(h.getFirstPages).toHaveBeenCalledTimes(1);
        expect(h.getFirstPages).toHaveBeenNthCalledWith(1, expect.anything(), [
            'CO_1',
            'D_5',
        ]);
        expect(store.getState().eventHistory.status).toBe('ready');
        expect(
            store
                .getState()
                .eventHistory.groups.map(group => group.binding.value),
        ).toEqual(['CO_1', 'D_5']);

        // «Грузится один раз»: повторный показ при ready — тишина.
        await dispatchThunk(loadEventSalesHistory());
        expect(h.getFirstPages).toHaveBeenCalledTimes(1);

        // «Повторить» перечитывает ленты, но details не перезапрашивает.
        await dispatchThunk(loadEventSalesHistory({ reset: true }));
        expect(h.getFirstPages).toHaveBeenCalledTimes(2);
        expect(h.getDetails).toHaveBeenCalledTimes(1);
    });

    it('показ во время полёта запроса листенера — история ждёт его, а не шлёт второй', async () => {
        const { store, dispatchThunk } = makeHarness();

        let release!: (details: unknown) => void;
        h.state.respond = () =>
            new Promise(resolve => {
                release = resolve;
            });

        store.dispatch(setAppDataAction());
        await flush();
        expect(store.getState().relatedCrm.status).toBe('loading');

        const loading = dispatchThunk(loadEventSalesHistory());
        await flush();
        // Второго details-запроса нет, история честно в loading.
        expect(h.getDetails).toHaveBeenCalledTimes(1);
        expect(store.getState().eventHistory.status).toBe('loading');
        expect(h.getFirstPages).not.toHaveBeenCalled();

        // Параллельный показ при летящей истории — мгновенный no-op.
        await dispatchThunk(loadEventSalesHistory());
        expect(h.getDetails).toHaveBeenCalledTimes(1);

        // Ответ листенера будит ожидание (настоящий settle-листенер).
        release(detailsOf());
        await loading;

        expect(h.getDetails).toHaveBeenCalledTimes(1);
        expect(h.getFirstPages).toHaveBeenCalledTimes(1);
        expect(h.getFirstPages).toHaveBeenNthCalledWith(1, expect.anything(), [
            'CO_1',
            'D_5',
        ]);
        expect(store.getState().eventHistory.status).toBe('ready');
    });

    it('листенер упал — история дозапрашивает полный граф сама (самопочинка)', async () => {
        const { store, dispatchThunk } = makeHarness();

        h.state.respond = async () => {
            throw new Error('портал не ответил');
        };
        store.dispatch(setAppDataAction());
        await flush();
        expect(store.getState().relatedCrm.status).toBe('error');

        h.state.respond = async () => detailsOf();
        await dispatchThunk(loadEventSalesHistory());

        expect(h.getDetails).toHaveBeenCalledTimes(2);
        expect(h.getDetails).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({ includeClosed: true }),
        );
        expect(store.getState().eventHistory.status).toBe('ready');
        expect(
            store
                .getState()
                .eventHistory.groups.map(group => group.binding.value),
        ).toEqual(['CO_1', 'D_5']);
    });

    it('в сторе только открытый граф — истории его мало, дозапрашивает полный', async () => {
        const { store, dispatchThunk } = makeHarness();

        // Тумблер «с закрытыми» выключили: в сторе ключ :open.
        store.dispatch(
            relatedCrmActions.fetchStarted({
                key: 'COMPANY:1:open',
                includeClosed: false,
            }),
        );
        store.dispatch(
            relatedCrmActions.fetchSucceeded({
                key: 'COMPANY:1:open',
                details: { ...detailsOf(), deals: [] } as never,
            }),
        );

        await dispatchThunk(loadEventSalesHistory());

        expect(h.getDetails).toHaveBeenCalledTimes(1);
        expect(h.getDetails).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({ includeClosed: true }),
        );
        expect(store.getState().eventHistory.status).toBe('ready');
    });

    it('⟳: после reset слайсов новый цикл перезапрашивает всё ровно по разу', async () => {
        const { store, dispatchThunk } = makeHarness();

        store.dispatch(setAppDataAction());
        await flush();
        await dispatchThunk(loadEventSalesHistory());
        expect(h.getDetails).toHaveBeenCalledTimes(1);
        expect(h.getFirstPages).toHaveBeenCalledTimes(1);

        // reload-reset: слайсы в initialState.
        store.dispatch(relatedCrmActions.reset());
        store.dispatch(eventHistoryActions.reset());
        expect(store.getState().eventHistory.status).toBe('idle');

        // Новый init-цикл: листенер перезапрашивает граф (ключ сброшен),
        // ре-показ секции — ленты, и снова без дубля details.
        store.dispatch(setAppDataAction());
        await flush();
        expect(h.getDetails).toHaveBeenCalledTimes(2);

        await dispatchThunk(loadEventSalesHistory());
        expect(h.getDetails).toHaveBeenCalledTimes(2);
        expect(h.getFirstPages).toHaveBeenCalledTimes(2);
        expect(store.getState().eventHistory.status).toBe('ready');
    });

    it('списка на портале нет — setListMissing без единого запроса', async () => {
        const { store, dispatchThunk } = makeHarness({ withPortalList: false });

        await dispatchThunk(loadEventSalesHistory());

        expect(store.getState().eventHistory.isListMissing).toBe(true);
        expect(h.getDetails).not.toHaveBeenCalled();
        expect(h.getFirstPages).not.toHaveBeenCalled();
    });
});

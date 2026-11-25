import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type {
    AppDispatch,
    RootState,
    ThunkExtraArgument,
} from '@/modules/app/model/store';
import reportReducer from '@/modules/entities/report/model/report-slice';
import callingStatisticsReducer from '@/modules/entities/calling-statistics/model/callingStatisticsSlice';
import {
    isLoadedKey,
    resetReportFlowMemory,
    setCurrentKey,
} from '../../report-queue.util';
import { flush } from '../../__tests__/report-flow-fixtures';
import {
    REPORT_QUEUE_WS_EVENTS,
    startReportQueueWsListener,
} from '../report-queue-ws.listener';

/*
 * WS-событие готовности — второй путь (после ответа запроса), которым
 * источник становится «загруженным» для ключа. События чужого (устаревшего)
 * ключа и ошибки расчёта отметку не ставят.
 */

type WsHandler = (payload: unknown) => void;

const { handlers } = vi.hoisted(() => ({
    handlers: new Map<string, (payload: unknown) => void>(),
}));

vi.mock('@/modules/app/model/ws-client', () => ({
    getWSClient: () => ({
        socket: { connected: true, once: () => undefined },
        on: (event: string, handler: (payload: unknown) => void) => {
            handlers.set(event, handler);
        },
    }),
}));
vi.mock('@/modules/entities/report/lib/api/report-helper', () => ({
    ReportHelper: class {
        getReport = vi.fn();
    },
}));
vi.mock('@/modules/entities/report/lib/api/filter-helper', () => ({
    ReportFilterHelper: class {
        save = vi.fn();
        getSaved = vi.fn();
    },
}));
vi.mock(
    '@/modules/entities/calling-statistics/lib/api/calling-statistics-helper',
    () => ({
        CallingStatisticsHelper: class {
            getStatistics = vi.fn();
        },
    }),
);

const KEY = '2026-11-01|2026-11-20|1_2';
const OLD_KEY = '2026-10-01|2026-10-31|1_2';
const GENERATED_AT = '2026-11-12T07:40:00.000Z';

let store: { getState: () => RootState };

/** Обработчик подписан один раз на модуль — стор общий на все тесты файла. */
beforeAll(async () => {
    const listener = createListenerMiddleware();
    const created = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            callingStatistics: callingStatisticsReducer,
        }),
        middleware: getDefault =>
            getDefault().prepend(listener.middleware),
    });
    startReportQueueWsListener(
        listener as unknown as ListenerMiddlewareInstance<
            RootState,
            AppDispatch,
            ThunkExtraArgument
        >,
    );
    created.dispatch(
        appActions.setAppData({
            domain: 'test.bitrix24.ru',
            user: { ID: 99 } as unknown as BXUser,
        }),
    );
    await flush();
    store = created as unknown as { getState: () => RootState };
});

beforeEach(() => {
    resetReportFlowMemory();
});

afterEach(() => {
    vi.restoreAllMocks();
});

const handler = (event: string): WsHandler => {
    const found = handlers.get(event);
    if (!found) throw new Error(`обработчик ${event} не подписан`);
    return found;
};

describe('WS-событие готовности отчёта', () => {
    it('текущий ключ: данные применены, источник загружен для ключа', () => {
        setCurrentKey('report', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: KEY,
            data: [],
        });

        expect(isLoadedKey('report', KEY)).toBe(true);
        expect(store.getState().report.isFetched).toBe(true);
    });

    it('событие со сведениями о расчёте: записаны вместе с данными', () => {
        setCurrentKey('report', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: KEY,
            data: [],
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });

        expect(store.getState().report.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
    });

    it('событие без сведений (открытый период, старый сервер): прежние очищены', () => {
        setCurrentKey('report', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: KEY,
            data: [],
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: KEY,
            data: [],
        });

        expect(store.getState().report.calculation).toBeNull();
    });

    it('событие устаревшего ключа сведений не меняет', () => {
        setCurrentKey('report', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: KEY,
            data: [],
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: OLD_KEY,
            data: [],
        });

        expect(store.getState().report.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
    });

    it('устаревший ключ: событие отброшено, отметки нет', () => {
        setCurrentKey('report', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: OLD_KEY,
            data: [],
        });

        expect(isLoadedKey('report', OLD_KEY)).toBe(false);
        expect(isLoadedKey('report', KEY)).toBe(false);
    });

    it('ошибка расчёта: отметку не ставит', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        setCurrentKey('report', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_ERROR)({
            requestKey: KEY,
            message: 'расчёт упал',
        });

        expect(isLoadedKey('report', KEY)).toBe(false);
        expect(store.getState().report.isLoading).toBe(false);
    });
});

describe('WS-событие готовности статистики звонков', () => {
    it('текущий ключ: данные применены, источник загружен для ключа', () => {
        setCurrentKey('calling', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.CALLING_DONE)({
            requestKey: KEY,
            data: [],
        });

        expect(isLoadedKey('calling', KEY)).toBe(true);
        expect(store.getState().callingStatistics.isFetched).toBe(true);
        // Отметка звонков не задевает события.
        expect(isLoadedKey('report', KEY)).toBe(false);
    });

    it('событие со сведениями о расчёте: записаны вместе с данными', () => {
        setCurrentKey('calling', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.CALLING_DONE)({
            requestKey: KEY,
            data: [],
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });

        expect(store.getState().callingStatistics.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
    });

    it('событие без сведений (открытый период, старый сервер): прежние очищены', () => {
        setCurrentKey('calling', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.CALLING_DONE)({
            requestKey: KEY,
            data: [],
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
        handler(REPORT_QUEUE_WS_EVENTS.CALLING_DONE)({
            requestKey: KEY,
            data: [],
        });

        expect(store.getState().callingStatistics.calculation).toBeNull();
    });

    it('сведения звонков не задевают сведения событий', () => {
        setCurrentKey('report', KEY);
        setCurrentKey('calling', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.REPORT_DONE)({
            requestKey: KEY,
            data: [],
        });
        handler(REPORT_QUEUE_WS_EVENTS.CALLING_DONE)({
            requestKey: KEY,
            data: [],
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });

        expect(store.getState().report.calculation).toBeNull();
        expect(store.getState().callingStatistics.calculation).not.toBeNull();
    });

    it('устаревший ключ: событие отброшено, отметки нет', () => {
        setCurrentKey('calling', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.CALLING_DONE)({
            requestKey: OLD_KEY,
            data: [],
        });

        expect(isLoadedKey('calling', OLD_KEY)).toBe(false);
    });

    it('ошибка расчёта: отметку не ставит', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        setCurrentKey('calling', KEY);
        handler(REPORT_QUEUE_WS_EVENTS.CALLING_ERROR)({
            requestKey: KEY,
            message: 'расчёт упал',
        });

        expect(isLoadedKey('calling', KEY)).toBe(false);
    });
});

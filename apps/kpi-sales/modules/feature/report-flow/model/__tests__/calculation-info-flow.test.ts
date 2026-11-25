import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callingStatisticsActions } from '@/modules/entities/calling-statistics/model/callingStatisticsSlice';
import { getCallingStatistics } from '../calling-statistics-flow-thunk';
import { getReportData } from '../report-flow-thunks';
import { resetReportFlowMemory } from '../report-queue.util';
import {
    FAILED,
    flush,
    makeReportFlowStore,
    READY,
    type Envelope,
} from './report-flow-fixtures';

/*
 * Сведения о расчёте (generatedAt, closedPeriod) из ответа запроса попадают в
 * стор вместе с данными — отдельно для событий и для звонков. Пришли данные
 * без полей — сведения очищаются. Сетевые клиенты подменены.
 */

const { getReport, getStatistics } = vi.hoisted(() => ({
    getReport: vi.fn<(dto: unknown) => Promise<unknown>>(),
    getStatistics: vi.fn<(dto: unknown) => Promise<unknown>>(),
}));

vi.mock('@/modules/entities/report/lib/api/report-helper', () => ({
    ReportHelper: class {
        getReport = getReport;
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
            getStatistics = getStatistics;
        },
    }),
);
vi.mock('@/modules/app/lib/helper/logClient', () => ({
    logClient: vi.fn(),
}));

const GENERATED_AT = '2026-11-12T07:40:00.000Z';
const CLOSED: Envelope = {
    ...READY,
    generatedAt: GENERATED_AT,
    closedPeriod: true,
};
const OPEN: Envelope = {
    ...READY,
    generatedAt: GENERATED_AT,
    closedPeriod: false,
};

beforeEach(() => {
    resetReportFlowMemory();
    getReport.mockReset();
    getStatistics.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
    resetReportFlowMemory();
    vi.restoreAllMocks();
});

describe('сведения о расчёте событий (ответ запроса)', () => {
    it('до загрузки сведений нет', () => {
        expect(makeReportFlowStore().getState().report.calculation).toBeNull();
    });

    it('закрытый период: дата и признак записаны вместе с данными', async () => {
        getReport.mockResolvedValue(CLOSED);
        const store = makeReportFlowStore();
        store.dispatch(getReportData());
        await flush();

        const state = store.getState().report;
        expect(state.isFetched).toBe(true);
        expect(state.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
    });

    it('открытый период с датой: признак false записан как есть', async () => {
        getReport.mockResolvedValue(OPEN);
        const store = makeReportFlowStore();
        store.dispatch(getReportData());
        await flush();

        expect(store.getState().report.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: false,
        });
    });

    it('ответ без полей (старый сервер): сведения null', async () => {
        getReport.mockResolvedValue(READY);
        const store = makeReportFlowStore();
        store.dispatch(getReportData());
        await flush();

        expect(store.getState().report.isFetched).toBe(true);
        expect(store.getState().report.calculation).toBeNull();
    });

    it('новый ответ без полей очищает прежние сведения', async () => {
        getReport.mockResolvedValueOnce(CLOSED).mockResolvedValueOnce(READY);
        const store = makeReportFlowStore();
        store.dispatch(getReportData());
        await flush();
        expect(store.getState().report.calculation).not.toBeNull();

        store.dispatch(getReportData({ forceRefresh: true }));
        await flush();
        expect(store.getState().report.calculation).toBeNull();
    });

    it('некорректные поля в ответе не записываются', async () => {
        getReport.mockResolvedValue({
            ...READY,
            generatedAt: 12345,
            closedPeriod: 'да',
        });
        const store = makeReportFlowStore();
        store.dispatch(getReportData());
        await flush();

        expect(store.getState().report.calculation).toBeNull();
    });

    it('ошибка расчёта прежние сведения не трогает', async () => {
        getReport.mockResolvedValueOnce(CLOSED).mockResolvedValueOnce(FAILED);
        const store = makeReportFlowStore();
        store.dispatch(getReportData());
        await flush();
        store.dispatch(getReportData({ forceRefresh: true }));
        await flush();

        expect(store.getState().report.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
    });
});

describe('сведения о расчёте звонков (ответ запроса)', () => {
    it('до загрузки сведений нет', () => {
        expect(
            makeReportFlowStore().getState().callingStatistics.calculation,
        ).toBeNull();
    });

    it('закрытый период: дата и признак записаны вместе с данными', async () => {
        getStatistics.mockResolvedValue(CLOSED);
        const store = makeReportFlowStore();
        store.dispatch(getCallingStatistics());
        await flush();

        const state = store.getState().callingStatistics;
        expect(state.isFetched).toBe(true);
        expect(state.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });
    });

    it('ответ без полей (открытый период или старый сервер): сведения null', async () => {
        getStatistics.mockResolvedValue(READY);
        const store = makeReportFlowStore();
        store.dispatch(getCallingStatistics());
        await flush();

        expect(store.getState().callingStatistics.isFetched).toBe(true);
        expect(store.getState().callingStatistics.calculation).toBeNull();
    });

    it('новый ответ без полей очищает прежние сведения', async () => {
        getStatistics
            .mockResolvedValueOnce(CLOSED)
            .mockResolvedValueOnce(READY);
        const store = makeReportFlowStore();
        store.dispatch(getCallingStatistics());
        await flush();
        store.dispatch(getCallingStatistics({ forceRefresh: true }));
        await flush();

        expect(store.getState().callingStatistics.calculation).toBeNull();
    });

    it('сбой запроса очищает данные вместе со сведениями', async () => {
        getStatistics
            .mockResolvedValueOnce(CLOSED)
            .mockRejectedValueOnce(new Error('сеть'));
        const store = makeReportFlowStore();
        store.dispatch(getCallingStatistics());
        await flush();
        store.dispatch(getCallingStatistics({ forceRefresh: true }));
        await flush();

        const state = store.getState().callingStatistics;
        expect(state.items).toBeNull();
        expect(state.calculation).toBeNull();
    });

    it('данные без сведений (setFetched одним аргументом) очищают прежние сведения', () => {
        const store = makeReportFlowStore();
        store.dispatch(
            callingStatisticsActions.setFetched([], {
                generatedAt: GENERATED_AT,
                closedPeriod: true,
            }),
        );
        expect(store.getState().callingStatistics.calculation).toEqual({
            generatedAt: GENERATED_AT,
            closedPeriod: true,
        });

        store.dispatch(callingStatisticsActions.setFetched([]));
        expect(store.getState().callingStatistics.calculation).toBeNull();
    });
});

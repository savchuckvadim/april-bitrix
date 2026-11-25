import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { ensureReportData } from '../ensure-report-data.thunk';
import { recalculateReportData } from '../recalculate-report-data.thunk';
import {
    addReportDataDemand,
    resetReportDataDemands,
} from '../report-data-demand';
import {
    markSavedFilterApplied,
    resetReportFlowMemory,
} from '../report-queue.util';
import {
    flush,
    makeReportFlowStore,
    READY,
    type Envelope,
    type TestStore,
} from './report-flow-fixtures';

/*
 * «Пересчитать»: на настоящих thunk'ах запросов, подменены только сетевые
 * клиенты. Пересчёт запрашивает с forceRefresh ровно те источники, которые
 * нужны сейчас (нужды вкладки плюс заявки вне вкладки).
 */

interface RequestDto {
    forceRefresh?: boolean;
}

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

const recalculate = async (store: TestStore) => {
    store.dispatch(recalculateReportData());
    await flush();
};

/** Тело запроса n-го вызова клиента. */
const requestOf = (
    mock: typeof getReport,
    call: number,
): RequestDto | undefined => mock.mock.calls[call]?.[0] as RequestDto | undefined;

const REPORT_TABS = [
    EReportType.All,
    EReportType.EVENTS,
    EReportType.CALLINGS,
    EReportType.MERGED,
];
const STANDALONE_TABS = [
    EReportType.DIGEST,
    EReportType.FINANCE,
    EReportType.AI,
];

beforeEach(() => {
    resetReportFlowMemory();
    resetReportDataDemands();
    markSavedFilterApplied();
    getReport.mockReset();
    getStatistics.mockReset();
    getReport.mockResolvedValue(READY);
    getStatistics.mockResolvedValue(READY);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
    resetReportFlowMemory();
    resetReportDataDemands();
    vi.restoreAllMocks();
});

describe('recalculateReportData — какие источники пересчитываются', () => {
    it.each(REPORT_TABS)(
        'вкладка отчёта «%s»: события и звонки запрошены с forceRefresh',
        async tab => {
            const store = makeReportFlowStore({ tab });
            await recalculate(store);

            expect(getReport).toHaveBeenCalledTimes(1);
            expect(getStatistics).toHaveBeenCalledTimes(1);
            expect(requestOf(getReport, 0)?.forceRefresh).toBe(true);
            expect(requestOf(getStatistics, 0)?.forceRefresh).toBe(true);
        },
    );

    it.each(STANDALONE_TABS)(
        'вкладка «%s» без нужд: ничего не запрашивается',
        async tab => {
            const store = makeReportFlowStore({ tab });
            await recalculate(store);

            expect(getReport).not.toHaveBeenCalled();
            expect(getStatistics).not.toHaveBeenCalled();
            expect(store.getState().report.isLoading).toBe(false);
            expect(store.getState().callingStatistics.isLoading).toBe(false);
        },
    );

    it('вкладка без нужд, но события заявлены вне вкладки: пересчитываются только события', async () => {
        addReportDataDemand('report');
        const store = makeReportFlowStore({ tab: EReportType.DIGEST });
        await recalculate(store);

        expect(getReport).toHaveBeenCalledTimes(1);
        expect(requestOf(getReport, 0)?.forceRefresh).toBe(true);
        expect(getStatistics).not.toHaveBeenCalled();
    });

    it('вкладка без нужд, но звонки заявлены вне вкладки: пересчитываются только звонки', async () => {
        addReportDataDemand('calling');
        const store = makeReportFlowStore({ tab: EReportType.AI });
        await recalculate(store);

        expect(getStatistics).toHaveBeenCalledTimes(1);
        expect(requestOf(getStatistics, 0)?.forceRefresh).toBe(true);
        expect(getReport).not.toHaveBeenCalled();
    });
});

describe('recalculateReportData — поведение запроса', () => {
    it('источник уже загружен для текущего фильтра — всё равно запрашивается', async () => {
        const store = makeReportFlowStore();
        store.dispatch(ensureReportData());
        await flush();
        expect(getReport).toHaveBeenCalledTimes(1);
        // Обычная загрузка флаг пересчёта не ставит.
        expect(requestOf(getReport, 0)?.forceRefresh).toBeUndefined();

        await recalculate(store);

        expect(getReport).toHaveBeenCalledTimes(2);
        expect(getStatistics).toHaveBeenCalledTimes(2);
        expect(requestOf(getReport, 1)?.forceRefresh).toBe(true);
    });

    it('фильтр не меняется: период и сотрудники те же', async () => {
        const store = makeReportFlowStore();
        store.dispatch(ensureReportData());
        await flush();
        await recalculate(store);

        expect(getReport.mock.calls[1]?.[0]).toMatchObject({
            filters: { userIds: ['1', '2'] },
        });
    });

    it('новые сведения о расчёте заменяют прежние', async () => {
        const closed = (generatedAt: string): Envelope => ({
            ...READY,
            generatedAt,
            closedPeriod: true,
        });
        getReport
            .mockResolvedValueOnce(closed('2026-11-10T08:00:00.000Z'))
            .mockResolvedValueOnce(closed('2026-11-25T09:30:00.000Z'));
        const store = makeReportFlowStore();
        store.dispatch(ensureReportData());
        await flush();
        expect(store.getState().report.calculation?.generatedAt).toBe(
            '2026-11-10T08:00:00.000Z',
        );

        await recalculate(store);

        expect(store.getState().report.calculation).toEqual({
            generatedAt: '2026-11-25T09:30:00.000Z',
            closedPeriod: true,
        });
    });

    it('пока идёт пересчёт, страница показывает обычную загрузку', async () => {
        const store = makeReportFlowStore();
        store.dispatch(ensureReportData());
        await flush();
        getReport.mockReturnValue(new Promise(() => undefined));
        getStatistics.mockReturnValue(new Promise(() => undefined));

        await recalculate(store);

        expect(store.getState().report.isLoading).toBe(true);
        expect(store.getState().callingStatistics.isLoading).toBe(true);
    });
});

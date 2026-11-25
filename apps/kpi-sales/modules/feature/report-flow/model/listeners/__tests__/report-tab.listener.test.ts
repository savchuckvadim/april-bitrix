import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appActions } from '@/modules/app/model/AppSlice';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { reportTypeActions } from '@/modules/feature/report-widget-type/model/ReportTypeSlice';
import {
    markSavedFilterApplied,
    resetReportFlowMemory,
} from '../../report-queue.util';
import {
    flush,
    makeReportFlowStore,
    READY,
    USERS,
    type TestStore,
} from '../../__tests__/report-flow-fixtures';
import { startReportTabListener } from '../report-tab.listener';

/*
 * Смена вкладки → догрузка недостающего. Настоящая ensureReportData и
 * настоящие thunk'и запросов; подменены только сетевые клиенты.
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

/** Открыт «Дайджест»: сохранённый фильтр применён, запросов ещё не было. */
const makeDigestStore = async (): Promise<TestStore> => {
    const store = makeReportFlowStore({
        tab: EReportType.DIGEST,
        startListeners: startReportTabListener,
    });
    markSavedFilterApplied();
    await flush();
    return store;
};

const selectTab = async (store: TestStore, tab: EReportType) => {
    store.dispatch(reportTypeActions.setCurrentReportType(tab));
    await flush();
};

beforeEach(() => {
    resetReportFlowMemory();
    getReport.mockReset();
    getStatistics.mockReset();
    getReport.mockResolvedValue(READY);
    getStatistics.mockResolvedValue(READY);
});

afterEach(() => {
    resetReportFlowMemory();
});

describe('report-tab.listener — смена вкладки', () => {
    it('с «Дайджеста» на «Все»: догружаются события и звонки', async () => {
        const store = await makeDigestStore();
        expect(getReport).not.toHaveBeenCalled();
        expect(getStatistics).not.toHaveBeenCalled();

        await selectTab(store, EReportType.All);

        expect(getReport).toHaveBeenCalledTimes(1);
        expect(getStatistics).toHaveBeenCalledTimes(1);
    });

    it.each([EReportType.EVENTS, EReportType.CALLINGS, EReportType.MERGED])(
        'с «Дайджеста» на вкладку отчёта «%s»: догружаются оба источника',
        async tab => {
            const store = await makeDigestStore();
            await selectTab(store, tab);

            expect(getReport).toHaveBeenCalledTimes(1);
            expect(getStatistics).toHaveBeenCalledTimes(1);
        },
    );

    it('между вкладками без нужд запросов нет', async () => {
        const store = await makeDigestStore();
        await selectTab(store, EReportType.FINANCE);
        await selectTab(store, EReportType.AI);
        await selectTab(store, EReportType.DIGEST);

        expect(getReport).not.toHaveBeenCalled();
        expect(getStatistics).not.toHaveBeenCalled();
    });

    it('между вкладками отчёта уже загруженное не запрашивается заново', async () => {
        const store = await makeDigestStore();
        await selectTab(store, EReportType.All);
        await selectTab(store, EReportType.EVENTS);
        await selectTab(store, EReportType.MERGED);
        await selectTab(store, EReportType.DIGEST);
        await selectTab(store, EReportType.CALLINGS);

        expect(getReport).toHaveBeenCalledTimes(1);
        expect(getStatistics).toHaveBeenCalledTimes(1);
    });

    it('фильтр изменили на «Дайджесте» — на вкладке отчёта данные запрашиваются по новому фильтру', async () => {
        const store = await makeDigestStore();
        await selectTab(store, EReportType.All);
        await selectTab(store, EReportType.DIGEST);
        store.dispatch(departmentActions.setDepartmentCurrent([USERS[2]!]));
        await selectTab(store, EReportType.All);

        expect(getReport).toHaveBeenCalledTimes(2);
        expect(getStatistics).toHaveBeenCalledTimes(2);
    });

    it('вкладку поставили до применения сохранённого фильтра — запросов нет', async () => {
        const store = makeReportFlowStore({
            tab: EReportType.DIGEST,
            startListeners: startReportTabListener,
        });
        await selectTab(store, EReportType.All);

        expect(getReport).not.toHaveBeenCalled();
        expect(getStatistics).not.toHaveBeenCalled();
    });

    it('на странице без отчёта («Разборы звонков») запросов нет', async () => {
        const store = await makeDigestStore();
        store.dispatch(appActions.setLayoutKind('bare'));
        await selectTab(store, EReportType.All);

        expect(getReport).not.toHaveBeenCalled();
        expect(getStatistics).not.toHaveBeenCalled();
    });
});

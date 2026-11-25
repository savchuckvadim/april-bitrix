import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appActions } from '@/modules/app/model/AppSlice';
import { reportActions } from '@/modules/entities/report/model/report-slice';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import { makeCurrentUser } from '@/modules/entities/department/__tests__/department-fixtures';
import {
    EReportDateMode,
    ReportDateType,
} from '@/modules/entities/report/model/types/report/report-type';
import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import { ensureReportData } from '../ensure-report-data.thunk';
import {
    isLoadedKey,
    markSavedFilterApplied,
    resetReportFlowMemory,
} from '../report-queue.util';
import {
    DEFAULT_KEY,
    FAILED,
    flush,
    makeReportFlowStore,
    READY,
    USERS,
    type Envelope,
    type TestStore,
} from './report-flow-fixtures';

/*
 * ensureReportData на настоящих thunk'ах запросов: подменены только сетевые
 * клиенты (отчёт и звонки) и журнал клиента. Так проверяется и выбор
 * источников по вкладке, и память «загружено» (её ставят сами запросы).
 */

interface RequestDto {
    filters: { userIds?: string[]; dateFrom: string };
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

const ensure = async (store: TestStore) => {
    store.dispatch(ensureReportData());
    await flush();
};

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
    markSavedFilterApplied();
    getReport.mockReset();
    getStatistics.mockReset();
    getReport.mockResolvedValue(READY);
    getStatistics.mockResolvedValue(READY);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
    // Сброс гасит и таймер поллинга, оставленный ответом «в очереди».
    resetReportFlowMemory();
    vi.restoreAllMocks();
});

describe('ensureReportData — какие источники запрашиваются', () => {
    it.each(STANDALONE_TABS)(
        'вкладка «%s» без нужд: события и звонки не запрашиваются',
        async tab => {
            const store = makeReportFlowStore({ tab });
            await ensure(store);

            expect(getReport).not.toHaveBeenCalled();
            expect(getStatistics).not.toHaveBeenCalled();
            expect(store.getState().report.isLoading).toBe(false);
            expect(store.getState().callingStatistics.isLoading).toBe(false);
        },
    );

    it.each(REPORT_TABS)(
        'вкладка отчёта «%s»: запрашиваются оба источника',
        async tab => {
            const store = makeReportFlowStore({ tab });
            await ensure(store);

            expect(getReport).toHaveBeenCalledTimes(1);
            expect(getStatistics).toHaveBeenCalledTimes(1);
        },
    );

    it('запрос уходит по действующему фильтру: сотрудники 1 и 2', async () => {
        const store = makeReportFlowStore();
        await ensure(store);

        const dto = getReport.mock.calls[0]?.[0] as RequestDto;
        expect(dto.filters.userIds).toEqual(['1', '2']);
    });
});

describe('ensureReportData — память «загружено»', () => {
    it('источник, уже загруженный для текущего ключа, повторно не запрашивается', async () => {
        const store = makeReportFlowStore();
        await ensure(store);
        await ensure(store);
        await ensure(store);

        expect(getReport).toHaveBeenCalledTimes(1);
        expect(getStatistics).toHaveBeenCalledTimes(1);
    });

    it('после смены сотрудников в действующем фильтре запрашивается снова', async () => {
        const store = makeReportFlowStore();
        await ensure(store);
        store.dispatch(departmentActions.setDepartmentCurrent([USERS[2]!]));
        await ensure(store);

        expect(getReport).toHaveBeenCalledTimes(2);
        expect(getStatistics).toHaveBeenCalledTimes(2);
        const dto = getReport.mock.calls[1]?.[0] as RequestDto;
        expect(dto.filters.userIds).toEqual(['3']);
    });

    it('после смены периода в действующем фильтре запрашивается снова', async () => {
        const store = makeReportFlowStore();
        await ensure(store);
        store.dispatch(
            reportActions.setPeriod({
                mode: EReportDateMode.RANGE,
                [ReportDateType.FROM]: '2026-10-01',
                [ReportDateType.TO]: '2026-10-31',
            }),
        );
        await ensure(store);

        expect(getReport).toHaveBeenCalledTimes(2);
        expect(getStatistics).toHaveBeenCalledTimes(2);
    });

    it('память хранит последний загруженный ключ: возврат к прежнему фильтру запрашивает снова', async () => {
        // Загружен ключ A, затем B — в сторе данные B, поэтому для A нужен запрос.
        const store = makeReportFlowStore();
        await ensure(store);
        store.dispatch(departmentActions.setDepartmentCurrent([USERS[2]!]));
        await ensure(store);
        store.dispatch(
            departmentActions.setDepartmentCurrent([USERS[0]!, USERS[1]!]),
        );
        await ensure(store);

        expect(getReport).toHaveBeenCalledTimes(3);
    });

    it('успешный ответ ставит отметку «загружено» для ключа запроса', async () => {
        const store = makeReportFlowStore();
        await ensure(store);

        expect(isLoadedKey('report', DEFAULT_KEY)).toBe(true);
        expect(isLoadedKey('calling', DEFAULT_KEY)).toBe(true);
    });

    it('запрашивается только недостающий источник', async () => {
        getStatistics.mockResolvedValueOnce(FAILED);
        const store = makeReportFlowStore();
        await ensure(store);
        await ensure(store);

        expect(getReport).toHaveBeenCalledTimes(1);
        expect(getStatistics).toHaveBeenCalledTimes(2);
    });
});

describe('ensureReportData — ошибки расчёта', () => {
    it('ошибка расчёта событий отметку «загружено» не ставит, повторный вызов запрашивает снова', async () => {
        getReport.mockResolvedValueOnce(FAILED);
        const store = makeReportFlowStore();
        await ensure(store);

        expect(isLoadedKey('report', DEFAULT_KEY)).toBe(false);
        expect(store.getState().report.isLoading).toBe(false);

        await ensure(store);
        expect(getReport).toHaveBeenCalledTimes(2);
        expect(isLoadedKey('report', DEFAULT_KEY)).toBe(true);
    });

    it('ошибка расчёта звонков отметку не ставит', async () => {
        getStatistics.mockResolvedValueOnce(FAILED);
        const store = makeReportFlowStore();
        await ensure(store);

        expect(isLoadedKey('calling', DEFAULT_KEY)).toBe(false);
        await ensure(store);
        expect(getStatistics).toHaveBeenCalledTimes(2);
    });

    it('сбой запроса (сеть) отметку не ставит', async () => {
        getReport.mockRejectedValueOnce(new Error('сеть'));
        getStatistics.mockRejectedValueOnce(new Error('сеть'));
        const store = makeReportFlowStore();
        await ensure(store);

        expect(isLoadedKey('report', DEFAULT_KEY)).toBe(false);
        expect(isLoadedKey('calling', DEFAULT_KEY)).toBe(false);
    });

    it('ответ «в очереди» отметку не ставит: данные ещё не пришли', async () => {
        getReport.mockResolvedValueOnce({
            status: 'queued',
        } satisfies Envelope);
        const store = makeReportFlowStore();
        await ensure(store);

        expect(isLoadedKey('report', DEFAULT_KEY)).toBe(false);
        // Расчёт идёт (isLoading) — повторный ensure его не дублирует.
        expect(store.getState().report.isLoading).toBe(true);
        await ensure(store);
        expect(getReport).toHaveBeenCalledTimes(1);
    });
});

describe('ensureReportData — не запрашивает, пока запрашивается', () => {
    it('источник уже в запросе по этому ключу — дубль не уходит', async () => {
        getReport.mockReturnValue(new Promise(() => undefined));
        getStatistics.mockReturnValue(new Promise(() => undefined));
        const store = makeReportFlowStore();
        await ensure(store);
        await ensure(store);

        expect(getReport).toHaveBeenCalledTimes(1);
        expect(getStatistics).toHaveBeenCalledTimes(1);
        expect(store.getState().report.isLoading).toBe(true);
    });

    it('идёт запрос по прежнему ключу, фильтр сменился — запрашивается по новому', async () => {
        getReport.mockReturnValueOnce(new Promise(() => undefined));
        const store = makeReportFlowStore();
        await ensure(store);
        store.dispatch(departmentActions.setDepartmentCurrent([USERS[2]!]));
        await ensure(store);

        expect(getReport).toHaveBeenCalledTimes(2);
    });
});

describe('ensureReportData — когда не работает', () => {
    it('сохранённый фильтр ещё не применён — ничего (вкладку ставят и раньше)', async () => {
        resetReportFlowMemory();
        const store = makeReportFlowStore();
        await ensure(store);

        expect(getReport).not.toHaveBeenCalled();
        expect(getStatistics).not.toHaveBeenCalled();
    });

    it('страница без отчёта («Разборы звонков») — ничего', async () => {
        const store = makeReportFlowStore();
        store.dispatch(appActions.setLayoutKind('bare'));
        await ensure(store);

        expect(getReport).not.toHaveBeenCalled();
        expect(getStatistics).not.toHaveBeenCalled();
    });

    it('нет сотрудников для запроса — ничего', async () => {
        const store = makeReportFlowStore();
        store.dispatch(
            departmentActions.setStructure({
                isMulti: false,
                multipleTag: null,
                departments: [],
                currentUser: makeCurrentUser(),
                visibleUsers: [],
                visibleGroups: [],
                isHeadManager: true,
                defaultSelected: [],
            }),
        );
        await ensure(store);

        expect(getReport).not.toHaveBeenCalled();
        expect(getStatistics).not.toHaveBeenCalled();
    });
});

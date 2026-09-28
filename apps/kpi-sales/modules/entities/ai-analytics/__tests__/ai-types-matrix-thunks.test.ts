import { beforeEach, describe, expect, it, vi } from 'vitest';
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
import reportReducer, {
    reportActions,
} from '@/modules/entities/report/model/report-slice';
import departmentReducer, {
    departmentActions,
} from '@/modules/entities/department/model/department-slice';
import { ReportDateType } from '@/modules/entities/report/model/types/report/report-type';
import {
    aiAnalyticsActions,
    aiAnalyticsReducer,
} from '../model/ai-analytics-slice';
import {
    AI_QUEUED_ERROR_MESSAGES,
    failAiQueuedSections,
    fetchAiTypesMatrix,
    recalcAiOverview,
    resumeAiQueuedSections,
} from '../model/ai-analytics-thunks';
import { startAiRefetchListener } from '../model/listeners/ai-refetch.listener';
import { buildAiRequestKey } from '../lib/ai-request-key.util';
import { byType, overview, queued, ready, wideRow } from './ai-fixtures';
import {
    flush,
    makeAiStore,
    TEST_DOMAIN,
    TEST_MANAGERS,
    TEST_REQUESTER,
    TEST_USER,
    type AiTestStore,
} from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { getByType, getOverview, getAttention } = vi.hoisted(() => ({
    getByType: vi.fn(),
    getOverview: vi.fn(),
    getAttention: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        getByType = getByType;
        getOverview = getOverview;
        getAttention = getAttention;
        getBrief = vi.fn();
        getPulse = vi.fn();
        getAgenda = vi.fn();
    },
}));

const FILTERS = { from: '2026-08-01', to: '2026-08-31', managerIds: [7, 3] };
const MATRIX_KEY = buildAiRequestKey({
    ...TEST_REQUESTER,
    from: FILTERS.from,
    to: FILTERS.to,
    managerIds: FILTERS.managerIds,
    extra: ['types-matrix'],
});

const matrixData = () =>
    byType({
        callType: 'all',
        title: 'Все типы',
        layout: 'wide',
        wide: [wideRow()],
    });

describe('fetchAiTypesMatrix — срез «все типы × wide» для матриц', () => {
    beforeEach(() => {
        getByType.mockReset();
    });

    it('ready: секция typesMatrix готова, ключ — периметр + маркер types-matrix, POST — all/wide', async () => {
        getByType.mockResolvedValue(ready(matrixData(), 'srv'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiTypesMatrix());

        const section = store.getState().aiAnalytics.typesMatrix;
        expect(section.status).toBe('ready');
        expect(section.serverKey).toBe('srv');
        expect(section.data?.wide).toHaveLength(1);
        expect(section.requestKey).toBe(MATRIX_KEY);
        expect(section.requestKey).toContain('|#|types-matrix');
        expect(getByType).toHaveBeenCalledWith(
            TEST_REQUESTER,
            FILTERS,
            'all',
            'wide',
            { socketId: undefined, forceRefresh: false },
        );
        // Секция drawer'а «Разбор по типам» не тронута.
        expect(store.getState().aiAnalytics.byType.status).toBe('idle');
    });

    it('не зависит от подвкладки и раскладки drawer; гард по ключу; force — forceRefresh', async () => {
        getByType.mockResolvedValue(ready(matrixData()));
        const store = makeAiStore({ period: true });
        store.dispatch(aiAnalyticsActions.setSelectedCallType('objections'));
        store.dispatch(aiAnalyticsActions.setTypesLayout('long'));
        await store.dispatch(fetchAiTypesMatrix());
        expect(getByType.mock.calls[0]?.[2]).toBe('all');
        expect(getByType.mock.calls[0]?.[3]).toBe('wide');
        expect(store.getState().aiAnalytics.typesMatrix.requestKey).toBe(
            MATRIX_KEY,
        );

        await store.dispatch(fetchAiTypesMatrix());
        expect(getByType).toHaveBeenCalledTimes(1);

        await store.dispatch(fetchAiTypesMatrix({ force: true }));
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[4]).toMatchObject({
            forceRefresh: true,
        });
    });

    it('queued: ждёт WS с ключом обзора; resume по этому ключу → повторный POST → ready; чужой ключ — нет', async () => {
        getByType
            .mockResolvedValueOnce(queued('srv-overview'))
            .mockResolvedValueOnce(ready(matrixData(), 'srv-overview'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiTypesMatrix());

        const waiting = store.getState().aiAnalytics.typesMatrix;
        expect(waiting.status).toBe('loading');
        expect(waiting.jobStatus).toBe('queued');
        expect(waiting.serverKey).toBe('srv-overview');

        await store.dispatch(resumeAiQueuedSections('other'));
        expect(getByType).toHaveBeenCalledTimes(1);

        await store.dispatch(resumeAiQueuedSections('srv-overview'));
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[4]).toMatchObject({
            forceRefresh: false,
        });
        expect(store.getState().aiAnalytics.typesMatrix.status).toBe('ready');
    });

    it('WS error по ключу → секция в ошибку с текстом «Ошибка среза по типам»', async () => {
        getByType.mockResolvedValue(queued('srv-overview'));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiTypesMatrix());
        store.dispatch(failAiQueuedSections({ requestKey: 'srv-overview' }));

        const section = store.getState().aiAnalytics.typesMatrix;
        expect(section.status).toBe('error');
        expect(section.error).toBe(AI_QUEUED_ERROR_MESSAGES.typesMatrix);
        expect(section.error).toBe('Ошибка среза по типам');
    });

    it('resetData сбрасывает секцию', async () => {
        getByType.mockResolvedValue(ready(matrixData()));
        const store = makeAiStore({ period: true });
        await store.dispatch(fetchAiTypesMatrix());
        store.dispatch(aiAnalyticsActions.resetData());
        expect(store.getState().aiAnalytics.typesMatrix.status).toBe('idle');
        expect(store.getState().aiAnalytics.typesMatrix.data).toBeNull();
    });

    it('«Пересчитать»: idle — матрицу не трогает; загруженную — перечитывает с forceRefresh', async () => {
        getByType.mockResolvedValue(ready(matrixData()));
        getOverview.mockReset().mockResolvedValue(ready(overview()));
        getAttention.mockReset().mockResolvedValue(ready(overview()));
        const store = makeAiStore({ period: true });
        await store.dispatch(recalcAiOverview());
        expect(getByType).not.toHaveBeenCalled();

        await store.dispatch(fetchAiTypesMatrix());
        await store.dispatch(recalcAiOverview());
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[2]).toBe('all');
        expect(getByType.mock.calls[1]?.[3]).toBe('wide');
        expect(getByType.mock.calls[1]?.[4]).toMatchObject({
            forceRefresh: true,
        });
        expect(store.getState().aiAnalytics.typesMatrix.status).toBe('ready');
    });
});

/** Стор с listener-middleware и периметром (период + менеджеры). */
const makeListenerStore = (): AiTestStore => {
    const listener = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            report: reportReducer,
            department: departmentReducer,
            aiAnalytics: aiAnalyticsReducer,
        }),
        middleware: getDefault => getDefault().prepend(listener.middleware),
    });
    startAiRefetchListener(
        listener as ListenerMiddlewareInstance<
            RootState,
            AppDispatch,
            ThunkExtraArgument
        >,
    );
    store.dispatch(
        appActions.setAppData({ domain: TEST_DOMAIN, user: TEST_USER }),
    );
    store.dispatch(
        reportActions.setChangedDate({
            typeOfDate: ReportDateType.FROM,
            value: '2026-08-01',
        }),
    );
    store.dispatch(
        reportActions.setChangedDate({
            typeOfDate: ReportDateType.TO,
            value: '2026-08-31',
        }),
    );
    store.dispatch(departmentActions.setDepartmentCurrent(TEST_MANAGERS));
    return store as unknown as AiTestStore;
};

describe('ai-refetch.listener — матрица типов', () => {
    beforeEach(() => {
        getByType.mockReset().mockResolvedValue(ready(matrixData()));
        getOverview.mockReset().mockResolvedValue(ready(overview()));
        getAttention.mockReset().mockResolvedValue(ready(overview()));
    });

    it('смена фильтра: idle — без запроса; после загрузки и смены состава — повторный POST с новым составом', async () => {
        const store = makeListenerStore();
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(getByType).not.toHaveBeenCalled();

        await store.dispatch(fetchAiTypesMatrix());
        store.dispatch(
            departmentActions.setDepartmentCurrent([
                { ID: 7 },
            ] as unknown as BXUser[]),
        );
        store.dispatch(reportActions.setSavedFilter(null));
        await flush();
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[1]).toMatchObject({ managerIds: [7] });
        expect(getByType.mock.calls[1]?.[4]).toMatchObject({
            forceRefresh: false,
        });
    });

    it('levelsSaved: матрица перечитывается с forceRefresh, если уже открывалась', async () => {
        const store = makeListenerStore();
        store.dispatch(aiAnalyticsActions.levelsSaved('2026-09-28T10:00:00Z'));
        await flush();
        expect(getByType).not.toHaveBeenCalled();

        await store.dispatch(fetchAiTypesMatrix());
        store.dispatch(aiAnalyticsActions.levelsSaved('2026-09-28T10:05:00Z'));
        await flush();
        expect(getByType).toHaveBeenCalledTimes(2);
        expect(getByType.mock.calls[1]?.[2]).toBe('all');
        expect(getByType.mock.calls[1]?.[4]).toMatchObject({
            forceRefresh: true,
        });
    });
});

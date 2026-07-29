import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import oldInit from '../../../../docs/oldinit.json';
import legacyRecord from './__fixtures__/legacy-deal.v1.json';
import {
    catalogActions,
    catalogFromOldInit,
    catalogReducer,
} from '@/modules/entities/catalog';
import {
    rowSetReducer,
    setupAcademyDurationListener,
    setupRowSetSyncListener,
} from '@/modules/entities/row-set';
import { snapshotReducer } from '../model/SnapshotSlice';
import { restoreSnapshot } from '../model/SnapshotThunk';
import { SnapshotHelper } from './api/snapshot-helper';
import type { V1Record } from './v1/types';

/**
 * Интеграционный тест вспоминания: мини-стор с РЕАЛЬНЫМИ row-set
 * listeners (sync + академия). Ключевое требование BC: сохранённые
 * (денормализованные) цены слепка НЕ пересчитываются при восстановлении.
 */

const record = legacyRecord as unknown as V1Record;

const makeStore = () => {
    const listenerMiddleware = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            catalog: catalogReducer,
            rowSet: rowSetReducer,
            snapshot: snapshotReducer,
        }),
        middleware: getDefault =>
            getDefault().concat(listenerMiddleware.middleware),
    });
    setupRowSetSyncListener(
        listenerMiddleware as ListenerMiddlewareInstance,
    );
    setupAcademyDurationListener(
        listenerMiddleware as ListenerMiddlewareInstance,
    );
    store.dispatch(catalogActions.setCatalog(catalogFromOldInit(oldInit)));
    return store;
};

describe('restore-флоу слепка', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        // Сеть в тестах не нужна: «API недоступен» → thunk падает на фикстуру
        vi.spyOn(SnapshotHelper.prototype, 'getSnapshot').mockRejectedValue(
            new Error('offline'),
        );
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    it('восстанавливает строки с сохранёнными ценами и выбирает main', async () => {
        const store = makeStore();
        await store.dispatch(
            restoreSnapshot({
                domain: 'gsr.bitrix24.ru',
                dealId: 129487,
                fallbackRecord: record,
            }) as never,
        );
        const state = store.getState();
        expect(state.snapshot.status).toBe('restored');

        const v1Garant = JSON.parse(record.rows!).sets.general[0].rows
            .garant[0];
        const garantRow = state.rowSet.general.rows.find(
            row => row.productType === 'garant',
        )!;
        // Цена ровно из слепка — без пересчёта по текущему каталогу
        expect(garantRow.price.current).toBe(v1Garant.price.current);
        expect(garantRow.role).toBe('main');
        expect(state.rowSet.selectedRowKey).toBe(garantRow.key);
    });

    it('запись без данных сделки → status none, стейт не тронут', async () => {
        const store = makeStore();
        await store.dispatch(
            restoreSnapshot({
                domain: 'x',
                dealId: 1,
                fallbackRecord: { rows: null } as V1Record,
            }) as never,
        );
        expect(store.getState().snapshot.status).toBe('none');
        expect(store.getState().rowSet.general.rows).toHaveLength(0);
    });

    it('API отвечает found:false → none', async () => {
        vi.spyOn(SnapshotHelper.prototype, 'getSnapshot').mockResolvedValue(
            null,
        );
        const store = makeStore();
        await store.dispatch(
            restoreSnapshot({
                domain: 'x',
                dealId: 1,
                fallbackRecord: null,
            }) as never,
        );
        expect(store.getState().snapshot.status).toBe('none');
    });

    it('API недоступен и фикстуры нет → error (не блокирует)', async () => {
        const store = makeStore();
        await store.dispatch(
            restoreSnapshot({
                domain: 'x',
                dealId: 1,
                fallbackRecord: null,
            }) as never,
        );
        expect(store.getState().snapshot.status).toBe('error');
        expect(store.getState().rowSet.general.rows).toHaveLength(0);
    });
});

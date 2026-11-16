import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import oldInit from '../../catalog/lib/__fixtures__/oldinit.json';
import legacyRecord from './__fixtures__/legacy-deal.v1.json';
import {
    catalogActions,
    catalogFromOldInit,
    catalogReducer,
} from '@/modules/entities/catalog';
import {
    rowSetReducer,
    setupAcademyTermListener,
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
    setupAcademyTermListener(
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

    describe('каталог ещё грузится (catalogReady)', () => {
        const deferred = () => {
            let resolve!: (ready: boolean) => void;
            const promise = new Promise<boolean>(done => {
                resolve = done;
            });
            return { promise, resolve };
        };
        const flush = () => new Promise(done => setTimeout(done, 0));

        it('запрос слепка уходит сразу, раскладка ждёт каталог', async () => {
            const getSnapshot = vi
                .spyOn(SnapshotHelper.prototype, 'getSnapshot')
                .mockResolvedValue(record);
            const catalog = deferred();
            const store = makeStore();
            const running = store.dispatch(
                restoreSnapshot({
                    domain: 'gsr.bitrix24.ru',
                    dealId: 129487,
                    catalogReady: catalog.promise,
                }) as never,
            ) as unknown as Promise<void>;
            await flush();
            // каталог ещё не готов: запрос уже ушёл, строки не разложены
            expect(getSnapshot).toHaveBeenCalledTimes(1);
            expect(store.getState().snapshot.status).toBe('loading');
            expect(store.getState().rowSet.general.rows).toHaveLength(0);

            catalog.resolve(true);
            await running;
            expect(store.getState().snapshot.status).toBe('restored');
            expect(store.getState().rowSet.general.rows.length).toBeGreaterThan(0);
        });

        it('слепка нет — none сразу, каталог не ждём', async () => {
            vi.spyOn(SnapshotHelper.prototype, 'getSnapshot').mockResolvedValue(null);
            const store = makeStore();
            await store.dispatch(
                restoreSnapshot({
                    domain: 'x',
                    dealId: 1,
                    // каталог так и не ответит — решение по новой сделке от него не зависит
                    catalogReady: deferred().promise,
                }) as never,
            );
            expect(store.getState().snapshot.status).toBe('none');
        });

        it('каталог не загрузился — слепок не раскладываем, статус error', async () => {
            vi.spyOn(SnapshotHelper.prototype, 'getSnapshot').mockResolvedValue(record);
            const store = makeStore();
            await store.dispatch(
                restoreSnapshot({
                    domain: 'gsr.bitrix24.ru',
                    dealId: 129487,
                    catalogReady: Promise.resolve(false),
                }) as never,
            );
            expect(store.getState().snapshot.status).toBe('error');
            expect(store.getState().rowSet.general.rows).toHaveLength(0);
        });
    });
});

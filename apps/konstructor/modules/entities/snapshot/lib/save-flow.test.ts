import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import oldInit from '../../../../docs/oldinit.json';
import { appReducer, appActions } from '@/modules/app/model/AppSlice';
import type { InitApp } from '@/modules/app/model/AppSlice';
import {
    catalogActions,
    catalogFromOldInit,
    catalogReducer,
} from '@/modules/entities/catalog';
import { defaultComposition } from '@/modules/entities/composition';
import {
    buildGarantRow,
    rowSetActions,
    rowSetReducer,
    setupRowSetSyncListener,
} from '@/modules/entities/row-set';
import { snapshotReducer } from '../model/SnapshotSlice';
import { restoreSnapshot, saveSnapshot } from '../model/SnapshotThunk';
import { SnapshotHelper } from './api/snapshot-helper';
import { isSnapshotV2, type SnapshotV2 } from '../model/types';
import type { V1Record } from './v1/types';

/**
 * Round-trip сохранения: состояние → saveSnapshot (v2 в колонке rows) →
 * restoreSnapshot той же записи → строки и цены идентичны.
 */

const catalog = catalogFromOldInit(oldInit);

const makeStore = () => {
    const listenerMiddleware = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({
            app: appReducer,
            catalog: catalogReducer,
            rowSet: rowSetReducer,
            snapshot: snapshotReducer,
        }),
        middleware: getDefault =>
            getDefault().concat(listenerMiddleware.middleware),
    });
    setupRowSetSyncListener(listenerMiddleware as ListenerMiddlewareInstance);
    store.dispatch(catalogActions.setCatalog(catalog));
    store.dispatch(
        appActions.setAppData({
            domain: 'gsr.bitrix24.ru',
            user: { ID: 447 },
            deal: null,
            company: null,
            dealId: 129487,
        } as unknown as InitApp),
    );
    store.dispatch(
        rowSetActions.setContext({ regionCode: 'stv', withTax: false }),
    );
    return store;
};

const buildMain = (store: ReturnType<typeof makeStore>) => {
    const complect = catalog.complects.byCode['buh']!;
    const row = buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key: 'general_main',
        setId: 'general',
        role: 'main',
        complectCode: 'buh',
        supplyCode: 'internet_1',
        contractCode: 'abonYear',
        composition: defaultComposition(complect),
    })!;
    store.dispatch(rowSetActions.upsertRow(row));
};

describe('save-флоу слепка v2', () => {
    let savedSnapshot: SnapshotV2 | null = null;

    beforeEach(() => {
        savedSnapshot = null;
        vi.restoreAllMocks();
        vi.spyOn(
            SnapshotHelper.prototype,
            'saveSnapshot',
        ).mockImplementation(async snapshot => {
            savedSnapshot = snapshot;
        });
        // restore в тесте идёт через fallbackRecord, сеть не нужна
        vi.spyOn(SnapshotHelper.prototype, 'getSnapshot').mockRejectedValue(
            new Error('offline'),
        );
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    it('сохраняет v2 и восстанавливает без потерь', async () => {
        const store = makeStore();
        buildMain(store);
        const before = store.getState().rowSet.general;

        const ok = await store.dispatch(saveSnapshot() as never);
        expect(ok).toBe(true);
        expect(store.getState().snapshot.saveStatus).toBe('saved');
        expect(savedSnapshot).not.toBeNull();
        expect(isSnapshotV2(savedSnapshot)).toBe(true);
        expect(savedSnapshot!.dealId).toBe(129487);
        expect(savedSnapshot!.regionCode).toBe('stv');
        expect(savedSnapshot!.contractCode).toBe('abonYear');

        // Восстановление в чистый стор из записи, как её вернул бы бэк
        const record: V1Record = {
            dealId: 129487,
            domain: 'gsr.bitrix24.ru',
            rows: JSON.stringify(savedSnapshot),
        };
        const fresh = makeStore();
        await fresh.dispatch(
            restoreSnapshot({
                domain: 'gsr.bitrix24.ru',
                dealId: 129487,
                fallbackRecord: record,
            }) as never,
        );
        const after = fresh.getState().rowSet.general;
        expect(fresh.getState().snapshot.status).toBe('restored');
        expect(after.rows).toEqual(before.rows);
    });

    it('без строк — saveFailed, POST не уходит', async () => {
        const store = makeStore();
        const ok = await store.dispatch(saveSnapshot() as never);
        expect(ok).toBe(false);
        expect(store.getState().snapshot.saveStatus).toBe('error');
        expect(savedSnapshot).toBeNull();
    });
});

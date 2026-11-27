import { describe, expect, it } from 'vitest';
import {
    combineReducers,
    configureStore,
    createListenerMiddleware,
    type ListenerMiddlewareInstance,
} from '@reduxjs/toolkit';
import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogActions, catalogFromOldInit, catalogReducer } from '../../../catalog';
import { defaultComposition, type Composition } from '../../../composition';
import { setupRowSetSyncListener } from '../../model/listeners';
import { rowSetActions, rowSetReducer } from '../../model/RowSetSlice';
import { buildGarantRow } from '../row';
import { countRowsWithRegion, replaceClientRegionInRow, replaceClientRegionInSet } from '../set';
import { createSet, upsertRow } from '../set';
import type { KRow } from '../../model/types';

/**
 * Смена региона клиента (setContext с regionCode) переносит регион в составы
 * всех наборов: общего и «для сравнения».
 */
const catalog = catalogFromOldInit(oldInit);

const compositionOf = (patch: Partial<Composition>): Composition => ({
    ...defaultComposition(catalog.complects.byCode['buh']!),
    infoblocks: ['rus', 'reg'],
    ...patch,
});

const garantRow = (key: string, setId: string, role: KRow['role'], composition: Composition): KRow =>
    buildGarantRow({
        catalog,
        regionCode: 'stv',
        withTax: false,
        key,
        setId,
        role,
        complectCode: 'buh',
        supplyCode: 'internet_1',
        contractCode: 'internet',
        composition,
    })!;

const makeStore = () => {
    const listenerMiddleware = createListenerMiddleware();
    const store = configureStore({
        reducer: combineReducers({ catalog: catalogReducer, rowSet: rowSetReducer }),
        middleware: getDefault => getDefault().concat(listenerMiddleware.middleware),
    });
    setupRowSetSyncListener(listenerMiddleware as ListenerMiddlewareInstance);
    store.dispatch(catalogActions.setCatalog(catalog));
    return store;
};

const fill = (store: ReturnType<typeof makeStore>) => {
    store.dispatch(rowSetActions.setContext({ regionCode: 'stv' }));
    store.dispatch(
        rowSetActions.upsertRow(
            garantRow('general_main', 'general', 'main', compositionOf({ regions: ['stv', 'spb'], regionsUnweighted: ['kali'] })),
        ),
    );
    store.dispatch(rowSetActions.addComparisonSet('alt1'));
    store.dispatch(
        rowSetActions.upsertRow(
            garantRow('alt1_garant', 'alt1', 'comparison', compositionOf({ regions: ['spb'], regionsUnweighted: ['stv'] })),
        ),
    );
};

describe('смена региона клиента в составах', () => {
    it('заменяет прежний регион клиента во всех наборах, остальные регионы остаются', () => {
        const store = makeStore();
        fill(store);
        store.dispatch(rowSetActions.setContext({ regionCode: 'msk' }));

        const { general, alternative } = store.getState().rowSet;
        const main = general.rows.find(row => row.key === 'general_main')!;
        expect(main.composition?.regions).toEqual(['msk', 'spb']);
        expect(main.composition?.regionsUnweighted).toEqual(['kali']);

        const alt = alternative[0]!.rows.find(row => row.key === 'alt1_garant')!;
        // в наборе для сравнения регион клиента не считал вес — остаётся в «не считать»
        expect(alt.composition?.regions).toEqual(['spb']);
        expect(alt.composition?.regionsUnweighted).toEqual(['msk']);
    });

    it('цены пересчитываются по новому региону на уже обновлённом составе', () => {
        const store = makeStore();
        fill(store);
        const before = store.getState().rowSet.general.rows.find(row => row.key === 'general_main')!;
        store.dispatch(rowSetActions.setContext({ regionCode: 'msk' }));
        const after = store.getState().rowSet.general.rows.find(row => row.key === 'general_main')!;
        expect(after.price.base).not.toBe(before.price.base);
        expect(after.composition?.regions).toContain('msk');
    });

    it('первый выбор региона (прежнего нет) составы не трогает', () => {
        const store = makeStore();
        store.dispatch(
            rowSetActions.upsertRow(garantRow('general_main', 'general', 'main', compositionOf({ regions: ['stv'] }))),
        );
        store.dispatch(rowSetActions.setContext({ regionCode: 'msk' }));
        const main = store.getState().rowSet.general.rows.find(row => row.key === 'general_main');
        expect(main?.composition?.regions).toEqual(['stv']);
    });

    it('тот же регион — составы те же', () => {
        const store = makeStore();
        fill(store);
        store.dispatch(rowSetActions.setContext({ regionCode: 'stv' }));
        const main = store.getState().rowSet.general.rows.find(row => row.key === 'general_main');
        expect(main?.composition?.regions).toEqual(['stv', 'spb']);
    });
});

describe('утилиты замены региона в наборе', () => {
    const row = garantRow('a', 'general', 'main', compositionOf({ regions: ['stv'] }));
    const set = upsertRow(createSet('general', 'general'), row);

    it('набор без старого региона остаётся тем же объектом', () => {
        expect(replaceClientRegionInSet(set, 'spb', 'msk')).toBe(set);
        expect(replaceClientRegionInRow(row, 'spb', 'msk')).toBe(row);
    });

    it('считает строки с регионом в любом из списков', () => {
        const other = garantRow('b', 'general', 'additional', compositionOf({ regionsUnweighted: ['stv'] }));
        const none = garantRow('c', 'general', 'additional', compositionOf({}));
        const sets = [upsertRow(upsertRow(upsertRow(createSet('general', 'general'), row), other), none)];
        expect(countRowsWithRegion(sets, 'stv')).toBe(2);
        expect(countRowsWithRegion(sets, 'msk')).toBe(0);
    });
});

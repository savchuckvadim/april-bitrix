import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import type { DealSendResponseDto } from '@workspace/nest-konstructor-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppThunk, RootState } from '@/modules/app/model/store';
import {
    complectVariantActions,
    complectVariantReducer,
} from '@/modules/entities/complect-variant/model/ComplectVariantSlice';
import {
    COMPLECT_MODE,
    DEFAULT_COMPLECT_COMPOSITION,
    type ComplectMode,
    type ComplectVariantRecordDto,
} from '@/modules/entities/complect-variant/model/dto';
import { recordOf } from '@/modules/entities/offer-document/lib/__fixtures__/variant-records';
import { rootStateWithVariants } from '@/modules/entities/offer-document/lib/__fixtures__/variants-state';
import type { DealSendRequest } from '../lib/build-deal-send.util';
import { dealSendReducer } from './DealSendSlice';
import { sendDeal } from './deal-send-thunk';

/**
 * «Сохранить сделку» при вариантах комплекта: строки всех участников, когда
 * варианты продаются вместе, и блокировка записи, если участника собрать нельзя.
 * Сеть и слепок сделки подменены: проверяется запрос бэку и итог в сторе.
 */
const mocks = vi.hoisted(() => ({
    send: vi.fn<(request: DealSendRequest) => Promise<DealSendResponseDto>>(),
    saveSnapshot: vi.fn<() => AppThunk<Promise<boolean>>>(),
}));

vi.mock('../lib/api/deal-send-helper', () => ({
    DealSendHelper: class {
        send = mocks.send;
    },
}));
vi.mock('@/modules/entities/snapshot', async importOriginal => ({
    ...(await importOriginal<typeof import('@/modules/entities/snapshot')>()),
    saveSnapshot: mocks.saveSnapshot,
}));

const OPEN_ID = 201;
const OTHER_ID = 202;

const stateOf = (mode: ComplectMode, records: ComplectVariantRecordDto[]): RootState => {
    const base = rootStateWithVariants(records, [
        { id: OPEN_ID, title: 'Бухгалтеру', stageId: 'DT1:NEW' },
        { id: OTHER_ID, title: 'Юристу', stageId: 'DT1:NEW' },
    ]);
    let complectVariant = complectVariantReducer(
        base.complectVariant,
        complectVariantActions.setComposition({ ...DEFAULT_COMPLECT_COMPOSITION, mode }),
    );
    complectVariant = complectVariantReducer(complectVariant, complectVariantActions.setOpenVariant(OPEN_ID));
    return { ...base, complectVariant };
};

const makeStore = (state: RootState) =>
    configureStore({
        reducer: (current: RootState = state, action: UnknownAction): RootState => ({
            ...current,
            dealSend: dealSendReducer(current.dealSend, action),
        }),
    });

describe('сохранение сделки при вариантах комплекта', () => {
    beforeEach(() => {
        for (const mock of Object.values(mocks)) mock.mockReset();
        mocks.send.mockResolvedValue({ dealId: 129487, created: false, skipped: [] });
        mocks.saveSnapshot.mockImplementation(() => async () => true);
    });

    it('«Все варианты, каждому свой договор»: в запросе строки живого набора и слепка, sort сквозной', async () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, [recordOf(1, OPEN_ID, 'ur'), recordOf(2, OTHER_ID, 'ur')]);
        const store = makeStore(state);

        const saved = await store.dispatch(sendDeal());

        const rows = mocks.send.mock.lastCall?.[0].productRows ?? [];
        expect(saved).toBe(true);
        expect(rows).toHaveLength(state.rowSet.general.rows.length + 1);
        expect(rows.map(row => row.sort)).toEqual(rows.map((_, index) => index));
        expect(store.getState().dealSend.status).toBe('done');
    });

    it('режим «Только открытый вариант»: в запросе только строки живого набора', async () => {
        const state = stateOf(COMPLECT_MODE.compare, [recordOf(1, OPEN_ID, 'ur'), recordOf(2, OTHER_ID, 'ur')]);
        const store = makeStore(state);

        await store.dispatch(sendDeal());

        const rows = mocks.send.mock.lastCall?.[0].productRows ?? [];
        expect(rows).toHaveLength(state.rowSet.general.rows.length);
    });

    it('участника собрать нельзя: запрос не уходит, текст блокера в ошибке отправки', async () => {
        const state = stateOf(COMPLECT_MODE.multi_contract, [
            recordOf(1, OPEN_ID, 'ur'),
            recordOf(2, OTHER_ID, 'ur', '{broken'),
        ]);
        const store = makeStore(state);

        const saved = await store.dispatch(sendDeal());

        const { status, error } = store.getState().dealSend;
        expect(saved).toBe(false);
        expect(mocks.send).not.toHaveBeenCalled();
        expect(mocks.saveSnapshot).not.toHaveBeenCalled();
        expect(status).toBe('error');
        expect(error).toContain('Вариант «Юристу» нельзя включить в документ: слепок не читается');
    });

    it('режим «Только открытый вариант»: нечитаемый слепок запись не блокирует', async () => {
        const state = stateOf(COMPLECT_MODE.compare, [
            recordOf(1, OPEN_ID, 'ur'),
            recordOf(2, OTHER_ID, 'ur', '{broken'),
        ]);
        const store = makeStore(state);

        const saved = await store.dispatch(sendDeal());

        expect(saved).toBe(true);
        expect(mocks.send).toHaveBeenCalledTimes(1);
    });
});

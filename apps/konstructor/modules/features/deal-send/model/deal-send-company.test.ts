import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import type { DealSendResponseDto, DealSendStatusResponseDto } from '@workspace/nest-konstructor-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IBXDeal } from '@bitrix/index';
import { appActions, appReducer } from '@/modules/app/model/AppSlice';
import type { AppThunk, RootState } from '@/modules/app/model/store';
import { rootStateWithVariants } from '@/modules/entities/offer-document/lib/__fixtures__/variants-state';
import type { DealSendRequest } from '../lib/build-deal-send.util';
import { dealSendReducer } from './DealSendSlice';
import { sendDeal } from './deal-send-thunk';

/**
 * «Создать сделку» из компании без сделки: ключ попытки, ожидание записи по
 * operationId, чтение созданной сделки из Битрикса. Сеть, слепок и Bitrix
 * подменены: проверяются запросы бэку и итог в сторе.
 */
const mocks = vi.hoisted(() => ({
    send: vi.fn<(request: DealSendRequest) => Promise<DealSendResponseDto>>(),
    status: vi.fn<(operationId: string) => Promise<DealSendStatusResponseDto>>(),
    saveSnapshot: vi.fn<() => AppThunk<Promise<boolean>>>(),
    readDeal: vi.fn<(dealId: number) => Promise<IBXDeal | null>>(),
}));

vi.mock('../lib/api/deal-send-helper', () => ({
    DealSendHelper: class {
        send = mocks.send;
        status = mocks.status;
    },
}));
vi.mock('@/modules/entities/snapshot', async importOriginal => ({
    ...(await importOriginal<typeof import('@/modules/entities/snapshot')>()),
    saveSnapshot: mocks.saveSnapshot,
}));
vi.mock('@/modules/entities/deal', async importOriginal => ({
    ...(await importOriginal<typeof import('@/modules/entities/deal')>()),
    readDeal: mocks.readDeal,
}));
// опрос без пауз: тесты проверяют обращение thunk к ручке статуса
vi.mock('../lib/deal-write-status.util', async importOriginal => {
    const actual = await importOriginal<typeof import('../lib/deal-write-status.util')>();
    return {
        ...actual,
        waitForDealWrite: (
            operationId: string,
            fetchStatus: Parameters<typeof actual.waitForDealWrite>[1],
        ) =>
            actual.waitForDealWrite(operationId, fetchStatus, {
                intervalMs: 0,
                maxAttempts: 3,
                wait: () => Promise.resolve(),
            }),
    };
});

const NEW_DEAL_ID = 700;
const NEW_DEAL = { ID: NEW_DEAL_ID, TITLE: 'ООО Ромашка', COMPANY_ID: '9' } as unknown as IBXDeal;

/** Компания без сделки: в приложении есть пользователь и компания, dealId нет */
const companyState = (): RootState => {
    const base = rootStateWithVariants([], []);
    return {
        ...base,
        app: {
            ...base.app,
            dealId: null,
            bitrix: {
                user: { ID: 5 } as unknown as RootState['app']['bitrix']['user'],
                deal: null,
                company: { ID: '9', TITLE: 'ООО Ромашка' } as unknown as RootState['app']['bitrix']['company'],
            },
        },
    };
};

/** Стор с настоящими срезами app и dealSend; `log` собирает типы действий по порядку */
const makeStore = (state: RootState, log: string[] = []) =>
    configureStore({
        reducer: (current: RootState = state, action: UnknownAction): RootState => ({
            ...current,
            app: appReducer(current.app, action),
            dealSend: dealSendReducer(current.dealSend, action),
        }),
        middleware: getDefault =>
            getDefault({ serializableCheck: false, immutableCheck: false }).concat(
                () => next => action => {
                    if (typeof action === 'object' && action && 'type' in action) {
                        log.push(String(action.type));
                    }
                    return next(action);
                },
            ),
    });

const created = (patch: Partial<DealSendResponseDto> = {}): DealSendResponseDto => ({
    dealId: NEW_DEAL_ID,
    created: true,
    skipped: [],
    operationId: 'op-1',
    warnings: [],
    ...patch,
});

const writeStatus = (patch: Partial<DealSendStatusResponseDto>): DealSendStatusResponseDto => ({
    operationId: 'op-1',
    state: 'completed',
    done: true,
    ok: true,
    attemptsMade: 1,
    error: null,
    result: null,
    ...patch,
});

describe('«Создать сделку» из компании без сделки', () => {
    beforeEach(() => {
        for (const mock of Object.values(mocks)) mock.mockReset();
        mocks.send.mockResolvedValue(created());
        mocks.status.mockResolvedValue(writeStatus({}));
        mocks.saveSnapshot.mockImplementation(() => async () => true);
        mocks.readDeal.mockResolvedValue(NEW_DEAL);
    });

    it('запрос создаёт сделку: без dealId, с компанией, ответственным и ключом попытки', async () => {
        const store = makeStore(companyState());

        await store.dispatch(sendDeal());

        const request = mocks.send.mock.lastCall?.[0];
        expect(request?.dealId).toBeNull();
        expect(request?.companyId).toBe(9);
        expect(request?.userId).toBe(5);
        expect(request?.dealName).toBe('ООО Ромашка');
        expect(request?.requestKey).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('слепок пишется уже с новым dealId; созданная сделка читается и кладётся в приложение', async () => {
        const store = makeStore(companyState());
        let dealIdAtSnapshot: number | null = null;
        mocks.saveSnapshot.mockImplementation(() => async (_dispatch, getState) => {
            dealIdAtSnapshot = getState().app.dealId;
            return true;
        });

        const ok = await store.dispatch(sendDeal());

        const { app, dealSend } = store.getState();
        expect(ok).toBe(true);
        expect(dealIdAtSnapshot).toBe(NEW_DEAL_ID);
        expect(mocks.readDeal).toHaveBeenCalledWith(NEW_DEAL_ID);
        expect(app.dealId).toBe(NEW_DEAL_ID);
        expect(app.bitrix.deal).toEqual(NEW_DEAL);
        expect(dealSend.status).toBe('done');
        expect(dealSend.lastCreated).toBe(true);
    });

    it('setDeal уходит в стор: приложение получает сделку тем же действием, что запускает перезапуск инициализации', async () => {
        const actions: string[] = [];
        const store = makeStore(companyState(), actions);

        await store.dispatch(sendDeal());

        expect(actions).toContain(appActions.setDeal.type);
        expect(actions.indexOf(appActions.setDealId.type)).toBeLessThan(
            actions.indexOf(appActions.setDeal.type),
        );
    });

    it('итог записи ждётся по operationId, пока он не завершится', async () => {
        mocks.status
            .mockResolvedValueOnce(writeStatus({ state: 'active', done: false, ok: false }))
            .mockResolvedValueOnce(writeStatus({}));
        const store = makeStore(companyState());

        const ok = await store.dispatch(sendDeal());

        expect(ok).toBe(true);
        expect(mocks.status).toHaveBeenCalledTimes(2);
        expect(mocks.status).toHaveBeenCalledWith('op-1');
        expect(store.getState().dealSend.status).toBe('done');
    });

    it('запись упала: сделка всё равно в приложении, ошибка с причиной на кнопке', async () => {
        mocks.status.mockResolvedValue(
            writeStatus({ state: 'failed', done: true, ok: false, error: 'Bitrix 500' }),
        );
        const store = makeStore(companyState());

        const ok = await store.dispatch(sendDeal());

        const { app, dealSend } = store.getState();
        expect(ok).toBe(false);
        expect(app.dealId).toBe(NEW_DEAL_ID);
        expect(app.bitrix.deal).toEqual(NEW_DEAL);
        expect(dealSend.status).toBe('error');
        expect(dealSend.error).toContain('Сделка 700 создана');
        expect(dealSend.error).toContain('Bitrix 500');
    });

    it('запись не поставлена в очередь: на кнопке ошибка', async () => {
        mocks.send.mockResolvedValue(created({ operationId: null, warnings: ['write_not_queued'] }));
        const store = makeStore(companyState());

        const ok = await store.dispatch(sendDeal());

        expect(ok).toBe(false);
        expect(mocks.status).not.toHaveBeenCalled();
        expect(store.getState().dealSend.error).toContain('не записались');
    });

    it('запись не завершилась за отведённое время: готово с предупреждением', async () => {
        mocks.status.mockResolvedValue(writeStatus({ state: 'active', done: false, ok: false }));
        const store = makeStore(companyState());

        const ok = await store.dispatch(sendDeal());

        const { dealSend } = store.getState();
        expect(ok).toBe(true);
        expect(dealSend.status).toBe('done');
        expect(dealSend.warnings.map(warning => warning.field)).toContain('Запись в сделку');
    });

    it('сделка не прочиталась из Битрикса: dealId остаётся, ошибки нет', async () => {
        mocks.readDeal.mockResolvedValue(null);
        const store = makeStore(companyState());

        const ok = await store.dispatch(sendDeal());

        const { app, dealSend } = store.getState();
        expect(ok).toBe(true);
        expect(app.dealId).toBe(NEW_DEAL_ID);
        expect(app.bitrix.deal).toBeNull();
        expect(dealSend.status).toBe('done');
    });

    it('слепок не сохранился: сделка в приложении, на кнопке ошибка слепка', async () => {
        mocks.saveSnapshot.mockImplementation(() => async () => false);
        const store = makeStore(companyState());

        const ok = await store.dispatch(sendDeal());

        expect(ok).toBe(false);
        expect(store.getState().app.bitrix.deal).toEqual(NEW_DEAL);
        expect(store.getState().dealSend.error).toContain('предложение не сохранилось');
    });
});

describe('ключ попытки создать сделку', () => {
    beforeEach(() => {
        for (const mock of Object.values(mocks)) mock.mockReset();
        mocks.status.mockResolvedValue(writeStatus({}));
        mocks.saveSnapshot.mockImplementation(() => async () => true);
        mocks.readDeal.mockResolvedValue(NEW_DEAL);
    });

    it('повтор после сбоя берёт тот же ключ, новая попытка после успеха ключа не имеет', async () => {
        mocks.send.mockRejectedValueOnce(new Error('сеть оборвалась')).mockResolvedValue(created());
        const store = makeStore(companyState());

        const first = await store.dispatch(sendDeal());
        const keyAfterFailure = store.getState().dealSend.requestKey;
        const second = await store.dispatch(sendDeal());
        const third = await store.dispatch(sendDeal());

        const [firstRequest, secondRequest, thirdRequest] = mocks.send.mock.calls.map(([request]) => request);
        expect(first).toBe(false);
        expect(second).toBe(true);
        expect(third).toBe(true);
        expect(keyAfterFailure).toBeTruthy();
        expect(firstRequest?.requestKey).toBe(keyAfterFailure);
        expect(secondRequest?.requestKey).toBe(keyAfterFailure);
        // сделка создана: у сохранения существующей сделки ключа нет
        expect(thirdRequest?.dealId).toBe(NEW_DEAL_ID);
        expect(thirdRequest?.requestKey).toBeUndefined();
        expect(store.getState().dealSend.requestKey).toBeNull();
    });

    it('после успешного создания ключ сброшен, а ошибка записи его не возвращает', async () => {
        mocks.send.mockResolvedValue(created());
        mocks.status.mockResolvedValue(
            writeStatus({ state: 'failed', done: true, ok: false, error: 'Bitrix 500' }),
        );
        const store = makeStore(companyState());

        await store.dispatch(sendDeal());

        expect(store.getState().dealSend.requestKey).toBeNull();
    });
});

describe('сохранение существующей сделки', () => {
    it('ключа и чтения сделки нет: bitrix.deal остаётся тем, что загрузил старт', async () => {
        for (const mock of Object.values(mocks)) mock.mockReset();
        mocks.send.mockResolvedValue(created({ dealId: 129487, created: false, operationId: null }));
        mocks.saveSnapshot.mockImplementation(() => async () => true);
        const base = rootStateWithVariants([], []);
        const store = makeStore(base);

        const ok = await store.dispatch(sendDeal());

        expect(ok).toBe(true);
        expect(mocks.send.mock.lastCall?.[0].requestKey).toBeUndefined();
        expect(mocks.readDeal).not.toHaveBeenCalled();
    });
});

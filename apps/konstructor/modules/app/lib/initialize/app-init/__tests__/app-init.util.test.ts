import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Отложенный ответ: тест сам решает, когда «сеть» ответит */
const deferred = <T>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(done => {
        resolve = done;
    });
    return { promise, resolve };
};

const mocks = vi.hoisted(() => ({
    start: vi.fn(),
    bitrixInit: vi.fn(),
    bootstrapPortalSession: vi.fn(),
}));

vi.mock('@workspace/bitrix', () => ({
    Bitrix: { start: mocks.start, getService: vi.fn() },
}));
vi.mock('../../bitrix-init/bitrix-init.util', () => ({
    bitrixInit: mocks.bitrixInit,
}));
vi.mock('../../../portal-session/portal-session', () => ({
    bootstrapPortalSession: mocks.bootstrapPortalSession,
}));
vi.mock('../../../../consts/app-global', () => ({
    IS_PROD: false,
    HAS_DEV_PLACEMENT: true,
    DEV_PLACEMENT_HINT: 'hint',
    TESTING_DOMAIN: 'test.bitrix24.ru',
    TESTING_USER: { ID: 1 },
    TESTING_PLACEMENT: { placement: 'CRM_DEAL_DETAIL_TAB', options: { ID: 7 } },
}));

import { appActions } from '../../../../model/AppSlice';
import { appInit } from '../app-init.util';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const DEAL = { deal: { ID: 42 }, company: { ID: 9 } };

/** Фрейм поднят: домен и placement известны, пользователь — когда ответит Битрикс */
const startInFrame = (user: Promise<{ ID: number } | null>) =>
    mocks.start.mockResolvedValue({
        api: {
            getInitializedData: () => ({ domain: 'portal.bitrix24.ru', inFrame: true }),
            getPlacement: () => ({ placement: 'CRM_DEAL_DETAIL_TAB', options: { ID: 42 } }),
            whenUser: () => user,
        },
    });

const typesOf = (dispatch: ReturnType<typeof vi.fn>): string[] =>
    dispatch.mock.calls.map(([action]) => (action as { type: string }).type);

describe('старт приложения: пользователь, сессия портала, сделка с компанией', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('старт не ждёт пользователя: фрейм поднимается с deferUser', async () => {
        startInFrame(Promise.resolve({ ID: 5 }));
        mocks.bootstrapPortalSession.mockResolvedValue(true);
        mocks.bitrixInit.mockResolvedValue(DEAL);

        await appInit(vi.fn());

        expect(mocks.start).toHaveBeenCalledWith(
            'test.bitrix24.ru',
            { ID: 1 },
            { deferUser: true },
        );
    });

    it('всё идёт параллельно; каталог стартует по сессии, setAppData ждёт всех', async () => {
        const user = deferred<{ ID: number } | null>();
        const session = deferred<boolean>();
        const deal = deferred<typeof DEAL>();
        startInFrame(user.promise);
        mocks.bootstrapPortalSession.mockReturnValue(session.promise);
        mocks.bitrixInit.mockReturnValue(deal.promise);
        const dispatch = vi.fn();

        const running = appInit(dispatch);
        await flush();
        // никто ещё не ответил, а сессия и сделка с компанией уже запрошены
        expect(mocks.bootstrapPortalSession).toHaveBeenCalledTimes(1);
        expect(mocks.bitrixInit).toHaveBeenCalledWith(42);
        expect(dispatch).not.toHaveBeenCalled();

        session.resolve(true);
        await flush();
        // токен есть — каталог запускается, не дожидаясь пользователя и сделки
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            appActions.portalSessionReady({ domain: 'portal.bitrix24.ru' }),
        );

        deal.resolve(DEAL);
        await flush();
        // пользователя ещё нет — setAppData рано
        expect(dispatch).toHaveBeenCalledTimes(1);

        user.resolve({ ID: 5 });
        await running;
        expect(typesOf(dispatch)).toEqual([
            appActions.portalSessionReady.type,
            appActions.setAppData.type,
        ]);
        expect(dispatch.mock.calls[1]?.[0]).toMatchObject({
            payload: { domain: 'portal.bitrix24.ru', dealId: 42, user: { ID: 5 } },
        });
    });

    it('сделка пришла раньше токена — запросы к бэку всё равно ждут токен', async () => {
        const session = deferred<boolean>();
        startInFrame(Promise.resolve({ ID: 5 }));
        mocks.bootstrapPortalSession.mockReturnValue(session.promise);
        mocks.bitrixInit.mockResolvedValue(DEAL);
        const dispatch = vi.fn();

        const running = appInit(dispatch);
        await flush();
        expect(dispatch).not.toHaveBeenCalled();

        session.resolve(true);
        await running;
        expect(typesOf(dispatch)).toEqual([
            appActions.portalSessionReady.type,
            appActions.setAppData.type,
        ]);
    });

    it('сбой обмена сессии старт не роняет; Битрикс не отдал пользователя — запасной', async () => {
        startInFrame(Promise.resolve(null));
        mocks.bootstrapPortalSession.mockRejectedValue(new Error('сеть'));
        mocks.bitrixInit.mockResolvedValue(DEAL);
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(typesOf(dispatch)).toEqual([
            appActions.portalSessionReady.type,
            appActions.setAppData.type,
        ]);
        expect(dispatch.mock.calls[1]?.[0]).toMatchObject({ payload: { user: { ID: 1 } } });
    });
});

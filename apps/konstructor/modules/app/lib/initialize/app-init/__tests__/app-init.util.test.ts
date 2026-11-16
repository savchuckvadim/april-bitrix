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

describe('старт приложения: сессия портала и сделка с компанией', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.start.mockResolvedValue({
            api: {
                getInitializedData: () => ({
                    domain: 'portal.bitrix24.ru',
                    user: { ID: 5 },
                    inFrame: true,
                }),
                getPlacement: () => ({
                    placement: 'CRM_DEAL_DETAIL_TAB',
                    options: { ID: 42 },
                }),
            },
        });
    });

    it('идут параллельно; setAppData ждёт токен сессии', async () => {
        const session = deferred<boolean>();
        const deal = deferred<{ deal: object; company: object }>();
        mocks.bootstrapPortalSession.mockReturnValue(session.promise);
        mocks.bitrixInit.mockReturnValue(deal.promise);
        const dispatch = vi.fn();

        const running = appInit(dispatch);
        await flush();
        // сессия ещё не ответила, а сделка с компанией уже запрошены
        expect(mocks.bootstrapPortalSession).toHaveBeenCalledTimes(1);
        expect(mocks.bitrixInit).toHaveBeenCalledWith(42);

        deal.resolve({ deal: { ID: 42 }, company: { ID: 9 } });
        await flush();
        // сделка пришла, токена ещё нет — запросы к бэку запускать рано
        expect(dispatch).not.toHaveBeenCalled();

        session.resolve(true);
        await running;
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            appActions.setAppData(
                expect.objectContaining({ domain: 'portal.bitrix24.ru', dealId: 42 }) as never,
            ),
        );
    });

    it('сбой обмена сессии старт не роняет', async () => {
        mocks.bootstrapPortalSession.mockRejectedValue(new Error('сеть'));
        mocks.bitrixInit.mockResolvedValue({ deal: { ID: 42 }, company: { ID: 9 } });
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0]?.[0]).toMatchObject({ type: appActions.setAppData.type });
    });
});

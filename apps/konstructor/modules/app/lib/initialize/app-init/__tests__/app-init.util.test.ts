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
    resolveCompanyDealId: vi.fn(),
    readCompany: vi.fn(),
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
vi.mock('../company-entry.util', () => ({
    resolveCompanyDealId: mocks.resolveCompanyDealId,
}));
vi.mock('../../../services/bx-company-entry.service', () => ({
    readCompany: mocks.readCompany,
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
import {
    appInit,
    COMPANY_UNAVAILABLE_ERROR,
    NO_ENTITY_ERROR,
} from '../app-init.util';

const flush = () => new Promise(resolve => setTimeout(resolve, 0));
const DEAL = { deal: { ID: 42 }, company: { ID: 9 } };

const DEAL_PLACEMENT = { placement: 'CRM_DEAL_DETAIL_TAB', options: { ID: 42 } };
const COMPANY_PLACEMENT = { placement: 'CRM_COMPANY_DETAIL_TAB', options: { ID: 9 } };
const LEAD_PLACEMENT = { placement: 'CRM_LEAD_DETAIL_TAB', options: { ID: 3 } };

/** Фрейм поднят: домен и placement известны, пользователь — когда ответит Битрикс */
const startInFrame = (
    user: Promise<{ ID: number } | null>,
    placement: { placement: string; options: { ID: number } } = DEAL_PLACEMENT,
) =>
    mocks.start.mockResolvedValue({
        api: {
            getInitializedData: () => ({ domain: 'portal.bitrix24.ru', inFrame: true }),
            getPlacement: () => placement,
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

describe('старт из карточки компании', () => {
    const COMPANY = { ID: 9, TITLE: 'ООО Ромашка' };

    beforeEach(() => {
        vi.clearAllMocks();
        startInFrame(Promise.resolve({ ID: 5 }), COMPANY_PLACEMENT);
        mocks.bootstrapPortalSession.mockResolvedValue(true);
    });

    it('открытая сделка «ОП Основная» есть: грузится она вместе с компанией', async () => {
        mocks.resolveCompanyDealId.mockResolvedValue(501);
        mocks.bitrixInit.mockResolvedValue({ deal: { ID: 501 }, company: COMPANY });
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(mocks.resolveCompanyDealId).toHaveBeenCalledWith(
            9,
            'portal.bitrix24.ru',
            expect.any(Promise),
        );
        expect(mocks.bitrixInit).toHaveBeenCalledWith(501);
        expect(mocks.readCompany).not.toHaveBeenCalled();
        expect(dispatch.mock.calls.at(-1)?.[0]).toMatchObject({
            type: appActions.setAppData.type,
            payload: {
                dealId: 501,
                deal: { ID: 501 },
                company: COMPANY,
                placement: { code: 'CRM_COMPANY_DETAIL_TAB', entity: 'company' },
            },
        });
    });

    it('подходящей сделки нет: ошибки нет, компания загружена по ID из placement, сделки нет', async () => {
        mocks.resolveCompanyDealId.mockResolvedValue(null);
        mocks.readCompany.mockResolvedValue(COMPANY);
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(mocks.bitrixInit).not.toHaveBeenCalled();
        expect(mocks.readCompany).toHaveBeenCalledWith(9);
        expect(typesOf(dispatch)).toEqual([
            appActions.portalSessionReady.type,
            appActions.setAppData.type,
        ]);
        expect(dispatch.mock.calls[1]?.[0]).toMatchObject({
            payload: {
                domain: 'portal.bitrix24.ru',
                user: { ID: 5 },
                dealId: null,
                deal: null,
                company: COMPANY,
                placement: { code: 'CRM_COMPANY_DETAIL_TAB', entity: 'company' },
            },
        });
    });

    it('сделка найдена, но не прочиталась: работаем на самой компании', async () => {
        mocks.resolveCompanyDealId.mockResolvedValue(501);
        mocks.bitrixInit.mockResolvedValue(null);
        mocks.readCompany.mockResolvedValue(COMPANY);
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(dispatch.mock.calls.at(-1)?.[0]).toMatchObject({
            payload: { dealId: null, deal: null, company: COMPANY },
        });
    });

    it('компания не прочиталась: экран «компания недоступна», приложение не стартует', async () => {
        mocks.resolveCompanyDealId.mockResolvedValue(null);
        mocks.readCompany.mockResolvedValue(null);
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(typesOf(dispatch)).not.toContain(appActions.setAppData.type);
        expect(dispatch).toHaveBeenCalledWith(
            appActions.setInitializedError({ errorMessage: COMPANY_UNAVAILABLE_ERROR }),
        );
    });
});

describe('старт из лида и неизвестной карточки', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.bootstrapPortalSession.mockResolvedValue(true);
    });

    it('лид: экран «работает из сделки или компании», запросов к сделкам нет', async () => {
        startInFrame(Promise.resolve({ ID: 5 }), LEAD_PLACEMENT);
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(dispatch).toHaveBeenCalledWith(
            appActions.setInitializedError({ errorMessage: NO_ENTITY_ERROR }),
        );
        expect(typesOf(dispatch)).not.toContain(appActions.setAppData.type);
        expect(mocks.resolveCompanyDealId).not.toHaveBeenCalled();
        expect(mocks.bitrixInit).not.toHaveBeenCalled();
        expect(mocks.readCompany).not.toHaveBeenCalled();
    });

    it('placement без ID карточки — тот же экран', async () => {
        startInFrame(Promise.resolve({ ID: 5 }), {
            placement: 'DEFAULT',
            options: { ID: 0 },
        });
        const dispatch = vi.fn();

        await appInit(dispatch);

        expect(dispatch).toHaveBeenCalledWith(
            appActions.setInitializedError({ errorMessage: NO_ENTITY_ERROR }),
        );
    });
});

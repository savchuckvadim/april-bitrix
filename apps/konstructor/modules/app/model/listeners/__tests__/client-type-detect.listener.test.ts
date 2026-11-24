import { beforeEach, describe, expect, it, vi } from 'vitest';
import { appActions } from '../../AppSlice';
import { bxrqActions } from '@/modules/entities/bx-rq/model/BxRqSlice';
import { RQ_TYPE } from '@/modules/entities/bx-rq/model/types';
import { selectClientType } from '@/modules/entities/deal/lib/utils/select-client-type.util';
import {
    COMPANY_FIELD_KEY,
    COMPANY_ID,
    DEAL_FIELD_KEY,
    ITEM_BITRIX_ID,
    dealData,
    loadDeal,
    loadPortal,
    loadRequisites,
    makePortal,
    makePromptStore,
} from '@/modules/features/client-type-prompt/lib/__fixtures__/prompt-store';
import { setupClientTypeDetectListener } from '../client-type-detect.listener';

const bitrix = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock('@workspace/bitrix', async importOriginal => ({
    ...(await importOriginal<typeof import('@workspace/bitrix')>()),
    Bitrix: { getService: () => ({ company: { update: bitrix.update } }) },
}));

/** Стор с подключённым автоопределением. */
const makeStore = () => {
    const { store, listenerMiddleware } = makePromptStore();
    setupClientTypeDetectListener(listenerMiddleware);
    return store;
};

/** Автоопределение отработало (с записью или без). */
const detectDone = (store: ReturnType<typeof makeStore>) =>
    vi.waitFor(() =>
        expect(store.getState().clientTypePrompt.detect).toBe('done'),
    );

/** Сделка, портал и реквизиты загружены в порядке реальной загрузки. */
const loadAll = async (
    store: ReturnType<typeof makeStore>,
    types: RQ_TYPE[],
    deal?: Parameters<typeof dealData>[0],
) => {
    loadDeal(store, deal);
    loadPortal(store, makePortal());
    loadRequisites(store, types);
    await detectDone(store);
};

beforeEach(() => {
    bitrix.update.mockReset();
    bitrix.update.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('автоопределение типа клиента по реквизитам', () => {
    it('реквизиты только организации — тип не пишется: выбор за менеджером в окне', async () => {
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.ORGANIZATION]);

        expect(bitrix.update).not.toHaveBeenCalled();
        expect(selectClientType(store.getState())).toBeNull();
    });

    it.each([
        [RQ_TYPE.BUDGET, 'state'],
        [RQ_TYPE.IP, 'ip'],
        [RQ_TYPE.FIZ, 'fiz'],
    ] as const)(
        'реквизиты одного типа %s и пустое поле — в компанию пишется пункт «%s»',
        async (type, code) => {
            const store = makeStore();
            await loadAll(store, [type]);

            expect(bitrix.update).toHaveBeenCalledTimes(1);
            expect(bitrix.update).toHaveBeenCalledWith(COMPANY_ID, {
                [COMPANY_FIELD_KEY]: ITEM_BITRIX_ID[code],
            });
            expect(selectClientType(store.getState())).toBe(type);
        },
    );

    it('несколько реквизитов одного типа — тип тоже определяется', async () => {
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.IP, RQ_TYPE.IP]);

        expect(bitrix.update).toHaveBeenCalledTimes(1);
        expect(selectClientType(store.getState())).toBe(RQ_TYPE.IP);
    });

    it('порядок загрузки не важен: реквизиты пришли раньше портала', async () => {
        const store = makeStore();
        loadDeal(store);
        loadRequisites(store, [RQ_TYPE.FIZ]);
        expect(store.getState().clientTypePrompt.detect).toBe('idle');
        expect(bitrix.update).not.toHaveBeenCalled();

        loadPortal(store, makePortal());
        await detectDone(store);

        expect(bitrix.update).toHaveBeenCalledTimes(1);
        expect(selectClientType(store.getState())).toBe(RQ_TYPE.FIZ);
    });

    it('в сделке нет компании — ничего не пишется, попытка не начинается', () => {
        const store = makeStore();
        loadDeal(store, { noCompany: true });
        loadPortal(store, makePortal());
        loadRequisites(store, [RQ_TYPE.IP]);

        expect(store.getState().clientTypePrompt.detect).toBe('idle');
        expect(bitrix.update).not.toHaveBeenCalled();
    });

    it('реквизиты ещё грузятся — ждём ответа, попытка не начинается', () => {
        const store = makeStore();
        loadDeal(store);
        store.dispatch(bxrqActions.setLoading(true));
        loadPortal(store, makePortal());

        expect(store.getState().clientTypePrompt.detect).toBe('idle');
        expect(bitrix.update).not.toHaveBeenCalled();
    });

    it('тип клиента в компании уже задан — не перезаписывается', async () => {
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.IP], {
            company: { [COMPANY_FIELD_KEY]: String(ITEM_BITRIX_ID.commerc) },
        });

        expect(bitrix.update).not.toHaveBeenCalled();
        expect(selectClientType(store.getState())).toBe(RQ_TYPE.ORGANIZATION);
    });

    it('тип клиента задан в сделке — не перезаписывается', async () => {
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.IP], {
            deal: { [DEAL_FIELD_KEY]: String(ITEM_BITRIX_ID.state) },
        });

        expect(bitrix.update).not.toHaveBeenCalled();
        expect(selectClientType(store.getState())).toBe(RQ_TYPE.BUDGET);
    });

    it('реквизиты разных типов — ничего не пишется', async () => {
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.ORGANIZATION, RQ_TYPE.FIZ]);

        expect(bitrix.update).not.toHaveBeenCalled();
        expect(selectClientType(store.getState())).toBeNull();
    });

    it('реквизитов у компании нет — ничего не пишется', async () => {
        const store = makeStore();
        await loadAll(store, []);

        expect(bitrix.update).not.toHaveBeenCalled();
        expect(selectClientType(store.getState())).toBeNull();
    });

    it('реквизиты не загрузились — попытка завершается без записи', async () => {
        const store = makeStore();
        loadDeal(store);
        loadPortal(store, makePortal());
        store.dispatch(bxrqActions.setFetchedStatus(true));
        await detectDone(store);

        expect(bitrix.update).not.toHaveBeenCalled();
    });

    it('поля «Тип клиента» нет на портале — запись не уходит', async () => {
        const store = makeStore();
        loadDeal(store);
        loadPortal(store, makePortal({ withoutField: true }));
        loadRequisites(store, [RQ_TYPE.IP]);
        await detectDone(store);

        expect(bitrix.update).not.toHaveBeenCalled();
    });

    it('пункта нужного типа нет на портале — запись не уходит', async () => {
        const store = makeStore();
        loadDeal(store);
        loadPortal(store, makePortal({ itemCodes: ['commerc'] }));
        loadRequisites(store, [RQ_TYPE.IP]);
        await detectDone(store);

        expect(bitrix.update).not.toHaveBeenCalled();
        expect(selectClientType(store.getState())).toBeNull();
    });

    it('запись не удалась — тип откатывается, попытка завершена и не повторяется', async () => {
        bitrix.update.mockRejectedValue(new Error('Bitrix недоступен'));
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.IP]);

        expect(bitrix.update).toHaveBeenCalledTimes(1);
        expect(selectClientType(store.getState())).toBeNull();

        loadRequisites(store, [RQ_TYPE.IP]);
        await Promise.resolve();
        expect(bitrix.update).toHaveBeenCalledTimes(1);
    });

    it('не повторяет запись: повторные загрузки реквизитов и портала в рамках одной сделки', async () => {
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.FIZ]);
        expect(bitrix.update).toHaveBeenCalledTimes(1);

        loadRequisites(store, [RQ_TYPE.FIZ]);
        loadPortal(store, makePortal());
        store.dispatch(bxrqActions.setFetchedStatus(true));
        await Promise.resolve();

        expect(bitrix.update).toHaveBeenCalledTimes(1);
    });

    it('сделка загружена заново (⟳): попытка делается снова', async () => {
        const store = makeStore();
        await loadAll(store, [RQ_TYPE.FIZ]);
        expect(bitrix.update).toHaveBeenCalledTimes(1);

        // свежая сделка пришла без типа клиента, реквизиты и портал грузятся заново
        store.dispatch(appActions.setAppData(dealData()));
        store.dispatch(bxrqActions.setLoading(true));
        expect(store.getState().clientTypePrompt.detect).toBe('idle');
        loadPortal(store, makePortal());
        loadRequisites(store, [RQ_TYPE.FIZ]);
        await detectDone(store);

        expect(bitrix.update).toHaveBeenCalledTimes(2);
    });
});

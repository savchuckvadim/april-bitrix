/**
 * Работа через сервер при отказе Битрикса по правам (решение владельца
 * 22–25.10.2026): первый «нет доступа» переключает транспорт, этот вызов и
 * все следующие идут на сервер; упавшие команды пакета досылаются.
 */
import { describe, expect, it, vi } from 'vitest';
import { BitrixBaseApi } from '../bitrix-base-api';
import {
    BitrixServerMode,
    type BitrixServerTransport,
    buildServerRetry,
    isBitrixAccessDenied,
    resolveFrameRefs,
} from '../bitrix-server-mode';

const transport = (
    over: Partial<BitrixServerTransport> = {},
): BitrixServerTransport => ({
    call: vi.fn(async () => ({ result: 'server' })),
    batch: vi.fn(async () => ({ result: {}, errors: {} })),
    ...over,
});

describe('isBitrixAccessDenied', () => {
    it.each([
        { code: 'ACCESS_DENIED', message: 'x' },
        { error: '', error_description: 'Access denied.' },
        { code: 'ERROR_CORE', message: 'Действие над задачей не разрешено' },
        { code: 'insufficient_scope' },
        'Access denied',
    ])('отказ по правам: %o', error => {
        expect(isBitrixAccessDenied(error)).toBe(true);
    });

    it.each([
        { code: 'NOT_FOUND', message: 'Not found' },
        { code: 'QUERY_LIMIT_EXCEEDED' },
        new Error('Network Error'),
        null,
    ])('не про права: %o', error => {
        expect(isBitrixAccessDenied(error)).toBe(false);
    });
});

describe('ссылки $result при досылке', () => {
    const results = { contact: 501, deal: { ID: '7', TITLE: 'x' } };

    it('ссылки на выполненные во фрейме — значениями, на досылаемые — как есть', () => {
        expect(
            resolveFrameRefs(
                {
                    id: '$result[deal][ID]',
                    fields: {
                        CONTACT_ID: '$result[contact]',
                        LEAD: '$result[lead]',
                        TITLE: 'обычный текст',
                    },
                    list: ['$result[contact]'],
                },
                results,
                new Set(['lead']),
            ),
        ).toEqual({
            id: '7',
            fields: {
                CONTACT_ID: 501,
                LEAD: '$result[lead]',
                TITLE: 'обычный текст',
            },
            list: [501],
        });
    });

    it('объект целиком не подставляется — ссылка остаётся', () => {
        expect(resolveFrameRefs('$result[deal]', results, new Set())).toBe(
            '$result[deal]',
        );
    });

    it('досылаются только упавшие команды', () => {
        expect(
            buildServerRetry(
                {
                    contact: { method: 'crm.contact.add', params: {} },
                    bind: {
                        method: 'crm.deal.contact.add',
                        params: { fields: { CONTACT_ID: '$result[contact]' } },
                    },
                },
                { contact: 501 },
                ['bind'],
            ),
        ).toEqual({
            bind: {
                method: 'crm.deal.contact.add',
                params: { fields: { CONTACT_ID: 501 } },
            },
        });
    });
});

describe('BitrixServerMode', () => {
    it('без транспорта не переключается', () => {
        const mode = new BitrixServerMode();
        expect(mode.canTakeOver({ code: 'ACCESS_DENIED' })).toBe(false);
        expect(mode.isActive).toBe(false);
    });

    it('пакет фрейма с отказом: режим включён, упавшие досланы, результат общий', async () => {
        const listener = vi.fn();
        const server = transport({
            batch: vi.fn(async () => ({ result: { bind: true }, errors: {} })),
        });
        const mode = new BitrixServerMode();
        mode.connect(server, listener);

        const result = await mode.completeFrameBatch(
            {
                contact: { method: 'crm.contact.add', params: {} },
                bind: { method: 'crm.deal.contact.add', params: {} },
            },
            { contact: 501 },
            new Map([['bind', { code: 'ACCESS_DENIED', message: 'Access denied' }]]),
        );

        expect(result).toEqual({ contact: 501, bind: true });
        expect(mode.isActive).toBe(true);
        expect(listener).toHaveBeenCalledWith({
            method: 'crm.deal.contact.add',
            reason: 'ACCESS_DENIED: Access denied',
        });
    });

    it('ошибки пакета не про права — ничего не досылаем', async () => {
        const server = transport();
        const mode = new BitrixServerMode();
        mode.connect(server);
        const result = await mode.completeFrameBatch(
            { a: { method: 'crm.deal.get' } },
            {},
            new Map([['a', { code: 'NOT_FOUND' }]]),
        );
        expect(result).toEqual({});
        expect(server.batch).not.toHaveBeenCalled();
        expect(mode.isActive).toBe(false);
    });
});

describe('BitrixBaseApi во фрейме', () => {
    const enterFrame = (api: BitrixBaseApi, callMethod: () => unknown) => {
        const state = api as unknown as {
            bx: { callMethod: () => unknown };
            inFrame: boolean;
        };
        state.bx = { callMethod };
        state.inFrame = true;
    };

    it('отказ по правам: этот вызов и следующие — через сервер', async () => {
        const api = new BitrixBaseApi({ sendMessageAdminError: async () => {} });
        const frameCall = vi.fn(async () => {
            throw { code: 'ACCESS_DENIED', message: 'Access denied' };
        });
        enterFrame(api, frameCall);
        const server = transport({
            call: vi.fn(async () => ({ result: { ID: '1' } })),
        });
        api.serverMode.connect(server);

        await expect(api.call('crm.company.update', { id: 1 })).resolves.toEqual(
            { ID: '1' },
        );
        await api.call('crm.deal.get', { id: 2 });

        expect(frameCall).toHaveBeenCalledTimes(1);
        expect(server.call).toHaveBeenCalledTimes(2);
        expect(server.call).toHaveBeenLastCalledWith('crm.deal.get', { id: 2 });
    });

    it('другая ошибка фрейма — пробрасывается, режим не включается', async () => {
        const api = new BitrixBaseApi({ sendMessageAdminError: async () => {} });
        enterFrame(api, async () => {
            throw { code: 'NOT_FOUND', message: 'Not found' };
        });
        api.serverMode.connect(transport());

        await expect(api.call('crm.deal.get', { id: 1 })).rejects.toEqual({
            code: 'NOT_FOUND',
            message: 'Not found',
        });
        expect(api.serverMode.isActive).toBe(false);
    });
});

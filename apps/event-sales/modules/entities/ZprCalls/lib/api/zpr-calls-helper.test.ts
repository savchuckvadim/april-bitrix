import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZprCallsHelper } from './zpr-calls-helper';

/**
 * fetchItems обязан переживать мёртвую группу (удалённый элемент / чужой
 * entityTypeId): живые группы отдаются, отвергнутая — только console.warn.
 */

const listMock = vi.hoisted(() => vi.fn());

vi.mock('@workspace/bitrix', () => ({
    Bitrix: {
        getService: () => ({ item: { list: listMock } }),
    },
}));

afterEach(() => {
    listMock.mockReset();
    vi.restoreAllMocks();
});

describe('ZprCallsHelper.fetchItems', () => {
    it('одна отвергнутая группа не роняет запрос: живые элементы отдаются', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        listMock.mockImplementation(async (entityTypeId: string) => {
            if (entityTypeId === '1038') {
                return { items: [{ id: 501, title: 'ЗПР звонок' }] };
            }
            throw new Error('Access denied');
        });

        const helper = new ZprCallsHelper();
        const calls = await helper.fetchItems([
            { entityTypeId: 1038, elementId: 501 },
            { entityTypeId: 77, elementId: 9 },
        ]);

        expect(calls).toHaveLength(1);
        expect(calls[0]).toMatchObject({
            id: 501,
            entityTypeId: 1038,
            title: 'ЗПР звонок',
        });
        expect(warn).toHaveBeenCalledOnce();
        // В warn уходит именно упавший тип — иначе по логу не найти мёртвый ref.
        expect(warn.mock.calls[0]).toContain(77);
    });

    it('все группы живы — поведение прежнее, warn не зовётся', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        listMock.mockResolvedValue({ items: [{ id: 7 }] });

        const helper = new ZprCallsHelper();
        const calls = await helper.fetchItems([
            { entityTypeId: 1038, elementId: 7 },
        ]);

        expect(calls).toHaveLength(1);
        expect(warn).not.toHaveBeenCalled();
    });
});

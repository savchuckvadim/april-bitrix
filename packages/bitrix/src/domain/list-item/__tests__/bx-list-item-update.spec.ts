/**
 * lists.element.update (заход А4): сервис и batch-сервис подставляют
 * IBLOCK_TYPE_ID='lists' сами (как get/add), payload не искажается.
 */
import { describe, expect, it } from 'vitest';
import { BxListItemService } from '../services/bx-list-item.service';
import { BxListItemBatchService } from '../services/bx-list-item.batch.service';
import { createFakeBxApi } from '../../__tests__/fake-bx-api';

const createServices = (callResponse?: unknown) => {
    const fake = createFakeBxApi(callResponse);
    const service = new BxListItemService();
    service.init(fake.api);
    const batch = new BxListItemBatchService();
    batch.init(fake.api);
    return { ...fake, service, batch };
};

describe('BxListItemService.update', () => {
    it('шлёт lists.element.update, дописывая IBLOCK_TYPE_ID', async () => {
        const { service, calls } = createServices({ result: true });
        await service.update({
            IBLOCK_ID: 77,
            ELEMENT_ID: 5,
            FIELDS: { NAME: 'Продажа' },
        });
        expect(calls).toEqual([
            {
                kind: 'call',
                namespace: 'lists',
                entity: 'element',
                method: 'update',
                data: {
                    IBLOCK_TYPE_ID: 'lists',
                    IBLOCK_ID: 77,
                    ELEMENT_ID: 5,
                    FIELDS: { NAME: 'Продажа' },
                },
            },
        ]);
    });
});

describe('BxListItemBatchService.update', () => {
    it('копит lists.element.update под своим cmd-ключом (адресация ELEMENT_CODE)', () => {
        const { batch, calls } = createServices();
        batch.update('upd_list_item_kpi_x', {
            IBLOCK_ID: '77',
            ELEMENT_CODE: 'ev_success_7',
            FIELDS: { NAME: 'Продажа', PROPERTY_951: ['1269'] },
        });
        expect(calls).toEqual([
            {
                kind: 'batch',
                cmd: 'upd_list_item_kpi_x',
                namespace: 'lists',
                entity: 'element',
                method: 'update',
                data: {
                    IBLOCK_TYPE_ID: 'lists',
                    IBLOCK_ID: '77',
                    ELEMENT_CODE: 'ev_success_7',
                    FIELDS: { NAME: 'Продажа', PROPERTY_951: ['1269'] },
                },
            },
        ]);
    });

    it('существующие методы не сломаны: add по-прежнему дописывает IBLOCK_TYPE_ID', () => {
        const { batch, calls } = createServices();
        batch.add('add_list_item', {
            IBLOCK_ID: '77',
            ELEMENT_CODE: 'x',
            FIELDS: { NAME: 'Продажа' },
        });
        expect(calls[0]).toMatchObject({
            kind: 'batch',
            cmd: 'add_list_item',
            method: 'add',
            data: { IBLOCK_TYPE_ID: 'lists', IBLOCK_ID: '77' },
        });
    });
});

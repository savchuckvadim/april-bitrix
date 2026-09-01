/**
 * Саб-домен checklist-item (заход А4): add и getList семейства
 * task.checklistitem.* — маршрутизация репозитория через call и batch.
 */
import { describe, expect, it } from 'vitest';
import { BxChecklistItemService } from '../services/bx-checklist-item.service';
import { BxChecklistItemBatchService } from '../services/bx-checklist-item.batch.service';
import { createFakeBxApi } from '../../../__tests__/fake-bx-api';

const createServices = (callResponse?: unknown) => {
    const fake = createFakeBxApi(callResponse);
    const service = new BxChecklistItemService();
    service.init(fake.api);
    const batch = new BxChecklistItemBatchService();
    batch.init(fake.api);
    return { ...fake, service, batch };
};

describe('BxChecklistItemService', () => {
    it('add шлёт task.checklistitem.add c { TASKID, FIELDS }', async () => {
        const { service, calls } = createServices();
        const data = {
            TASKID: 13,
            FIELDS: { TITLE: 'Подготовить отчёт', SORT_INDEX: 200 },
        };
        await service.add(data);
        expect(calls).toEqual([
            {
                kind: 'call',
                namespace: 'task',
                entity: 'checklistitem',
                method: 'add',
                data,
            },
        ]);
    });

    it('getList шлёт task.checklistitem.getlist и отдаёт конверт callType', async () => {
        const items = [
            {
                ID: '431',
                TITLE: 'Чек-лист 1',
                IS_COMPLETE: 'N',
                SORT_INDEX: '0',
            },
        ];
        const { service, calls } = createServices({ result: items });
        const response = await service.getList({
            TASKID: 13,
            ORDER: { SORT_INDEX: 'asc' },
        });
        expect(calls).toEqual([
            {
                kind: 'call',
                namespace: 'task',
                entity: 'checklistitem',
                method: 'getlist',
                data: { TASKID: 13, ORDER: { SORT_INDEX: 'asc' } },
            },
        ]);
        expect(response).toEqual({ result: items });
    });
});

describe('BxChecklistItemBatchService', () => {
    it('add копит команду под своим cmd-ключом; TASKID может быть $result-ссылкой', () => {
        const { batch, calls } = createServices();
        batch.add('add_task_checklist_0', {
            TASKID: '$result[add_task][task][id]',
            FIELDS: { TITLE: 'Пункт', PARENT_ID: 0 },
        });
        expect(calls).toEqual([
            {
                kind: 'batch',
                cmd: 'add_task_checklist_0',
                namespace: 'task',
                entity: 'checklistitem',
                method: 'add',
                data: {
                    TASKID: '$result[add_task][task][id]',
                    FIELDS: { TITLE: 'Пункт', PARENT_ID: 0 },
                },
            },
        ]);
    });

    it('getList копит task.checklistitem.getlist', () => {
        const { batch, calls } = createServices();
        batch.getList('get_checklist_13', { TASKID: 13 });
        expect(calls).toEqual([
            {
                kind: 'batch',
                cmd: 'get_checklist_13',
                namespace: 'task',
                entity: 'checklistitem',
                method: 'getlist',
                data: { TASKID: 13 },
            },
        ]);
    });
});

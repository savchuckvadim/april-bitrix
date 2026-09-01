/**
 * Новые методы задач (заход А4): add / complete / commentAdd /
 * commentGetList. Сверяется маршрутизация репозитория — строковые значения
 * (namespace, entity, method) и форма payload'а; сборку строки метода
 * проверяет спек живого base-api.
 */
import { describe, expect, it } from 'vitest';
import { BxTasksService } from '../bx-tasks.service';
import { BxTasksBatchService } from '../bx-tasks.batch.service';
import { createFakeBxApi } from '../../__tests__/fake-bx-api';

const createServices = (callResponse?: unknown) => {
    const fake = createFakeBxApi(callResponse);
    const service = new BxTasksService();
    service.init(fake.api);
    const batch = new BxTasksBatchService();
    batch.init(fake.api);
    return { ...fake, service, batch };
};

describe('BxTasksService: новые call-методы', () => {
    it('add шлёт tasks.task.add c { fields }', async () => {
        const { service, calls } = createServices();
        const fields = {
            TITLE: 'Позвонить после события',
            RESPONSIBLE_ID: 7,
            DEADLINE: '2026-09-01T10:00:00',
            UF_CRM_TASK: ['CO_5'],
        };
        await service.add(fields);
        expect(calls).toEqual([
            {
                kind: 'call',
                namespace: 'tasks',
                entity: 'task',
                method: 'add',
                data: { fields },
            },
        ]);
    });

    it('complete шлёт tasks.task.complete c { taskId }', async () => {
        const { service, calls } = createServices();
        await service.complete(11);
        expect(calls).toEqual([
            {
                kind: 'call',
                namespace: 'tasks',
                entity: 'task',
                method: 'complete',
                data: { taskId: 11 },
            },
        ]);
    });

    it('commentGetList шлёт task.commentitem.getlist (неймспейс task) и отдаёт конверт callType', async () => {
        const comments = [
            { ID: '1', AUTHOR_ID: '7', POST_MESSAGE: '[evflow:op-1]' },
        ];
        const { service, calls } = createServices({ result: comments });
        const response = await service.commentGetList({
            TASKID: 11,
            ORDER: { POST_DATE: 'asc' },
        });
        expect(calls).toEqual([
            {
                kind: 'call',
                namespace: 'task',
                entity: 'commentitem',
                method: 'getlist',
                data: { TASKID: 11, ORDER: { POST_DATE: 'asc' } },
            },
        ]);
        // маркер-проверка читает response.result как на бэке
        expect(response).toEqual({ result: comments });
    });
});

describe('BxTasksBatchService: новые batch-методы', () => {
    it('add копит tasks.task.add под своим cmd-ключом', () => {
        const { batch, calls } = createServices();
        const fields = { TITLE: 'Звонок', RESPONSIBLE_ID: 1 };
        batch.add('add_task', fields);
        expect(calls).toEqual([
            {
                kind: 'batch',
                cmd: 'add_task',
                namespace: 'tasks',
                entity: 'task',
                method: 'add',
                data: { fields },
            },
        ]);
    });

    it('complete копит tasks.task.complete c { taskId }', () => {
        const { batch, calls } = createServices();
        batch.complete('complete_task_11', 11);
        expect(calls).toEqual([
            {
                kind: 'batch',
                cmd: 'complete_task_11',
                namespace: 'tasks',
                entity: 'task',
                method: 'complete',
                data: { taskId: 11 },
            },
        ]);
    });

    it('commentAdd копит task.commentitem.add c { TASKID, FIELDS }', () => {
        const { batch, calls } = createServices();
        const fields = { AUTHOR_ID: 7, POST_MESSAGE: '[evflow:op-1] итог' };
        batch.commentAdd('comment_task_11', 11, fields);
        expect(calls).toEqual([
            {
                kind: 'batch',
                cmd: 'comment_task_11',
                namespace: 'task',
                entity: 'commentitem',
                method: 'add',
                data: { TASKID: 11, FIELDS: fields },
            },
        ]);
    });

    it('taskId в batch-методах может быть $result-ссылкой (строкой)', () => {
        const { batch, calls } = createServices();
        batch.commentAdd('comment_new_task', '$result[add_task][task][id]', {
            AUTHOR_ID: 1,
            POST_MESSAGE: 'к новой задаче',
        });
        expect(calls[0]?.data).toMatchObject({
            TASKID: '$result[add_task][task][id]',
        });
    });

    it('существующие методы не сломаны: update копит tasks.task.update', () => {
        const { batch, calls } = createServices();
        batch.update('update_task_11', 11, { TITLE: 'перенос' });
        expect(calls).toEqual([
            {
                kind: 'batch',
                cmd: 'update_task_11',
                namespace: 'tasks',
                entity: 'task',
                method: 'update',
                data: { taskId: 11, fields: { TITLE: 'перенос' } },
            },
        ]);
    });
});

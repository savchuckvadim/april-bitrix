/**
 * Живой BitrixBaseApi: сборка имени REST-метода из (namespace, entity,
 * method) в addCmdBatchType — ровно те строки, что уйдут в cmd батча.
 * Особенно важно для методов А4: неймспейс `task` (единственное число,
 * task.checklistitem.* / task.commentitem.*) против `tasks.task.*`,
 * `im.notify.system.add` и правило WITHOUT_NAMESPACE (`user.get`).
 * Имена сверены с apidocs через b24-dev-mcp.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { BitrixBaseApi } from '../bitrix-base-api';
import { EBxMethod, EBxNamespace } from '../../domain/consts/bitrix-api.enum';
import { EBXEntity } from '../../domain/consts/bitrix-entities.enum';

const createApi = () =>
    new BitrixBaseApi({ sendMessageAdminError: async () => {} });

describe('BitrixBaseApi.addCmdBatchType: имена REST-методов', () => {
    let api: BitrixBaseApi;

    beforeEach(() => {
        api = createApi();
    });

    const methodOf = (cmd: string) =>
        (api.getCmdBatch()[cmd] as unknown as { method: string } | undefined)
            ?.method;

    it('tasks.task.add / tasks.task.complete (неймспейс tasks)', () => {
        api.addCmdBatchType(
            'add_task',
            EBxNamespace.TASKS,
            EBXEntity.TASK,
            EBxMethod.ADD,
            { fields: { TITLE: 'Звонок', RESPONSIBLE_ID: 1 } },
        );
        api.addCmdBatchType(
            'complete_task_11',
            EBxNamespace.TASKS,
            EBXEntity.TASK,
            EBxMethod.COMPLETE,
            { taskId: 11 },
        );
        expect(methodOf('add_task')).toBe('tasks.task.add');
        expect(methodOf('complete_task_11')).toBe('tasks.task.complete');
    });

    it('task.commentitem.add и task.checklistitem.* (неймспейс task, единственное число)', () => {
        api.addCmdBatchType(
            'comment_task_11',
            EBxNamespace.TASK,
            EBXEntity.COMMENT_ITEM,
            EBxMethod.ADD,
            {
                TASKID: 11,
                FIELDS: { AUTHOR_ID: 1, POST_MESSAGE: '[evflow:x]' },
            },
        );
        api.addCmdBatchType(
            'add_checklist_item',
            EBxNamespace.TASK,
            EBXEntity.CHECKLIST_ITEM,
            EBxMethod.ADD,
            { TASKID: 11, FIELDS: { TITLE: 'Пункт' } },
        );
        api.addCmdBatchType(
            'get_checklist',
            EBxNamespace.TASK,
            EBXEntity.CHECKLIST_ITEM,
            EBxMethod.GET_LIST,
            { TASKID: 11 },
        );
        expect(methodOf('comment_task_11')).toBe('task.commentitem.add');
        expect(methodOf('add_checklist_item')).toBe('task.checklistitem.add');
        expect(methodOf('get_checklist')).toBe('task.checklistitem.getlist');
    });

    it('lists.element.update и im.notify.system.add', () => {
        api.addCmdBatchType(
            'upd_list_item',
            EBxNamespace.LISTS,
            EBXEntity.ELEMENT,
            EBxMethod.UPDATE,
            {
                IBLOCK_TYPE_ID: 'lists',
                IBLOCK_ID: 77,
                ELEMENT_ID: 5,
                FIELDS: { NAME: 'Продажа' },
            },
        );
        api.addCmdBatchType(
            'notify_transfer',
            EBxNamespace.IM,
            EBXEntity.NOTIFY_SYSTEM,
            EBxMethod.ADD,
            { USER_ID: 1, MESSAGE: 'Звонок перенесён' },
        );
        expect(methodOf('upd_list_item')).toBe('lists.element.update');
        expect(methodOf('notify_transfer')).toBe('im.notify.system.add');
    });

    it('WITHOUT_NAMESPACE срезает префикс: user.get', () => {
        api.addCmdBatchType(
            'get_user',
            EBxNamespace.WITHOUT_NAMESPACE,
            EBXEntity.USER,
            EBxMethod.GET,
            { filter: { ID: [1] } },
        );
        expect(methodOf('get_user')).toBe('user.get');
    });

    it('params ложатся как есть, повторный cmd-ключ не перетирается', () => {
        const fields = { TITLE: 'Звонок', RESPONSIBLE_ID: 7 };
        api.addCmdBatchType(
            'add_task',
            EBxNamespace.TASKS,
            EBXEntity.TASK,
            EBxMethod.ADD,
            { fields },
        );
        api.addCmdBatchType(
            'add_task',
            EBxNamespace.TASKS,
            EBXEntity.TASK,
            EBxMethod.COMPLETE,
            { taskId: 999 },
        );
        const entry = api.getCmdBatch()['add_task'] as unknown as {
            method: string;
            params: unknown;
        };
        expect(entry.method).toBe('tasks.task.add');
        expect(entry.params).toEqual({ fields });
    });
});

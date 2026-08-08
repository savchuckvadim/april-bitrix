import { EBxMethod } from '../../core/domain/consts/bitrix-api.enum';
import { IBXTask } from '../interfaces/bitrix.interface';
import { CrmListRequestType } from '../crm/type/crm-request.type';
import { BXTaskRequestFields } from './bx-tasks.interface';

export type TasksSchema = {
    [EBxMethod.GET]: {
        // Реальный контракт tasks.task.get: { taskId, select } → { task }
        // (back-эталон task.schema.ts; прежняя форма { id } → IBXTask была
        // неверной и заставляла потребителей писать `taskData?.task ?? taskData`).
        request: { taskId: number | string; select?: string[] };
        response: { task: IBXTask };
    };
    [EBxMethod.LIST]: {
        request: CrmListRequestType<BXTaskRequestFields>;
        response: { tasks: IBXTask[] };
    };
    [EBxMethod.UPDATE]: {
        request: {
            taskId: number | string;
            fields: Partial<IBXTask>;
        };
        response: { tasks: IBXTask[] };
    };
    [EBxMethod.DELETE]: {
        request: { id: number | string };
        response: { taskId: number };
    };
};

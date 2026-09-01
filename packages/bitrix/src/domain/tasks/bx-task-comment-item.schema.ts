import { EBxMethod } from '../../core/domain/consts/bitrix-api.enum';
import {
    IBXTaskComment,
    ITaskCommentAddFields,
    ITaskCommentGetListRequest,
} from './bx-tasks.interface';

/**
 * `task.commentitem.*` — комментарии задач (REST-неймспейс `task`,
 * единственное число, в отличие от `tasks.task.*`). Имена и параметры
 * сверены по apidocs через b24-dev-mcp:
 *  - task.commentitem.add: { TASKID, FIELDS } → id комментария (number);
 *  - task.commentitem.getlist: { TASKID, ORDER?, FILTER? } → массив
 *    комментариев (payload БЕЗ обёртки { result } — её оборачивает
 *    callType сам, как во всех crm-схемах).
 * Методы задекларированы по фактической потребности event-sales-flow
 * (маркер анти-двойного исполнения [evflow:{operationId}]).
 */
export type TaskCommentItemSchema = {
    [EBxMethod.ADD]: {
        request: {
            TASKID: number | string;
            FIELDS: ITaskCommentAddFields;
        };
        response: number;
    };
    [EBxMethod.GET_LIST]: {
        request: ITaskCommentGetListRequest;
        response: IBXTaskComment[];
    };
};

import { EVENT_COMMENT_UF_FIELD } from './event-comment';

/**
 * Единый select задач обзвона для tasks.task.get / tasks.task.list.
 *
 * Раньше это были ДВА одноимённых списка (EventTaskThunk и placement-util),
 * и они разошлись: в placement-util потерялся DESCRIPTION — во встройке
 * карточки задачи описание дела молча не показывалось. Один общий список
 * такую рассинхронизацию исключает.
 */
export const EVENT_TASK_SELECT = [
    'ID', 'UF_CRM_TASK', 'TITLE', 'DESCRIPTION', 'DATE_START', 'CREATED_DATE',
    'CHANGED_DATE', 'CLOSED_DATE', 'DEADLINE', 'PRIORITY', 'MARK', 'GROUP_ID',
    'CREATED_BY', 'STATUS_CHANGED_BY', 'REAL_STATUS', 'STATUS', 'STAGE_ID',
    'RESPONSIBLE_ID', EVENT_COMMENT_UF_FIELD,
];

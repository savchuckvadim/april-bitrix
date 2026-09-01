export interface BXTaskRequest {
    // select:BXTaskRequestFields
    filter: BXTaskRequestFields;
}

export interface BXTaskRequestFields {
    [key: string]: string | number | string[] | undefined;
    ID?: number | string;
    PARENT_ID?: number | string;
    GROUP_ID?: number | string;
    CREATED_BY?: number | string;
    STATUS_CHANGED_BY?: number | string;
    PRIORITY?: number | string;
    FORUM_TOPIC_ID?: number | string;
    RESPONSIBLE_ID?: number | string;
    TITLE?: number | string;
    TAG?: number | string;
    REAL_STATUS?: number | string;
    UF_CRM_TASK?: string[];
}

/**
 * Поля создания задачи (`tasks.task.add`, параметр `fields`) — зеркало
 * back/libs/bitrix IBXTaskCreateFields по составу; индекс-подпись держит
 * UF-поля портала (UF_TASK_EVENT_COMMENT и прочие).
 */
export interface IBXTaskCreateFields {
    TITLE: string;
    RESPONSIBLE_ID: number | string;
    CREATED_BY?: number | string;
    GROUP_ID?: number | string;
    DEADLINE?: string;
    DESCRIPTION?: string;
    PRIORITY?: number | string;
    PARENT_ID?: number | string;
    UF_CRM_TASK?: string[];
    ALLOW_CHANGE_DEADLINE?: 'Y' | 'N';
    ALLOW_TIME_TRACKING?: 'Y' | 'N';
    TASK_CONTROL?: 'Y' | 'N';
    MATCH_WORK_TIME?: 'Y' | 'N';
    DATE_START?: string;
    START_DATE_PLAN?: string;
    END_DATE_PLAN?: string;
    STATUS?: number | string;
    [key: string]: unknown;
}

/** Поля комментария задачи (`task.commentitem.add`, параметр `FIELDS`). */
export interface ITaskCommentAddFields {
    AUTHOR_ID: number | string;
    POST_MESSAGE: string;
    /** Дата сообщения (ISO); без неё Битрикс ставит «сейчас». */
    POST_DATE?: string;
}

/**
 * Комментарий задачи, как его отдаёт `task.commentitem.getlist`
 * (маркер-проверка `[evflow:{operationId}]` читает POST_MESSAGE).
 */
export interface IBXTaskComment {
    ID: string;
    AUTHOR_ID: string;
    AUTHOR_NAME?: string;
    AUTHOR_EMAIL?: string;
    POST_DATE?: string | null;
    POST_MESSAGE: string;
    POST_MESSAGE_HTML?: string | null;
    ATTACHED_OBJECTS?: Record<string, unknown>;
    [key: string]: unknown;
}

/** Поля сортировки/фильтра `task.commentitem.getlist` (по докам apidocs). */
export type BXTaskCommentOrderField =
    | 'ID'
    | 'AUTHOR_ID'
    | 'AUTHOR_NAME'
    | 'AUTHOR_EMAIL'
    | 'POST_DATE';

export interface ITaskCommentGetListRequest {
    TASKID: number | string;
    /** По умолчанию Битрикс отдаёт по убыванию ID. */
    ORDER?: Partial<Record<BXTaskCommentOrderField, 'asc' | 'desc'>>;
    /** Ключи с префиксами сравнения (`>=POST_DATE` и т.п.). */
    FILTER?: Record<string, string | number | Array<string | number>>;
    /** Страница выдачи: метод отдаёт максимум 50 записей за вызов. */
    start?: number;
}

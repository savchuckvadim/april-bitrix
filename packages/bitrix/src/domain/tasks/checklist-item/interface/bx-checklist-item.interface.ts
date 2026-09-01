/**
 * `task.checklistitem.*` — пункты чек-листов задач. Зеркало
 * back/libs/bitrix/src/domain/tasks/checklist-item (формы сверены и по
 * apidocs через b24-dev-mcp: add — { TASKID, FIELDS } → id пункта,
 * getlist — { TASKID, ORDER? } → массив пунктов).
 */

/**
 * Участник пункта чек-листа (`FIELDS[MEMBERS]`): ключ — id пользователя,
 * `TYPE` — роль. Битрикс добавляет участника пункта в саму задачу в той же
 * роли, поэтому поле трогаем осознанно.
 */
export const EBXChecklistMemberType = {
    /** Соисполнитель. */
    ACCOMPLICE: 'A',
    /** Наблюдатель. */
    AUDITOR: 'U',
} as const;

export type BXChecklistMemberType =
    (typeof EBXChecklistMemberType)[keyof typeof EBXChecklistMemberType];

export type IBXChecklistItemMembers = Record<
    string | number,
    { TYPE: BXChecklistMemberType }
>;

export interface IBXChecklistItemFields {
    TITLE: string;
    IS_COMPLETE?: 'Y' | 'N';
    /** Чем меньше — тем выше пункт в списке. */
    SORT_INDEX?: number;
    COMPLETED_BY?: number | string;
    /** Пункт важный (жирная отметка в карточке задачи). */
    IS_IMPORTANT?: 'Y' | 'N';
    /**
     * Родительский пункт. `0` — создать НОВЫЙ чек-лист (пункт становится его
     * названием); не передавать — пункт уедет в верхний чек-лист задачи
     * (а если его нет — Битрикс создаст).
     */
    PARENT_ID?: number | string;
    MEMBERS?: IBXChecklistItemMembers;
}

export interface IBXChecklistItemAddRequest {
    TASKID: number | string;
    FIELDS: IBXChecklistItemFields;
}

export interface IBXChecklistItem {
    ID: string;
    TITLE: string;
    IS_COMPLETE: 'Y' | 'N';
    SORT_INDEX: string;
    TASK_ID?: string;
    /** `0` (или отсутствие) — сам чек-лист, иначе id родительского пункта. */
    PARENT_ID?: string | number;
    CREATED_BY?: string;
    IS_IMPORTANT?: 'Y' | 'N';
    /** Кто последним переключил галку; null — пункт не трогали. */
    TOGGLED_BY?: string | null;
    /** Когда переключили (ISO); '' либо null — не трогали. */
    TOGGLED_DATE?: string | null;
    [key: string]: unknown;
}

/** Поля, по которым `task.checklistitem.getlist` умеет сортировать. */
export type BXChecklistItemOrderField =
    | 'ID'
    | 'PARENT_ID'
    | 'CREATED_BY'
    | 'TITLE'
    | 'SORT_INDEX'
    | 'IS_COMPLETE'
    | 'IS_IMPORTANT'
    | 'TOGGLED_BY'
    | 'TOGGLED_DATE';

export interface IBXChecklistItemGetListRequest {
    TASKID: number | string;
    /**
     * Сортировка `{ поле: 'asc' | 'desc' }`. По умолчанию Битрикс отдаёт
     * по `ID` убыванием — для читаемого чек-листа сортируем по `SORT_INDEX`.
     */
    ORDER?: Partial<Record<BXChecklistItemOrderField, 'asc' | 'desc'>>;
    /** Страница выдачи: метод отдаёт максимум 50 пунктов за вызов. */
    start?: number;
}

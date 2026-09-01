export enum EBxNamespace {
    CRM = 'crm',
    TASKS = 'tasks',
    /**
     * Семейства `task.*` (единственное число): `task.checklistitem.*`,
     * `task.commentitem.*` — исторический REST-неймспейс, отличный от
     * `tasks.task.*` (зеркало back/libs/bitrix EBxNamespace.TASK).
     */
    TASK = 'task',
    LISTS = 'lists',
    CRM_ITEM = 'crm.item',
    WITHOUT_NAMESPACE = 'without.namespace',
    DISK = 'disk',
    CATALOG = 'catalog',
    RPA = 'rpa',
    /** Уведомления и чаты: `im.notify.system.add` и родня. */
    IM = 'im',
}

export enum EBxMethod {
    ADD = 'add',
    SET = 'set',
    UPDATE = 'update',
    GET = 'get',
    USER_FIELD_LIST = 'userfield.list',
    USER_FIELD_GET = 'userfield.get',
    USER_FIELD_ADD = 'userfield.add',
    LIST = 'list',
    DELETE = 'delete',
    CONTACT_ITEMS_SET = 'contact.items.set',
    CONTACT_ADD = 'contact.add',
    CONTACT_ITEMS_GET = 'contact.items.get',
    CONTACT_ITEMS_DELETE = 'contact.items.delete',
    FIELD_GET = 'field.get',
    FIELDS = 'fields',
    GET_BY_ENTITY_TYPE_ID = 'getByEntityTypeId',
    USER_FIELD_UPDATE = 'userfield.update',
    USER_FIELD_DELETE = 'userfield.delete',
    /** `tasks.task.complete` — перевод задачи в «Завершена». */
    COMPLETE = 'complete',
    /** `task.checklistitem.getlist` / `task.commentitem.getlist`. */
    GET_LIST = 'getlist',
}

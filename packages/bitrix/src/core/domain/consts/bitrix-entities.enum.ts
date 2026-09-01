export enum EBXEntity {
    DEAL = 'deal',
    COMPANY = 'company',
    CONTACT = 'contact',
    LEAD = 'lead',
    TASK = 'task',
    ITEM = 'item',
    TYPE = 'type',
    TIMELINE_COMMENT = 'timeline.comment',
    PRODUCT_ROW = 'productrow',
    USER = 'user',
    USER_FIELD = 'userfield',
    USER_FIELD_CONFIG = 'userfieldconfig',
    USER_FIELD_ENUMERATION = 'userfield.enumeration',
    LISTS = 'lists',
    /** Элемент универсального списка: lists.element.* */
    ELEMENT = 'element',
    /** Пункт чек-листа задачи: task.checklistitem.* */
    CHECKLIST_ITEM = 'checklistitem',
    /** Комментарий задачи: task.commentitem.* */
    COMMENT_ITEM = 'commentitem',
    /** Системные уведомления: im.notify.system.* */
    NOTIFY_SYSTEM = 'notify.system',
    ACTIVITY = 'activity',
    ACTIVITY_CONFIGURABLE = 'activity.configurable',
    FILE = 'file',
    CATEGORY = 'category',
    STATUS = 'status',
    PRODUCT = 'product',
    RPA = 'rpa',
}

/**
 * Подсветка «прикреплено к делу» для иконок панели пульта.
 *
 * Мягкая заливка тоном текущего события плюс кольцо: иконка читается как
 * зажжённая, но не спорит с кнопками действий. Класс один на обе иконки —
 * заявку и контакт, иначе они начали бы светиться по-разному.
 */
export const TOOL_LINKED_CLASS =
    'bg-event-current/15 text-event-current ring-1 ring-event-current/40 hover:bg-event-current/25 hover:text-event-current';

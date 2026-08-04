/**
 * Выбор представления списка дел. Пока дел мало — карточки: в них помещается
 * саммари и контекст, и менеджеру не надо открывать каждое дело. Когда дел
 * много, карточки перестают помещаться на экран — переключаемся на таблицу.
 */
export type EventListView = 'cards' | 'table';

/** Карточками показываем, пока дел строго меньше этого числа. */
export const CARD_VIEW_TASKS_THRESHOLD = 3;

export const getEventListView = (tasksCount: number): EventListView =>
    tasksCount < CARD_VIEW_TASKS_THRESHOLD ? 'cards' : 'table';

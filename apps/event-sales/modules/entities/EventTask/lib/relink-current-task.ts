import type { EventTask } from '../types/event-task-type';

/**
 * Свежий объект «текущей» задачи после перезагрузки списка.
 *
 * setFetchedTasks заменяет `tasks` целиком, но `current` продолжает указывать
 * на объект ПРОШЛОЙ загрузки: после reload открытое дело показывало данные
 * задачи до обновления (срок, привязки, чек-лист). Возвращает одноимённую по
 * id задачу из свежего списка, когда перепривязка нужна, и null — когда нет:
 * текущей задачи не было (обычный бут списка), список пуст, задача из списка
 * пропала (закрыли в другом окне — оставляем как есть, форму не выдёргиваем)
 * или current уже и есть свежий объект.
 */
export const resolveCurrentTaskRelink = (
    current: EventTask | null,
    tasks: EventTask[] | null,
): EventTask | null => {
    if (!current?.id || !tasks?.length) return null;
    const fresh = tasks.find(task => Number(task.id) === Number(current.id));
    if (!fresh || fresh === current) return null;
    return fresh;
};

/**
 * Источник контакта/лида открытого дела после перезагрузки списка.
 *
 * Отличается от перепривязки: даже когда свежей задачи в списке НЕТ
 * (закрыли в другом окне — current намеренно остаётся прежним объектом),
 * контакт и лид восстанавливать всё равно нужно. Reload уже сбросил
 * контактный и лидовый слайсы, и без восстановления открытая карточка
 * оставалась без контакта и лида. Свежая задача главнее (актуальные
 * привязки), иначе — прежняя current; текущей задачи нет — восстанавливать
 * нечего (обычный бут списка).
 */
export const resolveCurrentTaskSource = (
    current: EventTask | null,
    tasks: EventTask[] | null,
): EventTask | null => {
    if (!current?.id) return null;
    return (
        tasks?.find(task => Number(task.id) === Number(current.id)) ?? current
    );
};

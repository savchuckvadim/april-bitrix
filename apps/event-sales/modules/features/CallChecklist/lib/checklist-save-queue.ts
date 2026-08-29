/**
 * Отложенная запись ответов чек-листа — таймеры по ключу ответа.
 *
 * Зачем: запись шла на КАЖДЫЙ onChange. `<input type="date">` при
 * незавершённом вводе отдаёт пустую строку — и в портал улетала пустота,
 * затирая стоявшую дату; а серия правок превращалась в серию update-запросов.
 *
 * Ключ — «набор:вопрос», а не код поля: одно и то же поле спрашивается в
 * разных наборах, и общий таймер отменял бы чужую отложенную запись —
 * ответ на второй вопрос молча съедал бы первый.
 *
 * Таймеры живут вне стора (они не сериализуются) и вне компонент: карточка
 * чек-листа монтируется дважды (колонка плана и окно предпроверки), и
 * привязка таймера к жизни компоненты рубила бы чужую запись. Отменяет их
 * смена сущности — `callChecklist/reset` (см. start-store-listeners).
 */

/** Пауза после последнего изменения поля. */
export const CHECKLIST_SAVE_DEBOUNCE_MS = 600;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** Отложить запись ответа, отменив прежнюю отложенную запись того же ключа. */
export const scheduleChecklistSave = (
    key: string,
    run: () => void,
    delay: number = CHECKLIST_SAVE_DEBOUNCE_MS,
): void => {
    cancelChecklistSave(key);
    timers.set(
        key,
        setTimeout(() => {
            timers.delete(key);
            run();
        }, delay),
    );
};

/** Отменить отложенную запись (правка продолжается или её отменили). */
export const cancelChecklistSave = (key: string): void => {
    const timer = timers.get(key);
    if (timer === undefined) return;
    clearTimeout(timer);
    timers.delete(key);
};

/** Отменить всё отложенное: смена сущности, reload, очистка после отправки. */
export const cancelAllChecklistSaves = (): void => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
};

/** Есть ли отложенная запись по ключу (для тестов и диагностики). */
export const hasPendingChecklistSave = (key: string): boolean =>
    timers.has(key);

/**
 * Отложенная запись полей чек-листа — таймеры по коду поля.
 *
 * Зачем: запись шла на КАЖДЫЙ onChange. `<input type="date">` при
 * незавершённом вводе отдаёт пустую строку — и в портал улетала пустота,
 * затирая стоявшую дату; а серия правок превращалась в серию update-запросов.
 *
 * Таймеры живут вне стора (они не сериализуются) и вне компонент: карточка
 * чек-листа монтируется дважды (колонка плана и окно предпроверки), и
 * привязка таймера к жизни компоненты рубила бы чужую запись. Отменяет их
 * смена сущности — `callChecklist/reset` (см. start-store-listeners).
 */

/** Пауза после последнего изменения поля. */
export const CHECKLIST_SAVE_DEBOUNCE_MS = 600;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** Отложить запись поля, отменив прежнюю отложенную запись того же кода. */
export const scheduleChecklistSave = (
    code: string,
    run: () => void,
    delay: number = CHECKLIST_SAVE_DEBOUNCE_MS,
): void => {
    cancelChecklistSave(code);
    timers.set(
        code,
        setTimeout(() => {
            timers.delete(code);
            run();
        }, delay),
    );
};

/** Отменить отложенную запись поля (правка продолжается или её отменили). */
export const cancelChecklistSave = (code: string): void => {
    const timer = timers.get(code);
    if (timer === undefined) return;
    clearTimeout(timer);
    timers.delete(code);
};

/** Отменить всё отложенное: смена сущности, reload, очистка после отправки. */
export const cancelAllChecklistSaves = (): void => {
    for (const timer of timers.values()) clearTimeout(timer);
    timers.clear();
};

/** Есть ли отложенная запись по коду (для тестов и диагностики). */
export const hasPendingChecklistSave = (code: string): boolean =>
    timers.has(code);

/**
 * Сигнал «состояние устаканилось» для wait-хелперов инициализации
 * (app-config-wait, questionnaire-wait).
 *
 * Замена поллинга 50мс: ожидающие складывают сюда резолверы, а будит их
 * листенер на settled-экшене (см. start*SettleListener в самих хелперах).
 * Дедлайн остаётся у ожидающего: `wait` резолвится и по сигналу, и по
 * таймауту — «дождались ли» вызывающий решает сам по состоянию стора.
 *
 * Почему не store.subscribe: у потребителей (обычные thunk'и) в руках только
 * getState, самого стора нет, а импорт стора из хелпера замкнул бы цикл
 * store → listeners → thunk'и → wait-хелпер → store.
 */
export interface SettleSignal {
    /** Разбудить всех текущих ожидающих. Без ожидающих — тишина. */
    notify: () => void;
    /** Ждать сигнал, но не дольше `timeoutMs` (сам таймер — не fail-open,
     * fail-open делает вызывающий, перепроверяя состояние). */
    wait: (timeoutMs: number) => Promise<void>;
}

export const createSettleSignal = (): SettleSignal => {
    const waiters = new Set<() => void>();

    return {
        notify: () => {
            // Снимок: резолв может синхронно породить нового ожидающего,
            // и тот должен дождаться СЛЕДУЮЩЕГО сигнала, а не этого.
            const current = [...waiters];
            waiters.clear();
            for (const wake of current) wake();
        },
        wait: timeoutMs =>
            new Promise<void>(resolve => {
                const wake = () => {
                    clearTimeout(timer);
                    waiters.delete(wake);
                    resolve();
                };
                const timer = setTimeout(wake, timeoutMs);
                waiters.add(wake);
            }),
    };
};

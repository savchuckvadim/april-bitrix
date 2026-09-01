import { Bitrix } from '@workspace/bitrix';

/**
 * Общая очередь batch-отправок Битрикса.
 *
 * cmdBatch — ОБЩЕЕ мутируемое поле синглтона BitrixService: два
 * пользователя, наполняющие его одновременно, перемешают команды, а
 * упавший callBatch не очищает поле (очистка стоит после await без
 * finally) — оставшиеся ключи молча блокируют повторное наполнение
 * (addCmdBatchType не перезаписывает существующий ключ).
 *
 * Очередь решает обе беды для ВСЕХ пользователей батча разом (контакты,
 * история; плейсмент идёт до листенеров и вне гонок, но может ходить сюда
 * же): отправки строго по одной, `fill` наполняет синхронно, а при падении
 * отправки добавленные этим fill ключи вычищаются из живой ссылки — снятие
 * «своих» ключей, о которых упавший батч иначе помнил бы вечно.
 */
type BitrixService = ReturnType<typeof Bitrix.getService>;

let sendQueue: Promise<unknown> = Promise.resolve();

/**
 * Занять очередь на время ПРОИЗВОЛЬНОЙ async-работы с батчем — для
 * пользователей, у которых «наполнить и отправить» не одна синхронная
 * функция, а целый прогон с собственными await'ами внутри (прямой
 * исполнитель отчёта: читающий батч → резолв → пишущий батч → flush).
 *
 * Пока такой прогон держит очередь, чужой `runExclusiveBatch` ждёт — без
 * этого читающий батч соседней фичи (история, контакты) успевал бы синхронно
 * наполнить ТОТ ЖЕ cmdBatch и позвать callBatch: чужая отправка унесла бы
 * наши пишущие команды (или наш flush — чужие ключи).
 *
 * Гигиена ключей здесь НЕ делается — она у вызывающего (он один знает, где
 * его прогон начал и кончил наполнение); ошибка звена очередь не убивает.
 */
export const runExclusiveBatchSession = <T>(
    run: () => Promise<T>,
): Promise<T> => {
    const task = sendQueue.then(run);

    sendQueue = task.then(
        () => undefined,
        () => undefined,
    );

    return task;
};

export const runExclusiveBatch = (
    fill: (bitrix: BitrixService) => number,
): Promise<Record<string, unknown>> =>
    runExclusiveBatchSession(async () => {
        const bitrix = Bitrix.getService();
        // Живая ссылка на cmdBatch — для гигиены при падении. Тестовые фейки
        // метода не имеют: тогда гигиена просто выключена, очередь работает.
        const alive =
            typeof bitrix.api.getCmdBatch === 'function'
                ? bitrix.api.getCmdBatch()
                : null;
        const before = new Set(Object.keys(alive ?? {}));
        if (fill(bitrix) <= 0) return {};
        try {
            return (await bitrix.api.callBatch()) as Record<string, unknown>;
        } catch (error) {
            // Свои ключи — те, что появились после fill; чужие stale не трогаем.
            if (alive) {
                for (const key of Object.keys(alive)) {
                    if (!before.has(key)) delete alive[key];
                }
            }
            throw error;
        }
    });

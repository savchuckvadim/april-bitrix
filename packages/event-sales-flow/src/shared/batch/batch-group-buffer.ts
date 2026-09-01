/**
 * Накапливает batch-команды Bitrix группами (одна группа = связанные
 * команды, например одной компании) и шлёт их чанками через порт
 * FlowTransport.
 *
 * Зачем: внутри одного HTTP-batch (≤50 команд) работает $result[cmdKey].
 * Если зависимые команды одной группы попадут в разные чанки 50/50, ссылки
 * на $result[...] сломаются. Этот буфер гарантирует, что вся группа уходит в
 * один HTTP-вызов.
 *
 * Контракт (queue/endGroup/flush/getResults — как у донора):
 *  1. queue(fn) — регистрирует отложенный enqueue (саму команду в
 *     transport.batch.* добавит вызов fn — уже внутри flush, см. ниже).
 *  2. endGroup() — атомарно коммитит текущую группу в очередь буфера;
 *     группа больше CHUNK_LIMIT непомещаема в один чанк — честная ошибка
 *     сразу здесь.
 *  3. flush() — режет очередь на чанки ≤ CHUNK_LIMIT из ЦЕЛЫХ групп и шлёт
 *     каждый одним HTTP-вызовом transport.flush().
 *  4. По завершении: getResults() — сырые ответы чанков в порядке отправки;
 *     getOutcome() — структурированный итог { results, errors }.
 *
 * Размер группы заранее знать не нужно. Жёсткое требование: размер одной
 * группы ≤ CHUNK_LIMIT, иначе её невозможно отправить атомарно.
 *
 * Переработка ColdHook-буфера по плану А2 (донор —
 * back/apps/event-sales/src/cold-hook/services/batch/
 * cold-hook-batch-group-buffer.ts). Отличия от донора:
 *
 *  1. Команды копятся ЗАМЫКАНИЯМИ и материализуются в общий cmdBatch
 *     СИНХРОННО внутри flush() непосредственно перед отправкой — ни одного
 *     await между материализацией и вызовом транспорта. Это единственная
 *     защита общего cmdBatch синглтона (packages/bitrix,
 *     bitrix-base-api.ts) от перемешивания без мьютекса. Донор
 *     материализовал уже в endGroup; в event-report-флоу порядок cmdBatch
 *     от переноса не меняется — там endGroup и flush стоят подряд ПОСЛЕ
 *     всех прямых bitrix.batch.*-команд (use-case, шов batch-seam).
 *  2. transport.flush() в браузере обязан быть callBatch() — НИКОГДА
 *     callBatchByChunk(): тот теряет cmd-ключи и ломает $result. Чанкование
 *     по CHUNK_LIMIT — обязанность буфера, чанк набирается ЦЕЛЫМИ группами.
 *  3. result_error КАЖДОГО чанка разбирается по командам (halt=0 у
 *     Битрикса): ошибки команд НЕ выбрасываются — копятся и отдаются
 *     getOutcome(); что делать с частичным исполнением, решает вызывающий.
 *  4. Гигиена: при падении transport.flush() материализованные ЭТИМ чанком
 *     СВОИ ключи вычищаются из живого cmdBatch, чужие stale-ключи не
 *     трогаются (образец — runExclusiveBatch,
 *     apps/event-sales/modules/app/lib/utills/bitrix-batch-queue.ts).
 *     Упавший чанк НЕ переигрывается — сеть могла успеть доставить запрос,
 *     двойное исполнение опаснее недосыла (риск №1 плана); неотправленные
 *     группы остаются в буфере.
 *
 * Как и у донора, transport.flush() уносит ВЕСЬ накопленный cmdBatch —
 * вместе с командами, которые flow-сервисы положили напрямую в
 * transport.batch.* мимо буфера: они уезжают ПЕРВЫМ чанком и ЗАНИМАЮТ его
 * ёмкость (по getCmdBatch). Бэковый callBatchWithConcurrency дослал бы
 * хвост сверх 50 вторым HTTP-чанком, браузерный callBatch не чанкует —
 * Битрикс молча отбросит лишнее без следа в result_error, поэтому сумма
 * «преднаполненные + чанк» держится ≤ CHUNK_LIMIT; заняли ёмкость одни —
 * уезжают отдельным flush ДО групп буфера. При пустом буфере flush —
 * no-op, прямые команды отправляет вызывающий (контракт бэкового
 * use-case, см. event-report-use-case-batch-seam.spec бэка).
 *
 * Класс не @Injectable — создаётся через new в use-case/handler.
 */
import { AppLogger } from '../lib/logger';

/** Тело ошибки одной команды батча (структурная копия IBitrixBatchError
 * из @workspace/bitrix). */
export interface IBitrixBatchError {
    error: string;
    error_description: string;
}

/** Структурное подмножество ответа одного HTTP-batch Bitrix
 * (оригинал — IBitrixBatchResponseResult из @workspace/bitrix). */
export interface IBitrixBatchResponseResult {
    result: {
        [key: string]: any;
    };
    result_error:
        | {
              [key: string]: IBitrixBatchError;
          }
        | [];
    result_total: {
        [key: string]: any;
    }[];
    result_next: {
        [key: string]: any;
    }[];
}

/** Результат одной команды: cmd-ключ + её result из ответа батча. */
export interface IBatchCommandResult {
    cmd: string;
    result: unknown;
}

/** Ошибка одной команды из result_error (halt=0: остальные команды чанка
 * при этом исполнены). */
export interface IBatchCommandFailure {
    cmd: string;
    error: IBitrixBatchError;
}

/**
 * Структурированный итог всех flush'ей: результаты команд ПОДРЯД
 * (порядок = порядок команд по всем чанкам) и ошибки result_error.
 */
export interface IBatchFlushOutcome {
    results: IBatchCommandResult[];
    errors: IBatchCommandFailure[];
}

/**
 * Структурное подмножество порта FlowTransport, нужное буферу: отправка
 * накопленного cmdBatch одним HTTP-вызовом и живая ссылка на этот cmdBatch
 * (гигиена при падении + учёт преднаполненных ключей в ёмкости чанка).
 * getCmdBatch опционален — как в runExclusiveBatch: транспорт/фейк без
 * метода просто выключает гигиену и учёт (поведение донора), буфер
 * работает.
 */
export interface IBatchTransport {
    flush(): Promise<IBitrixBatchResponseResult[]>;
    getCmdBatch?(): Record<string, unknown>;
}

type QueuedCommand = () => void;

export class ColdHookBatchGroupBuffer {
    private static readonly CHUNK_LIMIT = 50;

    // Санкционированная замена Nest Logger (как во всём пакете): AppLogger
    // из shared/lib; переключение на FlowLogger-порт — вместе с адаптацией
    // I/O-сервисов А2.
    private readonly logger = new AppLogger(ColdHookBatchGroupBuffer.name);

    /** Открытая (ещё не закоммиченная endGroup'ом) группа. */
    private currentGroup: QueuedCommand[] = [];
    /** Закоммиченные группы: замыкания, ждущие материализации во flush. */
    private pendingGroups: QueuedCommand[][] = [];
    private bufferSize = 0;
    private readonly results: IBitrixBatchResponseResult[] = [];
    private readonly commandResults: IBatchCommandResult[] = [];
    private readonly commandErrors: IBatchCommandFailure[] = [];

    constructor(private readonly transport: IBatchTransport) {}

    /**
     * Регистрирует команду текущей группы. Сам enqueue (transport.batch.*)
     * будет вызван синхронно внутри flush — до того общий cmdBatch буфером
     * не трогается вовсе.
     */
    queue(enqueue: QueuedCommand): void {
        this.currentGroup.push(enqueue);
    }

    /**
     * Сколько команд уже зарегистрировано в текущей (ещё не закоммиченной) группе.
     */
    getCurrentGroupSize(): number {
        return this.currentGroup.length;
    }

    /**
     * Сколько команд накоплено в буфере (ждут flush).
     */
    getBufferSize(): number {
        return this.bufferSize;
    }

    /**
     * Атомарно коммитит текущую группу в очередь буфера. Материализации
     * здесь больше нет (донор звал enqueue'ы прямо тут) — только проверка
     * атомарности: группа больше CHUNK_LIMIT в один чанк не помещается ни
     * при каком раскладе, честная ошибка сразу; сама группа остаётся
     * открытой, в очередь не попадает.
     */
    async endGroup(): Promise<void> {
        const groupSize = this.currentGroup.length;
        if (groupSize === 0) {
            return;
        }
        if (groupSize > ColdHookBatchGroupBuffer.CHUNK_LIMIT) {
            throw new Error(
                `Group size ${groupSize} exceeds batch limit ${ColdHookBatchGroupBuffer.CHUNK_LIMIT}; ` +
                    `атомарная отправка невозможна.`,
            );
        }
        this.pendingGroups.push(this.currentGroup);
        this.bufferSize += groupSize;
        this.currentGroup = [];
    }

    /**
     * Шлёт закоммиченные группы чанками ≤ CHUNK_LIMIT из ЦЕЛЫХ групп:
     * каждый чанк синхронно материализуется в cmdBatch и тем же тактом, без
     * единого await, уходит в transport.flush(). Ключи, УЖЕ лежащие в
     * cmdBatch (прямые команды сервисов мимо буфера), уедут тем же вызовом
     * и занимают ёмкость чанка; заняли её одни — уезжают отдельным flush
     * ДО групп. Пустой буфер — no-op (и незакрытая endGroup'ом группа не
     * отправляется). Ошибки КОМАНД не выбрасываются — копятся в
     * getOutcome(); падение самого транспорта пробрасывается, перед этим
     * свои ключи чанка вычищаются из cmdBatch.
     */
    async flush(): Promise<void> {
        while (this.pendingGroups.length > 0) {
            // Слепок живого cmdBatch ДО набора чанка — нужен дважды:
            //  - ёмкость: преднаполненные прямые команды уедут ЭТИМ ЖЕ
            //    transport.flush() и занимают место чанка (браузерный
            //    callBatch хвост сверх 50 не дошлёт — Битрикс молча
            //    отбросит лишнее, см. шапку);
            //  - гигиена: при падении по слепку отличаем СВОИ ключи от
            //    чужих stale (образец — runExclusiveBatch).
            const alive =
                typeof this.transport.getCmdBatch === 'function'
                    ? this.transport.getCmdBatch()
                    : null;
            const before = new Set(Object.keys(alive ?? {}));
            const preloaded = before.size;

            // Чанк из целых групп; при чистом cmdBatch первая влезает всегда
            // (endGroup держит размер группы ≤ CHUNK_LIMIT). Преднаполненные
            // ключи одни заняли всю ёмкость — чанк остаётся БЕЗ групп, flush
            // уносит только их, группы уходят следующими итерациями.
            const chunk: QueuedCommand[] = [];
            let groupsInChunk = 0;
            while (this.pendingGroups.length > 0) {
                const next = this.pendingGroups[0];
                // Недостижимо при length > 0 — явный guard вместо `!` ради
                // noUncheckedIndexedAccess потребителей (apps/*).
                if (!next) {
                    break;
                }
                if (
                    preloaded + chunk.length + next.length >
                    ColdHookBatchGroupBuffer.CHUNK_LIMIT
                ) {
                    break;
                }
                this.pendingGroups.shift();
                chunk.push(...next);
                groupsInChunk++;
            }
            this.bufferSize -= chunk.length;
            this.logger.log(
                `[batch][FLUSH] отправка HTTP-batch: групп=${groupsInChunk}, ` +
                    `команд=${chunk.length}, преднаполнено=${preloaded}, ` +
                    `осталось в буфере=${this.bufferSize}`,
            );

            // Материализация: строго синхронно, и следующим же выражением —
            // вызов транспорта. Любой await между ними открыл бы окно, в
            // котором чужой код дописал бы общий cmdBatch.
            for (const enqueue of chunk) {
                enqueue();
            }
            let res: IBitrixBatchResponseResult[];
            try {
                res = await this.transport.flush();
            } catch (error) {
                // Свои ключи — появившиеся после слепка; чужие не трогаем.
                // (Упавший callBatch до очистки cmdBatch не дошёл — живая
                // ссылка всё ещё смотрит на тот же объект.)
                if (alive) {
                    for (const key of Object.keys(alive)) {
                        if (!before.has(key)) {
                            delete alive[key];
                        }
                    }
                }
                throw error;
            }
            // Прогресс чанка БЕЗ групп (преднаполненные ключи одни заняли
            // ёмкость): transport.flush() обязан потребить cmdBatch (живой
            // адаптер и фейки очищают его после отправки) — иначе эти ключи
            // занимали бы ёмкость вечно. Честная ошибка вместо вечного
            // цикла; свежий getCmdBatch(), а не слепок alive: успешный
            // callBatch живого адаптера пересоздаёт cmdBatch новым объектом.
            if (groupsInChunk === 0) {
                const rest =
                    typeof this.transport.getCmdBatch === 'function'
                        ? Object.keys(this.transport.getCmdBatch()).length
                        : 0;
                if (rest >= preloaded) {
                    throw new Error(
                        `Flush преднаполненных команд (${preloaded}) не потребил ` +
                            `cmdBatch (осталось ${rest}) — транспорт не очищает ` +
                            `очередь, отправка групп буфера невозможна.`,
                    );
                }
            }
            this.collect(res);
            this.logger.log(
                `[batch][FLUSH] HTTP-batch отправлен, получено результатов=${res.length}`,
            );
        }
    }

    /**
     * Разбор ответов одного чанка: результаты команд подряд + result_error
     * по командам (halt=0 — ошибка команды не роняет остальные и не
     * выбрасывается).
     */
    private collect(res: IBitrixBatchResponseResult[]): void {
        this.results.push(...res);
        for (const chunkResult of res) {
            for (const [cmd, result] of Object.entries(
                chunkResult.result ?? {},
            )) {
                this.commandResults.push({ cmd, result });
            }
            // result_error приходит записью cmd→ошибка; пустой PHP-массив
            // сериализуется как [] и означает «ошибок нет».
            const errors = chunkResult.result_error;
            if (errors && !Array.isArray(errors)) {
                for (const [cmd, error] of Object.entries(errors)) {
                    this.commandErrors.push({ cmd, error });
                }
            }
        }
    }

    /**
     * Аггрегированные результаты всех уже отправленных flush'ей в порядке отправки.
     */
    getResults(): IBitrixBatchResponseResult[] {
        return this.results;
    }

    /**
     * Структурированный итог: результаты команд ПОДРЯД (порядок = порядок
     * команд по всем чанкам) и ошибки result_error как {cmd, error}. Ошибки
     * не выбрасывались (halt=0-семантика Битрикса) — что делать с частичным
     * исполнением, решает вызывающий.
     */
    getOutcome(): IBatchFlushOutcome {
        return {
            results: this.commandResults,
            errors: this.commandErrors,
        };
    }
}

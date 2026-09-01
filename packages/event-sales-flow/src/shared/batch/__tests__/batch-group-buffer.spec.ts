/**
 * Спека переработанного группового буфера (план А2). Бэкового донора у неё
 * нет: донорская копия буфера материализовала команды прямо в endGroup и
 * слала callBatchWithConcurrency; здесь закрепляется НОВЫЙ контракт поверх
 * порта FlowTransport.
 *
 * ЧТО СТЕРЕЖЁТ СПЕКА
 * ------------------
 *  1. endGroup ничего не материализует: общий cmdBatch синглтона до flush
 *     не трогается вовсе — иначе два конкурента перемешают команды.
 *  2. Материализация чанка и вызов transport.flush() — один синхронный
 *     такт, ни единого await между ними (ловушка-микрозадача: любой await
 *     пропустил бы её вперёд отправки).
 *  3. Чанк ≤ 50 набирается ЦЕЛЫМИ группами: $result-связка одной группы
 *     никогда не рвётся между HTTP-вызовами. Преднаполненные ключи cmdBatch
 *     (прямые команды сервисов мимо буфера) занимают ёмкость чанка: сумма
 *     «преднаполненные + группы» держится ≤ 50 — сверх лимита браузерный
 *     callBatch не чанкует и Битрикс молча отбрасывает команды (бэковый
 *     callBatchWithConcurrency дослал бы хвост вторым HTTP-чанком).
 *  4. result_error разбирается по командам и НЕ выбрасывается (halt=0):
 *     ошибка команды не роняет остальные, вызывающий видит её в
 *     getOutcome().errors как {cmd, error}.
 *  5. Гигиена при падении транспорта: СВОИ материализованные ключи
 *     вычищаются из живого cmdBatch, чужие stale остаются (образец —
 *     runExclusiveBatch фронта); неотправленные группы остаются в буфере,
 *     упавший чанк не переигрывается.
 *  6. Порядок getOutcome().results = порядку команд сквозь все чанки.
 */
import {
    ColdHookBatchGroupBuffer,
    IBatchTransport,
    IBitrixBatchError,
    IBitrixBatchResponseResult,
} from '../batch-group-buffer';

interface IFakeOptions {
    /** cmd-ключи, которым чанк ответит result_error вместо result. */
    failCommands?: string[];
    /** Сколько первых вызовов flush падают целиком (сетевая ошибка). */
    rejectFirstFlushes?: number;
    /** Транспорт без getCmdBatch — гигиена выключена (как фейки runExclusiveBatch). */
    withoutGetCmdBatch?: boolean;
}

/**
 * Фейковый транспорт с живым cmdBatch — поведение как у
 * BitrixBaseApi.callBatch: ключи копятся, успешный flush переприсваивает
 * cmdBatch НОВЫМ пустым объектом, упавший оставляет всё как было (в живом
 * API очистка стоит после await без finally).
 */
const makeTransport = (opts: IFakeOptions = {}) => {
    let cmdBatch: Record<string, unknown> = {};
    /** Ключи cmdBatch на момент каждого вызова flush — наблюдаемые чанки. */
    const chunks: string[][] = [];
    /** Журнал тактов: cmd:<key> — материализация, flush:<keys> — отправка. */
    const seq: string[] = [];
    let flushCount = 0;

    const doFlush = async (): Promise<IBitrixBatchResponseResult[]> => {
        flushCount++;
        const keys = Object.keys(cmdBatch);
        chunks.push(keys);
        seq.push(`flush:${keys.join(',')}`);
        if (
            opts.rejectFirstFlushes !== undefined &&
            flushCount <= opts.rejectFirstFlushes
        ) {
            throw new Error('transport down');
        }
        const result: Record<string, unknown> = {};
        const resultError: Record<string, IBitrixBatchError> = {};
        for (const key of keys) {
            if (opts.failCommands?.includes(key)) {
                resultError[key] = {
                    error: 'ACCESS_DENIED',
                    error_description: `нет прав: ${key}`,
                };
            } else {
                result[key] = `ok:${key}`;
            }
        }
        cmdBatch = {};
        return [
            {
                result,
                // как у Битрикса: пустой PHP-массив ошибок сериализуется в []
                result_error:
                    Object.keys(resultError).length > 0 ? resultError : [],
                result_total: [],
                result_next: [],
            },
        ];
    };

    const transport: IBatchTransport = opts.withoutGetCmdBatch
        ? { flush: doFlush }
        : { flush: doFlush, getCmdBatch: () => cmdBatch };

    /** Замыкание-команда для queue(): материализует ключ в живой cmdBatch. */
    const command = (cmd: string) => () => {
        seq.push(`cmd:${cmd}`);
        if (!cmdBatch[cmd]) {
            cmdBatch[cmd] = { method: 'crm.item.update', params: { cmd } };
        }
    };

    return {
        transport,
        chunks,
        seq,
        command,
        /** Живой cmdBatch фейка — для чужих stale-ключей и ассертов гигиены. */
        alive: () => cmdBatch,
    };
};

const keysRange = (prefix: string, count: number): string[] =>
    Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);

const queueGroup = async (
    buffer: ColdHookBatchGroupBuffer,
    command: (cmd: string) => () => void,
    keys: string[],
): Promise<void> => {
    for (const key of keys) {
        buffer.queue(command(key));
    }
    await buffer.endGroup();
};

describe('ColdHookBatchGroupBuffer (переработка А2: замыкания + чанки + гигиена)', () => {
    it('endGroup только коммитит: замыкания не зовутся, общий cmdBatch до flush не тронут', async () => {
        const { transport, seq, alive, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        buffer.queue(command('a'));
        buffer.queue(command('b'));
        expect(buffer.getCurrentGroupSize()).toBe(2);

        await buffer.endGroup();

        expect(buffer.getCurrentGroupSize()).toBe(0);
        expect(buffer.getBufferSize()).toBe(2);
        expect(seq).toEqual([]); // ни одно замыкание не материализовалось
        expect(Object.keys(alive())).toEqual([]); // cmdBatch пуст
    });

    it('пустой буфер: flush — no-op, транспорт не зовётся (контракт batch-seam)', async () => {
        const { transport, chunks } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        await buffer.flush();

        expect(chunks).toEqual([]);
    });

    it('группа больше 50 — честная ошибка ещё на endGroup, отправки нет', async () => {
        const { transport, chunks, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        for (const key of keysRange('big_', 51)) {
            buffer.queue(command(key));
        }
        await expect(buffer.endGroup()).rejects.toThrow(
            'Group size 51 exceeds batch limit 50',
        );

        // как у донора: throw до мутаций — группа осталась открытой,
        // в очередь не попала, слать нечего
        expect(buffer.getCurrentGroupSize()).toBe(51);
        expect(buffer.getBufferSize()).toBe(0);
        await buffer.flush();
        expect(chunks).toEqual([]);
    });

    it('$result-связка уходит одним чанком, даже когда остаток чанка ей мал', async () => {
        const { transport, chunks, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        const filler = keysRange('fill_', 49);
        await queueGroup(buffer, command, filler);

        // группа из двух связанных команд: params второй ссылаются на
        // $result[add_kpi_row][ID] — разрыв по чанкам сломал бы ссылку
        buffer.queue(command('add_kpi_row'));
        buffer.queue(command('update_deal_kpi'));
        await buffer.endGroup();

        await buffer.flush();

        // 49 + 2 > 50: связка НЕ дробится 1+1 по границе, а целиком едет вторым HTTP
        expect(chunks).toHaveLength(2);
        expect(chunks[0]).toEqual(filler);
        expect(chunks[1]).toEqual(['add_kpi_row', 'update_deal_kpi']);
    });

    it('120 команд из трёх групп: чанки не рвут группы', async () => {
        const { transport, chunks, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        const g1 = keysRange('g1_', 40);
        const g2 = keysRange('g2_', 40);
        const g3 = keysRange('g3_', 40);
        await queueGroup(buffer, command, g1);
        await queueGroup(buffer, command, g2);
        await queueGroup(buffer, command, g3);
        expect(buffer.getBufferSize()).toBe(120);

        await buffer.flush();

        // 40 + 40 > 50 — каждая группа отдельным HTTP, без разрывов внутри
        expect(chunks).toEqual([g1, g2, g3]);
        expect(buffer.getBufferSize()).toBe(0);
    });

    it('чанк добирается целыми группами, пока помещается в 50', async () => {
        const { transport, chunks, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        const g1 = keysRange('a_', 20);
        const g2 = keysRange('b_', 25);
        const g3 = keysRange('c_', 30);
        await queueGroup(buffer, command, g1);
        await queueGroup(buffer, command, g2);
        await queueGroup(buffer, command, g3);

        await buffer.flush();

        // 20 + 25 = 45 ≤ 50, третья группа не влезла (75) — уехала вторым чанком
        expect(chunks).toEqual([[...g1, ...g2], g3]);
    });

    it('преднаполненные прямые команды занимают ёмкость первого чанка: суммарный HTTP-вызов ≤ 50', async () => {
        const { transport, chunks, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        // прямые команды сервисов мимо буфера (entity/deal/task/history):
        // уже лежат в cmdBatch и уедут ride-along первым transport.flush()
        const direct = keysRange('direct_', 10);
        for (const key of direct) {
            command(key)();
        }

        const g1 = keysRange('g1_', 30);
        const g2 = keysRange('g2_', 15);
        await queueGroup(buffer, command, g1);
        await queueGroup(buffer, command, g2);

        await buffer.flush();

        // 10 + 30 = 40 ≤ 50, а 10 + 30 + 15 = 55 > 50: g2 первым HTTP не
        // едет (всё сверх 50 Битрикс молча отбросил бы — ни result, ни
        // result_error) — уезжает вторым чанком из уже пустого cmdBatch
        expect(chunks).toEqual([[...direct, ...g1], g2]);
        expect(buffer.getBufferSize()).toBe(0);
    });

    it('преднаполненные ключи одни заняли ёмкость: уезжают отдельным flush ДО групп', async () => {
        const { transport, chunks, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        const direct = keysRange('direct_', 30);
        for (const key of direct) {
            command(key)();
        }
        const g1 = keysRange('g1_', 25);
        await queueGroup(buffer, command, g1);

        await buffer.flush();

        // 30 + 25 = 55 > 50: сначала одни прямые команды, следом группа —
        // обе половины отправлены целиком, ничего не отброшено
        expect(chunks).toEqual([direct, g1]);
        expect(buffer.getBufferSize()).toBe(0);
    });

    it('ошибка команды (halt=0) не роняет остальные и видна в getOutcome().errors', async () => {
        const { transport, command } = makeTransport({ failCommands: ['bad'] });
        const buffer = new ColdHookBatchGroupBuffer(transport);

        await queueGroup(buffer, command, ['a', 'bad', 'c']);
        await buffer.flush(); // НЕ бросает: решает вызывающий

        const outcome = buffer.getOutcome();
        expect(outcome.errors).toEqual([
            {
                cmd: 'bad',
                error: {
                    error: 'ACCESS_DENIED',
                    error_description: 'нет прав: bad',
                },
            },
        ]);
        expect(outcome.results).toEqual([
            { cmd: 'a', result: 'ok:a' },
            { cmd: 'c', result: 'ok:c' },
        ]);
        // сырые ответы (контракт getResults донора) тоже на месте
        expect(buffer.getResults()).toHaveLength(1);
    });

    it('падение транспорта: свои ключи вычищаются из живого cmdBatch, чужой stale и недоехавшие группы остаются', async () => {
        const { transport, chunks, command, alive } = makeTransport({
            rejectFirstFlushes: 1,
        });
        const buffer = new ColdHookBatchGroupBuffer(transport);

        // чужой stale-ключ до нас: упавший чужой батч о нём «помнил бы вечно»
        alive()['stale_foreign'] = { method: 'crm.deal.update', params: {} };

        const g1 = keysRange('g1_', 30);
        const g2 = keysRange('g2_', 30);
        await queueGroup(buffer, command, g1);
        await queueGroup(buffer, command, g2);

        await expect(buffer.flush()).rejects.toThrow('transport down');

        // чанк 1 (g1) материализовался и упал: СВОИ ключи сняты, чужой цел
        expect(Object.keys(alive())).toEqual(['stale_foreign']);
        // g2 очереди не дождалась — осталась в буфере; упавший чанк не переигрывается
        expect(buffer.getBufferSize()).toBe(30);
        expect(chunks).toHaveLength(1);
        expect(chunks[0]).toEqual(['stale_foreign', ...g1]);

        // буфер жив: повторный flush уносит g2 (чужой stale уезжает ride-along)
        await buffer.flush();
        expect(buffer.getBufferSize()).toBe(0);
        expect(chunks).toHaveLength(2);
        expect(chunks[1]).toEqual(['stale_foreign', ...g2]);
    });

    it('падение транспорта без getCmdBatch: гигиена просто выключена, ошибка пробрасывается', async () => {
        const { transport, command, alive } = makeTransport({
            rejectFirstFlushes: 1,
            withoutGetCmdBatch: true,
        });
        const buffer = new ColdHookBatchGroupBuffer(transport);

        await queueGroup(buffer, command, ['x', 'y']);
        await expect(buffer.flush()).rejects.toThrow('transport down');

        // вычищать некому — материализованные ключи остались (паритет с
        // фейками runExclusiveBatch: очередь работает, гигиены нет)
        expect(Object.keys(alive())).toEqual(['x', 'y']);
    });

    it('порядок getOutcome().results = порядку команд сквозь чанки; getResults — сырые ответы по отправкам', async () => {
        const { transport, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        const g1 = keysRange('a_', 20);
        const g2 = keysRange('b_', 25);
        const g3 = keysRange('c_', 30);
        await queueGroup(buffer, command, g1);
        await queueGroup(buffer, command, g2);
        await queueGroup(buffer, command, g3);

        await buffer.flush();

        const outcome = buffer.getOutcome();
        const allKeys = [...g1, ...g2, ...g3];
        expect(outcome.results.map(r => r.cmd)).toEqual(allKeys);
        expect(outcome.results.map(r => r.result)).toEqual(
            allKeys.map(key => `ok:${key}`),
        );
        expect(outcome.errors).toEqual([]);
        expect(buffer.getResults()).toHaveLength(2); // два HTTP-чанка в порядке отправки
    });

    it('между материализацией чанка и вызовом транспорта нет ни одного await (ловушка-микрозадача)', async () => {
        const { transport, seq, command } = makeTransport();
        const buffer = new ColdHookBatchGroupBuffer(transport);

        const g1 = keysRange('g1_', 30);
        const g2 = keysRange('g2_', 30);

        // первая команда каждой группы взводит ловушку: будь в буфере await
        // между материализацией и отправкой, микрозадача вклинилась бы ДО
        // flush-записи своего чанка
        const trap = (cmd: string, label: string) => () => {
            command(cmd)();
            void Promise.resolve().then(() => seq.push(`microtask:${label}`));
        };

        buffer.queue(trap('g1_1', 'g1'));
        for (const key of g1.slice(1)) {
            buffer.queue(command(key));
        }
        await buffer.endGroup();

        buffer.queue(trap('g2_1', 'g2'));
        for (const key of g2.slice(1)) {
            buffer.queue(command(key));
        }
        await buffer.endGroup();

        await buffer.flush();

        const flush1 = seq.indexOf(`flush:${g1.join(',')}`);
        const flush2 = seq.indexOf(`flush:${g2.join(',')}`);
        // отправка чанка идёт СРАЗУ за материализацией его последней команды…
        expect(flush1).toBe(seq.indexOf('cmd:g1_30') + 1);
        expect(flush2).toBe(seq.indexOf('cmd:g2_30') + 1);
        // …а ловушки срабатывают только ПОСЛЕ вызова транспорта своего чанка
        expect(seq.indexOf('microtask:g1')).toBeGreaterThan(flush1);
        expect(seq.indexOf('microtask:g2')).toBeGreaterThan(flush2);
    });
});

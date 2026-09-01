import type { FlowTransport } from '../../ports/flow-transport.port';
import type { IBitrixBatchResponseResult } from '../../shared/batch/batch-group-buffer';

/**
 * Dry-run-реализация порта FlowTransport для golden-сверки: записывает
 * КАЖДУЮ команду с параметрами в массив (`calls`, порядок постановки) и
 * моделирует накопительный cmdBatch — по нему видно, КАКИЕ cmd-ключи уехали
 * КАКИМ flush'ем (порядок групп и `$result`-связки проверяются по этим
 * записям).
 *
 * flush() отвечает ПО ПОРЯДКУ ВЫЗОВОВ из `flushResponses` (исчерпались —
 * []): это семантика фейка бэковой batch-seam-спеки
 * (`callBatchWithConcurrency` отвечал по номеру вызова, содержимое cmdBatch
 * не моделировалось — мокнутые сервисы команд не кладут, а ответ с
 * `add_task` изображает команды, положенные напрямую). Контракт живого
 * адаптера «пустой cmdBatch → no-op и []» здесь НЕ эмулируется намеренно —
 * состав ответов задаёт спека, а фейк честно записывает и пустые хвостовые
 * вызовы (`cmds: []`).
 *
 * getCmdBatch() отдаёт ЖИВУЮ ссылку (как api.getCmdBatch() бэка) — гигиена
 * группового буфера работает; flush чистит его МУТАЦИЕЙ, не пересозданием.
 */

export interface RecordedFlowCall {
    /** 'deal.update' | 'task.add' | … | 'call.dealGet' | 'flush'. */
    method: string;
    /** cmd-ключ batch-команды; у call.* и flush отсутствует. */
    cmd?: string;
    args: unknown[];
}

/** Один flush: какие cmd-ключи уехали и что ответил фейк. */
export interface RecordedFlush {
    cmds: string[];
    response: IBitrixBatchResponseResult[];
}

export interface DryRunCallResults {
    dealGet?: unknown;
    dealGetList?: unknown;
    checklistItemGetList?: unknown;
    imNotifySystemAdd?: unknown;
    listItemGet?: unknown;
    leadGetFieldsList?: unknown;
}

/**
 * Ответ одного flush'а: готовые чанки либо функция от РЕАЛЬНО отправленных
 * cmd-ключей. Функция нужна фреймовым кейсам: там форма ответа зависит от
 * состава батча (плоская мапа ТОЛЬКО успевших команд, упавшая просто
 * отсутствует), и подготовить её заранее нельзя — ключи рождаются внутри
 * прогона.
 */
export type DryRunFlushResponse =
    | IBitrixBatchResponseResult[]
    | ((cmds: string[]) => IBitrixBatchResponseResult[]);

export const makeDryRunTransport = (
    opts: {
        /** Ответы flush'ей по порядку вызовов; после исчерпания — []. */
        flushResponses?: DryRunFlushResponse[];
        /** Ответы call-домена (дефолт: { result: null } / { result: [] }). */
        callResults?: DryRunCallResults;
    } = {},
) => {
    const calls: RecordedFlowCall[] = [];
    const flushes: RecordedFlush[] = [];
    const cmdBatch: Record<string, unknown> = {};
    const responses = [...(opts.flushResponses ?? [])];

    const batchRecord =
        (method: string) =>
        (cmd: string, ...args: unknown[]): void => {
            calls.push({ method, cmd, args });
            cmdBatch[cmd] = args;
        };
    const callRecord =
        (method: string, result: () => unknown) =>
        (...args: unknown[]): Promise<unknown> => {
            calls.push({ method, args });
            return Promise.resolve(result());
        };

    const transport = {
        batch: {
            deal: {
                update: batchRecord('deal.update'),
                set: batchRecord('deal.set'),
                getList: batchRecord('deal.getList'),
            },
            lead: {
                get: batchRecord('lead.get'),
                update: batchRecord('lead.update'),
                getField: batchRecord('lead.getField'),
            },
            company: {
                get: batchRecord('company.get'),
                update: batchRecord('company.update'),
            },
            contact: {
                get: batchRecord('contact.get'),
            },
            task: {
                add: batchRecord('task.add'),
                update: batchRecord('task.update'),
                complete: batchRecord('task.complete'),
                commentAdd: batchRecord('task.commentAdd'),
            },
            checklistItem: {
                add: batchRecord('checklistItem.add'),
            },
            timeline: {
                addTimelineComment: batchRecord('timeline.addTimelineComment'),
            },
            listItem: {
                add: batchRecord('listItem.add'),
                update: batchRecord('listItem.update'),
            },
        },
        call: {
            dealGet: callRecord(
                'call.dealGet',
                () => opts.callResults?.dealGet ?? { result: null },
            ),
            dealGetList: callRecord(
                'call.dealGetList',
                () => opts.callResults?.dealGetList ?? { result: [] },
            ),
            checklistItemGetList: callRecord(
                'call.checklistItemGetList',
                () => opts.callResults?.checklistItemGetList ?? { result: [] },
            ),
            imNotifySystemAdd: callRecord(
                'call.imNotifySystemAdd',
                () => opts.callResults?.imNotifySystemAdd ?? { result: true },
            ),
            listItemGet: callRecord(
                'call.listItemGet',
                () => opts.callResults?.listItemGet ?? { result: [] },
            ),
            leadGetFieldsList: callRecord(
                'call.leadGetFieldsList',
                () => opts.callResults?.leadGetFieldsList ?? { result: [] },
            ),
        },
        flush: (): Promise<IBitrixBatchResponseResult[]> => {
            const cmds = Object.keys(cmdBatch);
            // Мутация, не пересоздание: живая ссылка getCmdBatch() у
            // держателей (гигиена буфера) обязана остаться той же.
            for (const key of cmds) {
                delete cmdBatch[key];
            }
            const next = responses.length > 0 ? responses.shift() : [];
            const response =
                typeof next === 'function'
                    ? next(cmds)
                    : ((next ?? []) as IBitrixBatchResponseResult[]);
            calls.push({ method: 'flush', args: [cmds] });
            flushes.push({ cmds, response });
            return Promise.resolve(response);
        },
        getCmdBatch: () => cmdBatch,
    };

    return {
        transport: transport as unknown as FlowTransport,
        calls,
        flushes,
        cmdBatch,
    };
};

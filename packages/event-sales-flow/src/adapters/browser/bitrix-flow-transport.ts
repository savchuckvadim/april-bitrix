/**
 * BitrixFlowTransport — браузерная реализация порта FlowTransport поверх
 * @workspace/bitrix (синглтон Bitrix.getService()).
 *
 * Маппинг:
 *  - batch-методы порта → штатные `service.batch.*` — то самое
 *    addCmdBatchType-накопление в общий cmdBatch под cmd-ключами, на
 *    которые ссылаются `$result[...]`-чейны (команда ложится синхронно,
 *    как на бэке);
 *  - call-методы порта → доменные сервисы (`service.deal.get` и т.п.),
 *    ответ приводится к бэковому конверту `{ result }`;
 *  - flush() — отправка: `api.callBatch()` (объект команд — cmd-ключи и
 *    $result-чейны живы; `callBatchByChunk` ЗАПРЕЩЁН — он перекладывает
 *    команды в массив и рвёт ссылки), ответ нормализуется к бэковой форме
 *    IBitrixBatchResponseResult[]. Пустой cmdBatch — no-op и []
 *    (b24jssdk на пустую пачку кидает JSSDK_BATCH_EMPTY; бэковый
 *    `callBatchWithConcurrency(1)` на пустой очереди отдаёт [] — хвостовой
 *    вызов use-case на это рассчитывает). Больше 50 команд —
 *    ЗАВИСИМОСТНОЕ чанкование (см. planBatchChunks): Битрикс молча
 *    отбрасывает всё сверх 50, а групповой буфер лимит держит только для
 *    СВОИХ групп — при дефолтной карте прав (KPI выключен) буфер пуст, и
 *    весь пишущий батч уходит именно этим хвостовым flush'ем.
 *
 * Отправка флоу идёт ЧЕРЕЗ ГРУППОВОЙ БУФЕР (сосед shared/batch,
 * ColdHookBatchGroupBuffer): координатор создаёт буфер ПОВЕРХ этого
 * транспорта (транспорт структурно реализует его IBatchTransport — flush +
 * getCmdBatch), буфер копит команды замыканиями, материализует их синхронно
 * и сам зовёт transport.flush() по чанкам ≤50 из целых групп — напрямую
 * callBatch не зовёт никто. getCmdBatch() отдаёт живую ссылку на cmdBatch —
 * гигиена буфера при упавшем flush (свои ключи вычищаются, чужие stale не
 * трогаются).
 *
 * Разбор result_error каждого ответа ОБЯЗАТЕЛЕН (halt=false у Битрикса:
 * часть команд исполнена, упавшие видны только здесь): ошибки логируются,
 * поток не прерывается. Во фрейме b24jssdk отдаёт getData() БЕЗ
 * result_error — `_extractBatchSimpleData` кладёт в ответ только команды с
 * `isSuccess`, упавшая выпадает целиком. Поэтому неотвеченные cmd-ключи
 * едут дальше НАСТОЯЩЕЙ ошибкой `FLOW_NO_RESPONSE_ERROR` (контракт порта,
 * подстановка — appendMissingCommandErrors): «команда без ответа» = «команда не
 * исполнена», и разбор исхода (буфер, use-case, прямой исполнитель) судит
 * её наравне с result_error dev-режима.
 *
 * Порт закрыт ЦЕЛИКОМ (А4): batch.task.add/complete/commentAdd,
 * batch.checklistItem.add, batch.listItem.update, call.checklistItemGetList
 * и call.imNotifySystemAdd приехали дополнением @workspace/bitrix (имена
 * REST-методов сверены с apidocs через b24-dev-mcp, каждая пара
 * namespace+entity+method записана в BXApiSchema).
 *
 * ЭКРАНИРОВАНИЕ — НА ЭТОЙ ГРАНИЦЕ. Флоу готовит текст для БЭКОВОГО провода:
 * тот склеивает query-строку `cmd` руками и вклеивает значения сырыми,
 * поэтому `%0A/%25/%2B/%26` приезжают сюда уже экранированными (правило и
 * причины — в шапке `shared/batch/batch-text.ts`). Здесь провод другой, и он
 * бывает ДВУХ видов:
 *  - ВО ФРЕЙМЕ команду строит b24jssdk — `qs.stringify` с `encode: true`.
 *    Он закодирует и наш `%`, Битрикс декодирует один раз, и в поле ляжет
 *    литеральное `%0A` вместо переноса. Поэтому перед отдачей в SDK
 *    экранирование СНИМАЕТСЯ ({@link decodeBatchEscapes}) — значение
 *    становится плоским текстом, тем самым, что Битрикс получил бы на
 *    серверном пути после своего единственного декодирования;
 *  - ВНЕ ФРЕЙМА (dev/standalone) `@workspace/bitrix` уходит на бэк-прокси и
 *    строит query-строку САМ, сырыми значениями — то есть ведёт себя как
 *    бэковый транспорт, и снимать там НЕЛЬЗЯ.
 * Развилка — `api.getInitializedData().inFrame`, единственный честный
 * признак того, кто строит команду. Снятие применяется ко ВСЕМ `batch.*`
 * без исключений: правило, у которого есть список исключений, рано или
 * поздно применят непоследовательно. `call.*` идут мимо query-склейки и
 * получают плоский текст изначально — их не трогаем.
 */
import { Bitrix } from '@workspace/bitrix';
import type { BitrixService } from '@workspace/bitrix';
import type { IBitrixBatchResponseResult } from '../../shared/batch/batch-group-buffer';
import type { FlowLogger } from '../../ports/flow-logger.port';
import {
    CALL_BATCH_COMMAND_LIMIT,
    appendMissingCommandErrors,
    normalizeCallBatchResponse,
    planBatchChunks,
} from './batch-response';
import { decodeBatchEscapes } from './batch-escapes';
import type {
    FlowCallResult,
    FlowImNotifySystemAdd,
    FlowListItemAddRequest,
    FlowListItemGetRequest,
    FlowListItemUpdateRequest,
    FlowListOrder,
    FlowTaskCommentAddFields,
    FlowTaskCreateFields,
    FlowTaskUpdateFields,
    FlowTimelineComment,
    FlowTransport,
    FlowUserFieldDefinition,
} from '../../ports/flow-transport.port';
import type {
    IBXDeal,
    IBXCompany,
    IBXLead,
} from '../../types/bitrix-entities.type';
import type {
    IBXChecklistItem,
    IBXChecklistItemAddRequest,
    IBXChecklistItemGetListRequest,
} from '../../shared/bitrix/checklist-item.interface';
import type { IBXListItem } from '../../shared/bitrix/list-item.interface';
import { ConsoleFlowLogger } from './console-flow-logger';

export interface BitrixFlowTransportOptions {
    /** По умолчанию — синглтон Bitrix.getService() (Bitrix.start уже вызван). */
    service?: BitrixService;
    logger?: FlowLogger;
}

/**
 * Чистый разбор ответа и планирование чанков вынесены в соседний модуль
 * (batch-response): их видят и спеки ядра, не таща за собой браузерный SDK.
 * Реэкспорт — чтобы публичные имена транспорта не переезжали.
 */
export {
    CALL_BATCH_COMMAND_LIMIT,
    appendMissingCommandErrors,
    normalizeCallBatchResponse,
    planBatchChunks,
} from './batch-response';
export { decodeBatchEscapedText, decodeBatchEscapes } from './batch-escapes';

export class BitrixFlowTransport implements FlowTransport {
    private readonly service: BitrixService;
    private readonly logger: FlowLogger;

    constructor(options: BitrixFlowTransportOptions = {}) {
        const service = options.service ?? Bitrix.getService();
        if (!service) {
            throw new Error(
                '[event-sales-flow] BitrixFlowTransport: Bitrix.getService() пуст — ' +
                    'вызови Bitrix.start(domain, user) до создания транспорта',
            );
        }
        this.service = service;
        this.logger =
            options.logger ?? new ConsoleFlowLogger(BitrixFlowTransport.name);
    }

    readonly batch: FlowTransport['batch'] = {
        deal: {
            update: (cmdKey, dealId, data: Partial<IBXDeal>) =>
                void this.service.batch.deal.update(
                    cmdKey,
                    dealId,
                    this.forSdk(data),
                ),
            set: (cmdKey, data: Partial<IBXDeal>) =>
                void this.service.batch.deal.set(cmdKey, this.forSdk(data)),
            getList: (
                cmdKey,
                filter: Partial<IBXDeal>,
                select?: string[],
                order?: FlowListOrder<IBXDeal>,
            ) =>
                void this.service.batch.deal.getList(
                    cmdKey,
                    this.forSdk(filter),
                    select,
                    order,
                ),
        },
        lead: {
            get: (cmdKey, leadId, select?: string[]) =>
                void this.service.batch.lead.get(cmdKey, leadId, select),
            update: (cmdKey, leadId, data: Partial<IBXLead>) =>
                void this.service.batch.lead.update(
                    cmdKey,
                    leadId,
                    this.forSdk(data),
                ),
            getField: (cmdKey, id) =>
                void this.service.batch.lead.getField(cmdKey, id),
        },
        company: {
            get: (cmdKey, companyId) =>
                void this.service.batch.company.get(cmdKey, companyId),
            update: (cmdKey, companyId, data: Partial<IBXCompany>) =>
                void this.service.batch.company.update(
                    cmdKey,
                    companyId,
                    this.forSdk(data),
                ),
        },
        contact: {
            get: (cmdKey, contactId) =>
                void this.service.batch.contact.get(cmdKey, contactId),
            update: (cmdKey, contactId, data) =>
                void this.service.batch.contact.update(
                    cmdKey,
                    Number(contactId),
                    this.forSdk(data) as never,
                ),
        },
        task: {
            add: (cmdKey, fields: FlowTaskCreateFields) =>
                void this.service.batch.task.add(cmdKey, this.forSdk(fields)),
            update: (cmdKey, taskId, fields: FlowTaskUpdateFields) =>
                void this.service.batch.task.update(
                    cmdKey,
                    taskId,
                    this.forSdk(fields),
                ),
            complete: (cmdKey, taskId) =>
                void this.service.batch.task.complete(cmdKey, taskId),
            commentAdd: (cmdKey, taskId, fields: FlowTaskCommentAddFields) =>
                void this.service.batch.task.commentAdd(
                    cmdKey,
                    taskId,
                    this.forSdk(fields),
                ),
        },
        checklistItem: {
            add: (cmdKey, data: IBXChecklistItemAddRequest) =>
                void this.service.batch.checklistItem.add(
                    cmdKey,
                    this.forSdk(data),
                ),
        },
        timeline: {
            addTimelineComment: (cmdKey, data: FlowTimelineComment) =>
                void this.service.batch.timeline.addTimelineComment(
                    cmdKey,
                    // Структурные копии одного бэкового IBXTimelineComment;
                    // фронтовая декларация чуть строже (AUTHOR_ID обязателен),
                    // но Битрикс его не требует — history.service шлёт без
                    // него, от имени токена (см. бэковый интерфейс).
                    this.forSdk(data) as unknown as Parameters<
                        BitrixService['batch']['timeline']['addTimelineComment']
                    >[1],
                ),
        },
        listItem: {
            add: (cmdKey, dto: FlowListItemAddRequest) =>
                void this.service.batch.listItem.add(
                    cmdKey,
                    this.forSdk(dto) as unknown as Parameters<
                        BitrixService['batch']['listItem']['add']
                    >[1],
                ),
            update: (cmdKey, dto: FlowListItemUpdateRequest) =>
                void this.service.batch.listItem.update(
                    cmdKey,
                    this.forSdk(dto) as unknown as Parameters<
                        BitrixService['batch']['listItem']['update']
                    >[1],
                ),
        },
    };

    /**
     * Значения ОДНОЙ batch-команды в том виде, в каком их ждёт нижележащий
     * провод (см. блок «ЭКРАНИРОВАНИЕ — НА ЭТОЙ ГРАНИЦЕ» в шапке файла).
     *
     * Во фрейме команду строит b24jssdk и кодирует значения сам — batch-вид
     * снимается, в SDK уходит плоский текст. Вне фрейма `@workspace/bitrix`
     * склеивает query-строку сырыми значениями, как бэк, — отдаём как есть.
     *
     * `getInitializedData` спрашивается на КАЖДОЙ команде, а не кэшируется:
     * транспорт живёт дольше одного отчёта, а фрейм поднимается асинхронно.
     * Метода нет вовсе (узкий фейк в тестах) — считаем провод бэковым:
     * недобавленное экранирование ломает громко, лишнее — молча.
     */
    private forSdk<T>(payload: T): T {
        const api = this.service.api as {
            getInitializedData?: () => { inFrame?: boolean };
        };
        const inFrame = api.getInitializedData?.().inFrame === true;
        return inFrame ? decodeBatchEscapes(payload) : payload;
    }

    readonly call: FlowTransport['call'] = {
        // Фронтовый deal.get разворачивает ответ до сущности — заворачиваем
        // обратно в бэковый конверт `{ result }`: адаптированные сервисы
        // читают `response?.result` дословно как на бэке.
        dealGet: async (
            dealId,
            select?: string[],
        ): Promise<FlowCallResult<IBXDeal> | undefined> => {
            const result = await this.service.deal.get(dealId, select);
            return { result: result as IBXDeal | null };
        },
        dealGetList: async (
            filter: Partial<IBXDeal>,
            select?: string[],
            order?: FlowListOrder<IBXDeal>,
        ): Promise<FlowCallResult<IBXDeal[]> | undefined> =>
            (await this.service.deal.getList(
                filter,
                select,
                order,
            )) as unknown as FlowCallResult<IBXDeal[]>,
        // callType пакета отдаёт бэковый конверт { result } как есть —
        // адаптированные сервисы читают response?.result дословно.
        checklistItemGetList: async (
            data: IBXChecklistItemGetListRequest,
        ): Promise<FlowCallResult<IBXChecklistItem[]> | undefined> =>
            (await this.service.checklistItem.getList(
                data,
            )) as unknown as FlowCallResult<IBXChecklistItem[]>,
        imNotifySystemAdd: async (
            data: FlowImNotifySystemAdd,
        ): Promise<FlowCallResult<number | boolean> | undefined> =>
            (await this.service.imNotify.systemAdd(
                data,
            )) as unknown as FlowCallResult<number | boolean>,
        listItemGet: async (
            dto: FlowListItemGetRequest,
        ): Promise<FlowCallResult<IBXListItem[]> | undefined> =>
            (await this.service.listItem.get(
                dto as Parameters<BitrixService['listItem']['get']>[0],
            )) as unknown as FlowCallResult<IBXListItem[]>,
        leadGetFieldsList: async (
            filter?: Record<string, unknown>,
            select?: string[],
        ): Promise<FlowCallResult<FlowUserFieldDefinition[]> | undefined> =>
            // Бэковая сигнатура держит filter опциональным (`filter || {}`),
            // фронтовая требует объект — дефолт подставляется здесь.
            (await this.service.lead.getFieldsList(
                filter ?? {},
                select,
            )) as unknown as FlowCallResult<FlowUserFieldDefinition[]>,
    };

    /** Живая ссылка на cmdBatch — гигиена группового буфера при падении flush. */
    getCmdBatch(): Record<string, unknown> {
        return this.service.api.getCmdBatch();
    }

    /**
     * Отправка накопленного cmdBatch. Пустой cmdBatch — no-op и [].
     *
     * До лимита — ровно один `callBatch()`, как раньше. Сверх лимита —
     * последовательные вызовы по плану {@link planBatchChunks}: связки
     * `$result[...]` целы, порядок команд сохранён, ответы склеены. Без
     * этого Битрикс молча отбрасывал бы всё сверх 50 команд, а в ответе не
     * было бы даже следа (тот же провал, что и с упавшей командой во фрейме).
     */
    async flush(): Promise<IBitrixBatchResponseResult[]> {
        const entries = Object.entries(this.getCmdBatch());
        const sentKeys = entries.map(([key]) => key);

        if (entries.length === 0) {
            return [];
        }
        if (entries.length <= CALL_BATCH_COMMAND_LIMIT) {
            return this.reportBatchErrors(
                normalizeCallBatchResponse(await this.service.api.callBatch()),
                sentKeys,
            );
        }

        return this.reportBatchErrors(
            await this.flushInChunks(entries),
            sentKeys,
        );
    }

    /**
     * Отправка чанками (сверх лимита Битрикса). План считается ДО первой
     * отправки — неделимая связка длиннее лимита роняет flush честной
     * ошибкой, ничего не отправив.
     *
     * Механика: свои ключи вынимаются из живого cmdBatch целиком, дальше
     * каждый чанк кладётся обратно и уезжает своим `callBatch()` (успешный
     * вызов пересоздаёт cmdBatch — ссылку берём заново). Упал ПЕРВЫЙ чанк —
     * не ушло ничего, честный выброс (исход рассудит вызывающий). Упал
     * следующий — часть батча уже исполнена, и выброс соврал бы «ничего не
     * было»: остаток отдаётся неотвеченными ключами, то есть честным
     * провалом КОМАНД. Ключи упавшего чанка вычищаются из cmdBatch — иначе
     * их унёс бы первый же чужой callBatch (двойное исполнение).
     */
    private async flushInChunks(
        entries: ReadonlyArray<readonly [string, unknown]>,
    ): Promise<IBitrixBatchResponseResult[]> {
        const plan = planBatchChunks(entries);
        const commands = new Map(entries);
        const live = this.getCmdBatch();

        for (const [key] of entries) {
            delete live[key];
        }
        this.logger.warn(
            `[flush] команд ${entries.length} — больше лимита ` +
                `${CALL_BATCH_COMMAND_LIMIT}: отправка ${plan.length} ` +
                `последовательными чанками (${plan.map(chunk => chunk.length).join('+')})`,
        );

        const collected: IBitrixBatchResponseResult[] = [];

        for (const [index, keys] of plan.entries()) {
            const target = this.getCmdBatch();
            for (const key of keys) {
                target[key] = commands.get(key);
            }
            try {
                collected.push(
                    ...normalizeCallBatchResponse(
                        await this.service.api.callBatch(),
                    ),
                );
            } catch (error) {
                const alive = this.getCmdBatch();
                for (const key of keys) {
                    delete alive[key];
                }
                if (index === 0) {
                    throw error;
                }
                this.logger.error(
                    `[flush] чанк ${index + 1}/${plan.length} не отправлен ` +
                        `(${String(error)}) — команды этого и следующих чанков ` +
                        'остаются неисполненными',
                );
                break;
            }
        }

        return collected;
    }

    /**
     * Разбор result_error (halt=false: часть команд исполнена, упавшие видны
     * только здесь) + подстановка «команда без ответа»: во фрейме b24jssdk
     * прячет result_error (упавшая команда просто выпадает из getData()), и
     * пропавший cmd-ключ — единственный след её падения. Такой ключ едет
     * дальше ошибкой {@link FLOW_NO_RESPONSE_ERROR}, а не одной строкой в
     * консоли.
     */
    private reportBatchErrors(
        chunks: IBitrixBatchResponseResult[],
        sentKeys: string[],
    ): IBitrixBatchResponseResult[] {
        for (const chunk of chunks) {
            const errors = chunk.result_error;
            if (!errors || Array.isArray(errors)) continue;
            for (const [key, error] of Object.entries(errors)) {
                this.logger.error(
                    `[flush] result_error «${key}»: ${error?.error ?? '?'} — ` +
                        `${error?.error_description ?? ''} (halt=false: остальные команды исполнены)`,
                );
            }
        }
        const { chunks: withMissing, missing } = appendMissingCommandErrors(
            chunks,
            sentKeys,
        );

        if (missing.length > 0) {
            this.logger.error(
                `[flush] без ответа остались команды: ${missing.join(', ')} — ` +
                    'считаем их упавшими (фрейм теряет result_error)',
            );
        }

        return withMissing;
    }
}

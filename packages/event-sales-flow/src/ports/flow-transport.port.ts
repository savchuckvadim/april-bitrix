/**
 * FlowTransport — шов пакета к Bitrix REST.
 *
 * Структурное подмножество бэкового BitrixService (back/libs/bitrix):
 * `batch.*` копит команды в накопительный батч ПОД cmd-ключами (на ключи
 * ссылаются `$result[...]`-чейны — порядок и имена ключей сохраняются),
 * `call.*` — одиночные вызовы вне батча, `flush()` отправляет накопленное
 * одним HTTP-батчем и возвращает разобранные ответы.
 *
 * Состав снят ГРЕПОМ по фактическим вызовам I/O-сервисов event-report
 * (back/apps/event-sales/src/event-report/services + shared-доноры,
 * которые исполняет event-report.use-case) — А0-скелет «минимально,
 * доуточнить при адаптации» доуточнён здесь (заход А2). Карта вызовов:
 *
 *  batch.deal.update      — deal-move-count:53, sales-base-deal:83,
 *                           sales-presentation-deal:95,185, sales-xo-deal:69,
 *                           tmc-deal:78,118, entity-flow:77, return-to-tmc:41
 *  batch.deal.set         — sales-base-deal:92, sales-presentation-deal:134,171
 *  batch.deal.getList     — init:189,517
 *  batch.lead.get         — init:197,200,205; lead-request-sync:94
 *  batch.lead.update      — entity-flow:85, lead-relation:38,
 *                           lead-request-sync:118
 *  batch.lead.getField    — shared/portal-fields/lead-uf-definitions:88
 *                           (волна 2 определений UF-полей лида; сам сервис
 *                           инжектится в event-report.use-case)
 *  batch.company.get      — init:172
 *  batch.company.update   — entity-flow:69,132
 *  batch.contact.get      — init:214,220
 *  batch.task.update      — task-flow:219
 *  batch.task.complete    — task-flow:233
 *  batch.task.add         — task-flow:249
 *  batch.task.commentAdd  — task-flow:341
 *  batch.checklistItem.add — task-flow:310
 *  batch.timeline.addTimelineComment — history:38
 *  batch.listItem.add     — presentation-list:69; shared/kpi-list-flow:228
 *  batch.listItem.update  — shared/kpi-list-flow:219
 *
 *  call.dealGet           — init:412 (owner-сделка), stage-predict:141
 *  call.dealGetList       — stage-predict:164
 *  call.checklistItemGetList — task-flow:182 (чек-лист закрываемой задачи)
 *  call.imNotifySystemAdd — task-flow:493 (уведомление о переносе)
 *  call.listItemGet       — shared/kpi-list-flow:258 (дедуп по ELEMENT_CODE)
 *  call.leadGetFieldsList — shared/portal-fields/lead-uf-definitions:78
 *
 *  flush                  — event-report.use-case:144, init:223,
 *                           lead-request-sync:96,126
 *                           (бэковый `api.callBatchWithConcurrency(1)`)
 *
 * Побочные смарт-очереди (side-flow, zpr/pres element-writer'ы) в порт НЕ
 * входят: на прямом пути они всегда deferred (allowSmartWrites=false, план
 * А4), их bitrix.item.* / task.get исполняет сервер.
 *
 * Реализации: браузерный адаптер поверх @workspace/bitrix
 * (adapters/browser/bitrix-flow-transport; порт закрыт целиком — методы
 * batch.task.add/complete/commentAdd, batch.checklistItem.add,
 * batch.listItem.update, call.checklistItemGetList и call.imNotifySystemAdd
 * дозаведены в @workspace/bitrix в А4) и бэковый поверх BitrixService
 * (позже).
 *
 * Типы payload'ов объявлены ЛОКАЛЬНО по фактическому использованию (как в
 * flow-portal.port): структурные подмножества интерфейсов back/libs/bitrix;
 * уже перенесённые декларации берутся из shared/bitrix, не дублируются.
 */
import { IBitrixBatchResponseResult } from '../shared/batch/batch-group-buffer';
import type {
    IBXCompany,
    IBXContact,
    IBXDeal,
    IBXLead,
} from '../types/bitrix-entities.type';
import type {
    IBXChecklistItem,
    IBXChecklistItemAddRequest,
    IBXChecklistItemGetListRequest,
} from '../shared/bitrix/checklist-item.interface';
import type {
    IBXListItem,
    IBXListItemFields,
} from '../shared/bitrix/list-item.interface';

/** Cmd-ключ команды в батче — на него ссылаются $result-чейны. */
export type FlowBatchCmdKey = string;

/**
 * Код синтетической ошибки «команда батча осталась БЕЗ ОТВЕТА» — контракт
 * порта для любой реализации `flush()`.
 *
 * Зачем он есть. На бэке упавшая команда видна в `result_error` (halt=0).
 * Во ФРЕЙМЕ Битрикса её не видно вовсе: b24jssdk с `returnAjaxResult=false`
 * собирает в ответ ТОЛЬКО успешные команды (`_extractBatchSimpleData`:
 * `if (data.isSuccess)`), а упавшая просто выпадает — ни результата, ни
 * ошибки. Единственный доступный сигнал — «отправили cmd-ключ, ответа по
 * нему нет».
 *
 * Поэтому реализация flush ОБЯЗАНА представить каждый неотвеченный ключ
 * ошибкой с этим кодом — наравне с настоящим `result_error`. Разбор исхода
 * (use-case, групповой буфер, прямой исполнитель) читает оба источника
 * одинаково: неотвеченная команда = НЕ исполненная команда.
 */
export const FLOW_NO_RESPONSE_ERROR = 'NO_RESPONSE';

/** Порядок сортировки списочных методов (бэк: inline-тип у getList). */
export type FlowListOrder<T> = {
    [key in keyof T]?: 'asc' | 'desc' | 'ASC' | 'DESC';
};

/**
 * Обёртка ответа одиночного вызова — сущность лежит в `.result`
 * (бэковый IBitrixResponse; сервисы читают `response?.result`).
 */
export interface FlowCallResult<T> {
    result?: T | null;
    total?: number;
    next?: number;
    time?: unknown;
}

/**
 * Поля создания задачи (`tasks.task.add`) — подмножество бэкового
 * IBXTaskCreateFields (libs/bitrix/domain/tasks/task/interface) по
 * фактическому использованию task-flow; индекс-подпись — как на бэке
 * (UF_TASK_EVENT_COMMENT, DESCRIPTION_IN_BBCODE и прочие UF-поля).
 */
export interface FlowTaskCreateFields {
    TITLE: string;
    RESPONSIBLE_ID: number | string;
    CREATED_BY?: number | string;
    GROUP_ID?: number | string;
    DEADLINE?: string;
    DESCRIPTION?: string;
    PRIORITY?: number | string;
    UF_CRM_TASK?: string[];
    ALLOW_CHANGE_DEADLINE?: 'Y' | 'N';
    [key: string]: unknown;
}

/** Поля обновления задачи (бэк: ITaskUpdateFields = Partial<Create> + индекс). */
export interface FlowTaskUpdateFields extends Partial<FlowTaskCreateFields> {
    [key: string]: unknown;
}

/** Поля комментария к задаче (`task.commentitem.add`, бэк: ITaskCommentAddFields). */
export interface FlowTaskCommentAddFields {
    AUTHOR_ID: number | string;
    POST_MESSAGE: string;
}

/**
 * Комментарий таймлайна (`crm.timeline.comment.add`, бэк: IBXTimelineComment).
 * AUTHOR_ID необязателен: без него комментарий пишется от имени
 * пользователя вебхука/токена — history.service его и не передаёт.
 */
export interface FlowTimelineComment {
    ID?: number | string;
    ENTITY_ID: number | string;
    ENTITY_TYPE: string;
    COMMENT: string;
    AUTHOR_ID?: string;
    FILES?: [string, string][];
}

/** Системное уведомление (`im.notify.system.add`, бэк: IBXImNotifySystemAdd). */
export interface FlowImNotifySystemAdd {
    USER_ID: number | string;
    MESSAGE: string;
    MESSAGE_OUT?: string;
    TAG?: string;
    SUB_TAG?: string;
}

/**
 * Запросы `lists.element.*` — бэковые BxListItem*RequestType БЕЗ
 * IBLOCK_TYPE_ID: его подставляет транспорт (batch-сервисы бэка принимают
 * Omit<…, 'IBLOCK_TYPE_ID'> и дописывают 'lists' сами).
 */
export interface FlowListItemAddRequest {
    IBLOCK_ID: string | number;
    ELEMENT_CODE?: string;
    FIELDS: IBXListItemFields;
}

/** `lists.element.update`: адресация ELEMENT_ID либо ELEMENT_CODE; NAME в FIELDS обязателен. */
export interface FlowListItemUpdateRequest {
    IBLOCK_ID: string | number;
    ELEMENT_ID?: string | number;
    ELEMENT_CODE?: string;
    FIELDS: IBXListItemFields;
}

/** `lists.element.get`: kpi-дедуп адресует ELEMENT_CODE при IBLOCK_ID. */
export interface FlowListItemGetRequest {
    IBLOCK_CODE?: string;
    IBLOCK_ID?: string | number;
    ELEMENT_ID?: string | number;
    ELEMENT_CODE?: string;
    filter?: Record<string, unknown>;
    select?: string[];
    order?: Record<string, 'ASC' | 'DESC'>;
}

/**
 * Определение UF-поля лида (`crm.lead.userfield.list/get`) — подмножество
 * бэкового IBXField по чтению lead-uf-definitions (ID/FIELD_NAME из волны 1,
 * LIST/SETTINGS из полных определений волны 2).
 */
export interface FlowUserFieldDefinition {
    ID?: number | string;
    FIELD_NAME?: string;
    USER_TYPE_ID?: string;
    MULTIPLE?: 'Y' | 'N';
    LIST?: Array<Record<string, unknown>>;
    SETTINGS?: Record<string, unknown>;
    [key: string]: unknown;
}

/** Накопительные команды сделок (crm.deal.*). */
export interface FlowDealBatch {
    update(
        cmdKey: FlowBatchCmdKey,
        dealId: number | string,
        data: Partial<IBXDeal>,
    ): void;
    set(cmdKey: FlowBatchCmdKey, data: Partial<IBXDeal>): void;
    getList(
        cmdKey: FlowBatchCmdKey,
        filter: Partial<IBXDeal>,
        select?: string[],
        order?: FlowListOrder<IBXDeal>,
    ): void;
}

/** Накопительные команды лидов (crm.lead.* + crm.lead.userfield.get). */
export interface FlowLeadBatch {
    get(
        cmdKey: FlowBatchCmdKey,
        leadId: number | string,
        select?: string[],
    ): void;
    update(
        cmdKey: FlowBatchCmdKey,
        leadId: number | string,
        data: Partial<IBXLead>,
    ): void;
    getField(cmdKey: FlowBatchCmdKey, id: number | string): void;
}

/** Накопительные команды компаний (crm.company.*). */
export interface FlowCompanyBatch {
    get(cmdKey: FlowBatchCmdKey, companyId: number | string): void;
    update(
        cmdKey: FlowBatchCmdKey,
        companyId: number | string,
        data: Partial<IBXCompany>,
    ): void;
}

/**
 * Накопительные команды контактов.
 *
 * `get` — план/отчёт-контакты на инициализации. `update` появился
 * 01.09.2026 вместе с зеркалом полей в контакт: возражение и плановая дата
 * покупки пишутся в собеседника звонка, и прямой путь обязан уметь то же,
 * что сервер, иначе браузер исполнил бы отчёт «почти целиком».
 */
export interface FlowContactBatch {
    get(cmdKey: FlowBatchCmdKey, contactId: number): void;
    update(
        cmdKey: FlowBatchCmdKey,
        contactId: number | string,
        data: Record<string, unknown>,
    ): void;
}

/** Накопительные команды задач (tasks.task.*). */
export interface FlowTaskBatch {
    add(cmdKey: FlowBatchCmdKey, fields: FlowTaskCreateFields): void;
    update(
        cmdKey: FlowBatchCmdKey,
        taskId: number | string,
        fields: FlowTaskUpdateFields,
    ): void;
    complete(cmdKey: FlowBatchCmdKey, taskId: number | string): void;
    commentAdd(
        cmdKey: FlowBatchCmdKey,
        taskId: number | string,
        fields: FlowTaskCommentAddFields,
    ): void;
}

/** Накопительные команды чек-листа задач (task.checklistitem.add). */
export interface FlowChecklistItemBatch {
    add(cmdKey: FlowBatchCmdKey, data: IBXChecklistItemAddRequest): void;
}

/** Накопительные команды таймлайна (crm.timeline.comment.add). */
export interface FlowTimelineBatch {
    addTimelineComment(
        cmdKey: FlowBatchCmdKey,
        data: FlowTimelineComment,
    ): void;
}

/** Накопительные команды универсальных списков (lists.element.*). */
export interface FlowListItemBatch {
    add(cmdKey: FlowBatchCmdKey, dto: FlowListItemAddRequest): void;
    update(cmdKey: FlowBatchCmdKey, dto: FlowListItemUpdateRequest): void;
}

/**
 * Одиночные вызовы вне батча. Имена — `<домен><Метод>` (стиль А0-плана):
 * прямые вызовы флоу не участвуют в $result-чейнах и не трогают
 * batch-аккумулятор (kpi-дедуп на этом стоит — см. KpiListFlowService).
 */
export interface FlowCallDomain {
    /** crm.deal.get — owner-сделка init'а, сделка плейсмента stage-predict. */
    dealGet(
        dealId: number,
        select?: string[],
    ): Promise<FlowCallResult<IBXDeal> | undefined>;

    /** crm.deal.list — активные базовые сделки компании (stage-predict). */
    dealGetList(
        filter: Partial<IBXDeal>,
        select?: string[],
        order?: FlowListOrder<IBXDeal>,
    ): Promise<FlowCallResult<IBXDeal[]> | undefined>;

    /** task.checklistitem.getlist — чек-лист закрываемой задачи (ДО батча). */
    checklistItemGetList(
        data: IBXChecklistItemGetListRequest,
    ): Promise<FlowCallResult<IBXChecklistItem[]> | undefined>;

    /** im.notify.system.add — уведомление о переносе задачи. */
    imNotifySystemAdd(
        data: FlowImNotifySystemAdd,
    ): Promise<FlowCallResult<number | boolean> | undefined>;

    /** lists.element.get — существование KPI-строки по ELEMENT_CODE (дедуп). */
    listItemGet(
        dto: FlowListItemGetRequest,
    ): Promise<FlowCallResult<IBXListItem[]> | undefined>;

    /** crm.lead.userfield.list — волна 1 определений UF-полей лида. */
    leadGetFieldsList(
        filter?: Record<string, unknown>,
        select?: string[],
    ): Promise<FlowCallResult<FlowUserFieldDefinition[]> | undefined>;
}

export interface FlowTransport {
    batch: {
        deal: FlowDealBatch;
        lead: FlowLeadBatch;
        company: FlowCompanyBatch;
        contact: FlowContactBatch;
        task: FlowTaskBatch;
        checklistItem: FlowChecklistItemBatch;
        timeline: FlowTimelineBatch;
        listItem: FlowListItemBatch;
    };
    call: FlowCallDomain;

    /**
     * Отправляет накопленный cmdBatch одним HTTP-вызовом и возвращает ответы
     * ЭТОГО flush'а; пустой cmdBatch — no-op и [] (семантика бэкового
     * `callBatchWithConcurrency(1)` на пустой очереди — хвостовой вызов
     * use-case на это рассчитывает). $result-группы атомарны внутри одного
     * HTTP-вызова; групповой буфер (shared/batch) зовёт flush по чанкам
     * ЦЕЛЫХ групп, а команды, положенные в батч мимо буфера, режет сама
     * реализация — по связкам `$result[...]`, с сохранением порядка (иначе
     * Битрикс молча отбросит всё сверх 50).
     *
     * ОБЯЗАТЕЛЬНО разбирает result_error каждого ответа (halt=false у
     * Битрикса: часть команд исполнена, упавшие видны только здесь) И
     * помечает неотвеченные cmd-ключи синтетической ошибкой
     * {@link FLOW_NO_RESPONSE_ERROR} — во фрейме это единственный след
     * падения команды.
     */
    flush(): Promise<IBitrixBatchResponseResult[]>;

    /**
     * Живая ссылка на накопительный cmdBatch — гигиена группового буфера:
     * при падении flush он вычищает СВОИ материализованные ключи, не трогая
     * чужие (образец — runExclusiveBatch). Опционален, как в IBatchTransport
     * буфера: транспорт/фейк без метода просто выключает гигиену.
     * На бэке это `api.getCmdBatch()`.
     */
    getCmdBatch?(): Record<string, unknown>;
}

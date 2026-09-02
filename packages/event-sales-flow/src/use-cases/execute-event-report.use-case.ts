// Порт бэкового event-report.use-case.ts МИНУС серверное (запись
// PARTIAL_PORTS в diff-back): pbx.init (порты приходят параметрами),
// appSettings.resolve (настройки в FlowSettings), postFlow.dispatch (вместо
// постановки очередей — сборка deferred[]), Redis/WS/статус/socketId —
// долой; порядок оркестрации бэка сохранён: init → guard'ы → queue-этапы →
// endGroup/flush → пост-волны.
import { AppLogger } from '../shared/lib/logger';
import { FlowLogger } from '../ports/flow-logger.port';
import {
    FLOW_NO_RESPONSE_ERROR,
    FlowTransport,
} from '../ports/flow-transport.port';
import { FlowPortalSource } from '../ports/flow-portal.port';
import { DirectCapabilityMap, FlowSettings } from '../ports/flow-settings';
import { EventSalesFlowDto } from '../dto/event-sale-flow/event-sales-flow.dto';
import { EventReportInitService } from '../services/init/event-report-init.service';
import {
    EEventReportFlowStrategy,
    EventReportContext,
} from '../services/context/event-report.context';
import { EventReportEntityFlowService } from '../services/entity/event-report-entity-flow.service';
import {
    DEFAULT_FIELD_POLICY_SETTINGS,
    DEFAULT_STAGE_RULE_SETTINGS,
} from '../services/entity/field-policy';
import {
    DealFlowResult,
    EventReportDealFlowService,
} from '../services/deal/event-report-deal-flow.service';
import {
    ADD_TASK_CMD,
    EventReportTaskFlowService,
    parseAddedTaskId,
} from '../services/task/event-report-task-flow.service';
import { EventReportKpiFlowService } from '../services/kpi-list/event-report-kpi-flow.service';
import { EventReportPostFailService } from '../services/post-fail/event-report-post-fail.service';
import { EventReportLeadRelationService } from '../services/lead/event-report-lead-relation.service';
import { EventReportLeadRequestSyncService } from '../services/lead/event-report-lead-request-sync.service';
import { EventReportReturnToTmcService } from '../services/return-to-tmc/event-report-return-to-tmc.service';
import { EventReportEntityHistoryService } from '../services/history/event-report-entity-history.service';
import {
    ColdHookBatchGroupBuffer,
    IBatchCommandFailure,
    IBitrixBatchResponseResult,
} from '../shared/batch/batch-group-buffer';
import { findBatchResult } from '../shared/bitrix/prepare-batch-results.util';
import { parseCreatedDealId } from '../services/post-flow/side-flow-job.base';

/**
 * Исполнитель event-report flow (порт бэкового
 * `event-report/use-cases/event-report.use-case.ts`, план А2).
 *
 * Шаги — как на бэке:
 *  1. Порты (транспорт/портал/логгер) и настройки приходят ПАРАМЕТРАМИ —
 *     бэковые `PBXService.init(domain)` и `PortalAppSettingsService.resolve`
 *     остаются за швом (браузер: adapters/browser + слепок настроек;
 *     бэк подключит свои).
 *  2. `EventReportInitService.loadContext` — один HTTP-batch:
 *     company/lead, deals по 4 категориям, task, lead, контакты.
 *  3. Сконструировать {@link EventReportContext} (все флаги).
 *  4. Прогнать flow-сервисы (entity → deal → task → kpi → presentation list →
 *     post-fail → lead → return-to-tmc → history) — каждый просто queue'ит
 *     команды в `bitrix.batch.*`.
 *  5. Один финальный `bitrix.flush()` (бэковый
 *     `api.callBatchWithConcurrency(1)`) отправит всё одним HTTP-вызовом
 *     (рассчитываем на ≤50 команд).
 *
 * Отличие от бэка — ДОСЫЛКА (план А4): шаги, на которые у прямого пути нет
 * прав ({@link DirectCapabilityMap}, отсутствие права ≡ запрету), не ставят
 * команды в транспорт, а копятся СЕМАНТИЧЕСКИМИ шагами в `deferred[]` —
 * сервер пересоберёт их из payload конверта (данные не дублируются,
 * серверные kind'ы идемпотентны: KPI-дедуп, jobId `{operationId}:{flow}:{kind}`).
 * Сайд-flow смартов (ЗПР/«Презентации») уходит досылкой ВСЕГДА — на бэке
 * это и были отдельные очереди ПОСЛЕ основного батча (постановку
 * `postFlow.dispatch` заменяет пара шагов `side-flow`).
 */

/** Поток side-flow досылки — значения совпадают с `SideFlowQueueSpec.flow`
 * бэкового координатора (`{operationId}:{flow}:{kind}` в jobId). */
export type SideFlowQueueFlow = 'zpr' | 'pres';

/**
 * Семантический шаг досылки (план А4): НЕ сырые команды — серверный
 * исполнитель пересоберёт работу шага из payload конверта. Discriminated
 * union сериализуем как есть (конверт outbox, А3).
 */
export type DeferredFlowStep =
    | { kind: 'kpi' }
    | { kind: 'pres-deals' }
    | { kind: 'xo-deals' }
    | {
          kind: 'side-flow';
          flow: SideFlowQueueFlow;
          /**
           * id план-задачи, СОЗДАННОЙ основным батчем этого отчёта, — уже
           * прочитан из его ответа (`$result`-механика координатора);
           * null — плана не было либо команда `add_task` не удалась.
           */
          addedTaskId: number | null;
          /**
           * id pres-сделки, СОЗДАННОЙ этим же батчем (`set_pres_deal` /
           * `set_unplanned_pres_deal`) — бэковый координатор передаёт его
           * билдерам сайд-джобов (presDealId || createdPresDealId), и без
           * него досылка потеряла бы связь элемента с только что созданной
           * сделкой; null — сделку этот отчёт не создавал.
           */
          createdPresDealId: number | null;
      }
    | { kind: 'lead-request-sync' }
    | { kind: 'transfer-notify' };

export type DeferredFlowStepKind = DeferredFlowStep['kind'];

/**
 * Cmd-ключ маркера анти-двойного исполнения (план А4, доктрина №1):
 * `task.commentitem.add` с тегом `[evflow:{operationId}]` в задачу события —
 * ПЕРВАЯ команда пишущего батча (ставится, только когда передан
 * `settings.directMarker`; см. DirectExecutionMarker в flow-settings).
 */
export const DIRECT_MARKER_CMD = 'evflow_direct_marker';

/** Вход исполнителя: DTO отчёта + порты + настройки (всё — параметрами). */
export interface ExecuteEventReportInput {
    dto: EventSalesFlowDto;
    transport: FlowTransport;
    portal: FlowPortalSource;
    /** Не передан — штатный AppLogger пакета (console). */
    logger?: FlowLogger;
    /** Не переданы — все права выключены: максимум досылки, ничего лишнего. */
    settings?: FlowSettings;
}

/** Итог исполнения — вход конверта outbox (А3) и досылки (А4/А5). */
export interface EventReportFlowResult {
    /**
     * Полный ответ основного батча = флаши буфера + хвостовой вызов
     * (склейка — как на бэке: взять только один источник значит потерять
     * ответ `add_task` ровно на одной из половин порталов).
     */
    batchResults: IBitrixBatchResponseResult[];
    /**
     * result_error основного батча ПО КОМАНДАМ (halt=0 у Битрикса: часть
     * команд исполнена, упавшие видны только здесь) — форма `{cmd, error}`,
     * как в `getOutcome()` группового буфера. ВСЕ ошибки, включая
     * конвертированные тонким раскроем (их дубликат — в `deferredErrors`).
     */
    errors: IBatchCommandFailure[];
    /**
     * Тонкий раскрой (А4): подмножество `errors` — команды ОПЦИОНАЛЬНЫХ
     * групп, упавшие ACCESS_DENIED и конвертированные в семантические шаги
     * `deferred[]`. Вызывающий (прямой исполнитель) считает провалом
     * обязательной части только `errors` МИНУС `deferredErrors`.
     */
    deferredErrors: IBatchCommandFailure[];
    /** Шаги, не исполненные напрямую, — на досылку серверу. */
    deferred: DeferredFlowStep[];
    /**
     * id план-задачи из ответа ТОГО ЖЕ батча (`findBatchResult(...,
     * ADD_TASK_CMD)` — как в бэковом координаторе); null — не создана
     * либо не прочитан.
     */
    addedTaskId: number | null;
}

/**
 * Гейт прямого пути (план А4): у менеджеров нет доступа к воронкам
 * «Презентации»/«ХО» — их движения уходят досылкой. Гейт в А2 ГРУБЫЙ —
 * deal-композит целиком: внутри зеркального `EventReportDealFlowService`
 * `$result`-связка base → pres → tmc (`$result[set_pres_deal]` пишется в
 * ТМЦ-сделку), и раскроить его по воронкам, не тронув зеркало, нельзя —
 * при любом запрете движения сделок не ставятся вовсе (задача/KPI получают
 * честные null вместо битых `$result`-ссылок), а оба шага уезжают в
 * deferred. Тонкий раскрой (динамическая конверсия упавших ACCESS_DENIED
 * команд в deferred) — А4.
 */
const queueDealFlow = (
    dealFlow: EventReportDealFlowService,
    ctx: EventReportContext,
    capabilities: DirectCapabilityMap,
    deferred: DeferredFlowStep[],
): DealFlowResult => {
    if (
        capabilities.allowPresDealWrites === true &&
        capabilities.allowXoDealWrites === true
    ) {
        return dealFlow.queue(ctx);
    }
    deferred.push({ kind: 'pres-deals' });
    deferred.push({ kind: 'xo-deals' });
    return {
        baseDealId: null,
        newPlanPresDealId: null,
        newUnplannedPresDealId: null,
    };
};

/**
 * result_error всего склеенного ответа по командам — тот же разбор, что в
 * `collect()` группового буфера (пустой PHP-массив сериализуется как `[]`
 * и означает «ошибок нет»), но по ОБОИМ источникам склейки: буфер разбирает
 * только свои флаши, хвостовой вызов остаётся на исполнителе.
 */
const collectBatchErrors = (
    results: IBitrixBatchResponseResult[],
): IBatchCommandFailure[] => {
    const errors: IBatchCommandFailure[] = [];
    for (const chunkResult of results) {
        const chunkErrors = chunkResult?.result_error;
        if (chunkErrors && !Array.isArray(chunkErrors)) {
            for (const [cmd, error] of Object.entries(chunkErrors)) {
                errors.push({ cmd, error });
            }
        }
    }
    return errors;
};

/**
 * Тонкий раскрой (А4): соответствие cmd-ключей ОПЦИОНАЛЬНЫХ групп их
 * deferred-представлению. Ключи — фактические имена команд flow-сервисов
 * (sales-presentation/xo/base/tmc-deal, deal-move-count, kpi-list-flow);
 * обязательные группы (entity/task/history/post-fail/lead-relation/
 * return-to-tmc и сам маркер) в карту НЕ входят — их падение остаётся
 * честной ошибкой прямого пути.
 *
 * База/ТМЦ/счётчик переносов собственного kind'а не имеют: их
 * представление — ПАРА шагов, ровно как в грубом гейте `queueDealFlow`
 * («при любом запрете движения сделок оба шага уезжают в deferred»).
 */
const OPTIONAL_GROUP_DEFERRED_KINDS: ReadonlyArray<{
    matches: (cmd: string) => boolean;
    kinds: ReadonlyArray<'kpi' | 'pres-deals' | 'xo-deals'>;
}> = [
    {
        // KPI-записи (KpiListFlowService поверх группового буфера).
        matches: cmd =>
            cmd.startsWith('add_list_item_') ||
            cmd.startsWith('upd_list_item_'),
        kinds: ['kpi'],
    },
    {
        // Сделки воронки «Презентации» (sales-presentation-deal.service).
        matches: cmd =>
            cmd === 'set_pres_deal' ||
            cmd === 'set_unplanned_pres_deal' ||
            cmd.startsWith('update_pres_deal_') ||
            cmd.startsWith('cancel_pres_deal_'),
        kinds: ['pres-deals'],
    },
    {
        // Сделки воронки «ХО» (sales-xo-deal.service).
        matches: cmd => cmd.startsWith('update_xo_deal_'),
        kinds: ['xo-deals'],
    },
    {
        // Остальной deal-композит: база, ТМЦ, счётчик переносов.
        matches: cmd =>
            cmd === 'set_base_deal' ||
            cmd.startsWith('update_base_deal_') ||
            cmd.startsWith('update_tmc_to_pres_') ||
            cmd.startsWith('close_tmc_') ||
            cmd.startsWith('move_count_deal_'),
        kinds: ['pres-deals', 'xo-deals'],
    },
];

/**
 * Deferred-представление команды опциональной группы; null — команда
 * обязательная (или неизвестная), конверсии не подлежит.
 */
export const resolveOptionalGroupDeferredKinds = (
    cmd: string,
): ReadonlyArray<'kpi' | 'pres-deals' | 'xo-deals'> | null =>
    OPTIONAL_GROUP_DEFERRED_KINDS.find(group => group.matches(cmd))?.kinds ??
    null;

/**
 * Ошибки команд, которые тонкий раскрой (А4) вправе конвертировать в
 * досылку — если у команды есть deferred-представление:
 *  - `ACCESS_DENIED` — прав менеджера на шаг не хватило (штатная причина
 *    гейтов прямого пути);
 *  - {@link FLOW_NO_RESPONSE_ERROR} — команда осталась без ответа батча.
 *    Во фрейме это ЛЮБОЕ падение команды: b24jssdk выбрасывает упавшие из
 *    ответа, и отличить ACCESS_DENIED от прочего нечем. Для опциональной
 *    группы «не знаем причину» разрешается в досылку: сервер шаг
 *    переисполнит идемпотентно, а молча потерянный хвост не вернёт никто.
 *    Для ОБЯЗАТЕЛЬНОЙ группы конверсии нет — там это честный провал.
 */
const isConvertibleFailure = (failure: IBatchCommandFailure): boolean =>
    failure.error?.error === 'ACCESS_DENIED' ||
    failure.error?.error === FLOW_NO_RESPONSE_ERROR;

/**
 * Права, которых у исполнителя НЕТ ни при каких настройках: имя обещает
 * работу, которой в пакете не существует. Включённый такой флаг —
 * программная ошибка сборщика настроек, и молчать о ней нельзя: раньше
 * `allowSmartWrites: true` писал warn В СЕРЕДИНЕ прогона (батч уже ушёл) и
 * ничего не менял — включённый флаг тихо не делал обещанного.
 *
 * Прямая запись смартов = серверные element-writer'ы (ЗПР/«Презентации»):
 * их в пакете нет, side-flow уходит досылкой ВСЕГДА. Появится писатель —
 * флаг уедет отсюда вместе с реализацией.
 */
const UNSUPPORTED_CAPABILITIES: ReadonlyArray<{
    capability: string;
    why: string;
}> = [
    {
        capability: 'allowSmartWrites',
        why:
            'прямая запись смартов пакетом не реализована (element-writer’ы ' +
            'ЗПР/«Презентации» серверные) — side-flow исполняет только досылка',
    },
];

/**
 * Проверка входа ДО первого обращения к Битриксу: включённое право без
 * реализации — жёсткий отказ, а не тихий warn. Экспортируется, чтобы
 * сборщик настроек мог отказать ЕЩЁ РАНЬШЕ — до отметки «батч мог уйти».
 */
export const assertSupportedCapabilities = (
    capabilities: DirectCapabilityMap,
): void => {
    for (const { capability, why } of UNSUPPORTED_CAPABILITIES) {
        if (capabilities[capability] === true) {
            throw new Error(
                `[event-sales-flow] право «${capability}» включено, но не поддержано: ${why}`,
            );
        }
    }
};

export async function executeEventReportFlow(
    input: ExecuteEventReportInput,
): Promise<EventReportFlowResult> {
    const { dto, transport: bitrix, portal, settings = {} } = input;
    const logger = input.logger ?? new AppLogger('ExecuteEventReportFlow');
    const capabilities = settings.capabilities ?? {};
    const deferred: DeferredFlowStep[] = [];

    // Раньше единственного чтения и единственной записи: включённое право
    // без реализации роняет прогон здесь, не тронув ни Битрикс, ни конверт.
    assertSupportedCapabilities(capabilities);

    const init = await new EventReportInitService().loadContext(
        dto,
        bitrix,
        portal,
    );
    const ctx = new EventReportContext(dto, portal, init);
    // Классы поведения полей карточки — одним чтением настроек на отчёт:
    // модель полей собирается шесть раз (компания, лид, 4 роли сделок).
    // Настройки не переданы — дефолты СХЕМЫ (бэковая ветка «настройки
    // недоступны»: упавший источник настроек не повод врать в карточку).
    ctx.setFieldPolicySettings(
        settings.fieldPolicySettings ?? DEFAULT_FIELD_POLICY_SETTINGS,
    );
    // Правила стадий (бэковый resolveStageRuleSettings): не переданы —
    // дефолт СХЕМЫ, исключение «Доработка всегда» выключено.
    ctx.setStageRuleSettings(
        settings.stageRuleSettings ?? DEFAULT_STAGE_RULE_SETTINGS,
    );

    const entityFlow = new EventReportEntityFlowService(bitrix, portal);
    const dealFlow = new EventReportDealFlowService(bitrix, portal);
    const taskFlow = new EventReportTaskFlowService(
        bitrix,
        portal,
        // Гейт чек-листов задач (`task_checklist_enabled`, по умолчанию
        // ВЫКЛ — бэковый isTaskChecklistEnabled): отчёт важнее чек-листа.
        Boolean(settings.withTaskChecklist),
    );
    const kpiFlow = new EventReportKpiFlowService(bitrix, portal);
    const postFail = new EventReportPostFailService(bitrix, portal);
    const leadRelation = new EventReportLeadRelationService(bitrix, portal);
    const returnToTmc = new EventReportReturnToTmcService(bitrix, portal);
    const history = new EventReportEntityHistoryService(bitrix);

    // KPI использует тот же ColdHookBatchGroupBuffer (контракт KpiListFlowService).
    // По факту мы тут одна группа = весь endpoint; вся работа упадёт в один HTTP.
    const buffer = new ColdHookBatchGroupBuffer(bitrix);

    // Чек-лист ЗАКРЫВАЕМОЙ задачи читается ДО всех flow-сервисов:
    // его итог уезжает в историю карточки, а её собирает entity-flow —
    // первый в цепочке. Один прямой вызов, batch не трогается.
    await taskFlow.readClosingChecklist(ctx);

    // Маркер анти-двойного исполнения (А4, доктрина №1): ПЕРВОЙ командой
    // пишущего батча — комментарий-тег [evflow:{operationId}] в задачу
    // события. Ставится ДО первого flow-сервиса: читающий батч init'а уже
    // ушёл своим flush'ем, cmdBatch пуст, и этот cmd-ключ гарантированно
    // возглавляет пишущий батч (halt=0: отправился батч — маркер записан).
    // Прямой исполнитель перед запуском читает комментарии задачи: тег
    // найден — пишущий батч этой операции уже уходил, повторного
    // исполнения не будет (duplicate-marker). package-adapted: бэковый
    // use-case маркера не пишет, без settings.directMarker состав бэковый.
    if (settings.directMarker) {
        bitrix.batch.task.commentAdd(
            DIRECT_MARKER_CMD,
            settings.directMarker.taskId,
            {
                AUTHOR_ID: settings.directMarker.authorId,
                POST_MESSAGE: settings.directMarker.text,
            },
        );
    }

    // dealFlow сам выключается для leadOnly (ctx.isDealFlow), возврат в
    // ТМЦ — тоже про движение сделок, поэтому гейтится стратегией явно.
    entityFlow.queue(ctx);
    const deals = queueDealFlow(dealFlow, ctx, capabilities, deferred);
    taskFlow.queue(ctx, deals);
    // await: дедуп финалов/уникальных читает существующие элементы
    // прямыми вызовами (batch-аккумулятор не трогается — см. flowDedup).
    // Гейт прямого пути: у менеджеров нет доступа к KPI-списку — записи и
    // дедуп уходят досылкой. Возврат бэкового queue (kpiRows — адреса
    // обратных ссылок смартов) здесь не нужен и в разрешённой ветке:
    // side-flow всегда досылкой, сервер пересоберёт kpiRowRefs из payload
    // конверта и ответа СВОЕГО батча.
    if (capabilities.allowKpiWrites === true) {
        await kpiFlow.queue(ctx, deals, buffer);
    } else {
        deferred.push({ kind: 'kpi' });
    }
    /*
     * Список «ОП Презентации» НЕ пишем: его ведёт легаси-хук
     * (Laravel), и там он работает — решение владельца 27.08.
     * Две записи об одной презентации из двух систем были бы
     * хуже отсутствия одной. Новый контур ведёт СМАРТ
     * «Презентации» (presentation-flow), он и заменит список.
     */
    postFail.queue(ctx);
    leadRelation.queue(ctx);
    if (ctx.strategy !== EEventReportFlowStrategy.LEAD_ONLY) {
        returnToTmc.queue(ctx);
    }
    history.queue(ctx);

    // Коммитим KPI группу + flush'им буфер.
    //
    // ВАЖНО про источники ответа: cmdBatch ОДИН на инстанс Битрикса, и
    // `buffer.flush()` шлёт его целиком — вместе с командами, которые
    // flow-сервисы положили напрямую в `bitrix.batch.*` (в том числе
    // `add_task`). Поэтому хвостовой `flush()` почти всегда работает на УЖЕ
    // пустой очереди и возвращает []: ответы лежат в `buffer.getResults()`.
    // Он остаётся нужен для случая, когда буфер пуст (flush буфера — no-op)
    // и всё уезжает только этим вызовом: KPI-команд может не быть вовсе
    // (портал без KPI-списка или право не выдано), и тогда весь cmdBatch
    // уходит именно тут.
    // ОБА пути рабочие, и оба покрыты event-report-use-case-batch-seam.spec.
    await buffer.endGroup();
    await buffer.flush();
    const results = await bitrix.flush();
    // Полный ответ батча = флаши буфера + хвостовой вызов. Координатор
    // сайд-очередей читает отсюда id созданной план-задачи, и взять
    // только `results` значило бы не найти её никогда.
    const batchResults = [...buffer.getResults(), ...results];

    // Финал (продажа/отказ) двигает статусы связанных заявок/лидов и
    // дописывает историю обработки — отдельными волнами ПОСЛЕ основного
    // батча (multiple-история требует свежих значений лида).
    // Формат crm-значений (`to_sale_deal`) зависит от фактических
    // привязок поля на портале — определения приходят в настройках
    // (`leadUfDefinitions`, бэковый leadLinkDefinitions), иначе связь
    // продажи молча не сохранится. Право не выдано — волны уходят досылкой
    // (флаг «на потом» по плану А4).
    if (capabilities.allowLeadRequestSync === true) {
        const leadRequestSync = new EventReportLeadRequestSyncService(
            bitrix,
            portal,
            settings.leadUfDefinitions ?? {},
        );
        await leadRequestSync.run(ctx);
    } else {
        deferred.push({ kind: 'lead-request-sync' });
    }

    // Перенос: сообщение ответственному — ПОСЛЕ основного батча
    // (im.notify не батчится), ошибка отправки гасится внутри и отчёт
    // не роняет (todo2508-02 №4б). Право не выдано — досылкой; был ли
    // перенос вообще, решает серверный исполнитель по payload (гейт
    // внутри notifyTransfer), шаг идемпотентен.
    if (capabilities.allowTransferNotify === true) {
        await taskFlow.notifyTransfer(ctx);
    } else {
        deferred.push({ kind: 'transfer-notify' });
    }

    // Считаем по СКЛЕЕННОМУ ответу — то есть по обоим источникам сразу.
    // Прежняя формула складывала число КОМАНД (reduce по `results`) с
    // числом ЧАНКОВ (`buffer.getResults().length`) — разные единицы, и на
    // штатном пути (`results` пуст, см. выше) наружу уезжала единица
    // вместо реального количества команд.
    const commandsCount = batchResults.reduce(
        (sum, chunk) => sum + Object.keys(chunk.result ?? {}).length,
        0,
    );
    const errors = collectBatchErrors(batchResults);

    // Тонкий раскрой (А4): падение команды опциональной группы, у которой
    // есть deferred-представление, конвертируется в семантический шаг
    // досылки и НЕ роняет прямой путь; порядок групп «обязательное →
    // опциональное» даёт halt=0. Конвертируются ACCESS_DENIED и «команда
    // без ответа» (во фрейме — единственная форма падения, см.
    // isConvertibleFailure). Прочие ошибки и ЛЮБЫЕ падения обязательных
    // команд конверсии не получают — их судит вызывающий по `errors` минус
    // `deferredErrors`. Шаг не дублируется, если его kind уже лежит в
    // досылке (право не выдано — шаг добавлен гейтом).
    const deferredErrors: IBatchCommandFailure[] = [];
    for (const failure of errors) {
        if (!isConvertibleFailure(failure)) {
            continue;
        }
        const kinds = resolveOptionalGroupDeferredKinds(failure.cmd);
        if (!kinds) {
            continue;
        }
        deferredErrors.push(failure);
        for (const kind of kinds) {
            if (!deferred.some(step => step.kind === kind)) {
                deferred.push({ kind });
            }
        }
    }

    // Сайд-flow (ЗПР и «Презентации») — ВСЕГДА досылкой: на бэке это
    // отдельные очереди ПОСЛЕ основного батча (отчёт уже «предварительно
    // готов», элементы смартов доезжают асинхронно и не удлиняют основной
    // flow — решение владельца, 2508). Сами pres-сделки уже отработали в
    // основном батче — смарт их НЕ заменяет и не отменяет. id только что
    // созданной план-задачи читается из `batchResults` — ответа того же
    // батча, без единого лишнего запроса (механика бэкового координатора);
    // остальное (анкеты, kpiRowRefs, реальный id pres-сделки) серверный
    // исполнитель пересоберёт из payload конверта и ответа СВОЕГО батча.
    const addedTaskId = parseAddedTaskId(
        findBatchResult(batchResults, ADD_TASK_CMD),
    );
    // Зеркало координатора (post-flow.service:107-113): id pres-сделки,
    // созданной этим же батчем, читается из его ответа и едет в шаги —
    // серверные билдеры ждут его как presDealId || createdPresDealId.
    const createdPresDealId =
        parseCreatedDealId(findBatchResult(batchResults, 'set_pres_deal')) ??
        parseCreatedDealId(
            findBatchResult(batchResults, 'set_unplanned_pres_deal'),
        );
    deferred.push({
        kind: 'side-flow',
        flow: 'zpr',
        addedTaskId,
        createdPresDealId,
    });
    deferred.push({
        kind: 'side-flow',
        flow: 'pres',
        addedTaskId,
        createdPresDealId,
    });

    logger.log(
        `event-report executed: entity=${ctx.entityType}:${ctx.entityId}, strategy=${ctx.strategy}, commands=${commandsCount}` +
            (deferred.length
                ? `, deferred=${deferred.map(step => step.kind).join(',')}`
                : ''),
    );
    return {
        batchResults,
        errors,
        deferredErrors,
        deferred,
        addedTaskId,
    };
}

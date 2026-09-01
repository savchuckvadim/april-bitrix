import {
    BXCompany,
    BXDeal,
    BXLead,
    Placement,
    PlacementCallCard,
} from '@workspace/bx';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { IBXTask } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import {
    Bitrix,
    flattenBatchResults,
    type BitrixService,
} from '@workspace/bitrix';
import { APP_FROM_ENUM } from '../../model/slice/AppSlice';
import {
    ETaskLinkType,
    getCrmLinksFromRaw,
} from '@/modules/entities/EventTask/lib/task-links';
import { EVENT_TASK_SELECT } from '@/modules/entities/EventTask/lib/task-select';
import { resolveTaskPrimaryContext } from '@/modules/entities/EventTask/lib/task-primary-context';

export const getDisplayMode = (
    placement: Placement | PlacementCallCard,
): APP_DISPLAY_MODE => {
    let result = APP_DISPLAY_MODE.PUBLIC;
    if (placement.placement) {
        const type = placement.placement;
        if (type.includes('DETAIL')) result = APP_DISPLAY_MODE.ENTITY_CARD;
        if (type.includes('TASK')) result = APP_DISPLAY_MODE.TASK;
        if (type.includes('ACTIVITY')) result = APP_DISPLAY_MODE.TIMELINE;
        if (type.includes('CALL_CARD')) result = APP_DISPLAY_MODE.CALL_CARD;
    }
    return result;
};

/**
 * Подгонять ли высоту фрейма под контент (`BX24.fitWindow`).
 *
 * Только вкладки карточки (`*_DETAIL_TAB`): там приложение живёт в блоке
 * фиксированной высоты и без подгонки получает скролл внутри скролла.
 *
 * Встройка таймлайна (`*_DETAIL_ACTIVITY`) сюда НЕ попадает — и это главное:
 * там приложение занимает экран целиком, а fitWindow схлопнул бы его до
 * высоты контента. Проверяем именно `DETAIL_TAB`, а не «DETAIL и не ACTIVITY»:
 * так правило читается однозначно и не сломается о новую встройку с DETAIL
 * в названии.
 */
/**
 * Встройки, где высоту блока задаём МЫ — подгонкой под контент.
 *
 * Вкладка карточки CRM и вкладка задачи устроены одинаково: приложению дан
 * блок внутри чужой страницы, и его высоту нужно сообщить наружу, иначе
 * получается скролл внутри скролла.
 *
 * `*_DETAIL_ACTIVITY` сюда НЕ входит: там приложение занимает экран целиком,
 * и подгонка схлопнула бы его до высоты контента.
 */
const SELF_SIZED_PLACEMENTS = ['DETAIL_TAB', 'TASK'] as const;

export const shouldFitWindow = (
    placement: Placement | PlacementCallCard | null | undefined,
): boolean => {
    const type = placement?.placement;
    if (!type) return false;
    return SELF_SIZED_PLACEMENTS.some(part => type.includes(part));
};

export type EntitiesFromPlacement = {
    currentCompany: BXCompany | null;
    currentDeal: BXDeal | null;
    currentTask: IBXTask | null;
    currentLead: BXLead | null;
    from: APP_FROM_ENUM;
};

/**
 * Ключи команд батча сущностей плейсмента. На ключ сделки ссылается
 * `$result`-подстановка компании, поэтому имена — часть протокола, а не
 * косметика.
 */
const PLACEMENT_CMD = {
    DEAL: 'get_deal',
    COMPANY: 'get_company',
    LEAD: 'get_lead',
} as const;

/**
 * COMPANY_ID из ответа `get_deal` ТОЙ ЖЕ пачки. Подстановку делает сервер
 * Битрикса при обработке batch: команды выполняются по порядку, и вторая
 * видит результат первой. Работает в обоих транспортах:
 *  - во фрейме b24jssdk сериализует параметры через qs (токен уходит
 *    URL-энкоженным — та же форма, что у PHP CRest из официальной доки batch);
 *  - в dev-режиме BitrixBatchBackApiHelper строит cmd-строки без энкода
 *    (каноничная webhook-форма) и шлёт всю пачку одним REST `batch` — обе
 *    наши команды заведомо в одном чанке (≤50), порядок ключей сохранён.
 * У сделки без компании COMPANY_ID = 0 → `crm.company.get?ID=0` честно падает
 * на сервере, но с halt=0 не роняет пачку — ключ просто отсутствует в ответе.
 */
const DEAL_COMPANY_ID_REF = `$result[${PLACEMENT_CMD.DEAL}][COMPANY_ID]`;

/** Что нужно достать батчем; `dealId` сам дотягивает компанию по `$result`. */
type PlacementBatchPlan = {
    dealId?: number;
    companyId?: number;
    leadId?: number;
};

type PlacementBatchEntities = {
    deal: BXDeal | null;
    company: BXCompany | null;
    lead: BXLead | null;
};

const EMPTY_BATCH_ENTITIES: PlacementBatchEntities = {
    deal: null,
    company: null,
    lead: null,
};

/**
 * Значение команды батча → сущность. Оба транспорта отдают per-command
 * значения уже развёрнутыми (сам объект сделки/компании/лида), но в
 * batch-ответах встречается и конверт `{ result }` (см. toListItemPage в
 * @workspace/bitrix) — разбираем обе формы. Упавшая команда (halt=0) в ответ
 * не попадает вовсе; всё остальное «не-объектное» — битый ответ → null.
 */
const unwrapBatchEntity = <T>(value: unknown): T | null => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return null;
    }
    if ('result' in value) {
        const inner = (value as { result?: unknown }).result;
        if (!inner || typeof inner !== 'object' || Array.isArray(inner)) {
            return null;
        }
        return inner as T;
    }
    return value as T;
};

/**
 * Сущности плейсмента ОДНИМ batch-запросом вместо 2–3 последовательных —
 * единственное ускорение самого сплэша: каждый срезанный раунд-трип к
 * Битриксу виден на старте глазами.
 *
 * Правила общего `cmdBatch` (мутируемое поле синглтона BitrixService):
 *  - наполняем и отправляем СИНХРОННО, без await между `batch.*` и
 *    `callBatch()` — окно для чужих команд не оставляем (в этот момент бута
 *    параллельных батчей нет: история грузится сильно позже);
 *  - перед наполнением выкидываем СВОИ ключи из cmdBatch: упавший callBatch
 *    очищает его только после успешного await, а addCmdBatchType молча
 *    не перезаписывает существующий ключ — без зачистки повтор (⟳) уехал бы
 *    со вчерашними параметрами.
 */
const fetchPlacementEntitiesBatch = async (
    bitrix: BitrixService,
    plan: PlacementBatchPlan,
): Promise<PlacementBatchEntities> => {
    const wantDeal = Number.isFinite(plan.dealId) && Number(plan.dealId) > 0;
    const wantCompany =
        !wantDeal &&
        Number.isFinite(plan.companyId) &&
        Number(plan.companyId) > 0;
    const wantLead = Number.isFinite(plan.leadId) && Number(plan.leadId) > 0;

    // Пустая пачка — не запрос: b24jssdk кидает JSSDK_BATCH_EMPTY, а нам
    // и без него отдавать нечего. Совпадает со старым fallback'ом (null'ы).
    if (!wantDeal && !wantCompany && !wantLead) return EMPTY_BATCH_ENTITIES;

    // getCmdBatch() отдаёт живую ссылку на cmdBatch — чистим только свои ключи.
    const pending = bitrix.api.getCmdBatch() as Record<string, unknown>;
    for (const cmd of Object.values(PLACEMENT_CMD)) delete pending[cmd];

    // batch.*.get — async только по сигнатуре: команда ложится в cmdBatch
    // синхронно, до первого await (тот же паттерн, что в HistoryListHelper).
    if (wantDeal) {
        bitrix.batch.deal.get(PLACEMENT_CMD.DEAL, Number(plan.dealId));
        bitrix.batch.company.get(PLACEMENT_CMD.COMPANY, DEAL_COMPANY_ID_REF);
    } else if (wantCompany) {
        bitrix.batch.company.get(PLACEMENT_CMD.COMPANY, Number(plan.companyId));
    }
    if (wantLead) {
        bitrix.batch.lead.get(PLACEMENT_CMD.LEAD, Number(plan.leadId));
    }

    // $result-чейнинг живёт ТОЛЬКО в callBatch (объект команд);
    // callBatchByChunk перекладывает команды в массив и рвёт ссылки по ключам.
    const raw = await bitrix.api.callBatch();
    const flat = flattenBatchResults(raw);

    return {
        deal: unwrapBatchEntity<BXDeal>(flat[PLACEMENT_CMD.DEAL]),
        company: unwrapBatchEntity<BXCompany>(flat[PLACEMENT_CMD.COMPANY]),
        lead: unwrapBatchEntity<BXLead>(flat[PLACEMENT_CMD.LEAD]),
    };
};

/**
 * Resolve the CRM entities (company / deal / task / lead) for the current Bitrix
 * placement using the @workspace/bitrix domain services.
 *
 * Никаких поддельных placement'ов: наружу уходят честные сущности + `from`,
 * а бэк получает контекст явным `EvFlowContextDto` (build-flow-payload).
 * Сделка и задача без компании — легальные контексты, не ошибка.
 */
export const getEntitiesFromPlacement = async (
    placement: Placement | PlacementCallCard,
    domain: string,
): Promise<EntitiesFromPlacement> => {
    const result: EntitiesFromPlacement = {
        currentCompany: null,
        currentDeal: null,
        currentTask: null,
        currentLead: null,
        from: APP_FROM_ENUM.COMPANY,
    };
    let from = APP_FROM_ENUM.COMPANY;

    try {
        const bitrix = Bitrix.getService();
        const type = placement?.placement;
        const options = (placement as Placement)?.options as any;
        if (!bitrix || !type || !options) return result;

        if (type.includes('DEAL')) {
            // Сделка + её компания — одним батчем: company.get цепляется к
            // COMPANY_ID сделки через $result. Сделка без компании — как и
            // раньше, легальный контекст: company остаётся null, не ошибка.
            const { deal, company } = await fetchPlacementEntitiesBatch(
                bitrix,
                { dealId: Number(options.ID) },
            );
            result.currentDeal = deal;
            result.currentCompany = company;
            from = APP_FROM_ENUM.DEAL;
        } else if (type.includes('COMPANY')) {
            result.currentCompany = (await bitrix.company.get(
                Number(options.ID),
            )) as unknown as BXCompany;
            from = APP_FROM_ENUM.COMPANY;
        } else if (type.includes('TASK')) {
            const taskId = options.taskId ?? options.TASK_ID;
            const taskResponse = await bitrix.task.get(
                taskId,
                EVENT_TASK_SELECT,
            );
            const currentTask = taskResponse?.result
                ?.task as unknown as IBXTask;
            result.currentTask = currentTask;

            // Приоритетная сущность задачи: компания > сделка > лид.
            // Работаем «как будто в ней», но в рамках текущей задачи.
            // task.get остаётся первым — без него привязки неизвестны, зато
            // вся вторая ступень (company | deal→company | lead) — один батч.
            const links = getCrmLinksFromRaw(
                (currentTask as { ufCrmTask?: string[] } | null)?.ufCrmTask,
            );
            const { primary } = resolveTaskPrimaryContext(links);
            if (primary?.type === ETaskLinkType.COMPANY) {
                const { company } = await fetchPlacementEntitiesBatch(bitrix, {
                    companyId: primary.id,
                });
                result.currentCompany = company;
                from = APP_FROM_ENUM.COMPANY;
            } else if (primary?.type === ETaskLinkType.DEAL) {
                const { deal, company } = await fetchPlacementEntitiesBatch(
                    bitrix,
                    { dealId: primary.id },
                );
                result.currentDeal = deal;
                result.currentCompany = company;
                from = APP_FROM_ENUM.DEAL;
            } else if (primary?.type === ETaskLinkType.LEAD) {
                const { lead } = await fetchPlacementEntitiesBatch(bitrix, {
                    leadId: primary.id,
                });
                result.currentLead = lead;
                from = APP_FROM_ENUM.LEAD;
            }
            // from = APP_FROM_ENUM.TASK
        } else if (type.includes('CALL_CARD')) {
            const callOptions = options;
            let companyId: number | undefined;
            if (
                callOptions.CRM_ENTITY_TYPE === 'COMPANY' &&
                callOptions.CRM_ENTITY_ID
            ) {
                companyId = Number(callOptions.CRM_ENTITY_ID);
            }
            if (!companyId && Array.isArray(callOptions.CRM_BINDINGS)) {
                const bind = callOptions.CRM_BINDINGS.find(
                    (b: any) => b.ENTITY_TYPE === 'COMPANY',
                );
                if (bind?.ENTITY_ID) companyId = Number(bind.ENTITY_ID);
            }
            if (companyId) {
                result.currentCompany = (await bitrix.company.get(
                    companyId,
                )) as unknown as BXCompany;
                from = APP_FROM_ENUM.COMPANY;
            }
            // from = CALL_CARD, а не COMPANY: карточка звонка может быть
            // привязана к компании, но открыты мы всё равно из звонка —
            // от этого зависит, какие сигналы искать (см. duplicate-context).
            // from = APP_FROM_ENUM.CALL_CARD
        } else if (type.includes('LEAD')) {
            result.currentLead = (await bitrix.lead.get(Number(options.ID)))
                ?.result as unknown as BXLead;
            from = APP_FROM_ENUM.LEAD;
        }
        result.from = from;
        return result;
    } catch (error) {
        console.error('getEntitiesFromPlacement error', error);
        return result;
    }
};

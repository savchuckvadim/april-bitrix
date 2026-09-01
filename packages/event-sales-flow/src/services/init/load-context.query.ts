import { FlowTransport as BitrixService } from '../../ports/flow-transport.port';
import { FlowPortalSource as PortalModel } from '../../ports/flow-portal.port';
import { FlowLogger } from '../../ports/flow-logger.port';
import { IBXDeal } from '../../types/bitrix-entities.type';
import { EventSalesFlowDto } from '../../dto/event-sale-flow/event-sales-flow.dto';
import {
    EEventReportEntityType,
    EventReportEntityType,
} from './event-report-init.types';
import {
    buildDealListSelect,
    collectOwnerLeadIds,
    collectOwnerLinkedDealIds,
    extractTaskDealIds,
    IEventReportInitReadPlan,
    resolveEntity,
    toId,
} from './resolve-context';

/**
 * Сборка ЧИТАЮЩЕГО батча init-фазы — I/O-половина санкционированного планом
 * А2 раскола бэкового `event-report-init.service.ts` (чистый резолв — в
 * `resolve-context.ts`, фасад с бэковой сигнатурой `loadContext` — в
 * `event-report-init.service.ts`).
 *
 * Команды и их cmd-ключи — те же, что на бэке (на ключи смотрит
 * `resolveInitContext` через плоский ответ): get_company / get_lead_entity /
 * list_deals / list_deals_by_lead / get_owner_lead / get_dto_lead /
 * get_report_contact / get_plan_contact + условное чтение сделки-владельца
 * ДО батча (`call.dealGet`). Отправку батча функции НЕ делают — flush
 * остаётся за вызывающим (фасад `loadContext`; прямой путь А4 сможет
 * дописать в тот же батч свои чтения-маркеры перед отправкой).
 */

/**
 * Сделка-владелец читается до общего батча: из её полей строится
 * остальная загрузка. Ошибка не роняет отчёт — контекст соберётся из
 * DTO (warning в лог, сущность недогружена).
 */
export const fetchOwnerDeal = async (
    bitrix: BitrixService,
    dealId: number,
    logger: FlowLogger,
): Promise<IBXDeal | null> => {
    try {
        // callType отдаёт обёртку IBitrixResponse — сущность в .result.
        const response = await bitrix.call.dealGet(dealId);
        return response?.result ?? null;
    } catch (error) {
        logger.warn(
            `owner deal load failed: deal ${dealId}: ${String(error)}`,
        );
        return null;
    }
};

/**
 * Грузит все активные сделки по entity: company — все сделки компании,
 * deal — владелец + переданные extraDealIds (ссылки задачи и to_*-полей),
 * lead — сделки лида. Закрытые отсекает `filterActiveDeals` после.
 */
export const queueActiveDealsLoad = (
    bitrix: BitrixService,
    entityId: number,
    entityType: EventReportEntityType,
    select: string[],
    extraDealIds: number[] = [],
): void => {
    const filter: Partial<IBXDeal> = {};
    if (entityType === EEventReportEntityType.COMPANY) {
        (filter as Record<string, unknown>).COMPANY_ID = entityId;
    } else if (entityType === EEventReportEntityType.DEAL) {
        // Массив в значении фильтра = IN.
        (filter as Record<string, unknown>).ID = [
            entityId,
            ...extraDealIds.filter(id => id !== entityId),
        ];
    } else {
        (filter as Record<string, unknown>).LEAD_ID = entityId;
    }
    bitrix.batch.deal.getList('list_deals', filter, select);
};

/**
 * Резолвит якорь события и ставит в накопительный батч ВСЕ чтения init-фазы
 * (строки бэкового `loadContext` до отправки батча — построчно). Возвращает
 * {@link IEventReportInitReadPlan} — входы для `resolveInitContext` после
 * flush'а.
 */
export const queueInitReads = async (
    dto: EventSalesFlowDto,
    bitrix: BitrixService,
    portal: PortalModel,
    logger: FlowLogger,
): Promise<IEventReportInitReadPlan> => {
    const { entityId, entityType } = resolveEntity(dto);
    if (!entityId) {
        throw new Error(
            'EventReportInit: cannot resolve entityId from context/placement/lead',
        );
    }

    // Сделка запуска читается ДО общего батча: из её полей строится
    // остальная загрузка — лиды (LEAD_ID + deal_from_lead_id +
    // deal_joined_leads), связанные воронки (to_*-ссылки) и сделки тех
    // же лидов (там живёт ХО без компании).
    //
    // Читаем её и при якоре-компании (context.dealId): наследование
    // L_*-привязок в новую задачу и sync заявок берут рёбра из
    // ctx.ownerDeal — без этого лид сделки терялся, как только у
    // клиента появлялась компания и она становилась якорем.
    const launchDealId =
        entityType === EEventReportEntityType.DEAL
            ? entityId
            : toId(dto.context?.dealId);
    const ownerDeal = launchDealId
        ? await fetchOwnerDeal(bitrix, launchDealId, logger)
        : null;
    const ownerLeadIds = collectOwnerLeadIds(ownerDeal, portal);

    const dtoLeadId = dto.lead?.ID ? Number(dto.lead.ID) : null;
    // Select один на все чтения сделок: накопительные поля обязаны
    // приехать, иначе запись их затрёт (см. DEAL_ACCUMULATED_FIELD_CODES).
    const dealSelect = buildDealListSelect(portal);

    // === Фаза 1: владелец (company/lead/deal) + active deals + task + DTO lead ===
    if (entityType === EEventReportEntityType.COMPANY) {
        bitrix.batch.company.get('get_company', entityId);
        queueActiveDealsLoad(bitrix, entityId, entityType, dealSelect);
    } else if (entityType === EEventReportEntityType.DEAL) {
        // У владельца-сделки нет «всех сделок компании» — добираем по
        // D_-ссылкам задачи (pres/tmc), to_*-ссылкам самой сделки и по
        // общим лидам, иначе отчёт создал бы дубли вместо обновления.
        queueActiveDealsLoad(
            bitrix,
            entityId,
            entityType,
            dealSelect,
            [
                ...extractTaskDealIds(dto),
                ...collectOwnerLinkedDealIds(ownerDeal),
            ],
        );
        if (ownerLeadIds.length) {
            bitrix.batch.deal.getList(
                'list_deals_by_lead',
                { LEAD_ID: ownerLeadIds } as never,
                dealSelect,
            );
        }
        const primaryLeadId = ownerLeadIds[0];
        if (primaryLeadId && primaryLeadId !== dtoLeadId) {
            bitrix.batch.lead.get('get_owner_lead', primaryLeadId);
        }
    } else {
        bitrix.batch.lead.get('get_lead_entity', entityId);
        queueActiveDealsLoad(bitrix, entityId, entityType, dealSelect);
    }

    if (dtoLeadId && entityType !== EEventReportEntityType.LEAD) {
        bitrix.batch.lead.get('get_dto_lead', dtoLeadId);
    }

    // currentTask грузить из Bitrix не нужно — фронт уже передал
    // полное содержимое в DTO (включая ufCrmTask в camelCase).
    const reportContactId = dto.report?.contact?.ID
        ? Number(dto.report.contact.ID)
        : null;
    if (reportContactId) {
        bitrix.batch.contact.get('get_report_contact', reportContactId);
    }
    const planContactId = dto.plan?.contact?.ID
        ? Number(dto.plan.contact.ID)
        : null;
    if (planContactId && planContactId !== reportContactId) {
        bitrix.batch.contact.get('get_plan_contact', planContactId);
    }

    return {
        entityId,
        entityType,
        launchDealId,
        ownerDeal,
        ownerLeadIds,
        dtoLeadId,
        reportContactId,
        planContactId,
    };
};

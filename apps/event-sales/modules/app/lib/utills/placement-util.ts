import { BXCompany, BXDeal, BXLead, Placement, PlacementCallCard } from '@workspace/bx';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { IBXTask } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { Bitrix } from '@workspace/bitrix';
import { APP_FROM_ENUM } from '../../model/slice/AppSlice';
import {
    ETaskLinkType,
    getCrmLinksFromRaw,
} from '@/modules/entities/EventTask/lib/task-links';
import { EVENT_TASK_SELECT } from '@/modules/entities/EventTask/lib/task-select';
import { resolveTaskPrimaryContext } from '@/modules/entities/EventTask/lib/task-primary-context';

export const getDisplayMode = (placement: Placement | PlacementCallCard): APP_DISPLAY_MODE => {
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
export const shouldFitWindow = (
    placement: Placement | PlacementCallCard | null | undefined,
): boolean => Boolean(placement?.placement?.includes('DETAIL_TAB'));

export type EntitiesFromPlacement = {
    currentCompany: BXCompany | null;
    currentDeal: BXDeal | null;
    currentTask: IBXTask | null;
    currentLead: BXLead | null;
    from: APP_FROM_ENUM;
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
        from: APP_FROM_ENUM.COMPANY
    };
    let from = APP_FROM_ENUM.COMPANY

    try {
        const bitrix = Bitrix.getService();
        const type = placement?.placement;
        const options = (placement as Placement)?.options as any;
        if (!bitrix || !type || !options) return result;

        if (type.includes('DEAL')) {
            // расширяем этот кейс
            // раньше в сделке по любому могла быть компания теперь нет
            const deal = await bitrix.deal.get(Number(options.ID));
            result.currentDeal = deal as unknown as BXDeal;
            const companyId = deal?.COMPANY_ID;
            if (companyId && Number(companyId) > 0) {
                result.currentCompany = (await bitrix.company.get(Number(companyId))) as unknown as BXCompany;
            }
            from = APP_FROM_ENUM.DEAL
        } else if (type.includes('COMPANY')) {
            result.currentCompany = (await bitrix.company.get(Number(options.ID))) as unknown as BXCompany;
            from = APP_FROM_ENUM.COMPANY
        } else if (type.includes('TASK')) {
            const taskId = options.taskId ?? options.TASK_ID;
            const taskResponse = await bitrix.task.get(taskId, EVENT_TASK_SELECT);
            const currentTask = taskResponse?.result?.task as unknown as IBXTask;
            result.currentTask = currentTask;

            // Приоритетная сущность задачи: компания > сделка > лид.
            // Работаем «как будто в ней», но в рамках текущей задачи.
            const links = getCrmLinksFromRaw(
                (currentTask as { ufCrmTask?: string[] } | null)?.ufCrmTask,
            );
            const { primary } = resolveTaskPrimaryContext(links);
            if (primary?.type === ETaskLinkType.COMPANY) {
                result.currentCompany = (await bitrix.company.get(primary.id)) as unknown as BXCompany;
                from = APP_FROM_ENUM.COMPANY
            } else if (primary?.type === ETaskLinkType.DEAL) {
                const deal = await bitrix.deal.get(primary.id);
                result.currentDeal = deal as unknown as BXDeal;
                const dealCompanyId = Number(deal?.COMPANY_ID ?? 0);
                if (dealCompanyId > 0) {
                    result.currentCompany = (await bitrix.company.get(dealCompanyId)) as unknown as BXCompany;
                }
                from = APP_FROM_ENUM.DEAL
            } else if (primary?.type === ETaskLinkType.LEAD) {
                result.currentLead = (await bitrix.lead.get(primary.id))
                    ?.result as unknown as BXLead;
                from = APP_FROM_ENUM.LEAD
            }
            // from = APP_FROM_ENUM.TASK
        } else if (type.includes('CALL_CARD')) {
            const callOptions = options;
            let companyId: number | undefined;
            if (callOptions.CRM_ENTITY_TYPE === 'COMPANY' && callOptions.CRM_ENTITY_ID) {
                companyId = Number(callOptions.CRM_ENTITY_ID);
            }
            if (!companyId && Array.isArray(callOptions.CRM_BINDINGS)) {
                const bind = callOptions.CRM_BINDINGS.find((b: any) => b.ENTITY_TYPE === 'COMPANY');
                if (bind?.ENTITY_ID) companyId = Number(bind.ENTITY_ID);
            }
            if (companyId) {
                result.currentCompany = (await bitrix.company.get(companyId)) as unknown as BXCompany;
            }
            // from = CALL_CARD, а не COMPANY: карточка звонка может быть
            // привязана к компании, но открыты мы всё равно из звонка —
            // от этого зависит, какие сигналы искать (см. duplicate-context).
            from = APP_FROM_ENUM.CALL_CARD
        } else if (type.includes('LEAD')) {
            result.currentLead = (await bitrix.lead.get(Number(options.ID)))
                ?.result as unknown as BXLead;
            from = APP_FROM_ENUM.LEAD
        }
        result.from = from;
        return result;
    } catch (error) {
        console.error('getEntitiesFromPlacement error', error);
        return result;
    }
};

import { BXCompany, BXDeal, BXLead, Placement, PlacementCallCard } from '@workspace/bx';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { IBXTask } from '@workspace/bitrix/src/domain/interfaces/bitrix.interface';
import { Bitrix } from '@workspace/bitrix';

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

export type EntitiesFromPlacement = {
    companyPlacement: Placement;
    currentCompany: BXCompany | null;
    currentDeal: BXDeal | null;
    currentTask: IBXTask | null;
    currentLead: BXLead | null;
};

const TASK_SELECT = [
    'ID', 'UF_CRM_TASK', 'TITLE', 'DATE_START', 'CREATED_DATE', 'CHANGED_DATE',
    'CLOSED_DATE', 'DEADLINE', 'PRIORITY', 'MARK', 'GROUP_ID', 'CREATED_BY',
    'STATUS_CHANGED_BY', 'REAL_STATUS', 'STATUS', 'STAGE_ID', 'RESPONSIBLE_ID',
];

const getCompanyIdFromTask = (task: IBXTask | null): number | undefined => {
    let resultCompanyId: number | undefined;
    const ufCrmTask = (task as { ufCrmTask?: string[] } | null)?.ufCrmTask;
    ufCrmTask?.forEach((uf: string) => {
        if (uf.includes('CO')) {
            resultCompanyId = Number(uf.split('_')[1]);
        }
    });
    return resultCompanyId;
};

/**
 * Resolve the CRM entities (company / deal / task / lead) for the current Bitrix
 * placement using the @workspace/bitrix domain services.
 */
export const getEntitiesFromPlacement = async (
    placement: Placement | PlacementCallCard,
    domain: string,
): Promise<EntitiesFromPlacement> => {
    const companyPlacement = {
        placement: 'CRM_COMPANY_DETAIL_TAB',
        options: { ID: 0 },
    } as Placement;

    const result: EntitiesFromPlacement = {
        companyPlacement,
        currentCompany: null,
        currentDeal: null,
        currentTask: null,
        currentLead: null,
    };

    try {
        const bitrix = Bitrix.getService();
        const type = placement?.placement;
        const options = (placement as Placement)?.options as any;
        if (!bitrix || !type || !options) return result;

        if (type.includes('DEAL')) {
            const deal = await bitrix.deal.get(Number(options.ID));
            result.currentDeal = deal as unknown as BXDeal;
            const companyId = deal?.COMPANY_ID;
            if (companyId) {
                result.currentCompany = (await bitrix.company.get(Number(companyId))) as unknown as BXCompany;
            }
        } else if (type.includes('COMPANY')) {
            companyPlacement.placement = type as typeof companyPlacement.placement;
            result.currentCompany = (await bitrix.company.get(Number(options.ID))) as unknown as BXCompany;
        } else if (type.includes('TASK')) {
            const taskId = options.taskId ?? options.TASK_ID;
            const taskData: any = await bitrix.api.call('tasks.task.get', {
                taskId,
                select: TASK_SELECT,
            });
            const currentTask = (taskData?.task ?? taskData) as IBXTask;
            result.currentTask = currentTask;
            const companyId = getCompanyIdFromTask(currentTask);
            if (companyId) {
                result.currentCompany = (await bitrix.company.get(companyId)) as unknown as BXCompany;
            }
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
        } else if (type.includes('LEAD')) {
            result.currentLead = (await bitrix.api.call('crm.lead.get', { id: options.ID })) as unknown as BXLead;
        }

        if (result.currentCompany) {
            companyPlacement.options.ID = result.currentCompany.ID;
        }
        return result;
    } catch (error) {
        console.error('getEntitiesFromPlacement error', error);
        return result;
    }
};

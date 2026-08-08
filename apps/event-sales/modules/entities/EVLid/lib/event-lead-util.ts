import { BXLead } from '@workspace/bx';
import { getCrmLinksFromRaw } from '@/modules/entities/EventTask/lib/task-links';

/** ID лида из crm-привязок задачи (L_xxx). Парсинг — единым task-links. */
export const getLeadIdByTaskUF = (data: string[]): null | number =>
    getCrmLinksFromRaw(data).leadIds[0] ?? null;

export const getLeadgarantReportURL = (lead: BXLead | null): string => {
    return (lead as { UF_CRM_LEAD_QUEST_URL?: string } | null)
        ?.UF_CRM_LEAD_QUEST_URL || '';
};

export const getLeadComment = (lead: BXLead | null): string => {
    if (!lead) return '';
    const found = Object.values(lead).find(
        value =>
            typeof value === 'string' && value.includes('Дополнительная информация'),
    ) as string | undefined;
    return found ?? '';
};

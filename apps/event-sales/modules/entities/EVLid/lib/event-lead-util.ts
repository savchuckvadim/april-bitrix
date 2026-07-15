import { BXLead } from '@workspace/bx';

/** ID лида из crm-привязок задачи (L_xxx). */
export const getLeadIdByTaskUF = (data: string[]): null | number => {
    const element = data.find(item => item.startsWith('L'));
    if (!element) return null;
    return Number(element.split('_')[1]) || null;
};

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

'use client'

import { IUserReportItem } from "../type/user-report.type";

import { useDealsReport } from "@/modules/entities/deals-report/hooks/deals-report.hook";

import { useApp } from "@/modules/app";

export const useUserReportItem = (item: IUserReportItem) => {
    const { deals: companies } = useDealsReport()
    const { domain } = useApp()
    const companyIdData = item.service_ork_history_ork_crm_company?.value?.value; // 123 || CO_123
    const companyId = companyIdData?.toString().replace(/\D/g, '') || null;
    const company = companies.find(company => Number(company.company.id) === Number(companyId))?.company.title || companyId;
    const getCleanCompanyId = (companyId: string) => {
        return companyId.toString().replace(/\D/g, '');
    }
    return {
        title: item.title,
        action: item.service_ork_history_ork_event_action?.value?.name || '',
        type: item.service_ork_history_ork_event_type?.value?.name || '',
        comment: item.service_ork_history_manager_comment?.value?.value || '',
        crm: item.service_crm?.value?.value || '',
        contact: item.service_ork_crm_contact?.value?.value || '',
        company,
        domain,
        companyId,
        plan_date: item.service_ork_history_ork_plan_date?.value?.value || '',
        event_date: item.service_ork_history_ork_event_date?.value?.value || '',
        initiative: item.service_ork_history_ork_event_initiative?.value?.name || '',
        tag: item.service_ork_evemt_tag?.value?.value || '',
        communication: item.service_ork_history_event_communication?.value?.name || '',
        getCleanCompanyId,
    }
}

'use client'

import { IUserReportItem } from "../type/user-report.type";

// import { useDealsReport } from "@/modules/entities/deals-report/hooks/deals-report.hook";

import { useApp, useAppSelector } from "@/modules/app";

export const useUserReportItem = (item: IUserReportItem) => {
    // const { deals: companies } = useDealsReport()
    const { domain } = useApp()
    const companyIdData = item.sales_kpi_crm_company?.value?.value; // 123 || CO_123
    const companyId = companyIdData?.toString().replace(/\D/g, '') || null;
    const listId = useAppSelector(state => state.userReport.listId);
    // const company = companies.find(company => Number(company.company.id) === Number(companyId))?.company.title || companyId;
    const getCleanCompanyId = (companyId: string) => {
        return companyId.toString().replace(/\D/g, '');
    }
    const companyBxLink = domain && companyId && Number(companyId) > 0
        ? `https://${domain}/crm/company/details/${companyId}/` : null;
    const listItemBxLink = domain && listId && listId > 0
        ? `https://${domain}/company/lists/${listId}/element/0/${item.id}/?list_section_id=` : null;
    return {
        title: item.title,
        action: item.sales_kpi_event_action?.value?.name || '',
        type: item.sales_kpi_event_type?.value?.name || '',
        comment: item.sales_kpi_manager_comment?.value?.value || '',
        crm: item.sales_kpi_crm?.value?.value || '',
        contact: item.sales_kpi_crm_contact?.value?.value || '',
        company: companyId || '',
        domain,
        companyId,
        plan_date: item.sales_kpi_plan_date?.value?.value || '',
        event_date: item.sales_kpi_event_date?.value?.value || '',
        companyBxLink,
        listItemBxLink,
        getCleanCompanyId,
    }
}

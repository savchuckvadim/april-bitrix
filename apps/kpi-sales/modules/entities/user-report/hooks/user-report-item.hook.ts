'use client'

import { IUserReportItem } from "../type/user-report.type";

// import { useDealsReport } from "@/modules/entities/deals-report/hooks/deals-report.hook";

import { useApp, useAppSelector } from "@/modules/app";

import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';
export const getFormattedDate = (date: string | null | undefined) => {
    if (!date) return '';
    const dateObj = parse(date, "dd.MM.yyyy HH:mm:ss", new Date());
    return format(dateObj, "d MMMM HH:mm", { locale: ru });
}
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



    const companyColorName = item.company?.color === 'green'
        ? 'зеленый'
        : item.company?.color === 'red'
            ? 'красный'
            : item.company?.color === 'yellow'
                ? 'желтый' : item.company?.color === 'blue'
                    ? 'синий' : item.company?.color === 'purple'
                        ? 'фиолетовый' : item.company?.color === 'orange'
                            ? 'оранжевый' : item.company?.color === 'pink'
                                ? 'розовый' : item.company?.color === 'brown'
                                    ? 'коричневый' : item.company?.color === 'gray'
                                        ? 'серый' : item.company?.color === 'black'
                                            ? 'черный' : item.company?.color === 'white' ? 'белый' : 'не установлен ';
    const companyColor = item.company?.color === 'green' ? 'bg-green-400 text-white border-green-700' : item.company?.color === 'red' ? 'bg-red-400 text-white border-red-700' : item.company?.color === 'yellow' ? 'bg-yellow-400 text-white border-yellow-700' : item.company?.color === 'blue' ? 'bg-blue-400 text-white border-blue-700' : item.company?.color === 'purple' ? 'bg-purple-400 text-white border-purple-700' : item.company?.color === 'orange' ? 'bg-orange-400 text-white border-orange-700' : item.company?.color === 'pink' ? 'bg-pink-400 text-white border-pink-700' : item.company?.color === 'brown' ? 'bg-brown-400 text-white border-brown-700' : item.company?.color === 'gray' ? 'bg-gray-400 text-white border-gray-700' : item.company?.color === 'black' ? 'bg-black-400 text-white border-black-700' : item.company?.color === 'white' ? 'bg-white-400 text-white border-white-700' : 'bg-gray-100 text-gray-800 border-gray-200';
    return {
        title: item.title,
        action: item.sales_kpi_event_action?.value?.name || '',
        type: item.sales_kpi_event_type?.value?.name || '',
        comment: item.sales_kpi_manager_comment?.value?.value || '',
        crm: item.sales_kpi_crm?.value?.value || '',
        contact: item.sales_kpi_crm_contact?.value?.value || '',
        company: item.company || '',
        companyColorName,
        domain,
        companyId,
        plan_date: item.sales_kpi_plan_date?.value?.value
            ? getFormattedDate(item.sales_kpi_plan_date?.value?.value)
            : '',
        event_date: item.sales_kpi_event_date?.value?.value
            ? getFormattedDate(item.sales_kpi_event_date?.value?.value)
            : '',
        companyBxLink,
        listItemBxLink,
        getCleanCompanyId,
    }
}

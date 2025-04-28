import { BXDepartment, BXUser } from "@workspace/bx";
import { PBXDepartament, PBXFieldItem } from "@workspace/pbx";


export interface IFilterResponse {
    filter: Array<FilterInnerCode>,
    department: Array<number> | null,
    dates: {
        [ReportDateType.FROM]: string | EReportDateMode,
        [ReportDateType.TO]: string | EReportDateMode,
    } | null
}

export interface ReportDataParams {
    domain: string;
    filters: {
        dateFrom: string;
        dateTo: string;
        userIds: Array<string | number>;
        departament: BXUser[] | null;
        userFieldId: string;
        dateFieldId: string;
        actionFieldId: string;
        currentActions: DISPLAY_VALUES_FORM;
    }
}

export type FetchedFilters = {
    [key: string]: Filter
}

export type Filter = {
    actionItem: PBXFieldItem
    actionTypeItem: PBXFieldItem
    innerCode: FilterInnerCode
    name?: string
    code: FilterCode


}

//xz
export type ReportDetalization = {
    action: KPIAction
    report: ReportData
}
export type FilterCode = 'xo_plan' | //тип события презентация, звонок
    'xo_expired' | // событие запланирован, совершен
    'xo_done' | // дата события
    'xo_pound' |
    'xo_act_noresult_fail' |
    'call_plan' | 'call_expired' | 'call_done' | 'call_pound' | 'call_act_noresult_fail' |
    'call_in_progress_plan' | 'call_in_progress_expired' | 'call_in_progress_done' | 'call_in_progress_pound' | 'call_in_progress_act_noresult_fail' |
    'call_in_money_plan' | 'call_in_money_expired' | 'call_in_money_done' | 'call_in_money_pound' | 'call_in_money_act_noresult_fail' |

    'presentation_plan' | 'presentation_expired' | 'presentation_done' | 'presentation_pound' | 'presentation_act_noresult_fail' |
    'presentation_uniq_plan' | 'presentation_uniq_expired' | 'presentation_uniq_done' | 'presentation_uniq_pound' | 'presentation_uniq_act_noresult_fail' |
    'ev_offer_act_send' | 'ev_offer_pres_act_send' | 'ev_invoice_act_send' | 'ev_invoice_pres_act_send' | 'ev_contract_act_send' | 'ev_success_done' |
    'ev_fail_done'

export type FilterInnerCode = 'result_communication_done' |
    'result_communication_plan' | 'call_plan' | 'call_expired' | 'call_done' | 'call_pound' | 'call_act_noresult_fail' |
    'presentation_plan' | 'presentation_expired' | 'presentation_done' | 'presentation_pound' | 'presentation_act_noresult_fail' |
    'presentation_uniq_plan' | 'presentation_uniq_expired' | 'presentation_uniq_done' | 'presentation_uniq_pound' | 'presentation_uniq_act_noresult_fail' |
    'ev_offer_act_send' | 'ev_offer_pres_act_send' | 'ev_invoice_act_send' | 'ev_invoice_pres_act_send' | 'ev_contract_act_send' | 'ev_success_done' |
    'ev_fail_done'


export type DISPLAY_VALUES_FORM = {
    [key: string]: string
    // 258: "Звонок запланирован"
    // 260: "Звонок отказ"
    // 262: "Звонок совершен"
    // 264: "Презентация запланирована"
    // 266: "Презентация проведена"
    // 268: "КП"
    // 270: "Счет"
    // 272: "Оплачен"
    // 274: "Поставка"
    // 276: "Сделка: Отказ"
}
export type KPIAction = {
    id: number
    name: string
    // shortName?: string

}
export type KPI = {
    id: number
    action: Filter
    count: number
    list?: Array<KPIListItem>

}
type KPIListItem = {
    id: number
    crm: string
    name: string
    date: string
    file: string
    link: string
    action: KPIAction
}

export interface ReportData {
    user: BXUser;
    userName?: string
    // callings: KPICall[]
    kpi: KPI[]
}

export interface ReportDate {
    [ReportDateType.FROM]: string;
    [ReportDateType.TO]: string;
    inProcess: boolean;
    mode: EReportDateMode;
}
export enum EReportDateMode {
    TODAY = 'today',
    WEEK = 'week',
    MONTH = 'month',
    RANGE = 'range'
}
export enum ReportDateType {
    FROM = 'from',
    TO = 'to'
}

export interface FilterResponse {
    filter: FilterInnerCode[];
    department: string[] | null;
    dates: {
        [ReportDateType.FROM]: string;
        [ReportDateType.TO]: string;
    } | null;
}

export interface IDepartmentResponse {
    department: PBXDepartament
    generalDepartment: BXDepartment[]
    childrenDepartments: BXDepartment[]
    allUsers: BXUser[]
}


import {
    PbxSalesKpiCompanyDto, PbxSalesKpiContactDto,
    PbxSalesKpiFieldItemValueDto, PbxSalesKpiFieldValueDto,
    PbxSalesKpiListItemDto
} from "@workspace/nest-api";

export interface IUserReportItem extends PbxSalesKpiListItemDto {
    id: number;
    title: string;
    date: string;

    // [string in EnumOrkFieldCode]: IUserReportField;
    sales_kpi_responsible: IUserReportField;
    sales_kpi_event_action: IUserReportField;
    sales_kpi_event_type: IUserReportField;
    sales_kpi_crm: IUserReportField;
    sales_kpi_crm_contact: IUserReportField;
    sales_kpi_manager_comment: IUserReportField;
    sales_kpi_event_date: IUserReportField;
    sales_kpi_plan_date: IUserReportField;
    sales_kpi_crm_company: IUserReportField;
    companyId: number;
    company: PbxSalesKpiCompanyDto;
    contacts: PbxSalesKpiContactDto;
}


export interface IUserReportField extends PbxSalesKpiFieldValueDto {
    fieldName: string;
    fieldCode: string;
    bitrixId: string;
    value: IUserReportFields;
}


export interface IUserReportFields extends PbxSalesKpiFieldItemValueDto {

    id: number;
    bitrixId: number;
    name: string;
    code: string;


}

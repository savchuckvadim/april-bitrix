import { OrkHistoryFieldItemValueDto, OrkHistoryFieldValueDto, OrkListHistoryItemDto } from "@workspace/nest-api";

export interface IUserReportItem extends OrkListHistoryItemDto{
    id: number;
    title: string;
    date: string;

    // [string in EnumOrkFieldCode]: IUserReportField;
    responsible: IUserReportField;
    action: IUserReportField;
    type: IUserReportField;
    crm: IUserReportField;
    contactId: number;
    contact: IUserReportField;
    comment: IUserReportField;
    plan_date: IUserReportField;
    comapny: IUserReportField;
    companyId: number;
    dealId: number;
    author: IUserReportField;
    su: IUserReportField;
}


export interface IUserReportField extends OrkHistoryFieldValueDto{
    fieldName: string;
    fieldCode: string;
    bitrixId: string;
    value: IUserReportFields;
}


export interface IUserReportFields extends OrkHistoryFieldItemValueDto{

    id: number;
    bitrixId: number;
    name: string;
    code: string;


}

import { EnumSalesKpiFieldCode } from "../type/pbx-sales-kpi-list.enum";
import { IBXCompany, IBXContact } from '@workspace/bitrix';

export class PbxSalesKpiListDto {
    responsible: string;
    dateFrom: string;
    dateTo: string;
}

export class PbxSalesKpiFieldItemValueDto {

    id: number;
    bitrixId: number;
    name: string;
    value?: string;
    code: string;
}

export class PbxSalesKpiFieldValueDto {

    fieldName: string;

    fieldCode: string;
    bitrixId: string;

    value: PbxSalesKpiFieldItemValueDto | string;
}

export class PbxSalesKpiContactDto {
    constructor(data: IBXContact) {
        Object.assign(this, data);
    }

    NAME: string;
    LAST_NAME: string;
    SECOND_NAME: string;
    POST: string;
}

export class PbxSalesKpiCompanyDto implements IBXCompany {
    constructor(data: IBXCompany, color: string) {
        Object.assign(this, data);
        this.color = color;
    }

    ASSIGNED_BY_ID: string;

    ID: number;
    TITLE: string;

    UF_CRM_PRES_COUNT: number;

    UF_CRM_USER_CARDNUM: string;
    COMMENTS: string;
    UF_CRM_OP_PROSPECTS: string;

    UF_CRM_OP_MHISTORY: string[];

    color: string;
}

export class PbxSalesKpiListItemDto {
    constructor(data: PbxSalesKpiListItemDto) {
        Object.assign(this, data);
    }

    id: number;
    title: string;
    date: string;

    [EnumSalesKpiFieldCode.responsible]?: PbxSalesKpiFieldValueDto;

    [EnumSalesKpiFieldCode.event_action]?: PbxSalesKpiFieldValueDto;
    [EnumSalesKpiFieldCode.event_type]?: PbxSalesKpiFieldValueDto;
    [EnumSalesKpiFieldCode.crm]?: PbxSalesKpiFieldValueDto;

    [EnumSalesKpiFieldCode.crm_contact]?: PbxSalesKpiFieldValueDto;

    [EnumSalesKpiFieldCode.manager_comment]?: PbxSalesKpiFieldValueDto;

    [EnumSalesKpiFieldCode.event_date]?: PbxSalesKpiFieldValueDto;

    [EnumSalesKpiFieldCode.plan_date]?: PbxSalesKpiFieldValueDto;
    [EnumSalesKpiFieldCode.crm_company]?: PbxSalesKpiFieldValueDto;

    companyId: number;
    contactId: number;
    company?: PbxSalesKpiCompanyDto;
    contacts?: PbxSalesKpiContactDto[];
}

export type Portal = {
    bitrixCallingTasksGroup: PBXTasksGroup;
    bitrixDeal: PBXDeal;
    bitrixLists: Array<PBXList>;
    company: PBXCompany;
    lead: PBXLead;
    departament: PBXDepartament;
};

export enum PBX_GROUP {
    SALES = 'sales',
    CUP = 'cup',
    TMC = 'tmc',
    SERVICE = 'service',
    EDU = 'edu',
    GENERAL = 'general',
}

export type PBXTasksGroup = {
    bitrixId: number;
    group: PBX_GROUP;
    id: number;
    name: 'sales_calling';
    portal_id: number;
    title: 'Звонки Продажи';
    type: PBX_GROUP;
};

export type PBXDeal = {
    bitrixfields: Array<PBXField>;
    categories: Array<PBXCategory>;
    code: 'deal';
    id: number;
    name: string;
    title: string;
};
export type PBXList = {
    bitrixId: number;
    bitrixfields: Array<PBXField>;
    group: PBX_GROUP;
    id: number;
    name: string;
    title: string;
    type: 'kpi' | 'history' | 'presentation';
};
export type PBXCompany = {
    bitrixfields: Array<PBXField>;
    code: 'company';
    id: number;
    name: string;
    title: string;
};
export type PBXLead = {
    bitrixfields: Array<PBXField>;
    categories: Array<PBXCategory>;
    code: 'lead';
    id: number;
    name: string;
    title: string;
};

export type PBXDepartament = {
    bitrixId: number;
    group: PBX_GROUP;
    id: number;
    name: string;
    title: string;
    type: PBX_GROUP;
};

///fields
export type PBXField = {
    bitrixCamelId: string;
    bitrixId: string; // todo fld btz id types -> "XO_NAME"
    // bitrixfielditems: Array<PBXFieldItem>
    code: string; // todo fld btz id types -> "xo_name"
    entity_id: number;
    id: number;
    name: string;
    parent_type: string | 'xo';
    title: string;
    type: string; //"string" | enumeratuion ...
    items: Array<PBXFieldItem>;
};

export type PBXFieldItem = {
    bitrixId: number;
    bitrixfield_id: number;
    code: string | 'nok';
    id: number;
    name: string;
    title: string;
};

//categories and stages
export type PBXCategory = {
    bitrixCamelId: string; //but number "34"
    bitrixId: string; //but number "34"
    code: string | 'sales_base';
    group: string | 'sales';
    id: number;
    isActive: boolean;
    name: string;

    stages: Array<PBXStage>;
    title: string;
    type: string;
};

export type PBXStage = {
    bitrixId: string; // "NEW"
    code: string | 'cold_new';
    color: string;
    id: number;
    isActive: boolean;
    name: string;
    title: string;
};

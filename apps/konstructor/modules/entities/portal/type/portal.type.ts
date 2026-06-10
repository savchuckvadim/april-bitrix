import { BXUser } from "@workspace/bx"

export type Portal = {
    id: number
    bitrixCallingTasksGroup: PBXTasksGroup
    bitrixDeal: PBXDeal
    bitrixLists: Array<PBXList>
    company: PBXCompany
    lead: PBXLead
    departament: PBXDepartament
    contact: PBXContact
    rpas: PBXRPA[]
    smarts: PBXSmart[]

}
export interface PBXSmart {
    id: number,
    name: string,
    description: string,
    type: 'service_offer',
    group: PBX_GROUP,
    entityTypeId: number,
    bitrixfields: PBXField[]
    categories: PBXCategory[]
    crm: string

}
export type PBXRPA = {
    bitrixId: number
    code: 'presentation' | 'supply'
    id: number
    bitrixfields: PBXField[]
}
export enum PBX_GROUP {
    SALES = "sales",
    CUP = 'cup',
    TMC = 'tmc',
    SERVICE = 'service',
    EDU = 'edu',
    GENERAL = 'general'
}



type PBXTasksGroup = {
    bitrixId: number
    group: PBX_GROUP
    id: number
    name: "sales_calling"
    portal_id: number
    title: "Звонки Продажи"
    type: PBX_GROUP
}


export type PBXDeal = {
    bitrixfields: Array<PBXField>
    categories: Array<PBXCategory>
    code: "deal"
    id: number
    name: string
    title: string
}
export type PBXList = {
    bitrixId: number
    bitrixfields: Array<PBXField>
    group: PBX_GROUP
    id: number
    name: string
    title: string
    type: "kpi" | "history" | "presentation"
}
type PBXCompany = {
    bitrixfields: Array<PBXField>
    code: "company"
    id: number
    name: string
    title: string
}
type PBXContact = {
    bitrixfields: Array<PBXField>
    code: "contact"
    id: number
    name: string
    title: string
}
type PBXLead = {
    bitrixfields: Array<PBXField>
    categories: Array<PBXCategory>
    code: "lead"
    id: number
    name: string
    title: string
}


type PBXDepartament = {
    bitrixId: number
    group: PBX_GROUP
    id: number
    name: string
    title: string
    type: PBX_GROUP
}


///fields
// type PBXField = {
//     bitrixCamelId: string
//     bitrixId: string // todo fld btz id types -> "XO_NAME"
//     bitrixfielditems: Array<PBXFieldItem>
//     code: string // todo fld btz id types -> "xo_name"
//     entity_id: number
//     id: number
//     name: string
//     parent_type: string | "xo"
//     title: string
//     type: string //"string" | enumeratuion ...
// }


// type PBXFieldItem = {
//     bitrixId: number
//     bitrixfield_id: number
//     code: string | "nok"
//     id: number
//     name: string
//     title: string
// }

///fields
export interface PBXField {
    bitrixCamelId: string
    bitrixId: string // todo fld btz id types -> "XO_NAME"
    // bitrixfielditems: Array<PBXFieldItem>
    code: string  //| EV_COMPANY_PROP // todo fld btz id types -> "xo_name"
    entity_id: number
    id: number
    name: string
    parent_type: string | "xo"
    title: string
    type: PBX_FIELD_TYPE//"string" | enumeratuion ...
    items: Array<PBXFieldItem>
    user?: BXUser
}

export enum PBX_FIELD_TYPE {
    ENUM = 'enumeration',
    STR = 'string',
    NUMB = 'number',
    TXT = 'text',
    DATE = 'date',
    DATE_TIME = "datetime",
    SELECT = 'select',
    USER = 'employee',
    FILE = 'file'

}

export interface PBXFieldItem<T = string> {
    bitrixId: number
    bitrixfield_id: number
    code: T
    id: number
    name: string
    title: string
}





//categories and stages
export type PBXCategory = {
    bitrixCamelId: string //but number "34"
    bitrixId: number //but number "34"
    code: string | "sales_base"
    group: string | "sales"
    id: number
    isActive: boolean
    name: string

    stages: Array<PBXStage>
    title: string
    type: string
}


type PBXStage = {
    bitrixId: string // "NEW"
    code: string | "cold_new"
    color: string
    id: number
    isActive: boolean
    name: string
    title: string
}

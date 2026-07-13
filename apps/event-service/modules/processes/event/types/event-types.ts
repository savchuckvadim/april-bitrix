import { ROUTE_EVENT } from "@/modules/processes/routes/types/router-type"
import { BXUser } from "@workspace/bx"


export enum EVENT_PROP {
    // RESPONSIBILITY = 'responsibility',
    // CREATED_BY = 'createdBy',
    STATUS = 'status',
    CRM = 'crm',
    PLAN = 'plan',
    COMPANY = 'company',
    LEAD = 'lead',
    SMART = 'smart',
}


export interface SetPrimrtiveStatePropPayload {
    name: EVENT_PROP
    value: BXUser | null
}

// export type EVENT_PROPS =  EVENT_PROP.PLAN


export interface SetFullCompleteStatusPayload {
    status: boolean

}

export interface SetFinishStatusPayload {
    status: boolean
    result: 'Звонок запланирован' | 'Презентация запланирована' | ''
}

export interface setCurrentPagePayload {
    page: ROUTE_EVENT
}

// export enum EVENT_CURRENT_PAGE {
//     LIST = 'list',
//     ITEM = 'item'
// }


import { DISPLAY_MODE, Placement, PlacementCallCard } from "./placement-type";

export interface InitBxResult {
    domain: string;
    user: BXUser;
    placement: Placement | PlacementCallCard;
    company: BXCompany;
    deal: BXDeal;
    task: BXTask
    display: DISPLAY_MODE;

}

export enum BX_TASK_MARK {
    NONE=null,
    GOOD='P',
    BAD='N'

}
export interface BXTask {

    accomplices: []
    accomplicesData: []
    activityDate: "2017-12-29T13:07:19+03:00"
    addInReport: "N"
    allowChangeDeadline: "Y"
    allowTimeTracking: "N"
    auditors: []
    auditorsData: []
    changedBy: "1"
    changedDate: "2017-12-29T13:07:19+03:00"
    closedBy: "81"
    closedDate: "2017-12-29T13:06:18+03:00"
    commentsCount: null
    createdBy: "1"
    createdDate: "2017-12-29T12:15:42+03:00"
    creator: BXUser
    dateStart: "2017-12-29T13:04:29+03:00"
    deadline: "2017-12-29T15:00:00+03:00"
    description: string
    descriptionInBbcode: "Y"
    durationFact: null
    durationPlan: null
    durationType: "days"
    endDatePlan: null
    exchangeId: null
    exchangeModified: null
    favorite: "N"
    forkedByTemplateId: null
    forumId: null
    forumTopicId: null
    group: []
    groupId: number
    guid: "{9bd11fb5-8e76-4379-b3be-1f4cbe9bae1d}"
    id: number
    isMuted: "N"
    isPinned: "N"
    isPinnedInGroup: "N"
    mark: BX_TASK_MARK
    matchWorkTime: "N"
    multitask: "N"
    newCommentsCount: 0
    notViewed: "N"
    outlookVersion: "4"
    parentId: null
    priority: "0"
    replicate: "N"
    responsible: BXUser
    responsibleId: "81"
    serviceCommentsCount: null
    siteId: "s1"
    sorting: null
    stageId: "0"
    startDatePlan: null
    status: "5"
    statusChangedBy: "81"
    statusChangedDate: "2017-12-29T13:06:18+03:00"
    subStatus: "5"
    subordinate: "N"
    taskControl: "N"
    timeEstimate: "0"
    timeSpentInLogs: null
    title: string
    viewedDate: "2017-12-29T19:44:28+03:00"
    xmlId: null
    ufCrmTask: Array<string>
}
export interface BXUser {
    ACTIVE: boolean
    DATE_REGISTER: string
    EMAIL: string
    ID: number
    IS_ONLINE: string
    LAST_ACTIVITY_DATE: Array<string>
    LAST_LOGIN: string
    LAST_NAME: string
    NAME: string
    PERSONAL_BIRTHDAY: string
    PERSONAL_CITY: string
    PERSONAL_GENDER: string
    PERSONAL_MOBILE: string
    PERSONAL_PHOTO: string
    PERSONAL_WWW: string
    SECOND_NAME: string
    TIMESTAMP_X: Array<string>
    TIME_ZONE_OFFSET: string
    UF_DEPARTMENT: Array<number>
    UF_EMPLOYMENT_DATE: string
    UF_PHONE_INNER: string
    // UF_USR_1570437798556: boolean
    USER_TYPE: string
    WORK_PHONE: string
    WORK_POSITION: string
    // XML_ID: string
}

export interface BXLead {
    ID: number
    TITLE: string
    UF_CRM_LEAD_QUEST_URL: string
    [key: string]: string | number
}
export interface BXCompany {
    ID: number
    TITLE: string
    PRES_COUNT: number
}
export interface BXSmart {
    ID: number
    TITLE: string
}

export interface BXDeal {
    ID: number
    TITLE: string
    UF_CRM_OP_MHISTORY?: string[]
    UF_CRM_OP_CURRENT_STATUS?: string
}


export interface BXList {
    NAME: number
    TITLE: string
    BP_PUBLISHED: string
    CODE: string
    CREATED_BY: string
    IBLOCK_ID: string
    IBLOCK_SECTION_ID: string



}

export interface BXContact {
    ID: number
    NAME: string
    // LAST_NAME: string
    // TYPE_ID: 'client'
    // SOURCE_ID: number
    PHONE: string //wrong
    EMAIL: string //wrong
    POST: string
}

// STATUS	Статус	enum	2 - Ждет выполнения,
// 3 - Выполняется,
// 4 - Ожидает контроля,
// 5 - Завершена,
// 6 - Отложена.
// По умолчанию - 2
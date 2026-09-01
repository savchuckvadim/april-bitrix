/**
 * ЛОКАЛЬНЫЕ копии битрикс-типов, которые нужны DTO и типам флоу.
 *
 * Пакет изоморфный и не тянет ни бэковый `src/modules/bitrix`
 * (back/libs/bitrix), ни фронтовый `@workspace/bitrix` — только структурные
 * копии использованных деклараций. Содержимое деклараций 1:1 с бэком;
 * источники:
 *  - IBXUser, IBXLead      — back/libs/bitrix/src/domain/interfaces/bitrix.interface.ts
 *  - IBXDeal               — back/libs/bitrix/src/domain/crm/deal/interface/bx-deal.interface.ts
 *  - IBXCompany            — back/libs/bitrix/src/domain/crm/company/interface/bx-company.interface.ts
 *  - IBXContact            — back/libs/bitrix/src/domain/crm/contact/interface/bx-contact.interface.ts
 *  - EBXTaskMark, EBXTaskStatus, IBXTask
 *                          — back/libs/bitrix/src/domain/tasks/task/interface/task.interface.ts
 *  - IBXPlacement, IBXPlacementOptions
 *                          — back/libs/bitrix/src/domain/interfaces/bitrix-placement.intreface.ts
 */

export interface IBXUser {
    ACTIVE?: boolean;
    DATE_REGISTER?: string;
    EMAIL?: string;
    ID?: number | string;
    IS_ONLINE?: string;
    LAST_ACTIVITY_DATE?: string;
    LAST_LOGIN?: string;
    LAST_NAME?: string;
    NAME?: string;
    PERSONAL_BIRTHDAY?: string;
    PERSONAL_CITY?: string;
    PERSONAL_GENDER?: string;
    PERSONAL_MOBILE?: string;
    PERSONAL_PHOTO?: string;
    PERSONAL_WWW?: string;
    SECOND_NAME?: string;

    TIMESTAMP_X?: Array<string>;
    TIME_ZONE_OFFSET?: string;
    UF_DEPARTMENT?: Array<number>;
    UF_EMPLOYMENT_DATE?: string;
    UF_PHONE_INNER?: string;
    USER_TYPE?: string;
    WORK_PHONE?: string;
    WORK_POSITION?: string;
}

export interface IBXLead {
    ID: number;
    TITLE: string;
    UF_CRM_LEAD_QUEST_URL: string;
    [key: string]: string | number;
}

export interface IBXCompany {
    ASSIGNED_BY_ID: string;
    ID: number;
    TITLE: string;
    UF_CRM_PRES_COUNT: number;
    UF_CRM_USER_CARDNUM: string; //регистрационный лист номер
    COMMENTS: string;
    [key: string]: any;
}

export interface IBXContact {
    ID?: number | string;
    ASSIGNED_BY_ID?: string | number;
    COMPANY_ID?: string | number;
    NAME?: string;
    LAST_NAME?: string;
    SECOND_NAME?: string;
    PHONE?: {
        VALUE: string;
        TYPE: string;
    }[];
    EMAIL?: {
        VALUE: string;
        TYPE: string;
    }[];
    POST?: string;
    COMMENTS?: string;
    /** Ключи СКАП-логинов (множественное, импорт СКАП — pbx-skap-smart). */
    UF_CRM_SKAP_LOGINS?: string[];

    TYPE_ID?: string;
    SOURCE_ID?: string;
    SOURCE_DESCRIPTION?: string;
    BIRTHDATE?: string;

    ADDRESS?: string;
    ADDRESS_2?: string;
    ADDRESS_CITY?: string;
    ADDRESS_POSTAL_CODE?: string;
    ADDRESS_REGION?: string;
    ADDRESS_PROVINCE?: string;
    ADDRESS_COUNTRY?: string;
    UTM_SOURCE?: string;
    UTM_MEDIUM?: string;
    UTM_CAMPAIGN?: string;
    UTM_CONTENT?: string;
    UTM_TERM?: string;
}

export interface IBXDeal {
    [key: string]: string | number | string[] | number[] | boolean | undefined;
    ID: number;
    TITLE: string;
    CONTACT_IDS?: string[] | number[];
    CATEGORY_ID: string;
    STAGE_ID: string;
    COMPANY_ID: string;
    COMMENTS: string;
    ASSIGNED_BY_ID: string;
    CREATED_BY_ID: string;
    UF_CRM_OP_MHISTORY?: string[];
    UF_CRM_OP_CURRENT_STATUS?: string;
    UF_CRM_UC_ID?: string[]; //id комплекта арм Garant
    UF_CRM_RPA_ARM_COMPLECT_ID?: string[]; //id комплекта арм RPA April
    CLOSED: 'Y' | 'N';
    OPENED: 'Y' | 'N';
    MOVED_TIME: string;
    LAST_ACTIVITY_TIME: string;
    STAGE_SEMANTIC_ID: 'P' | 'S' | 'F';
}

export enum ETaskPriority {
    HIGH = 2,
    MEDIUM = 1,
    LOW = 0,
}

export enum EBXTaskMark {
    NONE = '',
    GOOD = 'P',
    BAD = 'N',
}
export enum EBXTaskStatus {
    NEW = '1', // Новая
    PENDING = '2', //Ждёт выполнения
    IN_PROGRESS = '3', //Выполняется
    SUPPOSEDLY_COMPLETED = '4', //Ожидает контроля
    COMPLETED = '5', //Завершена
    DEFERRED = '6', //Отклонена
    DECLINED = '7', //Отклонена
}

export interface IBXTask {
    accomplices: [];
    accomplicesData: [];
    activityDate: '2017-12-29T13:07:19+03:00';
    addInReport: 'N';
    allowChangeDeadline: 'Y';
    allowTimeTracking: 'N';
    auditors: [];
    auditorsData: [];
    changedBy: '1';
    changedDate: '2017-12-29T13:07:19+03:00';
    closedBy: '81';
    closedDate: '2017-12-29T13:06:18+03:00';
    commentsCount: null;
    createdBy: '1';
    createdDate: '2017-12-29T12:15:42+03:00';
    creator: IBXUser;
    dateStart: '2017-12-29T13:04:29+03:00';
    deadline: '2017-12-29T15:00:00+03:00';
    description: string;
    descriptionInBbcode: 'Y';
    durationFact: null;
    durationPlan: null;
    durationType: 'days';
    endDatePlan: null;
    exchangeId: null;
    exchangeModified: null;
    favorite: 'N';
    forkedByTemplateId: null;
    forumId: null;
    forumTopicId: null;
    group: [];
    groupId: number;
    guid: '{9bd11fb5-8e76-4379-b3be-1f4cbe9bae1d}';
    id: number;
    isMuted: 'N';
    isPinned: 'N';
    isPinnedInGroup: 'N';
    mark: EBXTaskMark;
    matchWorkTime: 'N';
    multitask: 'N';
    newCommentsCount: 0;
    notViewed: 'N';
    outlookVersion: '4';
    parentId: null;
    priority: '0';
    replicate: 'N';
    responsible: IBXUser;
    responsibleId: '81';
    serviceCommentsCount: null;
    siteId: 's1';
    sorting: null;
    stageId: '0';
    startDatePlan: null;
    status: EBXTaskStatus;
    statusChangedBy: '81';
    statusChangedDate: '2017-12-29T13:06:18+03:00';
    subStatus: EBXTaskStatus;
    subordinate: 'N';
    taskControl: 'N';
    timeEstimate: '0';
    timeSpentInLogs: null;
    title: string;
    viewedDate: '2017-12-29T19:44:28+03:00';
    xmlId: null;
    ufCrmTask: Array<string>;
}

export type IBXPlacementOptions = {
    ID?: number;
    taskId?: number;
    TASK_ID?: number;
};

export type IBXPlacement = {
    options: IBXPlacementOptions;
    placement: string;
};

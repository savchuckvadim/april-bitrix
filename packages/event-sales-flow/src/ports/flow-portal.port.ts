/**
 * FlowPortalSource — шов пакета к слепку портала.
 *
 * РОВНО 9 lookup-методов, которыми event-report-флоу пользуется у бэкового
 * PortalModel (back/libs/portal-lib/portal/src/services/portal.model.ts) —
 * сигнатуры сняты оттуда 1:1. На бэке порт реализует сам PortalModel,
 * в браузере — адаптер поверх Redux-слепка портала + resolve.ts
 * (packages/pbx) — появится в заходе А2.
 *
 * Типы объявлены ЛОКАЛЬНО по фактическому использованию девяти методов —
 * структурные подмножества back/libs/portal-lib/portal/src/interfaces/
 * portal.interface.ts: поля, которые ядро читает, обязательны; остальное
 * опционально, чтобы любой честный слепок портала лёг в порт структурно.
 */
import { ETimeZone } from '../shared/utils/date-convert.util';

/** Тип CRM-сущности pbx-домена (portal.model.ts: PbxEntityType). */
export type PbxEntityType = 'company' | 'lead' | 'deal' | 'contact';

/** Item справочного поля (подмножество IFieldItem портала). */
export interface IFieldItem {
    id?: number;
    name?: string;
    title?: string;
    code: string;
    /** Числовой id элемента списка в Bitrix — то, что пишется в UF-поле. */
    bitrixId: number;
}

/** UF-поле сущности/списка (подмножество IField портала). */
export interface IField {
    ID?: number;
    type?: string;
    /** pbx-код поля (в бэке IFieldCode — string-union с открытым хвостом). */
    code: string;
    name?: string;
    title?: string;
    /**
     * Суффикс или полное имя UF_CRM-поля; полный вид собирает
     * getFieldBitrixId (см. комментарий в portal.model.ts).
     */
    bitrixId: string;
    bitrixCamelId?: string;
    items: IFieldItem[];
}

/** Стадия воронки (подмножество IStage портала). */
export interface IStage {
    id?: number;
    name?: string;
    title?: string;
    code: string;
    /** STAGE_ID Битрикса (у лида — плоский STATUS_ID). */
    bitrixId: string;
    color?: string;
    /** Бэковый слепок хранит number (0/1), браузерный pbx-слепок — boolean. */
    isActive?: number | boolean;
}

/** Воронка/категория сделок или лида (подмножество IPCategory портала). */
export interface IPCategory {
    id?: number;
    code: string;
    group?: string;
    name?: string;
    title?: string;
    bitrixId: string;
    stages: IStage[];
}

/** Универсальный список Bitrix (подмножество IPBXList портала). */
export interface IPBXList {
    group: string;
    type: string;
    bitrixId: string | number;
    ID?: number;
    title?: string;
    name?: string;
    fields?: IField[];
    bitrixfields?: IField[];
}

/**
 * Рабочая группа звонков (подмножество IPCallingTasksGroup портала).
 * Ядро читает только bitrixId; type/group расширены до string: бэк держит
 * литералы ('calling', sales|service|tmc), браузерный pbx-слепок — PBX_GROUP.
 */
export interface IPCallingTasksGroup {
    type?: string;
    group?: string;
    bitrixId: number;
}

/** Секция сущности слепка: UF-поля (+ воронки у сделок/лида). */
export interface IPortalEntitySection {
    bitrixfields: IField[];
    categories?: IPCategory[];
}

/**
 * Слепок портала — подмножество IPortal, которого хватает девяти методам.
 * `deals` — массив по историческим причинам портальной модели: рабочая
 * запись всегда deals[0].
 */
export interface IPortal {
    domain: string;
    deals: Array<{ bitrixfields: IField[]; categories: IPCategory[] }>;
    company?: IPortalEntitySection;
    contact?: IPortalEntitySection;
    lead?: IPortalEntitySection;
    lists?: IPBXList[];
    bitrixLists?: IPBXList[];
    bitrixCallingTasksGroup?: IPCallingTasksGroup;
    callingGroups?: IPCallingTasksGroup[];
}

/**
 * Ключи списков для getListByCode — строится как `${group}_${type}`
 * (сигнатура снята с portal.model.ts).
 */
export type PBXListCode =
    | 'sales_kpi'
    | 'sales_history'
    | 'sales_presentation'
    | 'service_ork_history';

export interface FlowPortalSource {
    /** UF-поле сущности по pbx-коду. */
    getEntityFieldByCode(
        entityType: PbxEntityType,
        code: string,
    ): IField | undefined;

    /**
     * Полное имя UF_CRM-поля. `bitrixId` в слепке неоднороден:
     * konstructor-строки хранят полное имя («UF_CRM_1684144993»), остальные —
     * суффикс («CONTRACT_TYPE») — префикс не наклеивается дважды.
     */
    getFieldBitrixId(field: IField): string;

    /** Воронка сделок по pbx-коду (в бэке код — PbxDealCategoryCodeEnum). */
    getDealCategoryByCode(code: string): IPCategory | undefined;

    /** Все воронки сделок портала. */
    getDealCategories(): IPCategory[];

    /** Универсальный список по ключу `${group}_${type}`. */
    getListByCode(code: PBXListCode): IPBXList | undefined;

    /** IANA-таймзона клиентского портала (по домену; дефолт Europe/Moscow). */
    getTimezone(): ETimeZone;

    /** Item справочного поля по коду. */
    getFieldItemByCode(field: IField, itemCode: string): IFieldItem | undefined;

    /** Id рабочей группы задач отдела продаж (фолбэк бэка — 41). */
    getSalesTaskGroupId(): number;

    /** Весь слепок портала — для редких прямых обращений. */
    getPortal(): IPortal;
}

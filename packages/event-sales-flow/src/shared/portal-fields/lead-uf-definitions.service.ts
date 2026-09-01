// package-adapted: перенесены только чистые декларации (ILeadUfDefinition, LeadUfDefinitions) — сам LeadUfDefinitionsService (AppCacheService + чтение портала: lead.getFieldsList волной 1, batch.lead.getField волной 2) серверный; в пакете определения передаются параметром (вход EventReportLeadRequestSyncService), серверный кэш остаётся снаружи
import { CrmRefEntityType } from './crm-ref-format.util';

/** Определение одного UF-поля лида «как оно есть на портале». */
export interface ILeadUfDefinition {
    /** Живые названия вариантов enum: bitrixId item'а → название. */
    itemNames: Record<string, string>;
    /**
     * Типы сущностей, разрешённые в crm-поле (SETTINGS). Пусто — поле не
     * crm-типа либо привязки не заданы.
     */
    crmTypes: CrmRefEntityType[];
}

/** UF-имя поля (`UF_CRM_TO_BASE_SALES`) → его определение. */
export type LeadUfDefinitions = Record<string, ILeadUfDefinition>;

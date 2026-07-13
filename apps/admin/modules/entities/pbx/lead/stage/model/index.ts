import type {
    MapLeadStagesDto,
    MapLeadStageItemDto,
} from '@workspace/nest-pbx-install-api';

/** Тело сопоставления стадий лида (шаблон → STATUS_ID Bitrix). */
export type MapLeadStages = MapLeadStagesDto;
/** Одно сопоставление: код шаблонной стадии → STATUS_ID Bitrix. */
export type MapLeadStageItem = MapLeadStageItemDto;

/**
 * Доменные типы экрана сопоставления.
 *
 * Бэкенд отдаёт `LeadStageMappingScreen`, но в OpenAPI ответ задекларирован как
 * `void`, поэтому повторяем форму здесь и приводим тип в helper'е. При появлении
 * типизированного DTO в спеке — заменить на сгенерированные алиасы.
 */

/** Шаблонная стадия лида (из кода). */
export interface LeadStageTemplateItem {
    code: string;
    name: string;
    title: string;
    color: string;
    order: number;
    isActive: boolean;
}

/** Реальный статус лида в Bitrix (`crm.status.list`, ENTITY_ID=STATUS). */
export interface BitrixLeadStatus {
    STATUS_ID: string;
    NAME: string;
    [key: string]: unknown;
}

/** Текущая запись стадии в PortalDB (`btx_stages`). */
export interface PortalLeadStage {
    code: string;
    bitrixId: number | string | null;
    [key: string]: unknown;
}

/** Экран сопоставления: шаблон × статусы Bitrix × текущее сопоставление. */
export interface LeadStageMappingScreen {
    templateStages: LeadStageTemplateItem[];
    bitrixStatuses: BitrixLeadStatus[];
    portalStages: PortalLeadStage[];
}

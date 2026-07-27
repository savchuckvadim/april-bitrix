/**
 * Доменные алиасы generated DTO pbx-полей — бэк-переименования
 * локализуются здесь (паттерн CLAUDE.md model/index.ts).
 */
import type {
    PbxFieldItemDto,
    PbxFieldMetaDto,
    PbxFieldMetaDtoEntity,
    PbxFieldMetaDtoValueKind,
    PbxFieldUpdateRequestDtoFieldCode,
} from '@workspace/nest-kpi-report-sales-api';

/** Сущность Bitrix, на которой живёт значение поля. */
export type PbxFieldEntity = PbxFieldMetaDtoEntity;

/** Вид значения поля: enum (items по code) или date (ISO yyyy-MM-dd). */
export type PbxFieldValueKind = PbxFieldMetaDtoValueKind;

/** Код редактируемого поля — generated-whitelist бэка (EDITABLE_PBX_FIELDS). */
export type PbxFieldCode = PbxFieldUpdateRequestDtoFieldCode;

/** Элемент enum-поля: только семантический code + name (id остаются на бэке). */
export type PbxFieldItem = PbxFieldItemDto;

/** Метаданные редактируемого pbx-поля. */
export type PbxFieldMeta = PbxFieldMetaDto;

/** Запрос изменения значения поля. */
export interface PbxFieldUpdatePayload {
    fieldCode: PbxFieldCode;
    entityId: number;
    /** enum — code элемента; date — ISO yyyy-MM-dd; null — очистить. */
    value: string | null;
}

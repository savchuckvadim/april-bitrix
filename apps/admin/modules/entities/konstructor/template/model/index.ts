// Доменные алиасы шаблонов конструктора (`templates`) и их связей.
// UI и хуки импортируют только отсюда — переименование на бэке трогает лишь этот файл.
import type {
    CreateTemplateBaseDto,
    FieldResponseDto,
    TemplateBaseResponseDto,
    TemplateCounterDto,
    UpdateTemplateBaseDto,
    UpsertTemplateCounterDto,
} from '@workspace/nest-pbx-install-api';

/** Шаблон конструктора портала со связями (поля + счётчики). */
export type Template = TemplateBaseResponseDto;
/** Тело создания шаблона (нужен `portalId`). */
export type TemplateCreate = CreateTemplateBaseDto;
/** Тело частичного обновления шаблона. */
export type TemplateUpdate = UpdateTemplateBaseDto;
/** Связанное поле шаблона (`template_field`). */
export type TemplateFieldItem = FieldResponseDto;
/** Связанный счётчик шаблона (`template_counter`) с pivot. */
export type TemplateCounterItem = TemplateCounterDto;
/** Pivot-данные связи шаблон↔счётчик (create/update). */
export type TemplateCounterUpsert = UpsertTemplateCounterDto;

/** Скалярные поля формы шаблона (без `portalId`, он берётся из роутинга). */
export type TemplateFormValues = Omit<TemplateCreate, 'portalId'>;

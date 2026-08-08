import type { PBXField, PBXFieldItem } from '../entities/portal/type/portal-type';

/**
 * ЕДИНСТВЕННОЕ место сборки Bitrix-ключей из слепка портала (доктрина
 * docs/pbx-fields-system.md §7.2: «код → Portal → bitrixId»).
 *
 * До него по приложениям жили шесть копий `find(f => f.code) + 'UF_CRM_'+…`.
 * Правило формата: `PBXField.bitrixId` в слепке — суффикс БЕЗ префикса
 * (`OP_INN`), полный ключ (`UF_CRM_OP_INN`) добавляет только этот модуль.
 */

/** Поле слепка по коду; нет поля на портале — null (никаких throw, §5). */
export const findPortalField = (
    fields: PBXField[] | null | undefined,
    code: string,
): PBXField | null => fields?.find(field => field.code === code) ?? null;

/** Полный ключ Bitrix-поля: UF_CRM_<bitrixId>. */
export const ufKey = (field: PBXField): string => `UF_CRM_${field.bitrixId}`;

/** Ключ поля по коду одним вызовом; поля нет — null. */
export const findUfKey = (
    fields: PBXField[] | null | undefined,
    code: string,
): string | null => {
    const field = findPortalField(fields, code);
    return field ? ufKey(field) : null;
};

/** Значение поля из сырой сущности Битрикса по коду; поля нет — undefined. */
export const readFieldValue = (
    fields: PBXField[] | null | undefined,
    entity: Record<string, unknown> | null | undefined,
    code: string,
): unknown => {
    if (!entity) return undefined;
    const key = findUfKey(fields, code);
    return key ? entity[key] : undefined;
};

/** Item enumeration-поля по коду значения; нет — null. */
export const findFieldItemByCode = (
    field: PBXField | null | undefined,
    itemCode: string,
): PBXFieldItem | null =>
    field?.items?.find(item => item.code === itemCode) ?? null;

/** Item enumeration-поля по bitrixId значения (обратный резолв); нет — null. */
export const findFieldItemByBitrixId = (
    field: PBXField | null | undefined,
    bitrixId: number | string,
): PBXFieldItem | null =>
    field?.items?.find(item => String(item.bitrixId) === String(bitrixId)) ??
    null;

import { findFieldItemByBitrixId, ufKey } from '@workspace/pbx';
import type { PBXField, PBXFieldItem } from '../../portal';

/**
 * Поле сущности в легаси-форме EntityFormFieldDto (bxDealItems / bxCompanyItems):
 * отчёт о поставке и заявка RPA читают его по коду — `field.code`, `current`.
 * items не передаём: бэку нужен только выбранный вариант, а whitelist их всё равно срежет.
 */
export interface PbxEntityItem {
    field: {
        id: number;
        name: string;
        title: string;
        code: string;
        type: string;
        bitrixId: string;
        bitrixCamelId: string;
        entity_id: number;
        parent_type: string;
        items: never[];
    };
    bitrixId: string;
    current: PBXFieldItem | string | null;
    isRequired: boolean;
    items: never[];
}

export interface PbxEntityItemsInput {
    fields: PBXField[] | null | undefined;
    entity: Record<string, unknown> | null | undefined;
    codes: string[];
    /** Значения, которые правил менеджер на экране (по коду) — сильнее сущности */
    overrides?: Record<string, string>;
    requiredCodes?: string[];
}

const stubField = (code: string): PbxEntityItem['field'] => ({
    id: 0,
    name: code,
    title: code,
    code,
    type: 'string',
    bitrixId: '',
    bitrixCamelId: '',
    entity_id: 0,
    parent_type: '',
    items: [],
});

const currentOf = (field: PBXField | null, raw: unknown, override: string | undefined): PbxEntityItem['current'] => {
    if (override !== undefined) return override;
    if (raw === null || raw === undefined || raw === '') return null;
    if (field?.type === 'enumeration') {
        const item = findFieldItemByBitrixId(field, String(Array.isArray(raw) ? raw[0] : raw));
        return item ?? null;
    }
    if (Array.isArray(raw)) return raw.map(String).join(', ');
    return typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
};

/**
 * Поля сделки/компании по кодам: значение из сущности Bitrix (UF_CRM_<bitrixId>),
 * у enumeration — выбранный вариант. Поля, которых нет на портале, идут
 * заглушкой с пустым current: бэк ждёт все ключи PbxDealDto.
 */
export const buildPbxEntityItems = (input: PbxEntityItemsInput): Record<string, PbxEntityItem> => {
    const result: Record<string, PbxEntityItem> = {};
    for (const code of input.codes) {
        const field = input.fields?.find(candidate => candidate.code === code) ?? null;
        const raw = field && input.entity ? input.entity[ufKey(field)] : undefined;
        result[code] = {
            field: field
                ? {
                      id: field.id,
                      name: field.name,
                      title: field.title,
                      code: field.code,
                      type: field.type,
                      bitrixId: field.bitrixId,
                      bitrixCamelId: field.bitrixCamelId,
                      entity_id: field.entity_id,
                      parent_type: field.parent_type,
                      items: [],
                  }
                : stubField(code),
            bitrixId: field?.bitrixId ?? '',
            current: currentOf(field, raw, input.overrides?.[code]),
            isRequired: input.requiredCodes?.includes(code) ?? false,
            items: [],
        };
    }
    return result;
};

/** Только поля, которые есть на портале (для компании: отсутствующие в payload не нужны). */
export const buildPresentPbxEntityItems = (input: PbxEntityItemsInput): Record<string, PbxEntityItem> => {
    const present = input.codes.filter(code => input.fields?.some(field => field.code === code));
    return buildPbxEntityItems({ ...input, codes: present });
};

import type {
    PbxTemplateCategory,
    PbxTemplateField,
} from './model/common';

/**
 * Smart/RPA template (`parse`) endpoints return the whole entity model and are
 * typed `void` in the spec. These helpers tolerantly dig out the `fields` /
 * `categories` arrays whether the payload is the model itself, an array, or
 * wrapped under `smart`/`smarts`/`rpa`/`data`.
 */
function pickModel(data: unknown): Record<string, unknown> | undefined {
    if (data === null || typeof data !== 'object') return undefined;

    const root = data as Record<string, unknown>;
    for (const key of ['smart', 'smarts', 'rpa', 'data'] as const) {
        const value = root[key];
        if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
            return value[0] as Record<string, unknown>;
        }
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return value as Record<string, unknown>;
        }
    }
    if (Array.isArray(data) && data.length && typeof data[0] === 'object') {
        return data[0] as Record<string, unknown>;
    }
    return root;
}

export function extractTemplateFields(data: unknown): PbxTemplateField[] {
    const model = pickModel(data);
    const fields = model?.fields;
    return Array.isArray(fields) ? (fields as PbxTemplateField[]) : [];
}

export function extractTemplateCategories(data: unknown): PbxTemplateCategory[] {
    const model = pickModel(data);
    const categories = model?.categories;
    return Array.isArray(categories)
        ? (categories as PbxTemplateCategory[])
        : [];
}

import type {
    PbxBitrixField,
    PbxBitrixListItem,
    PbxFieldCompareRow,
    PbxFieldsMonitoringData,
    PbxInstalledField,
    PbxNormalizedField,
    PbxNormalizedItem,
    PbxTemplateField,
} from '../../../lib/model/common';

/* ------------------------------------------------------------------ *
 * Bitrix field shape normalisation.
 *
 * CRM entities (Deal/Company/Contact) come from `crm.{entity}.userfield.*` and
 * use UPPERCASE keys (`FIELD_NAME`, `XML_ID`, `USER_TYPE_ID`, `LIST`). Typed
 * entities (RPA / smart-process) come from `userfieldconfig.list` and use
 * camelCase (`fieldName`, `xmlId`, `userTypeId`, `enum`). Normalise both into the
 * uppercase `PbxBitrixField` shape the rest of this module (and the compare table)
 * expects, so matching by `XML_ID` and enum-item merge work for either source.
 * ------------------------------------------------------------------ */

function pickStr(o: Record<string, unknown>, ...keys: string[]): string | undefined {
    for (const k of keys) {
        const v = o[k];
        if (v !== undefined && v !== null) return String(v);
    }
    return undefined;
}

function normalizeBitrixListItem(raw: unknown): PbxBitrixListItem {
    const o = (raw ?? {}) as Record<string, unknown>;
    return {
        ...o,
        ID: pickStr(o, 'ID', 'id') ?? '',
        VALUE: pickStr(o, 'VALUE', 'value') ?? '',
        XML_ID: pickStr(o, 'XML_ID', 'xmlId') ?? '',
        SORT: pickStr(o, 'SORT', 'sort'),
        DEF: pickStr(o, 'DEF', 'def'),
    };
}

/** Coerce a raw Bitrix field (uppercase CRM or camelCase typed-entity) to `PbxBitrixField`. */
export function normalizeBitrixField(raw: PbxBitrixField): PbxBitrixField {
    const o = (raw ?? {}) as unknown as Record<string, unknown>;
    const list = o.LIST ?? o.enum ?? o.list;
    return {
        ...o,
        ID: pickStr(o, 'ID', 'id') ?? '',
        FIELD_NAME: pickStr(o, 'FIELD_NAME', 'fieldName') ?? '',
        XML_ID: pickStr(o, 'XML_ID', 'xmlId') ?? '',
        ENTITY_ID: pickStr(o, 'ENTITY_ID', 'entityId'),
        USER_TYPE_ID: pickStr(o, 'USER_TYPE_ID', 'userTypeId'),
        MULTIPLE: pickStr(o, 'MULTIPLE', 'multiple'),
        MANDATORY: pickStr(o, 'MANDATORY', 'mandatory'),
        LIST: Array.isArray(list) ? list.map(normalizeBitrixListItem) : undefined,
    };
}

/* ------------------------------------------------------------------ *
 * Item normalisation (template list ↔ Bitrix LIST ↔ PortalDB items)
 * ------------------------------------------------------------------ */

function mergeItems(
    template: PbxTemplateField | undefined,
    portal: PbxInstalledField | undefined,
    bitrix: PbxBitrixField | undefined,
): PbxNormalizedItem[] {
    const rows = new Map<string, PbxNormalizedItem>();

    for (const item of template?.list ?? []) {
        const code = item.CODE || item.XML_ID;
        if (!code) continue;
        rows.set(code, {
            code,
            name: item.VALUE,
            template: item,
            inTemplate: true,
            inBitrix: false,
            inDb: false,
        });
    }
    for (const item of portal?.items ?? []) {
        const existing = rows.get(item.code);
        if (existing) {
            existing.portal = item;
            existing.inDb = true;
        } else {
            rows.set(item.code, {
                code: item.code,
                name: item.name || item.title,
                portal: item,
                inTemplate: false,
                inBitrix: false,
                inDb: true,
            });
        }
    }
    for (const item of bitrix?.LIST ?? []) {
        const code = item.XML_ID;
        const existing = rows.get(code);
        if (existing) {
            existing.bitrix = item;
            existing.inBitrix = true;
        } else {
            rows.set(code, {
                code,
                name: item.VALUE,
                bitrix: item,
                inTemplate: false,
                inBitrix: true,
                inDb: false,
            });
        }
    }

    return Array.from(rows.values());
}

/* ------------------------------------------------------------------ *
 * Field normalisation
 * ------------------------------------------------------------------ */

function normFromPortal(p: PbxInstalledField): PbxNormalizedField {
    return {
        code: p.code,
        name: p.name || p.title,
        type: p.type,
        bitrixName: p.bitrixId == null ? undefined : String(p.bitrixId),
        portal: p,
        items: mergeItems(undefined, p, undefined),
        inDb: true,
        inBitrix: Boolean(p.bitrixId),
    };
}

function normFromBitrix(bx: PbxBitrixField): PbxNormalizedField {
    return {
        code: bx.XML_ID,
        name: bx.FIELD_NAME,
        type: bx.USER_TYPE_ID,
        bitrixName: bx.FIELD_NAME,
        bitrix: bx,
        items: mergeItems(undefined, undefined, bx),
        inDb: false,
        inBitrix: true,
    };
}

function normMerged(
    p: PbxInstalledField,
    bx: PbxBitrixField,
): PbxNormalizedField {
    return {
        code: p.code || bx.XML_ID,
        name: p.name || p.title || bx.FIELD_NAME,
        type: p.type || bx.USER_TYPE_ID,
        bitrixName: p.bitrixId != null ? String(p.bitrixId) : bx.FIELD_NAME,
        portal: p,
        bitrix: bx,
        items: mergeItems(undefined, p, bx),
        inDb: true,
        inBitrix: true,
    };
}

/**
 * Normalises a monitoring response into per-field reps (portal + bitrix) with
 * merged enum items. Tolerates the full envelope
 * (`mergedFields` / `portalFieldsWithoutMerged` / `bitrixFieldsWithoutMerged`),
 * a synthesised `{ fields }` shape, or a bare portal-field array.
 */
export function toNormalizedFields(
    data: PbxFieldsMonitoringData | PbxInstalledField[] | undefined | null,
): PbxNormalizedField[] {
    if (!data) return [];
    if (Array.isArray(data)) return data.map(normFromPortal);

    const out: PbxNormalizedField[] = [];
    if (Array.isArray(data.mergedFields)) {
        for (const entry of data.mergedFields) {
            const bx = entry.bx ? normalizeBitrixField(entry.bx) : null;
            if (entry.p && bx) out.push(normMerged(entry.p, bx));
            else if (entry.p) out.push(normFromPortal(entry.p));
            else if (bx) out.push(normFromBitrix(bx));
        }
    }
    for (const p of data.portalFieldsWithoutMerged ?? []) out.push(normFromPortal(p));
    for (const bx of data.bitrixFieldsWithoutMerged ?? [])
        out.push(normFromBitrix(normalizeBitrixField(bx)));

    // Adapters that synthesise a plain `{ fields }` list (e.g. User).
    if (out.length === 0 && Array.isArray(data.fields)) {
        return data.fields.map(normFromPortal);
    }
    return out;
}

/* ------------------------------------------------------------------ *
 * Template + compare-row building
 * ------------------------------------------------------------------ */

/** Coerce a template (`parse`) response into a flat array. */
export function toTemplateFields(data: unknown): PbxTemplateField[] {
    if (!data) return [];
    if (Array.isArray(data)) return data as PbxTemplateField[];
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.fields)) return obj.fields as PbxTemplateField[];
    if (Array.isArray(obj.data)) return obj.data as PbxTemplateField[];
    return [];
}

/**
 * Merges template fields with normalised installed fields by `code` into the
 * three-source compare table, also merging enum items per row.
 */
const toStr = (v?: unknown) =>
    typeof v === 'string' ? v : v == null ? '' : String(v);

const codeKey = (code?: unknown) => toStr(code).trim().toLowerCase();

/**
 * Derives a logical field code from a Bitrix UF field name by stripping the
 * `UF_<ENTITY>[_<id>]_` prefix: `UF_RPA_1_SALE_DATE` → `sale_date`,
 * `UF_CRM_SALE_DATE` → `sale_date`. Matches the template `code` and is used as a
 * fallback when Bitrix's `userfieldconfig.list` omits `XML_ID`.
 */
const fieldNameKey = (fieldName?: unknown) => {
    const raw = toStr(fieldName).trim();
    if (!raw) return '';
    return raw.replace(/^UF_[A-Z]+(?:_\d+)?_/i, '').toLowerCase();
};

export function buildFieldCompareRows(
    template: PbxTemplateField[],
    installed: PbxNormalizedField[],
): PbxFieldCompareRow[] {
    const templateList = Array.isArray(template) ? template : [];
    const installedList = Array.isArray(installed) ? installed : [];
    const templateByCode = new Map(templateList.map((f) => [codeKey(f.code), f]));

    // Index of any token (template code OR its bxFieldName suffix) → the row key
    // (= template code-key) it belongs to. Lets a Bitrix-only field with a null
    // XML_ID still snap onto its template row via the UF field-name suffix.
    const keyByToken = new Map<string, string>();
    for (const f of templateList) {
        const key = codeKey(f.code);
        keyByToken.set(key, key);
        const suffix = fieldNameKey(f.bxFieldName);
        if (suffix && !keyByToken.has(suffix)) keyByToken.set(suffix, key);
    }

    const rows = new Map<string, PbxFieldCompareRow>();

    for (const field of templateList) {
        rows.set(codeKey(field.code), {
            code: field.code,
            name: field.name,
            type: field.type,
            template: field,
            inTemplate: true,
            inBitrix: false,
            inDb: false,
            items: mergeItems(field, undefined, undefined),
        });
    }

    for (const field of installedList) {
        const byCode = codeKey(field.code);
        const bySuffix = fieldNameKey(field.bitrixName);
        // Resolve which row this installed field belongs to: its own code if a
        // row already exists, else a template row matched by code or suffix, else
        // a stable non-empty fallback so code-less Bitrix fields never collapse.
        const key =
            (byCode && rows.has(byCode) && byCode) ||
            keyByToken.get(byCode) ||
            keyByToken.get(bySuffix) ||
            byCode ||
            bySuffix ||
            codeKey(field.bitrixName);

        const tpl = templateByCode.get(key);
        const existing = rows.get(key);
        const items = mergeItems(tpl, field.portal, field.bitrix);
        if (existing) {
            existing.installed = field;
            existing.inBitrix = field.inBitrix;
            existing.inDb = field.inDb;
            existing.type = existing.type ?? field.type;
            existing.items = items;
        } else {
            rows.set(key, {
                code: field.code || field.bitrixName || key,
                name: field.name || field.bitrixName || key,
                type: field.type,
                installed: field,
                inTemplate: false,
                inBitrix: field.inBitrix,
                inDb: field.inDb,
                items,
            });
        }
    }

    return Array.from(rows.values());
}

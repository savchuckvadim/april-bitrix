import type {
    PbxCategoriesMonitoringData,
    PbxCategoryCompareRow,
    PbxInstalledCategory,
    PbxStageCompareRow,
    PbxTemplateCategory,
} from '../../../lib/model/common';

/**
 * Normalises a monitoring response into a flat installed-category array.
 * Tolerates a bare array, `{ categories }`, or a fields-style envelope
 * `{ mergedCategories: [{ p, bx }], portalCategoriesWithoutMerged }` — taking the
 * PortalDB rep `p` (which carries `bitrixId` + `stages`, so Bitrix presence is
 * still derivable). Adjust if the category monitoring shape differs.
 */
export function toInstalledCategories(
    data: PbxCategoriesMonitoringData | PbxInstalledCategory[] | undefined | null,
): PbxInstalledCategory[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.categories)) return data.categories;

    const obj = data as Record<string, unknown>;
    const merged = obj.mergedCategories;
    if (Array.isArray(merged)) {
        const out: PbxInstalledCategory[] = [];
        for (const entry of merged) {
            const p = (entry as Record<string, unknown>)?.p;
            if (p) out.push(p as PbxInstalledCategory);
        }
        const portalOnly = obj.portalCategoriesWithoutMerged;
        if (Array.isArray(portalOnly)) {
            for (const p of portalOnly) out.push(p as PbxInstalledCategory);
        }
        return out;
    }
    return [];
}

/** Normalises a template (`parse`) response into a flat category array. */
export function toTemplateCategories(data: unknown): PbxTemplateCategory[] {
    if (!data) return [];
    if (Array.isArray(data)) return data as PbxTemplateCategory[];
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.categories))
        return obj.categories as PbxTemplateCategory[];
    if (Array.isArray(obj.data)) return obj.data as PbxTemplateCategory[];
    return [];
}

function mergeStages(
    categoryCode: string,
    template: PbxTemplateCategory | undefined,
    installed: PbxInstalledCategory | undefined,
): PbxStageCompareRow[] {
    const rows = new Map<string, PbxStageCompareRow>();
    const templateStages = Array.isArray(template?.stages) ? template!.stages : [];
    const installedStages = Array.isArray(installed?.stages)
        ? installed!.stages
        : [];

    for (const stage of templateStages) {
        rows.set(stage.code, {
            code: stage.code,
            name: stage.name,
            categoryCode,
            template: stage,
            inTemplate: true,
            inBitrix: false,
            inDb: false,
        });
    }

    for (const stage of installedStages) {
        const inBitrix = Boolean(stage.bitrixId);
        const existing = rows.get(stage.code);
        if (existing) {
            existing.installed = stage;
            existing.inBitrix = inBitrix;
            existing.inDb = true;
        } else {
            rows.set(stage.code, {
                code: stage.code,
                name: stage.name || stage.title,
                categoryCode,
                installed: stage,
                inTemplate: false,
                inBitrix,
                inDb: true,
            });
        }
    }

    return Array.from(rows.values());
}

/**
 * Merges template categories with installed (Bitrix + PortalDB) categories by
 * `code`, with nested stage merge. An installed category counts as present in
 * Bitrix when it has a non-empty `bitrixId`, and in PortalDB by being returned.
 */
export function buildCategoryCompareRows(
    template: PbxTemplateCategory[],
    installed: PbxInstalledCategory[],
): PbxCategoryCompareRow[] {
    const templateByCode = new Map(
        (Array.isArray(template) ? template : []).map((c) => [c.code, c]),
    );
    const installedByCode = new Map(
        (Array.isArray(installed) ? installed : []).map((c) => [c.code, c]),
    );
    const codes = new Set<string>([
        ...templateByCode.keys(),
        ...installedByCode.keys(),
    ]);

    const rows: PbxCategoryCompareRow[] = [];
    for (const code of codes) {
        const tpl = templateByCode.get(code);
        const inst = installedByCode.get(code);
        rows.push({
            code,
            name: tpl?.name ?? inst?.name ?? inst?.title ?? code,
            template: tpl,
            installed: inst,
            inTemplate: Boolean(tpl),
            inBitrix: Boolean(inst?.bitrixId),
            inDb: Boolean(inst),
            stages: mergeStages(code, tpl, inst),
        });
    }
    return rows;
}

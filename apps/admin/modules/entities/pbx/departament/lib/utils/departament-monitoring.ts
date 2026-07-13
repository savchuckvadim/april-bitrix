import type { PbxGroup } from '../../../lib/model/common';

/** A Bitrix department (from `department.get`), normalised for the picker. */
export interface BitrixDepartmentRow {
    id: string;
    name: string;
    parentId?: string;
}

/** Department slots: which department group maps to which label. */
export const DEPARTAMENT_SLOTS: {
    value: PbxGroup;
    label: string;
    title: string;
}[] = [
    { value: 'sales', label: 'Sales · ОП', title: 'ОП' },
    { value: 'service', label: 'Service · ОС', title: 'ОС' },
];

function asArray(data: unknown): unknown[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        for (const key of [
            'result',
            'departments',
            'bitrixDepartments',
            'items',
            'data',
        ]) {
            if (Array.isArray(obj[key])) return obj[key] as unknown[];
        }
    }
    return [];
}

/**
 * A department currently linked in PortalDB (the "current" state), enriched with
 * the Bitrix name when the merge succeeded.
 */
export interface CurrentDepartament {
    id?: number;
    group: PbxGroup;
    bitrixId: string;
    name: string;
    title: string;
    /** Name as it currently exists in Bitrix (from the merged `bx` side). */
    bitrixName?: string;
}

function asPbxGroup(value: unknown): PbxGroup | undefined {
    return value === 'sales' || value === 'service' ? value : undefined;
}

/**
 * Extracts the current PortalDB department assignments from the merged monitoring
 * envelope (`{ merged, portalWithoutMerged, bitrixWithoutMerged }`). These are the
 * rows the user has already linked — i.e. which Bitrix department is ОП / ОС.
 */
export function toCurrentDepartaments(data: unknown): CurrentDepartament[] {
    if (!data || typeof data !== 'object') return [];
    const obj = data as Record<string, unknown>;

    const result: CurrentDepartament[] = [];

    const pushFromPortal = (p: unknown, bx?: unknown) => {
        if (!p || typeof p !== 'object') return;
        const o = p as Record<string, unknown>;
        const group = asPbxGroup(o.group);
        if (!group) return;
        const bId = o.bitrixId;
        const bxo = (bx ?? {}) as Record<string, unknown>;
        result.push({
            id: typeof o.id === 'number' ? o.id : undefined,
            group,
            bitrixId:
                bId === undefined || bId === null ? '' : String(bId),
            name: String(o.name ?? ''),
            title: String(o.title ?? ''),
            bitrixName:
                bxo.NAME !== undefined && bxo.NAME !== null
                    ? String(bxo.NAME)
                    : undefined,
        });
    };

    if (Array.isArray(obj.merged)) {
        for (const m of obj.merged as unknown[]) {
            const mo = (m ?? {}) as Record<string, unknown>;
            pushFromPortal(mo.p, mo.bx);
        }
    }
    if (Array.isArray(obj.portalWithoutMerged)) {
        for (const p of obj.portalWithoutMerged as unknown[]) {
            pushFromPortal(p);
        }
    }

    return result;
}

/** Normalises the Bitrix `department.get` response into picker rows. */
export function toBitrixDepartmentRows(data: unknown): BitrixDepartmentRow[] {
    return asArray(data)
        .map((d) => {
            const o = (d ?? {}) as Record<string, unknown>;
            const id = o.ID ?? o.id;
            const parent = o.PARENT ?? o.parentId ?? o.parent;
            return {
                id: id === undefined || id === null ? '' : String(id),
                name: String(o.NAME ?? o.name ?? '(без названия)'),
                parentId:
                    parent === undefined || parent === null
                        ? undefined
                        : String(parent),
            };
        })
        .filter((r) => r.id);
}

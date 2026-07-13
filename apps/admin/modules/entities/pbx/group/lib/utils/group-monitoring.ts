import type { PbxGroup } from '../../../lib/model/common';

/** A calling group row, normalised across Bitrix (`sonet_group`) + PortalDB. */
export interface GroupMonitoringRow {
    key: string;
    name: string;
    bitrixId: string;
    /** Department group this calling belongs to, if known. */
    group?: string;
    inBitrix: boolean;
    inDb: boolean;
}

/** Fixed calling-group slots: which department group maps to which group name. */
export const CALLING_GROUP_SLOTS: {
    value: PbxGroup;
    label: string;
    title: string;
}[] = [
    { value: 'sales', label: 'Sales · ОП', title: 'ОП Звонки' },
    { value: 'service', label: 'Service · ОС', title: 'ОС Звонки' },
];

function asRecord(v: unknown): Record<string, unknown> | undefined {
    return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

function str(v: unknown): string {
    return v === undefined || v === null ? '' : String(v);
}

function rowFromBitrix(bx: Record<string, unknown>, inDb: boolean): GroupMonitoringRow {
    return {
        key: `bx-${str(bx.ID)}`,
        name: str(bx.NAME) || str(bx.name) || '(без названия)',
        bitrixId: str(bx.ID),
        group: str(bx.group) || undefined,
        inBitrix: true,
        inDb,
    };
}

function rowFromPortal(p: Record<string, unknown>, inBitrix: boolean): GroupMonitoringRow {
    return {
        key: `db-${str(p.id) || str(p.code) || str(p.bitrixId)}`,
        name: str(p.title) || str(p.name) || '(без названия)',
        bitrixId: str(p.bitrixId),
        group: str(p.group) || str(p.type) || undefined,
        inBitrix,
        inDb: true,
    };
}

/**
 * Normalises the calling-group monitoring envelope
 * `{ merged, portalWithoutMerged, bitrixWithoutMerged }` into flat rows with
 * Bitrix/PortalDB presence. Each `merged` entry may be `{ p, bx }` or flat.
 */
export function toGroupRows(data: unknown): GroupMonitoringRow[] {
    const obj = asRecord(data);
    if (!obj) return [];
    const rows: GroupMonitoringRow[] = [];

    for (const entry of Array.isArray(obj.merged) ? obj.merged : []) {
        const rec = asRecord(entry);
        if (!rec) continue;
        const bx = asRecord(rec.bx);
        const p = asRecord(rec.p);
        rows.push({
            key: `m-${str(bx?.ID ?? p?.bitrixId ?? rec.ID ?? rec.id)}`,
            name:
                str(bx?.NAME) ||
                str(p?.title) ||
                str(p?.name) ||
                str(rec.NAME) ||
                str(rec.name) ||
                '(без названия)',
            bitrixId: str(bx?.ID ?? p?.bitrixId ?? rec.ID ?? rec.bitrixId),
            group: str(p?.group ?? p?.type ?? bx?.group) || undefined,
            inBitrix: true,
            inDb: true,
        });
    }
    for (const entry of Array.isArray(obj.portalWithoutMerged)
        ? obj.portalWithoutMerged
        : []) {
        const rec = asRecord(entry);
        if (rec) rows.push(rowFromPortal(rec, false));
    }
    for (const entry of Array.isArray(obj.bitrixWithoutMerged)
        ? obj.bitrixWithoutMerged
        : []) {
        const rec = asRecord(entry);
        if (rec) rows.push(rowFromBitrix(rec, false));
    }
    return rows;
}

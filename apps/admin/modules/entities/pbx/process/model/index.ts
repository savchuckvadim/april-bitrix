import type { PbxAxisOption } from '../../fields';

/** One row in the process list: an available process type + its install state. */
export interface PbxProcessRow {
    code: string;
    label: string;
    installed: boolean;
    /** Installed record (ids etc.) found in the monitoring payload, if any. */
    details: Record<string, unknown> | null;
    /** Present in the install template (always true — the row comes from it). */
    inTemplate: boolean;
    /** Found in the Bitrix side of the monitoring payload. */
    inBitrix: boolean;
    /** Found in the PortalDB side of the monitoring payload. */
    inDb: boolean;
    /** Group this record belongs to (sales/service/general), if resolvable. */
    group?: string;
    /** Bitrix entityTypeId / typeId, if resolvable. */
    entityTypeId?: string;
    /** Best-effort count of fields embedded in the record. */
    fieldCount?: number;
    /** Best-effort count of funnels (categories) embedded in the record. */
    funnelCount?: number;
    /** Best-effort count of stages embedded in the record. */
    stageCount?: number;
}

/**
 * Best-effort characteristics extracted from the monitoring payload for one
 * process code. All fields optional — the manager fills sensible defaults and
 * renders `—` when a value is absent (the monitoring shape is unverified, see the
 * `void`-spec note in `lib/model/common.ts`).
 */
export type PbxProcessDescription = Partial<
    Pick<
        PbxProcessRow,
        | 'inBitrix'
        | 'inDb'
        | 'group'
        | 'entityTypeId'
        | 'fieldCount'
        | 'funnelCount'
        | 'stageCount'
    >
>;

/**
 * Descriptor for a multi-instance pbx process entity (Smart / RPA). Drives the
 * reusable `PbxProcessManager`: a list of available process types with full
 * install (type + fields + funnels/stages) and delete, plus install status read
 * from the monitoring payload.
 */
export interface PbxProcessAdapter {
    readonly key: string;
    /** Panel title, e.g. "RPA-процессы". */
    readonly label: string;
    /** Singular item label, e.g. "RPA" / "Смарт". */
    readonly itemLabel: string;
    /** Available process types (supply/presentation, or the smart names). */
    readonly variantOptions: PbxAxisOption[];
    readonly groupOptions: PbxAxisOption[];

    getMonitoring: (domain: string) => Promise<unknown>;
    /** Locate the installed record for a process code in the monitoring payload. */
    findInstalled: (
        monitoring: unknown,
        code: string,
    ) => Record<string, unknown> | null;
    /**
     * Extract richer per-row characteristics (presence, ids, counts) from the
     * monitoring payload. Optional — when absent the manager uses
     * `describeProcessRecord` as the tolerant default.
     */
    describe?: (
        monitoring: unknown,
        code: string,
        group: string,
    ) => PbxProcessDescription;
    /** Install the whole process: type + fields + funnels/stages. */
    install: (domain: string, code: string, group: string) => Promise<void>;
    remove: (
        domain: string,
        code: string,
        group: string,
        withBitrix: boolean,
    ) => Promise<void>;
}

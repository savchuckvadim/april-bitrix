import type { PbxProcessDescription } from '../../model';
import { findProcessRecord } from './find-process';

const ENTITY_TYPE_KEYS = ['entityTypeId', 'entity_type_id', 'typeId', 'ENTITY_TYPE_ID'];
const GROUP_KEYS = ['group', 'GROUP', 'typedGroup'];
const FIELD_KEYS = ['fields', 'mergedFields', 'FIELDS'];
const FUNNEL_KEYS = ['categories', 'funnels', 'CATEGORIES'];
const STAGE_KEYS = ['stages', 'STAGES'];

function firstString(
    obj: Record<string, unknown>,
    keys: string[],
): string | undefined {
    for (const k of keys) {
        const v = obj[k];
        if (v !== undefined && v !== null && v !== '') return String(v);
    }
    return undefined;
}

function countArray(obj: Record<string, unknown>, keys: string[]): number | undefined {
    for (const k of keys) {
        const v = obj[k];
        if (Array.isArray(v)) return v.length;
    }
    return undefined;
}

/** Sum of stage arrays nested under any funnel/category array on the record. */
function countNestedStages(obj: Record<string, unknown>): number | undefined {
    for (const k of FUNNEL_KEYS) {
        const v = obj[k];
        if (!Array.isArray(v)) continue;
        let total = 0;
        let found = false;
        for (const cat of v) {
            if (cat && typeof cat === 'object') {
                const stages = countArray(cat as Record<string, unknown>, STAGE_KEYS);
                if (stages !== undefined) {
                    total += stages;
                    found = true;
                }
            }
        }
        if (found) return total;
    }
    return countArray(obj, STAGE_KEYS);
}

/**
 * Tolerant default for `PbxProcessAdapter.describe`. The pbx-install monitoring
 * endpoints are typed `void` in the OpenAPI spec, so the exact envelope shape is
 * unverified — this walks the payload best-effort and returns whatever it can
 * resolve. Presence is split into Bitrix vs PortalDB by searching the `bx*` and
 * `portal*` subtrees separately; everything else is read off the first matching
 * record. Refine the key lists once the backend annotates Swagger.
 */
export function describeProcessRecord(
    monitoring: unknown,
    code: string,
    group: string,
): PbxProcessDescription {
    const root = (monitoring ?? {}) as Record<string, unknown>;

    const bxSubtree: Record<string, unknown> = {};
    const portalSubtree: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(root)) {
        const lower = k.toLowerCase();
        if (lower.startsWith('bx') || lower.startsWith('bitrix')) bxSubtree[k] = v;
        else if (lower.startsWith('portal')) portalSubtree[k] = v;
    }

    const hasBxSubtree = Object.keys(bxSubtree).length > 0;
    const hasPortalSubtree = Object.keys(portalSubtree).length > 0;

    const bxRecord = hasBxSubtree
        ? findProcessRecord(bxSubtree, code)
        : findProcessRecord(monitoring, code);
    const portalRecord = hasPortalSubtree
        ? findProcessRecord(portalSubtree, code)
        : bxRecord;
    const anyRecord = bxRecord ?? portalRecord;

    const desc: PbxProcessDescription = {
        // When the payload separates bx/portal subtrees we can trust each side;
        // otherwise fall back to "found anywhere" for both.
        inBitrix: hasBxSubtree ? !!bxRecord : !!anyRecord,
        inDb: hasPortalSubtree ? !!portalRecord : !!anyRecord,
        group,
    };

    if (anyRecord) {
        desc.entityTypeId = firstString(anyRecord, ENTITY_TYPE_KEYS);
        desc.group = firstString(anyRecord, GROUP_KEYS) ?? group;
        desc.fieldCount = countArray(anyRecord, FIELD_KEYS);
        desc.funnelCount = countArray(anyRecord, FUNNEL_KEYS);
        desc.stageCount = countNestedStages(anyRecord);
    }

    return desc;
}

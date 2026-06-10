import type {
    PbxSmartDefinitionDto,
    PbxCategoryDefinitionDto,
    PbxStageDefinitionDto,
    PbxFieldDefinitionDto,
    PbxFieldItemDefinitionDto,
} from '@workspace/nest-api';
import type { SmartResponseDto } from '@/modules/entities/portal-bitrix/btx-smarts';
import type { PbxCategory } from '@/modules/entities/portal-bitrix/btx-categories';
import type { PbxField } from '@/modules/entities/portal-bitrix/bitrix-fields';
import type {
    PbxNodeStatus,
    PbxFieldItemDiffNode,
    PbxFieldDiffNode,
    PbxStageDiffNode,
    PbxCategoryDiffNode,
    PbxSmartDiffNode,
} from '../../model/types';

// ---------------------------------------------------------------------------
// Matching key conventions
//
// Smart:    template.code  ↔  installed.name
//           (SmartResponseDto.name is the stable internal code set at creation)
//
// Category: template.code  ↔  installed.code
//
// Stage:    template.code — no installed entity yet, always 'missing'
//
// Field:    template.code  ↔  installed.code
//
// Item:     template.code — no installed entity yet, always 'missing'
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Field items
// ---------------------------------------------------------------------------

export function diffFieldItems(
    templateItems: PbxFieldItemDefinitionDto[],
): PbxFieldItemDiffNode[] {
    return templateItems.map((item) => ({
        template: item,
        installed: null,
        // Items are not yet tracked individually in the DB.
        // Treat all as missing until the back-end exposes a per-item entity.
        status: 'missing' as PbxNodeStatus,
    }));
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export function diffFields(
    templateFields: PbxFieldDefinitionDto[],
    installedFields: PbxField[],
): PbxFieldDiffNode[] {
    const installedByCode = new Map<string, PbxField>(
        installedFields.map((f) => [f.code, f]),
    );

    return templateFields.map((tmpl) => {
        const installed = installedByCode.get(tmpl.code) ?? null;
        const items = diffFieldItems(tmpl.items ?? []);
        const allItemsMissing = items.every((i) => i.status === 'missing');
        const hasItems = items.length > 0;

        let status: PbxNodeStatus;
        if (!installed) {
            status = 'missing';
        } else if (hasItems && allItemsMissing) {
            // Field exists but its enum variants are not yet synced
            status = 'partial';
        } else {
            status = 'installed';
        }

        return { template: tmpl, installed, status, items };
    });
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

export function diffStages(
    templateStages: PbxStageDefinitionDto[],
): PbxStageDiffNode[] {
    // Stages are not yet stored as separate DB records.
    // Return them all as 'missing' so the UI can plan install.
    return templateStages.map((stage) => ({
        template: stage,
        installed: null,
        status: 'missing' as PbxNodeStatus,
    }));
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export function diffCategories(
    templateCategories: PbxCategoryDefinitionDto[],
    installedCategories: PbxCategory[],
): PbxCategoryDiffNode[] {
    const installedByCode = new Map<string, PbxCategory>(
        installedCategories.map((c) => [c.code, c]),
    );

    return templateCategories.map((tmpl) => {
        const installed = installedByCode.get(tmpl.code) ?? null;
        const stages = diffStages(tmpl.stages ?? []);
        const allStagesMissing = stages.every((s) => s.status === 'missing');
        const hasStages = stages.length > 0;

        let status: PbxNodeStatus;
        if (!installed) {
            status = 'missing';
        } else if (hasStages && allStagesMissing) {
            status = 'partial';
        } else {
            status = 'installed';
        }

        return { template: tmpl, installed, status, stages };
    });
}

// ---------------------------------------------------------------------------
// Smart (top-level node)
// ---------------------------------------------------------------------------

/**
 * Build a full diff tree for a single smart template against installed data.
 *
 * Matching rules:
 * - installed.name === template.code  AND  installed.group === group
 *   → smart is present in our DB (was created by us or recorded via mapping)
 * - installed.bitrixId is set but name/group don't match our convention
 *   → treated as 'mapped' (admin linked an existing Bitrix smart to the template)
 *
 * @param templateSmart       - smart definition from PBX registry
 * @param group               - registry group code (e.g. 'sales')
 * @param installedSmarts     - all smarts installed on the portal from our DB
 * @param installedCategories - categories for this smart (pass [] if not yet loaded)
 * @param installedFields     - fields for this smart (pass [] if not yet loaded)
 */
export function diffSmart(
    templateSmart: PbxSmartDefinitionDto,
    group: string,
    installedSmarts: SmartResponseDto[],
    installedCategories: PbxCategory[],
    installedFields: PbxField[],
): PbxSmartDiffNode {
    // Primary match: name === template code, group === group
    const installed =
        installedSmarts.find(
            (s) => s.name === templateSmart.code && s.group === group,
        ) ?? null;

    const categories = diffCategories(
        templateSmart.categories ?? [],
        installed ? installedCategories : [],
    );
    const fields = diffFields(
        templateSmart.fields ?? [],
        installed ? installedFields : [],
    );

    let status: PbxNodeStatus;
    if (!installed) {
        status = 'missing';
    } else if (installed.entityTypeId > 0 && !installed.bitrixId) {
        // entityTypeId is set (we know which Bitrix smart to use) but bitrixId
        // is null — admin mapped the template to an EXISTING Bitrix smart
        // without going through the install flow. Our system never created
        // this smart in Bitrix, so bitrixId was never populated.
        status = 'mapped';
    } else {
        const allInstalled =
            categories.every((c) => c.status === 'installed') &&
            fields.every((f) => f.status === 'installed');
        status = allInstalled ? 'installed' : 'partial';
    }

    return { template: templateSmart, group, installed, status, categories, fields };
}

/**
 * Build diff nodes for every smart in the template list.
 * Useful for the portal-level "what's installed" overview page.
 */
export function diffAllSmarts(
    templateSmarts: Array<PbxSmartDefinitionDto & { group: string }>,
    installedSmarts: SmartResponseDto[],
): PbxSmartDiffNode[] {
    return templateSmarts.map((t) =>
        diffSmart(t, t.group, installedSmarts, [], []),
    );
}

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

// ---------------------------------------------------------------------------
// Status of a single diff node (template vs. installed)
// ---------------------------------------------------------------------------

/**
 * 'installed' — node fully present in our portal DB (installed by us via Bitrix API)
 * 'missing'   — node not found in portal DB at all
 * 'partial'   — node present but some children are missing/not-synced
 * 'mapped'    — node was NOT installed by us but its Bitrix ID was manually recorded
 *               in our DB (the entity already existed in Bitrix, admin linked them)
 */
export type PbxNodeStatus = 'installed' | 'missing' | 'partial' | 'mapped';

// ---------------------------------------------------------------------------
// Install context — passed down the component tree instead of raw pропс
// ---------------------------------------------------------------------------

export type PbxSmartInstallContext = {
    portalId: number;
    /** code of the PBX registry group (e.g. 'sales') */
    group: string;
    /** PbxSmartDefinitionDto.code — stable template identifier */
    smartCode: string;
    /** DB id of the installed smart, available once installed */
    smartId?: number;
};

// ---------------------------------------------------------------------------
// Install targets — discriminated union sent to install mutations
// ---------------------------------------------------------------------------

export type PbxSmartTarget = {
    scope: 'smart';
    portalId: number;
    group: string;
    smartCode: string;
};

export type PbxSmartCategoryTarget = {
    scope: 'smart_category';
    portalId: number;
    group: string;
    smartCode: string;
    categoryCode: string;
};

export type PbxSmartStageTarget = {
    scope: 'smart_stage';
    portalId: number;
    group: string;
    smartCode: string;
    categoryCode: string;
    stageCode: string;
};

export type PbxSmartFieldTarget = {
    scope: 'smart_field';
    portalId: number;
    group: string;
    smartCode: string;
    fieldCode: string;
};

export type PbxSmartFieldItemTarget = {
    scope: 'smart_field_item';
    portalId: number;
    group: string;
    smartCode: string;
    fieldCode: string;
    itemCode: string;
};

export type PbxSmartInstallTarget =
    | PbxSmartTarget
    | PbxSmartCategoryTarget
    | PbxSmartStageTarget
    | PbxSmartFieldTarget
    | PbxSmartFieldItemTarget;

// ---------------------------------------------------------------------------
// Mapping targets — link a template node to an EXISTING Bitrix entity
// without installing anything. Writes only to our DB.
// ---------------------------------------------------------------------------

/**
 * Map a smart-process template entry to an already-existing Bitrix smart.
 * bitrixEntityTypeId — the entityTypeId Bitrix assigned to that smart.
 */
export type PbxMapSmartTarget = {
    scope: 'map_smart';
    portalId: number;
    group: string;
    smartCode: string;
    bitrixEntityTypeId: number;
};

/**
 * Map a template category to an already-existing Bitrix category.
 * bitrixCategoryId — the numeric id of the category in Bitrix.
 */
export type PbxMapCategoryTarget = {
    scope: 'map_category';
    portalId: number;
    group: string;
    smartCode: string;
    categoryCode: string;
    bitrixCategoryId: number;
};

/**
 * Map a template stage to an already-existing Bitrix stage (status).
 * bitrixStatusId — STATUS_ID string from crm.status.list (e.g. 'DT134_1:NEW').
 */
export type PbxMapStageTarget = {
    scope: 'map_stage';
    portalId: number;
    group: string;
    smartCode: string;
    categoryCode: string;
    stageCode: string;
    bitrixStatusId: string;
};

/**
 * Map a template field to an already-existing Bitrix user field.
 * bitrixFieldName — the FIELD_NAME in Bitrix (e.g. 'UF_CRM_134_XO_NAME').
 */
export type PbxMapFieldTarget = {
    scope: 'map_field';
    portalId: number;
    group: string;
    smartCode: string;
    fieldCode: string;
    bitrixFieldName: string;
};

export type PbxSmartMappingTarget =
    | PbxMapSmartTarget
    | PbxMapCategoryTarget
    | PbxMapStageTarget
    | PbxMapFieldTarget;

// ---------------------------------------------------------------------------
// Diff tree — result of comparing template vs installed
// ---------------------------------------------------------------------------

export type PbxFieldItemDiffNode = {
    template: PbxFieldItemDefinitionDto;
    /** Installed representation — null until back-end exposes stage/item entities */
    installed: null;
    status: PbxNodeStatus;
};

export type PbxFieldDiffNode = {
    template: PbxFieldDefinitionDto;
    installed: PbxField | null;
    status: PbxNodeStatus;
    items: PbxFieldItemDiffNode[];
};

export type PbxStageDiffNode = {
    template: PbxStageDefinitionDto;
    /** Installed stage entity — null until back-end exposes it separately */
    installed: null;
    status: PbxNodeStatus;
};

export type PbxCategoryDiffNode = {
    template: PbxCategoryDefinitionDto;
    installed: PbxCategory | null;
    status: PbxNodeStatus;
    stages: PbxStageDiffNode[];
};

export type PbxSmartDiffNode = {
    template: PbxSmartDefinitionDto;
    /** Registry group this smart belongs to */
    group: string;
    installed: SmartResponseDto | null;
    status: PbxNodeStatus;
    categories: PbxCategoryDiffNode[];
    fields: PbxFieldDiffNode[];
};

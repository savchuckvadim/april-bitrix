import type {
    BulkPortalRegionItemDto,
    BulkSetPortalRegionsResultDto,
    GetPortalRegionResponseDto,
} from '@workspace/nest-admin-api';

export type {
    AdminPortalGarantRegionListParams,
    GetPortalRegionResponseDto,
    UpdatePortalRegionDtoAdmin as UpdatePortalRegionDto,
} from '@workspace/nest-admin-api';

/**
 * Регион глазами портала: abs/tax/tax_abs — общий рабс справочника,
 * own_* — своя цена (ручной рабс или регион-источник), effective_* —
 * цена, по которой портал реально считает.
 */
export type PortalRegion = GetPortalRegionResponseDto;

/** Строка массового сохранения: галочка + своя цена, если её правили */
export type BulkPortalRegionItem = BulkPortalRegionItemDto;

/** Итог массового сохранения: счётчики и пропуски с причинами */
export type BulkSetPortalRegionsResult = BulkSetPortalRegionsResultDto;

import { getAdminPortalGarantRegion } from '@workspace/nest-admin-api';
import type {
    AdminPortalGarantRegionListParams,
    BulkPortalRegionItem,
    BulkSetPortalRegionsResult,
    GetPortalRegionResponseDto,
    UpdatePortalRegionDto,
} from '../../model';

/** Единственное место, где слайс регионов портала зовёт api-пакет */
export class PortalRegionsHelper {
    private api: ReturnType<typeof getAdminPortalGarantRegion>;
    constructor() {
        this.api = getAdminPortalGarantRegion();
    }

    async getPortalRegions(
        params: AdminPortalGarantRegionListParams,
    ): Promise<GetPortalRegionResponseDto[]> {
        return this.api.adminPortalGarantRegionList(params);
    }

    /** Галочки и своя цена одним запросом; уходят только изменённые строки */
    async bulkSet(
        portalId: number,
        items: BulkPortalRegionItem[],
    ): Promise<BulkSetPortalRegionsResult> {
        return this.api.adminPortalGarantRegionBulkSet({ portalId, items });
    }

    async getUpdateInitialData(
        portalId: number,
        regionId: number,
    ): Promise<UpdatePortalRegionDto> {
        return this.api.adminPortalGarantRegionGetUpdateInitialData(
            portalId,
            regionId,
        );
    }

    async updatePortalRegion(
        portalId: number,
        regionId: number,
        dto: UpdatePortalRegionDto,
    ) {
        return this.api.adminPortalGarantRegionUpdate(portalId, regionId, dto);
    }
}

import {  getAdminPortalGarantRegion } from "@workspace/nest-api";
import {
    AdminPortalGarantRegionListParams,
    CreatePortalRegionDtoAdminRequest,
    GetPortalRegionResponseDto,
    UpdatePortalRegionDto,
    DeletePortalRegionDto,
} from "../../model";


export class PortalRegionsHelper {
    private api: ReturnType<typeof getAdminPortalGarantRegion>;
    constructor() {
        this.api = getAdminPortalGarantRegion();
    }
   
    async getPortalRegions(params: AdminPortalGarantRegionListParams): Promise<GetPortalRegionResponseDto[]> {
        const response = await this.api.adminPortalGarantRegionList(params);
        return response;
    }

    async createPortalRegion(dto: CreatePortalRegionDtoAdminRequest) {
        const response = await this.api.adminPortalGarantRegionCreate(dto);
        return response;
    }
    async deletePortalRegion(dto: DeletePortalRegionDto) {
        const response = await this.api.adminPortalGarantRegionDelete(dto.portalId, dto.regionId);
        return response;
    }

    async getUpdateInitialData(portalId: number, regionId: number): Promise<UpdatePortalRegionDto> {
        const response = await this.api.adminPortalGarantRegionGetUpdateInitialData(portalId, regionId);
        return response;
    }

    async updatePortalRegion(portalId: number, regionId: number, dto: UpdatePortalRegionDto) {
        const response = await this.api.adminPortalGarantRegionUpdate(portalId, regionId, dto);
        return response;
    }

}

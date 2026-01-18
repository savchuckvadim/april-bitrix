import { PortalMeasureGetAllPortalMeasuresParams, CreatePortalMeasureDto, UpdatePortalMeasureDto, getAdminPortalMeasuresManagement } from "@workspace/nest-api";

export class PortalMeasureHelper {
    private api: ReturnType<typeof getAdminPortalMeasuresManagement>;
    constructor() {
        this.api = getAdminPortalMeasuresManagement();
    }

    async getPortalMeasures(dto: PortalMeasureGetAllPortalMeasuresParams) {
        const response = await this.api.portalMeasureGetAllPortalMeasures(dto);
        return response;
    }

    async createPortalMeasure(dto: CreatePortalMeasureDto) {
        const response = await this.api.portalMeasureCreatePortalMeasure(dto);
        return response;
    }

    async updatePortalMeasure(id: number, dto: UpdatePortalMeasureDto) {
        const response = await this.api.portalMeasureUpdatePortalMeasure(id, dto);
        return response;
    }

    async deletePortalMeasure(id: number) {
        const response = await this.api.portalMeasureDeletePortalMeasure(id);
        return response;
    }

    async getPortalMeasureById(id: number) {
        const response = await this.api.portalMeasureGetPortalMeasureById(id);
        return response;
    }

}

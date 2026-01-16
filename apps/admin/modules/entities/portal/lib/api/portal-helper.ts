import { AdminPortalGetAllPortalsParams, CreatePortalDto, getAdminPortalManagement, UpdatePortalDto, } from "@workspace/nest-api";

export class PortalHelper {
    private api: ReturnType<typeof getAdminPortalManagement>;
    constructor() {
        this.api = getAdminPortalManagement();
    }

    async getPortals(dto: AdminPortalGetAllPortalsParams) {
        const response = await this.api.adminPortalGetAllPortals(dto);
        return response;
    }

    async createPortal(dto: CreatePortalDto) {
        const response = await this.api.adminPortalCreatePortal(dto);
        return response;
    }

    async updatePortal(id: number, dto: UpdatePortalDto) {
        const response = await this.api.adminPortalUpdatePortal(id, dto);
        return response;
    }

    async deletePortal(id: number) {
        const response = await this.api.adminPortalDeletePortal(id);
        return response;
    }

    async getPortalById(id: number) {
        const response = await this.api.adminPortalGetPortalById(id);
        return response;
    }

}

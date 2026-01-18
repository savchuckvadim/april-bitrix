import { PortalContractGetAllPortalContractsParams, CreatePortalContractDto, UpdatePortalContractDto, getAdminPortalContractsManagement } from "@workspace/nest-api";

export class PortalContractHelper {
    private api: ReturnType<typeof getAdminPortalContractsManagement>;
    constructor() {
        this.api = getAdminPortalContractsManagement();
    }

    async getPortalContracts(dto: PortalContractGetAllPortalContractsParams) {
        const response = await this.api.portalContractGetAllPortalContracts(dto);
        return response;
    }

    async createPortalContract(dto: CreatePortalContractDto) {
        const response = await this.api.portalContractCreatePortalContract(dto);
        return response;
    }

    async updatePortalContract(id: number, dto: UpdatePortalContractDto) {
        const response = await this.api.portalContractUpdatePortalContract(id, dto);
        return response;
    }

    async deletePortalContract(id: number) {
        const response = await this.api.portalContractDeletePortalContract(id);
        return response;
    }

    async getPortalContractById(id: number) {
        const response = await this.api.portalContractGetPortalContractById(id);
        return response;
    }

}

import { BtxLeadGetAllLeadsParams, CreateBtxLeadDto, UpdateBtxLeadDto, getAdminBtxLeadsManagement } from "@workspace/nest-api";

export class BtxLeadHelper {
    private api: ReturnType<typeof getAdminBtxLeadsManagement>;
    constructor() {
        this.api = getAdminBtxLeadsManagement();
    }

    async getBtxLeads(dto: BtxLeadGetAllLeadsParams) {
        const response = await this.api.btxLeadGetAllLeads(dto);
        return response;
    }

    async createBtxLead(dto: CreateBtxLeadDto) {
        const response = await this.api.btxLeadCreateLead(dto);
        return response;
    }

    async updateBtxLead(id: number, dto: UpdateBtxLeadDto) {
        const response = await this.api.btxLeadUpdateLead(id, dto);
        return response;
    }

    async deleteBtxLead(id: number) {
        const response = await this.api.btxLeadDeleteLead(id);
        return response;
    }

    async getBtxLeadById(id: number) {
        const response = await this.api.btxLeadGetLeadById(id);
        return response;
    }

}

import { SmartGetAllSmartsParams, CreateSmartDto, UpdateSmartDto, getAdminSmartsManagement } from "@workspace/nest-api";

export class SmartHelper {
    private api: ReturnType<typeof getAdminSmartsManagement>;
    constructor() {
        this.api = getAdminSmartsManagement();
    }

    async getSmarts(dto: SmartGetAllSmartsParams) {
        const response = await this.api.smartGetAllSmarts(dto);
        return response;
    }

    async createSmart(dto: CreateSmartDto) {
        const response = await this.api.smartCreateSmart(dto);
        return response;
    }

    async updateSmart(id: number, dto: UpdateSmartDto) {
        const response = await this.api.smartUpdateSmart(id, dto);
        return response;
    }

    async deleteSmart(id: number) {
        const response = await this.api.smartDeleteSmart(id);
        return response;
    }

    async getSmartById(id: number) {
        const response = await this.api.smartGetSmartById(id);
        return response;
    }

}

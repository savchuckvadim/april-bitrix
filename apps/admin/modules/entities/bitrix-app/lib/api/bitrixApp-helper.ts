import { AdminBitrixAppGetAppParams, CreateBitrixAppDto, UpdateBitrixAppDto, getAdminBitrixAppManagement } from "@workspace/nest-api";

export class BitrixAppHelper {
    private api: ReturnType<typeof getAdminBitrixAppManagement>;
    constructor() {
        this.api = getAdminBitrixAppManagement();
    }

    async getBitrixApps() {
        const response = await this.api.adminBitrixAppGetAllApps();
        return response;
    }

    async createBitrixApp(dto: CreateBitrixAppDto) {
        const response = await this.api.adminBitrixAppStoreOrUpdateApp(dto);
        return response;
    }

    async updateBitrixApp(id: number, dto: UpdateBitrixAppDto) {
        const response = await this.api.adminBitrixAppUpdateApp(id, dto);
        return response;
    }

    async deleteBitrixApp(id: string) {
        const response = await this.api.adminBitrixAppDeleteApp(id);
        return response;
    }

    async getBitrixAppById(params: AdminBitrixAppGetAppParams) {
        const response = await this.api.adminBitrixAppGetApp(params);
        return response;
    }

}

import {
    AdminBitrixAppGetAppParams,
    CreateBitrixAppDto,
    getAdminBitrixAppManagement,
    UpdateBitrixAppDto,
} from '@workspace/nest-api';

export class BitrixAppHelper {
    private api: ReturnType<typeof getAdminBitrixAppManagement>;
    constructor() {
        this.api = getAdminBitrixAppManagement();
    }

    async getAllApps() {
        const response = await this.api.adminBitrixAppGetAllApps();
        return response;
    }

    async getApp(params: AdminBitrixAppGetAppParams) {
        const response = await this.api.adminBitrixAppGetApp(params);
        return response;
    }

    async getAppsByPortal(domain: string) {
        const response = await this.api.adminBitrixAppGetAppsByPortal(domain);
        return response;
    }

    async getAppsByPortalId(portalId: number) {
        const response =
            await this.api.adminBitrixAppGetAppsByPortalId(portalId);
        return response;
    }

    async getEnabledApps() {
        const response = await this.api.adminBitrixAppGetEnabledApps();
        return response;
    }

    async storeOrUpdateApp(dto: CreateBitrixAppDto) {
        const response = await this.api.adminBitrixAppStoreOrUpdateApp(dto);
        return response;
    }

    async updateApp(id: number, dto: UpdateBitrixAppDto) {
        const response = await this.api.adminBitrixAppUpdateApp(id, dto);
        return response;
    }

    async deleteApp(id: string) {
        const response = await this.api.adminBitrixAppDeleteApp(id);
        return response;
    }
}


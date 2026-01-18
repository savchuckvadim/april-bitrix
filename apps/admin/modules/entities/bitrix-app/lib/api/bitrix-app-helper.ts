import {
    AdminBitrixAppGetAppParams,
    BitrixAppDto,
    CreateBitrixAppDto,
    getAdminBitrixAppManagement,
    UpdateBitrixAppDto,
} from '@workspace/nest-api';

export class BitrixAppHelper {
    private api: ReturnType<typeof getAdminBitrixAppManagement>;
    constructor() {
        this.api = getAdminBitrixAppManagement();
    }

    async getAllApps(): Promise<BitrixAppDto[]> {
        const response = await this.api.adminBitrixAppGetAllApps();
        return (response as unknown as BitrixAppDto[]) || [];
    }

    async getApp(params: AdminBitrixAppGetAppParams): Promise<BitrixAppDto> {
        const response = await this.api.adminBitrixAppGetApp(params);
        return (response as unknown as BitrixAppDto);
    }

    async getAppsByPortal(domain: string): Promise<BitrixAppDto[]> {
        const response = await this.api.adminBitrixAppGetAppsByPortal(domain);
        return (response as unknown as BitrixAppDto[]) || [];
    }

    async getAppsByPortalId(portalId: number): Promise<BitrixAppDto[]> {
        const response =
            await this.api.adminBitrixAppGetAppsByPortalId(portalId);
        return (response as unknown as BitrixAppDto[]) || [];
    }

    async getEnabledApps(): Promise<BitrixAppDto[]> {
        const response = await this.api.adminBitrixAppGetEnabledApps();
        return (response as unknown as BitrixAppDto[]) || [];
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


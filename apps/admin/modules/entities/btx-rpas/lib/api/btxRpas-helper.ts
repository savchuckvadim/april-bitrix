import { BtxRpaGetAllRpasParams, CreateBtxRpaDto, UpdateBtxRpaDto, getAdminBtxRpasManagement } from "@workspace/nest-api";

export class BtxRpaHelper {
    private api: ReturnType<typeof getAdminBtxRpasManagement>;
    constructor() {
        this.api = getAdminBtxRpasManagement();
    }

    async getBtxRpas(dto: BtxRpaGetAllRpasParams) {
        const response = await this.api.btxRpaGetAllRpas(dto);
        return response;
    }

    async createBtxRpa(dto: CreateBtxRpaDto) {
        const response = await this.api.btxRpaCreateRpa(dto);
        return response;
    }

    async updateBtxRpa(id: number, dto: UpdateBtxRpaDto) {
        const response = await this.api.btxRpaUpdateRpa(id, dto);
        return response;
    }

    async deleteBtxRpa(id: number) {
        const response = await this.api.btxRpaDeleteRpa(id);
        return response;
    }

    async getBtxRpaById(id: number) {
        const response = await this.api.btxRpaGetRpaById(id);
        return response;
    }

}

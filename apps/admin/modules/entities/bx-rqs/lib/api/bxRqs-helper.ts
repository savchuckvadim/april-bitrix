import { BxRqGetAllRqsParams, CreateBxRqDto, UpdateBxRqDto, getAdminBxRqsManagement } from "@workspace/nest-api";

export class BxRqHelper {
    private api: ReturnType<typeof getAdminBxRqsManagement>;
    constructor() {
        this.api = getAdminBxRqsManagement();
    }

    async getBxRqs(dto: BxRqGetAllRqsParams) {
        const response = await this.api.bxRqGetAllRqs(dto);
        return response;
    }

    async createBxRq(dto: CreateBxRqDto) {
        const response = await this.api.bxRqCreateRq(dto);
        return response;
    }

    async updateBxRq(id: number, dto: UpdateBxRqDto) {
        const response = await this.api.bxRqUpdateRq(id, dto);
        return response;
    }

    async deleteBxRq(id: number) {
        const response = await this.api.bxRqDeleteRq(id);
        return response;
    }

    async getBxRqById(id: number) {
        const response = await this.api.bxRqGetRqById(id);
        return response;
    }

}

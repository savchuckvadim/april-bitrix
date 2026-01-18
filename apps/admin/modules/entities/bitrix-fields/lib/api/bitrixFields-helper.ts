import { BitrixFieldGetAllFieldsParams, CreateBitrixFieldDto, CreateBitrixFieldsBulkDto, UpdateBitrixFieldDto, getAdminBitrixFieldsManagement } from "@workspace/nest-api";

export class BitrixFieldHelper {
    private api: ReturnType<typeof getAdminBitrixFieldsManagement>;
    constructor() {
        this.api = getAdminBitrixFieldsManagement();
    }

    async getBitrixFields(dto?: BitrixFieldGetAllFieldsParams) {
        const response = await this.api.bitrixFieldGetAllFields(dto || ({} as Partial<BitrixFieldGetAllFieldsParams>) as BitrixFieldGetAllFieldsParams);
        return response;
    }

    async createBitrixField(dto: CreateBitrixFieldDto) {
        const response = await this.api.bitrixFieldCreateField(dto);
        return response;
    }

    async updateBitrixField(id: number, dto: UpdateBitrixFieldDto) {
        const response = await this.api.bitrixFieldUpdateField(id, dto);
        return response;
    }

    async deleteBitrixField(id: number) {
        const response = await this.api.bitrixFieldDeleteField(id);
        return response;
    }

    async getBitrixFieldById(id: number) {
        const response = await this.api.bitrixFieldGetFieldById(id);
        return response;
    }

}

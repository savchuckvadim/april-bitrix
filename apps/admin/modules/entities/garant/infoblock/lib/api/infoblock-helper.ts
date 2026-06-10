import { getAdminGarantInfoblock } from "@workspace/nest-api";
import { InfoblockCreateDto } from "../../model";

export class InfoblockHelper {
    private api: ReturnType<typeof getAdminGarantInfoblock>;
    constructor() {
        this.api = getAdminGarantInfoblock();
    }

    async list() {
        const response = await this.api.adminGarantInfoblockFindAll();
        
        return response;
    }

    async getByCode(code: string) {
        const response = await this.api.adminGarantInfoblockFindByCode(code);
        return response;
    }

    async get(id: string) {
        const response = await this.api.adminGarantInfoblockFindOne(id);
        return response;
    }
    async create(dto: InfoblockCreateDto) {
        const response = await this.api.adminGarantInfoblockCreate(dto);
        return response;
    }
    async update(id: string, dto: InfoblockCreateDto) {
        const response = await this.api.adminGarantInfoblockUpdate(id, dto);
        return response;
    }
    async delete(id: string) {
        const response = await this.api.adminGarantInfoblockDelete(id);
        return response;
    }

}

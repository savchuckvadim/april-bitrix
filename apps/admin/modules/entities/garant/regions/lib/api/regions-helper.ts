import { CreateRegionDto, getAdminGarantRegion } from "@workspace/nest-api";

export class RegionsHelper {
    private api: ReturnType<typeof getAdminGarantRegion>;
    constructor() {
        this.api = getAdminGarantRegion();
    }

    async list() {
        const response = await this.api.adminGarantRegionFindAll();
        return response;
    }

    async create(dto: CreateRegionDto) {
        const response = await this.api.adminGarantRegionCreate(dto);
        return response;
    }

    async update(id: number, dto: CreateRegionDto) {
        const response = await this.api.adminGarantRegionUpdate(id.toString(), dto);
        return response;
    }

    async delete(id: number) {
        const response = await this.api.adminGarantRegionDelete(id.toString());
        return response;
    }

    async get(id: number) {
        const response = await this.api.adminGarantRegionFindOne(id.toString());
        return response;
    }

}

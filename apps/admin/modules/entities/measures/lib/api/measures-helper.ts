import { CreateMeasureDto, UpdateMeasureDto, getAdminMeasuresManagement } from "@workspace/nest-api";

export class MeasureHelper {
    private api: ReturnType<typeof getAdminMeasuresManagement>;
    constructor() {
        this.api = getAdminMeasuresManagement();
    }

    async getMeasures() {
        const response = await this.api.measureGetAllMeasures();
        return response;
    }

    async createMeasure(dto: CreateMeasureDto) {
        const response = await this.api.measureCreateMeasure(dto);
        return response;
    }

    async updateMeasure(id: number, dto: UpdateMeasureDto) {
        const response = await this.api.measureUpdateMeasure(id, dto);
        return response;
    }

    async deleteMeasure(id: number) {
        const response = await this.api.measureDeleteMeasure(id);
        return response;
    }

    async getMeasureById(id: number) {
        const response = await this.api.measureGetMeasureById(id);
        return response;
    }

}

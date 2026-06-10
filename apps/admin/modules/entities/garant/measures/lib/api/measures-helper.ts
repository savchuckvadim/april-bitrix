import { CreateMeasureDto, UpdateMeasureDto, getAdminMeasuresManagement } from "@workspace/nest-api";

export class MeasureHelper {
    private api: ReturnType<typeof getAdminMeasuresManagement>;
    constructor() {
        this.api = getAdminMeasuresManagement();
    }

    async getMeasures() {
        const response = await this.api.adminGarantMeasureGetAllMeasures();
        return response;
    }

    async createMeasure(dto: CreateMeasureDto) {
        const response = await this.api.adminGarantMeasureCreateMeasure(dto);
        return response;
    }

    async updateMeasure(id: number, dto: UpdateMeasureDto) {
        const response = await this.api.adminGarantMeasureUpdateMeasure(id, dto);
        return response;
    }

    async deleteMeasure(id: number) {
        const response = await this.api.adminGarantMeasureDeleteMeasure(id);
        return response;
    }

    async getMeasureById(id: number) {
        const response = await this.api.adminGarantMeasureGetMeasureById(id);
        return response;
    }

}

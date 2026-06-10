import { ProfPriceUploadExcelDto, CreatePriceDto } from "../../model";
import { getAdminGarantProfPrice } from "@workspace/nest-api";

export class ProfPricesHelper {
    private api: ReturnType<typeof getAdminGarantProfPrice>;
    constructor() {
        this.api = getAdminGarantProfPrice();
    }
    async list() {
        const response = await this.api.adminGarantProfPriceFindAll();
        return response;
    }
    async create(dto: CreatePriceDto) {
        const response = await this.api.adminGarantProfPriceCreate(dto);
        return response;
    }
    async update(id: string, dto: CreatePriceDto) {
        const response = await this.api.adminGarantProfPriceUpdate(id, dto);
        return response;
    }
    async get(id: string) {
        const response = await this.api.adminGarantProfPriceFindOne(id);
        return response;
    }
    async downLoadExcelExample() {
        const response = await this.api.adminGarantProfPriceDownloadExample();
        return response;
    }
    async upLoadExcel(dto: ProfPriceUploadExcelDto) {
        const response = await this.api.adminGarantProfPriceUploadExcel(dto);
        return response;
    }
    async updateByExcel() {
        const response = await this.api.adminGarantProfPriceUpdateFromExcel();
        return response;
    }

    async delete(id: number) {
        const response = await this.api.adminGarantProfPriceDelete(id);
        return response;
    }
    async deleteMany(ids: string[]) {
        const response = await this.api.adminGarantProfPriceDeleteMany(ids);
        return response;
    }
    async deleteAll() {
        const response = await this.api.adminGarantProfPriceDeleteAll();
        return response;
    }
}

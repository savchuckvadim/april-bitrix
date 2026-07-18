import { getAdminGarantSupply } from "@workspace/nest-admin-api";
import { CreateSupplyDto, AdminGarantSupplyUploadExcelBody } from "../../model";

export class SuppliesHelper {
    private api: ReturnType<typeof getAdminGarantSupply>;
    constructor() {
        this.api = getAdminGarantSupply();
    }

    async list() {
        const response = await this.api.adminGarantSupplyFindAll();
        return response;
    }

    async create(dto: CreateSupplyDto) {
        const response = await this.api.adminGarantSupplyCreate(dto);
        return response;
    }

    async update(id: string, dto: CreateSupplyDto) {
        const response = await this.api.adminGarantSupplyUpdate(id, dto);
        return response;
    }

    async get(id: string) {
        const response = await this.api.adminGarantSupplyFindOne(id);
        return response;
    }

    async downLoadExcelExample() {
        const response = await this.api.adminGarantSupplyDownloadExample();
        return response;
    }
    async upLoadExcel(dto: AdminGarantSupplyUploadExcelBody) {
        const response = await this.api.adminGarantSupplyUploadExcel(dto);
        return response;
    }
    async updateByExcel() {
        const response = await this.api.adminGarantSupplyUpdateFromExcel();
        return response;
    }
}

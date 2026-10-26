import { getAdminGarantSupply } from "@workspace/nest-admin-api";
import { CreateSupplyDto } from "../../model";

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

}

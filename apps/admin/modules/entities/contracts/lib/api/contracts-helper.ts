import { CreateContractDto, UpdateContractDto, getAdminContractsManagement } from "@workspace/nest-api";

export class ContractHelper {
    private api: ReturnType<typeof getAdminContractsManagement>;
    constructor() {
        this.api = getAdminContractsManagement();
    }

    async getContracts() {
        const response = await this.api.contractGetAllContracts();
        return response;
    }

    async createContract(dto: CreateContractDto) {
        const response = await this.api.contractCreateContract(dto);
        return response;
    }

    async updateContract(id: number, dto: UpdateContractDto) {
        const response = await this.api.contractUpdateContract(id, dto);
        return response;
    }

    async deleteContract(id: number) {
        const response = await this.api.contractDeleteContract(id);
        return response;
    }

    async getContractById(id: number) {
        const response = await this.api.contractGetContractById(id);
        return response;
    }

}

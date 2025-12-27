import { AdminClientGetAllClientsParams, CreateClientDto, getAdminClientManagement, UpdateClientDto } from "@workspace/nest-api";

export class ClientHelper {
    private api: ReturnType<typeof getAdminClientManagement>;
    constructor() {
        this.api = getAdminClientManagement();
    }

    async getClients(dto: AdminClientGetAllClientsParams) {
        const response = await this.api.adminClientGetAllClients(dto);
        return response;
    }
    async createClient(dto: CreateClientDto) {
        const response = await this.api.adminClientCreateClient(dto);
        return response;
    }
    async updateClient(id: number, dto: UpdateClientDto) {
        const response = await this.api.adminClientUpdateClient(id, dto);
        return response;
    }
    async deleteClient(id: number) {
        const response = await this.api.adminClientDeleteClient(id);
        return response;
    }
    async getClientById(id: number) {
        const response = await this.api.adminClientGetClientById(id);
        return response;
    }
    async getClientByEmail(email: string) {
        const response = await this.api.adminClientGetClientByEmail(email);
        return response;
    }

}
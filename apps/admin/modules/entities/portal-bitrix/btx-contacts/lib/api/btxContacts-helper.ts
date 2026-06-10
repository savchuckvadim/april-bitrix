import { BtxContactGetAllContactsParams, CreateBtxContactDto, UpdateBtxContactDto, getAdminBtxContactsManagement } from "@workspace/nest-api";

export class BtxContactHelper {
    private api: ReturnType<typeof getAdminBtxContactsManagement>;
    constructor() {
        this.api = getAdminBtxContactsManagement();
    }

    async getBtxContacts(dto: BtxContactGetAllContactsParams) {
        const response = await this.api.btxContactGetAllContacts(dto);
        return response;
    }

    async createBtxContact(dto: CreateBtxContactDto) {
        const response = await this.api.btxContactCreateContact(dto);
        return response;
    }

    async updateBtxContact(id: number, dto: UpdateBtxContactDto) {
        const response = await this.api.btxContactUpdateContact(id, dto);
        return response;
    }

    async deleteBtxContact(id: number) {
        const response = await this.api.btxContactDeleteContact(id);
        return response;
    }

    async getBtxContactById(id: number) {
        const response = await this.api.btxContactGetContactById(id);
        return response;
    }

}

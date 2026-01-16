import { BtxDealGetAllDealsParams, CreateBtxDealDto, UpdateBtxDealDto, getAdminBtxDealsManagement } from "@workspace/nest-api";

export class BtxDealHelper {
    private api: ReturnType<typeof getAdminBtxDealsManagement>;
    constructor() {
        this.api = getAdminBtxDealsManagement();
    }

    async getBtxDeals(dto: BtxDealGetAllDealsParams) {
        const response = await this.api.btxDealGetAllDeals(dto);
        return response;
    }

    async createBtxDeal(dto: CreateBtxDealDto) {
        const response = await this.api.btxDealCreateDeal(dto);
        return response;
    }

    async updateBtxDeal(id: number, dto: UpdateBtxDealDto) {
        const response = await this.api.btxDealUpdateDeal(id, dto);
        return response;
    }

    async deleteBtxDeal(id: number) {
        const response = await this.api.btxDealDeleteDeal(id);
        return response;
    }

    async getBtxDealById(id: number) {
        const response = await this.api.btxDealGetDealById(id);
        return response;
    }

}

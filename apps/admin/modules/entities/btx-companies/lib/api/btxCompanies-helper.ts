import { BtxCompanyGetAllCompaniesParams, CreateBtxCompanyDto, UpdateBtxCompanyDto, getAdminBtxCompaniesManagement } from "@workspace/nest-api";

export class BtxCompanieHelper {
    private api: ReturnType<typeof getAdminBtxCompaniesManagement>;
    constructor() {
        this.api = getAdminBtxCompaniesManagement();
    }

    async getBtxCompanies(dto: BtxCompanyGetAllCompaniesParams) {
        const response = await this.api.btxCompanyGetAllCompanies(dto);
        return response;
    }

    async createBtxCompanie(dto: CreateBtxCompanyDto) {
        const response = await this.api.btxCompanyCreateCompany(dto);
        return response;
    }

    async updateBtxCompanie(id: number, dto: UpdateBtxCompanyDto) {
        const response = await this.api.btxCompanyUpdateCompany(id, dto);
        return response;
    }

    async deleteBtxCompanie(id: number) {
        const response = await this.api.btxCompanyDeleteCompany(id);
        return response;
    }

    async getBtxCompanieById(id: number) {
        const response = await this.api.btxCompanyGetCompanyById(id);
        return response;
    }

}

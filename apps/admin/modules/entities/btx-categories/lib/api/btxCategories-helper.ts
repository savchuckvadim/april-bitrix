import { BtxCategoryGetAllCategoriesParams, CreateBtxCategoryDto, UpdateBtxCategoryDto, getAdminBtxCategoriesManagement } from "@workspace/nest-api";

export class BtxCategorieHelper {
    private api: ReturnType<typeof getAdminBtxCategoriesManagement>;
    constructor() {
        this.api = getAdminBtxCategoriesManagement();
    }

    async getBtxCategories(dto?: BtxCategoryGetAllCategoriesParams) {
        const response = await this.api.btxCategoryGetAllCategories(dto || {} as BtxCategoryGetAllCategoriesParams);
        return response;
    }

    async createBtxCategorie(dto: CreateBtxCategoryDto) {
        const response = await this.api.btxCategoryCreateCategory(dto);
        return response;
    }

    async updateBtxCategorie(id: number, dto: UpdateBtxCategoryDto) {
        const response = await this.api.btxCategoryUpdateCategory(id, dto);
        return response;
    }

    async deleteBtxCategorie(id: number) {
        const response = await this.api.btxCategoryDeleteCategory(id);
        return response;
    }

    async getBtxCategorieById(id: number) {
        const response = await this.api.btxCategoryGetCategoryById(id);
        return response;
    }

}

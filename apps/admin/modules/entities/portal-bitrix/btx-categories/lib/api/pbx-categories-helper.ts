import { getAdminBtxCategoriesManagement } from '@workspace/nest-api';
import {
    PbxCreateCategoryDto,
    PbxGetCategoriesByEntityDto,
    PbxUpdateCategoryDto,
} from '../../model';

export class BtxCategorieHelper {
    private api: ReturnType<typeof getAdminBtxCategoriesManagement>;
    constructor() {
        this.api = getAdminBtxCategoriesManagement();
    }

    async getBtxCategories(dto: PbxGetCategoriesByEntityDto) {
        const response = await this.api.portalCategoryAdminGetFieldsByEntity(dto);
        return response;
    }

    async createBtxCategorie(dto: PbxCreateCategoryDto) {
        const response = await this.api.portalCategoryAdminCreateCategory(dto);
        return response;
    }

    async updateBtxCategorie(id: number, dto: PbxUpdateCategoryDto) {
        const response = await this.api.portalCategoryAdminUpdateCategory(id, dto);
        return response;
    }

    async deleteBtxCategorie(id: number) {
        const response = await this.api.portalCategoryAdminDeleteCategory(id);
        return response;
    }

    async getBtxCategorieById(id: number) {
        const response = await this.api.portalCategoryAdminGetCategoryById(id);
        return response;
    }

}

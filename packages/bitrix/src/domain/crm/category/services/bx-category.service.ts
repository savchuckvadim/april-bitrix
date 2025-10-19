import { BxCategoryRepository } from '../repository/bx-category.repository';
import { BitrixBaseApi } from '../../../../core';
import { BitrixOwnerTypeId } from '../../../../domain/enums/bitrix-constants.enum';

export class BxCategoryService {
    private repo!: BxCategoryRepository;

    clone(api: BitrixBaseApi): BxCategoryService {
        const instance = new BxCategoryService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxCategoryRepository(api);
    }
    async get(id: number | string, entityTypeId: BitrixOwnerTypeId | string) {
        return await this.repo.get(id, entityTypeId);
    }
    async getList(entityTypeId: BitrixOwnerTypeId | string) {
        return await this.repo.getList(entityTypeId);
    }
}

import { BitrixBaseApi } from '../../../core/base/bitrix-base-api';
import { BxListItemRepository } from '../repository/bx-list-item.repository';
import {
    BxListItemAddRequestType,
    BxListItemGetRequestType,
} from '../schema/bx-list-item.schema';
import { IBXListItemPage } from '../interface/bx-list-item.interface';
import { toListItemPage } from '../lib/list-item-page.util';

export class BxListItemService {
    private repo!: BxListItemRepository;

    clone(api: BitrixBaseApi): BxListItemService {
        const instance = new BxListItemService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxListItemRepository(api);
    }

    get(dto: Omit<BxListItemGetRequestType, 'IBLOCK_TYPE_ID'>) {
        return this.repo.get(dto);
    }

    /** Страница элементов с нормализованной пагинацией (см. toListItemPage). */
    async getPage(
        dto: Omit<BxListItemGetRequestType, 'IBLOCK_TYPE_ID'>,
    ): Promise<IBXListItemPage> {
        const response = await this.repo.get(dto);
        return toListItemPage(response, dto.start ?? 0);
    }

    add(dto: Omit<BxListItemAddRequestType, 'IBLOCK_TYPE_ID'>) {
        return this.repo.add(dto);
    }
}

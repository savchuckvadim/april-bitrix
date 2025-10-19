import { BxListRepository } from '../repository/bx-list.repository';
import { BitrixBaseApi } from '../../../core/base/bitrix-base-api';
import { EBxListCode } from '../interface/bx-list.interface';

export class BxListService {
    private repo!: BxListRepository;

    clone(api: BitrixBaseApi): BxListService {
        const instance = new BxListService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxListRepository(api);
    }

    getList(IBLOCK_CODE?: EBxListCode) {
        return this.repo.getList(IBLOCK_CODE);
    }

    getListField(code: EBxListCode, ID: string | number) {
        return this.repo.getListField(code, ID);
    }

    getListFields(code: EBxListCode) {
        return this.repo.getListFields(code);
    }
}

import { BxListRepository } from '../repository/bx-list.repository';
import { BitrixBaseApi } from '../../../core/base/bitrix-base-api';
import { EBxListCode } from '../interface/bx-list.interface';

export class BxListBatchService {
    private repo!: BxListRepository;

    clone(api: BitrixBaseApi): BxListBatchService {
        const instance = new BxListBatchService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxListRepository(api);
    }

    getList(cmdCode: string, IBLOCK_CODE?: EBxListCode) {
        return this.repo.getListBtch(cmdCode, IBLOCK_CODE);
    }

    getListField(cmdCode: string, code: EBxListCode, ID: string | number) {
        return this.repo.getListFieldBtch(cmdCode, code, ID);
    }

    getListFields(cmdCode: string, code: EBxListCode) {
        return this.repo.getListFieldsBtch(cmdCode, code);
    }
}

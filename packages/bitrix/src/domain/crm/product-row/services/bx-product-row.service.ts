import { BxProductRowRepository } from '../repository/bx-product-row.repository';
import { BitrixBaseApi } from '../../../../core';
import {
    IBXProductRow,
    IBXProductRowRow,
} from '../interface/bx-product-row.interface';
import {
    ListProductRowDto,
    ListProductRowResponseDto,
} from '../dto/list-product-row.dto';

export class BxProductRowService {
    private repo!: BxProductRowRepository;

    clone(api: BitrixBaseApi): BxProductRowService {
        const instance = new BxProductRowService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxProductRowRepository(api);
    }

    async set(data: IBXProductRow) {
        return await this.repo.set(data);
    }
    async add(data: IBXProductRowRow) {
        return await this.repo.add(data);
    }
    async list(data: ListProductRowDto): Promise<ListProductRowResponseDto> {
        return (await this.repo.list(data)).result;
    }
}

import { BxRpaItemRepository } from '../repository/bx-rpa-item.repository';
import { BitrixBaseApi } from '../../../../core/base/bitrix-base-api';
import {
    AddRpaItemDto,
    GetRpaItemDto,
    ListRpaItemDto,
    UpdateRpaItemDto,
} from '../dto/rpa-item.dto';

export class BxRpaItemService {
    private repo!: BxRpaItemRepository;

    public clone(api: BitrixBaseApi): BxRpaItemService {
        const instance = new BxRpaItemService();
        instance.init(api);
        return instance;
    }

    public init(api: BitrixBaseApi) {
        this.repo = new BxRpaItemRepository(api);
    }

    public async get(dto: GetRpaItemDto) {
        return this.repo.getRpaItem(dto);
    }

    public async add(dto: AddRpaItemDto) {
        return this.repo.addRpaItem(dto);
    }

    public async update(dto: UpdateRpaItemDto) {
        return this.repo.updateRpaItem(dto);
    }

    public async list(dto: ListRpaItemDto) {
        return this.repo.listRpaItem(dto);
    }
}

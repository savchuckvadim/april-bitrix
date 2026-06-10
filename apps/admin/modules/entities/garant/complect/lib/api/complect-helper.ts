import { getAdminGarantComplect } from "@workspace/nest-api";
import {
    CreateComplectDto,
    GetComplectResponseDto,
    AddInfoblocksDto,
    RemoveInfoblocksDto,
    SetInfoblocksDto,
} from '../../model';
export class ComplectHelper {
    private api: ReturnType<typeof getAdminGarantComplect>;
    constructor() {
        this.api = getAdminGarantComplect();
    }

    async list() {
        const response = await this.api.adminGarantComplectFindAll();
        return response;
    }

    async create(dto: CreateComplectDto) {
        const response = await this.api.adminGarantComplectCreate(dto);
        return response;
    }

    async update(id: string, dto: CreateComplectDto) {
        const response = await this.api.adminGarantComplectUpdate(id, dto);
        return response;
    }

    async get(id: string) {
        const response = await this.api.adminGarantComplectFindOne(id);
        return response;
    }


    //relations infoblocks
    async addInfoblocks(id: string, addInfoblocksDto: AddInfoblocksDto) {
        // Добавляем новые связи
        const response = await this.api.adminGarantComplectAddInfoblocks(id, addInfoblocksDto);
        return response;
    }
    async setInfoblocks(id: string, setInfoblocksDto: SetInfoblocksDto) {
        // Удаляем все существующие связи
        // Создаем новые связи
        const response = await this.api.adminGarantComplectSetInfoblocks(id, setInfoblocksDto);
        return response;
    }

    async removeInfoblocks(id: string, removeInfoblocksDto: RemoveInfoblocksDto) {
        const response = await this.api.adminGarantComplectRemoveInfoblocks(id, removeInfoblocksDto);
        return response;
    }
    async removeInfoblock(id: string, infoblockId: string) {
        const response = await this.api.adminGarantComplectRemoveInfoblock(id, infoblockId);
        return response;
    }

}

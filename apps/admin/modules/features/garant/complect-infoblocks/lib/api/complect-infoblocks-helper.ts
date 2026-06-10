import { getAdminGarantComplect } from "@workspace/nest-api";
import {

    AddInfoblocksDto,
    RemoveInfoblocksDto,
    SetInfoblocksDto,
    GetComplectResponseDto,
} from '../../model';
export class ComplectInfoblocksHelper {
    private api: ReturnType<typeof getAdminGarantComplect>;
    constructor() {
        this.api = getAdminGarantComplect();
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

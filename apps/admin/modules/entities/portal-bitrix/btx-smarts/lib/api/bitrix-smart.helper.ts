import { BitrixApi } from "@/modules/shared/lib/api";
import { BitrixService } from "@bitrix/bitrix.service";


export class BitrixSmart {
    private bitrix!: BitrixService;
    private domain?: string;
    constructor(domain?: string) {
        this.domain = domain;
    }
    private async getBitrix() {
        if (!this.bitrix) {
            const bitrixService = new BitrixApi();
            await bitrixService.init(this.domain);
            this.bitrix = bitrixService.get();
        }
    }
    async getAllSmarts() {
        await this.getBitrix();
        return await this.bitrix.smartType.getListFull({
            order: {
                id: 'asc',
            },
            start: -1,

        });
    }
}
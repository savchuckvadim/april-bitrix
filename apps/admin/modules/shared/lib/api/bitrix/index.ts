import { IBXUser } from '@bitrix/domain/interfaces/bitrix.interface';
import { Bitrix, BitrixService } from '@workspace/bitrix';

const devUser: IBXUser = {
    ID: '1',
    NAME: 'test',
    LAST_NAME: 'test',
    EMAIL: 'test@test.com',
}
export class BitrixApi {
    private bitrix!: BitrixService;

    async init(domain?: string) {
        if (domain) {
            await Bitrix.start(domain, devUser);
        }
        this.bitrix = Bitrix.getService();
        const { inFrame } = this.bitrix.api.getInitializedData();
        console.log(inFrame);
    }

    public get() {
        return this.bitrix;
    }
}
import { BitrixService } from './bitrix.service';
import { IBXUser } from './domain/interfaces/bitrix.interface';

export class Bitrix {
    private static instance: BitrixService | undefined;

    static async start(domain: string, user: IBXUser): Promise<BitrixService> {
        console.log('start');
        console.log(domain);
        console.log(user);
        if (!Bitrix.instance) {
            const service = new BitrixService();
            await service.init(domain, user);
            Bitrix.instance = service;
        }
        console.log('Bitrix.instance');
        console.log(Bitrix.instance);
        return Bitrix.instance;
    }

    static getService() {
        return Bitrix.instance as BitrixService;
    }
    // (опционально) метод для сброса
    static resetInstance() {
        Bitrix.instance = undefined;
    }
}

import { BitrixService } from './bitrix.service';
import { IBXUser } from './domain/interfaces/bitrix.interface';

export class Bitrix {
    private static instance: BitrixService | undefined;

    static async start(domain: string, user: IBXUser): Promise<BitrixService> {
        if (!Bitrix.instance) {
            const service = new BitrixService();
            await service.init(domain, user);
            Bitrix.instance = service;
        }
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

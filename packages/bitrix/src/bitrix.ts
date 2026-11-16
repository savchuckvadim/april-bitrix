import { BitrixService } from './bitrix.service';
import type { BitrixInitOptions } from './core/dto/bx-init-options';
import { IBXUser } from './domain/interfaces/bitrix.interface';

export class Bitrix {
    private static instance: BitrixService | undefined;

    /**
     * Поднять фрейм и сервисы. `options.deferUser` — не ждать `user.current`:
     * приложение дожидается пользователя через `api.whenUser()`. Экземпляр
     * один на приложение: настройки берутся с первого вызова.
     */
    static async start(
        domain: string,
        user: IBXUser,
        options?: BitrixInitOptions,
    ): Promise<BitrixService> {
        if (!Bitrix.instance) {
            const service = new BitrixService();
            await service.init(domain, user, options);
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

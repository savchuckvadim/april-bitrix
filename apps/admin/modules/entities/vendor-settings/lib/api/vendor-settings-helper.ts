import { getAdminVendorSettings } from '@workspace/nest-admin-api';
import type {
    VendorSetting,
    VendorSettingKey,
    VendorSettings,
    VendorTelegramBot,
    VendorTelegramBotKey,
    VendorTelegramBotTestResult,
} from '../../model';

/**
 * Единственное место с импортом сгенерированного клиента
 * `admin-vendor-settings` (паттерн portal-keys-helper).
 */
export class VendorSettingsHelper {
    private api = getAdminVendorSettings();

    /** Все настройки по группам с описаниями и тем, что действует сейчас. */
    list(): Promise<VendorSettings> {
        return this.api.vendorSettingsList();
    }

    /**
     * Сохранить значение. Пусто или null — снять (действует окружение);
     * маска секрета — оставить прежнее.
     */
    save(key: VendorSettingKey, value: string | null): Promise<VendorSetting> {
        return this.api.vendorSettingsUpdate(key, { value });
    }

    /** Какой бот на самом деле стоит в каждом токене (спрашивает Telegram). */
    async telegramBots(): Promise<VendorTelegramBot[]> {
        return (await this.api.vendorSettingsTelegramBots()).bots;
    }

    /** Тестовое сообщение через бота (поддержка, тревоги — в их общий чат). */
    testTelegramBot(
        key: VendorTelegramBotKey,
        chatId?: string,
    ): Promise<VendorTelegramBotTestResult> {
        return this.api.vendorSettingsTestTelegramBot(key, chatId ? { chatId } : {});
    }
}

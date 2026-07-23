import {
    getTelegram,
    TelegramSendMessageDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Единственное место импорта telegram-клиента из api-пакета. */
export class TelegramHelper {
    private api: ReturnType<typeof getTelegram>;

    constructor() {
        this.api = getTelegram();
    }

    async send(dto: TelegramSendMessageDto): Promise<void> {
        await this.api.telegramGetTelegram(dto);
    }
}

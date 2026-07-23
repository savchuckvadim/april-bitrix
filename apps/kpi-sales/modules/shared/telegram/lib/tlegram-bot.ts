import type { TelegramSendMessageDto } from '@workspace/nest-kpi-report-sales-api';
import { EnumTelegramApp, ITelegramBotDto } from '../type/telegram.type';
import { TelegramHelper } from './api/telegram-helper';

const telegramHelper = new TelegramHelper();

/** Уведомления в Telegram — напрямую через бэк kpi-report-sales. */
export const telegramSendMessage = async (dto: ITelegramBotDto) => {
    try {
        await telegramHelper.send({
            app: EnumTelegramApp.KPI_SALES,
            text: dto.text,
            domain: dto.domain,
            userId: dto.userId,
        } as unknown as TelegramSendMessageDto);
    } catch (error) {
        console.error('telegram send error:', error);
    }
};

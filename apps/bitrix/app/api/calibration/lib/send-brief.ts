import { configureBaseURL, getTelegram } from '@workspace/nest-api';
import { buildBriefMessages } from './build-brief-messages';
import { CalibrationBriefSubmission } from './calibration-submission';

/**
 * Куда и от чьего имени уходит бриф. Оба брифа сайта (калибровка и оценка
 * звонка) падают в один чат бэка, поэтому различает их только это:
 * маркер отправителя и начало темы.
 */
export interface BriefTelegramTarget {
    /** Маркер отправителя в сообщении («App: …») */
    app: string;
    /** Начало темы: «Бриф калибровки», «Бриф оценки звонка» */
    subjectPrefix: string;
}

/**
 * Базовый адрес бэка для server-side вызовов. Та же переменная, что у
 * клиентского `modules/shared/api/api.ts`; без неё остаётся дефолт пакета.
 */
if (process.env.NEXT_PUBLIC_API_URL) {
    configureBaseURL(process.env.NEXT_PUBLIC_API_URL);
}

/**
 * Единственное место, где маршруты брифов ходят в бэк: протокол уходит
 * частями в `POST /api/telegram` (чат TELEGRAM_ADMIN_CHAT_ID бэка).
 * Части шлются последовательно, чтобы в чате они легли по порядку.
 */
export const sendBrief = async (
    submission: CalibrationBriefSubmission,
    target: BriefTelegramTarget,
): Promise<number> => {
    const api = getTelegram();
    const messages = buildBriefMessages(submission, target.subjectPrefix);
    for (const text of messages) {
        await api.telegramGetTelegram({
            app: target.app,
            text,
            domain: submission.domain || 'домен не указан',
            userId: submission.respondent || submission.company || 'сайт',
        });
    }
    return messages.length;
};

import {
    sendSiteBrief,
    type SiteBriefKind,
    type SiteInboxStatus,
} from '../../_site-inbox/site-inbox-backend';
import type { CalibrationBriefSubmission } from './calibration-submission';

/** Страница анкет: оба брифа живут в разделе /ai. */
const BRIEFS_PAGE = '/ai/briefs';

/** Бриф не доставлен: маршрут ответит 502 и предложит повторить. */
export class BriefNotDeliveredError extends Error {
    constructor(readonly status: Exclude<SiteInboxStatus, 'sent'>) {
        super(`Бриф не доставлен в Telegram: ${status}`);
        this.name = 'BriefNotDeliveredError';
    }
}

/**
 * Единственное место, где маршруты брифов ходят в бэк: протокол уходит в
 * приложение bot, а оно режет его на части и шлёт в Telegram-чат
 * «April Client». Возвращает число сообщений, которыми бриф лёг в чат.
 */
export const sendBrief = async (
    submission: CalibrationBriefSubmission,
    kind: SiteBriefKind,
): Promise<number> => {
    const result = await sendSiteBrief({
        kind,
        company: submission.company,
        respondent: submission.respondent,
        domain: submission.domain,
        protocol: submission.protocol,
        page: BRIEFS_PAGE,
    });
    if (result.status !== 'sent') {
        throw new BriefNotDeliveredError(result.status);
    }
    return result.parts;
};

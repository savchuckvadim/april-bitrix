import { RecentSubmissions } from '../calibration/lib/recent-submissions';
import {
    sendSiteLead,
    type SiteInboxStatus,
    type SiteLeadPayload,
} from './site-inbox-backend';
import {
    createVisitorRateLimiter,
    resolveVisitorKey,
    type VisitorHeaders,
    type VisitorRateLimiter,
} from './visitor-rate-limit';

/**
 * Ворота форм сайта перед отправкой в бэк: повтор той же заявки не уходит
 * второй раз, один посетитель не выбирает общий потолок бэка. Ловушку для
 * ботов и разбор полей делает маршрут — у каждой формы свои поля.
 */

/** «Повтор» — та же заявка уже в чате: посетителю отвечаем успехом. */
export type SiteLeadOutcome = SiteInboxStatus | 'duplicate';

/** Три отправки с одного адреса за 10 минут — человеку больше не нужно. */
const VISITOR_LIMIT = { limit: 3, windowMs: 10 * 60 * 1000, maxKeys: 5000 };

/**
 * Отпечаток заявки для отсева повторов: тот же вид, имя, контакты, компания
 * и комментарий — та же заявка, с какой бы страницы её ни отправили. Цифры
 * телефона без оформления: пробелы и скобки по смыслу ничего не меняют.
 */
export const siteLeadKey = (lead: SiteLeadPayload): string =>
    JSON.stringify([
        lead.kind,
        (lead.name ?? '').toLowerCase(),
        (lead.phone ?? '').replace(/\D/g, ''),
        (lead.email ?? '').toLowerCase(),
        (lead.company ?? '').toLowerCase(),
        lead.comment ?? '',
    ]);

/** Код ответа маршрута по исходу: недоставка — 502, потолок — 429, отказ в полях — 400. */
export const siteLeadHttpStatus = (outcome: SiteLeadOutcome): number => {
    if (outcome === 'throttled') return 429;
    if (outcome === 'rejected') return 400;
    if (outcome === 'failed') return 502;
    return 200;
};

export interface SiteLeadGateDeps {
    send: (lead: SiteLeadPayload) => Promise<SiteInboxStatus>;
    recent: RecentSubmissions;
    limiter: VisitorRateLimiter;
    now: () => number;
}

export interface SiteLeadGate {
    /** Заявка: повтор → лимит посетителя → отправка. */
    submit: (headers: VisitorHeaders, lead: SiteLeadPayload) => Promise<SiteLeadOutcome>;
    /** Пустит ли лимит ещё одну отправку этого посетителя (и учтёт её). */
    allowVisitor: (headers: VisitorHeaders) => boolean;
}

export const createSiteLeadGate = (deps: SiteLeadGateDeps): SiteLeadGate => {
    const allowVisitor = (headers: VisitorHeaders): boolean =>
        deps.limiter(resolveVisitorKey(headers), deps.now());

    return {
        allowVisitor,
        submit: async (headers, lead) => {
            const key = siteLeadKey(lead);
            if (deps.recent.isDuplicate(key)) return 'duplicate';
            // Повтор выше лимит не тратит: считаем только то, что уходит в бэк.
            if (!allowVisitor(headers)) return 'throttled';
            const status = await deps.send(lead);
            if (status === 'sent') deps.recent.remember(key);
            return status;
        },
    };
};

/** Ворота процесса: одна память повторов и один лимит на все формы сайта. */
export const siteLeadGate = createSiteLeadGate({
    send: sendSiteLead,
    recent: new RecentSubmissions(),
    limiter: createVisitorRateLimiter(VISITOR_LIMIT),
    now: () => Date.now(),
});

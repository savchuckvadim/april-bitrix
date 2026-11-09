import type { SiteLeadPayload } from '../../../_site-inbox/site-inbox-backend';
import { looksLikeEmail } from '../../../_site-inbox/site-lead-contacts';

const EMAIL_MAX_LENGTH = 200;

/**
 * «Заказать КП на почту» с главной (/home). Почтового отправителя у сайта
 * больше нет, поэтому просьба уходит заявкой в чат «April Client» — КП
 * отправляет менеджер. null — в теле нет нормальной почты: тогда 400 и
 * просьба проверить адрес, а не «позвоните нам».
 */
export function parseOfferRequest(body: unknown): SiteLeadPayload | null {
    if (typeof body !== 'object' || body === null) return null;
    const value = (body as Record<string, unknown>).email;
    const email = typeof value === 'string' ? value.trim().slice(0, EMAIL_MAX_LENGTH) : '';
    if (!looksLikeEmail(email)) return null;
    return { kind: 'offer', email, page: '/home' };
}

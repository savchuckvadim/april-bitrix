import { siteLeadGate, siteLeadHttpStatus } from '../../_site-inbox/site-inbox-gate';
import { parseOfferRequest } from './lib/offer-request';

/**
 * «Заказать КП на почту» с главной (/home) → бэк bot → Telegram-чат
 * «April Client». Почта сайта не работает, поэтому КП отправляет менеджер по
 * заявке; путь, повторы и лимит на посетителя — как у остальных форм сайта.
 */
const json = (body: Record<string, unknown>, status: number): Response =>
    Response.json(body, { status });

export async function POST(request: Request): Promise<Response> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return json({ ok: false }, 400);
    }

    const lead = parseOfferRequest(body);
    if (!lead) {
        return json({ ok: false }, 400);
    }

    const status = siteLeadHttpStatus(await siteLeadGate.submit(request.headers, lead));
    return json({ ok: status === 200 }, status);
}

import { siteLeadGate, siteLeadHttpStatus } from '../_site-inbox/site-inbox-gate';
import { parseHomeLead } from './lib/home-lead';

/**
 * Заявка с формы главной (/home) → бэк bot → Telegram-чат «April Client».
 *
 * Раньше шла в выведенный back.april-app.ru и терялась; теперь тем же путём,
 * что заявки раздела /platform: повтор и лимит на посетителя — в общих
 * воротах форм сайта, недоставка — 502/429, чтобы форма не говорила
 * «отправлено» зря.
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

    const lead = parseHomeLead(body);
    if (!lead) {
        return json({ ok: false }, 400);
    }

    const status = siteLeadHttpStatus(await siteLeadGate.submit(request.headers, lead));
    return json({ ok: status === 200 }, status);
}

import {
    isHoneypotFilled,
    parseDemoRequest,
} from '@/app/(landing)/platform/model/demo-request';
import { siteLeadGate, siteLeadHttpStatus } from '../_site-inbox/site-inbox-gate';
import { toDemoLead } from './lib/demo-lead';

/**
 * Заявка на демо с раздела /platform → бэк bot → Telegram-чат «April Client».
 *
 * Ловушка для ботов (бот получает «ок» и тишину), кривое тело — 400; повтор
 * и лимит на посетителя — в общих воротах форм сайта; недоставка — 502 и
 * 429, чтобы форма показала телефон, а не «заявка у нас».
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

    if (isHoneypotFilled(body)) {
        return json({ ok: true }, 200);
    }

    const parsed = parseDemoRequest(body);
    if (!parsed.ok) {
        return json({ ok: false, errors: parsed.errors }, 400);
    }

    const outcome = await siteLeadGate.submit(request.headers, toDemoLead(parsed.request));
    const status = siteLeadHttpStatus(outcome);
    return json({ ok: status === 200 }, status);
}

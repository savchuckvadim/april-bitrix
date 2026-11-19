import { NextRequest, NextResponse } from 'next/server';
import { CALL_REVIEW_TEXT, callReviewErrorText } from '@/modules/entities/call-review';
import { PRIVATE_HEADERS, unwrapEnvelope } from '../../../../../../_lib/backend';
import { callLeadBackendUrl } from '../../../../../../_lib/call-page-lead';

/**
 * Предел тела: комментарий 20 000 знаков и 30 пунктов по 2 500 — в UTF-8
 * с запасом укладываются в полмегабайта. Больше — не отзыв.
 */
const MAX_BODY_CHARS = 512 * 1024;

const reply = (body: unknown, status: number) =>
    NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

const fail = (message: string, status: number) => reply({ message }, status);

/** Тело запроса — объект JSON; иначе null. */
const parseObject = (text: string): Record<string, unknown> | null => {
    try {
        const value: unknown = JSON.parse(text);
        return typeof value === 'object' && value !== null && !Array.isArray(value)
            ? (value as Record<string, unknown>)
            : null;
    } catch {
        return null;
    }
};

/**
 * Сохранение отзыва руководителя: браузер видит только наш origin, адрес
 * бэкенда наружу не идёт. Тело уходит в бэкенд как есть (проверяет бэк),
 * ответ — блок отзывов без конверта Nest; ошибка — тот же статус и понятный
 * текст бэка (404, 410, 403, 429) в `{ message }`.
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ token: string; lead: string }> },
) {
    const { token, lead } = await params;
    const text = await req.text();
    if (text.length > MAX_BODY_CHARS) return fail(CALL_REVIEW_TEXT.errors.tooLong, 413);
    const body = parseObject(text);
    if (body === null) return fail(CALL_REVIEW_TEXT.errors.unreadable, 400);

    try {
        const upstream = await fetch(callLeadBackendUrl(token, lead, '/review'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store',
            signal: req.signal,
        });
        const payload: unknown = await upstream.json().catch(() => null);
        if (!upstream.ok) {
            return fail(callReviewErrorText(payload, upstream.status), upstream.status);
        }
        return reply(unwrapEnvelope(payload), 200);
    } catch (error) {
        if (!req.signal.aborted) {
            console.error('[call review proxy] ошибка:', error);
        }
        return fail(CALL_REVIEW_TEXT.errors.saveFailed, 502);
    }
}

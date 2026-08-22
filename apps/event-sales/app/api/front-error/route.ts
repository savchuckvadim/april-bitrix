import { NextRequest, NextResponse } from 'next/server';
import { logServer } from '@/app/lib/logs/logServer';

export const runtime = 'nodejs';

/**
 * Приём ошибок фронта: браузер стучится ТОЛЬКО сюда, на свой же домен.
 *
 * Прокси нужен, чтобы из фронта не было видно вообще ничего про Telegram —
 * ни адреса бэка, ни токенов, ни того, что тревога вообще уходит в TG
 * (решение владельца 14.08). Маршрут пишет ошибку в серверный лог приложения
 * и, когда фронт пометил её тревожной (`withTg`), пересылает бэку — тот сам
 * решает, как доставить в Telegram.
 *
 * Троттлинг здесь, на первом сервере от браузера: упавший в цикле фронт шлёт
 * одну и ту же ошибку десятками в секунду, и без гейта канал превращается в
 * поток. Одинаковые сообщения уходят дальше не чаще раза в минуту.
 */

interface FrontErrorBody {
    /** Где упало: `contact.create`, `contact.update`, `send.flow`, … */
    place?: string;
    message?: string;
    domain?: string;
    userId?: string | number;
    /** Тревога: переслать бэку для Telegram, а не только записать в лог. */
    withTg?: boolean;
    /** Любые детали для разбора (без персональных данных клиента). */
    context?: Record<string, unknown>;
}

const THROTTLE_MS = 60_000;
/** `<place>:<message>` → когда пересылали в последний раз. */
const lastForwardedAt = new Map<string, number>();

const shouldForward = (key: string, now: number): boolean => {
    const last = lastForwardedAt.get(key) ?? 0;
    if (now - last < THROTTLE_MS) return false;
    lastForwardedAt.set(key, now);
    // Карта не должна расти вечно: старые ключи выметаем по ходу.
    if (lastForwardedAt.size > 500) {
        for (const [k, at] of lastForwardedAt) {
            if (now - at > THROTTLE_MS) lastForwardedAt.delete(k);
        }
    }
    return true;
};

export async function POST(req: NextRequest) {
    let body: FrontErrorBody = {};
    try {
        body = (await req.json()) as FrontErrorBody;
    } catch {
        return NextResponse.json({ error: 'bad json' }, { status: 400 });
    }

    const place = String(body.place ?? 'unknown');
    const message = String(body.message ?? 'unknown error').slice(0, 2000);
    const domain = String(body.domain ?? 'unknown');
    const userId = String(body.userId ?? 'unknown');

    logServer(
        'error',
        `event-sales front ${place}`,
        `${message}${body.context ? ` | ${JSON.stringify(body.context)}` : ''}`,
        domain,
        userId,
    );

    if (body.withTg && shouldForward(`${place}:${message}`, Date.now())) {
        // Готовая бэк-ручка POST /api/telegram (TelegramSendMessageDto).
        // Недоступна — не страшно: лог уже записан, фронту всегда ok.
        // Адрес — СЕРВЕРНАЯ переменная: NEXT_PUBLIC_* инлайнится в браузерный
        // бандл, а из браузера не должно быть видно, куда уходит тревога.
        const backUrl =
            process.env.FRONT_ERROR_BACK_URL ??
            process.env.NEXT_PUBLIC_EVENT_SALES_API_URL;
        if (backUrl) {
            const text = [
                `⚠️ event-sales front: ${place}`,
                message,
                body.context ? JSON.stringify(body.context) : null,
            ]
                .filter(Boolean)
                .join('\n');
            try {
                await fetch(`${backUrl.replace(/\/+$/, '')}/api/telegram`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        app: 'event-sales-front',
                        text,
                        domain,
                        userId,
                    }),
                    signal: AbortSignal.timeout(5000),
                });
            } catch (error) {
                logServer(
                    'warn',
                    'event-sales front-error forward',
                    `Не дошло до бэка: ${(error as Error)?.message}`,
                    domain,
                    userId,
                );
            }
        }
    }

    return NextResponse.json({ success: true });
}

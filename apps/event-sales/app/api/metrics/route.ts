import { createHash, timingSafeEqual } from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';

import { getBusinessMetrics } from '@/app/lib/metrics/registry';

/**
 * Что скрейпит Prometheus (back/infra/prometheus/prometheus.yml).
 *
 * Реестр сюда приходит готовым из `app/lib/metrics/registry.ts` — тот же
 * экземпляр, в который пишет маршрут приёма событий браузера
 * (`/api/metrics/report`). Раньше реестр создавался прямо здесь, и второй
 * маршрут дотянуться до него не мог.
 *
 * ═══ ПОЧЕМУ ЗДЕСЬ ЕСТЬ АВТОРИЗАЦИЯ, А У СОСЕДНЕГО МАРШРУТА НЕТ ═══
 *
 * Соседний маршрут (`/report`) анонимен вынужденно: замер рождается во фрейме
 * менеджера до всякого auth, и подписать пачку нечем. Здесь ровно наоборот —
 * потребитель ОДИН и он серверный, поэтому общий секрет возможен, а значит
 * обязателен: в теле ответа лежит разрез по доменам ВСЕХ клиентских порталов
 * вместе с цифрами по неудачным отчётам. Публичным этот адрес быть не должен,
 * и 31.08 он таким и был — `https://next.april-app.ru/sales/api/metrics`
 * открывался из интернета кем угодно.
 *
 * ЗАКРЫТО ПО УМОЛЧАНИЮ. Нет `METRICS_SCRAPE_TOKEN` в окружении процесса —
 * маршрут не отдаёт ничего. Такой выбор («fail closed») сделан осознанно:
 * забытая переменная должна ломать СБОР метрик, а не открывать список
 * клиентов. Обратный порядок — отдавать, пока не настроили, — ровно та
 * ошибка, которую этот файл и чинит.
 *
 * ЭТО НЕ ОТМЕНЯЕТ ПРАВКУ NGINX (docs/metrics-endpoint-security.md). Токен
 * закрывает ЧТЕНИЕ метрик; периметр закрывает всё остальное — приём событий
 * от браузера ограничить частотой в коде можно только на честном адресе
 * источника, а его ставит nginx. Два рубежа, не замена друг другу.
 *
 * ПОЧЕМУ 404, А НЕ 403. 403 подтверждает, что адрес существует и охраняется;
 * 404 не подтверждает ничего. Диагностика при этом не страдает: причина
 * отказа уходит в лог процесса, где её видит владелец, но не посторонний.
 */

export const runtime = 'nodejs';
/**
 * Никакого кэша: закэшированный ответ означал бы, что Prometheus минутами
 * получает один и тот же снимок и графики стоят.
 */
export const dynamic = 'force-dynamic';

const BEARER = /^bearer\s+(.+)$/i;

/**
 * Сравнение секретов постоянного времени.
 *
 * Оба значения сначала хэшируются, и только потом сравниваются. Хэш нужен не
 * ради секретности — секрет и так у нас в руках, — а ради ДЛИНЫ: сравнение
 * постоянного времени требует одинаковой длины буферов, и наивная проверка
 * `a.length !== b.length` разболтала бы длину токена по времени ответа.
 * После sha256 длина всегда 32 байта, и утекать нечему.
 */
const secretsMatch = (presented: string, expected: string): boolean => {
    const a = createHash('sha256').update(presented).digest();
    const b = createHash('sha256').update(expected).digest();
    return timingSafeEqual(a, b);
};

/** Предупреждение про незаданный токен пишется один раз на процесс. */
let warnedMissingToken = false;

const denialReason = (request: NextRequest): string | null => {
    const expected = process.env.METRICS_SCRAPE_TOKEN?.trim();
    if (!expected) {
        if (!warnedMissingToken) {
            warnedMissingToken = true;
            console.warn(
                '[metrics] METRICS_SCRAPE_TOKEN не задан — отдача метрик закрыта. ' +
                    'Задайте переменную процессу и пропишите тот же токен ' +
                    'в bearer_token цели Prometheus.',
            );
        }
        return 'no-token-configured';
    }

    const header = request.headers.get('authorization');
    if (!header) return 'no-authorization-header';

    const match = BEARER.exec(header.trim());
    if (!match) return 'not-bearer-scheme';

    return secretsMatch(match[1]!.trim(), expected) ? null : 'token-mismatch';
};

export async function GET(request: NextRequest) {
    const denied = denialReason(request);
    if (denied) {
        if (denied !== 'no-token-configured') {
            console.warn(`[metrics] отдача метрик отклонена: ${denied}`);
        }
        return new NextResponse(null, { status: 404 });
    }

    const { registry } = getBusinessMetrics();
    const metrics = await registry.metrics();
    return new NextResponse(metrics, {
        status: 200,
        headers: {
            'Content-Type': registry.contentType,
            // Снимок метрик не должен осесть ни в одном промежуточном кэше.
            'Cache-Control': 'no-store',
        },
    });
}

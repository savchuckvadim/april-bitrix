import { NextRequest, NextResponse } from 'next/server';

import { MAX_BODY_BYTES } from '@/modules/shared/metrics/lib/metric-contract';
import {
    createRateLimiter,
    resolveRateKey,
} from '@/modules/shared/metrics/lib/metrics-rate-limit';
import { parseMetricBatch } from '@/modules/shared/metrics/lib/serialize-metric-event';

import { recordMetricEvent } from '@/app/lib/metrics/registry';

/**
 * Приём бизнес-метрик из браузера.
 *
 * События происходят во фрейме, а prom-client живёт в процессе Next-сервера —
 * клиентский замер сам в реестр не попадёт. Этот маршрут и есть недостающее
 * звено: браузер шлёт пачку сюда, на СВОЙ домен (тот же приём, что у
 * `/api/front-error`: наружу из бандла не видно ни адресов, ни хранилищ), а
 * маршрут инкрементит счётчики, которые потом скрейпит Prometheus с
 * `/api/metrics`.
 *
 * ГЛАВНОЕ ПРАВИЛО: метрика не имеет права ронять приложение. Маршрут не
 * бросает ни на каком теле — ни на не-JSON, ни на массиве вместо объекта, ни
 * на десяти мегабайтах. Всё, что не разобралось, молча исчезает, ответ всегда
 * один и тот же.
 *
 * ЗАЩИТА ОТ КАРДИНАЛЬНОСТИ И ПЕРСОНАЛЬНЫХ ДАННЫХ живёт целиком в
 * `serializeMetricEvent`: имя метрики — только из белого списка, метки —
 * только объявленные, домен — только похожий на портал Битрикса,
 * идентификатор менеджера или сделки в метке выбрасывает событие целиком.
 * Маршрут не доверяет клиенту и прогоняет через ту же функцию, что и сам
 * клиент перед отправкой.
 *
 * ЧЕГО ЭТОТ ФАЙЛ НЕ УМЕЕТ. Маршрут анонимный: авторизации у него нет и быть
 * не может (браузер стучится до всякого auth). Пока `/sales/api/` открыт
 * наружу целиком, всё здешнее — гигиена, а не периметр: и лимит частоты, и
 * потолок тела подделываются тем, кто дотянулся до порта контейнера мимо
 * nginx. Периметр закрывается на nginx, точный кусок конфига —
 * docs/metrics-endpoint-security.md; закрыть его ОБЯЗАН владелец.
 *
 * ВЫКЛЮЧАТЕЛЬ: `METRICS_DISABLED=1` в окружении процесса — приём мгновенно
 * замолкает, без релиза и без пересборки (переменная читается в рантайме,
 * достаточно перезапустить контейнер). Клиентская половина гасится своей
 * переменной сборки `NEXT_PUBLIC_METRICS_DISABLED` (см. metrics-client.ts).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Лимит частоты на источник. Штатная вкладка шлёт пачку раз в 15 секунд плюс
 * на скрытие — 120 в минуту это десятки вкладок из одного офиса (менеджеры
 * сидят за общим NAT, и адрес у них один). Всё сверх — зациклившийся клиент
 * или чужой поток.
 */
const isWithinRate = createRateLimiter({
    limit: 120,
    windowMs: 60_000,
    maxKeys: 2000,
});

const isDisabled = (): boolean => {
    const flag = process.env.METRICS_DISABLED;
    return flag === '1' || flag === 'true';
};

/** Ответ без тела: клиент его не читает и ничего по нему не решает. */
const noContent = (status: number): NextResponse =>
    new NextResponse(null, { status });

/**
 * Тело ПОТОКОМ, с обрывом на потолке. `null` — потолок превышен.
 *
 * Почему не `await req.text()` с проверкой длины после. Проверка после — это
 * проверка того, что уже целиком лежит в памяти процесса: `text()`
 * буферизует всё, и десять мегабайт доезжают до кучи прежде, чем кто-то
 * успевает сказать 413. Заголовок `Content-Length` тоже не спасает — при
 * `Transfer-Encoding: chunked` его нет вовсе, и предварительная проверка
 * пропускает любой размер. Единственная честная защита — считать байты по
 * мере чтения и оборвать чтение на первом чанке за потолком: `reader.cancel()`
 * закрывает поток, остаток тела в память не попадает.
 *
 * `Content-Length` при этом остаётся первым, дешёвым рубежом: он позволяет
 * отказать честному клиенту, не читая ни байта.
 */
const readCappedBody = async (req: NextRequest): Promise<string | null> => {
    const stream = req.body;
    // Тела нет вовсе — читать нечего, дальше разбор честно вернёт пусто.
    if (!stream) return '';

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let text = '';

    for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > MAX_BODY_BYTES) {
            void reader.cancel().catch(() => undefined);
            return null;
        }
        text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
};

export async function POST(req: NextRequest) {
    try {
        if (isDisabled()) return noContent(204);

        // Первый рубеж — заявленная длина: отказ без единого прочитанного
        // байта. Заголовка может не быть (chunked), и тогда рубеж молчит —
        // настоящий потолок стоит ниже, в readCappedBody.
        const declared = Number(req.headers.get('content-length') ?? '0');
        if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
            return noContent(413);
        }

        if (!isWithinRate(resolveRateKey(req.headers), Date.now())) {
            return noContent(429);
        }

        const text = await readCappedBody(req);
        if (text === null) return noContent(413);

        let body: unknown;
        try {
            body = JSON.parse(text);
        } catch {
            return noContent(400);
        }

        for (const event of parseMetricBatch(body)) recordMetricEvent(event);

        return noContent(204);
    } catch {
        // Сюда попадать нечему, но если попадёт — маршрут метрик обязан
        // молчать, а не отдавать 500 браузеру менеджера.
        return noContent(204);
    }
}

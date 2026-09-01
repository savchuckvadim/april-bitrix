import { getAppUrl } from '@/modules/app/lib/utills/url';

import type {
    MetricBatchBody,
    MetricEvent,
    SerializedMetricEvent,
} from '../model/metric-event.type';
import { METRIC_BATCH_VERSION } from '../model/metric-event.type';
import { METRICS_REPORT_PATH } from './metric-contract';
import { serializeMetricEvent } from './serialize-metric-event';

/**
 * Сборщик бизнес-метрик в браузере.
 *
 * ЖЕЛЕЗНОЕ ПРАВИЛО: метрики — диагностика, а не работа приложения. Ни один
 * вызов отсюда не бросает, ничего не ждёт и ничего не блокирует. Маршрут
 * недоступен, сеть отвалилась, тело не сериализовалось — событие молча
 * забывается. Менеджер, который сдаёт отчёт, не должен даже теоретически
 * упереться в счётчик.
 *
 * Копим и шлём ПАЧКОЙ: во фрейме и так тесно по запросам, а отдельный POST на
 * каждую фазу бута сам стал бы вкладом в ту цифру, которую мы измеряем.
 * Отправка — по таймеру и на скрытие вкладки: во фрейме Битрикса вкладку не
 * «закрывают», её прячут (менеджер ушёл в другой раздел портала), и
 * `visibilitychange` — единственное надёжное «сейчас всё замрёт».
 * `beforeunload`/`unload` во фрейме не гарантированы и мобильными браузерами
 * не вызываются вовсе, поэтому опора именно на `visibilitychange` + `pagehide`.
 *
 * ВЫКЛЮЧАТЕЛЬ: `NEXT_PUBLIC_METRICS_DISABLED=1` на сборке — сбор не ведётся
 * вовсе, буфер всегда пуст, ни одного запроса. Серверная половина гасится
 * отдельно и уже без пересборки: `METRICS_DISABLED=1` в окружении процесса
 * (см. app/api/metrics/report/route.ts).
 */

/** Событий в буфере. Переполнение = авария, а не режим работы. */
const DEFAULT_BUFFER_CAP = 200;

/** Как часто выгребаем буфер. Секунды роли не играют, метрики не про latency. */
const DEFAULT_FLUSH_INTERVAL_MS = 15_000;

export interface MetricsClientOptions {
    /** Транспорт. Подменяется в тестах; по умолчанию — beacon/fetch. */
    send?: (body: MetricBatchBody) => void;
    bufferCap?: number;
    flushIntervalMs?: number;
    /** Выключатель. По умолчанию — переменная окружения сборки. */
    isEnabled?: () => boolean;
}

export interface MetricsClient {
    /** Запомнить событие. Ничего не бросает и ничего не ждёт. */
    collect: (event: MetricEvent) => void;
    /** Отправить накопленное прямо сейчас. */
    flush: () => void;
    /** Сколько событий ждёт отправки — для тестов и диагностики. */
    size: () => number;
}

/**
 * Сбор выключен переменной сборки. `NEXT_PUBLIC_*` инлайнится в бандл, то
 * есть выключение клиентской половины стоит пересборки — для мгновенного
 * «замолчать» есть серверный `METRICS_DISABLED`, он читается в рантайме.
 */
export const isMetricsEnabled = (): boolean => {
    const disabled = process.env.NEXT_PUBLIC_METRICS_DISABLED;
    return disabled !== '1' && disabled !== 'true';
};

/**
 * Доставка пачки на свой же домен. Beacon переживает скрытие и выгрузку
 * вкладки (браузер дошлёт сам), fetch с `keepalive` — запасной путь.
 */
const postBatch = (body: MetricBatchBody): void => {
    try {
        const url = getAppUrl(METRICS_REPORT_PATH);
        const json = JSON.stringify(body);
        const beacon =
            typeof navigator !== 'undefined' ? navigator.sendBeacon : undefined;
        if (beacon) {
            const blob = new Blob([json], { type: 'application/json' });
            // Beacon возвращает false, когда браузер отказался ставить запрос
            // в очередь (превышен лимит) — тогда пробуем fetch.
            if (beacon.call(navigator, url, blob)) return;
        }
        if (typeof fetch !== 'function') return;
        void fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
            keepalive: true,
        }).catch(() => undefined);
    } catch {
        // Молчим намеренно: см. железное правило в шапке файла.
    }
};

export const createMetricsClient = (
    options: MetricsClientOptions = {},
): MetricsClient => {
    const send = options.send ?? postBatch;
    const bufferCap = options.bufferCap ?? DEFAULT_BUFFER_CAP;
    const flushIntervalMs =
        options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
    const isEnabled = options.isEnabled ?? isMetricsEnabled;

    let buffer: SerializedMetricEvent[] = [];
    let timer: ReturnType<typeof setTimeout> | null = null;

    const stopTimer = (): void => {
        if (timer === null) return;
        clearTimeout(timer);
        timer = null;
    };

    const flush = (): void => {
        try {
            stopTimer();
            if (!buffer.length) return;
            const events = buffer;
            // Буфер освобождаем ДО отправки: упавший транспорт не должен
            // держать события навечно и копить их поверх старых.
            buffer = [];
            send({ v: METRIC_BATCH_VERSION, events });
        } catch {
            // Диагностика не имеет права ронять вызывающий код.
        }
    };

    const collect = (event: MetricEvent): void => {
        try {
            if (!isEnabled()) return;
            // Переполнение: выбрасываем НОВОЕ, а не старое. Буфер копится
            // только когда отправка не проходит, и в этот момент ценнее
            // первые события (фазы бута), а не хвост цикла, который его забил.
            if (buffer.length >= bufferCap) return;
            const serialized = serializeMetricEvent(event);
            if (!serialized) return;
            buffer.push(serialized);
            if (timer === null) timer = setTimeout(flush, flushIntervalMs);
        } catch {
            // См. выше: сбор метрик не бросает никогда.
        }
    };

    return { collect, flush, size: () => buffer.length };
};

/**
 * Сборщик — БРАУЗЕРНАЯ половина метрик, и работает он только во вкладке.
 *
 * Проверка именно на `document`, а не на `window`: серверная половина пишет
 * в реестр напрямую, замерять ей через сеть нечего, а часть тестов подменяет
 * `window` объектом-заглушкой (фейковое хранилище конвертов) — по нему
 * «браузер» определился бы ложно, и прогон тестов начал бы копить буфер и
 * дёргать сеть за спиной у проверяемого кода. Настоящая вкладка отличается
 * наличием документа.
 */
const isBrowser = (): boolean =>
    typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Общий сборщик приложения — через него ходят все врезки в бизнес-код.
 *
 * Два условия молчания разом: выключатель сборки и «мы не во вкладке».
 * Молчание означает буквально НИЧЕГО: ни буфера, ни таймера, ни запроса —
 * см. `collect`.
 */
export const metrics = createMetricsClient({
    isEnabled: () => isMetricsEnabled() && isBrowser(),
});

/** Сборщики, на которые слушатели уже навешаны (защита от двойной подписки). */
const hooked = new WeakSet<MetricsClient>();

/**
 * Подписка на «вкладку сейчас спрячут». Идемпотентна: повторный вызов не
 * навешивает второй слушатель. Возвращает отписку (нужна тестам и HMR).
 *
 * ВЫКЛЮЧАТЕЛЬ ПРОВЕРЯЕТСЯ ЗДЕСЬ, а не только в `collect`. Зовут эту функцию
 * из store.ts безусловно, на импорте модуля; без проверки выключенные метрики
 * всё равно вешали два слушателя на каждый показ и скрытие вкладки — то есть
 * «выключено» означало «работает вхолостую». Выключено должно означать
 * буквально ничего.
 */
export const installMetricsFlushHooks = (
    client: MetricsClient = metrics,
): (() => void) => {
    if (!isMetricsEnabled()) return () => undefined;
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return () => undefined;
    }
    if (hooked.has(client)) return () => undefined;
    hooked.add(client);
    const onHide = (): void => {
        if (document.visibilityState === 'hidden') client.flush();
    };
    const onPageHide = (): void => client.flush();
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
        hooked.delete(client);
        document.removeEventListener('visibilitychange', onHide);
        window.removeEventListener('pagehide', onPageHide);
    };
};

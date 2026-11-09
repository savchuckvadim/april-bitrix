/**
 * Лимит отправок с форм сайта на одного посетителя.
 *
 * Бэк держит общий потолок заявок в минуту — предохранитель чата. Без
 * лимита на посетителя один скрипт выбирал бы весь этот потолок, и настоящие
 * посетители получали бы отказ. Поэтому одного посетителя режем здесь, на
 * первом сервере от браузера.
 *
 * Приём тот же, что у `apps/event-sales/modules/shared/metrics/lib/
 * metrics-rate-limit.ts` (второе место в монорепе — по правилу трёх в пакет
 * пока не выносим): фиксированное окно на ключ, время приходит аргументом,
 * карта ключей с потолком.
 */

export interface VisitorRateLimitOptions {
    /** Сколько заявок разрешено одному посетителю в окне. */
    limit: number;
    /** Длина окна, мс. */
    windowMs: number;
    /** Потолок числа посетителей в памяти: ключи задаёт тот, кто стучится. */
    maxKeys: number;
}

/** `true` — пропустить и учесть, `false` — отказать. */
export type VisitorRateLimiter = (key: string, now: number) => boolean;

interface VisitorWindow {
    startedAt: number;
    hits: number;
}

export const createVisitorRateLimiter = (
    options: VisitorRateLimitOptions,
): VisitorRateLimiter => {
    const windows = new Map<string, VisitorWindow>();

    const forget = (now: number): void => {
        windows.forEach((window, key) => {
            if (now - window.startedAt >= options.windowMs) windows.delete(key);
        });
        // Шторм с тысяч адресов: потерять учёт на одно окно не страшно,
        // держать бесконечную карту в памяти сервера — страшно.
        if (windows.size >= options.maxKeys) windows.clear();
    };

    return (key, now) => {
        const window = windows.get(key);
        if (!window || now - window.startedAt >= options.windowMs) {
            if (windows.size >= options.maxKeys) forget(now);
            windows.set(key, { startedAt: now, hits: 1 });
            return true;
        }
        if (window.hits >= options.limit) return false;
        window.hits += 1;
        return true;
    };
};

/** Минимум от `Headers`, который нужен резолверу адреса. */
export interface VisitorHeaders {
    get: (name: string) => string | null;
}

/**
 * Адрес посетителя. `X-Real-IP` nginx ставит сам из `$remote_addr`;
 * запасной путь — ПОСЛЕДНИЙ элемент `X-Forwarded-For`, адрес, увиденный
 * ближайшим прокси. Первый элемент пишет клиент: ключ по нему атакующий
 * менял бы на каждый запрос.
 */
export const resolveVisitorKey = (headers: VisitorHeaders): string => {
    const real = headers.get('x-real-ip')?.trim();
    if (real) return real;
    const chain = headers.get('x-forwarded-for')?.split(',') ?? [];
    return chain[chain.length - 1]?.trim() || 'unknown';
};

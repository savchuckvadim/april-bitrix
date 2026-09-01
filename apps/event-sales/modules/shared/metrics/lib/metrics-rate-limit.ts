/**
 * Лимит частоты для маршрута приёма метрик.
 *
 * Тот же приём, что у троттлинга в `app/api/front-error/route.ts`: гейт
 * стоит на ПЕРВОМ сервере от браузера. Разница в поводе — там душат
 * повторяющийся текст ошибки, здесь просто частоту пачек: маршрут открыт
 * (браузер стучится без авторизации), и одна зациклившаяся вкладка не должна
 * ни забить процесс, ни размазать реестр.
 *
 * Живёт в `shared`, а не рядом с маршрутом, ровно по одной причине: функция
 * чистая (время приходит аргументом, состояние — в замыкании) и потому
 * покрыта тестами. Браузеру она не нужна и в бандл не тянется.
 */

export interface RateLimiterOptions {
    /** Сколько пачек в окне разрешено одному ключу. */
    limit: number;
    /** Длина окна, мс. */
    windowMs: number;
    /**
     * Потолок числа ключей. Ключ — адрес источника, и их количество задаёт
     * не наш код, а тот, кто стучится: без потолка карта росла бы вечно.
     */
    maxKeys: number;
}

export interface RateLimiter {
    /** `true` — пропустить, `false` — отказать. */
    (key: string, now: number): boolean;
}

interface RateWindow {
    /** Начало текущего окна. */
    startedAt: number;
    /** Сколько пачек в нём уже пришло. */
    hits: number;
}

export const createRateLimiter = (options: RateLimiterOptions): RateLimiter => {
    const windows = new Map<string, RateWindow>();

    const forget = (now: number): void => {
        // Сначала выметаем протухшие — обычно этого хватает. Если и после
        // этого ключей слишком много (шторм с тысяч адресов), карта чистится
        // целиком: потерять учёт частоты на одно окно не страшно, а вот
        // держать бесконечную карту в памяти сервера — страшно.
        for (const [key, window] of windows) {
            if (now - window.startedAt >= options.windowMs) windows.delete(key);
        }
        if (windows.size > options.maxKeys) windows.clear();
    };

    return (key: string, now: number): boolean => {
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

/** Минимум от `Headers`, который нужен резолверу ключа. */
export interface HeaderBag {
    get: (name: string) => string | null;
}

/**
 * Ключ лимита частоты — АДРЕС ИСТОЧНИКА, и взять его можно ровно одним
 * честным способом.
 *
 * `X-Forwarded-For` дописывается СЛЕВА: nginx стоит с
 * `proxy_add_x_forwarded_for`, то есть в заголовок приезжает то, что прислал
 * клиент, а адрес, который видел сам nginx, встаёт в КОНЕЦ. Значит первый
 * элемент — строка, которую атакующий пишет сам: подставив в неё каждый раз
 * новое значение, он получает новый ключ на каждый запрос, и лимит не
 * срабатывает никогда. Ровно так он и обходился.
 *
 * Поэтому берём `X-Real-IP` — его nginx ставит сам из `$remote_addr` и
 * перезаписывает присланное клиентом, — а запасным путём ПОСЛЕДНИЙ элемент
 * XFF, то есть тоже адрес, увиденный ближайшим прокси, а не заявленный
 * клиентом.
 *
 * Честная оговорка: если до приложения дотянулись МИМО nginx (порт
 * контейнера опубликован наружу), подделать можно и это. Лечится только
 * закрытием маршрута на периметре — см. docs/metrics-endpoint-security.md.
 */
export const resolveRateKey = (headers: HeaderBag): string => {
    const real = headers.get('x-real-ip')?.trim();
    if (real) return real;
    const forwarded = headers.get('x-forwarded-for');
    const chain = forwarded?.split(',') ?? [];
    const last = chain[chain.length - 1]?.trim();
    return last || 'unknown';
};

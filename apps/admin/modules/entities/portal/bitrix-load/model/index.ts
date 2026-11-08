/**
 * Нагрузка портала на Битрикс по метрикам Prometheus
 * (`GET admin/portal/:portalId/bitrix-load`): обращения бэкендов April к
 * REST портала за окно, ошибки и таймауты, ограничитель частоты.
 */

/** Класс вызова: interactive — действие человека, background — фон. */
export interface BitrixLoadClass {
    callClass: string;
    calls: number;
}

export interface BitrixLoadMethod {
    method: string;
    calls: number;
}

export interface BitrixLoadRateLimit {
    /** Слот ограничителя выдан. */
    granted: number;
    /** Слот не дождались, интерактивный запрос ушёл без него. */
    passed: number;
    /** Слот не дождались, фоновому вызову отказано. */
    rejected: number;
}

export interface BitrixLoadPeak {
    /** Конец самого нагруженного часа (ISO). */
    at: string;
    calls: number;
}

export interface PortalBitrixLoad {
    domain: string;
    hours: number;
    /** false — Prometheus недоступен или метрик нет, причина в reason. */
    available: boolean;
    reason: string | null;
    total: number;
    ok: number;
    errors: number;
    timeouts: number;
    byClass: BitrixLoadClass[];
    topMethods: BitrixLoadMethod[];
    rateLimit: BitrixLoadRateLimit;
    /** 95-й перцентиль длительности вызова, секунд; null — нет данных. */
    p95Seconds: number | null;
    peakHour: BitrixLoadPeak | null;
}

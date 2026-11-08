/** Нагрузка портала на Битрикс по метрикам Prometheus. */
export { usePortalBitrixLoad } from './lib/hooks/use-bitrix-load';
export type {
    BitrixLoadClass,
    BitrixLoadMethod,
    BitrixLoadPeak,
    BitrixLoadRateLimit,
    PortalBitrixLoad,
} from './model';

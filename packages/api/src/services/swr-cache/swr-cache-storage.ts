/**
 * KV-слой переехал в `services/kv-storage` — теперь это общая дверь
 * swr-cache и outbox к браузерному хранилищу. Здесь остались прежние
 * имена, чтобы потребители swr-cache не менялись ни строкой; база и
 * записи те же самые, мигрировать нечего.
 */
export {
    getKvStorage as getSwrStorage,
    getKvStorageKind as getSwrStorageKind,
    resetKvStorage as resetSwrStorage,
} from '../kv-storage';

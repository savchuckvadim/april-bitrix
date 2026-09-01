/**
 * KV-слой браузера: IndexedDB → localStorage → сквозной режим.
 * Общая дверь swr-cache и outbox к хранилищу; подробности — в kv-storage.ts.
 */
export { getKvStorage, getKvStorageKind, resetKvStorage } from './kv-storage';
export type { KvStorage, KvStorageKind } from './kv-storage';

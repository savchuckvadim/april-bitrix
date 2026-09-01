/**
 * Подделки хранилищ переехали к kv-storage вместе с самим слоем.
 * Алиас оставлен, чтобы тесты swr-cache не менялись ни строкой.
 */
export * from '../../kv-storage/__tests__/fake-storage';

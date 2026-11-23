import type { OfferPdfGenerateRequest } from '../model/types';

/**
 * Служебные метки времени, которые адаптер document-payload ставит заново при
 * каждой сборке запроса (договор и мера в строках). Печатаемого содержимого они
 * не меняют, поэтому в ключ превью не входят.
 */
const VOLATILE_KEYS: ReadonlySet<string> = new Set(['created_at', 'updated_at']);

/**
 * Ключ запроса PDF для превью: одинаковое содержимое — одинаковый ключ, даже
 * когда запрос собран заново. Превью пересобирается только при смене ключа,
 * то есть при смене участников, настроек, строк, шапки или стиля.
 */
export const offerPdfRequestKey = (request: OfferPdfGenerateRequest): string =>
    JSON.stringify(request, (key, value: unknown) => (VOLATILE_KEYS.has(key) ? undefined : value));

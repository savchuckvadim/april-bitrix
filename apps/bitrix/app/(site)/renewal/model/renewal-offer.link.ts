/**
 * Адреса предложения.
 *
 * Цены в адресе больше не живут: до 02.11.2026 состав и цены ехали
 * параметрами ссылки, и клиент мог подменить их в адресной строке. Теперь
 * адрес несёт только токен, а предложение приходит из БД по нему.
 */

/** Корень раздела предложений. */
export const RENEWAL_PATH = '/renewal';

/** Страница предложения по персональной ссылке. */
export function buildRenewalPath(token: string): string {
    return `${RENEWAL_PATH}/${encodeURIComponent(token)}`;
}

/** PDF того же предложения. */
export function buildRenewalPdfPath(token: string): string {
    return `${buildRenewalPath(token)}/pdf`;
}

/** Полная ссылка для отправки клиенту. */
export function buildRenewalUrl(token: string, origin: string): string {
    return `${origin.replace(/\/+$/, '')}${buildRenewalPath(token)}`;
}

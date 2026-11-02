/**
 * Имя файла PDF. Клиент сохраняет его себе, поэтому в названии должно
 * быть видно, чьё это предложение, без латиницы-транслита и мусора.
 */

/**
 * Небезопасные для файловой системы символы. Кириллицу оставляем:
 * Content-Disposition отдаём в filename* (RFC 5987), и браузеры её держат.
 */
// Управляющие символы вычищаются намеренно: они недопустимы и в имени
// файла, и в заголовке ответа.
// eslint-disable-next-line no-control-regex
const UNSAFE = /["*/:<>?\\|\u0000-\u001f]+/g;

/** Собирает имя файла предложения для клиента. */
export function buildRenewalPdfFileName(clientName: string): string {
    const safe = clientName
        .replace(UNSAFE, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        // Точка в конце имени файла — проблема на Windows.
        .replace(/\.+$/, '')
        .slice(0, 80)
        .trim();
    return safe
        ? `Коммерческое предложение — ${safe}.pdf`
        : 'Коммерческое предложение.pdf';
}

/**
 * Значение Content-Disposition. Даём и filename (ASCII-запас для старых
 * клиентов), и filename* с кириллицей — иначе имя приедет «_______.pdf».
 */
export function buildRenewalPdfDisposition(clientName: string): string {
    const name = buildRenewalPdfFileName(clientName);
    const encoded = encodeURIComponent(name);
    return `attachment; filename="offer.pdf"; filename*=UTF-8''${encoded}`;
}

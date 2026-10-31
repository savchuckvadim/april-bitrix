const RFC5987_NAME = /filename\*=UTF-8''([^;]+)/i;

/** Имя файла из Content-Disposition; нет заголовка или он битый — запасное имя. */
export const parseAttachmentName = (
    header: string | null,
    fallback: string,
): string => {
    const encoded = header?.match(RFC5987_NAME)?.[1];
    if (!encoded) return fallback;
    try {
        return decodeURIComponent(encoded);
    } catch {
        return fallback;
    }
};

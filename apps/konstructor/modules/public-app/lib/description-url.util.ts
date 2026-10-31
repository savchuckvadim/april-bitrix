let currentUrl: string | null = null;

/** Адрес для ссылки «скачать» в памяти вкладки: предыдущий файл освобождается. */
export const replaceDescriptionUrl = (blob: Blob): string => {
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = URL.createObjectURL(blob);
    return currentUrl;
};

import {
    PROVIDER_IMAGE_CHECK_TEXT,
    PROVIDER_IMAGE_EXTENSION_TYPES,
    PROVIDER_IMAGE_MAX_BYTES,
    PROVIDER_IMAGE_MIME_TYPES,
    type ProviderImage,
} from '../model';

const KB = 1024;
const MB = KB * KB;

/** «2,5 МБ», «640 КБ», «512 Б» — вес файла для карточки. */
export function formatFileSize(bytes: number): string {
    if (bytes >= MB) return `${(bytes / MB).toFixed(1).replace('.', ',')} МБ`;
    if (bytes >= KB) return `${Math.round(bytes / KB)} КБ`;
    return `${bytes} Б`;
}

/** «600 × 400 px» — размеры картинки. */
export function formatImageDimensions(width: number, height: number): string {
    return `${width} × ${height} px`;
}

/** «PNG · 600 × 400 px · 84 КБ» — сводка по загруженной картинке. */
export function describeProviderImage(
    image: Pick<ProviderImage, 'format' | 'width' | 'height' | 'size'>,
): string {
    return [
        image.format.toUpperCase(),
        formatImageDimensions(image.width, image.height),
        formatFileSize(image.size),
    ].join(' · ');
}

/** Тип файла: MIME от браузера, а если его нет, тип по расширению имени. */
function resolveFileType(file: Pick<File, 'type' | 'name'>): string {
    if (file.type) return file.type;
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    return PROVIDER_IMAGE_EXTENSION_TYPES[extension] ?? '';
}

/**
 * Проверка до отправки: тип PNG/JPG и вес до 2 МБ. Размеры в пикселях и
 * содержимое файла проверяет бэк.
 * null означает, что файл подходит.
 */
export function checkProviderImageFile(
    file: Pick<File, 'type' | 'name' | 'size'>,
): string | null {
    if (!PROVIDER_IMAGE_MIME_TYPES.includes(resolveFileType(file))) {
        return PROVIDER_IMAGE_CHECK_TEXT.wrongType;
    }
    if (file.size === 0) return PROVIDER_IMAGE_CHECK_TEXT.empty;
    if (file.size > PROVIDER_IMAGE_MAX_BYTES) {
        return PROVIDER_IMAGE_CHECK_TEXT.tooLarge(
            formatFileSize(file.size),
            formatFileSize(PROVIDER_IMAGE_MAX_BYTES),
        );
    }
    return null;
}

import {
    SITE_MEDIA_ACCEPT,
    SITE_MEDIA_MAX_BYTES,
    type SiteMediaKind,
} from '@workspace/site-media';

/** Что выбирают: кадр нужного вида или постер к видео (это картинка). */
export type SiteMediaPickTarget = SiteMediaKind | 'poster';

const MB = 1024 * 1024;

const kindOf = (target: SiteMediaPickTarget): SiteMediaKind =>
    target === 'video' ? 'video' : 'image';

/** Что выбирать в диалоге файла. */
export const acceptFor = (target: SiteMediaPickTarget): string =>
    SITE_MEDIA_ACCEPT[kindOf(target)];

const WRONG_TYPE: Record<SiteMediaKind, string> = {
    image: 'Подходят картинки PNG, JPG или WebP. Фото с iPhone (HEIC) пересохраните в JPG',
    video: 'Здесь нужно видео MP4 (H.264). MOV и другие форматы пересохраните в MP4',
};

const TOO_LARGE: Record<SiteMediaKind, string> = {
    image: `Картинка больше ${SITE_MEDIA_MAX_BYTES.image / MB} МБ — сохраните в WebP или JPG`,
    video: `Видео больше ${SITE_MEDIA_MAX_BYTES.video / MB} МБ — сожмите (например, HandBrake: 1080p, H.264)`,
};

/**
 * Проверка до отправки — чтобы не ждать загрузку 80 МБ ради отказа.
 * Окончательно формат проверяет сервер, по содержимому файла.
 * null — файл подходит.
 */
export function checkMediaFile(
    file: Pick<File, 'type' | 'size'>,
    target: SiteMediaPickTarget,
): string | null {
    const kind = kindOf(target);
    if (!SITE_MEDIA_ACCEPT[kind].split(',').includes(file.type)) {
        return WRONG_TYPE[kind];
    }
    if (file.size > SITE_MEDIA_MAX_BYTES[kind]) return TOO_LARGE[kind];
    return null;
}

/** «2,4 МБ», «640 КБ» — размер файла для карточки. */
export function formatFileSize(bytes: number): string {
    if (bytes >= MB) return `${(bytes / MB).toFixed(1).replace('.', ',')} МБ`;
    return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
}

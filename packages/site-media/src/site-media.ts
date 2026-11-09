/**
 * Контракт картинок и видео сайта с бэком (`@lib/site-content` в back):
 * список раздела, имена файлов, форматы и потолки. Значения повторяют бэк —
 * он проверяет то же самое и решает окончательно; здесь они нужны, чтобы
 * сайт не верил чужому ответу, а админка подсказывала до загрузки.
 */

export const SITE_MEDIA_KINDS = ['image', 'video'] as const;
export type SiteMediaKind = (typeof SITE_MEDIA_KINDS)[number];

/** Раздел /platform на сервере: storage/public/site-media/platform. */
export const PLATFORM_MEDIA_SECTION = 'platform';

/** Что стоит на месте кадра — ответ бэка (SiteMediaItemDto). */
export interface SiteMediaItem {
    /** Место кадра: id из реестра кадров. */
    slot: string;
    /** Что лежит на самом деле — по содержимому файла. */
    kind: SiteMediaKind;
    /** Имя файла: место, отпечаток содержимого, расширение. */
    file: string;
    size: number;
    /** ISO 8601. */
    updatedAt: string;
    /** Имя файла постера — только у видео. */
    poster?: string;
}

const KEY_SOURCE = '[a-z0-9]+(?:-[a-z0-9]+)*';

/** Раздел и место кадра: латиница в нижнем регистре, цифры, дефисы. */
export const SITE_MEDIA_KEY_PATTERN = new RegExp(`^${KEY_SOURCE}$`);

/** Имя файла медиа; всё прочее сайт не проксирует и не показывает. */
export const SITE_MEDIA_FILE_NAME_PATTERN = new RegExp(
    `^${KEY_SOURCE}(?:\\.poster)?\\.[0-9a-f]{12}\\.(?:png|jpg|webp|mp4)$`,
);

/**
 * Адрес файла на сайте. Сайт отдаёт его со своего домена, проксируя бэк, —
 * адрес сервера наружу не виден.
 */
export const siteMediaPath = (section: string, file: string): string =>
    `/media/${section}/${file}`;

const MB = 1024 * 1024;

/** Потолок файла по виду — как SITE_MEDIA_MAX_BYTES бэка. */
export const SITE_MEDIA_MAX_BYTES: Readonly<Record<SiteMediaKind, number>> = {
    image: 10 * MB,
    video: 80 * MB,
};

/** Что выбирать в диалоге файла: форматы, которые сайт показывает везде. */
export const SITE_MEDIA_ACCEPT: Readonly<Record<SiteMediaKind, string>> = {
    image: 'image/png,image/jpeg,image/webp',
    video: 'video/mp4',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isKind = (value: unknown): value is SiteMediaKind =>
    SITE_MEDIA_KINDS.some(kind => kind === value);

const isMediaFileName = (value: unknown): value is string =>
    typeof value === 'string' && SITE_MEDIA_FILE_NAME_PATTERN.test(value);

const toItem = (value: unknown): SiteMediaItem | null => {
    if (!isRecord(value)) return null;
    const { slot, kind, file, size, updatedAt, poster } = value;
    if (
        typeof slot !== 'string' ||
        !SITE_MEDIA_KEY_PATTERN.test(slot) ||
        !isKind(kind) ||
        !isMediaFileName(file) ||
        typeof size !== 'number' ||
        typeof updatedAt !== 'string' ||
        (poster !== undefined && !isMediaFileName(poster))
    ) {
        return null;
    }
    return {
        slot,
        kind,
        file,
        size,
        updatedAt,
        ...(poster !== undefined ? { poster } : {}),
    };
};

/**
 * Список раздела из ответа бэка (`{ items: [...] }`). Битые и чужие записи
 * отбрасываются: лучше страница без кадра, чем с адресом, который не откроется.
 */
export function parseSiteMediaItems(value: unknown): SiteMediaItem[] {
    if (!isRecord(value) || !Array.isArray(value.items)) return [];
    return value.items
        .map(toItem)
        .filter((item): item is SiteMediaItem => item !== null);
}

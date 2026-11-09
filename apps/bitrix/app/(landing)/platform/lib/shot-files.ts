import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PLATFORM_SHOTS, type PlatformShotId } from '../model/shots';

/**
 * Кадры раздела по соглашению об именах: файл с именем кадра в
 * `public/platform/shots` (видео — `public/platform/video`) — и кадр на
 * сайте, код править не нужно. `src` в реестре главнее, если задан руками.
 *
 * Только сервер: читает диск. Страницы раздела собираются статически, так
 * что проверка идёт при сборке; новый файл появляется на сайте со
 * следующей выкладкой фронта.
 *
 * Регистр расширения не важен («calls-form.PNG» тоже найдётся), а адрес
 * берётся с настоящим именем файла: на Linux-сервере регистр различается,
 * и «.png» вместо «.PNG» дал бы 404.
 */

export const SHOTS_PUBLIC_DIR = 'platform/shots';
export const VIDEOS_PUBLIC_DIR = 'platform/video';
export const SHOT_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'] as const;
const POSTER_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

export interface ShotMedia {
    src?: string;
    poster?: string;
}

/**
 * Где лежит public: корень приложения (прод-образ, next dev/start, сборка
 * turbo) или запуск из корня монорепы — как у шрифтов PDF предложения.
 */
export const defaultPublicDirs = (cwd: string = process.cwd()): string[] => [
    join(cwd, 'public'),
    join(cwd, 'apps', 'bitrix', 'public'),
];

/** Настоящее имя файла `<id>.<ext>` в папке, без учёта регистра; null — нет такого. */
const findFile = (
    publicDirs: readonly string[],
    folder: string,
    id: string,
    extensions: readonly string[],
): string | null => {
    const wanted = new Set(extensions.map(ext => `${id}.${ext}`.toLowerCase()));
    for (const dir of publicDirs) {
        const path = join(dir, folder);
        if (!existsSync(path)) continue;
        const found = readdirSync(path).find(name => wanted.has(name.toLowerCase()));
        if (found) return `/${folder}/${found}`;
    }
    return null;
};

export function resolveShotMedia(
    id: PlatformShotId,
    publicDirs: readonly string[] = defaultPublicDirs(),
): ShotMedia {
    const spec = PLATFORM_SHOTS[id];
    if (spec.src) return { src: spec.src, poster: spec.poster };

    if (spec.kind === 'video') {
        const video = findFile(publicDirs, VIDEOS_PUBLIC_DIR, id, ['mp4']);
        if (!video) return {};
        const poster = findFile(publicDirs, VIDEOS_PUBLIC_DIR, id, POSTER_EXTENSIONS);
        return { src: video, poster: poster ?? undefined };
    }

    const image = findFile(publicDirs, SHOTS_PUBLIC_DIR, id, SHOT_IMAGE_EXTENSIONS);
    return image ? { src: image } : {};
}

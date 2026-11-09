import type { PlatformShotId } from '../model/shots';
import type { ShotMediaMap } from './platform-media';

/**
 * Рамки-заглушки «что здесь снять» видны только при разработке.
 *
 * На проде кадр без файла не рисуется вовсе, а блок перестраивается без
 * него: раздел можно выкладывать до съёмки, и клиент не увидит пустых рамок.
 */
// eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV задаёт сам Next: в сборке всегда production
export const SHOW_SHOT_PLACEHOLDERS = process.env.NODE_ENV !== 'production';

/** У места есть загруженный файл. */
export const isShotReady = (id: PlatformShotId, media: ShotMediaMap): boolean =>
    media.has(id);

/** Будет ли на странице что-то на месте кадра: файл или заглушка. */
export const isShotVisible = (id: PlatformShotId, media: ShotMediaMap): boolean =>
    isShotReady(id, media) || SHOW_SHOT_PLACEHOLDERS;

/** Кадры из списка, которые реально появятся на странице. */
export const visibleShots = (
    ids: readonly PlatformShotId[],
    media: ShotMediaMap,
): PlatformShotId[] => ids.filter(id => isShotVisible(id, media));

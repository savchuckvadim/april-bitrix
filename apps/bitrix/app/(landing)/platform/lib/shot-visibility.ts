import type { PlatformShotId } from '../model/shots';
import { resolveShotMedia } from './shot-files';

/**
 * Рамки-заглушки «что здесь снять» видны только при разработке.
 *
 * На проде кадр без файла не рисуется вовсе, а блок перестраивается без
 * него: раздел можно выкладывать до съёмки, и клиент не увидит пустых рамок.
 */
// eslint-disable-next-line turbo/no-undeclared-env-vars -- NODE_ENV задаёт сам Next: в сборке всегда production
export const SHOW_SHOT_PLACEHOLDERS = process.env.NODE_ENV !== 'production';

export const isShotReady = (id: PlatformShotId): boolean =>
    Boolean(resolveShotMedia(id).src);

/** Будет ли на странице что-то на месте кадра: файл или заглушка. */
export const isShotVisible = (id: PlatformShotId): boolean =>
    isShotReady(id) || SHOW_SHOT_PLACEHOLDERS;

/** Кадры из списка, которые реально появятся на странице. */
export const visibleShots = (
    ids: readonly PlatformShotId[],
): PlatformShotId[] => ids.filter(isShotVisible);

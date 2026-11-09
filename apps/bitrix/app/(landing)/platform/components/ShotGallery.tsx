import type { PlatformShotId } from '../model/shots';
import type { ShotMediaMap } from '../lib/platform-media';
import { ShotFrame } from './ShotFrame';

export interface ShotGalleryProps {
    /** Только видимые кадры: отбор делает страница, чтобы не рисовать пустую секцию. */
    shotIds: readonly PlatformShotId[];
    media: ShotMediaMap;
}

/** Галерея кадров, не вставших в шаги. */
export function ShotGallery({ shotIds, media }: ShotGalleryProps) {
    return (
        <div className="grid gap-8 md:grid-cols-2">
            {shotIds.map(id => (
                <ShotFrame key={id} shotId={id} media={media.get(id)} />
            ))}
        </div>
    );
}

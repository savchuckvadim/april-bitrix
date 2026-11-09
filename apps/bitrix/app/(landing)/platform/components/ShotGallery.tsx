import type { PlatformShotId } from '../model/shots';
import { ShotFrame } from './ShotFrame';

export interface ShotGalleryProps {
    /** Только видимые кадры: отбор делает страница, чтобы не рисовать пустую секцию. */
    shotIds: readonly PlatformShotId[];
}

/** Галерея кадров, не вставших в шаги. */
export function ShotGallery({ shotIds }: ShotGalleryProps) {
    return (
        <div className="grid gap-8 md:grid-cols-2">
            {shotIds.map(id => (
                <ShotFrame key={id} shotId={id} />
            ))}
        </div>
    );
}

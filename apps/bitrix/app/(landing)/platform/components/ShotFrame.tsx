import Image from 'next/image';
import { cn } from '@workspace/ui/lib/utils';
import { PLATFORM_SHOTS, type PlatformShotId } from '../model/shots';
import { resolveShotMedia } from '../lib/shot-files';
import { SHOW_SHOT_PLACEHOLDERS } from '../lib/shot-visibility';
import { ShotPlaceholder } from './ShotPlaceholder';

export interface ShotFrameProps {
    shotId: PlatformShotId;
    /** Первый экран: картинку грузим сразу, а не по прокрутке. */
    priority?: boolean;
    className?: string;
}

/** Скрин или видео интерфейса с подписью; без файла — заглушка или ничего. */
export function ShotFrame({ shotId, priority = false, className }: ShotFrameProps) {
    const shot = PLATFORM_SHOTS[shotId];
    const { src, poster } = resolveShotMedia(shotId);

    if (!src) {
        return SHOW_SHOT_PLACEHOLDERS ? <ShotPlaceholder id={shotId} shot={shot} /> : null;
    }

    return (
        <figure className={cn('overflow-hidden rounded-2xl border border-border bg-card shadow-xl', className)}>
            {shot.kind === 'video' ? (
                <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={poster}
                    className="aspect-[16/10] w-full bg-muted object-cover"
                >
                    <source src={src} type="video/mp4" />
                </video>
            ) : (
                <div className="relative aspect-[16/10] w-full bg-muted">
                    <Image
                        src={src}
                        alt={shot.caption}
                        fill
                        priority={priority}
                        sizes="(min-width: 1440px) 1440px, 100vw"
                        className="object-cover object-left-top"
                    />
                </div>
            )}
            <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                {shot.caption}
            </figcaption>
        </figure>
    );
}

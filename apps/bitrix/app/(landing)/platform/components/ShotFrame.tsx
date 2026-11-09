import Image from 'next/image';
import { cn } from '@workspace/ui/lib/utils';
import { PLATFORM_SHOTS, type PlatformShotId } from '../model/shots';
import type { ShotMedia } from '../lib/platform-media';
import { SHOW_SHOT_PLACEHOLDERS } from '../lib/shot-visibility';
import { ShotPlaceholder } from './ShotPlaceholder';

export interface ShotFrameProps {
    shotId: PlatformShotId;
    /** Файл места из списка раздела; нет файла — нет кадра (при разработке — рамка «что снять»). */
    media: ShotMedia | undefined;
    /** Первый экран: картинку грузим сразу, а не по прокрутке. */
    priority?: boolean;
    className?: string;
}

/** Скрин или видео интерфейса с подписью; без файла — заглушка или ничего. */
export function ShotFrame({ shotId, media, priority = false, className }: ShotFrameProps) {
    const shot = PLATFORM_SHOTS[shotId];

    if (!media) {
        return SHOW_SHOT_PLACEHOLDERS ? <ShotPlaceholder id={shotId} shot={shot} /> : null;
    }

    return (
        <figure className={cn('overflow-hidden rounded-2xl border border-border bg-card shadow-xl', className)}>
            {media.kind === 'video' ? (
                <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={media.poster}
                    className="aspect-[16/10] w-full bg-muted object-cover"
                >
                    <source src={media.src} type="video/mp4" />
                </video>
            ) : (
                <div className="relative aspect-[16/10] w-full bg-muted">
                    <Image
                        src={media.src}
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

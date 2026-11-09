import { Camera, Clapperboard } from 'lucide-react';
import {
    PLATFORM_MEDIA_SECTION,
    siteMediaPath,
    type PlatformShotSpec,
    type SiteMediaItem,
} from '@workspace/site-media';
import { BITRIX_SITE_URL } from '@/modules/shared/lib/bitrix-site-url';
import { SITE_MEDIA_TEXT } from '../consts/site-media.consts';

/** Адрес файла на сайте — тот же, что увидит клиент. */
const siteFileUrl = (file: string): string =>
    `${BITRIX_SITE_URL}${siteMediaPath(PLATFORM_MEDIA_SECTION, file)}`;

interface SiteMediaPreviewProps {
    spec: PlatformShotSpec;
    item?: SiteMediaItem;
}

const FRAME = 'aspect-[16/10] w-full rounded-md border border-border bg-muted';

/** Превью кадра с сайта в пропорции страниц (16:10), без файла — рамка. */
export function SiteMediaPreview({ spec, item }: SiteMediaPreviewProps) {
    if (!item) {
        const Icon = spec.kind === 'video' ? Clapperboard : Camera;
        return (
            <div className={`${FRAME} flex flex-col items-center justify-center gap-2 border-dashed text-muted-foreground`}>
                <Icon className="size-7" aria-hidden />
                <span className="text-xs">{SITE_MEDIA_TEXT.noFile}</span>
            </div>
        );
    }

    if (item.kind === 'video') {
        return (
            <video
                controls
                preload="metadata"
                poster={item.poster ? siteFileUrl(item.poster) : undefined}
                className={`${FRAME} object-cover`}
            >
                <source src={siteFileUrl(item.file)} type="video/mp4" />
            </video>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element -- превью файла с сайта: оптимизатор и remotePatterns админке не нужны
        <img
            src={siteFileUrl(item.file)}
            alt={spec.caption}
            loading="lazy"
            className={`${FRAME} object-cover object-left-top`}
        />
    );
}

'use client';

import { ImageIcon } from 'lucide-react';
import { useProviderImagePreview } from '../../lib/hooks';
import { PROVIDER_IMAGE_SLOT_TEXT, type ProviderImage } from '../../model';

interface ProviderImagePreviewProps {
    /** Картинка слота; null, если в слот ничего не загружено */
    image: ProviderImage | null;
    /** Подпись роли: alt картинки */
    label: string;
}

const FRAME =
    'flex h-36 w-full items-center justify-center overflow-hidden rounded-md border border-border';

/** Шахматный фон из токенов темы: прозрачный PNG на нём виден. */
const CHECKERBOARD =
    'bg-card bg-[conic-gradient(var(--muted)_25%,transparent_0_50%,var(--muted)_0_75%,transparent_0)] bg-[length:16px_16px]';

/** Превью картинки слота на шахматном фоне; без картинки показывает пустую рамку. */
export function ProviderImagePreview({ image, label }: ProviderImagePreviewProps) {
    const preview = useProviderImagePreview(image);

    if (!image) {
        return (
            <div className={`${FRAME} flex-col gap-2 border-dashed bg-muted/30 text-muted-foreground`}>
                <ImageIcon className="size-7" aria-hidden />
                <span className="text-xs">{PROVIDER_IMAGE_SLOT_TEXT.empty}</span>
            </div>
        );
    }

    if (preview.isError) {
        return (
            <div className={`${FRAME} bg-muted/30 px-3 text-center text-xs text-muted-foreground`}>
                {PROVIDER_IMAGE_SLOT_TEXT.previewError}
            </div>
        );
    }

    if (preview.url === null) {
        return (
            <div className={`${FRAME} animate-pulse bg-muted text-xs text-muted-foreground`}>
                {PROVIDER_IMAGE_SLOT_TEXT.previewLoading}
            </div>
        );
    }

    return (
        <div className={`${FRAME} ${CHECKERBOARD}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob-превью файла за авторизацией: оптимизатор next/image не подходит */}
            <img src={preview.url} alt={label} className="max-h-full max-w-full object-contain" />
        </div>
    );
}

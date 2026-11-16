'use client';

import { FileWarning } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { OfferPdfTemplateCode } from '../../model/types';
import { useStyleThumb } from './hooks/use-style-thumb';
import { OfferPdfStyleThumbLoadable } from './OfferPdfStyleThumb.loadable';

export interface OfferPdfStyleThumbFrameProps {
    code: OfferPdfTemplateCode;
    palette: string | null;
    className?: string;
}

/** Первая страница стиля в рамке формата A4: пока собирается — заглушка */
export const OfferPdfStyleThumbFrame = ({ code, palette, className }: OfferPdfStyleThumbFrameProps) => {
    const thumb = useStyleThumb(code, palette);
    return (
        <div
            ref={thumb.ref}
            className={cn(
                'relative aspect-[1/1.414] w-full overflow-hidden rounded-sm border border-border/70 bg-muted/40',
                className,
            )}
        >
            {/* холст вне потока: иначе его ширина раздувает колонку сетки, а та — холст */}
            {thumb.preview.status === 'ready' && thumb.width > 0 ? (
                <div className="absolute inset-0">
                    <OfferPdfStyleThumbLoadable url={thumb.preview.url} width={thumb.width} />
                </div>
            ) : null}
            {thumb.preview.status === 'loading' ? (
                <div className="absolute inset-2 animate-pulse rounded bg-muted" aria-label="Превью собирается" />
            ) : null}
            {thumb.preview.status === 'error' ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <FileWarning className="size-5" aria-label="Превью не собралось" />
                </div>
            ) : null}
        </div>
    );
};

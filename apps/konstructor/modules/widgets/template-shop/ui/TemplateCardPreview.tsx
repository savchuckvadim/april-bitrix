'use client';

import { FileWarning } from 'lucide-react';
import { WordTemplatePreviewThumbLoadable } from '@/modules/entities/offer-template-word';
import { useCardPreview } from '../hooks/use-card-preview';

export interface TemplateCardPreviewProps {
    templateId: string;
    version: number;
}

/** Первая страница шаблона во всю ширину карточки, формат листа A4. */
export const TemplateCardPreview = ({ templateId, version }: TemplateCardPreviewProps) => {
    const preview = useCardPreview(templateId, version);

    return (
        <div ref={preview.ref} className="relative aspect-[1/1.414] w-full overflow-hidden bg-muted/40">
            {preview.state.status === 'ready' && preview.width > 0 ? (
                <WordTemplatePreviewThumbLoadable file={preview.state.file} width={preview.width} />
            ) : null}
            {preview.state.status === 'loading' ? (
                <div className="absolute inset-3 animate-pulse rounded bg-muted" aria-label="Превью собирается" />
            ) : null}
            {preview.state.status === 'error' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
                    <FileWarning className="size-6" aria-hidden />
                    Превью не собралось — проверьте теги шаблона
                </div>
            ) : null}
        </div>
    );
};

'use client';

import { FileWarning } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import type { OfferPdfTemplateInfo } from '../../model/types';
import { useStyleCard } from './hooks/use-style-card';
import { OfferPdfStyleThumbLoadable } from './OfferPdfStyleThumb.loadable';

export interface OfferPdfStyleCardProps {
    template: OfferPdfTemplateInfo;
    /** Гамма миниатюры; у стиля без гамм — null */
    palette: string | null;
    selected: boolean;
    onSelect: (code: string) => void;
}

/** Стиль в сетке выбора: первая страница формата A4 и название. */
export const OfferPdfStyleCard = ({ template, palette, selected, onSelect }: OfferPdfStyleCardProps) => {
    const card = useStyleCard(template.code, palette);

    return (
        <button
            type="button"
            onClick={() => onSelect(template.code)}
            aria-pressed={selected}
            title={template.description}
            className={cn(
                'group flex w-full min-w-0 flex-col gap-1.5 rounded-md p-1.5 text-left transition-colors',
                selected ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted/60',
            )}
        >
            <div
                ref={card.ref}
                className="relative aspect-[1/1.414] w-full overflow-hidden rounded-sm border border-border/70 bg-muted/40"
            >
                {/* холст вне потока: иначе его ширина раздувает колонку сетки, а та — холст */}
                {card.preview.status === 'ready' && card.width > 0 ? (
                    <div className="absolute inset-0">
                        <OfferPdfStyleThumbLoadable url={card.preview.url} width={card.width} />
                    </div>
                ) : null}
                {card.preview.status === 'loading' ? (
                    <div className="absolute inset-2 animate-pulse rounded bg-muted" aria-label="Превью собирается" />
                ) : null}
                {card.preview.status === 'error' ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <FileWarning className="size-5" aria-label="Превью не собралось" />
                    </div>
                ) : null}
            </div>
            <span className={cn('truncate text-xs', selected ? 'font-semibold' : 'text-muted-foreground')}>
                {template.name}
            </span>
        </button>
    );
};

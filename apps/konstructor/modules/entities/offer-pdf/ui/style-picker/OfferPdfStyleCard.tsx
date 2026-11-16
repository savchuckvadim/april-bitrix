'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { OfferPdfTemplateInfo } from '../../model/types';
import { OfferPdfStyleThumbFrame } from './OfferPdfStyleThumbFrame';

export interface OfferPdfStyleCardProps {
    template: OfferPdfTemplateInfo;
    /** Гамма миниатюры; у стиля без гамм — null */
    palette: string | null;
    selected: boolean;
    onSelect: (code: string) => void;
}

/** Стиль в сетке выбора: первая страница формата A4 и название. */
export const OfferPdfStyleCard = ({ template, palette, selected, onSelect }: OfferPdfStyleCardProps) => (
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
        <OfferPdfStyleThumbFrame code={template.code} palette={palette} />
        <span className={cn('truncate text-sm', selected ? 'font-semibold' : 'text-muted-foreground')}>
            {template.name}
        </span>
    </button>
);

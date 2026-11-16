'use client';

import { Loader2 } from 'lucide-react';
import { useStylePicker } from './hooks/use-style-picker';
import { OfferPdfPaletteSwatches } from './OfferPdfPaletteSwatches';
import { OfferPdfStyleCard } from './OfferPdfStyleCard';

/** Выбор стиля миниатюрами первых страниц и гамма выбранного стиля. */
export const OfferPdfStylePicker = () => {
    const picker = useStylePicker();

    if (picker.loading) {
        return (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Загружаем стили…
            </p>
        );
    }
    if (picker.error) return <p className="text-sm text-destructive">{picker.error}</p>;

    return (
        <div className="flex flex-col gap-3">
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5" aria-label="Стиль КП">
                {picker.cards.map(card => (
                    <li key={card.template.code}>
                        <OfferPdfStyleCard
                            template={card.template}
                            palette={card.palette}
                            selected={card.selected}
                            onSelect={picker.select}
                        />
                    </li>
                ))}
            </ul>
            {picker.palettes.length ? (
                <OfferPdfPaletteSwatches palettes={picker.palettes} value={picker.palette} onChange={picker.setPalette} />
            ) : null}
            {picker.description ? <p className="text-xs text-muted-foreground">{picker.description}</p> : null}
        </div>
    );
};

'use client';

import { cn } from '@workspace/ui/lib/utils';
import type { OfferPdfPaletteInfo } from '../../model/types';

export interface OfferPdfPaletteSwatchesProps {
    palettes: OfferPdfPaletteInfo[];
    value: string | null;
    onChange: (palette: string) => void;
}

/** Гаммы выбранного стиля кружками; название — в подписи выбранной */
export const OfferPdfPaletteSwatches = ({ palettes, value, onChange }: OfferPdfPaletteSwatchesProps) => {
    const current = palettes.find(item => item.code === value);
    return (
        <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Гамма стиля">
            {palettes.map(palette => (
                <button
                    key={palette.code}
                    type="button"
                    role="radio"
                    aria-checked={palette.code === value}
                    aria-label={palette.name}
                    title={palette.name}
                    onClick={() => onChange(palette.code)}
                    className={cn(
                        'size-6 rounded-full border border-border shadow-sm transition-transform hover:scale-110',
                        palette.code === value && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                    )}
                    style={{ backgroundColor: palette.swatch }}
                />
            ))}
            {current ? <span className="text-xs text-muted-foreground">{current.name}</span> : null}
        </div>
    );
};

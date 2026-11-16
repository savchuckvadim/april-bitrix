'use client';

import {
    OfferPdfPaletteSwatches,
    OfferPdfStyleCard,
    type OfferPdfPaletteInfo,
    type OfferPdfTemplateInfo,
} from '@/modules/entities/offer-pdf';

export interface PdfStyleShopCardProps {
    template: OfferPdfTemplateInfo;
    selected: boolean;
    palette: string | null;
    palettes: OfferPdfPaletteInfo[];
    onPick: (code: string) => void;
    onPickPalette: (code: string, palette: string) => void;
}

/** Стиль на витрине: первая страница, описание и гаммы */
export const PdfStyleShopCard = ({
    template,
    selected,
    palette,
    palettes,
    onPick,
    onPickPalette,
}: PdfStyleShopCardProps) => (
    <div className="flex min-w-0 flex-col gap-2">
        <OfferPdfStyleCard template={template} palette={palette} selected={selected} onSelect={onPick} />
        <p className="px-1.5 text-xs text-muted-foreground">{template.description}</p>
        {palettes.length ? (
            <div className="px-1.5">
                <OfferPdfPaletteSwatches
                    palettes={palettes}
                    value={selected ? palette : null}
                    onChange={next => onPickPalette(template.code, next)}
                />
            </div>
        ) : null}
    </div>
);

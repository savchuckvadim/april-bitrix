'use client';

import { LayoutGrid, Loader2 } from 'lucide-react';
import { ChoiceChips } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { useCurrentStyle } from './hooks/use-current-style';
import { OfferPdfPaletteSwatches } from './OfferPdfPaletteSwatches';
import { OfferPdfStyleThumbFrame } from './OfferPdfStyleThumbFrame';

/**
 * Выбранный стиль: миниатюра, гаммы и чипы соседних стилей. Все стили
 * крупно — на витрине (кнопка и клик по миниатюре).
 */
export const OfferPdfCurrentStyle = () => {
    const current = useCurrentStyle();

    if (current.loading) {
        return (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Загружаем стили…
            </p>
        );
    }
    if (current.error) return <p className="text-sm text-destructive">{current.error}</p>;
    if (!current.template) return null;

    return (
        <div className="flex gap-4">
            <button
                type="button"
                onClick={current.openShop}
                title="Все стили"
                aria-label="Открыть все стили"
                className="w-24 shrink-0 rounded-sm transition-opacity hover:opacity-80"
            >
                <OfferPdfStyleThumbFrame code={current.template.code} palette={current.palette} />
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-semibold">{current.template.name}</p>
                        <p className="text-xs text-muted-foreground">{current.template.description}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={current.openShop}>
                        <LayoutGrid aria-hidden />
                        Все стили
                    </Button>
                </div>
                {current.palettes.length ? (
                    <OfferPdfPaletteSwatches
                        palettes={current.palettes}
                        value={current.palette}
                        onChange={current.setPalette}
                    />
                ) : null}
                <ChoiceChips
                    options={current.options}
                    value={current.templateCode}
                    onChange={current.select}
                    ariaLabel="Стиль КП"
                />
            </div>
        </div>
    );
};
